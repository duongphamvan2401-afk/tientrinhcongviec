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
import { LessonPlan } from '../types';

const singleBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '444444',
};

const cellBorders = {
  top: singleBorder,
  bottom: singleBorder,
  left: singleBorder,
  right: singleBorder,
};

function p(
  text: string,
  options?: {
    bold?: boolean;
    italics?: boolean;
    size?: number; // pt (default 13)
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spaceBefore?: number;
    spaceAfter?: number;
  }
): Paragraph {
  const ptSize = options?.size || 13;
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spaceBefore ?? 60,
      after: options?.spaceAfter ?? 60,
      line: 276, // 1.15 line spacing
    },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        bold: options?.bold || false,
        italics: options?.italics || false,
        size: ptSize * 2,
      }),
    ],
  });
}

function pRich(
  runs: { text: string; bold?: boolean; italics?: boolean; size?: number }[],
  options?: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spaceBefore?: number;
    spaceAfter?: number;
  }
): Paragraph {
  return new Paragraph({
    alignment: options?.align || AlignmentType.LEFT,
    spacing: {
      before: options?.spaceBefore ?? 60,
      after: options?.spaceAfter ?? 60,
      line: 276,
    },
    children: runs.map(
      (r) =>
        new TextRun({
          text: r.text,
          font: 'Times New Roman',
          bold: r.bold || false,
          italics: r.italics || false,
          size: (r.size || 13) * 2,
        })
    ),
  });
}

/**
 * Xuất Kế hoạch bài dạy ra file Word (.docx) chuẩn cấu trúc Công văn 5512/BGDĐT-GDTrH của Bộ GD&ĐT
 */
export async function exportLessonPlanToDocx(plan: LessonPlan) {
  const elements: (Paragraph | Table)[] = [];

  // 1. Tiêu đề Phụ lục IV theo đúng Công văn số 5512/BGDĐT-GDTrH
  elements.push(
    p('Phụ lục IV', {
      bold: true,
      size: 13,
      align: AlignmentType.CENTER,
      spaceBefore: 60,
      spaceAfter: 20,
    })
  );
  elements.push(
    p('KHUNG KẾ HOẠCH BÀI DẠY', {
      bold: true,
      size: 14,
      align: AlignmentType.CENTER,
      spaceBefore: 20,
      spaceAfter: 20,
    })
  );
  elements.push(
    p('(Kèm theo Công văn số 5512/BGDĐT-GDTrH ngày 18 tháng 12 năm 2020 của Bộ GDĐT)', {
      italics: true,
      size: 11,
      align: AlignmentType.CENTER,
      spaceBefore: 20,
      spaceAfter: 80,
    })
  );

  // Bảng thông tin Trường / Tổ và Họ tên giáo viên
  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: '888888' },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '888888' },
        left: { style: BorderStyle.SINGLE, size: 6, color: '888888' },
        right: { style: BorderStyle.SINGLE, size: 6, color: '888888' },
        insideVertical: { style: BorderStyle.SINGLE, size: 6, color: '888888' },
        insideHorizontal: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                pRich([
                  { text: 'Trường: ', bold: true, size: 12 },
                  { text: plan.schoolName || 'THCS Lê Quý Đôn', size: 12 },
                ], { spaceBefore: 40, spaceAfter: 20 }),
                pRich([
                  { text: 'Tổ: ', bold: true, size: 12 },
                  { text: 'Toán - Tin học', size: 12 },
                ], { spaceBefore: 20, spaceAfter: 40 }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                pRich([
                  { text: 'Họ và tên giáo viên: ', bold: true, size: 12 },
                  { text: plan.teacherName || 'Nguyễn Văn Trọng', size: 12 },
                ], { spaceBefore: 40, spaceAfter: 20 }),
                pRich([
                  { text: 'Năm học: ', italics: true, size: 11 },
                  { text: plan.academicYear || '2026 - 2027', italics: true, size: 11 },
                ], { spaceBefore: 20, spaceAfter: 40 }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  elements.push(p('', { spaceAfter: 80 }));

  // 2. Tiêu đề KHBD
  elements.push(
    p(`TÊN BÀI DẠY: ${plan.lessonTitle.replace(/^BÀI\s+\d+[:.]?\s*/i, '').toUpperCase()}`, {
      bold: true,
      size: 14,
      align: AlignmentType.CENTER,
      spaceBefore: 60,
      spaceAfter: 40,
    })
  );

  elements.push(
    p(`Môn học/Hoạt động giáo dục: ${plan.subject.toUpperCase()}; lớp: ${plan.grade}`, {
      bold: true,
      size: 13,
      align: AlignmentType.CENTER,
      spaceAfter: 40,
    })
  );

  elements.push(
    p(`Thời gian thực hiện: ${plan.periods} tiết (${plan.periodRangeText || `Tiết 1 - ${plan.periods}`})`, {
      italics: true,
      size: 12,
      align: AlignmentType.CENTER,
      spaceAfter: 160,
    })
  );

  // Ghi chú nếu là file liên kết ngoài
  if (plan.sourceType === 'external_link' && plan.externalLink) {
    elements.push(
      pRich(
        [
          { text: '• Liên kết tài liệu trực tuyến (Drive/OneDrive): ', bold: true, size: 11 },
          { text: plan.externalLink, italics: true, size: 11 },
        ],
        { spaceAfter: 120 }
      )
    );
  }

  // 3. I. MỤC TIÊU
  elements.push(p('I. Mục tiêu', { bold: true, size: 13.5, spaceBefore: 120, spaceAfter: 60 }));

  // 1. Kiến thức
  elements.push(p('1. Về kiến thức:', { bold: true, size: 13, spaceBefore: 40, spaceAfter: 30 }));
  elements.push(
    p('Nêu cụ thể nội dung kiến thức học sinh cần học trong bài theo yêu cầu cần đạt của nội dung giáo dục/chủ đề tương ứng trong chương trình môn học:', {
      italics: true,
      size: 11.5,
      spaceBefore: 20,
      spaceAfter: 20,
    })
  );
  (plan.objectives?.knowledge || []).forEach((item) => {
    elements.push(p(`- ${item}`, { size: 13, spaceBefore: 20, spaceAfter: 20 }));
  });

  // 2. Năng lực
  elements.push(p('2. Về năng lực:', { bold: true, size: 13, spaceBefore: 60, spaceAfter: 30 }));
  elements.push(
    p('Nêu cụ thể yêu cầu học sinh làm được gì (biểu hiện cụ thể của năng lực chung và năng lực đặc thù môn học cần phát triển) trong hoạt động học để chiếm lĩnh và vận dụng kiến thức:', {
      italics: true,
      size: 11.5,
      spaceBefore: 20,
      spaceAfter: 30,
    })
  );
  
  // Bảng Năng lực vẽ viền rõ ràng
  const compChildrenGeneral: Paragraph[] = (plan.objectives?.generalCompetencies || []).map(
    (c) => p(`- ${c}`, { size: 11.5, spaceBefore: 20, spaceAfter: 20 })
  );
  const compChildrenSubject: Paragraph[] = (plan.objectives?.subjectCompetencies || []).map(
    (c) => p(`- ${c}`, { size: 11.5, spaceBefore: 20, spaceAfter: 20 })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: cellBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              shading: { fill: 'F2F4F7' },
              children: [p('Nhóm năng lực', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              shading: { fill: 'F2F4F7' },
              children: [p('Yêu cầu cần đạt / Biểu hiện cụ thể', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [p('a) Năng lực chung', { bold: true, size: 11.5, spaceBefore: 40, spaceAfter: 20 })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: compChildrenGeneral.length > 0 ? compChildrenGeneral : [p('(Theo quy định)', { size: 11.5 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [p('b) Năng lực đặc thù (Toán)', { bold: true, size: 11.5, spaceBefore: 40, spaceAfter: 20 })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: compChildrenSubject.length > 0 ? compChildrenSubject : [p('(Theo quy định)', { size: 11.5 })],
            }),
          ],
        }),
      ],
    })
  );

  // 3. Phẩm chất
  elements.push(p('3. Về phẩm chất:', { bold: true, size: 13, spaceBefore: 60, spaceAfter: 30 }));
  elements.push(
    p('Nêu cụ thể yêu cầu về hành vi, thái độ (biểu hiện cụ thể của phẩm chất cần phát triển gắn với nội dung bài dạy) của học sinh trong quá trình thực hiện nhiệm vụ học tập và vận dụng kiến thức vào cuộc sống:', {
      italics: true,
      size: 11.5,
      spaceBefore: 20,
      spaceAfter: 20,
    })
  );
  (plan.objectives?.qualities || []).forEach((item) => {
    elements.push(p(`- ${item}`, { size: 13, spaceBefore: 20, spaceAfter: 20 }));
  });

  // 4. II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
  elements.push(p('II. Thiết bị dạy học và học liệu', { bold: true, size: 13.5, spaceBefore: 160, spaceAfter: 40 }));
  elements.push(
    p('Nêu cụ thể các thiết bị dạy học và học liệu được sử dụng trong bài dạy để tổ chức cho học sinh hoạt động nhằm đạt được mục tiêu, yêu cầu của bài dạy:', {
      italics: true,
      size: 11.5,
      spaceBefore: 20,
      spaceAfter: 40,
    })
  );

  // Bảng Thiết bị dạy học và học liệu vẽ viền rõ ràng
  const teacherMatRuns: Paragraph[] = (plan.equipmentAndMaterials?.teacher || []).map(
    (t) => p(`- ${t}`, { size: 11.5, spaceBefore: 20, spaceAfter: 20 })
  );
  const studentMatRuns: Paragraph[] = (plan.equipmentAndMaterials?.students || []).map(
    (s) => p(`- ${s}`, { size: 11.5, spaceBefore: 20, spaceAfter: 20 })
  );

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: cellBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              shading: { fill: 'F2F4F7' },
              children: [p('STT', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              shading: { fill: 'F2F4F7' },
              children: [p('Đối tượng', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              shading: { fill: 'F2F4F7' },
              children: [p('Thiết bị dạy học và học liệu sử dụng', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [p('1', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [p('Giáo viên (GV)', { bold: true, size: 11.5, spaceBefore: 20, spaceAfter: 20 })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: teacherMatRuns,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [p('2', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [p('Học sinh (HS)', { bold: true, size: 11.5, spaceBefore: 20, spaceAfter: 20 })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: studentMatRuns,
            }),
          ],
        }),
      ],
    })
  );

  // 5. III. TIẾN TRÌNH DẠY HỌC
  elements.push(p('III. Tiến trình dạy học', { bold: true, size: 13.5, spaceBefore: 160, spaceAfter: 80 }));

  // Duyệt qua từng hoạt động (Hoạt động 1 -> Hoạt động 4)
  (plan.activities || []).forEach((act) => {
    elements.push(
      pRich(
        [
          { text: `${act.name.toUpperCase()}`, bold: true, size: 13 },
          { text: act.timeEstimate ? ` (Khoảng ${act.timeEstimate})` : '', italics: true, size: 12 },
        ],
        { spaceBefore: 120, spaceAfter: 40 }
      )
    );

    // a) Mục tiêu
    elements.push(
      pRich(
        [
          { text: 'a) Mục tiêu: ', bold: true, size: 13 },
          { text: act.objective, size: 13 },
        ],
        { spaceBefore: 20, spaceAfter: 20 }
      )
    );

    // b) Nội dung
    elements.push(
      pRich(
        [
          { text: 'b) Nội dung: ', bold: true, size: 13 },
          { text: act.content, size: 13 },
        ],
        { spaceBefore: 20, spaceAfter: 20 }
      )
    );

    // c) Sản phẩm
    elements.push(
      pRich(
        [
          { text: 'c) Sản phẩm: ', bold: true, size: 13 },
          { text: act.product, size: 13 },
        ],
        { spaceBefore: 20, spaceAfter: 40 }
      )
    );

    // d) Tổ chức thực hiện
    elements.push(p('d) Tổ chức thực hiện:', { bold: true, size: 13, spaceBefore: 40, spaceAfter: 40 }));

    // Bảng 4 bước tổ chức thực hiện chuẩn CV 5512
    const stepRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            shading: { fill: 'F2F4F7' },
            children: [p('HOẠT ĐỘNG CỦA GIÁO VIÊN', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            shading: { fill: 'F2F4F7' },
            children: [p('HOẠT ĐỘNG CỦA HỌC SINH', { bold: true, size: 11.5, align: AlignmentType.CENTER })],
          }),
        ],
      }),
    ];

    (act.organizationSteps || []).forEach((st) => {
      stepRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                p(st.stepName, { bold: true, size: 11.5, spaceBefore: 40, spaceAfter: 20 }),
                p(st.teacherAction, { size: 11.5, spaceBefore: 20, spaceAfter: 40 }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                p(' ', { size: 11.5, spaceBefore: 40, spaceAfter: 20 }),
                p(st.studentAction, { size: 11.5, spaceBefore: 20, spaceAfter: 40 }),
              ],
            }),
          ],
        })
      );
    });

    elements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: stepRows,
      })
    );

    elements.push(p('', { spaceAfter: 60 }));
  });

  // 6. IV. PHỤ LỤC / PHIẾU HỌC TẬP
  if (plan.appendix?.worksheets && plan.appendix.worksheets.length > 0) {
    elements.push(p('IV. HỒ SƠ DẠY HỌC VÀ PHỤ LỤC', { bold: true, size: 13.5, spaceBefore: 160, spaceAfter: 60 }));

    plan.appendix.worksheets.forEach((ws, idx) => {
      elements.push(p(`${idx + 1}. ${ws.title}`, { bold: true, size: 12.5, spaceBefore: 40, spaceAfter: 20 }));
      const wsLines = ws.content.split('\n');
      wsLines.forEach((line) => {
        elements.push(p(line, { size: 12, italics: true, spaceBefore: 20, spaceAfter: 20 }));
      });
    });

    if (plan.appendix.rubrics) {
      elements.push(p('2. Tiêu chí đánh giá hoạt động học tập (Rubric):', { bold: true, size: 12.5, spaceBefore: 40, spaceAfter: 20 }));
      elements.push(p(plan.appendix.rubrics, { size: 12, spaceBefore: 20, spaceAfter: 20 }));
    }
  }

  // Ghi chú hướng dẫn thực hiện theo Công văn số 5512/BGDĐT-GDTrH
  elements.push(
    p('Ghi chú hướng dẫn thực hiện theo Công văn số 5512/BGDĐT-GDTrH:', {
      bold: true,
      italics: true,
      size: 11.5,
      spaceBefore: 160,
      spaceAfter: 30,
    })
  );
  elements.push(
    p(
      '1. Mỗi bài dạy có thể được thực hiện trong nhiều tiết học, bảo đảm đủ thời gian dành cho mỗi hoạt động để học sinh thực hiện hiệu quả. Hệ thống câu hỏi, bài tập luyện tập cần bảo đảm yêu cầu tối thiểu về số lượng và đủ về thể loại theo yêu cầu phát triển các kĩ năng. Hoạt động vận dụng được thực hiện đối với những bài hoặc nhóm bài có nội dung phù hợp và chủ yếu được giao cho học sinh thực hiện ở ngoài lớp học.',
      { size: 10.5, italics: true, spaceBefore: 20, spaceAfter: 20 }
    )
  );
  elements.push(
    p(
      '2. Trong Kế hoạch bài dạy không cần nêu cụ thể lời nói của giáo viên, học sinh mà tập trung mô tả rõ hoạt động cụ thể của giáo viên: giáo viên giao nhiệm vụ/yêu cầu/quan sát/theo dõi/hướng dẫn/nhận xét/gợi ý/kiểm tra/đánh giá; học sinh thực hiện/đọc/nghe/nhìn/viết/trình bày/báo cáo/thí nghiệm/thực hành.',
      { size: 10.5, italics: true, spaceBefore: 20, spaceAfter: 20 }
    )
  );
  elements.push(
    p(
      '3. Việc kiểm tra, đánh giá thường xuyên được thực hiện trong quá trình tổ chức các hoạt động học và được thiết kế trong Kế hoạch bài dạy thông qua các hình thức: hỏi - đáp, viết, thực hành, thí nghiệm, thuyết trình, sản phẩm học tập.',
      { size: 10.5, italics: true, spaceBefore: 20, spaceAfter: 20 }
    )
  );
  elements.push(
    p(
      '4. Các bước tổ chức thực hiện một hoạt động học: Giao nhiệm vụ học tập; Thực hiện nhiệm vụ (học sinh thực hiện; giáo viên theo dõi, hỗ trợ); Báo cáo, thảo luận (giáo viên tổ chức, điều hành; học sinh báo cáo, thảo luận); Kết luận, nhận định (giáo viên chốt kiến thức).',
      { size: 10.5, italics: true, spaceBefore: 20, spaceAfter: 40 }
    )
  );

  // 7. Chữ ký phê duyệt cuối trang
  elements.push(p('', { spaceBefore: 180, spaceAfter: 60 }));

  elements.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                p('DUYỆT CỦA TỔ TRƯỞNG CHUYÊN MÔN', {
                  bold: true,
                  size: 11.5,
                  align: AlignmentType.CENTER,
                }),
                p('(Ký và ghi rõ họ tên)', {
                  italics: true,
                  size: 10.5,
                  align: AlignmentType.CENTER,
                }),
                p('', { spaceBefore: 500 }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                p(`..., ngày ..... tháng ..... năm 2026`, {
                  italics: true,
                  size: 11,
                  align: AlignmentType.CENTER,
                }),
                p('GIÁO VIÊN SOẠN THẢO', {
                  bold: true,
                  size: 11.5,
                  align: AlignmentType.CENTER,
                }),
                p('(Ký và ghi rõ họ tên)', {
                  italics: true,
                  size: 10.5,
                  align: AlignmentType.CENTER,
                }),
                p('', { spaceBefore: 500 }),
                p(plan.teacherName || 'Nguyễn Văn Trọng', {
                  bold: true,
                  size: 11.5,
                  align: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 }, // Lề chuẩn: trên 2cm, dưới 2cm, trái 2.5cm, phải 2cm
          },
        },
        children: elements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = plan.lessonTitle.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_').substring(0, 40);
  const fileName = `KHBD_${cleanName}_Lop${plan.grade}.docx`;
  saveAs(blob, fileName);
}
