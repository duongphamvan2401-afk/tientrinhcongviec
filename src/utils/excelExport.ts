import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatrixConfig, MatrixRow, PpctDataset, ExamEvent } from '../types';

export function exportMatrixToExcel(config: MatrixConfig, rows: MatrixRow[]) {
  const wb = XLSX.utils.book_new();

  // Build matrix data array
  const data: (string | number)[][] = [];

  // Headers
  data.push([`${config.schoolName} - ${config.department}`]);
  data.push([`KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ - MÔN ${config.subject.toUpperCase()} ${config.grade}`]);
  data.push([`Đợt: ${config.examPeriod} | Thời gian: ${config.examDuration} | Năm học: ${config.academicYear}`]);
  data.push([]);

  // Table header rows
  data.push([
    'TT',
    'Chương/Chủ đề',
    'Nội dung/Đơn vị kiến thức',
    'Nhận biết (TNKQ)',
    'Nhận biết (TL)',
    'Thông hiểu (TNKQ)',
    'Thông hiểu (TL)',
    'Vận dụng (TNKQ)',
    'Vận dụng (TL)',
    'Vận dụng cao (TNKQ)',
    'Vận dụng cao (TL)',
    'Tổng số câu',
    '% Điểm',
  ]);

  let totalTnNB = 0;
  let totalTlNB = 0;
  let totalTnTH = 0;
  let totalTlTH = 0;
  let totalTnVD = 0;
  let totalTlVD = 0;
  let totalTnVDC = 0;
  let totalTlVDC = 0;

  rows.forEach((r, idx) => {
    totalTnNB += r.nhanBiet.tn || 0;
    totalTlNB += r.nhanBiet.tl || 0;
    totalTnTH += r.thongHieu.tn || 0;
    totalTlTH += r.thongHieu.tl || 0;
    totalTnVD += r.vanDung.tn || 0;
    totalTlVD += r.vanDung.tl || 0;
    totalTnVDC += r.vanDungCao.tn || 0;
    totalTlVDC += r.vanDungCao.tl || 0;

    const rowQuestions =
      (r.nhanBiet.tn || 0) +
      (r.nhanBiet.tl || 0) +
      (r.thongHieu.tn || 0) +
      (r.thongHieu.tl || 0) +
      (r.vanDung.tn || 0) +
      (r.vanDung.tl || 0) +
      (r.vanDungCao.tn || 0) +
      (r.vanDungCao.tl || 0);

    const rowScore =
      ((r.nhanBiet.tn || 0) + (r.thongHieu.tn || 0) + (r.vanDung.tn || 0) + (r.vanDungCao.tn || 0)) *
        config.scorePerTn +
      ((r.nhanBiet.tl || 0) + (r.thongHieu.tl || 0) + (r.vanDung.tl || 0) + (r.vanDungCao.tl || 0)) *
        config.scorePerTl;

    data.push([
      idx + 1,
      r.chuong,
      r.noiDung,
      r.nhanBiet.tn || 0,
      r.nhanBiet.tl || 0,
      r.thongHieu.tn || 0,
      r.thongHieu.tl || 0,
      r.vanDung.tn || 0,
      r.vanDung.tl || 0,
      r.vanDungCao.tn || 0,
      r.vanDungCao.tl || 0,
      rowQuestions,
      `${(rowScore * 10).toFixed(0)}%`,
    ]);
  });

  const totalQuestions =
    totalTnNB + totalTlNB + totalTnTH + totalTlTH + totalTnVD + totalTlVD + totalTnVDC + totalTlVDC;

  data.push([
    'TỔNG',
    '',
    '',
    totalTnNB,
    totalTlNB,
    totalTnTH,
    totalTlTH,
    totalTnVD,
    totalTlVD,
    totalTnVDC,
    totalTlVDC,
    totalQuestions,
    '100%',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 38 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'MaTranDe');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `Ma_Tran_${config.subject}_${config.grade}_${config.examPeriod.replace(/\s+/g, '_')}.xlsx`;
  saveAs(blob, fileName);
}

export function exportPpctToExcel(ppct: PpctDataset, exams: ExamEvent[]) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: PPCT
  const ppctData: (string | number)[][] = [
    [`PHÂN PHỐI CHƯƠNG TRÌNH CHI TIẾT - ${ppct.subject.toUpperCase()} ${ppct.grade}`],
    [`Trường: ${ppct.school} | Năm học: ${ppct.academicYear} | Tổng số: ${ppct.lessons.length} tiết`],
    [],
    ['Tiết', 'Tuần', 'Học kỳ', 'Chương/Chủ đề', 'Tên bài học/Nội dung'],
  ];

  ppct.lessons.forEach((l) => {
    ppctData.push([l.stt, l.tuan, `Học kỳ ${l.hocKy === 1 ? 'I' : 'II'}`, l.chuong, l.baiHoc]);
  });

  const wsPpct = XLSX.utils.aoa_to_sheet(ppctData);
  wsPpct['!cols'] = [{ wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 36 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsPpct, 'PPCT');

  // Sheet 2: Exam Schedule
  const examData: (string | number)[][] = [
    ['KẾ HOẠCH KIỂM TRA CẢ NĂM'],
    [],
    ['Kỳ', 'Đợt kiểm tra', 'Tuần', 'Thời gian chính xác', 'Trạng thái', 'Nội dung kiểm tra gợi ý'],
  ];

  exams.forEach((e) => {
    const status = e.daysRemaining < 0 ? 'Đã qua' : `Còn ${e.daysRemaining} ngày`;
    const lessonsList = e.chapterSummaries
      .map((c) => `${c.chapter}: ${c.lessons.join('; ')}`)
      .join(' | ');
    examData.push([
      `HK ${e.term === 1 ? 'I' : 'II'}`,
      e.title,
      e.week,
      e.exactDateText,
      status,
      `${e.suggestedScope} - ${lessonsList}`,
    ]);
  });

  const wsExam = XLSX.utils.aoa_to_sheet(examData);
  wsExam['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 8 }, { wch: 36 }, { wch: 14 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsExam, 'KeHoachKiemTra');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `Ke_Hoach_PPCT_${ppct.subject}_${ppct.grade}.xlsx`;
  saveAs(blob, fileName);
}
