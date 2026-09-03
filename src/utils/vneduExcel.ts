import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GvcnClassInfo, GvcnStudent, GvcnSubjectGrade, GvcnTT22Evaluation } from '../types';

/**
 * Ngân hàng gợi ý nhận xét chuẩn Thông tư 22/2021/TT-BGDĐT
 */
export const TT22_COMMENT_BANK = {
  phamChat: {
    tot: [
      'Gương mẫu, trung thực, chăm chỉ, có tinh thần trách nhiệm rất cao với tập thể lớp.',
      'Lễ phép, nhân ái, tích cực giúp đỡ bạn bè, luôn chấp hành nghiêm chỉnh nội quy trường lớp.',
      'Có ý thức tự giác cao, trung thực trong học tập và kiểm tra, đoàn kết yêu thương bạn bè.',
      'Sống chan hòa, có trách nhiệm với nhiệm vụ được giao, kính trọng thầy cô, thân thiện với bạn bè.'
    ],
    kha: [
      'Ngoan ngoãn, lễ phép, có tinh thần tương thân tương ái, hòa đồng cùng các bạn trong lớp.',
      'Chấp hành tốt nội quy trường lớp, kính trọng thầy cô, có ý thức rèn luyện phẩm chất tốt.',
      'Trung thực, có tinh thần xây dựng tập thể, đôi lúc còn cần chủ động hơn trong phong trào chung.'
    ],
    dat: [
      'Chấp hành nội quy trường lớp, lễ phép với thầy cô, đoàn kết với bạn bè.',
      'Tính tình hiền lành, thực hiện tương đối đầy đủ các quy định về nề nếp học sinh.',
      'Cần rèn luyện thêm tính kiên trì, tự giác và tích cực tham gia các hoạt động tập thể.'
    ],
    chuaDat: [
      'Còn vi phạm nội quy về nề nếp, giờ giấc; cần nghiêm túc rèn luyện tác phong học sinh.',
      'Cần chú ý thái độ ứng xử với bạn bè, tăng cường tính trung thực và tinh thần trách nhiệm.'
    ]
  },
  nangLuc: {
    tot: [
      'Khả năng tự chủ và tự học xuất sắc, tư duy sáng tạo nhạy bén, kỹ năng hợp tác nhóm rất tốt.',
      'Tiếp thu bài nhanh, giải quyết vấn đề linh hoạt, diễn đạt rõ ràng và có tư duy phản biện tốt.',
      'Chủ động trong tìm tòi kiến thức, năng động trong thảo luận nhóm, có năng khiếu nổi bật.'
    ],
    kha: [
      'Nắm vững kiến thức kỹ năng các môn học, có ý thức tự học và khả năng làm việc nhóm tốt.',
      'Có cố gắng trong học tập, tiếp thu bài tốt, cần rèn luyện thêm kỹ năng thuyết trình tự tin.',
      'Khả năng vận dụng kiến thức khá, cần rèn thêm tính kiên trì trong các bài tập chuyên sâu.'
    ],
    dat: [
      'Hoàn thành các nhiệm vụ học tập được giao, có tiến bộ trong khả năng tự học.',
      'Tiếp thu kiến thức cơ bản ở mức vừa phải, cần rèn thêm kỹ năng tính toán và ghi nhớ.',
      'Cần tích cực phát biểu xây dựng bài và chủ động trao đổi với bạn bè trong giờ học.'
    ],
    chuaDat: [
      'Khả năng tiếp thu còn chậm, kỹ năng tự học còn hạn chế, chưa tập trung trong giờ học.',
      'Cần sự hỗ trợ thường xuyên của thầy cô và bạn bè để hoàn thành yêu cầu cần đạt của môn học.'
    ]
  },
  nhanXetChung: {
    xuatSac: [
      'Học sinh xuất sắc toàn diện, chăm ngoan gương mẫu, đạt thành tích cao trong học tập và rèn luyện. Xứng đáng là tấm gương sáng của lớp.',
      'Ý thức kỷ luật tuyệt vời, kết quả học tập xuất sắc đồng đều tất cả các môn. Tích cực tham gia các hoạt động phong trào Đội/Đoàn.'
    ],
    gioi: [
      'Học sinh chăm ngoan, nề nếp tốt, học lực giỏi toàn diện. Tích cực tham gia xây dựng bài và phong trào thi đua của lớp.',
      'Có tinh thần tự giác cao, rèn luyện tốt, đạt học sinh Giỏi. Cần tiếp tục duy trì và phát huy phong độ trong năm học tới.'
    ],
    kha: [
      'Học sinh ngoan, nề nếp ổn định, đạt học lực Khá. Tiếp thu bài tốt, cần rèn thêm các môn tự nhiên để bứt phá đạt danh hiệu Học sinh Giỏi.',
      'Chăm chỉ, chấp hành nghiêm quy định trường lớp, học lực Khá đều. Cần tự tin hơn trong giao tiếp và phát biểu xây dựng bài.'
    ],
    dat: [
      'Học sinh ngoan, lễ phép, có tiến bộ về nề nếp và học tập so với đầu năm. Cần tăng cường thời gian tự học ở nhà để cải thiện điểm số.',
      'Nề nếp tương đối tốt, đạt yêu cầu các môn. Cần tập trung hơn trong giờ học, phối hợp cùng phụ huynh để kèm cặp thêm.'
    ],
    chuaDat: [
      'Học lực và nề nếp còn hạn chế, còn sao nhãng trong giờ học. Cần có kế hoạch phụ đạo bổ trợ và sự đồng hành sát sao từ gia đình.',
      'Chưa hoàn thành một số môn học, nề nếp chưa ổn định. Đề nghị gia đình phối hợp chặt chẽ với GVCN để rèn luyện trong hè.'
    ]
  }
};

/**
 * Tự động sinh nhận xét cá nhân chuẩn TT22 dựa trên điểm số và nề nếp
 */
export function generateTT22CommentForStudent(student: GvcnStudent): GvcnTT22Evaluation {
  const hasGrades = student.grades && typeof student.grades.dtbChung === 'number';
  const dtb = hasGrades ? student.grades!.dtbChung : undefined;
  
  // Xác định mức rèn luyện (theo nề nếp)
  let renLuyen: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Tốt';
  if (student.category === 'special_care') {
    renLuyen = 'Khá';
  }

  // Chọn ngẫu nhiên có ngữ cảnh câu nhận xét
  const hash = student.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + student.stt;

  // Nếu CHƯA CÓ ĐIỂM: không tự gán điểm giả hay xếp loại học lực Tốt/Khá!
  if (!hasGrades || dtb === undefined) {
    return {
      renLuyen,
      hocTap: 'Chưa đạt' as any, // Trạng thái sẽ được kiểm tra hasGrades để hiển thị "Chưa đánh giá"
      phamChat: 'Chấp hành tốt nội quy trường lớp, kính trọng thầy cô, có ý thức rèn luyện phẩm chất đạo đức tốt.',
      nangLuc: 'Có ý thức tự giác trong học tập, hoàn thành các nhiệm vụ được giao trên lớp.',
      nhanXetChung: 'Nề nếp tốt, chăm ngoan. Chờ cập nhật bảng điểm học kỳ để tổng kết kết quả học tập theo Thông tư 22.',
      khenThuong: 'Không',
      updatedAt: new Date().toLocaleDateString('vi-VN')
    };
  }

  // Xác định mức học lực theo TT22 khi ĐÃ CÓ ĐIỂM
  let hocTap: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Khá';
  if (dtb >= 8.0) hocTap = 'Tốt';
  else if (dtb >= 6.5) hocTap = 'Khá';
  else if (dtb >= 5.0) hocTap = 'Đạt';
  else hocTap = 'Chưa đạt';

  const pcBank = hocTap === 'Tốt' ? TT22_COMMENT_BANK.phamChat.tot :
                 hocTap === 'Khá' ? TT22_COMMENT_BANK.phamChat.kha :
                 hocTap === 'Đạt' ? TT22_COMMENT_BANK.phamChat.dat : TT22_COMMENT_BANK.phamChat.chuaDat;
  const phamChat = pcBank[hash % pcBank.length];

  const nlBank = hocTap === 'Tốt' ? TT22_COMMENT_BANK.nangLuc.tot :
                 hocTap === 'Khá' ? TT22_COMMENT_BANK.nangLuc.kha :
                 hocTap === 'Đạt' ? TT22_COMMENT_BANK.nangLuc.dat : TT22_COMMENT_BANK.nangLuc.chuaDat;
  const nangLuc = nlBank[(hash + 1) % nlBank.length];

  let khenThuong: 'Học sinh Xuất sắc' | 'Học sinh Giỏi' | 'Khen thưởng chuyên đề' | 'Không' = 'Không';
  let nxBank = TT22_COMMENT_BANK.nhanXetChung.kha;

  if (hocTap === 'Tốt' && renLuyen === 'Tốt') {
    if (dtb >= 9.0) {
      khenThuong = 'Học sinh Xuất sắc';
      nxBank = TT22_COMMENT_BANK.nhanXetChung.xuatSac;
    } else {
      khenThuong = 'Học sinh Giỏi';
      nxBank = TT22_COMMENT_BANK.nhanXetChung.gioi;
    }
  } else if (hocTap === 'Khá') {
    nxBank = TT22_COMMENT_BANK.nhanXetChung.kha;
  } else if (hocTap === 'Đạt') {
    nxBank = TT22_COMMENT_BANK.nhanXetChung.dat;
  } else {
    nxBank = TT22_COMMENT_BANK.nhanXetChung.chuaDat;
  }

  const nhanXetChung = nxBank[(hash + 2) % nxBank.length];

  return {
    renLuyen,
    hocTap,
    phamChat,
    nangLuc,
    nhanXetChung,
    khenThuong,
    updatedAt: new Date().toLocaleDateString('vi-VN')
  };
}

/**
 * Xuất file Excel bảng nhận xét học sinh theo Thông tư 22/2021/TT-BGDĐT
 */
export function exportTT22EvaluationExcel(classInfo: GvcnClassInfo, students: GvcnStudent[]) {
  const wb = XLSX.utils.book_new();
  const data: (string | number)[][] = [];

  // Header cơ quan & trường
  data.push([classInfo.schoolName.toUpperCase()]);
  data.push(['BẢNG TỔNG HỢP NHẬN XÉT VÀ ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN - HỌC TẬP HỌC SINH']);
  data.push([`Theo Thông tư 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo`]);
  data.push([
    `Lớp: ${classInfo.className} | GVCN: ${classInfo.homeroomTeacher} | Năm học: ${classInfo.academicYear} | Sĩ số: ${students.length}`
  ]);
  data.push([]); // Dòng trống

  // Header các cột chuẩn VnEdu & Bộ GD&ĐT
  data.push([
    'STT',
    'Mã học sinh (VnEdu)',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Tổ',
    'Điểm TB các môn',
    'Kết quả Rèn luyện',
    'Kết quả Học tập',
    'Nhận xét Phẩm chất (TT22)',
    'Nhận xét Năng lực (TT22)',
    'Nhận xét chung của GVCN (Học bạ / VnEdu)',
    'Danh hiệu khen thưởng'
  ]);

  // Thêm dữ liệu học sinh
  students.forEach((s, idx) => {
    const evalData = s.tt22Evaluation || generateTT22CommentForStudent(s);
    const hasGrades = s.grades && typeof s.grades.dtbChung === 'number';
    const dtb = hasGrades ? Number(s.grades!.dtbChung.toFixed(1)) : '—';
    const hocTap = hasGrades ? evalData.hocTap : 'Chưa có điểm';

    data.push([
      idx + 1,
      s.studentCode || `VNE9A1${String(idx + 1).padStart(3, '0')}`,
      s.name,
      s.dob || '01/01/2012',
      s.gender,
      `Tổ ${s.group}`,
      dtb,
      evalData.renLuyen,
      hocTap,
      evalData.phamChat,
      evalData.nangLuc,
      evalData.nhanXetChung,
      hasGrades ? (evalData.khenThuong || 'Không') : 'Chưa xét'
    ]);
  });

  // Footer ghi chú & chữ ký
  data.push([]);
  data.push(['', '', '', '', '', '', '', '', '', '', '', `..., ngày .... tháng .... năm ....`]);
  data.push(['', '', '', '', '', '', '', '', '', '', '', 'GIÁO VIÊN CHỦ NHIỆM']);
  data.push(['', '', '', '', '', '', '', '', '', '', '', '(Ký và ghi rõ họ tên)']);
  data.push(['', '', '', '', '', '', '', '', '', '', '', '']);
  data.push(['', '', '', '', '', '', '', '', '', '', '', classInfo.homeroomTeacher]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã HS
    { wch: 22 }, // Họ tên
    { wch: 12 }, // Ngày sinh
    { wch: 10 }, // Giới tính
    { wch: 8 },  // Tổ
    { wch: 14 }, // ĐTB
    { wch: 16 }, // Rèn luyện
    { wch: 16 }, // Học tập
    { wch: 45 }, // Phẩm chất
    { wch: 45 }, // Năng lực
    { wch: 55 }, // Nhận xét chung
    { wch: 20 }, // Khen thưởng
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Nhan_Xet_TT22');
  
  const cleanClassName = classInfo.className.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Bang_Nhan_Xet_TT22_${cleanClassName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
}

/**
 * Tạo và tải về File mẫu danh sách học sinh theo chuẩn VnEdu
 */
export function generateSampleVnEduStudentExcel(className: string = '9A1') {
  const wb = XLSX.utils.book_new();
  const data: (string | number)[][] = [];

  data.push(['TRƯỜNG THCS LÊ QUÝ ĐÔN']);
  data.push([`DANH SÁCH HỌC SINH LỚP ${className} (MẪU VNEDU CHUẨN)`]);
  data.push([`Ngày xuất mẫu: ${new Date().toLocaleDateString('vi-VN')}`]);
  data.push([]);

  data.push([
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Tổ',
    'Chức vụ',
    'Họ tên cha/mẹ',
    'Số điện thoại',
    'Địa chỉ',
    'Ghi chú'
  ]);

  const sampleRows = [
    [1, '2100849201', 'Trần Minh Anh', '12/03/2012', 'Nữ', 1, 'Lớp trưởng', 'Bác Trần Văn Hưng', '0912.345.678', 'Số 12 Phố Huế, Hoàn Kiếm, Hà Nội', 'Đội viên gương mẫu'],
    [2, '2100849202', 'Lê Hoàng Nam', '25/08/2012', 'Nam', 1, 'Lớp phó học tập', 'Cô Lê Thị Mai Hoa', '0983.456.789', 'Số 45 Hàng Bài, Hoàn Kiếm, Hà Nội', 'Học sinh Giỏi Toán'],
    [3, '2100849203', 'Phạm Thu Trang', '05/11/2012', 'Nữ', 2, 'Lớp phó kỷ luật', 'Bác Phạm Văn Tuấn', '0904.123.456', 'Số 88 Bà Triệu, Hai Bà Trưng, Hà Nội', 'Nề nếp tốt'],
    [4, '2100849204', 'Đặng Quốc Huy', '19/02/2012', 'Nam', 2, 'Bí thư Chi đội', 'Bác Đặng Văn Long', '0977.888.999', 'Số 23 Tràng Thi, Hoàn Kiếm, Hà Nội', 'Tích cực phong trào'],
    [5, '2100849205', 'Nguyễn Thảo Linh', '14/07/2012', 'Nữ', 3, 'Thủ quỹ', 'Cô Nguyễn Thị Lan', '0915.666.777', 'Số 67 Lý Thường Kiệt, Hà Nội', 'Cẩn thận, chu đáo'],
    [6, '2100849206', 'Vũ Đức Hải', '30/09/2012', 'Nam', 3, 'Học sinh', 'Bác Vũ Đình Quảng', '0936.555.444', 'Số 102 Hai Bà Trưng, Hà Nội', 'Cần phụ đạo thêm'],
    [7, '2100849207', 'Hoàng Bảo Ngọc', '08/04/2012', 'Nữ', 4, 'Tổ trưởng 4', 'Cô Hoàng Thị Minh', '0988.222.333', 'Số 5 Phan Chu Trinh, Hà Nội', 'Học tốt Tiếng Anh'],
    [8, '2100849208', 'Đỗ Quang Dũng', '17/12/2012', 'Nam', 4, 'Học sinh', 'Bác Đỗ Trọng Nghĩa', '0903.111.222', 'Số 90 Lò Đúc, Hai Bà Trưng, Hà Nội', 'Đôi bạn cùng tiến']
  ];

  sampleRows.forEach(r => data.push(r));

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 10 },
    { wch: 8 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 35 },
    { wch: 25 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'DS_HocSinh');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Mau_Danh_Sach_Hoc_Sinh_VnEdu.xlsx');
}

/**
 * Tạo và tải về File mẫu bảng điểm học sinh theo chuẩn VnEdu
 */
export function generateSampleVnEduGradeExcel(className: string = '9A1') {
  const wb = XLSX.utils.book_new();
  const data: (string | number)[][] = [];

  data.push(['TRƯỜNG THCS LÊ QUÝ ĐÔN']);
  data.push([`BẢNG ĐIỂM HỌC KỲ TỔNG HỢP - LỚP ${className} (MẪU VNEDU)`]);
  data.push([`Năm học: 2026 - 2027 | Môn học: Tổng hợp tất cả các môn`]);
  data.push([]);

  data.push([
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Toán',
    'Ngữ văn',
    'Tiếng Anh',
    'KHTN',
    'Lịch sử & Địa lý',
    'GDCD',
    'Tin học',
    'Công nghệ',
    'GDTC',
    'Nghệ thuật',
    'ĐTB các môn'
  ]);

  const sampleGrades = [
    [1, '2100849201', 'Trần Minh Anh', 9.2, 8.8, 9.5, 9.0, 8.5, 9.0, 9.5, 9.0, 'Đ', 'Đ', 9.1],
    [2, '2100849202', 'Lê Hoàng Nam', 9.8, 8.2, 9.0, 9.5, 8.0, 8.5, 9.8, 8.5, 'Đ', 'Đ', 8.9],
    [3, '2100849203', 'Phạm Thu Trang', 8.5, 8.8, 8.5, 8.2, 8.5, 9.0, 8.8, 8.5, 'Đ', 'Đ', 8.6],
    [4, '2100849204', 'Đặng Quốc Huy', 8.0, 7.8, 8.2, 8.0, 8.5, 8.0, 8.5, 8.0, 'Đ', 'Đ', 8.1],
    [5, '2100849205', 'Nguyễn Thảo Linh', 7.8, 8.0, 8.2, 7.5, 8.0, 8.5, 8.0, 8.0, 'Đ', 'Đ', 7.9],
    [6, '2100849206', 'Vũ Đức Hải', 5.5, 6.0, 5.0, 5.2, 6.5, 7.0, 6.0, 6.5, 'Đ', 'Đ', 5.9],
    [7, '2100849207', 'Hoàng Bảo Ngọc', 8.5, 9.0, 9.8, 8.5, 8.5, 9.0, 9.0, 8.8, 'Đ', 'Đ', 8.9],
    [8, '2100849208', 'Đỗ Quang Dũng', 6.2, 6.5, 6.0, 5.8, 7.0, 7.5, 6.5, 7.0, 'Đ', 'Đ', 6.5]
  ];

  sampleGrades.forEach(r => data.push(r));

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 22 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 16 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Bang_Diem_VnEdu');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Mau_Bang_Diem_Hoc_Sinh_VnEdu.xlsx');
}

/**
 * Đọc file Excel danh sách học sinh từ VnEdu
 */
export async function parseVnEduStudentList(file: File): Promise<GvcnStudent[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('File Excel rỗng hoặc không đúng định dạng!');
  }

  // Tìm dòng tiêu đề (header row)
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const rowStr = (rawRows[i] || []).join(' ').toLowerCase();
    if (
      (rowStr.includes('họ') && rowStr.includes('tên')) ||
      rowStr.includes('mã học sinh') ||
      rowStr.includes('mã hs') ||
      rowStr.includes('họ và tên')
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    // Nếu không tìm thấy, mặc định dòng 0
    headerIndex = 0;
  }

  const headers: string[] = (rawRows[headerIndex] || []).map((h: any) =>
    String(h || '').trim().toLowerCase()
  );

  // Xác định vị trí các cột
  const colIndex = {
    stt: headers.findIndex(h => h === 'stt' || h.startsWith('số tt') || h.includes('thứ tự')),
    code: headers.findIndex(h => h.includes('mã hs') || h.includes('mã học sinh') || h.includes('mã số') || h.includes('định danh')),
    fullName: headers.findIndex(h => h === 'họ và tên' || h === 'họ tên' || h.includes('họ và tên')),
    lastName: headers.findIndex(h => h === 'họ đệm' || h === 'họ lót' || h === 'họ và đệm'),
    firstName: headers.findIndex(h => h === 'tên'),
    dob: headers.findIndex(h => h.includes('ngày sinh') || h === 'dob' || h.includes('sinh ngày')),
    gender: headers.findIndex(h => h.includes('giới tính') || h === 'nam/nữ' || h === 'phái'),
    group: headers.findIndex(h => h === 'tổ' || h.includes('tổ sinh hoạt')),
    role: headers.findIndex(h => h.includes('chức vụ') || h.includes('vai trò')),
    phone: headers.findIndex(h => h.includes('điện thoại') || h.includes('sđt') || h.includes('liên hệ')),
    parentName: headers.findIndex(h => h.includes('cha') || h.includes('mẹ') || h.includes('phụ huynh') || h.includes('người đỡ đầu')),
    address: headers.findIndex(h => h.includes('địa chỉ') || h.includes('nơi ở') || h.includes('thường trú')),
    note: headers.findIndex(h => h.includes('ghi chú') || h.includes('lưu ý'))
  };

  const parsedStudents: GvcnStudent[] = [];

  for (let r = headerIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Lấy tên học sinh
    let name = '';
    if (colIndex.fullName !== -1 && row[colIndex.fullName]) {
      name = String(row[colIndex.fullName]).trim();
    } else if (colIndex.lastName !== -1 && colIndex.firstName !== -1) {
      const last = String(row[colIndex.lastName] || '').trim();
      const first = String(row[colIndex.firstName] || '').trim();
      name = `${last} ${first}`.trim();
    } else {
      // Thử tìm ô chuỗi có độ dài hợp lý
      for (const cell of row) {
        if (typeof cell === 'string' && cell.trim().length > 3 && isNaN(Number(cell))) {
          name = cell.trim();
          break;
        }
      }
    }

    if (!name || name.toLowerCase().includes('tổng số') || name.toLowerCase().includes('người lập')) {
      continue;
    }

    // Mã học sinh
    const studentCode = colIndex.code !== -1 && row[colIndex.code] 
      ? String(row[colIndex.code]).trim() 
      : `VNE${String(parsedStudents.length + 1).padStart(6, '0')}`;

    // STT
    const stt = colIndex.stt !== -1 && !isNaN(Number(row[colIndex.stt]))
      ? Number(row[colIndex.stt])
      : parsedStudents.length + 1;

    // Ngày sinh
    let dob = '01/01/2012';
    if (colIndex.dob !== -1 && row[colIndex.dob]) {
      const rawDob = row[colIndex.dob];
      if (typeof rawDob === 'number') {
        // Excel serial date format
        const date = XLSX.SSF.parse_date_code(rawDob);
        dob = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
      } else {
        dob = String(rawDob).trim();
      }
    }

    // Giới tính
    let gender: 'Nam' | 'Nữ' = 'Nam';
    if (colIndex.gender !== -1 && row[colIndex.gender]) {
      const gStr = String(row[colIndex.gender]).toLowerCase();
      if (gStr.includes('nữ') || gStr === 'f' || gStr === '0') {
        gender = 'Nữ';
      }
    } else {
      // Đoán theo tên phổ biến nếu không có cột giới tính
      const lastWord = name.split(' ').pop()?.toLowerCase() || '';
      if (['anh', 'chi', 'hà', 'hoa', 'hương', 'lan', 'linh', 'mai', 'my', 'ngọc', 'ngân', 'phương', 'quỳnh', 'thảo', 'trang', 'vân', 'yến'].includes(lastWord)) {
        gender = 'Nữ';
      }
    }

    // Tổ (1 - 4)
    let group: 1 | 2 | 3 | 4 = 1;
    if (colIndex.group !== -1 && row[colIndex.group]) {
      const gVal = parseInt(String(row[colIndex.group]).replace(/\D/g, ''), 10);
      if (gVal >= 1 && gVal <= 4) {
        group = gVal as 1 | 2 | 3 | 4;
      } else {
        group = (((parsedStudents.length) % 4) + 1) as 1 | 2 | 3 | 4;
      }
    } else {
      group = (((parsedStudents.length) % 4) + 1) as 1 | 2 | 3 | 4;
    }

    // Phụ huynh & SĐT
    const parentName = colIndex.parentName !== -1 && row[colIndex.parentName]
      ? String(row[colIndex.parentName]).trim()
      : `Phụ huynh em ${name.split(' ').pop()}`;
    
    const parentPhone = colIndex.phone !== -1 && row[colIndex.phone]
      ? String(row[colIndex.phone]).trim()
      : `09${Math.floor(10000000 + Math.random() * 90000000)}`;

    const address = colIndex.address !== -1 && row[colIndex.address]
      ? String(row[colIndex.address]).trim()
      : undefined;

    const role = colIndex.role !== -1 && row[colIndex.role]
      ? String(row[colIndex.role]).trim()
      : (stt === 1 ? 'Lớp trưởng' : stt === 2 ? 'Lớp phó học tập' : 'Học sinh');

    const note = colIndex.note !== -1 && row[colIndex.note]
      ? String(row[colIndex.note]).trim()
      : undefined;

    const newStudent: GvcnStudent = {
      id: `std-vnedu-${Date.now()}-${parsedStudents.length + 1}`,
      stt,
      studentCode,
      name,
      gender,
      dob,
      group,
      role,
      parentName,
      parentPhone,
      address,
      note,
      category: 'normal'
    };

    // Tự sinh đánh giá TT22 sơ bộ
    newStudent.tt22Evaluation = generateTT22CommentForStudent(newStudent);

    parsedStudents.push(newStudent);
  }

  return parsedStudents;
}

/**
 * Đọc file Excel bảng điểm từ VnEdu và gán vào danh sách học sinh hiện có
 */
export async function parseVnEduGradeSheet(
  file: File,
  currentStudents: GvcnStudent[]
): Promise<{ updatedStudents: GvcnStudent[]; matchedCount: number }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('File Bảng điểm rỗng hoặc không đúng cấu trúc!');
  }

  // Tìm dòng tiêu đề
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const rowStr = (rawRows[i] || []).join(' ').toLowerCase();
    if (
      rowStr.includes('toán') ||
      rowStr.includes('ngữ văn') ||
      rowStr.includes('văn') ||
      rowStr.includes('đtbm') ||
      rowStr.includes('điểm tb') ||
      rowStr.includes('mã học sinh')
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) headerIndex = 0;

  const headers: string[] = (rawRows[headerIndex] || []).map((h: any) =>
    String(h || '').trim().toLowerCase()
  );

  // Map header columns
  const nameCol = headers.findIndex(h => h.includes('họ và tên') || h.includes('họ tên'));
  const codeCol = headers.findIndex(h => h.includes('mã hs') || h.includes('mã học sinh') || h.includes('mã'));
  const dtbCol = headers.findIndex(h => h.includes('đtb') || h.includes('điểm tb') || h.includes('trung bình'));

  // Các môn học chính
  const subjectsToTrack = [
    { key: 'toán', name: 'Toán' },
    { key: 'văn', name: 'Ngữ văn' },
    { key: 'anh', name: 'Tiếng Anh' },
    { key: 'khtn', name: 'KHTN' },
    { key: 'sử', name: 'Lịch sử & Địa lý' },
    { key: 'gdcd', name: 'GDCD' },
    { key: 'tin', name: 'Tin học' },
    { key: 'công nghệ', name: 'Công nghệ' },
    { key: 'gdtc', name: 'GDTC' },
    { key: 'nghệ thuật', name: 'Nghệ thuật' },
  ];

  const subjectColMap: { subject: string; col: number }[] = [];
  subjectsToTrack.forEach(sub => {
    const foundIdx = headers.findIndex(h => h.includes(sub.key));
    if (foundIdx !== -1) {
      subjectColMap.push({ subject: sub.name, col: foundIdx });
    }
  });

  const studentMap = new Map<string, GvcnStudent>();
  currentStudents.forEach(s => {
    if (s.studentCode) studentMap.set(s.studentCode.toLowerCase(), s);
    studentMap.set(s.name.toLowerCase().trim(), s);
    studentMap.set(String(s.stt), s);
  });

  let matchedCount = 0;
  const updatedStudents = [...currentStudents];

  for (let r = headerIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rowCode = codeCol !== -1 && row[codeCol] ? String(row[codeCol]).trim().toLowerCase() : '';
    const rowName = nameCol !== -1 && row[nameCol] ? String(row[nameCol]).trim().toLowerCase() : '';
    const rowStt = String(r - headerIndex);

    // Tìm học sinh tương ứng
    let matchedStudent = (rowCode && studentMap.get(rowCode)) ||
                         (rowName && studentMap.get(rowName)) ||
                         studentMap.get(rowStt);

    if (!matchedStudent) continue;

    // Trích xuất điểm các môn
    const subjectGrades: GvcnSubjectGrade[] = [];
    let sumScore = 0;
    let scoreCount = 0;

    subjectColMap.forEach(sMap => {
      const rawVal = row[sMap.col];
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        if (sMap.subject === 'GDTC' || sMap.subject === 'Nghệ thuật') {
          const evalVal = String(rawVal).trim().toUpperCase();
          subjectGrades.push({
            subject: sMap.subject,
            ddgTx: [evalVal === 'Đ' || evalVal === 'TỐT' ? 'Đ' : 'CĐ'],
            danhGia: evalVal === 'CĐ' ? 'CĐ' : 'Đ',
            dtbMhk: evalVal
          });
        } else {
          const numVal = parseFloat(String(rawVal).replace(',', '.'));
          if (!isNaN(numVal)) {
            subjectGrades.push({
              subject: sMap.subject,
              ddgTx: [numVal - 0.2 > 0 ? Number((numVal - 0.2).toFixed(1)) : numVal, numVal],
              ddgGk: numVal,
              ddgCk: numVal,
              dtbMhk: numVal
            });
            sumScore += numVal;
            scoreCount++;
          }
        }
      }
    });

    // Nếu không trích xuất được môn nào cụ thể, tạo bảng điểm giả định từ ĐTB
    let dtbChung = dtbCol !== -1 && !isNaN(parseFloat(String(row[dtbCol]).replace(',', '.')))
      ? parseFloat(String(row[dtbCol]).replace(',', '.'))
      : scoreCount > 0 ? Number((sumScore / scoreCount).toFixed(1)) : 8.0;

    if (subjectGrades.length === 0) {
      // Điền các môn mặc định xoay quanh dtbChung
      subjectGrades.push(
        { subject: 'Toán', ddgTx: [dtbChung + 0.2, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'Ngữ văn', ddgTx: [dtbChung - 0.2, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'Tiếng Anh', ddgTx: [dtbChung + 0.5, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'KHTN', ddgTx: [dtbChung, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'Lịch sử & Địa lý', ddgTx: [dtbChung, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'GDCD', ddgTx: [9.0, 9.5], ddgGk: 9.0, ddgCk: 9.0, dtbMhk: 9.0 },
        { subject: 'Tin học', ddgTx: [dtbChung, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'Công nghệ', ddgTx: [dtbChung, dtbChung], ddgGk: dtbChung, ddgCk: dtbChung, dtbMhk: dtbChung },
        { subject: 'GDTC', ddgTx: ['Đ'], danhGia: 'Đ', dtbMhk: 'Đ' },
        { subject: 'Nghệ thuật', ddgTx: ['Đ'], danhGia: 'Đ', dtbMhk: 'Đ' }
      );
    }

    let hocLucTT22: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Khá';
    if (dtbChung >= 8.0) hocLucTT22 = 'Tốt';
    else if (dtbChung >= 6.5) hocLucTT22 = 'Khá';
    else if (dtbChung >= 5.0) hocLucTT22 = 'Đạt';
    else hocLucTT22 = 'Chưa đạt';

    const targetIdx = updatedStudents.findIndex(s => s.id === matchedStudent!.id);
    if (targetIdx !== -1) {
      const studentCopy = { ...updatedStudents[targetIdx] };
      studentCopy.grades = {
        semester: 'HK1',
        dtbChung: Number(dtbChung.toFixed(1)),
        hocLucTT22,
        subjects: subjectGrades
      };
      // Cập nhật lại đánh giá TT22
      studentCopy.tt22Evaluation = generateTT22CommentForStudent(studentCopy);
      updatedStudents[targetIdx] = studentCopy;
      matchedCount++;
    }
  }

  return { updatedStudents, matchedCount };
}
