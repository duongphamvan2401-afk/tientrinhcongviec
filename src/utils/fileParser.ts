import * as XLSX from 'xlsx';
import { PpctDataset, PpctLesson } from '../types';

/**
 * Extracts table rows and text from a Word document (.docx) using mammoth
 */
async function extractRowsFromDocx(data: ArrayBuffer): Promise<{ rows: (string | number)[][]; rawText: string }> {
  const rows: (string | number)[][] = [];
  let rawText = '';

  try {
    const mammoth = await import('mammoth');
    
    // 1. Extract HTML to parse Word tables
    try {
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer: data });
      const html = htmlResult.value || '';
      
      if (html.includes('<table')) {
        const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        for (const tr of trMatches) {
          const cellMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
          const cells = cellMatches.map((c) =>
            c
              .replace(/<[^>]+>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/\s+/g, ' ')
              .trim()
          );
          if (cells.some((c) => c.length > 0)) {
            rows.push(cells);
          }
        }
      }
    } catch (e) {
      console.warn('[PPCT Parser] Mammoth HTML table extract error, using text fallback:', e);
    }

    // 2. Extract raw text for fallback or line-by-line parsing
    try {
      const textResult = await mammoth.extractRawText({ arrayBuffer: data });
      rawText = textResult.value || '';
    } catch (e) {
      console.warn('[PPCT Parser] Mammoth text extract notice:', e);
    }
  } catch (err) {
    console.warn('[PPCT Parser] Mammoth import or extract notice:', err);
  }

  // If no table rows were extracted from HTML, parse raw text lines
  if (rows.length === 0 && rawText.trim().length > 0) {
    const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    for (const line of lines) {
      // Split line by tab or multiple spaces
      const parts = line.split(/[\t]+/).map((p) => p.trim()).filter((p) => p.length > 0);
      if (parts.length > 1) {
        rows.push(parts);
      } else {
        rows.push([line]);
      }
    }
  }

  return { rows, rawText };
}

export interface ParsePpctOptions {
  grade?: string;
  subject?: string;
  academicYear?: string;
  school?: string;
  customName?: string;
}

/**
 * Parses an Excel or Word (.docx) or CSV file buffer for PPCT table
 */
export async function parsePpctFile(
  file: File,
  options?: ParsePpctOptions
): Promise<PpctDataset> {
  const data = await file.arrayBuffer();
  const fileName = file.name.toLowerCase();
  const isWord = fileName.endsWith('.docx') || fileName.endsWith('.doc');

  let rows: (string | number)[][] = [];
  let fileRawText = '';

  // 1. If file is Word (.docx, .doc), use Word table parser directly
  if (isWord) {
    const docxResult = await extractRowsFromDocx(data);
    rows = docxResult.rows;
    fileRawText = docxResult.rawText;
  } else {
    // 2. Otherwise attempt Excel/CSV parsing via SheetJS
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });
    } catch (xlsxErr: any) {
      // If XLSX.read threw "Could not find workbook", file might be a Word document misnamed as xlsx, or plain text
      console.log('[PPCT Parser] XLSX read notice, attempting Word/Text extraction fallback:', xlsxErr?.message || xlsxErr);
      const docxResult = await extractRowsFromDocx(data);
      if (docxResult.rows.length > 0) {
        rows = docxResult.rows;
        fileRawText = docxResult.rawText;
      } else {
        // Attempt text-based CSV decode
        try {
          const text = new TextDecoder('utf-8').decode(data);
          fileRawText = text;
          const textLines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
          rows = textLines.map((line) => line.split(/[,;\t]/).map((c) => c.trim()));
        } catch {
          // keep empty rows
        }
      }
    }
  }

  const lessons: PpctLesson[] = [];
  let currentChapter = 'Chương I';
  let autoStt = 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    // Convert row elements to strings
    const cells = row.map((c) => (c !== undefined && c !== null ? String(c).trim() : ''));
    const fullText = cells.join(' ');

    // Check if header row
    if (
      (fullText.includes('Tiết') && fullText.includes('Tuần') && (fullText.includes('Tên bài') || fullText.includes('Nội dung'))) ||
      (fullText.includes('STT') && (fullText.includes('Tên bài dạy') || fullText.includes('Bài học')))
    ) {
      continue;
    }

    // Check if chapter header
    if (
      /^(Chương|Chủ đề|CHƯƠNG|CHỦ ĐỀ|Phần|PHẦN)\s+[IVXLCDM\d]+/i.test(cells[0]) ||
      /^(Chương|Chủ đề|CHƯƠNG|CHỦ ĐỀ)\s+[IVXLCDM\d]+/i.test(cells[1] || '') ||
      /^(Chương|Chủ đề|CHƯƠNG|CHỦ ĐỀ)\s+/i.test(cells[0])
    ) {
      currentChapter = cells[0] || cells[1] || currentChapter;
      continue;
    }

    // Find lesson number, week, topic
    let stt = autoStt;
    let tuan = Math.min(35, Math.ceil(autoStt / 4) || 1);
    let baiHoc = '';
    let soTiet = 1;

    // Heuristics based on standard PPCT columns (STT, Tuần, Tiết, Tên bài, Số tiết...)
    const num0 = parseInt(cells[0], 10);
    const num1 = parseInt(cells[1], 10);

    if (!isNaN(num0) && cells.length >= 2) {
      stt = num0;
      if (!isNaN(num1) && num1 <= 35) {
        // Cột 0: STT, Cột 1: Tuần, Cột 2: Tên bài, Cột 3: Số tiết
        tuan = num1;
        baiHoc = cells[2] || cells[3] || cells[4] || '';
        const possibleSoTiet = parseInt(cells[3], 10) || parseInt(cells[4], 10);
        if (!isNaN(possibleSoTiet) && possibleSoTiet > 0 && possibleSoTiet <= 10) {
          soTiet = possibleSoTiet;
        }
      } else {
        // Cột 0: STT/Tiết (1 đến 140), Cột 1: Tên bài dạy, Cột 2: Số tiết hoặc tuần
        baiHoc = cells[1] || cells[2] || '';
        const num2 = parseInt(cells[2], 10);
        if (!isNaN(num2) && num2 > 0 && num2 <= 10) {
          soTiet = num2;
        }
        // Nếu STT là tiết thứ n (1 -> 140), tuần = ceil(stt / 4)
        tuan = Math.min(35, Math.ceil(stt / 4) || 1);
      }
    } else if (cells.some((c) => /Bài\s+\d+|Luyện tập|Ôn tập|Kiểm tra|Hoạt động|Thực hành/i.test(c))) {
      baiHoc = cells.find((c) => /Bài\s+\d+|Luyện tập|Ôn tập|Kiểm tra|Hoạt động|Thực hành/i.test(c)) || cells[1] || cells[0];
      stt = autoStt;
      tuan = Math.min(35, Math.ceil(stt / 4) || 1);
      const possibleNumber = cells.map((c) => parseInt(c, 10)).find((n) => !isNaN(n) && n > 0 && n <= 10);
      if (possibleNumber) soTiet = possibleNumber;
    } else if (cells.length === 1 && /^(Tuần|Tiết|Bài)\s+/i.test(cells[0])) {
      // Single line format e.g. "Tuần 1: Bài 1 - Khái niệm phương trình"
      baiHoc = cells[0];
      const tuanMatch = cells[0].match(/Tuần\s*(\d+)/i);
      if (tuanMatch && tuanMatch[1]) tuan = parseInt(tuanMatch[1], 10);
      const tietMatch = cells[0].match(/Tiết\s*(\d+)/i);
      if (tietMatch && tietMatch[1]) stt = parseInt(tietMatch[1], 10);
      else stt = autoStt;
    }

    if (baiHoc && baiHoc.length > 2 && !/^(STT|Tuần|Tiết|Tên bài|Số tiết|Ghi chú)$/i.test(baiHoc)) {
      const hocKy: 1 | 2 = tuan <= 18 ? 1 : 2;
      lessons.push({
        id: `parsed-${autoStt}-${Date.now()}`,
        stt,
        tuan,
        hocKy,
        chuong: currentChapter,
        baiHoc: baiHoc.replace(/^[-–—\s]+/, '').trim(),
        soTiet,
      });
      autoStt++;
    }
  }

  const allTextLower = (
    file.name +
    ' ' +
    fileRawText +
    ' ' +
    rows.slice(0, 15).map((r) => (r || []).join(' ')).join(' ')
  ).toLowerCase();

  // 1. Detect Subject (Môn Toán luôn là ưu tiên số 1)
  let detectedSubject = 'Toán';
  if (options?.subject) {
    detectedSubject = options.subject;
  } else {
    const isToanInName = /toán|toan/i.test(file.name);
    const isToanInContent = /môn toán|toán học|đại số|hình học|phân phối chương trình toán/i.test(allTextLower);

    if (isToanInName || isToanInContent) {
      detectedSubject = 'Toán';
    } else if (/\bmôn\s+ngữ\s+văn\b|\bngữ\s+văn\b/i.test(allTextLower) && !allTextLower.includes('toán') && !allTextLower.includes('toan')) {
      // Chỉ khi hoàn toàn không có từ toán và có cụm từ "môn ngữ văn"
      detectedSubject = 'Ngữ văn';
    } else if (/khoa học tự nhiên|\bkhtn\b/i.test(allTextLower)) {
      detectedSubject = 'KHTN';
    } else if (/tiếng anh|\benglish\b/i.test(allTextLower)) {
      detectedSubject = 'Tiếng Anh';
    } else {
      detectedSubject = 'Toán';
    }
  }

  // 2. Detect Grade (6, 7, 8, 9, 10, 11, 12)
  let detectedGrade = '9';
  if (options?.grade) {
    detectedGrade = options.grade;
  } else {
    // Ưu tiên phát hiện khối từ tên file (ví dụ: PPCT TOAN 9 2627 -> 9)
    const fileNameGradeMatch = file.name.match(/(?:toan|toán|k|khối|lớp|grade)[_\s\-]*([6789]|10|11|12)\b/i) ||
                               file.name.match(/\b([6789]|10|11|12)\b/);
    if (fileNameGradeMatch && fileNameGradeMatch[1]) {
      detectedGrade = fileNameGradeMatch[1];
    } else {
      const textGradeMatch = allTextLower.match(/(?:khối|lớp|môn toán\s*|toán\s*)([6789]|10|11|12)\b/i);
      if (textGradeMatch && textGradeMatch[1]) {
        detectedGrade = textGradeMatch[1];
      }
    }
  }

  // 3. Detect School Name
  let detectedSchool = options?.school || 'TRƯỜNG THCS NGUYỄN DU';
  if (!options?.school) {
    const schoolRow = rows.slice(0, 8).find((r) => (r || []).some((c) => /Trường|THCS|THPT|Tiểu học/i.test(String(c))));
    if (schoolRow) {
      const matchedCell = schoolRow.find((c) => /Trường|THCS|THPT/i.test(String(c)));
      if (matchedCell) detectedSchool = String(matchedCell).trim();
    }
  }

  // 4. Detect Academic Year
  let detectedYear = options?.academicYear || '2025 - 2026';
  if (!options?.academicYear) {
    const yearMatch = allTextLower.match(/(?:năm học|nh|năm)\s*[:\-–]?\s*(\d{4}\s*[-–/]\s*\d{4})/i) ||
                      file.name.match(/(\d{4}\s*[-–/]\s*\d{4})/);
    if (yearMatch && yearMatch[1]) {
      detectedYear = yearMatch[1].replace('/', ' - ').replace('–', ' - ').replace(/\s*-\s*/, ' - ');
    }
  }

  // 5. Total Periods calculation (Toán THCS chuẩn GDPT 2018 luôn là 140 tiết)
  const sumOfPeriods = lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0);
  const totalLessons = sumOfPeriods > 0 ? (sumOfPeriods >= 130 && sumOfPeriods <= 150 ? 140 : sumOfPeriods) : 140;

  const cleanDisplayName = options?.customName || `${detectedSubject} ${detectedGrade} — ${file.name.replace(/\.[^/.]+$/, '')}`;

  return {
    id: `dataset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: cleanDisplayName,
    fileName: file.name,
    subject: detectedSubject,
    grade: detectedGrade,
    school: detectedSchool,
    academicYear: detectedYear,
    totalLessons,
    lessons: lessons.length > 0 ? lessons : [],
  };
}

/**
 * Parses pasted text for PPCT
 */
export function parsePastedPpctText(text: string): PpctLesson[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const lessons: PpctLesson[] = [];
  let currentChapter = 'Chương I';
  let autoStt = 1;

  for (const line of lines) {
    if (/^(Chương|Chủ đề|CHƯƠNG|CHỦ ĐỀ)\s+/i.test(line)) {
      currentChapter = line;
      continue;
    }

    // Split by tab, comma, or semicolon
    const parts = line.split(/[\t|;]+/).map((p) => p.trim());
    if (parts.length >= 2) {
      const stt = parseInt(parts[0], 10) || autoStt;
      const tuan = parseInt(parts[1], 10) || Math.ceil(stt / 4) || 1;
      const baiHoc = parts[2] || parts[1];
      lessons.push({
        id: `paste-${autoStt}-${Date.now()}`,
        stt,
        tuan,
        hocKy: tuan <= 18 ? 1 : 2,
        chuong: currentChapter,
        baiHoc: baiHoc || line,
      });
      autoStt++;
    } else {
      lessons.push({
        id: `paste-${autoStt}-${Date.now()}`,
        stt: autoStt,
        tuan: Math.ceil(autoStt / 4) || 1,
        hocKy: autoStt <= 18 ? 1 : 2,
        chuong: currentChapter,
        baiHoc: line,
      });
      autoStt++;
    }
  }

  return lessons;
}
