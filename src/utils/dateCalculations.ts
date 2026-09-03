import {
  TimeframeConfig,
  PpctDataset,
  ExamEvent,
  MatrixRow,
  SpecificationRow,
  SpecificationItem,
  TopicPointCalc,
  CognitiveLevel,
  SgkBook,
} from '../types';
import { getLearningObjectiveForTopic } from './sgkParser';

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateVN(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatTimeVN(date: Date): string {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function getDayOfWeekVN(date: Date): string {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return days[date.getDay()];
}

export function formatFullDateTimeVN(date: Date): string {
  return `${getDayOfWeekVN(date)}, ngày ${formatDateVN(date)} lúc ${formatTimeVN(date)}`;
}

export function getTodayDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultStartDateWeek1(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0 is Jan, 8 is Sept
  // If Jan-July, school year started in Sept of previous year; if Aug-Dec, starts in Sept of current year
  const schoolYear = month >= 7 ? year : year - 1;
  const sept1 = new Date(schoolYear, 8, 1);
  const dayOfWeek = sept1.getDay(); // 0 is Sun, 1 is Mon
  const daysUntilMonday = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : 8 - dayOfWeek);
  const firstMonday = new Date(schoolYear, 8, 1 + daysUntilMonday);

  const y = firstMonday.getFullYear();
  const m = (firstMonday.getMonth() + 1).toString().padStart(2, '0');
  const d = firstMonday.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDateRange(startDateWeek1Str: string, weekNumber: number) {
  const startDate = parseDate(startDateWeek1Str);
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + (weekNumber - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 5); // Monday to Saturday (Vietnam school week)

  return { weekStart, weekEnd };
}

export function calculateCurrentWeek(startDateWeek1Str: string, currentDateStr: string): {
  week: number;
  term: 1 | 2;
  isBeforeTerm: boolean;
} {
  const start = parseDate(startDateWeek1Str);
  const current = parseDate(currentDateStr);

  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { week: 0, term: 1, isBeforeTerm: true };
  }

  const week = Math.floor(diffDays / 7) + 1;
  const term = week <= 18 ? 1 : 2;
  return { week, term, isBeforeTerm: false };
}

export function calculateDaysRemaining(targetDate: Date, currentDateStr: string): number {
  const current = parseDate(currentDateStr);
  const diffTime = targetDate.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function generateExamSchedule(
  config: TimeframeConfig,
  ppct: PpctDataset
): ExamEvent[] {
  // If custom events are provided, use them
  if (config.customEvents && config.customEvents.length > 0) {
    return config.customEvents.map((ev) => {
      const { weekStart, weekEnd } = getWeekDateRange(config.startDateWeek1, ev.week);
      const isPeriodic = ev.type === 'giua_ky' || ev.type === 'cuoi_ky';
      
      let exactDateText = ev.customExactDateText || '';
      let targetDateForCountdown: Date;

      if (!exactDateText) {
        if (isPeriodic) {
          const offsetDays = Math.max(0, (config.examStartDayOfWeek || 5) - 2);
          const examDay1 = new Date(weekStart);
          examDay1.setDate(weekStart.getDate() + offsetDays);

          const examDay2 = new Date(examDay1);
          examDay2.setDate(examDay1.getDate() + (config.examDurationDays - 1 || 1));

          const day1VN = `Thứ ${config.examStartDayOfWeek} ${formatDateVN(examDay1)}`;
          const day2VN = `Thứ ${config.examStartDayOfWeek + 1} ${formatDateVN(examDay2)}`;
          exactDateText = `${day1VN} và ${day2VN}`;
          targetDateForCountdown = examDay1;
        } else {
          exactDateText = `Trong tuần ${ev.week} (${formatDateVN(weekStart)} – ${formatDateVN(weekEnd)})`;
          targetDateForCountdown = weekStart;
        }
      } else {
        targetDateForCountdown = weekStart;
      }

      const daysRemaining = calculateDaysRemaining(targetDateForCountdown, config.currentDate);

      const [wStart, wEnd] = ev.customScopeWeeks || [
        ev.term === 1 ? 1 : (config.totalWeeksHK1 || 18) + 1,
        ev.week
      ];

      const scopeLessons = ppct.lessons.filter(
        (l) => l.tuan >= wStart && l.tuan <= wEnd
      );

      const chapterMap = new Map<string, string[]>();
      scopeLessons.forEach((l) => {
        const list = chapterMap.get(l.chuong) || [];
        list.push(l.baiHoc);
        chapterMap.set(l.chuong, list);
      });

      const chapterSummaries = Array.from(chapterMap.entries()).map(([chapter, lessons]) => ({
        chapter,
        lessons,
      }));

      return {
        id: ev.id,
        term: ev.term,
        title: ev.title,
        type: ev.type,
        week: ev.week,
        exactDateText,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        daysRemaining,
        isPast: daysRemaining < 0,
        isCurrent: daysRemaining >= 0 && daysRemaining <= 7,
        suggestedScope: `Phạm vi: tuần ${wStart}–${wEnd}`,
        lessonCount: scopeLessons.length,
        chapterSummaries,
      };
    });
  }

  // Dynamic builder based on configuration
  const kttxWeeksHK1 = config.kttxWeeksHK1 || [3, 6, 11, 14];
  const kttxWeeksHK2 = config.kttxWeeksHK2 || [21, 23, 29, 31];
  const countHK1 = Math.min(kttxWeeksHK1.length, config.kttxCountPerTerm || 4);
  const countHK2 = Math.min(kttxWeeksHK2.length, config.kttxCountPerTerm || 4);

  const rawEvents: Array<{
    id: string;
    term: 1 | 2;
    title: string;
    type: 'kttx' | 'giua_ky' | 'cuoi_ky';
    week: number;
    scopeWeeks: [number, number];
  }> = [];

  // HK1 KTTX and Exams
  const midHK1 = config.midtermWeekHK1 || 9;
  const finHK1 = config.finalWeekHK1 || 18;

  let prevWeekHK1 = 1;
  for (let i = 0; i < countHK1; i++) {
    const currentWeek = kttxWeeksHK1[i] || (i + 1) * 3;
    rawEvents.push({
      id: `kttx-${i + 1}-hk1`,
      term: 1,
      title: `KT thường xuyên ${i + 1} — HK I`,
      type: 'kttx',
      week: currentWeek,
      scopeWeeks: [prevWeekHK1, currentWeek],
    });
    prevWeekHK1 = Math.max(1, currentWeek);
  }

  // Add Midterm HK1
  rawEvents.push({
    id: 'gk-hk1',
    term: 1,
    title: 'Kiểm tra giữa học kỳ I',
    type: 'giua_ky',
    week: midHK1,
    scopeWeeks: [1, midHK1],
  });

  // Add Final HK1
  rawEvents.push({
    id: 'ck-hk1',
    term: 1,
    title: 'Kiểm tra cuối học kỳ I',
    type: 'cuoi_ky',
    week: finHK1,
    scopeWeeks: [1, finHK1],
  });

  // HK2 KTTX and Exams
  const hk2StartWeek = (config.totalWeeksHK1 || 18) + 1;
  const midHK2 = config.midtermWeekHK2 || 26;
  const finHK2 = config.finalWeekHK2 || 33;

  let prevWeekHK2 = hk2StartWeek;
  for (let i = 0; i < countHK2; i++) {
    const currentWeek = kttxWeeksHK2[i] || hk2StartWeek + (i * 3) + 2;
    rawEvents.push({
      id: `kttx-${i + 1}-hk2`,
      term: 2,
      title: `KT thường xuyên ${i + 1} — HK II`,
      type: 'kttx',
      week: currentWeek,
      scopeWeeks: [prevWeekHK2, currentWeek],
    });
    prevWeekHK2 = Math.max(hk2StartWeek, currentWeek);
  }

  // Add Midterm HK2
  rawEvents.push({
    id: 'gk-hk2',
    term: 2,
    title: 'Kiểm tra giữa học kỳ II',
    type: 'giua_ky',
    week: midHK2,
    scopeWeeks: [hk2StartWeek, midHK2],
  });

  // Add Final HK2
  rawEvents.push({
    id: 'ck-hk2',
    term: 2,
    title: 'Kiểm tra cuối học kỳ II',
    type: 'cuoi_ky',
    week: finHK2,
    scopeWeeks: [hk2StartWeek, finHK2],
  });

  // Sort by term and week
  rawEvents.sort((a, b) => {
    if (a.term !== b.term) return a.term - b.term;
    return a.week - b.week;
  });

  return rawEvents.map((ev) => {
    const { weekStart, weekEnd } = getWeekDateRange(config.startDateWeek1, ev.week);

    let exactDateText = '';
    let targetDateForCountdown: Date;

    if (ev.type === 'giua_ky' || ev.type === 'cuoi_ky') {
      const offsetDays = Math.max(0, (config.examStartDayOfWeek || 5) - 2);
      const examDay1 = new Date(weekStart);
      examDay1.setDate(weekStart.getDate() + offsetDays);

      const examDay2 = new Date(examDay1);
      examDay2.setDate(examDay1.getDate() + (config.examDurationDays - 1 || 1));

      const day1VN = `Thứ ${config.examStartDayOfWeek} ${formatDateVN(examDay1)}`;
      const day2VN = `Thứ ${config.examStartDayOfWeek + 1} ${formatDateVN(examDay2)}`;
      exactDateText = `${day1VN} và ${day2VN}`;
      targetDateForCountdown = examDay1;
    } else {
      exactDateText = `Trong tuần ${ev.week} (${formatDateVN(weekStart)} – ${formatDateVN(weekEnd)})`;
      targetDateForCountdown = weekStart;
    }

    const daysRemaining = calculateDaysRemaining(targetDateForCountdown, config.currentDate);

    // Extract lessons in scope
    const [wStart, wEnd] = ev.scopeWeeks;
    const scopeLessons = ppct.lessons.filter(
      (l) => l.tuan >= wStart && l.tuan <= wEnd
    );

    // Group lessons by chapter
    const chapterMap = new Map<string, string[]>();
    scopeLessons.forEach((l) => {
      const list = chapterMap.get(l.chuong) || [];
      list.push(l.baiHoc);
      chapterMap.set(l.chuong, list);
    });

    const chapterSummaries = Array.from(chapterMap.entries()).map(([chapter, lessons]) => ({
      chapter,
      lessons,
    }));

    return {
      id: ev.id,
      term: ev.term,
      title: ev.title,
      type: ev.type,
      week: ev.week,
      exactDateText,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      daysRemaining,
      isPast: daysRemaining < 0,
      isCurrent: daysRemaining >= 0 && daysRemaining <= 7,
      suggestedScope: `Phạm vi: tuần ${wStart}–${wEnd}`,
      lessonCount: scopeLessons.length,
      chapterSummaries,
    };
  });
}

/**
 * Automatically generates a balanced Exam Matrix from PPCT up to the target exam week
 * Supports:
 * - Limiting content to specific week (e.g. up to Week 9)
 * - Configurable TN / TL ratio (e.g. 70% TN / 30% TL)
 * - MOET 2025 New Structure (Phần I: 4 lựa chọn, Phần II: Đúng/Sai, Phần III: Trả lời ngắn, Phần IV: Tự luận)
 * - Standard 2018 Structure (TNKQ & TL theo 4 mức độ)
 * - Exact taught periods and % thời lượng balancing
 */
export function generateMatrixFromPpct(
  ppct: PpctDataset,
  options: {
    targetWeek?: number;
    limitWeekFrom?: number;
    limitWeekTo?: number;
    limitPeriodTo?: number;
    selectedLessonKeys?: string[];
    ratioTn?: number;
    ratioTl?: number;
    structureType?: 'moet_2025_new' | 'standard_2018';
    scorePerTn?: number;
    scorePerTn1?: number;
    scorePerTn2?: number;
    scorePerTn3?: number;
    scorePerTl?: number;
    targetScore?: number;
    cognitiveRatios?: { nhanBiet: number; thongHieu: number; vanDung: number; vanDungCao: number };
  } | number = 9,
  legacyScorePerTn = 0.25,
  legacyScorePerTl = 1.0,
  legacyTargetScore = 10
): MatrixRow[] {
  // Normalize arguments
  const config = typeof options === 'number' ? {
    limitWeekFrom: 1,
    limitWeekTo: options,
    limitPeriodTo: undefined as number | undefined,
    selectedLessonKeys: undefined as string[] | undefined,
    ratioTn: 70,
    ratioTl: 30,
    structureType: 'moet_2025_new' as const,
    scorePerTn: legacyScorePerTn,
    scorePerTn1: 0.25,
    scorePerTn2: 1.0,
    scorePerTn3: 0.5,
    scorePerTl: legacyScorePerTl,
    targetScore: legacyTargetScore,
    cognitiveRatios: { nhanBiet: 40, thongHieu: 30, vanDung: 20, vanDungCao: 10 },
  } : {
    limitWeekFrom: Math.max(1, options.limitWeekFrom ?? 1),
    limitWeekTo: Math.max(options.limitWeekFrom ?? 1, options.limitWeekTo ?? options.targetWeek ?? 9),
    limitPeriodTo: options.limitPeriodTo,
    selectedLessonKeys: options.selectedLessonKeys,
    ratioTn: options.ratioTn ?? 70,
    ratioTl: options.ratioTl ?? 30,
    structureType: options.structureType ?? 'moet_2025_new',
    scorePerTn: options.scorePerTn ?? 0.25,
    scorePerTn1: options.scorePerTn1 ?? 0.25,
    scorePerTn2: options.scorePerTn2 ?? 1.0,
    scorePerTn3: options.scorePerTn3 ?? 0.5,
    scorePerTl: options.scorePerTl ?? 1.0,
    targetScore: options.targetScore ?? 10,
    cognitiveRatios: options.cognitiveRatios ?? { nhanBiet: 30, thongHieu: 40, vanDung: 20, vanDungCao: 10 },
  };

  // 1. Filter lessons strictly within the specified week range [limitWeekFrom, limitWeekTo]
  // and optionally limitPeriodTo
  let lessons = ppct.lessons.filter((l) => {
    if (l.tuan < config.limitWeekFrom || l.tuan > config.limitWeekTo) return false;
    if (config.limitPeriodTo && l.tietPPCT && l.tietPPCT > config.limitPeriodTo) return false;
    return true;
  });

  // If specific lesson keys are provided, filter by those
  if (config.selectedLessonKeys && config.selectedLessonKeys.length > 0) {
    lessons = lessons.filter((l) => {
      const key = `${l.chuong}:::${l.baiHoc.replace(/\(t\d+\)/g, '').trim()}`;
      return config.selectedLessonKeys!.includes(key);
    });
  }

  if (lessons.length === 0) return [];

  // 2. Group by chapter & unique lesson / subtopics
  const unitMap = new Map<string, { chapter: string; topic: string; periods: number }>();

  lessons.forEach((l) => {
    // Clean topic name
    const cleanedTopic = l.baiHoc.replace(/\(t\d+\)/g, '').trim();
    // Exclude purely administrative review rows if needed or keep as study unit
    const isExamOnly = /kiểm tra|thi học kỳ/i.test(cleanedTopic) && !/ôn tập/i.test(cleanedTopic);
    if (isExamOnly) return;

    const key = `${l.chuong}:::${cleanedTopic}`;
    const existing = unitMap.get(key);
    const lessonPeriods = l.soTiet || 1;
    if (existing) {
      existing.periods += lessonPeriods;
    } else {
      unitMap.set(key, {
        chapter: l.chuong.replace(/^Chương [IVXLCDM\d]+\.\s*/i, '').replace(/^Chủ đề \d+\.\s*/i, ''),
        topic: cleanedTopic,
        periods: lessonPeriods,
      });
    }
  });

  const units = Array.from(unitMap.values());
  if (units.length === 0) return [];

  const totalPeriods = units.reduce((sum, u) => sum + u.periods, 0) || 1;

  if (config.structureType === 'moet_2025_new') {
    // Cài đặt mức độ nhận thức chuẩn theo yêu cầu Bộ GD&ĐT:
    // Nhận biết: 30% (3.0 điểm)
    // Thông hiểu: 40% (4.0 điểm)
    // Vận dụng: 30% (3.0 điểm) [gồm Vận dụng 20% (2.0 điểm) và Vận dụng cao 10% (1.0 điểm)]
    //
    // Đầy đủ 4 dạng câu hỏi (3 dạng trắc nghiệm + 1 dạng tự luận), KHÔNG CÓ dạng nào chiếm 0%:
    // 1. TN Nhiều lựa chọn: 12 câu = 3.0 điểm (0.25đ/câu): 6 Biết (1.50đ) + 6 Hiểu (1.50đ)
    // 2. TN Đúng/Sai: 2 câu = 2.0 điểm (1.0đ/câu): 1 Biết (1.00đ) + 1 Hiểu (1.00đ)
    // 3. TN Trả lời ngắn: 4 câu = 2.0 điểm (0.5đ/câu): 1 Biết (0.50đ) + 3 Hiểu (1.50đ)
    // 4. Tự luận: 3 bài = 3.0 điểm (1.0đ/bài): 2 Vận dụng (2.00đ) + 1 Vận dụng cao (1.00đ)
    //
    // Tổng Nhận biết: 1.50 + 1.00 + 0.50 = 3.0 điểm (30%)
    // Tổng Thông hiểu: 1.50 + 1.00 + 1.50 = 4.0 điểm (40%)
    // Tổng Vận dụng: 2.0 điểm (20%)
    // Tổng Vận dụng cao: 1.0 điểm (10%)
    // Tổng điểm: 10.0 điểm (100%)!
    
    const TARGET_D1_NB = 6;
    const TARGET_D1_TH = 6;
    const TARGET_D2_NB = 1;
    const TARGET_D2_TH = 1;
    const TARGET_D3_NB = 1;
    const TARGET_D3_TH = 3;
    const TARGET_TL_VD = 2; // 2.0đ
    const TARGET_TL_VDC = 1; // 1.0đ

    // Phân bố đa dạng: Xác định các chủ đề/bài học nhận D2, D3, TL để tránh dồn cục
    const numUnits = units.length;
    const d2_nb_idx = 0;
    const d2_th_idx = numUnits > 1 ? Math.min(numUnits - 1, Math.floor(numUnits / 2)) : 0;

    // Phân bố 4 câu Trả lời ngắn (1 NB, 3 TH) vào các bài học khác nhau
    const d3_slots: { unitIdx: number; level: 'biet' | 'hieu' }[] = [];
    if (numUnits >= 4) {
      d3_slots.push({ unitIdx: 1 % numUnits, level: 'biet' });
      d3_slots.push({ unitIdx: 2 % numUnits, level: 'hieu' });
      d3_slots.push({ unitIdx: (numUnits - 1) % numUnits, level: 'hieu' });
      d3_slots.push({ unitIdx: 3 % numUnits, level: 'hieu' });
    } else {
      d3_slots.push({ unitIdx: 0, level: 'biet' });
      d3_slots.push({ unitIdx: (1 % numUnits), level: 'hieu' });
      d3_slots.push({ unitIdx: (2 % numUnits), level: 'hieu' });
      d3_slots.push({ unitIdx: (3 % numUnits), level: 'hieu' });
    }

    // Tự luận: Vận dụng ở bài trọng tâm, Vận dụng cao ở bài tổng hợp cuối
    const tl_vd_indices = [numUnits > 1 ? Math.floor(numUnits / 2) : 0, 0];
    const tl_vdc_idx = numUnits - 1;

    let remD1_NB = TARGET_D1_NB;
    let remD1_TH = TARGET_D1_TH;
    let remD2_NB = TARGET_D2_NB;
    let remD2_TH = TARGET_D2_TH;
    let remD3_NB = TARGET_D3_NB;
    let remD3_TH = TARGET_D3_TH;
    let remTL_VD = TARGET_TL_VD;
    let remTL_VDC = TARGET_TL_VDC;

    const rowAllocations = units.map((u, index) => {
      const isLast = index === units.length - 1;
      const weight = u.periods / totalPeriods;
      const tiLeThoiLuong = Math.round(weight * 100);

      // 1. Phân bố Dạng I (Nhiều lựa chọn - 12 câu: 6 NB, 6 TH) theo tỉ lệ thời lượng
      let d1_nb = isLast ? remD1_NB : Math.min(remD1_NB, Math.round(weight * TARGET_D1_NB));
      if (d1_nb < 0) d1_nb = 0;
      remD1_NB -= d1_nb;

      let d1_th = isLast ? remD1_TH : Math.min(remD1_TH, Math.round(weight * TARGET_D1_TH));
      if (d1_th < 0) d1_th = 0;
      remD1_TH -= d1_th;

      // 2. Phân bố Dạng II (Đúng - Sai - 2 câu: 1 NB, 1 TH) ở 2 bài học khác nhau
      let d2_nb = 0;
      if (index === d2_nb_idx && remD2_NB > 0) {
        d2_nb = 1;
        remD2_NB -= 1;
      } else if (isLast && remD2_NB > 0) {
        d2_nb = remD2_NB;
        remD2_NB = 0;
      }

      let d2_th = 0;
      if (index === d2_th_idx && remD2_TH > 0) {
        d2_th = 1;
        remD2_TH -= 1;
      } else if (isLast && remD2_TH > 0) {
        d2_th = remD2_TH;
        remD2_TH = 0;
      }

      // 3. Phân bố Dạng III (Trả lời ngắn - 4 câu: 1 NB, 3 TH) trải đều
      let d3_nb = 0;
      let d3_th = 0;
      d3_slots.forEach((slot) => {
        if (slot.unitIdx === index) {
          if (slot.level === 'biet' && remD3_NB > 0) {
            d3_nb += 1;
            remD3_NB -= 1;
          } else if (slot.level === 'hieu' && remD3_TH > 0) {
            d3_th += 1;
            remD3_TH -= 1;
          }
        }
      });

      if (isLast) {
        if (remD3_NB > 0) {
          d3_nb += remD3_NB;
          remD3_NB = 0;
        }
        if (remD3_TH > 0) {
          d3_th += remD3_TH;
          remD3_TH = 0;
        }
      }

      // 4. Phân bố Tự luận (3 câu/bài: 2 Vận dụng, 1 Vận dụng cao)
      let tl_vd = 0;
      if (tl_vd_indices.includes(index) && remTL_VD > 0) {
        tl_vd = 1;
        remTL_VD -= 1;
      } else if (isLast && remTL_VD > 0) {
        tl_vd = remTL_VD;
        remTL_VD = 0;
      }

      let tl_vdc = 0;
      if (index === tl_vdc_idx && remTL_VDC > 0) {
        tl_vdc = 1;
        remTL_VDC -= 1;
      } else if (isLast && remTL_VDC > 0) {
        tl_vdc = remTL_VDC;
        remTL_VDC = 0;
      }

      // Aggregate TN totals per cell
      const nb_tn = d1_nb + d2_nb + d3_nb;
      const th_tn = d1_th + d2_th + d3_th;

      return {
        id: `moet-row-${index + 1}`,
        tt: index + 1,
        chuong: u.chapter,
        noiDung: u.topic,
        soTiet: u.periods,
        tiLeThoiLuong,
        nhieuLuaChon: {
          biet: d1_nb,
          hieu: d1_th,
          vanDung: 0,
        },
        dungSai: {
          biet: d2_nb,
          hieu: d2_th,
          vanDung: 0,
        },
        traLoiNgan: {
          biet: d3_nb,
          hieu: d3_th,
          vanDung: 0,
        },
        tuLuan: {
          biet: 0,
          hieu: 0,
          vanDung: tl_vd + tl_vdc,
        },
        nhanBiet: {
          tn: nb_tn,
          tl: 0,
          tn1: d1_nb,
          tn2: d2_nb,
          tn3: d3_nb,
        },
        thongHieu: {
          tn: th_tn,
          tl: 0,
          tn1: d1_th,
          tn2: d2_th,
          tn3: d3_th,
        },
        vanDung: {
          tn: 0,
          tl: tl_vd,
          tn1: 0,
          tn2: 0,
          tn3: 0,
        },
        vanDungCao: {
          tn: 0,
          tl: tl_vdc,
          tn1: 0,
          tn2: 0,
          tn3: 0,
        },
      };
    });

    // Final safety check to guarantee exact totals
    if (remD1_NB > 0 && rowAllocations[0]) {
      rowAllocations[0].nhanBiet.tn1 = (rowAllocations[0].nhanBiet.tn1 || 0) + remD1_NB;
      rowAllocations[0].nhanBiet.tn += remD1_NB;
      if (rowAllocations[0].nhieuLuaChon) rowAllocations[0].nhieuLuaChon.biet += remD1_NB;
    }
    if (remD1_TH > 0 && rowAllocations[0]) {
      rowAllocations[0].thongHieu.tn1 = (rowAllocations[0].thongHieu.tn1 || 0) + remD1_TH;
      rowAllocations[0].thongHieu.tn += remD1_TH;
      if (rowAllocations[0].nhieuLuaChon) rowAllocations[0].nhieuLuaChon.hieu += remD1_TH;
    }
    if (remD2_NB > 0 && rowAllocations[0]) {
      rowAllocations[0].nhanBiet.tn2 = (rowAllocations[0].nhanBiet.tn2 || 0) + remD2_NB;
      rowAllocations[0].nhanBiet.tn += remD2_NB;
      if (rowAllocations[0].dungSai) rowAllocations[0].dungSai.biet += remD2_NB;
    }
    if (remD2_TH > 0 && (rowAllocations[1] || rowAllocations[0])) {
      const targetRow = rowAllocations[1] || rowAllocations[0];
      targetRow.thongHieu.tn2 = (targetRow.thongHieu.tn2 || 0) + remD2_TH;
      targetRow.thongHieu.tn += remD2_TH;
      if (targetRow.dungSai) targetRow.dungSai.hieu += remD2_TH;
    }
    if (remD3_NB > 0 && rowAllocations[0]) {
      rowAllocations[0].nhanBiet.tn3 = (rowAllocations[0].nhanBiet.tn3 || 0) + remD3_NB;
      rowAllocations[0].nhanBiet.tn += remD3_NB;
      if (rowAllocations[0].traLoiNgan) rowAllocations[0].traLoiNgan.biet += remD3_NB;
    }
    if (remD3_TH > 0 && rowAllocations[0]) {
      rowAllocations[0].thongHieu.tn3 = (rowAllocations[0].thongHieu.tn3 || 0) + remD3_TH;
      rowAllocations[0].thongHieu.tn += remD3_TH;
      if (rowAllocations[0].traLoiNgan) rowAllocations[0].traLoiNgan.hieu += remD3_TH;
    }
    if (remTL_VD > 0 && rowAllocations[0]) {
      rowAllocations[0].vanDung.tl += remTL_VD;
      if (rowAllocations[0].tuLuan) rowAllocations[0].tuLuan.vanDung += remTL_VD;
    }
    if (remTL_VDC > 0 && rowAllocations[rowAllocations.length - 1]) {
      rowAllocations[rowAllocations.length - 1].vanDungCao.tl += remTL_VDC;
      if (rowAllocations[rowAllocations.length - 1].tuLuan) {
        rowAllocations[rowAllocations.length - 1].tuLuan!.vanDung += remTL_VDC;
      }
    }

    return rowAllocations;
  } else {
    // Standard 2018 TNKQ & TL structure (70% TN = 28 câu x 0.25đ; 30% TL = 3 câu x 1.0đ)
    const targetTnScore = (config.targetScore * config.ratioTn) / 100;
    const targetTlScore = (config.targetScore * config.ratioTl) / 100;
    const totalTnQuestions = Math.round(targetTnScore / config.scorePerTn);
    const totalTlQuestions = Math.round(targetTlScore / config.scorePerTl);

    return units.map((u, index) => {
      const weight = u.periods / totalPeriods;
      const tiLeThoiLuong = Math.round(weight * 100);

      const tnCount = Math.max(1, Math.round(weight * totalTnQuestions));
      const nb_tn = Math.ceil(tnCount * 0.5);
      const th_tn = Math.floor(tnCount * 0.35);
      const vd_tn = Math.max(0, tnCount - nb_tn - th_tn);
      const vdc_tn = 0;

      const isMajor = weight >= 0.16;
      const tl_vd = (isMajor && index === Math.floor(units.length / 2)) ? 1 : 0;
      const tl_vdc = (index === units.length - 1) ? 1 : 0;

      return {
        id: `std-row-${index + 1}`,
        tt: index + 1,
        chuong: u.chapter,
        noiDung: u.topic,
        soTiet: u.periods,
        tiLeThoiLuong,
        nhanBiet: {
          tn: nb_tn,
          tl: 0,
        },
        thongHieu: {
          tn: th_tn,
          tl: 0,
        },
        vanDung: {
          tn: vd_tn,
          tl: tl_vd,
        },
        vanDungCao: {
          tn: vdc_tn,
          tl: tl_vdc,
        },
      };
    });
  }
}

/**
 * Trích xuất và chuẩn hóa dữ liệu 19 cột cho một dòng Ma trận (Phụ lục 1)
 */
export function getMatrixRow19Values(r: MatrixRow) {
  const nlc = {
    biet: r.nhieuLuaChon?.biet ?? r.nhanBiet?.tn1 ?? r.nhanBiet?.tn ?? 0,
    hieu: r.nhieuLuaChon?.hieu ?? r.thongHieu?.tn1 ?? r.thongHieu?.tn ?? 0,
    vanDung: r.nhieuLuaChon?.vanDung ?? 0,
  };
  const ds = {
    biet: r.dungSai?.biet ?? r.nhanBiet?.tn2 ?? 0,
    hieu: r.dungSai?.hieu ?? r.thongHieu?.tn2 ?? 0,
    vanDung: r.dungSai?.vanDung ?? 0,
  };
  const tln = {
    biet: r.traLoiNgan?.biet ?? r.nhanBiet?.tn3 ?? 0,
    hieu: r.traLoiNgan?.hieu ?? r.thongHieu?.tn3 ?? 0,
    vanDung: r.traLoiNgan?.vanDung ?? 0,
  };
  const tl = {
    biet: r.tuLuan?.biet ?? r.nhanBiet?.tl ?? 0,
    hieu: r.tuLuan?.hieu ?? r.thongHieu?.tl ?? 0,
    vanDung: r.tuLuan?.vanDung ?? ((r.vanDung?.tl || 0) + (r.vanDungCao?.tl || 0)),
  };

  const tongBiet = nlc.biet + ds.biet + tln.biet + tl.biet;
  const tongHieu = nlc.hieu + ds.hieu + tln.hieu + tl.hieu;
  const tongVanDung = nlc.vanDung + ds.vanDung + tln.vanDung + tl.vanDung;

  const score =
    (nlc.biet + nlc.hieu + nlc.vanDung) * 0.25 +
    (ds.biet + ds.hieu + ds.vanDung) * 1.0 +
    (tln.biet + tln.hieu + tln.vanDung) * 0.5 +
    (tl.biet + tl.hieu + tl.vanDung) * 1.0;

  const formattedScore =
    score === 0 ? '' : score % 1 === 0 ? score.toString() : score.toFixed(1).replace('.', ',');

  return {
    nlc,
    ds,
    tln,
    tl,
    tongBiet,
    tongHieu,
    tongVanDung,
    score,
    formattedScore,
  };
}

/**
 * Tính bảng điểm theo từng chủ đề dựa trên số tiết thực tế (Theo đúng Phụ lục I trong công văn)
 */
export function calculateTopicPointSummary(
  rows: MatrixRow[],
  isMidterm: boolean = true
): {
  items: TopicPointCalc[];
  totalPeriods: number;
  totalScore: number;
} {
  // Group by chapter
  const chapterMap = new Map<string, { periods: number }>();
  rows.forEach((r) => {
    const chuong = r.chuong || 'Chủ đề khác';
    const cur = chapterMap.get(chuong) || { periods: 0 };
    cur.periods += r.soTiet || 1;
    chapterMap.set(chuong, cur);
  });

  const totalPeriods = Array.from(chapterMap.values()).reduce((sum, c) => sum + c.periods, 0) || 1;
  const chapterEntries = Array.from(chapterMap.entries());

  let accumulatedScore = 0;
  const items: TopicPointCalc[] = chapterEntries.map(([name, data], idx) => {
    const isLast = idx === chapterEntries.length - 1;
    const rawScore = (data.periods * 10) / totalPeriods;
    // Round to nearest 0.25 or 0.5
    let roundedScore = Math.round(rawScore * 2) / 2;
    
    if (isLast) {
      roundedScore = Math.max(0.5, Number((10 - accumulatedScore).toFixed(1)));
    } else {
      accumulatedScore += roundedScore;
    }

    return {
      topicIndex: idx + 1,
      topicName: name,
      periods: data.periods,
      rawScore: Number(rawScore.toFixed(2)),
      roundedScore,
    };
  });

  const totalScore = items.reduce((sum, item) => sum + item.roundedScore, 0);

  return {
    items,
    totalPeriods,
    totalScore: Number(totalScore.toFixed(1)),
  };
}

/**
 * Tự động tạo Bảng đặc tả đề kiểm tra (Phụ lục II) bám sát yêu cầu cần đạt GDPT 2018 và ma trận 16 cột
 */
export function generateSpecificationFromMatrix(
  rows: MatrixRow[],
  subject: string = 'Toán',
  grade: string = '9',
  sgkBooks?: SgkBook[],
  preferredVolume?: 1 | 2 | 'all'
): SpecificationRow[] {
  let currentD1Index = 1; // 1 -> 12 (Nhiều lựa chọn)
  let currentD2Index = 13; // 13 -> 14 (Đúng - sai)
  let currentD3Index = 15; // 15 -> 18 (Trả lời ngắn)
  let currentTLIndex = 19; // 19 -> 21 (Tự luận)

  // Group matrix rows by chapter/topic
  const chapterGroups = new Map<string, MatrixRow[]>();
  rows.forEach((r) => {
    const ch = r.chuong || 'Chủ đề chung';
    const list = chapterGroups.get(ch) || [];
    list.push(r);
    chapterGroups.set(ch, list);
  });

  const specRows: SpecificationRow[] = [];
  let topicNumber = 1;

  chapterGroups.forEach((chapterRows, chapterName) => {
    const totalChapterPeriods = chapterRows.reduce((sum, r) => sum + (r.soTiet || 1), 0);

    chapterRows.forEach((r) => {
      const items: SpecificationItem[] = [];
      const v = getMatrixRow19Values(r);

      // Helper to format question list
      const formatQ = (startIdx: number, count: number, prefix: string = 'Câu ') => {
        if (count <= 0) return '';
        const list: number[] = [];
        for (let i = 0; i < count; i++) {
          list.push(startIdx + i);
        }
        if (list.length === 1) return `${prefix}${list[0]}`;
        return `${prefix}${list.join(', ')}`;
      };

      const getObjective = (level: CognitiveLevel) => {
        if (sgkBooks && sgkBooks.length > 0) {
          return getLearningObjectiveForTopic(level, r.noiDung, r.chuong, sgkBooks, preferredVolume);
        }
        return generateLearningObjective(level, r.noiDung, subject, grade);
      };

      // 1. NHẬN BIẾT
      const nb_d1 = v.nlc.biet;
      const nb_d2 = v.ds.biet;
      const nb_d3 = v.tln.biet;
      const nb_tl = v.tl.biet;

      let q_nb_d1 = '';
      if (nb_d1 > 0) {
        q_nb_d1 = formatQ(currentD1Index, nb_d1);
        currentD1Index += nb_d1;
      }
      let q_nb_d2 = '';
      if (nb_d2 > 0) {
        q_nb_d2 = formatQ(currentD2Index, nb_d2);
        currentD2Index += nb_d2;
      }
      let q_nb_d3 = '';
      if (nb_d3 > 0) {
        q_nb_d3 = formatQ(currentD3Index, nb_d3);
        currentD3Index += nb_d3;
      }
      let q_nb_tl = '';
      if (nb_tl > 0) {
        q_nb_tl = formatQ(currentTLIndex, nb_tl, 'Câu ');
        currentTLIndex += nb_tl;
      }

      if (nb_d1 > 0 || nb_d2 > 0 || nb_d3 > 0 || nb_tl > 0) {
        items.push({
          id: `spec-nb-${r.id}`,
          mucDo: 'nhanBiet',
          mucDoLabel: 'Nhận biết',
          yeuCauCanDat: getObjective('nhanBiet'),
          nlc: { biet: q_nb_d1, hieu: '', vanDung: '' },
          ds: { biet: q_nb_d2, hieu: '', vanDung: '' },
          tln: { biet: q_nb_d3, hieu: '', vanDung: '' },
          tl: { biet: q_nb_tl, hieu: '', vanDung: '' },
          soCauTN: nb_d1 + nb_d2 + nb_d3,
          soCauTL: nb_tl,
          cauHoiTNText: [q_nb_d1, q_nb_d2, q_nb_d3].filter(Boolean).join(', '),
          cauHoiTLText: q_nb_tl,
        });
      }

      // 2. THÔNG HIỂU
      const th_d1 = v.nlc.hieu;
      const th_d2 = v.ds.hieu;
      const th_d3 = v.tln.hieu;
      const th_tl = v.tl.hieu;

      let q_th_d1 = '';
      if (th_d1 > 0) {
        q_th_d1 = formatQ(currentD1Index, th_d1);
        currentD1Index += th_d1;
      }
      let q_th_d2 = '';
      if (th_d2 > 0) {
        q_th_d2 = formatQ(currentD2Index, th_d2);
        currentD2Index += th_d2;
      }
      let q_th_d3 = '';
      if (th_d3 > 0) {
        q_th_d3 = formatQ(currentD3Index, th_d3);
        currentD3Index += th_d3;
      }
      let q_th_tl = '';
      if (th_tl > 0) {
        q_th_tl = formatQ(currentTLIndex, th_tl, 'Câu ');
        currentTLIndex += th_tl;
      }

      if (th_d1 > 0 || th_d2 > 0 || th_d3 > 0 || th_tl > 0) {
        items.push({
          id: `spec-th-${r.id}`,
          mucDo: 'thongHieu',
          mucDoLabel: 'Thông hiểu',
          yeuCauCanDat: getObjective('thongHieu'),
          nlc: { biet: '', hieu: q_th_d1, vanDung: '' },
          ds: { biet: '', hieu: q_th_d2, vanDung: '' },
          tln: { biet: '', hieu: q_th_d3, vanDung: '' },
          tl: { biet: '', hieu: q_th_tl, vanDung: '' },
          soCauTN: th_d1 + th_d2 + th_d3,
          soCauTL: th_tl,
          cauHoiTNText: [q_th_d1, q_th_d2, q_th_d3].filter(Boolean).join(', '),
          cauHoiTLText: q_th_tl,
        });
      }

      // 3. VẬN DỤNG & VẬN DỤNG CAO
      const vd_d1 = v.nlc.vanDung;
      const vd_d2 = v.ds.vanDung;
      const vd_d3 = v.tln.vanDung;
      const vd_tl = v.tl.vanDung;

      let q_vd_d1 = '';
      if (vd_d1 > 0) {
        q_vd_d1 = formatQ(currentD1Index, vd_d1);
        currentD1Index += vd_d1;
      }
      let q_vd_d2 = '';
      if (vd_d2 > 0) {
        q_vd_d2 = formatQ(currentD2Index, vd_d2);
        currentD2Index += vd_d2;
      }
      let q_vd_d3 = '';
      if (vd_d3 > 0) {
        q_vd_d3 = formatQ(currentD3Index, vd_d3);
        currentD3Index += vd_d3;
      }
      let q_vd_tl = '';
      if (vd_tl > 0) {
        if (currentTLIndex === 19 && vd_tl > 1) {
          q_vd_tl = `19 a, b`;
          currentTLIndex += 1;
        } else {
          q_vd_tl = currentTLIndex >= 19 && currentTLIndex <= 21 ? `${currentTLIndex} a` : `Câu ${currentTLIndex}`;
          currentTLIndex += vd_tl;
        }
      }

      if (vd_d1 > 0 || vd_d2 > 0 || vd_d3 > 0 || vd_tl > 0) {
        items.push({
          id: `spec-vd-${r.id}`,
          mucDo: 'vanDung',
          mucDoLabel: 'Vận dụng',
          yeuCauCanDat: getObjective('vanDung'),
          nlc: { biet: '', hieu: '', vanDung: q_vd_d1 },
          ds: { biet: '', hieu: '', vanDung: q_vd_d2 },
          tln: { biet: '', hieu: '', vanDung: q_vd_d3 },
          tl: { biet: '', hieu: '', vanDung: q_vd_tl },
          soCauTN: vd_d1 + vd_d2 + vd_d3,
          soCauTL: vd_tl,
          cauHoiTNText: [q_vd_d1, q_vd_d2, q_vd_d3].filter(Boolean).join(', '),
          cauHoiTLText: q_vd_tl,
        });
      }

      // If no items generated, generate default 3 levels (Nhận biết, Thông hiểu, Vận dụng)
      if (items.length === 0) {
        items.push({
          id: `spec-nb-empty-${r.id}`,
          mucDo: 'nhanBiet',
          mucDoLabel: 'Nhận biết',
          yeuCauCanDat: getObjective('nhanBiet'),
          nlc: { biet: '', hieu: '', vanDung: '' },
          ds: { biet: '', hieu: '', vanDung: '' },
          tln: { biet: '', hieu: '', vanDung: '' },
          tl: { biet: '', hieu: '', vanDung: '' },
        });
        items.push({
          id: `spec-th-empty-${r.id}`,
          mucDo: 'thongHieu',
          mucDoLabel: 'Thông hiểu',
          yeuCauCanDat: getObjective('thongHieu'),
          nlc: { biet: '', hieu: '', vanDung: '' },
          ds: { biet: '', hieu: '', vanDung: '' },
          tln: { biet: '', hieu: '', vanDung: '' },
          tl: { biet: '', hieu: '', vanDung: '' },
        });
        items.push({
          id: `spec-vd-empty-${r.id}`,
          mucDo: 'vanDung',
          mucDoLabel: 'Vận dụng',
          yeuCauCanDat: getObjective('vanDung'),
          nlc: { biet: '', hieu: '', vanDung: '' },
          ds: { biet: '', hieu: '', vanDung: '' },
          tln: { biet: '', hieu: '', vanDung: '' },
          tl: { biet: '', hieu: '', vanDung: '' },
        });
      }

      specRows.push({
        id: `spec-row-${r.id}`,
        chuong: `Chủ đề ${topicNumber}\n${chapterName}`,
        soTietChuong: totalChapterPeriods,
        noiDung: `Nội dung ${topicNumber}\n${r.noiDung}`,
        items,
      });
    });

    topicNumber++;
  });

  return specRows;
}

/**
 * Tạo mô tả Yêu cầu cần đạt chuẩn GDPT 2018 theo động từ nhận thức
 */
function generateLearningObjective(
  level: CognitiveLevel,
  topic: string,
  subject: string,
  grade: string
): string {
  const cleanTopic = topic.replace(/\(t\d+\)/g, '').trim();

  switch (level) {
    case 'nhanBiet':
      return `- Nhận biết và nêu được các khái niệm, định nghĩa, tính chất cơ bản về ${cleanTopic}.\n- Nhận biết các biểu thức, quy tắc, công thức hoặc hiện tượng liên quan đến ${cleanTopic}.\n- Chỉ ra các ví dụ, dấu hiệu đặc trưng trong các tình huống đơn giản.`;
    case 'thongHieu':
      return `- Giải thích, phân biệt và mô tả được bản chất, cơ chế hoạt động của ${cleanTopic}.\n- Trình bày mối liên hệ giữa các khái niệm, biến đổi được biểu thức, hình vẽ hoặc hiện tượng.\n- Minh họa, so sánh và phân loại được các trường hợp liên quan đến ${cleanTopic}.`;
    case 'vanDung':
      return `- Vận dụng các kiến thức, công thức, định lý về ${cleanTopic} để giải quyết bài toán hoặc tình huống quen thuộc.\n- Thực hiện các bước tính toán, suy luận, chứng minh và xử lý số liệu chính xác.\n- Biến đổi và áp dụng linh hoạt phương pháp giải trong các tình huống cụ thể.`;
    case 'vanDungCao':
      return `- Vận dụng tổng hợp các kiến thức về ${cleanTopic} để giải quyết vấn đề thực tiễn hoặc bài toán phức tạp, liên môn.\n- Phân tích, đánh giá, đề xuất giải pháp, thiết kế mô hình hoặc suy luận logic nâng cao.\n- Xây dựng thuật toán / chiến lược xử lý tối ưu cho tình huống đặt ra.`;
    default:
      return `Nắm vững và thực hiện các yêu cầu cần đạt về ${cleanTopic} theo chương trình GDPT 2018.`;
  }
}
