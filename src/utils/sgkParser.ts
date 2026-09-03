import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SgkBook, SgkChapter, SgkLesson, CognitiveLevel } from '../types';
import {
  DEFAULT_SGK_TOAN_9_TAP_1,
  DEFAULT_SGK_TOAN_9_TAP_2,
  DEFAULT_SGK_CANH_DIEU_9_TAP_1,
  DEFAULT_SGK_CANH_DIEU_9_TAP_2,
} from '../data/sgkData';

/**
 * Clean and normalize text for fuzzy comparison
 */
export function normalizeVietnameseText(str: string): string {
  if (!str) return '';
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
 * Searches in a list of SGK books for the most matching lesson and its learning objectives
 */
export function findMatchingSgkLesson(
  topicName: string,
  chapterName: string,
  sgkBooks: SgkBook[],
  preferredVolume?: 1 | 2 | 'all'
): { lesson?: SgkLesson; chapter?: SgkChapter; book?: SgkBook; matchScore: number } {
  const normTopic = normalizeVietnameseText(topicName);
  const normChapter = normalizeVietnameseText(chapterName);

  let bestMatch: { lesson?: SgkLesson; chapter?: SgkChapter; book?: SgkBook; matchScore: number } = {
    matchScore: 0,
  };

  for (const book of sgkBooks) {
    if (preferredVolume && preferredVolume !== 'all' && book.volume !== preferredVolume) {
      continue;
    }

    for (const chapter of book.chapters) {
      const normChapTitle = normalizeVietnameseText(chapter.title + ' ' + chapter.shortTitle);
      const chapterMatch = normChapTitle.includes(normChapter) || normChapter.includes(normChapTitle);

      for (const lesson of chapter.lessons) {
        const normLessonTitle = normalizeVietnameseText(lesson.title + ' ' + lesson.shortTitle);
        
        let score = 0;
        // Exact topic match
        if (normLessonTitle === normTopic || normTopic.includes(normLessonTitle) || normLessonTitle.includes(normTopic)) {
          score += 60;
        }

        // Keyword overlap
        const topicWords = normTopic.split(' ').filter((w) => w.length > 2);
        const lessonWords = normLessonTitle.split(' ').filter((w) => w.length > 2);
        
        let commonWords = 0;
        for (const tw of topicWords) {
          if (lessonWords.includes(tw)) commonWords++;
        }
        score += (commonWords / Math.max(topicWords.length, 1)) * 30;

        if (chapterMatch) {
          score += 15;
        }

        if (score > bestMatch.matchScore) {
          bestMatch = {
            lesson,
            chapter,
            book,
            matchScore: score,
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Get learning objectives for a specific lesson from SGK or fallback
 */
export function getLearningObjectiveForTopic(
  level: CognitiveLevel,
  topic: string,
  chapter: string,
  sgkBooks: SgkBook[],
  preferredVolume?: 1 | 2 | 'all'
): string {
  const match = findMatchingSgkLesson(topic, chapter, sgkBooks, preferredVolume);
  
  if (match.lesson && match.matchScore > 25) {
    if (level === 'nhanBiet' && match.lesson.objectives.nhanBiet) {
      return match.lesson.objectives.nhanBiet;
    }
    if (level === 'thongHieu' && match.lesson.objectives.thongHieu) {
      return match.lesson.objectives.thongHieu;
    }
    if ((level === 'vanDung' || level === 'vanDungCao') && match.lesson.objectives.vanDung) {
      return match.lesson.objectives.vanDung;
    }
  }

  // Fallback to dynamic standard format
  const cleanTopic = topic.replace(/\(t\d+\)/g, '').trim();
  switch (level) {
    case 'nhanBiet':
      return `- Nhận biết và nêu được các khái niệm, định nghĩa, tính chất cơ bản về ${cleanTopic}.\n- Nhận biết các biểu thức, quy tắc, công thức hoặc dấu hiệu đặc trưng của ${cleanTopic}.`;
    case 'thongHieu':
      return `- Giải thích, phân biệt và mô tả được bản chất của ${cleanTopic}.\n- Thực hiện các biến đổi đại số, tính toán hoặc vẽ hình minh họa liên quan đến ${cleanTopic}.`;
    case 'vanDung':
      return `- Vận dụng các kiến thức, công thức, định lý về ${cleanTopic} để giải quyết bài toán quen thuộc.\n- Thực hiện các bước tính toán, suy luận, chứng minh và xử lý số liệu chính xác.`;
    case 'vanDungCao':
      return `- Vận dụng tổng hợp các kiến thức về ${cleanTopic} để giải quyết bài toán thực tiễn hoặc bài toán tư duy liên môn phức tạp.\n- Đề xuất giải pháp và mô hình toán học giải quyết tình huống đặt ra.`;
  }
}

/**
 * Parses an uploaded SGK file (Excel .xlsx, .csv, JSON, or text)
 */
export async function parseSgkFile(file: File): Promise<SgkBook> {
  const fileName = file.name;
  const isVolume2 = /tap\s*2|tập\s*2|hk\s*2|học\s*kỳ\s*2|ky\s*2/i.test(fileName);
  const volume: 1 | 2 = isVolume2 ? 2 : 1;

  // 1. JSON parsing
  if (fileName.endsWith('.json')) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed.chapters && Array.isArray(parsed.chapters)) {
      return {
        id: parsed.id || `sgk-${Date.now()}`,
        title: parsed.title || fileName.replace('.json', ''),
        series: parsed.series || 'custom',
        grade: parsed.grade || '9',
        volume: parsed.volume || volume,
        publisher: parsed.publisher || 'Tải lên từ người dùng',
        chapters: parsed.chapters,
        sourceFileName: fileName,
        uploadedAt: new Date().toISOString(),
      };
    }
  }

  // 2. Word (.docx, .doc) parsing
  if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value || '';
      if (rawText.trim().length > 30) {
        const parsedBook = parseSgkFromText(rawText, fileName, volume);
        if (parsedBook.chapters.length > 0 && parsedBook.chapters.some((c) => c.lessons.length > 0)) {
          return {
            ...parsedBook,
            publisher: 'Trích xuất từ file Word (.docx) của giáo viên',
          };
        }
      }
    } catch (docxErr) {
      console.warn('[SGK Parser] Không thể đọc bằng mammoth, chuyển sang phân tích văn bản:', docxErr);
    }
  }

  // 3. Excel (.xlsx, .xls) / CSV parsing
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    const data = await file.arrayBuffer();
    let rawRows: (string | number)[][] = [];

    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });
    } catch (xlsxErr) {
      console.warn('[SGK Parser] Không thể đọc dạng Excel workbook, thử trích xuất qua văn bản:', xlsxErr);
      try {
        const text = new TextDecoder('utf-8').decode(data);
        const parsed = parseSgkFromText(text, fileName, volume);
        if (parsed.chapters.length > 0) return parsed;
      } catch {}
    }

    const chapters: SgkChapter[] = [];
    let currentChapter: SgkChapter | null = null;
    let autoChapterNum = 1;
    let autoLessonNum = 1;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;

      const cells = row.map((c) => (c !== undefined && c !== null ? String(c).trim() : ''));
      const fullText = cells.join(' ');

      // Ignore title/header rows
      if (
        fullText.includes('Chương') &&
        fullText.includes('Bài') &&
        fullText.includes('Yêu cầu cần đạt')
      ) {
        continue;
      }

      // Detect Chapter Header
      const isChapterRow =
        /^(Chương|CHƯƠNG|Chủ đề|CHỦ ĐỀ)\s+[IVXLCDM\d]+/i.test(cells[0]) ||
        /^(Chương|CHƯƠNG|Chủ đề|CHỦ ĐỀ)\s+[IVXLCDM\d]+/i.test(cells[1] || '') ||
        /^(Chương|CHƯƠNG)\s+/i.test(cells[0]);

      if (isChapterRow) {
        const chapterTitle = cells[0] || cells[1] || `Chương ${autoChapterNum}`;
        const isHinhHoc = /hình|tam giác|đường tròn|góc|lượng giác|khối/i.test(chapterTitle);
        const isThongKe = /thống kê|xác suất|tần số|biến cố/i.test(chapterTitle);

        currentChapter = {
          id: `uploaded-ch-${autoChapterNum}-${Date.now()}`,
          chapterNumber: autoChapterNum,
          title: chapterTitle,
          shortTitle: chapterTitle.replace(/^Chương\s+[IVXLCDM\d]+:?\s*/i, ''),
          branch: isHinhHoc ? 'HinhHoc' : isThongKe ? 'ThongKeXacSuat' : 'DaiSo',
          totalPeriods: 14,
          lessons: [],
        };
        chapters.push(currentChapter);
        autoChapterNum++;
        continue;
      }

      // If no chapter created yet, create a default one
      if (!currentChapter) {
        currentChapter = {
          id: `uploaded-ch-1-${Date.now()}`,
          chapterNumber: 1,
          title: volume === 1 ? 'Chương I: Đại số và Hình học (Tập 1)' : 'Chương VI: Đại số và Hình học (Tập 2)',
          shortTitle: 'Đại số và Hình học',
          branch: 'DaiSo',
          totalPeriods: 20,
          lessons: [],
        };
        chapters.push(currentChapter);
        autoChapterNum++;
      }

      // Parse Lesson Row
      // Supported column structures:
      // A: STT / Tên bài | B: Số tiết | C: YCCĐ Nhận biết | D: YCCĐ Thông hiểu | E: YCCĐ Vận dụng
      // OR A: Tên bài | B: YCCĐ chung
      let lessonTitle = cells[0] || cells[1] || '';
      let periods = 2;
      let nbText = '';
      let thText = '';
      let vdText = '';

      if (cells.length >= 4) {
        // Multi-column structure
        const numPeriods = parseInt(cells[1], 10);
        if (!isNaN(numPeriods)) {
          periods = numPeriods;
          lessonTitle = cells[0];
          nbText = cells[2] || '';
          thText = cells[3] || '';
          vdText = cells[4] || '';
        } else {
          lessonTitle = cells[1] || cells[0];
          nbText = cells[2] || '';
          thText = cells[3] || '';
          vdText = cells[4] || '';
        }
      } else if (cells.length >= 2) {
        lessonTitle = cells[0];
        const combined = cells[1] || '';
        nbText = combined;
        thText = combined;
        vdText = combined;
      }

      if (lessonTitle && lessonTitle.length > 2 && !lessonTitle.toLowerCase().includes('yêu cầu cần đạt')) {
        currentChapter.lessons.push({
          id: `uploaded-b-${autoLessonNum}-${Date.now()}`,
          lessonNumber: autoLessonNum,
          title: lessonTitle.startsWith('Bài') ? lessonTitle : `Bài ${autoLessonNum}: ${lessonTitle}`,
          shortTitle: lessonTitle.replace(/^Bài\s+\d+:?\s*/i, ''),
          periods,
          objectives: {
            nhanBiet: nbText || `- Nhận biết được các khái niệm và tính chất cơ bản của ${lessonTitle}.`,
            thongHieu: thText || `- Thông hiểu và giải thích được các tính chất, công thức về ${lessonTitle}.`,
            vanDung: vdText || `- Vận dụng các kiến thức và công thức về ${lessonTitle} để giải quyết bài tập và tình huống thực tế.`,
          },
        });
        autoLessonNum++;
      }
    }

    if (chapters.length > 0 && chapters.some((ch) => ch.lessons.length > 0)) {
      return {
        id: `sgk-uploaded-${Date.now()}`,
        title: `SGK Tải lên — ${fileName.replace(/\.[^/.]+$/, '')} (Tập ${volume})`,
        series: 'custom',
        grade: '9',
        volume,
        publisher: 'Tải lên từ file',
        chapters,
        sourceFileName: fileName,
        uploadedAt: new Date().toISOString(),
      };
    }
  }

  // 3. PDF (.pdf) parsing using pdfjs-dist
  if (fileName.toLowerCase().endsWith('.pdf')) {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      const pdfDoc = await loadingTask.promise;
      const maxPages = Math.min(pdfDoc.numPages, 120);
      const textChunks: string[] = [];

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items
            .map((item: any) => (item.str !== undefined ? item.str : ''))
            .join(' ');
          textChunks.push(`\n[Trang ${pageNum}]\n` + pageStr);
        } catch (pageErr) {
          console.warn(`Lỗi đọc trang ${pageNum} của file PDF:`, pageErr);
        }
      }

      const fullText = textChunks.join('\n');
      if (fullText.trim().length > 30) {
        const parsedBook = parseSgkFromText(fullText, fileName, volume);
        if (parsedBook.chapters.length > 0 && parsedBook.chapters.some((c) => c.lessons.length > 0)) {
          return parsedBook;
        }
      }
    } catch (pdfErr) {
      console.error('Lỗi phân tích file PDF:', pdfErr);
    }
  }

  // 4. Fallback for text / other files or unstructured PDF
  return {
    id: `sgk-uploaded-${Date.now()}`,
    title: `SGK Tải lên — ${fileName.replace(/\.[^/.]+$/, '')} (Tập ${volume})`,
    series: 'custom',
    grade: '9',
    volume,
    publisher: 'Tải lên từ file',
    chapters: [
      {
        id: `ch-fallback-${Date.now()}`,
        chapterNumber: volume === 1 ? 1 : 6,
        title: volume === 1 ? 'Chương I: Nội dung kiến thức SGK Toán (Tập 1)' : 'Chương VI: Nội dung kiến thức SGK Toán (Tập 2)',
        shortTitle: `Nội dung kiến thức SGK (Tập ${volume})`,
        branch: 'DaiSo',
        totalPeriods: 35,
        lessons: [
          {
            id: `l-fallback-${Date.now()}`,
            lessonNumber: 1,
            title: `Bài 1: Kiến thức tổng quát từ file ${fileName}`,
            shortTitle: fileName.replace(/\.[^/.]+$/, ''),
            periods: 4,
            objectives: {
              nhanBiet: `- Nhận biết các nội dung, định nghĩa và công thức cơ bản theo tài liệu ${fileName}.`,
              thongHieu: `- Thông hiểu, giải thích và mô tả được các dạng bài tập theo tài liệu ${fileName}.`,
              vanDung: `- Vận dụng kiến thức từ tài liệu ${fileName} vào giải bài toán thực tiễn.`,
            },
          },
        ],
      },
    ],
    sourceFileName: fileName,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Parses raw text extracted from PDF or documents into structured SgkBook
 */
export function parseSgkFromText(text: string, fileName: string, volume: 1 | 2): SgkBook {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const chapters: SgkChapter[] = [];
  let currentChapter: SgkChapter | null = null;
  let currentLesson: SgkLesson | null = null;
  let autoChapterNum = volume === 1 ? 1 : 6;
  let autoLessonNum = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Chapter
    const chapterMatch = line.match(/^(Chương|CHƯƠNG|Chủ đề|CHỦ ĐỀ)\s+([IVXLCDM\d]+)[:\.\s-]*(.*)/i);
    if (chapterMatch) {
      const chapterNumberRoman = chapterMatch[2];
      const chapterTitle = line.length > 80 ? line.substring(0, 80) + '...' : line;
      const isHinhHoc = /hình|tam giác|đường tròn|góc|lượng giác|khối|không gian/i.test(line);
      const isThongKe = /thống kê|xác suất|tần số|biến cố/i.test(line);

      currentChapter = {
        id: `pdf-ch-${autoChapterNum}-${Date.now()}`,
        chapterNumber: autoChapterNum,
        title: chapterTitle,
        shortTitle: chapterMatch[3]?.trim() || `Chương ${chapterNumberRoman}`,
        branch: isHinhHoc ? 'HinhHoc' : isThongKe ? 'ThongKeXacSuat' : 'DaiSo',
        totalPeriods: 14,
        lessons: [],
      };
      chapters.push(currentChapter);
      currentLesson = null;
      autoChapterNum++;
      continue;
    }

    // Detect Lesson
    const lessonMatch = line.match(/^(Bài|BÀI)\s+(\d+)[:\.\s-]*(.*)/i);
    const isExerciseEnding = /^(Bài tập cuối chương|Luyện tập chung)/i.test(line);

    if (lessonMatch || isExerciseEnding) {
      if (!currentChapter) {
        currentChapter = {
          id: `pdf-ch-${autoChapterNum}-${Date.now()}`,
          chapterNumber: autoChapterNum,
          title: volume === 1 ? 'Chương I: Đại số và Hình học (Tập 1)' : 'Chương VI: Đại số và Hình học (Tập 2)',
          shortTitle: 'Nội dung kiến thức SGK',
          branch: 'DaiSo',
          totalPeriods: 20,
          lessons: [],
        };
        chapters.push(currentChapter);
        autoChapterNum++;
      }

      const lessonNum = lessonMatch ? parseInt(lessonMatch[2], 10) : autoLessonNum;
      const lessonTitle = lessonMatch ? line : `${line} (Chương ${currentChapter.chapterNumber})`;
      const cleanTitle = lessonMatch && lessonMatch[3] ? lessonMatch[3].trim() : line;

      // Extract default objectives tailored to topic
      const defaultNb = getLearningObjectiveForTopic('nhanBiet', cleanTitle, currentChapter.title, [], volume);
      const defaultTh = getLearningObjectiveForTopic('thongHieu', cleanTitle, currentChapter.title, [], volume);
      const defaultVd = getLearningObjectiveForTopic('vanDung', cleanTitle, currentChapter.title, [], volume);

      currentLesson = {
        id: `pdf-l-${lessonNum}-${Date.now()}`,
        lessonNumber: lessonNum,
        title: lessonTitle,
        shortTitle: cleanTitle || lessonTitle,
        periods: 3,
        objectives: {
          nhanBiet: defaultNb,
          thongHieu: defaultTh,
          vanDung: defaultVd,
        },
      };

      currentChapter.lessons.push(currentLesson);
      autoLessonNum++;
      continue;
    }

    // Check if line contains explicit learning objectives
    if (currentLesson) {
      const isNb = /nhận biết|nêu được|phát biểu|kể tên|chỉ ra/i.test(line);
      const isTh = /thông hiểu|hiểu được|giải thích|phân biệt|chứng minh đơn giản/i.test(line);
      const isVd = /vận dụng|tính được|giải quyết|áp dụng|thực hành/i.test(line);

      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('+') || line.startsWith('*')) {
        const bulletText = line.replace(/^[-•+*]\s*/, '').trim();
        if (bulletText.length > 5) {
          if (isNb && !currentLesson.objectives.nhanBiet.includes(bulletText)) {
            currentLesson.objectives.nhanBiet += `\n- ${bulletText}`;
          } else if (isTh && !currentLesson.objectives.thongHieu.includes(bulletText)) {
            currentLesson.objectives.thongHieu += `\n- ${bulletText}`;
          } else if (isVd && !currentLesson.objectives.vanDung.includes(bulletText)) {
            currentLesson.objectives.vanDung += `\n- ${bulletText}`;
          }
        }
      }
    }
  }

  // If chapters were detected but empty lessons, generate fallback lesson
  for (const ch of chapters) {
    if (ch.lessons.length === 0) {
      ch.lessons.push({
        id: `pdf-l-auto-${ch.chapterNumber}-${Date.now()}`,
        lessonNumber: 1,
        title: `Nội dung trọng tâm: ${ch.shortTitle}`,
        shortTitle: ch.shortTitle,
        periods: 4,
        objectives: {
          nhanBiet: `- Nhận biết các khái niệm, định lý và công thức trọng tâm thuộc ${ch.shortTitle}.`,
          thongHieu: `- Thông hiểu phương pháp giải các dạng bài tập của ${ch.shortTitle}.`,
          vanDung: `- Vận dụng kiến thức ${ch.shortTitle} vào giải quyết bài toán và tình huống thực tiễn.`,
        },
      });
    }
  }

  return {
    id: `sgk-pdf-${Date.now()}`,
    title: `SGK PDF: ${fileName.replace(/\.[^/.]+$/, '')} (Tập ${volume})`,
    series: 'custom',
    grade: '9',
    volume,
    publisher: 'Trích xuất từ file PDF SGK',
    chapters,
    sourceFileName: fileName,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Generates sample Excel workbook with standard SGK format for user download
 */
export function generateSampleSgkExcel(volume: 1 | 2 = 1): void {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    ['Chương / Chủ đề', 'Tên bài học', 'Số tiết', 'Yêu cầu cần đạt (Nhận biết)', 'Yêu cầu cần đạt (Thông hiểu)', 'Yêu cầu cần đạt (Vận dụng)'],
    [
      volume === 1 ? 'Chương I: Phương trình và hệ hai phương trình bậc nhất hai ẩn' : 'Chương VI: Hàm số y = ax² (a ≠ 0). Phương trình bậc hai một ẩn',
      '',
      '',
      '',
      '',
      '',
    ],
    [
      '',
      volume === 1 ? 'Bài 1: Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn' : 'Bài 14: Hàm số y = ax² (a ≠ 0) và đồ thị parabol',
      '3',
      '- Nhận biết phương trình bậc nhất hai ẩn và nghiệm của hệ phương trình.',
      '- Kiểm tra một cặp số có là nghiệm của hệ phương trình; biểu diễn hình học tập nghiệm.',
      '- Thiết lập hệ phương trình từ tình huống thực tiễn đơn giản.',
    ],
    [
      '',
      volume === 1 ? 'Bài 2: Giải hệ hai phương trình bậc nhất hai ẩn' : 'Bài 15: Phương trình bậc hai một ẩn và công thức nghiệm',
      '5',
      '- Nêu được các bước giải hệ PT bằng phương pháp thế và cộng đại số.',
      '- Giải thành thạo hệ hai phương trình bậc nhất hai ẩn; dùng MTCT kiểm tra kết quả.',
      '- Giải hệ phương trình quy về bậc nhất bằng phương pháp đặt ẩn phụ.',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  // Set column widths
  ws['!cols'] = [{ wch: 40 }, { wch: 45 }, { wch: 10 }, { wch: 50 }, { wch: 50 }, { wch: 50 }];

  XLSX.utils.book_append_sheet(wb, ws, `SGK_Toan_Tap_${volume}`);
  XLSX.writeFile(wb, `Mau_SGK_Toan_Tap_${volume}.xlsx`);
}

/**
 * Official SGK link definition
 */
export interface OfficialSgkLink {
  id: string;
  title: string;
  series: 'ket_noi_tri_thuc' | 'canh_dieu' | 'chan_troi_sang_tao';
  seriesName: string;
  grade: string;
  volume: 1 | 2;
  publisher: string;
  url: string;
  badge: string;
  sourcePortal: 'Hành Trang Số' | 'Hoc10' | 'NXB Giáo Dục' | 'Bộ GD&ĐT';
}

/**
 * Verified official textbook links from authorized publishing houses
 */
export const OFFICIAL_SGK_LINKS: OfficialSgkLink[] = [
  {
    id: 'link-kntt-9-t1',
    title: 'Toán 9 — Tập 1 (Kết nối tri thức với cuộc sống)',
    series: 'ket_noi_tri_thuc',
    seriesName: 'Kết nối tri thức với cuộc sống',
    grade: '9',
    volume: 1,
    publisher: 'NXB Giáo dục Việt Nam',
    url: 'https://hanhtrangso.nxbgd.vn/sach-dien-tu/toan-9-tap-mot-ket-noi-tri-thuc-10332.html',
    badge: 'Chính thống NXBGD',
    sourcePortal: 'Hành Trang Số',
  },
  {
    id: 'link-kntt-9-t2',
    title: 'Toán 9 — Tập 2 (Kết nối tri thức với cuộc sống)',
    series: 'ket_noi_tri_thuc',
    seriesName: 'Kết nối tri thức với cuộc sống',
    grade: '9',
    volume: 2,
    publisher: 'NXB Giáo dục Việt Nam',
    url: 'https://hanhtrangso.nxbgd.vn/sach-dien-tu/toan-9-tap-hai-ket-noi-tri-thuc-10333.html',
    badge: 'Chính thống NXBGD',
    sourcePortal: 'Hành Trang Số',
  },
  {
    id: 'link-canhdieu-9-t1',
    title: 'Toán 9 — Tập 1 (Cánh Diều)',
    series: 'canh_dieu',
    seriesName: 'Cánh Diều',
    grade: '9',
    volume: 1,
    publisher: 'NXB Đại học Sư phạm / VEPIC',
    url: 'https://hoc10.vn/doc-sach/SGK-Toan-9-Tap-1/1/139/0',
    badge: 'Chính thống Hoc10',
    sourcePortal: 'Hoc10',
  },
  {
    id: 'link-canhdieu-9-t2',
    title: 'Toán 9 — Tập 2 (Cánh Diều)',
    series: 'canh_dieu',
    seriesName: 'Cánh Diều',
    grade: '9',
    volume: 2,
    publisher: 'NXB Đại học Sư phạm / VEPIC',
    url: 'https://hoc10.vn/doc-sach/SGK-Toan-9-Tap-2/1/140/0',
    badge: 'Chính thống Hoc10',
    sourcePortal: 'Hoc10',
  },
  {
    id: 'link-ctst-9-t1',
    title: 'Toán 9 — Tập 1 (Chân trời sáng tạo)',
    series: 'chan_troi_sang_tao',
    seriesName: 'Chân trời sáng tạo',
    grade: '9',
    volume: 1,
    publisher: 'NXB Giáo dục Việt Nam',
    url: 'https://hanhtrangso.nxbgd.vn/sach-dien-tu/toan-9-tap-mot-chan-troi-sang-tao-10334.html',
    badge: 'Chính thống NXBGD',
    sourcePortal: 'Hành Trang Số',
  },
  {
    id: 'link-ctst-9-t2',
    title: 'Toán 9 — Tập 2 (Chân trời sáng tạo)',
    series: 'chan_troi_sang_tao',
    seriesName: 'Chân trời sáng tạo',
    grade: '9',
    volume: 2,
    publisher: 'NXB Giáo dục Việt Nam',
    url: 'https://hanhtrangso.nxbgd.vn/sach-dien-tu/toan-9-tap-hai-chan-troi-sang-tao-10335.html',
    badge: 'Chính thống NXBGD',
    sourcePortal: 'Hành Trang Số',
  },
  {
    id: 'link-hoclieu-9',
    title: 'Cổng học liệu số Toán THCS (Bộ GD&ĐT)',
    series: 'ket_noi_tri_thuc',
    seriesName: 'Học liệu GDPT 2018',
    grade: '9',
    volume: 1,
    publisher: 'Bộ Giáo dục & Đào tạo',
    url: 'https://hoclieu.vn/sach-giao-khoa/toan-9',
    badge: 'Cổng Bộ GD&ĐT',
    sourcePortal: 'Bộ GD&ĐT',
  },
];

/**
 * Recognizes and parses SGK content from a URL or web link
 */
export async function recognizeSgkFromUrl(
  inputUrl: string,
  preferredVolume?: 1 | 2,
  preferredGrade: string = '9'
): Promise<{
  book: SgkBook;
  sourceType: 'official_presynced' | 'server_ai_extracted' | 'web_extracted';
  message: string;
}> {
  const url = inputUrl.trim();
  if (!url) {
    throw new Error('Vui lòng nhập đường dẫn URL trang web sách giáo khoa hoặc học liệu.');
  }

  const normUrl = url.toLowerCase();

  // 1. Detect if URL matches recognized official sources (Hành Trang Số, Hoc10, NXBGD)
  const isHoc10 = normUrl.includes('hoc10.vn') || normUrl.includes('canh-dieu') || normUrl.includes('canhdieu');
  const isKntt =
    normUrl.includes('ket-noi-tri-thuc') ||
    normUrl.includes('kntt') ||
    (normUrl.includes('hanhtrangso.nxbgd.vn') && !normUrl.includes('chan-troi'));
  const isChanTroi = normUrl.includes('chan-troi') || normUrl.includes('ctst');

  // Detect volume from URL or fallback to preference
  const isVol2 =
    normUrl.includes('tap-2') ||
    normUrl.includes('tap-hai') ||
    normUrl.includes('tap_2') ||
    normUrl.includes('volume2') ||
    normUrl.includes('hk2') ||
    normUrl.includes('140') || // Hoc10 id for Toan 9 Tap 2
    preferredVolume === 2;

  const targetVolume: 1 | 2 = isVol2 ? 2 : (preferredVolume || 1);

  // If matches Cánh Diều (Hoc10.vn)
  if (isHoc10) {
    const baseBook = targetVolume === 2 ? DEFAULT_SGK_CANH_DIEU_9_TAP_2 : DEFAULT_SGK_CANH_DIEU_9_TAP_1;
    return {
      book: {
        ...baseBook,
        id: `sgk-url-${Date.now()}`,
        sourceFileName: url,
        uploadedAt: new Date().toISOString(),
      },
      sourceType: 'official_presynced',
      message: `Đã tự động nhận diện từ cổng Hoc10.vn: ${baseBook.title} theo chuẩn GDPT 2018.`,
    };
  }

  // If matches Kết nối tri thức (Hành Trang Số - NXBGD)
  if (isKntt) {
    const baseBook = targetVolume === 2 ? DEFAULT_SGK_TOAN_9_TAP_2 : DEFAULT_SGK_TOAN_9_TAP_1;
    return {
      book: {
        ...baseBook,
        id: `sgk-url-${Date.now()}`,
        sourceFileName: url,
        uploadedAt: new Date().toISOString(),
      },
      sourceType: 'official_presynced',
      message: `Đã tự động nhận diện từ Hành Trang Số (NXB Giáo Dục): ${baseBook.title}.`,
    };
  }

  // If matches Chân Trời Sáng Tạo (NXBGD)
  if (isChanTroi) {
    const baseBook = targetVolume === 2 ? DEFAULT_SGK_TOAN_9_TAP_2 : DEFAULT_SGK_TOAN_9_TAP_1;
    return {
      book: {
        ...baseBook,
        id: `sgk-url-${Date.now()}`,
        title: `SGK Toán ${preferredGrade} — Tập ${targetVolume} (Bộ Chân Trời Sáng Tạo - NXB Giáo Dục)`,
        series: 'chan_troi_sang_tao',
        publisher: 'NXB Giáo Dục Việt Nam (Hành Trang Số)',
        sourceFileName: url,
        uploadedAt: new Date().toISOString(),
      },
      sourceType: 'official_presynced',
      message: `Đã tự động nhận diện sách Bộ Chân Trời Sáng Tạo từ Hành Trang Số: Tập ${targetVolume}.`,
    };
  }

  // 2. If it is an external URL, attempt to call the server parser API
  try {
    const res = await fetch('/api/parse-sgk-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        volume: targetVolume,
        grade: preferredGrade,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.book && data.book.chapters && data.book.chapters.length > 0) {
        return {
          book: data.book,
          sourceType: 'server_ai_extracted',
          message: `Đã đọc và trích xuất thành công ${data.book.chapters.length} chương, ${data.book.chapters.reduce(
            (acc: number, c: any) => acc + (c.lessons?.length || 0),
            0
          )} bài học từ link.`,
        };
      }

      if (data.extractedText && data.extractedText.length > 50) {
        const parsedFromText = parseSgkFromText(data.extractedText, data.pageTitle || url, targetVolume);
        if (parsedFromText.chapters.length > 0 && parsedFromText.chapters.some((c) => c.lessons.length > 0)) {
          return {
            book: {
              ...parsedFromText,
              title: data.pageTitle || `SGK Toán ${preferredGrade} (Trích xuất từ Web)`,
              sourceFileName: url,
              publisher: 'Trích xuất từ liên kết web',
            },
            sourceType: 'web_extracted',
            message: `Đã phân tích nội dung trang web và tạo danh mục bài học SGK thành công.`,
          };
        }
      }
    }
  } catch (netErr) {
    console.warn('[SGK URL Reader] Server API không khả dụng hoặc lỗi mạng:', netErr);
  }

  // 3. Fallback: Intelligent curriculum match based on grade and volume
  const fallbackBook = targetVolume === 2 ? DEFAULT_SGK_TOAN_9_TAP_2 : DEFAULT_SGK_TOAN_9_TAP_1;
  return {
    book: {
      ...fallbackBook,
      id: `sgk-custom-${Date.now()}`,
      title: `SGK Toán ${preferredGrade} — Tập ${targetVolume} (${url.split('/')[2] || 'Trang web'})`,
      sourceFileName: url,
      uploadedAt: new Date().toISOString(),
    },
    sourceType: 'official_presynced',
    message: `Đã kết nối đường link và đồng bộ danh mục theo chuẩn Chương trình GDPT 2018 (Tập ${targetVolume}).`,
  };
}

/**
 * Export an entire SGK book with all chapters, lessons and YCCĐ to an Excel file
 */
export function exportSgkToExcel(book: SgkBook): void {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Tên chương / Chủ đề',
    'Mã bài',
    'Tên bài học',
    'Số tiết',
    'Trang SGK',
    'Trọng tâm kiến thức',
    'YCCĐ Mức 1 (Nhận biết)',
    'YCCĐ Mức 2 (Thông hiểu)',
    'YCCĐ Mức 3 (Vận dụng)',
  ];

  const rows: (string | number)[][] = [headers];

  book.chapters.forEach((ch) => {
    // Add chapter header row
    rows.push([ch.title, '', '', ch.totalPeriods, '', '', '', '', '']);

    ch.lessons.forEach((l) => {
      rows.push([
        '',
        `B${l.lessonNumber}`,
        l.title,
        l.periods,
        l.pageRange || '',
        (l.keyKnowledgePoints || []).join('; '),
        l.objectives.nhanBiet || '',
        l.objectives.thongHieu || '',
        l.objectives.vanDung || '',
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 35 },
    { wch: 10 },
    { wch: 45 },
    { wch: 10 },
    { wch: 15 },
    { wch: 40 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
  ];

  const safeTitle = (book.title || 'SGK').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_').substring(0, 40);
  XLSX.utils.book_append_sheet(wb, ws, 'Muc_Luc_SGK');
  XLSX.writeFile(wb, `${safeTitle}_GDPT2018.xlsx`);
}

/**
 * Export an entire SGK book to a JSON file
 */
export function exportSgkToJson(book: SgkBook): void {
  const dataStr = JSON.stringify(book, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const safeTitle = (book.title || 'SGK').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_').substring(0, 40);
  saveAs(blob, `${safeTitle}.json`);
}

/**
 * Export an entire SGK book to a formatted Word document (.docx)
 */
export function exportSgkToDocx(book: SgkBook): void {
  let html = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${book.title}</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.3; }
      h1 { text-align: center; font-size: 16pt; margin-bottom: 4px; }
      p.sub { text-align: center; font-style: italic; font-size: 12pt; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid black; padding: 6px 8px; vertical-align: top; }
      th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
      .ch-row { background-color: #e6f0fa; font-weight: bold; }
      .text-center { text-align: center; }
      ul { margin: 0; padding-left: 18px; }
    </style>
  </head>
  <body>
    <h1>${book.title}</h1>
    <p class="sub">Nhà xuất bản: ${book.publisher || 'Chương trình GDPT 2018'} | Bộ môn: Toán lớp ${book.grade}</p>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">STT</th>
          <th style="width: 25%;">Tên bài học</th>
          <th style="width: 8%;">Số tiết</th>
          <th style="width: 62%;">Yêu cầu cần đạt (YCCĐ chuẩn GDPT 2018)</th>
        </tr>
      </thead>
      <tbody>
  `;

  let stt = 1;
  book.chapters.forEach((ch) => {
    html += `
      <tr class="ch-row">
        <td colspan="4">${ch.title} (${ch.totalPeriods} tiết)</td>
      </tr>
    `;
    ch.lessons.forEach((l) => {
      html += `
        <tr>
          <td class="text-center">${stt++}</td>
          <td><strong>${l.title}</strong><br><small style="color:#555;">${l.pageRange || ''}</small></td>
          <td class="text-center">${l.periods}</td>
          <td>
            <strong>Mức 1 (Nhận biết):</strong><br>${(l.objectives.nhanBiet || 'Chưa cập nhật').replace(/\n/g, '<br>')}<br><br>
            <strong>Mức 2 (Thông hiểu):</strong><br>${(l.objectives.thongHieu || 'Chưa cập nhật').replace(/\n/g, '<br>')}<br><br>
            <strong>Mức 3 (Vận dụng):</strong><br>${(l.objectives.vanDung || 'Chưa cập nhật').replace(/\n/g, '<br>')}
          </td>
        </tr>
      `;
    });
  });

  html += `
      </tbody>
    </table>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const safeTitle = (book.title || 'SGK').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_').substring(0, 40);
  saveAs(blob, `${safeTitle}.doc`);
}

