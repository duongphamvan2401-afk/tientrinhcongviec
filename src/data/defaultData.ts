import { PpctDataset, TimeframeConfig, MatrixConfig, MatrixRow, PpctLesson } from '../types';
import { getTodayDateStr, getDefaultStartDateWeek1 } from '../utils/dateCalculations';

export const defaultTimeframeConfig: TimeframeConfig = {
  startDateWeek1: getDefaultStartDateWeek1(),
  currentDate: getTodayDateStr(),
  periodsPerWeek: 4,
  totalWeeksHK1: 18,
  totalWeeksHK2: 17,
  totalWeeksYear: 35,
  totalPeriodsHK1: 72,
  totalPeriodsHK2: 68,
  totalPeriodsYear: 140,
  midtermWeekHK1: 9,
  finalWeekHK1: 18,
  midtermWeekHK2: 26,
  finalWeekHK2: 33,
  examStartDayOfWeek: 5, // Thứ 5
  examDurationDays: 2,
  kttxCountPerTerm: 4,
  kttxWeeksHK1: [3, 6, 11, 14],
  kttxWeeksHK2: [21, 23, 29, 31],
};

// Tạo danh sách 140 tiết chuẩn Phân phối chương trình Toán 9 (35 tuần x 4 tiết/tuần = 140 tiết)
const generateToan9Lessons = (): PpctLesson[] => {
  const lessons: PpctLesson[] = [];
  let stt = 1;

  // HK1: Tuần 1 -> 18 (72 tiết)
  const hk1Plan = [
    // Tuần 1 (T1-T4)
    { w: 1, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn (tiết 1, 2)', p: 2 },
    { w: 1, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn (tiết 1, 2) - PP thế', p: 2 },
    // Tuần 2 (T5-T8)
    { w: 2, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn (tiết 3, 4) - PP cộng đại số', p: 2 },
    { w: 2, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Luyện tập chung: Các phương pháp giải hệ hai phương trình bậc nhất hai ẩn', p: 2 },
    // Tuần 3 (T9-T12) - KTTX 1
    { w: 3, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 3. Giải bài toán bằng cách lập hệ phương trình (tiết 1, 2)', p: 2 },
    { w: 3, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 3. Giải bài toán bằng cách lập hệ phương trình (tiết 3) & Kiểm tra thường xuyên 1 (HK1)', p: 2 },
    // Tuần 4 (T13-T16)
    { w: 4, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn (tiết 1, 2) - Phương trình tích', p: 2 },
    { w: 4, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn (tiết 3, 4) - Phương trình chứa ẩn ở mẫu', p: 2 },
    // Tuần 5 (T17-T20)
    { w: 5, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Luyện tập chung các dạng phương trình quy về bậc nhất', p: 2 },
    { w: 5, c: 'Chương I. Phương trình và hệ hai phương trình bậc nhất hai ẩn', b: 'Bài tập cuối chương I (tiết 1, 2)', p: 2 },
    // Tuần 6 (T21-T24) - KTTX 2
    { w: 6, c: 'Chương II. Bất đẳng thức và bất phương trình bậc nhất một ẩn', b: 'Bài 5. Bất đẳng thức và tính chất (tiết 1, 2)', p: 2 },
    { w: 6, c: 'Chương II. Bất đẳng thức và bất phương trình bậc nhất một ẩn', b: 'Bài 6. Bất phương trình bậc nhất một ẩn (tiết 1) & Kiểm tra thường xuyên 2 (HK1)', p: 2 },
    // Tuần 7 (T25-T28)
    { w: 7, c: 'Chương II. Bất đẳng thức và bất phương trình bậc nhất một ẩn', b: 'Bài 6. Bất phương trình bậc nhất một ẩn (tiết 2, 3)', p: 2 },
    { w: 7, c: 'Chương II. Bất đẳng thức và bất phương trình bậc nhất một ẩn', b: 'Luyện tập chung và bài tập cuối chương II', p: 2 },
    // Tuần 8 (T29-T32)
    { w: 8, c: 'Chương IV. Hệ thức lượng trong tam giác vuông', b: 'Bài 11. Tỉ số lượng giác của góc nhọn (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương IV. Hệ thức lượng trong tam giác vuông', b: 'Bài 11. Tỉ số lượng giác của góc nhọn (tiết 3) & Bài 12. Hệ thức giữa cạnh và góc trong tam giác vuông (tiết 1)', p: 2 },
    // Tuần 9 (T33-T36) - GIỮA KỲ 1
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Ôn tập kiểm tra giữa học kỳ I (Đại số & Hình học)', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Kiểm tra giữa học kỳ I (Đề 90 phút) & Trả bài kiểm tra', p: 2 },
    // Tuần 10 (T37-T40)
    { w: 10, c: 'Chương IV. Hệ thức lượng trong tam giác vuông', b: 'Bài 12. Một số hệ thức giữa cạnh và góc trong tam giác vuông (tiết 2, 3)', p: 2 },
    { w: 10, c: 'Chương IV. Hệ thức lượng trong tam giác vuông', b: 'Bài tập cuối chương IV (tiết 1, 2)', p: 2 },
    // Tuần 11 (T41-T44) - KTTX 3
    { w: 11, c: 'Chương III. Căn bậc hai và căn bậc ba', b: 'Bài 7. Căn bậc hai và căn thức bậc hai (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương III. Căn bậc hai và căn bậc ba', b: 'Bài 8. Khai căn bậc hai với phép nhân và phép chia (tiết 1) & Kiểm tra thường xuyên 3 (HK1)', p: 2 },
    // Tuần 12 (T45-T48)
    { w: 12, c: 'Chương III. Căn bậc hai và căn bậc ba', b: 'Bài 8. Khai căn bậc hai với phép nhân và phép chia (tiết 2, 3)', p: 2 },
    { w: 12, c: 'Chương III. Căn bậc hai và căn bậc ba', b: 'Bài 9. Biến đổi đơn giản biểu thức chứa căn bậc hai (tiết 1, 2)', p: 2 },
    // Tuần 13 (T49-T52)
    { w: 13, c: 'Chương III. Căn bậc hai và căn bậc ba', b: 'Bài 9. Biến đổi đơn giản biểu thức chứa căn bậc hai (tiết 3, 4)', p: 2 },
    { w: 13, c: 'Chương III. Căn bậc hai và căn bậc ba', b: 'Bài 10. Căn bậc ba và căn thức bậc ba & Bài tập cuối chương III', p: 2 },
    // Tuần 14 (T53-T56) - KTTX 4
    { w: 14, c: 'Chương V. Đường tròn', b: 'Bài 13. Mở đầu về đường tròn. Tính đối xứng của đường tròn (tiết 1, 2)', p: 2 },
    { w: 14, c: 'Chương V. Đường tròn', b: 'Bài 14. Vị trí tương đối của hai đường tròn (tiết 1) & Kiểm tra thường xuyên 4 (HK1)', p: 2 },
    // Tuần 15 (T57-T60)
    { w: 15, c: 'Chương V. Đường tròn', b: 'Bài 14. Vị trí tương đối của đường thẳng và đường tròn (tiết 2, 3)', p: 2 },
    { w: 15, c: 'Chương V. Đường tròn', b: 'Bài 15. Vị trí tương đối của hai đường tròn (tiết 1, 2)', p: 2 },
    // Tuần 16 (T61-T64)
    { w: 16, c: 'Chương V. Đường tròn', b: 'Bài tập cuối chương V: Đường tròn (tiết 1, 2)', p: 2 },
    { w: 16, c: 'Thực hành trải nghiệm', b: 'Hoạt động thực hành và trải nghiệm: Tính chiều cao và khoảng cách', p: 2 },
    // Tuần 17 (T65-T68)
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I (Phần Đại số: Chương I, II, III)', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I (Phần Hình học: Chương IV, V)', p: 2 },
    // Tuần 18 (T69-T72) - CUỐI KỲ 1
    { w: 18, c: 'Kiểm tra cuối học kỳ I', b: 'Kiểm tra cuối học kỳ I môn Toán 9 (Đề 90 phút)', p: 2 },
    { w: 18, c: 'Tổng kết học kỳ I', b: 'Trả bài kiểm tra cuối học kỳ I và sơ kết đánh giá học kỳ I', p: 2 },
  ];

  // HK2: Tuần 19 -> 35 (68 tiết)
  const hk2Plan = [
    // Tuần 19 (T73-T76)
    { w: 19, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 16. Hàm số y = ax² (a ≠ 0) và đồ thị (tiết 1, 2)', p: 2 },
    { w: 19, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 16. Hàm số y = ax² (a ≠ 0) và đồ thị (tiết 3, 4)', p: 2 },
    // Tuần 20 (T77-T80)
    { w: 20, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 17. Phương trình bậc hai một ẩn và công thức nghiệm (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 17. Phương trình bậc hai một ẩn và công thức nghiệm (tiết 3, 4)', p: 2 },
    // Tuần 21 (T81-T84) - KTTX 1 HK2
    { w: 21, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 18. Định lí Viète và ứng dụng (tiết 1, 2)', p: 2 },
    { w: 21, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 18. Định lí Viète (tiết 3) & Kiểm tra thường xuyên 1 (HK2)', p: 2 },
    // Tuần 22 (T85-T88)
    { w: 22, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Bài 19. Giải bài toán bằng cách lập phương trình bậc hai (tiết 1, 2)', p: 2 },
    { w: 22, c: 'Chương VI. Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn', b: 'Luyện tập chung và Bài tập cuối chương VI (tiết 1, 2)', p: 2 },
    // Tuần 23 (T89-T92) - KTTX 2 HK2
    { w: 23, c: 'Chương VII. Một số yếu tố thống kê', b: 'Bài 20. Bảng tần số và biểu đồ tần số (tiết 1, 2)', p: 2 },
    { w: 23, c: 'Chương VII. Một số yếu tố thống kê', b: 'Bài 21. Bảng tần số tương đối và biểu đồ tần số tương đối & Kiểm tra thường xuyên 2 (HK2)', p: 2 },
    // Tuần 24 (T93-T96)
    { w: 24, c: 'Chương VII. Một số yếu tố thống kê', b: 'Bài 21. Bảng tần số tương đối và biểu đồ tần số tương đối (tiết 2, 3)', p: 2 },
    { w: 24, c: 'Chương VII. Một số yếu tố thống kê', b: 'Bài tập cuối chương VII: Một số yếu tố thống kê', p: 2 },
    // Tuần 25 (T97-T100)
    { w: 25, c: 'Chương VIII. Một số yếu tố xác suất', b: 'Bài 22. Phép thử ngẫu nhiên và không gian mẫu (tiết 1, 2)', p: 2 },
    { w: 25, c: 'Chương VIII. Một số yếu tố xác suất', b: 'Bài 23. Xác suất của biến cố (tiết 1, 2)', p: 2 },
    // Tuần 26 (T101-T104) - GIỮA KỲ 2
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Ôn tập kiểm tra giữa học kỳ II (Hàm số bậc hai, Viète, Thống kê, Xác suất)', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Kiểm tra giữa học kỳ II (Đề 90 phút) & Trả bài kiểm tra', p: 2 },
    // Tuần 27 (T105-T108)
    { w: 27, c: 'Chương IX. Đường tròn và đa giác đều', b: 'Bài 24. Góc ở tâm, góc nội tiếp của đường tròn (tiết 1, 2)', p: 2 },
    { w: 27, c: 'Chương IX. Đường tròn và đa giác đều', b: 'Bài 25. Đa giác đều. Phép quay (tiết 1, 2)', p: 2 },
    // Tuần 28 (T109-T112)
    { w: 28, c: 'Chương IX. Đường tròn và đa giác đều', b: 'Bài 26. Đường tròn ngoại tiếp và nội tiếp đa giác đều (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương IX. Đường tròn và đa giác đều', b: 'Bài 27. Độ dài cung tròn và diện tích hình quạt tròn (tiết 1, 2)', p: 2 },
    // Tuần 29 (T113-T116) - KTTX 3 HK2
    { w: 29, c: 'Chương IX. Đường tròn và đa giác đều', b: 'Luyện tập chung chương IX: Đường tròn và đa giác đều', p: 2 },
    { w: 29, c: 'Chương IX. Đường tròn và đa giác đều', b: 'Bài tập cuối chương IX & Kiểm tra thường xuyên 3 (HK2)', p: 2 },
    // Tuần 30 (T117-T120)
    { w: 30, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 28. Hình trụ: Diện tích xung quanh và thể tích (tiết 1, 2)', p: 2 },
    { w: 30, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 28. Hình trụ (tiết 3, 4)', p: 2 },
    // Tuần 31 (T121-T124) - KTTX 4 HK2
    { w: 31, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 29. Hình nón: Diện tích xung quanh và thể tích (tiết 1, 2)', p: 2 },
    { w: 31, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 30. Hình cầu: Diện tích mặt cầu và thể tích hình cầu & Kiểm tra thường xuyên 4 (HK2)', p: 2 },
    // Tuần 32 (T125-T128)
    { w: 32, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài tập cuối chương X: Một số hình khối trong thực tiễn (tiết 1, 2)', p: 2 },
    { w: 32, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Thiết kế mô hình hình khối và tính thể tích', p: 2 },
    // Tuần 33 (T129-T132) - CUỐI KỲ 2
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Ôn tập cuối học kỳ II (Tổng hợp toàn bộ kiến thức HK2)', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Kiểm tra cuối học kỳ II môn Toán 9 (Đề 90 phút)', p: 2 },
    // Tuần 34 (T133-T136)
    { w: 34, c: 'Ôn tập tổng kết năm học', b: 'Ôn tập chuyên đề: Rèn kĩ năng giải toán vào lớp 10 THPT (tiết 1, 2)', p: 2 },
    { w: 34, c: 'Ôn tập tổng kết năm học', b: 'Ôn tập chuyên đề: Rèn kĩ năng giải toán vào lớp 10 THPT (tiết 3, 4)', p: 2 },
    // Tuần 35 (T137-T140)
    { w: 35, c: 'Tổng kết năm học', b: 'Trả bài kiểm tra cuối học kỳ II, chữa bài và hướng dẫn ôn hè (tiết 1, 2)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Tổng kết và đánh giá kết quả học tập môn Toán năm học 2026 - 2027', p: 2 },
  ];

  let currentPeriod = 1;

  hk1Plan.forEach((item) => {
    lessons.push({
      id: `toan9-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 1,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  hk2Plan.forEach((item) => {
    lessons.push({
      id: `toan9-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 2,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  return lessons;
};

// Tạo danh sách 140 tiết chuẩn Phân phối chương trình Toán 6 (35 tuần x 4 tiết/tuần = 140 tiết)
const generateToan6Lessons = (): PpctLesson[] => {
  const lessons: PpctLesson[] = [];
  let stt = 1;

  const hk1Plan = [
    { w: 1, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 1. Tập hợp và phần tử của tập hợp (tiết 1, 2)', p: 2 },
    { w: 1, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 2. Cách ghi số tự nhiên (tiết 1, 2)', p: 2 },
    { w: 2, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 3. Thứ tự trong tập hợp các số tự nhiên (tiết 1, 2)', p: 2 },
    { w: 2, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 4. Phép cộng và phép trừ số tự nhiên (tiết 1, 2)', p: 2 },
    { w: 3, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 5. Phép nhân và phép chia số tự nhiên (tiết 1, 2)', p: 2 },
    { w: 3, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Luyện tập chung & Kiểm tra thường xuyên 1 (HK1)', p: 2 },
    { w: 4, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 6. Lũy thừa với số mũ tự nhiên (tiết 1, 2)', p: 2 },
    { w: 4, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Bài 7. Thứ tự thực hiện các phép tính (tiết 1, 2)', p: 2 },
    { w: 5, c: 'Chương I. Tập hợp các số tự nhiên', b: 'Luyện tập chung và Bài tập cuối chương I (tiết 1, 2)', p: 2 },
    { w: 5, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Bài 8. Quan hệ chia hết và tính chất (tiết 1, 2)', p: 2 },
    { w: 6, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Bài 9. Dấu hiệu chia hết cho 2, cho 5 (tiết 1, 2)', p: 2 },
    { w: 6, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Bài 10. Dấu hiệu chia hết cho 3, cho 9 & Kiểm tra thường xuyên 2 (HK1)', p: 2 },
    { w: 7, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Bài 11. Số nguyên tố. Hợp số. Phân tích ra thừa số nguyên tố (tiết 1, 2)', p: 2 },
    { w: 7, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Bài 12. Ước chung và ước chung lớn nhất (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Bài 13. Bội chung và bội chung nhỏ nhất (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương II. Tính chia hết trong tập hợp các số tự nhiên', b: 'Luyện tập chung và Bài tập cuối chương II', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Ôn tập kiểm tra giữa học kỳ I (Chương I & II)', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Kiểm tra giữa học kỳ I môn Toán 6 (90 phút)', p: 2 },
    { w: 10, c: 'Chương III. Số nguyên', b: 'Bài 14. Tập hợp các số nguyên (tiết 1, 2)', p: 2 },
    { w: 10, c: 'Chương III. Số nguyên', b: 'Bài 15. Thứ tự trong tập hợp các số nguyên (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương III. Số nguyên', b: 'Bài 16. Phép cộng và phép trừ hai số nguyên (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương III. Số nguyên', b: 'Bài 16. Phép cộng và trừ số nguyên (tiết 3) & Kiểm tra thường xuyên 3 (HK1)', p: 2 },
    { w: 12, c: 'Chương III. Số nguyên', b: 'Bài 17. Quy tắc dấu ngoặc (tiết 1, 2)', p: 2 },
    { w: 12, c: 'Chương III. Số nguyên', b: 'Bài 18. Phép nhân hai số nguyên (tiết 1, 2)', p: 2 },
    { w: 13, c: 'Chương III. Số nguyên', b: 'Bài 19. Phép chia hết. Ước và bội của một số nguyên (tiết 1, 2)', p: 2 },
    { w: 13, c: 'Chương III. Số nguyên', b: 'Luyện tập chung và Bài tập cuối chương III (tiết 1, 2)', p: 2 },
    { w: 14, c: 'Chương IV. Hình học trực quan', b: 'Bài 20. Tam giác đều. Hình vuông. Lục giác đều (tiết 1, 2)', p: 2 },
    { w: 14, c: 'Chương IV. Hình học trực quan', b: 'Bài 21. Hình chữ nhật. Hình thoi (tiết 1) & Kiểm tra thường xuyên 4 (HK1)', p: 2 },
    { w: 15, c: 'Chương IV. Hình học trực quan', b: 'Bài 21. Hình bình hành. Hình thang cân (tiết 2, 3)', p: 2 },
    { w: 15, c: 'Chương IV. Hình học trực quan', b: 'Bài 22. Chu vi và diện tích một số hình phẳng trong thực tế (tiết 1, 2)', p: 2 },
    { w: 16, c: 'Chương IV. Hình học trực quan', b: 'Bài 22. Chu vi và diện tích (tiết 3) & Bài tập cuối chương IV', p: 2 },
    { w: 16, c: 'Thực hành trải nghiệm', b: 'Hoạt động thực hành trải nghiệm: Cắt dán mô hình hình phẳng', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I môn Toán 6 (Phần Số học)', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I môn Toán 6 (Phần Hình học)', p: 2 },
    { w: 18, c: 'Kiểm tra cuối học kỳ I', b: 'Kiểm tra cuối học kỳ I môn Toán 6 (Đề 90 phút)', p: 2 },
    { w: 18, c: 'Tổng kết học kỳ I', b: 'Trả bài kiểm tra cuối học kỳ I và sơ kết đánh giá học kỳ I', p: 2 },
  ];

  const hk2Plan = [
    { w: 19, c: 'Chương V. Phân số', b: 'Bài 23. Mở rộng phân số. Phân số bằng nhau (tiết 1, 2)', p: 2 },
    { w: 19, c: 'Chương V. Phân số', b: 'Bài 24. So sánh phân số. Hỗn số dương (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương V. Phân số', b: 'Bài 25. Phép cộng và phép trừ phân số (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương V. Phân số', b: 'Bài 26. Phép nhân và phép chia phân số (tiết 1, 2)', p: 2 },
    { w: 21, c: 'Chương V. Phân số', b: 'Bài 27. Hai bài toán về phân số (tiết 1, 2)', p: 2 },
    { w: 21, c: 'Chương V. Phân số', b: 'Luyện tập chung và Kiểm tra thường xuyên 1 (HK2)', p: 2 },
    { w: 22, c: 'Chương VI. Số thập phân', b: 'Bài 28. Số thập phân (tiết 1, 2)', p: 2 },
    { w: 22, c: 'Chương VI. Số thập phân', b: 'Bài 29. Tính toán với số thập phân (tiết 1, 2)', p: 2 },
    { w: 23, c: 'Chương VI. Số thập phân', b: 'Bài 30. Làm tròn và ước lượng (tiết 1, 2)', p: 2 },
    { w: 23, c: 'Chương VI. Số thập phân', b: 'Bài 31. Một số bài toán về tỉ số và tỉ số phần trăm & KTTX 2 (HK2)', p: 2 },
    { w: 24, c: 'Chương VI. Số thập phân', b: 'Luyện tập chung và Bài tập cuối chương VI', p: 2 },
    { w: 24, c: 'Chương VII. Tính đối xứng của hình phẳng', b: 'Bài 32. Hình có trục đối xứng (tiết 1, 2)', p: 2 },
    { w: 25, c: 'Chương VII. Tính đối xứng của hình phẳng', b: 'Bài 33. Hình có tâm đối xứng (tiết 1, 2)', p: 2 },
    { w: 25, c: 'Chương VII. Tính đối xứng của hình phẳng', b: 'Bài tập cuối chương VII: Tính đối xứng của hình phẳng', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Ôn tập kiểm tra giữa học kỳ II (Phân số, Số thập phân, Hình phẳng)', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Kiểm tra giữa học kỳ II môn Toán 6 (Đề 90 phút)', p: 2 },
    { w: 27, c: 'Chương VIII. Những hình học cơ bản', b: 'Bài 34. Điểm và đường thẳng (tiết 1, 2)', p: 2 },
    { w: 27, c: 'Chương VIII. Những hình học cơ bản', b: 'Bài 35. Điểm nằm giữa hai điểm. Tia (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương VIII. Những hình học cơ bản', b: 'Bài 36. Đoạn thẳng. Độ dài đoạn thẳng (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương VIII. Những hình học cơ bản', b: 'Bài 37. Trung điểm của đoạn thẳng (tiết 1, 2)', p: 2 },
    { w: 29, c: 'Chương VIII. Những hình học cơ bản', b: 'Bài 38. Góc (tiết 1, 2)', p: 2 },
    { w: 29, c: 'Chương VIII. Những hình học cơ bản', b: 'Bài 39. Số đo góc & Kiểm tra thường xuyên 3 (HK2)', p: 2 },
    { w: 30, c: 'Chương VIII. Những hình học cơ bản', b: 'Luyện tập chung và Bài tập cuối chương VIII', p: 2 },
    { w: 30, c: 'Chương IX. Dữ liệu và xác suất thực nghiệm', b: 'Bài 40. Thu thập và phân loại dữ liệu (tiết 1, 2)', p: 2 },
    { w: 31, c: 'Chương IX. Dữ liệu và xác suất thực nghiệm', b: 'Bài 41. Biểu diễn dữ liệu trên bảng (tiết 1, 2)', p: 2 },
    { w: 31, c: 'Chương IX. Dữ liệu và xác suất thực nghiệm', b: 'Bài 42. Kết quả có thể và sự kiện trong trò chơi, thí nghiệm & KTTX 4', p: 2 },
    { w: 32, c: 'Chương IX. Dữ liệu và xác suất thực nghiệm', b: 'Bài 43. Xác suất thực nghiệm trong một số trò chơi đơn giản (tiết 1, 2)', p: 2 },
    { w: 32, c: 'Chương IX. Dữ liệu và xác suất thực nghiệm', b: 'Bài tập cuối chương IX: Dữ liệu và xác suất', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Ôn tập cuối học kỳ II môn Toán 6 (Toàn bộ kiến thức HK2)', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Kiểm tra cuối học kỳ II môn Toán 6 (Đề 90 phút)', p: 2 },
    { w: 34, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Khảo sát thống kê và xác suất thực nghiệm (tiết 1, 2)', p: 2 },
    { w: 34, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Làm kế hoạch tài chính cá nhân (tiết 3, 4)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Trả bài kiểm tra cuối học kỳ II, chữa bài và hướng dẫn tự học hè (tiết 1, 2)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Tổng kết và đánh giá kết quả học tập môn Toán 6', p: 2 },
  ];

  let currentPeriod = 1;
  hk1Plan.forEach((item) => {
    lessons.push({
      id: `toan6-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 1,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  hk2Plan.forEach((item) => {
    lessons.push({
      id: `toan6-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 2,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  return lessons;
};

// Tạo danh sách 140 tiết chuẩn Phân phối chương trình Toán 7 (35 tuần x 4 tiết/tuần = 140 tiết)
const generateToan7Lessons = (): PpctLesson[] => {
  const lessons: PpctLesson[] = [];
  let stt = 1;

  const hk1Plan = [
    { w: 1, c: 'Chương I. Số hữu tỉ', b: 'Bài 1. Tập hợp các số hữu tỉ (tiết 1, 2)', p: 2 },
    { w: 1, c: 'Chương I. Số hữu tỉ', b: 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ (tiết 1, 2)', p: 2 },
    { w: 2, c: 'Chương I. Số hữu tỉ', b: 'Bài 2. Các phép tính với số hữu tỉ (tiết 3, 4)', p: 2 },
    { w: 2, c: 'Chương I. Số hữu tỉ', b: 'Bài 3. Lũy thừa với số mũ tự nhiên của một số hữu tỉ (tiết 1, 2)', p: 2 },
    { w: 3, c: 'Chương I. Số hữu tỉ', b: 'Bài 4. Thứ tự thực hiện các phép tính. Quy tắc dấu ngoặc (tiết 1, 2)', p: 2 },
    { w: 3, c: 'Chương I. Số hữu tỉ', b: 'Luyện tập chung chương I & Kiểm tra thường xuyên 1 (HK1)', p: 2 },
    { w: 4, c: 'Chương I. Số hữu tỉ', b: 'Bài tập cuối chương I (tiết 1, 2)', p: 2 },
    { w: 4, c: 'Chương II. Số thực', b: 'Bài 5. Làm quen với số thập phân vô hạn tuần hoàn (tiết 1, 2)', p: 2 },
    { w: 5, c: 'Chương II. Số thực', b: 'Bài 6. Số vô tỉ. Căn bậc hai số học (tiết 1, 2)', p: 2 },
    { w: 5, c: 'Chương II. Số thực', b: 'Bài 7. Tập hợp các số thực (tiết 1, 2)', p: 2 },
    { w: 6, c: 'Chương II. Số thực', b: 'Bài 8. Giá trị tuyệt đối của một số thực (tiết 1, 2)', p: 2 },
    { w: 6, c: 'Chương II. Số thực', b: 'Bài 9. Làm tròn và ước lượng số thực & Kiểm tra thường xuyên 2 (HK1)', p: 2 },
    { w: 7, c: 'Chương II. Số thực', b: 'Luyện tập chung và Bài tập cuối chương II', p: 2 },
    { w: 7, c: 'Chương III. Góc và đường thẳng song song', b: 'Bài 10. Các góc ở vị trí đặc biệt (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương III. Góc và đường thẳng song song', b: 'Bài 11. Hai đường thẳng song song và dấu hiệu nhận biết (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương III. Góc và đường thẳng song song', b: 'Bài 12. Định lí và chứng minh định lí (tiết 1, 2)', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Ôn tập kiểm tra giữa học kỳ I (Số hữu tỉ, Số thực, Góc & ĐTSS)', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Kiểm tra giữa học kỳ I môn Toán 7 (Đề 90 phút)', p: 2 },
    { w: 10, c: 'Chương III. Góc và đường thẳng song song', b: 'Luyện tập chung và Bài tập cuối chương III', p: 2 },
    { w: 10, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 13. Tổng các góc trong một tam giác (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 14. Hai tam giác bằng nhau. Trường hợp bằng nhau c-c-c (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 14. Hai tam giác bằng nhau (tiết 3) & Kiểm tra thường xuyên 3 (HK1)', p: 2 },
    { w: 12, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 15. Trường hợp bằng nhau c-g-c và g-c-g của tam giác (tiết 1, 2)', p: 2 },
    { w: 12, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 15. Trường hợp bằng nhau của tam giác (tiết 3, 4)', p: 2 },
    { w: 13, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 16. Các trường hợp bằng nhau của tam giác vuông (tiết 1, 2)', p: 2 },
    { w: 13, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 17. Tam giác cân. Đường trung trực của đoạn thẳng (tiết 1, 2)', p: 2 },
    { w: 14, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài 17. Tam giác cân (tiết 3, 4)', p: 2 },
    { w: 14, c: 'Chương IV. Tam giác bằng nhau', b: 'Luyện tập chung chương IV & Kiểm tra thường xuyên 4 (HK1)', p: 2 },
    { w: 15, c: 'Chương IV. Tam giác bằng nhau', b: 'Bài tập cuối chương IV: Tam giác bằng nhau (tiết 1, 2)', p: 2 },
    { w: 15, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 36. Hình hộp chữ nhật và hình lập phương (tiết 1, 2)', p: 2 },
    { w: 16, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 37. Hình lăng trụ đứng tam giác và tứ giác (tiết 1, 2)', p: 2 },
    { w: 16, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Tạo lập mô hình hình khối thực tiễn', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I môn Toán 7 (Đại số: Số hữu tỉ, Số thực)', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I môn Toán 7 (Hình học: Tam giác, Hình khối)', p: 2 },
    { w: 18, c: 'Kiểm tra cuối học kỳ I', b: 'Kiểm tra cuối học kỳ I môn Toán 7 (Đề 90 phút)', p: 2 },
    { w: 18, c: 'Tổng kết học kỳ I', b: 'Trả bài kiểm tra cuối học kỳ I và sơ kết đánh giá học kỳ I', p: 2 },
  ];

  const hk2Plan = [
    { w: 19, c: 'Chương V. Thu thập và biểu diễn dữ liệu', b: 'Bài 18. Thu thập và phân loại dữ liệu (tiết 1, 2)', p: 2 },
    { w: 19, c: 'Chương V. Thu thập và biểu diễn dữ liệu', b: 'Bài 19. Biểu diễn dữ liệu trên bảng và biểu đồ (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương V. Thu thập và biểu diễn dữ liệu', b: 'Bài 20. Biểu đồ hình quạt tròn và biểu đồ đoạn thẳng (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương V. Thu thập và biểu diễn dữ liệu', b: 'Bài tập cuối chương V: Dữ liệu và biểu đồ', p: 2 },
    { w: 21, c: 'Chương VI. Tỉ lệ thức và đại lượng tỉ lệ', b: 'Bài 21. Tỉ lệ thức (tiết 1, 2)', p: 2 },
    { w: 21, c: 'Chương VI. Tỉ lệ thức và đại lượng tỉ lệ', b: 'Bài 22. Tính chất của dãy tỉ số bằng nhau & KTTX 1 (HK2)', p: 2 },
    { w: 22, c: 'Chương VI. Tỉ lệ thức và đại lượng tỉ lệ', b: 'Bài 23. Đại lượng tỉ lệ thuận (tiết 1, 2)', p: 2 },
    { w: 22, c: 'Chương VI. Tỉ lệ thức và đại lượng tỉ lệ', b: 'Bài 24. Đại lượng tỉ lệ nghịch (tiết 1, 2)', p: 2 },
    { w: 23, c: 'Chương VI. Tỉ lệ thức và đại lượng tỉ lệ', b: 'Bài tập cuối chương VI: Tỉ lệ thức và đại lượng tỉ lệ', p: 2 },
    { w: 23, c: 'Chương VII. Biểu thức đại số và đa thức một biến', b: 'Bài 25. Biểu thức đại số (tiết 1, 2) & KTTX 2 (HK2)', p: 2 },
    { w: 24, c: 'Chương VII. Biểu thức đại số và đa thức một biến', b: 'Bài 26. Đa thức một biến (tiết 1, 2)', p: 2 },
    { w: 24, c: 'Chương VII. Biểu thức đại số và đa thức một biến', b: 'Bài 27. Phép cộng và phép trừ đa thức một biến (tiết 1, 2)', p: 2 },
    { w: 25, c: 'Chương VII. Biểu thức đại số và đa thức một biến', b: 'Bài 28. Phép nhân đa thức một biến (tiết 1, 2)', p: 2 },
    { w: 25, c: 'Chương VII. Biểu thức đại số và đa thức một biến', b: 'Bài 29. Phép chia đa thức một biến (tiết 1, 2)', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Ôn tập kiểm tra giữa học kỳ II (Tỉ lệ thức, Đa thức một biến)', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Kiểm tra giữa học kỳ II môn Toán 7 (Đề 90 phút)', p: 2 },
    { w: 27, c: 'Chương VII. Biểu thức đại số và đa thức một biến', b: 'Luyện tập chung và Bài tập cuối chương VII', p: 2 },
    { w: 27, c: 'Chương VIII. Làm quen với biến cố và xác suất', b: 'Bài 30. Làm quen với biến cố (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương VIII. Làm quen với biến cố và xác suất', b: 'Bài 31. Xác suất của biến cố trong một số trò chơi đơn giản (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương VIII. Làm quen với biến cố và xác suất', b: 'Bài tập cuối chương VIII: Biến cố và xác suất', p: 2 },
    { w: 29, c: 'Chương IX. Quan hệ giữa các yếu tố trong một tam giác', b: 'Bài 32. Quan hệ giữa đường vuông góc và đường xiên (tiết 1, 2)', p: 2 },
    { w: 29, c: 'Chương IX. Quan hệ giữa các yếu tố trong một tam giác', b: 'Bài 33. Quan hệ giữa ba cạnh của một tam giác & KTTX 3 (HK2)', p: 2 },
    { w: 30, c: 'Chương IX. Quan hệ giữa các yếu tố trong một tam giác', b: 'Bài 34. Sự đồng quy của ba đường trung tuyến, ba đường phân giác (tiết 1, 2)', p: 2 },
    { w: 30, c: 'Chương IX. Quan hệ giữa các yếu tố trong một tam giác', b: 'Bài 35. Sự đồng quy của ba đường cao, ba đường trung trực (tiết 1, 2)', p: 2 },
    { w: 31, c: 'Chương IX. Quan hệ giữa các yếu tố trong một tam giác', b: 'Luyện tập chung các đường đồng quy trong tam giác', p: 2 },
    { w: 31, c: 'Chương IX. Quan hệ giữa các yếu tố trong một tam giác', b: 'Bài tập cuối chương IX & Kiểm tra thường xuyên 4 (HK2)', p: 2 },
    { w: 32, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Dùng thước và compa dựng hình thực tế (tiết 1, 2)', p: 2 },
    { w: 32, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Thực hành tính xác suất qua trò chơi (tiết 3, 4)', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Ôn tập cuối học kỳ II môn Toán 7 (Toàn bộ kiến thức HK2)', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Kiểm tra cuối học kỳ II môn Toán 7 (Đề 90 phút)', p: 2 },
    { w: 34, c: 'Ôn tập tổng kết năm học', b: 'Ôn tập tổng hợp kiến thức Đại số và Hình học lớp 7 (tiết 1, 2)', p: 2 },
    { w: 34, c: 'Ôn tập tổng kết năm học', b: 'Ôn tập tổng hợp kiến thức Đại số và Hình học lớp 7 (tiết 3, 4)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Trả bài kiểm tra cuối học kỳ II, chữa bài và hướng dẫn ôn hè (tiết 1, 2)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Tổng kết và đánh giá kết quả học tập môn Toán 7', p: 2 },
  ];

  let currentPeriod = 1;
  hk1Plan.forEach((item) => {
    lessons.push({
      id: `toan7-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 1,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  hk2Plan.forEach((item) => {
    lessons.push({
      id: `toan7-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 2,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  return lessons;
};

// Tạo danh sách 140 tiết chuẩn Phân phối chương trình Toán 8 (35 tuần x 4 tiết/tuần = 140 tiết)
const generateToan8Lessons = (): PpctLesson[] => {
  const lessons: PpctLesson[] = [];
  let stt = 1;

  const hk1Plan = [
    { w: 1, c: 'Chương I. Đa thức nhiều biến', b: 'Bài 1. Đơn thức nhiều biến. Đa thức nhiều biến (tiết 1, 2)', p: 2 },
    { w: 1, c: 'Chương I. Đa thức nhiều biến', b: 'Bài 2. Các phép toán cộng, trừ đa thức nhiều biến (tiết 1, 2)', p: 2 },
    { w: 2, c: 'Chương I. Đa thức nhiều biến', b: 'Bài 3. Phép nhân đa thức nhiều biến (tiết 1, 2)', p: 2 },
    { w: 2, c: 'Chương I. Đa thức nhiều biến', b: 'Bài 4. Phép chia đa thức cho đơn thức (tiết 1, 2)', p: 2 },
    { w: 3, c: 'Chương I. Đa thức nhiều biến', b: 'Luyện tập chung và Bài tập cuối chương I', p: 2 },
    { w: 3, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Bài 5. Hằng đẳng thức đáng nhớ: Bình phương của tổng, hiệu & KTTX 1', p: 2 },
    { w: 4, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Bài 5. Hiệu hai bình phương (tiết 2, 3)', p: 2 },
    { w: 4, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Bài 6. Lập phương của một tổng, một hiệu (tiết 1, 2)', p: 2 },
    { w: 5, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Bài 7. Tổng và hiệu của hai lập phương (tiết 1, 2)', p: 2 },
    { w: 5, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Bài 8. Phân tích đa thức thành nhân tử: Đặt nhân tử chung, dùng HĐT (tiết 1, 2)', p: 2 },
    { w: 6, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Bài 8. Phân tích đa thức thành nhân tử: Nhóm hạng tử (tiết 3, 4)', p: 2 },
    { w: 6, c: 'Chương II. Hằng đẳng thức đáng nhớ', b: 'Luyện tập chung và Bài tập cuối chương II & Kiểm tra thường xuyên 2', p: 2 },
    { w: 7, c: 'Chương III. Tứ giác', b: 'Bài 9. Tứ giác. Hình thang cân (tiết 1, 2)', p: 2 },
    { w: 7, c: 'Chương III. Tứ giác', b: 'Bài 10. Hình bình hành. Hình thoi (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương III. Tứ giác', b: 'Bài 11. Hình chữ nhật. Hình vuông (tiết 1, 2)', p: 2 },
    { w: 8, c: 'Chương III. Tứ giác', b: 'Luyện tập chung chương III: Các dạng tứ giác đặc biệt', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Ôn tập kiểm tra giữa học kỳ I (Đa thức, Hằng đẳng thức, Tứ giác)', p: 2 },
    { w: 9, c: 'Ôn tập & Kiểm tra giữa kì I', b: 'Kiểm tra giữa học kỳ I môn Toán 8 (Đề 90 phút)', p: 2 },
    { w: 10, c: 'Chương III. Tứ giác', b: 'Bài tập cuối chương III: Tứ giác (tiết 1, 2)', p: 2 },
    { w: 10, c: 'Chương IV. Định lí Thalès trong tam giác', b: 'Bài 12. Định lí Thalès trong tam giác (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương IV. Định lí Thalès trong tam giác', b: 'Bài 13. Đường trung bình của tam giác (tiết 1, 2)', p: 2 },
    { w: 11, c: 'Chương IV. Định lí Thalès trong tam giác', b: 'Bài 14. Tính chất đường phân giác của tam giác & KTTX 3 (HK1)', p: 2 },
    { w: 12, c: 'Chương IV. Định lí Thalès trong tam giác', b: 'Luyện tập chung và Bài tập cuối chương IV', p: 2 },
    { w: 12, c: 'Chương V. Dữ liệu và biểu đồ', b: 'Bài 15. Thu thập và phân loại dữ liệu (tiết 1, 2)', p: 2 },
    { w: 13, c: 'Chương V. Dữ liệu và biểu đồ', b: 'Bài 16. Lựa chọn biểu đồ thích hợp để biểu diễn dữ liệu (tiết 1, 2)', p: 2 },
    { w: 13, c: 'Chương V. Dữ liệu và biểu đồ', b: 'Bài 17. Biểu diễn dữ liệu trên các bảng, biểu đồ (tiết 1, 2)', p: 2 },
    { w: 14, c: 'Chương V. Dữ liệu và biểu đồ', b: 'Bài tập cuối chương V: Dữ liệu và biểu đồ', p: 2 },
    { w: 14, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 33. Hình chóp tam giác đều (tiết 1) & Kiểm tra thường xuyên 4', p: 2 },
    { w: 15, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài 34. Hình chóp tứ giác đều (tiết 1, 2)', p: 2 },
    { w: 15, c: 'Chương X. Một số hình khối trong thực tiễn', b: 'Bài tập cuối chương X: Diện tích xung quanh và thể tích hình chóp', p: 2 },
    { w: 16, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Làm mô hình hình chóp và đo đạc thực địa', p: 2 },
    { w: 16, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Khảo sát thống kê tại trường', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I môn Toán 8 (Phần Đại số)', p: 2 },
    { w: 17, c: 'Ôn tập cuối học kỳ I', b: 'Ôn tập cuối học kỳ I môn Toán 8 (Phần Hình học)', p: 2 },
    { w: 18, c: 'Kiểm tra cuối học kỳ I', b: 'Kiểm tra cuối học kỳ I môn Toán 8 (Đề 90 phút)', p: 2 },
    { w: 18, c: 'Tổng kết học kỳ I', b: 'Trả bài kiểm tra cuối học kỳ I và sơ kết đánh giá học kỳ I', p: 2 },
  ];

  const hk2Plan = [
    { w: 19, c: 'Chương VI. Phân thức đại số', b: 'Bài 18. Khái niệm phân thức đại số (tiết 1, 2)', p: 2 },
    { w: 19, c: 'Chương VI. Phân thức đại số', b: 'Bài 19. Tính chất cơ bản của phân thức đại số (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương VI. Phân thức đại số', b: 'Bài 20. Phép cộng và phép trừ phân thức đại số (tiết 1, 2)', p: 2 },
    { w: 20, c: 'Chương VI. Phân thức đại số', b: 'Bài 21. Phép nhân và phép chia phân thức đại số (tiết 1, 2)', p: 2 },
    { w: 21, c: 'Chương VI. Phân thức đại số', b: 'Luyện tập chung các phép toán về phân thức đại số', p: 2 },
    { w: 21, c: 'Chương VI. Phân thức đại số', b: 'Bài tập cuối chương VI & Kiểm tra thường xuyên 1 (HK2)', p: 2 },
    { w: 22, c: 'Chương VII. Phương trình bậc nhất và hàm số bậc nhất', b: 'Bài 22. Phương trình bậc nhất một ẩn (tiết 1, 2)', p: 2 },
    { w: 22, c: 'Chương VII. Phương trình bậc nhất và hàm số bậc nhất', b: 'Bài 23. Giải bài toán bằng cách lập phương trình (tiết 1, 2)', p: 2 },
    { w: 23, c: 'Chương VII. Phương trình bậc nhất và hàm số bậc nhất', b: 'Bài 24. Khái niệm hàm số và đồ thị của hàm số (tiết 1, 2)', p: 2 },
    { w: 23, c: 'Chương VII. Phương trình bậc nhất và hàm số bậc nhất', b: 'Bài 25. Hàm số bậc nhất y = ax + b (a ≠ 0) & KTTX 2 (HK2)', p: 2 },
    { w: 24, c: 'Chương VII. Phương trình bậc nhất và hàm số bậc nhất', b: 'Bài 26. Hệ số góc của đường thẳng (tiết 1, 2)', p: 2 },
    { w: 24, c: 'Chương VII. Phương trình bậc nhất và hàm số bậc nhất', b: 'Luyện tập chung và Bài tập cuối chương VII', p: 2 },
    { w: 25, c: 'Chương VIII. Mở đầu về tính xác suất của biến cố', b: 'Bài 27. Xác suất của biến cố ngẫu nhiên (tiết 1, 2)', p: 2 },
    { w: 25, c: 'Chương VIII. Mở đầu về tính xác suất của biến cố', b: 'Bài 28. Xác suất của biến cố trong một số trò chơi đơn giản (tiết 1, 2)', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Ôn tập kiểm tra giữa học kỳ II (Phân thức, Phương trình, Hàm số bậc nhất)', p: 2 },
    { w: 26, c: 'Ôn tập & Kiểm tra giữa kì II', b: 'Kiểm tra giữa học kỳ II môn Toán 8 (Đề 90 phút)', p: 2 },
    { w: 27, c: 'Chương IX. Tam giác đồng dạng', b: 'Bài 29. Hai tam giác đồng dạng (tiết 1, 2)', p: 2 },
    { w: 27, c: 'Chương IX. Tam giác đồng dạng', b: 'Bài 30. Trường hợp đồng dạng thứ nhất: c-c-c (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương IX. Tam giác đồng dạng', b: 'Bài 31. Trường hợp đồng dạng thứ hai: c-g-c (tiết 1, 2)', p: 2 },
    { w: 28, c: 'Chương IX. Tam giác đồng dạng', b: 'Bài 32. Trường hợp đồng dạng thứ ba: g-g (tiết 1, 2)', p: 2 },
    { w: 29, c: 'Chương IX. Tam giác đồng dạng', b: 'Bài 33. Các trường hợp đồng dạng của hai tam giác vuông (tiết 1, 2)', p: 2 },
    { w: 29, c: 'Chương IX. Tam giác đồng dạng', b: 'Luyện tập chung và Bài tập cuối chương IX & KTTX 3 (HK2)', p: 2 },
    { w: 30, c: 'Chương IX. Tam giác đồng dạng', b: 'Định lí Pythagore và ứng dụng trong tam giác đồng dạng (tiết 1, 2)', p: 2 },
    { w: 30, c: 'Chương IX. Tam giác đồng dạng', b: 'Ứng dụng thực tế của tam giác đồng dạng (Đo chiều cao, khoảng cách)', p: 2 },
    { w: 31, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Đo gián tiếp chiều cao vật thể ngoài trời', p: 2 },
    { w: 31, c: 'Thực hành trải nghiệm', b: 'Hoạt động trải nghiệm: Ứng dụng hàm số bậc nhất trong thực tiễn & KTTX 4', p: 2 },
    { w: 32, c: 'Ôn tập cuối học kỳ II', b: 'Ôn tập học kỳ II: Phân thức đại số và Phương trình bậc nhất (tiết 1, 2)', p: 2 },
    { w: 32, c: 'Ôn tập cuối học kỳ II', b: 'Ôn tập học kỳ II: Tam giác đồng dạng và Hình khối thực tế (tiết 3, 4)', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Ôn tập tổng hợp chuẩn bị kiểm tra cuối học kỳ II', p: 2 },
    { w: 33, c: 'Ôn tập & Kiểm tra cuối kì II', b: 'Kiểm tra cuối học kỳ II môn Toán 8 (Đề 90 phút)', p: 2 },
    { w: 34, c: 'Ôn tập tổng kết năm học', b: 'Ôn tập chuyên đề nâng cao kiến thức chuẩn bị vào lớp 9 (tiết 1, 2)', p: 2 },
    { w: 34, c: 'Ôn tập tổng kết năm học', b: 'Ôn tập chuyên đề nâng cao kiến thức chuẩn bị vào lớp 9 (tiết 3, 4)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Trả bài kiểm tra cuối học kỳ II, chữa bài và hướng dẫn ôn hè (tiết 1, 2)', p: 2 },
    { w: 35, c: 'Tổng kết năm học', b: 'Tổng kết và đánh giá kết quả học tập môn Toán 8', p: 2 },
  ];

  let currentPeriod = 1;
  hk1Plan.forEach((item) => {
    lessons.push({
      id: `toan8-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 1,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  hk2Plan.forEach((item) => {
    lessons.push({
      id: `toan8-l-${stt}`,
      stt: stt++,
      tuan: item.w,
      hocKy: 2,
      chuong: item.c,
      baiHoc: item.b,
      soTiet: item.p,
      tietPPCT: currentPeriod + item.p - 1,
    });
    currentPeriod += item.p;
  });

  return lessons;
};

export const defaultPpctDataset6: PpctDataset = {
  id: 'ppct-toan-6-default',
  name: 'Toán 6 — PPCT TOÁN 6 (140 tiết / 35 tuần)',
  fileName: 'PPCT TOAN 6 GDPT 2018 (140 tiet).docx',
  subject: 'Toán',
  grade: '6',
  school: 'TRƯỜNG THCS NGUYỄN DU',
  academicYear: '2025 - 2026',
  totalLessons: 140,
  lessons: generateToan6Lessons(),
};

export const defaultPpctDataset7: PpctDataset = {
  id: 'ppct-toan-7-default',
  name: 'Toán 7 — PPCT TOÁN 7 (140 tiết / 35 tuần)',
  fileName: 'PPCT TOAN 7 GDPT 2018 (140 tiet).docx',
  subject: 'Toán',
  grade: '7',
  school: 'TRƯỜNG THCS NGUYỄN DU',
  academicYear: '2025 - 2026',
  totalLessons: 140,
  lessons: generateToan7Lessons(),
};

export const defaultPpctDataset8: PpctDataset = {
  id: 'ppct-toan-8-default',
  name: 'Toán 8 — PPCT TOÁN 8 (140 tiết / 35 tuần)',
  fileName: 'PPCT TOAN 8 GDPT 2018 (140 tiet).docx',
  subject: 'Toán',
  grade: '8',
  school: 'TRƯỜNG THCS NGUYỄN DU',
  academicYear: '2025 - 2026',
  totalLessons: 140,
  lessons: generateToan8Lessons(),
};

export const defaultPpctDataset9: PpctDataset = {
  id: 'ppct-toan-9-2026',
  name: 'Toán 9 — PPCT TOÁN 9 (140 tiết / 35 tuần)',
  fileName: 'PPCT TOAN 9 GDPT 2018 (140 tiet).docx',
  subject: 'Toán',
  grade: '9',
  school: 'TRƯỜNG THCS NGUYỄN DU',
  academicYear: '2025 - 2026',
  totalLessons: 140,
  lessons: generateToan9Lessons(),
};

export const defaultPpctDataset: PpctDataset = defaultPpctDataset9;

export const defaultDatasets: PpctDataset[] = [
  defaultPpctDataset9,
  defaultPpctDataset8,
  defaultPpctDataset7,
  defaultPpctDataset6,
];

export const defaultMatrixConfig: MatrixConfig = {
  schoolName: 'TRƯỜNG THCS NGUYỄN DU',
  department: 'TỔ TOÁN - TIN',
  subject: 'Toán',
  grade: '9',
  examPeriod: 'Kiểm tra cuối học kỳ II',
  examDuration: '90 phút',
  limitWeekFrom: 19,
  limitWeekTo: 33,
  ratioTn: 70,
  ratioTl: 30,
  structureType: 'moet_2025_new',
  scorePerTn: 0.25,
  scorePerTn1: 0.25,
  scorePerTn2: 1.0,
  scorePerTn3: 0.5,
  scorePerTl: 1.0,
  academicYear: '2025 - 2026',
  targetTotalScore: 10,
  cognitiveLevelRatios: {
    nhanBiet: 30,
    thongHieu: 40,
    vanDung: 20,
    vanDungCao: 10,
  },
  sampleLoadedName: 'Ma trận & Bảng đặc tả chuẩn Bộ GD&ĐT (19 cột PL1 & 16 cột PL2)',
  officialDocumentRef: '',
};

export const defaultMatrixRows: MatrixRow[] = [
  {
    id: 'm1',
    tt: 1,
    chuong: 'Hàm số y = ax² (a ≠ 0) và phương trình bậc hai một ẩn',
    noiDung: 'Hàm số y = ax² (a ≠ 0) và đồ thị. Phương trình bậc hai một ẩn. Định lí Viète',
    soTiet: 16,
    tiLeThoiLuong: 25,
    nhieuLuaChon: { biet: 1, hieu: 1, vanDung: 0 },
    dungSai: { biet: 1, hieu: 0, vanDung: 0 },
    traLoiNgan: { biet: 0, hieu: 0, vanDung: 0 },
    tuLuan: { biet: 0, hieu: 0, vanDung: 1 },
    nhanBiet: { tn: 2, tl: 0, tn1: 1, tn2: 1, tn3: 0 },
    thongHieu: { tn: 1, tl: 0, tn1: 1, tn2: 0, tn3: 0 },
    vanDung: { tn: 0, tl: 1, tn1: 0, tn2: 0, tn3: 0 },
    vanDungCao: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
  },
  {
    id: 'm2',
    tt: 2,
    chuong: 'Một số yếu tố thống kê',
    noiDung: 'Bảng tần số, biểu đồ tần số. Bảng tần số tương đối, biểu đồ tần số tương đối',
    soTiet: 8,
    tiLeThoiLuong: 12,
    nhieuLuaChon: { biet: 1, hieu: 1, vanDung: 0 },
    dungSai: { biet: 0, hieu: 0, vanDung: 0 },
    traLoiNgan: { biet: 1, hieu: 1, vanDung: 0 },
    tuLuan: { biet: 0, hieu: 0, vanDung: 0 },
    nhanBiet: { tn: 2, tl: 0, tn1: 1, tn2: 0, tn3: 1 },
    thongHieu: { tn: 2, tl: 0, tn1: 1, tn2: 0, tn3: 1 },
    vanDung: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
    vanDungCao: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
  },
  {
    id: 'm3',
    tt: 3,
    chuong: 'Một số yếu tố xác suất',
    noiDung: 'Phép thử ngẫu nhiên và không gian mẫu. Xác suất của biến cố',
    soTiet: 8,
    tiLeThoiLuong: 12,
    nhieuLuaChon: { biet: 1, hieu: 1, vanDung: 0 },
    dungSai: { biet: 0, hieu: 0, vanDung: 0 },
    traLoiNgan: { biet: 0, hieu: 1, vanDung: 0 },
    tuLuan: { biet: 0, hieu: 0, vanDung: 0 },
    nhanBiet: { tn: 1, tl: 0, tn1: 1, tn2: 0, tn3: 0 },
    thongHieu: { tn: 2, tl: 0, tn1: 1, tn2: 0, tn3: 1 },
    vanDung: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
    vanDungCao: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
  },
  {
    id: 'm4',
    tt: 4,
    chuong: 'Đường tròn và đa giác đều',
    noiDung: 'Góc ở tâm, góc nội tiếp. Đa giác đều. Đường tròn ngoại tiếp và nội tiếp',
    soTiet: 16,
    tiLeThoiLuong: 25,
    nhieuLuaChon: { biet: 2, hieu: 2, vanDung: 0 },
    dungSai: { biet: 0, hieu: 1, vanDung: 0 },
    traLoiNgan: { biet: 0, hieu: 1, vanDung: 0 },
    tuLuan: { biet: 0, hieu: 0, vanDung: 1 },
    nhanBiet: { tn: 2, tl: 0, tn1: 2, tn2: 0, tn3: 0 },
    thongHieu: { tn: 4, tl: 0, tn1: 2, tn2: 1, tn3: 1 },
    vanDung: { tn: 0, tl: 1, tn1: 0, tn2: 0, tn3: 0 },
    vanDungCao: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
  },
  {
    id: 'm5',
    tt: 5,
    chuong: 'Một số hình khối trong thực tiễn',
    noiDung: 'Hình trụ, hình nón, hình cầu: Diện tích xung quanh và thể tích',
    soTiet: 16,
    tiLeThoiLuong: 26,
    nhieuLuaChon: { biet: 1, hieu: 1, vanDung: 0 },
    dungSai: { biet: 0, hieu: 0, vanDung: 0 },
    traLoiNgan: { biet: 0, hieu: 0, vanDung: 0 },
    tuLuan: { biet: 0, hieu: 0, vanDung: 1 },
    nhanBiet: { tn: 1, tl: 0, tn1: 1, tn2: 0, tn3: 0 },
    thongHieu: { tn: 1, tl: 0, tn1: 1, tn2: 0, tn3: 0 },
    vanDung: { tn: 0, tl: 0, tn1: 0, tn2: 0, tn3: 0 },
    vanDungCao: { tn: 0, tl: 1, tn1: 0, tn2: 0, tn3: 0 },
  },
];
