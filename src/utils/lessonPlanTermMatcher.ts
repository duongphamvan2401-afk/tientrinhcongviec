import { PpctDataset, LessonPlan } from '../types';
import { generateCV5512LessonPlan } from '../data/standardLessonPlanTemplates';

export interface RecognizedLessonPlanItem {
  id: string;
  lessonKey: string;
  lessonTitle: string;
  chapterName: string;
  weekNumber: number;
  periodRangeText: string;
  periods: number;
  assignedLink: string;
  matchConfidence: 'exact_custom_link' | 'chapter_match' | 'master_term_link';
  matchReason: string;
  term: 1 | 2;
  volume: 1 | 2;
  isSelected: boolean;
}

/**
 * Chuẩn hóa chuỗi tiếng Việt không dấu để so khớp linh hoạt
 */
function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trích xuất các liên kết và tiêu đề từ văn bản giáo viên dán vào (nếu có)
 */
interface ParsedLinkEntry {
  rawLine: string;
  url: string;
  textSnippet: string;
  normalizedText: string;
}

function parseCustomRawText(rawText: string): ParsedLinkEntry[] {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split('\n');
  const entries: ParsedLinkEntry[] = [];

  const urlRegex = /(https?:\/\/[^\s]+)/gi;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const urlMatches = trimmed.match(urlRegex);
    if (urlMatches && urlMatches.length > 0) {
      const url = urlMatches[0].replace(/[)\]>,;.]+$/, '');
      const textSnippet = trimmed.replace(url, '').replace(/^[-*•\d.)\s]+/, '').trim();
      entries.push({
        rawLine: trimmed,
        url,
        textSnippet: textSnippet || trimmed,
        normalizedText: normalizeVietnamese(textSnippet || trimmed),
      });
    } else {
      // Dòng chứa tên file hoặc tên bài không có url
      entries.push({
        rawLine: trimmed,
        url: '',
        textSnippet: trimmed,
        normalizedText: normalizeVietnamese(trimmed),
      });
    }
  }

  return entries;
}

/**
 * Tự nhận dạng và gom nhóm các bài học trong Phân phối chương trình (PPCT) của Tập 1 (Học kì 1)
 */
export function recognizeTermLessons(
  dataset: PpctDataset,
  term: 1 | 2 = 1,
  masterLink: string = '',
  customRawText: string = ''
): RecognizedLessonPlanItem[] {
  if (!dataset || !dataset.lessons || dataset.lessons.length === 0) {
    return [];
  }

  // Lọc các bài học thuộc Tập tương ứng (Tập 1: hocKy === 1 hoặc tuần <= 18)
  const termLessons = dataset.lessons.filter((l) => {
    if (term === 1) {
      return l.hocKy === 1 || (!l.hocKy && l.tuan <= 18);
    } else {
      return l.hocKy === 2 || (!l.hocKy && l.tuan > 18);
    }
  });

  // Gom các tiết học cùng tên bài học trong cùng chương/tuần thành một bài học hoàn chỉnh
  interface GroupedLesson {
    key: string;
    lessonTitle: string;
    chapterName: string;
    weekNumber: number;
    startPeriod: number;
    endPeriod: number;
    totalPeriods: number;
  }

  const groupedMap = new Map<string, GroupedLesson>();

  termLessons.forEach((l) => {
    // Làm sạch tên bài học: bỏ bớt hậu tố (tiết 1, 2) và kiểm tra thường xuyên khi gom nhóm để nhận dạng đúng tên bài chuẩn
    let cleanLessonName = (l.baiHoc || '').trim();
    
    // Tạo key nhận diện độc nhất theo chương và tên bài chính
    const coreTitle = cleanLessonName
      .replace(/\(tiết\s*[\d,\s-]+\)/gi, '')
      .replace(/&\s*Kiểm tra thường xuyên.*$/gi, '')
      .trim();

    // Kiểm tra xem có tiền tố dạng "Bài \d+" không để ghép các tiết cùng 1 bài trong cùng chương
    const baiMatch = coreTitle.match(/^(Bài\s+\d+)/i);
    const chapterName = l.chuong || (term === 1 ? 'Chương trình Tập 1' : 'Chương trình Tập 2');

    const lessonPeriods = l.soTiet || 2;
    const currentTiet = l.tietPPCT || 1;

    // Tìm bài đã tồn tại cùng chương (nếu có tiền tố Bài X thì gom vào cùng Bài X)
    let existing: GroupedLesson | undefined;
    if (baiMatch) {
      const baiPrefix = baiMatch[1].toLowerCase();
      existing = Array.from(groupedMap.values()).find(
        (g) =>
          g.chapterName === chapterName &&
          g.lessonTitle.toLowerCase().startsWith(baiPrefix)
      );
    }

    if (!existing) {
      const groupKey = `${chapterName}__${coreTitle}`;
      existing = groupedMap.get(groupKey);
    }

    if (!existing) {
      const groupKey = `${chapterName}__${coreTitle}`;
      groupedMap.set(groupKey, {
        key: groupKey,
        lessonTitle: coreTitle || cleanLessonName,
        chapterName,
        weekNumber: l.tuan || 1,
        startPeriod: currentTiet - lessonPeriods + 1 > 0 ? currentTiet - lessonPeriods + 1 : currentTiet,
        endPeriod: currentTiet,
        totalPeriods: lessonPeriods,
      });
    } else {
      existing.totalPeriods += lessonPeriods;
      // Giữ tiêu đề đầy đủ, giàu thông tin hơn
      if (coreTitle.length > existing.lessonTitle.length && !existing.lessonTitle.includes(':')) {
        existing.lessonTitle = coreTitle;
      }
      if (currentTiet > existing.endPeriod) existing.endPeriod = currentTiet;
      if (l.tuan && l.tuan < existing.weekNumber) existing.weekNumber = l.tuan;
    }
  });

  const parsedCustomEntries = parseCustomRawText(customRawText);

  const results: RecognizedLessonPlanItem[] = [];

  Array.from(groupedMap.values()).forEach((grp, idx) => {
    const normTitle = normalizeVietnamese(grp.lessonTitle);
    const normChapter = normalizeVietnamese(grp.chapterName);

    let assignedLink = masterLink.trim();
    let matchConfidence: RecognizedLessonPlanItem['matchConfidence'] = 'master_term_link';
    let matchReason = `Tự động liên kết thư mục Tập ${term}`;

    // Tìm kiếm trong customRawText nếu giáo viên có dán liên kết cụ thể
    if (parsedCustomEntries.length > 0) {
      let bestScore = 0;
      let bestEntry: ParsedLinkEntry | null = null;

      for (const entry of parsedCustomEntries) {
        let score = 0;
        const entryNorm = entry.normalizedText;

        // Trích xuất số bài: ví dụ "bai 1", "bai 2", "bai 11"
        const lessonNumMatchTitle = normTitle.match(/bai\s+(\d+)/i);
        const lessonNumMatchEntry = entryNorm.match(/bai\s+(\d+)/i);
        if (
          lessonNumMatchTitle &&
          lessonNumMatchEntry &&
          lessonNumMatchTitle[1] === lessonNumMatchEntry[1]
        ) {
          score += 40;
        }

        // Trích xuất số chương: ví dụ "chuong 1", "chuong i", "chuong 2", "chuong iv"
        const chapMatchTitle = normChapter.match(/chuong\s+([ivx\d]+)/i);
        const chapMatchEntry = entryNorm.match(/chuong\s+([ivx\d]+)/i);
        if (chapMatchTitle && chapMatchEntry && chapMatchTitle[1] === chapMatchEntry[1]) {
          score += 30;
        }

        // So khớp từ khóa quan trọng
        const keywords = normTitle.split(' ').filter((w) => w.length >= 3);
        let matchedKeywords = 0;
        keywords.forEach((kw) => {
          if (entryNorm.includes(kw)) {
            matchedKeywords++;
          }
        });

        if (keywords.length > 0) {
          score += (matchedKeywords / keywords.length) * 40;
        }

        if (score > bestScore && score >= 35) {
          bestScore = score;
          bestEntry = entry;
        }
      }

      if (bestEntry && bestEntry.url) {
        assignedLink = bestEntry.url;
        matchConfidence = 'exact_custom_link';
        matchReason = `Khớp chi tiết từ danh sách dán vào (${Math.min(99, Math.round(bestScore))}%)`;
      } else if (bestEntry && !bestEntry.url && masterLink) {
        matchConfidence = 'chapter_match';
        matchReason = `Nhận diện tên file khớp bài: ${bestEntry.textSnippet.slice(0, 30)}...`;
      }
    }

    const startP = grp.startPeriod;
    const endP = grp.endPeriod;
    const periodRangeText =
      startP === endP
        ? `Tiết ${startP} (Tuần ${grp.weekNumber})`
        : `Tiết ${startP} - ${endP} (Tuần ${grp.weekNumber})`;

    results.push({
      id: `term-${term}-rec-${idx + 1}-${Date.now().toString(36)}`,
      lessonKey: `term${term}_${normTitle.replace(/\s+/g, '_')}`,
      lessonTitle: grp.lessonTitle,
      chapterName: grp.chapterName,
      weekNumber: grp.weekNumber,
      periodRangeText,
      periods: grp.totalPeriods,
      assignedLink,
      matchConfidence,
      matchReason,
      term,
      volume: term,
      isSelected: true,
    });
  });

  return results;
}

/**
 * Chuyển đổi danh sách bài học đã nhận dạng thành các đối tượng LessonPlan chuẩn Công văn 5512
 */
export function convertRecognizedToLessonPlans(
  items: RecognizedLessonPlanItem[],
  grade: string = '9',
  schoolName: string = 'TRƯỜNG THCS LÊ QUÝ ĐÔN',
  teacherName: string = 'Nguyễn Văn Trọng',
  academicYear: string = '2026 - 2027',
  masterFolderLink?: string
): LessonPlan[] {
  return items
    .filter((item) => item.isSelected)
    .map((item) => {
      const basePlan = generateCV5512LessonPlan({
        lessonTitle: item.lessonTitle,
        chapterName: item.chapterName,
        grade,
        periods: item.periods,
        periodRangeText: item.periodRangeText,
        weekNumber: item.weekNumber,
        schoolName,
        teacherName,
        academicYear,
        term: item.term,
        volume: item.volume,
        masterTermLink: masterFolderLink || item.assignedLink,
        externalLink: item.assignedLink || masterFolderLink,
        sourceType: item.assignedLink ? 'external_link' : 'standard_cv5512',
      });

      return basePlan;
    });
}
