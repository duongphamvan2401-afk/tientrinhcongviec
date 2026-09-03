import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  PageOrientation,
  BorderStyle,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
import { MatrixConfig, MatrixRow, SpecificationRow, TopicPointCalc } from '../types';
import { calculateTopicPointSummary, getMatrixRow19Values } from './dateCalculations';

const border = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '000000',
};

const borders = {
  top: border,
  bottom: border,
  left: border,
  right: border,
};

const noBorder = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

function makeCell(
  text: string | number,
  options?: {
    bold?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    colSpan?: number;
    rowSpan?: number;
    fontSize?: number;
    italics?: boolean;
    shadingColor?: string;
  }
) {
  const str = text !== undefined && text !== null ? text.toString() : '';
  const lines = str.split('\n');

  return new TableCell({
    children: lines.map(
      (line) =>
        new Paragraph({
          alignment: options?.align || AlignmentType.CENTER,
          children: [
            new TextRun({
              text: line,
              font: 'Times New Roman',
              bold: options?.bold || false,
              italics: options?.italics || false,
              size: (options?.fontSize || 9.5) * 2,
            }),
          ],
        })
    ),
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: options?.colSpan,
    rowSpan: options?.rowSpan,
    borders,
    shading: options?.shadingColor ? { fill: options.shadingColor } : undefined,
  });
}

export function buildMatrixDocxElements(config: MatrixConfig, rows: MatrixRow[]) {
  // Aggregate calculations across 19 columns
  let sumNlcBiet = 0;
  let sumNlcHieu = 0;
  let sumNlcVanDung = 0;

  let sumDsBiet = 0;
  let sumDsHieu = 0;
  let sumDsVanDung = 0;

  let sumTlnBiet = 0;
  let sumTlnHieu = 0;
  let sumTlnVanDung = 0;

  let sumTlBiet = 0;
  let sumTlHieu = 0;
  let sumTlVanDung = 0;

  let grandScore = 0;

  rows.forEach((r) => {
    const vals = getMatrixRow19Values(r);
    sumNlcBiet += vals.nlc.biet;
    sumNlcHieu += vals.nlc.hieu;
    sumNlcVanDung += vals.nlc.vanDung;

    sumDsBiet += vals.ds.biet;
    sumDsHieu += vals.ds.hieu;
    sumDsVanDung += vals.ds.vanDung;

    sumTlnBiet += vals.tln.biet;
    sumTlnHieu += vals.tln.hieu;
    sumTlnVanDung += vals.tln.vanDung;

    sumTlBiet += vals.tl.biet;
    sumTlHieu += vals.tl.hieu;
    sumTlVanDung += vals.tl.vanDung;

    grandScore += vals.score;
  });

  const sumTotalBiet = sumNlcBiet + sumDsBiet + sumTlnBiet + sumTlBiet;
  const sumTotalHieu = sumNlcHieu + sumDsHieu + sumTlnHieu + sumTlHieu;
  const sumTotalVanDung = sumNlcVanDung + sumDsVanDung + sumTlnVanDung + sumTlVanDung;

  const totalNlcQuestions = sumNlcBiet + sumNlcHieu + sumNlcVanDung;
  const totalDsQuestions = sumDsBiet + sumDsHieu + sumDsVanDung;
  const totalTlnQuestions = sumTlnBiet + sumTlnHieu + sumTlnVanDung;
  const totalTlQuestions = sumTlBiet + sumTlHieu + sumTlVanDung;
  const grandTotalQuestions = totalNlcQuestions + totalDsQuestions + totalTlnQuestions + totalTlQuestions;

  // Scores
  const scoreNlc = +(totalNlcQuestions * 0.25).toFixed(2);
  const scoreDs = +(totalDsQuestions * 1.0).toFixed(2);
  const scoreTln = +(totalTlnQuestions * 0.5).toFixed(2);
  const scoreTl = +(totalTlQuestions * 1.0).toFixed(2);

  const scoreBiet = +(sumNlcBiet * 0.25 + sumDsBiet * 1.0 + sumTlnBiet * 0.5 + sumTlBiet * 1.0).toFixed(2);
  const scoreHieu = +(sumNlcHieu * 0.25 + sumDsHieu * 1.0 + sumTlnHieu * 0.5 + sumTlHieu * 1.0).toFixed(2);
  const scoreVanDung = +(sumNlcVanDung * 0.25 + sumDsVanDung * 1.0 + sumTlnVanDung * 0.5 + sumTlVanDung * 1.0).toFixed(2);

  const pctNlc = Math.round((scoreNlc / (grandScore || 10)) * 100);
  const pctDs = Math.round((scoreDs / (grandScore || 10)) * 100);
  const pctTln = Math.round((scoreTln / (grandScore || 10)) * 100);
  const pctTl = Math.round((scoreTl / (grandScore || 10)) * 100);

  const pctBiet = Math.round((scoreBiet / (grandScore || 10)) * 100);
  const pctHieu = Math.round((scoreHieu / (grandScore || 10)) * 100);
  const pctVanDung = Math.round((scoreVanDung / (grandScore || 10)) * 100);

  // Group rows by chapter
  const groupedByChapter = new Map<string, MatrixRow[]>();
  rows.forEach((r) => {
    if (!groupedByChapter.has(r.chuong)) {
      groupedByChapter.set(r.chuong, []);
    }
    groupedByChapter.get(r.chuong)!.push(r);
  });

  // Build matrix table rows
  const matrixTableRows: TableRow[] = [
    // Header Tier 1
    new TableRow({
      children: [
        makeCell('TT', { bold: true, rowSpan: 4, fontSize: 8 }),
        makeCell('Chủ đề', { bold: true, rowSpan: 4, fontSize: 8.5 }),
        makeCell('Nội dung/Đơn vị kiến thức', { bold: true, rowSpan: 4, fontSize: 8.5 }),
        makeCell('Mức độ đánh giá', { bold: true, colSpan: 12, fontSize: 8.5, shadingColor: 'E2E8F0' }),
        makeCell('Tổng', { bold: true, colSpan: 3, fontSize: 8.5, shadingColor: 'E2E8F0' }),
        makeCell('Tỉ lệ % điểm\n(Điểm)', { bold: true, rowSpan: 4, fontSize: 8 }),
      ],
    }),
    // Header Tier 2
    new TableRow({
      children: [
        makeCell('TNKQ', { bold: true, colSpan: 9, fontSize: 8, shadingColor: 'EFF6FF' }),
        makeCell('Tự luận', { bold: true, colSpan: 3, fontSize: 8, shadingColor: 'FAF5FF' }),
        makeCell('Số câu theo mức độ', { bold: true, colSpan: 3, fontSize: 7.5 }),
      ],
    }),
    // Header Tier 3
    new TableRow({
      children: [
        makeCell('Nhiều lựa chọn', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('“Đúng - sai”', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('Trả lời ngắn', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('Tự luận', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('Biết', { bold: true, rowSpan: 2, fontSize: 7.5 }),
        makeCell('Hiểu', { bold: true, rowSpan: 2, fontSize: 7.5 }),
        makeCell('Vận dụng', { bold: true, rowSpan: 2, fontSize: 7.5 }),
      ],
    }),
    // Header Tier 4
    new TableRow({
      children: [
        // Nhiều lựa chọn
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
        // Đúng sai
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
        // Trả lời ngắn
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
        // Tự luận
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
      ],
    }),
  ];

  // Data rows grouped by chapter
  let topicIndex = 1;
  groupedByChapter.forEach((chapterRows, chapterName) => {
    chapterRows.forEach((r, idx) => {
      const vals = getMatrixRow19Values(r);
      const isFirstOfChapter = idx === 0;
      const cells: TableCell[] = [];

      if (isFirstOfChapter) {
        cells.push(
          makeCell(topicIndex.toString(), {
            rowSpan: chapterRows.length,
            bold: true,
            fontSize: 8,
          })
        );
        cells.push(
          makeCell(chapterName, {
            bold: true,
            rowSpan: chapterRows.length,
            align: AlignmentType.LEFT,
            fontSize: 8,
          })
        );
      }

      cells.push(makeCell(r.noiDung, { align: AlignmentType.LEFT, fontSize: 8 }));

      // Nhiều lựa chọn
      cells.push(makeCell(vals.nlc.biet ? vals.nlc.biet.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.nlc.hieu ? vals.nlc.hieu.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.nlc.vanDung ? vals.nlc.vanDung.toString() : '', { fontSize: 8 }));

      // “Đúng - sai”
      cells.push(makeCell(vals.ds.biet ? vals.ds.biet.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.ds.hieu ? vals.ds.hieu.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.ds.vanDung ? vals.ds.vanDung.toString() : '', { fontSize: 8 }));

      // Trả lời ngắn
      cells.push(makeCell(vals.tln.biet ? vals.tln.biet.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.tln.hieu ? vals.tln.hieu.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.tln.vanDung ? vals.tln.vanDung.toString() : '', { fontSize: 8 }));

      // Tự luận
      cells.push(makeCell(vals.tl.biet ? vals.tl.biet.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.tl.hieu ? vals.tl.hieu.toString() : '', { fontSize: 8 }));
      cells.push(makeCell(vals.tl.vanDung ? vals.tl.vanDung.toString() : '', { fontSize: 8 }));

      // Tổng
      cells.push(makeCell(vals.tongBiet ? vals.tongBiet.toString() : '', { bold: true, fontSize: 8 }));
      cells.push(makeCell(vals.tongHieu ? vals.tongHieu.toString() : '', { bold: true, fontSize: 8 }));
      cells.push(makeCell(vals.tongVanDung ? vals.tongVanDung.toString() : '', { bold: true, fontSize: 8 }));

      // Tỉ lệ % điểm / Điểm
      cells.push(makeCell(vals.formattedScore, { bold: true, fontSize: 8 }));

      matrixTableRows.push(new TableRow({ children: cells }));
    });

    topicIndex++;
  });

  // Summary Row 1: Tổng số câu
  matrixTableRows.push(
    new TableRow({
      children: [
        makeCell('Tổng số câu', { bold: true, colSpan: 3, align: AlignmentType.LEFT, fontSize: 8.5 }),
        makeCell(sumNlcBiet ? sumNlcBiet.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumNlcHieu ? sumNlcHieu.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumNlcVanDung ? sumNlcVanDung.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumDsBiet ? sumDsBiet.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumDsHieu ? sumDsHieu.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumDsVanDung ? sumDsVanDung.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTlnBiet ? sumTlnBiet.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTlnHieu ? sumTlnHieu.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTlnVanDung ? sumTlnVanDung.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTlBiet ? sumTlBiet.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTlHieu ? sumTlHieu.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTlVanDung ? sumTlVanDung.toString() : '', { bold: true, fontSize: 8 }),
        makeCell(sumTotalBiet.toString(), { bold: true, fontSize: 8.5 }),
        makeCell(sumTotalHieu.toString(), { bold: true, fontSize: 8.5 }),
        makeCell(sumTotalVanDung.toString(), { bold: true, fontSize: 8.5 }),
        makeCell(`${grandTotalQuestions} câu`, { bold: true, fontSize: 8.5 }),
      ],
    })
  );

  // Summary Row 2: Tỉ lệ % điểm
  matrixTableRows.push(
    new TableRow({
      children: [
        makeCell('Tỉ lệ % điểm', { bold: true, colSpan: 3, align: AlignmentType.LEFT, fontSize: 8.5 }),
        makeCell(`${pctNlc}%`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${pctDs}%`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${pctTln}%`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${pctTl}%`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${pctBiet}%`, { bold: true, fontSize: 8 }),
        makeCell(`${pctHieu}%`, { bold: true, fontSize: 8 }),
        makeCell(`${pctVanDung}%`, { bold: true, fontSize: 8 }),
        makeCell('100%', { bold: true, fontSize: 8.5 }),
      ],
    })
  );

  // Summary Row 3: Tổng điểm
  matrixTableRows.push(
    new TableRow({
      children: [
        makeCell('Tổng điểm', { bold: true, colSpan: 3, align: AlignmentType.LEFT, fontSize: 8.5 }),
        makeCell(`${scoreNlc.toString().replace('.', ',')} điểm`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${scoreDs.toString().replace('.', ',')} điểm`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${scoreTln.toString().replace('.', ',')} điểm`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(`${scoreTl.toString().replace('.', ',')} điểm`, { bold: true, colSpan: 3, fontSize: 8 }),
        makeCell(scoreBiet.toString().replace('.', ','), { bold: true, fontSize: 8 }),
        makeCell(scoreHieu.toString().replace('.', ','), { bold: true, fontSize: 8 }),
        makeCell(scoreVanDung.toString().replace('.', ','), { bold: true, fontSize: 8 }),
        makeCell('10,0 điểm', { bold: true, fontSize: 8.5 }),
      ],
    })
  );

  // Topic calculation breakdown table
  const topicBreakdowns = calculateTopicPointSummary(rows);
  const calcTableRows: TableRow[] = [
    new TableRow({
      children: [
        makeCell('TT', { bold: true, rowSpan: 2, fontSize: 8 }),
        makeCell('Chủ đề', { bold: true, rowSpan: 2, fontSize: 8.5 }),
        makeCell('Số tiết dạy', { bold: true, rowSpan: 2, fontSize: 8.5 }),
        makeCell('Tỉ lệ % số tiết của chủ đề', { bold: true, rowSpan: 2, fontSize: 8.5 }),
        makeCell('Số điểm cho chủ đề', { bold: true, rowSpan: 2, fontSize: 8.5 }),
        makeCell('Tỉ lệ % điểm', { bold: true, rowSpan: 2, fontSize: 8.5 }),
        makeCell('Số câu hỏi ứng với từng mức độ', { bold: true, colSpan: 3, fontSize: 8.5 }),
      ],
    }),
    new TableRow({
      children: [
        makeCell('Biết', { bold: true, fontSize: 8 }),
        makeCell('Hiểu', { bold: true, fontSize: 8 }),
        makeCell('Vận dụng', { bold: true, fontSize: 8 }),
      ],
    }),
  ];

  let totalPeriodsTbl = 0;
  let totalScoreTbl = 0;
  let totalPctPeriodTbl = 0;
  let totalPctScoreTbl = 0;
  let totalBietTbl = 0;
  let totalHieuTbl = 0;
  let totalVdTbl = 0;

  topicBreakdowns.items.forEach((t) => {
    const pctPeriod = Math.round((t.periods / (topicBreakdowns.totalPeriods || 1)) * 100);
    const pctScore = Math.round((t.roundedScore / 10) * 100);
    
    // Find questions in this chapter
    const chapterRows = rows.filter((r) => r.chuong === t.topicName);
    let qBiet = 0;
    let qHieu = 0;
    let qVd = 0;
    chapterRows.forEach((r) => {
      const v = getMatrixRow19Values(r);
      qBiet += v.tongBiet;
      qHieu += v.tongHieu;
      qVd += v.tongVanDung;
    });

    totalPeriodsTbl += t.periods;
    totalScoreTbl += t.roundedScore;
    totalPctPeriodTbl += pctPeriod;
    totalPctScoreTbl += pctScore;
    totalBietTbl += qBiet;
    totalHieuTbl += qHieu;
    totalVdTbl += qVd;

    calcTableRows.push(
      new TableRow({
        children: [
          makeCell(t.topicIndex.toString(), { fontSize: 8 }),
          makeCell(t.topicName, { align: AlignmentType.LEFT, fontSize: 8 }),
          makeCell(t.periods.toString(), { fontSize: 8 }),
          makeCell(`${pctPeriod}%`, { fontSize: 8 }),
          makeCell(t.roundedScore.toFixed(1).replace('.', ','), { fontSize: 8 }),
          makeCell(`${pctScore}%`, { fontSize: 8 }),
          makeCell(qBiet ? qBiet.toString() : '—', { fontSize: 8 }),
          makeCell(qHieu ? qHieu.toString() : '—', { fontSize: 8 }),
          makeCell(qVd ? qVd.toString() : '—', { fontSize: 8 }),
        ],
      })
    );
  });

  calcTableRows.push(
    new TableRow({
      children: [
        makeCell('Tổng', { bold: true, colSpan: 2, align: AlignmentType.LEFT, fontSize: 8.5 }),
        makeCell(totalPeriodsTbl.toString(), { bold: true, fontSize: 8.5 }),
        makeCell(`${Math.round(totalPctPeriodTbl)}%`, { bold: true, fontSize: 8.5 }),
        makeCell(totalScoreTbl.toFixed(1).replace('.', ','), { bold: true, fontSize: 8.5 }),
        makeCell(`${Math.round(totalPctScoreTbl)}%`, { bold: true, fontSize: 8.5 }),
        makeCell(totalBietTbl.toString(), { bold: true, fontSize: 8.5 }),
        makeCell(totalHieuTbl.toString(), { bold: true, fontSize: 8.5 }),
        makeCell(totalVdTbl.toString(), { bold: true, fontSize: 8.5 }),
      ],
    })
  );

  return [
    // Header
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: 'Phụ lục I',
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `KHUNG MA TRẬN ĐỀ KIỂM TRA ${config.examPeriod.toUpperCase()}`,
          bold: true,
          font: 'Times New Roman',
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `MÔN HỌC: ${config.subject.toUpperCase()}, LỚP ${config.grade}, NĂM HỌC ${config.academicYear}`,
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    ...(config.officialDocumentRef?.trim()
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: config.officialDocumentRef,
                italics: true,
                font: 'Times New Roman',
                size: 20,
              }),
            ],
          }),
        ]
      : []),

    // Metadata items
    new Paragraph({
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: `- Thời điểm kiểm tra: `,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
        new TextRun({
          text: `${config.examPeriod} (Phạm vi: Tuần ${config.limitWeekFrom || 1} đến Tuần ${config.limitWeekTo}${config.limitPeriodTo ? `, đến Tiết ${config.limitPeriodTo}` : ''})`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: `- Thời gian làm bài: `,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
        new TextRun({
          text: `${config.examDuration}`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: `- Hình thức kiểm tra: `,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
        new TextRun({
          text: `Kết hợp giữa trắc nghiệm và tự luận (tỉ lệ 70% trắc nghiệm; 30% tự luận).`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: `- Cấu trúc: `,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
        new TextRun({
          text: `Mức độ nhận biết và thông hiểu 70% (7,0 điểm); Vận dụng 30% (3,0 điểm).`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),

    // Topic calculation breakdown
    new Paragraph({
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({
          text: `- Bảng tính tỉ lệ phân bổ tiết học và điểm số theo chủ đề:`,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: calcTableRows,
    }),

    // Section title: Nội dung khung ma trận
    new Paragraph({
      spacing: { before: 150, after: 80 },
      children: [
        new TextRun({
          text: `- Nội dung khung ma trận:`,
          bold: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),

    // The Matrix Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: matrixTableRows,
    }),

    // Signatures
    new Paragraph({
      spacing: { before: 200, after: 80 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `Ngày ..... tháng ..... năm 2026`,
          italics: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'BAN GIÁM HIỆU DUYỆT', bold: true, font: 'Times New Roman', size: 22 })],
                }),
              ],
              borders: noBorder,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'TỔ TRƯỞNG CHUYÊN MÔN', bold: true, font: 'Times New Roman', size: 22 })],
                }),
              ],
              borders: noBorder,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'NGƯỜI LẬP MA TRẬN', bold: true, font: 'Times New Roman', size: 22 })],
                }),
              ],
              borders: noBorder,
            }),
          ],
        }),
      ],
    }),
  ];
}

/**
 * 16-Column Specification Docx Elements
 */
export function buildSpecificationDocxElements(config: MatrixConfig, specRows: SpecificationRow[]) {
  const specTableRows: TableRow[] = [
    // Header Tier 1
    new TableRow({
      children: [
        makeCell('TT', { bold: true, rowSpan: 4, fontSize: 8 }),
        makeCell('Chủ đề', { bold: true, rowSpan: 4, fontSize: 8.5 }),
        makeCell('Nội dung kiến thức', { bold: true, rowSpan: 4, fontSize: 8.5 }),
        makeCell('Yêu cầu cần đạt', { bold: true, rowSpan: 4, fontSize: 8.5 }),
        makeCell('Số câu hỏi ở các mức độ đánh giá', { bold: true, colSpan: 12, fontSize: 8.5, shadingColor: 'E2E8F0' }),
      ],
    }),
    // Header Tier 2
    new TableRow({
      children: [
        makeCell('TNKQ', { bold: true, colSpan: 9, fontSize: 8, shadingColor: 'EFF6FF' }),
        makeCell('Tự luận', { bold: true, colSpan: 3, fontSize: 8, shadingColor: 'FAF5FF' }),
      ],
    }),
    // Header Tier 3
    new TableRow({
      children: [
        makeCell('Nhiều lựa chọn', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('“Đúng - sai”', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('Trả lời ngắn', { italics: true, colSpan: 3, fontSize: 7.5 }),
        makeCell('Tự luận', { italics: true, colSpan: 3, fontSize: 7.5 }),
      ],
    }),
    // Header Tier 4
    new TableRow({
      children: [
        // Nhiều lựa chọn
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
        // Đúng sai
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
        // Trả lời ngắn
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
        // Tự luận
        makeCell('Biết', { fontSize: 7 }),
        makeCell('Hiểu', { fontSize: 7 }),
        makeCell('Vận dụng', { fontSize: 7 }),
      ],
    }),
  ];

  specRows.forEach((row, rowIdx) => {
    const totalItems = row.items.length || 1;

    row.items.forEach((item, itemIdx) => {
      const isFirstItem = itemIdx === 0;
      const cells: TableCell[] = [];

      if (isFirstItem) {
        cells.push(
          makeCell((rowIdx + 1).toString(), {
            bold: true,
            rowSpan: totalItems,
            fontSize: 8,
          })
        );
        cells.push(
          makeCell(row.chuong, {
            bold: true,
            rowSpan: totalItems,
            align: AlignmentType.LEFT,
            fontSize: 8,
          })
        );
        cells.push(
          makeCell(row.noiDung, {
            bold: true,
            rowSpan: totalItems,
            align: AlignmentType.LEFT,
            fontSize: 8,
          })
        );
      }

      // Yêu cầu cần đạt
      const yccContent = `${item.mucDoLabel}:\n${item.yeuCauCanDat}`;
      cells.push(makeCell(yccContent, { align: AlignmentType.LEFT, fontSize: 8 }));

      // 12 question columns
      // Nhiều lựa chọn: Biết, Hiểu, Vận dụng
      cells.push(makeCell(item.nlc?.biet || '', { fontSize: 8 }));
      cells.push(makeCell(item.nlc?.hieu || '', { fontSize: 8 }));
      cells.push(makeCell(item.nlc?.vanDung || '', { fontSize: 8 }));

      // Đúng sai: Biết, Hiểu, Vận dụng
      cells.push(makeCell(item.ds?.biet || '', { fontSize: 8 }));
      cells.push(makeCell(item.ds?.hieu || '', { fontSize: 8 }));
      cells.push(makeCell(item.ds?.vanDung || '', { fontSize: 8 }));

      // Trả lời ngắn: Biết, Hiểu, Vận dụng
      cells.push(makeCell(item.tln?.biet || '', { fontSize: 8 }));
      cells.push(makeCell(item.tln?.hieu || '', { fontSize: 8 }));
      cells.push(makeCell(item.tln?.vanDung || '', { fontSize: 8 }));

      // Tự luận: Biết, Hiểu, Vận dụng
      cells.push(makeCell(item.tl?.biet || '', { fontSize: 8 }));
      cells.push(makeCell(item.tl?.hieu || '', { fontSize: 8 }));
      cells.push(makeCell(item.tl?.vanDung || '', { fontSize: 8 }));

      specTableRows.push(new TableRow({ children: cells }));
    });
  });

  return [
    // Header
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: 'Phụ lục II',
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `KHUNG BẢNG ĐẶC TẢ ĐỀ KIỂM TRA ${config.examPeriod.toUpperCase()}`,
          bold: true,
          font: 'Times New Roman',
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `MÔN HỌC: ${config.subject.toUpperCase()}, LỚP ${config.grade}, NĂM HỌC ${config.academicYear}`,
          bold: true,
          font: 'Times New Roman',
          size: 24,
        }),
      ],
    }),
    ...(config.officialDocumentRef?.trim()
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: config.officialDocumentRef,
                italics: true,
                font: 'Times New Roman',
                size: 20,
              }),
            ],
          }),
        ]
      : []),

    // Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: specTableRows,
    }),

    // Signatures
    new Paragraph({
      spacing: { before: 200, after: 80 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `Ngày ..... tháng ..... năm 2026`,
          italics: true,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'BAN GIÁM HIỆU DUYỆT', bold: true, font: 'Times New Roman', size: 22 })],
                }),
              ],
              borders: noBorder,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'TỔ TRƯỞNG CHUYÊN MÔN', bold: true, font: 'Times New Roman', size: 22 })],
                }),
              ],
              borders: noBorder,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'NGƯỜI LẬP BẢNG ĐẶC TẢ', bold: true, font: 'Times New Roman', size: 22 })],
                }),
              ],
              borders: noBorder,
            }),
          ],
        }),
      ],
    }),
  ];
}

/**
 * Xuất Khung Ma trận (Phụ lục I) (.docx)
 */
export async function exportMatrixToDocx(config: MatrixConfig, rows: MatrixRow[]) {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: buildMatrixDocxElements(config, rows),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Phu_Luc_I_Khung_Ma_Tran_${config.subject}_${config.grade}_${config.examPeriod.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, fileName);
}

/**
 * Xuất Khung Bảng đặc tả (Phụ lục II) (.docx) (Landscape for 16 columns)
 */
export async function exportSpecificationToDocx(config: MatrixConfig, specRows: SpecificationRow[]) {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: buildSpecificationDocxElements(config, specRows),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Phu_Luc_II_Bang_Dac_Ta_${config.subject}_${config.grade}_${config.examPeriod.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, fileName);
}

/**
 * Xuất Trọn bộ hồ sơ đề kiểm tra (Phụ lục I + Phụ lục II trong 1 file Word)
 */
export async function exportFullExamPackageToDocx(
  config: MatrixConfig,
  rows: MatrixRow[],
  specRows: SpecificationRow[]
) {
  const doc = new Document({
    sections: [
      // Section 1: Phụ lục I (Landscape)
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: buildMatrixDocxElements(config, rows),
      },
      // Section 2: Phụ lục II (Landscape)
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: buildSpecificationDocxElements(config, specRows),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Tron_Bo_Ma_Tran_Va_Dac_Ta_${config.subject}_${config.grade}_${config.examPeriod.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, fileName);
}
