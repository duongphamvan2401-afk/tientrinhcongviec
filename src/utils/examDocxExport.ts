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
import { ExamPaper, MatrixConfig, MatrixRow, SpecificationRow } from '../types';
import { buildMatrixDocxElements, buildSpecificationDocxElements } from './docxExport';
import { formatPaperLatex } from './latexUtils';

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
              size: (options?.fontSize || 11) * 2,
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

function makeParagraph(
  text: string,
  options?: {
    bold?: boolean;
    italics?: boolean;
    fontSize?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
    spacingBefore?: number;
  }
) {
  const lines = (text || '').split('\n');
  const children: TextRun[] = [];

  lines.forEach((line, idx) => {
    children.push(
      new TextRun({
        text: line,
        font: 'Times New Roman',
        bold: options?.bold || false,
        italics: options?.italics || false,
        size: (options?.fontSize || 12) * 2,
        break: idx > 0 ? 1 : 0,
      })
    );
  });

  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spacingBefore || 60,
      after: options?.spacingAfter || 60,
    },
    children,
  });
}

export async function exportExamPaperToDocx(
  rawPaper: ExamPaper,
  mode: 'exam_only' | 'solutions_only' | 'full_package' = 'full_package',
  matrixConfig?: MatrixConfig,
  matrixRows?: MatrixRow[],
  specRows?: SpecificationRow[]
): Promise<void> {
  // Chuẩn hóa toàn bộ câu hỏi và đáp án sang định dạng LaTeX tương thích MathType
  const paper = formatPaperLatex(rawPaper);
  const cfg = paper.config;
  const elements: any[] = [];

  // ==========================================
  // PHẦN 1: ĐỀ KIỂM TRA HỌC SINH
  // ==========================================
  if (mode === 'exam_only' || mode === 'full_package') {
    // Header Table (Thông tin trường & đề)
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: noBorder,
              children: [
                makeParagraph(cfg.schoolName.toUpperCase(), { bold: true, align: AlignmentType.CENTER, fontSize: 11 }),
                makeParagraph(cfg.department.toUpperCase(), { bold: true, align: AlignmentType.CENTER, fontSize: 11 }),
                makeParagraph(`MÃ ĐỀ: ${cfg.examCode}`, { bold: true, align: AlignmentType.CENTER, fontSize: 12 }),
                makeParagraph('(Đề thi gồm có 02 trang)', { italics: true, align: AlignmentType.CENTER, fontSize: 10 }),
              ],
            }),
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: noBorder,
              children: [
                makeParagraph(cfg.title.toUpperCase(), { bold: true, align: AlignmentType.CENTER, fontSize: 13 }),
                makeParagraph(`MÔN: ${cfg.subject.toUpperCase()} - KHỐI ${cfg.grade}`, { bold: true, align: AlignmentType.CENTER, fontSize: 12 }),
                makeParagraph(`NĂM HỌC ${cfg.academicYear}`, { bold: true, align: AlignmentType.CENTER, fontSize: 11 }),
                makeParagraph(`Thời gian làm bài: ${cfg.durationMinutes} phút (Không kể thời gian phát đề)`, { italics: true, align: AlignmentType.CENTER, fontSize: 11 }),
              ],
            }),
          ],
        }),
      ],
    });

    elements.push(headerTable);
    elements.push(makeParagraph('', { spacingAfter: 120 }));

    // Khung thông tin học sinh & Điểm số
    const studentInfoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders,
              children: [
                makeParagraph('Họ và tên học sinh: .................................................................................', { fontSize: 11 }),
                makeParagraph('Lớp: ............................  Số báo danh (SBD): ............................................', { fontSize: 11 }),
                makeParagraph('Phòng thi số: ..............  Giám thị coi thi: ................................................', { fontSize: 11 }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders,
              children: [
                makeParagraph('ĐIỂM SỐ', { bold: true, align: AlignmentType.CENTER, fontSize: 10 }),
                makeParagraph('', { spacingBefore: 120, spacingAfter: 120 }),
              ],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              borders,
              children: [
                makeParagraph('LỜI PHÊ CỦA THẦY/CÔ', { bold: true, align: AlignmentType.CENTER, fontSize: 10 }),
                makeParagraph('', { spacingBefore: 120, spacingAfter: 120 }),
              ],
            }),
          ],
        }),
      ],
    });

    elements.push(studentInfoTable);
    elements.push(makeParagraph('', { spacingAfter: 160 }));

    // Tách các câu hỏi theo phần
    const p1 = paper.questions.filter((q) => q.section === 'part1_mcq');
    const p2 = paper.questions.filter((q) => q.section === 'part2_true_false');
    const p3 = paper.questions.filter((q) => q.section === 'part3_short_answer');
    const p4 = paper.questions.filter((q) => q.section === 'part4_essay');

    // PHẦN I
    if (p1.length > 0) {
      elements.push(
        makeParagraph(
          `PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (${(p1.length * (p1[0].score || 0.25)).toFixed(1)} điểm)`,
          { bold: true, fontSize: 12, spacingBefore: 120, spacingAfter: 60 }
        )
      );
      elements.push(
        makeParagraph(
          'Thí sinh trả lời từ câu 1 đến câu ' + p1.length + '. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.',
          { italics: true, fontSize: 11, spacingAfter: 80 }
        )
      );

      p1.forEach((q, idx) => {
        elements.push(
          makeParagraph(`Câu ${idx + 1}: ${q.prompt}`, { bold: true, fontSize: 11, spacingBefore: 60, spacingAfter: 40 })
        );
        if (q.options) {
          const optLine = q.options.map((o) => `${o.key}. ${o.text}`).join('       ');
          elements.push(makeParagraph(optLine, { fontSize: 11, spacingAfter: 60 }));
        }
      });
      elements.push(makeParagraph('', { spacingAfter: 100 }));
    }

    // PHẦN II
    if (p2.length > 0) {
      elements.push(
        makeParagraph(
          `PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI (${(p2.length * (p2[0].score || 1.0)).toFixed(1)} điểm)`,
          { bold: true, fontSize: 12, spacingBefore: 120, spacingAfter: 60 }
        )
      );
      elements.push(
        makeParagraph(
          'Thí sinh trả lời từ câu 1 đến câu ' +
            p2.length +
            '. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.',
          { italics: true, fontSize: 11, spacingAfter: 80 }
        )
      );

      p2.forEach((q, idx) => {
        elements.push(
          makeParagraph(`Câu ${idx + 1}: ${q.prompt}`, { bold: true, fontSize: 11, spacingBefore: 60, spacingAfter: 40 })
        );
        if (q.tfStatements) {
          q.tfStatements.forEach((st) => {
            elements.push(
              makeParagraph(`    ${st.subKey}) ${st.text}`, { fontSize: 11, spacingAfter: 30 })
            );
          });
        }
      });
      elements.push(makeParagraph('', { spacingAfter: 100 }));
    }

    // PHẦN III
    if (p3.length > 0) {
      elements.push(
        makeParagraph(
          `PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (${(p3.length * (p3[0].score || 0.5)).toFixed(1)} điểm)`,
          { bold: true, fontSize: 12, spacingBefore: 120, spacingAfter: 60 }
        )
      );
      elements.push(
        makeParagraph(
          'Thí sinh trả lời từ câu 1 đến câu ' + p3.length + '. Điền đáp số trực tiếp vào ô tương ứng.',
          { italics: true, fontSize: 11, spacingAfter: 80 }
        )
      );

      p3.forEach((q, idx) => {
        elements.push(
          makeParagraph(`Câu ${idx + 1}: ${q.prompt}`, { bold: true, fontSize: 11, spacingBefore: 60, spacingAfter: 40 })
        );
        elements.push(
          makeParagraph('    Đáp số: .................................................................................', { fontSize: 11, spacingAfter: 60 })
        );
      });
      elements.push(makeParagraph('', { spacingAfter: 100 }));
    }

    // PHẦN IV
    if (p4.length > 0) {
      const totalTlScore = p4.reduce((acc, q) => acc + (q.score || 1.0), 0);
      elements.push(
        makeParagraph(
          `PHẦN IV. TỰ LUẬN (${totalTlScore.toFixed(1)} điểm)`,
          { bold: true, fontSize: 12, spacingBefore: 120, spacingAfter: 60 }
        )
      );
      elements.push(
        makeParagraph(
          'Thí sinh trình bày chi tiết lời giải các bài toán sau vào giấy thi.',
          { italics: true, fontSize: 11, spacingAfter: 80 }
        )
      );

      p4.forEach((q, idx) => {
        elements.push(
          makeParagraph(`Bài ${idx + 1} (${q.score || 1.0} điểm): ${q.prompt}`, {
            bold: true,
            fontSize: 11,
            spacingBefore: 60,
            spacingAfter: 60,
          })
        );
      });
    }

    elements.push(makeParagraph('---------- HẾT ----------', { bold: true, align: AlignmentType.CENTER, spacingBefore: 160, spacingAfter: 200 }));
    elements.push(makeParagraph('Cán bộ coi thi không giải thích gì thêm.', { italics: true, align: AlignmentType.CENTER, fontSize: 10 }));
  }

  // ==========================================
  // PHẦN 2: ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT
  // ==========================================
  if (mode === 'solutions_only' || mode === 'full_package') {
    elements.push(makeParagraph('', { spacingBefore: 300 }));
    elements.push(
      makeParagraph(`HƯỚNG DẪN CHẤM & ĐÁP ÁN ĐỀ KIỂM TRA MÃ ${cfg.examCode}`, {
        bold: true,
        align: AlignmentType.CENTER,
        fontSize: 14,
        spacingBefore: 100,
        spacingAfter: 60,
      })
    );
    elements.push(
      makeParagraph(`MÔN: ${cfg.subject.toUpperCase()} - KHỐI ${cfg.grade} — NĂM HỌC ${cfg.academicYear}`, {
        bold: true,
        align: AlignmentType.CENTER,
        fontSize: 12,
        spacingAfter: 140,
      })
    );

    const p1 = paper.questions.filter((q) => q.section === 'part1_mcq');
    const p2 = paper.questions.filter((q) => q.section === 'part2_true_false');
    const p3 = paper.questions.filter((q) => q.section === 'part3_short_answer');
    const p4 = paper.questions.filter((q) => q.section === 'part4_essay');

    // Bảng đáp án Phần I
    if (p1.length > 0) {
      elements.push(makeParagraph('1. ĐÁP ÁN PHẦN I (Mỗi câu đúng được 0.25 điểm):', { bold: true, fontSize: 11, spacingAfter: 60 }));
      
      const chunk = 6;
      const rows: TableRow[] = [];
      for (let i = 0; i < p1.length; i += chunk) {
        const slice = p1.slice(i, i + chunk);
        const qCells = slice.map((q, sIdx) => makeCell(`Câu ${i + sIdx + 1}`, { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }));
        const ansCells = slice.map((q) => makeCell(q.correctOption || 'A', { bold: true, fontSize: 11 }));

        while (qCells.length < chunk) {
          qCells.push(makeCell('', {}));
          ansCells.push(makeCell('', {}));
        }

        rows.push(new TableRow({ children: qCells }));
        rows.push(new TableRow({ children: ansCells }));
      }

      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders,
          rows,
        })
      );
      elements.push(makeParagraph('', { spacingAfter: 120 }));
    }

    // Bảng đáp án Phần II
    if (p2.length > 0) {
      elements.push(makeParagraph('2. ĐÁP ÁN PHẦN II - TRẮC NGHIỆM ĐÚNG SAI:', { bold: true, fontSize: 11, spacingAfter: 60 }));
      elements.push(
        makeParagraph(
          'Quy tắc tính điểm từng câu: Đúng 1 ý: 0.1 điểm; Đúng 2 ý: 0.25 điểm; Đúng 3 ý: 0.5 điểm; Đúng cả 4 ý: 1.0 điểm.',
          { italics: true, fontSize: 10, spacingAfter: 60 }
        )
      );

      const tfRows: TableRow[] = [
        new TableRow({
          children: [
            makeCell('Câu', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Lệnh a)', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Lệnh b)', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Lệnh c)', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Lệnh d)', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Hướng dẫn chi tiết', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
          ],
        }),
      ];

      p2.forEach((q, idx) => {
        const a = q.tfStatements?.find((s) => s.subKey === 'a')?.isCorrect ? 'Đúng' : 'Sai';
        const b = q.tfStatements?.find((s) => s.subKey === 'b')?.isCorrect ? 'Đúng' : 'Sai';
        const c = q.tfStatements?.find((s) => s.subKey === 'c')?.isCorrect ? 'Đúng' : 'Sai';
        const d = q.tfStatements?.find((s) => s.subKey === 'd')?.isCorrect ? 'Đúng' : 'Sai';

        tfRows.push(
          new TableRow({
            children: [
              makeCell(`Câu ${idx + 1}`, { bold: true, fontSize: 10 }),
              makeCell(a, { bold: a === 'Đúng', fontSize: 10 }),
              makeCell(b, { bold: b === 'Đúng', fontSize: 10 }),
              makeCell(c, { bold: c === 'Đúng', fontSize: 10 }),
              makeCell(d, { bold: d === 'Đúng', fontSize: 10 }),
              makeCell(q.solutionExplanation || 'Theo lý thuyết SGK', { align: AlignmentType.LEFT, fontSize: 9.5 }),
            ],
          })
        );
      });

      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders,
          rows: tfRows,
        })
      );
      elements.push(makeParagraph('', { spacingAfter: 120 }));
    }

    // Bảng đáp án Phần III
    if (p3.length > 0) {
      elements.push(makeParagraph('3. ĐÁP ÁN PHẦN III - TRẢ LỜI NGẮN (Mỗi câu 0.5 điểm):', { bold: true, fontSize: 11, spacingAfter: 60 }));

      const shortRows: TableRow[] = [
        new TableRow({
          children: [
            makeCell('Câu', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Đáp số chuẩn', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Hướng dẫn giải vắn tắt', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
          ],
        }),
      ];

      p3.forEach((q, idx) => {
        shortRows.push(
          new TableRow({
            children: [
              makeCell(`Câu ${idx + 1}`, { bold: true, fontSize: 10 }),
              makeCell(q.shortAnswerText || '---', { bold: true, fontSize: 11 }),
              makeCell(q.solutionExplanation || 'Tính theo công thức SGK', { align: AlignmentType.LEFT, fontSize: 9.5 }),
            ],
          })
        );
      });

      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders,
          rows: shortRows,
        })
      );
      elements.push(makeParagraph('', { spacingAfter: 120 }));
    }

    // Barem chấm Phần IV Tự luận
    if (p4.length > 0) {
      elements.push(makeParagraph('4. HƯỚNG DẪN CHẤM PHẦN IV - TỰ LUẬN:', { bold: true, fontSize: 11, spacingAfter: 60 }));

      const essayRows: TableRow[] = [
        new TableRow({
          children: [
            makeCell('Bài', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Nội dung đáp án & Các bước biến đổi sư phạm', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
            makeCell('Điểm', { bold: true, fontSize: 10, shadingColor: 'E2E8F0' }),
          ],
        }),
      ];

      p4.forEach((q, idx) => {
        if (q.essayGradingSteps && q.essayGradingSteps.length > 0) {
          q.essayGradingSteps.forEach((step, sIdx) => {
            essayRows.push(
              new TableRow({
                children: [
                  sIdx === 0
                    ? makeCell(`Bài ${idx + 1}\n(${q.score}đ)`, { bold: true, fontSize: 10, rowSpan: q.essayGradingSteps?.length })
                    : undefined as any,
                  makeCell(step.step, { align: AlignmentType.LEFT, fontSize: 10 }),
                  makeCell(step.point.toFixed(2), { bold: true, fontSize: 10 }),
                ].filter(Boolean),
              })
            );
          });
        } else {
          essayRows.push(
            new TableRow({
              children: [
                makeCell(`Bài ${idx + 1}`, { bold: true, fontSize: 10 }),
                makeCell(q.solutionExplanation || 'Trình bày đầy đủ các bước giải.', { align: AlignmentType.LEFT, fontSize: 10 }),
                makeCell((q.score || 1.0).toFixed(2), { bold: true, fontSize: 10 }),
              ],
            })
          );
        }
      });

      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders,
          rows: essayRows,
        })
      );
    }
  }

  // Hướng dẫn giáo viên sử dụng MathType trong Microsoft Word
  elements.push(makeParagraph('', { spacingAfter: 180 }));
  elements.push(
    makeParagraph(
      '📌 HƯỚNG DẪN SỬ DỤNG VỚI MATHTYPE TRONG MICROSOFT WORD:\n' +
      '• Toàn bộ các công thức toán học trong tài liệu này được lưu trữ theo chuẩn mã LaTeX ($...$).\n' +
      '• Để chuyển đổi tự động sang công thức MathType tương tác: Mở file Word > Quét chọn văn bản (hoặc nhấn Ctrl+A) > Nhấn tổ hợp phím [Alt + \\] (hoặc chọn thẻ MathType trên thanh công cụ Word > bấm "Toggle TeX" hoặc "Convert Equations").\n' +
      '• MathType sẽ tự động nhận diện tất cả ký hiệu $...$ và chuyển thành công thức MathType chuẩn sắc nét để in ấn và biên soạn.',
      {
        italics: true,
        fontSize: 9.5,
        spacingBefore: 120,
        spacingAfter: 60,
      }
    )
  );

  // Tạo và đóng gói tài liệu Word
  const sections: any[] = [
    {
      properties: {
        page: {
          margin: {
            top: 1134, // ~2cm
            bottom: 1134,
            left: 1417, // ~2.5cm
            right: 1134,
          },
          size: {
            orientation: PageOrientation.PORTRAIT,
          },
        },
      },
      children: elements,
    },
  ];

  // Nếu chọn "Trọn bộ hồ sơ đề kiểm tra", đính kèm Phụ lục I (Ma trận) và Phụ lục II (Bảng đặc tả)
  if (mode === 'full_package' && matrixConfig && matrixRows && matrixRows.length > 0) {
    sections.push({
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
          size: { orientation: PageOrientation.LANDSCAPE },
        },
      },
      children: buildMatrixDocxElements(matrixConfig, matrixRows),
    });

    if (specRows && specRows.length > 0) {
      sections.push({
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
            size: { orientation: PageOrientation.LANDSCAPE },
          },
        },
        children: buildSpecificationDocxElements(matrixConfig, specRows),
      });
    }
  }

  const doc = new Document({ sections });

  const blob = await Packer.toBlob(doc);
  const prefix =
    mode === 'exam_only'
      ? 'De_Kiem_Tra'
      : mode === 'solutions_only'
      ? 'Dap_An_Barem'
      : 'Ho_So_Kiem_Tra_Tron_Bo';
  const fileName = `${prefix}_${cfg.subject}_K${cfg.grade}_MaDe${cfg.examCode}.docx`;
  saveAs(blob, fileName);
}
