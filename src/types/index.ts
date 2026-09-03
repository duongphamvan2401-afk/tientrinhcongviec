export interface PpctLesson {
  id: string;
  stt: number;
  tuan: number;
  hocKy: 1 | 2;
  chuong: string;
  baiHoc: string;
  soTiet?: number;
  tietPPCT?: number;
  ghiChu?: string;
}

export interface PpctDataset {
  id: string;
  name: string;
  fileName: string;
  subject: string;
  grade: string;
  school: string;
  academicYear: string;
  totalLessons: number;
  lessons: PpctLesson[];
  sgkVolume1Id?: string; // ID của SGK Tập 1 gắn với PPCT này
  sgkVolume2Id?: string; // ID của SGK Tập 2 gắn với PPCT này
}

export interface SgkLearningObjective {
  nhanBiet: string;
  thongHieu: string;
  vanDung: string;
}

export interface SgkLesson {
  id: string;
  lessonNumber: number;
  title: string;
  shortTitle: string;
  periods: number;
  pageRange?: string;
  keyKnowledgePoints?: string[];
  objectives: SgkLearningObjective;
}

export interface SgkChapter {
  id: string;
  chapterNumber: number;
  title: string;
  shortTitle: string;
  branch: 'DaiSo' | 'HinhHoc' | 'ThongKeXacSuat';
  totalPeriods: number;
  lessons: SgkLesson[];
}

export interface SgkBook {
  id: string;
  title: string;
  series: 'ket_noi_tri_thuc' | 'canh_dieu' | 'chan_troi_sang_tao' | 'custom';
  grade: string;
  volume: 1 | 2; // 1: Tập 1 (HK1), 2: Tập 2 (HK2)
  publisher: string;
  chapters: SgkChapter[];
  sourceFileName?: string;
  uploadedAt?: string;
}

export interface ExamEventDefinition {
  id: string;
  term: 1 | 2;
  title: string;
  type: 'kttx' | 'giua_ky' | 'cuoi_ky';
  week: number;
  customScopeWeeks?: [number, number];
  customExactDateText?: string;
}

export interface TimeframeConfig {
  startDateWeek1: string; // YYYY-MM-DD
  currentDate: string; // YYYY-MM-DD
  periodsPerWeek: number; // e.g. 4
  totalWeeksHK1: number; // e.g. 18
  totalWeeksHK2: number; // e.g. 17
  totalWeeksYear: number; // e.g. 35
  totalPeriodsHK1: number; // e.g. 72 (18 * 4)
  totalPeriodsHK2: number; // e.g. 68 (17 * 4)
  totalPeriodsYear: number; // e.g. 140 (35 * 4)
  midtermWeekHK1: number; // e.g. 9
  finalWeekHK1: number; // e.g. 18
  midtermWeekHK2: number; // e.g. 26
  finalWeekHK2: number; // e.g. 33
  examStartDayOfWeek: number; // 2 = Thứ 2, ..., 5 = Thứ 5, 6 = Thứ 6
  examDurationDays: number; // e.g. 2
  kttxCountPerTerm: number; // e.g. 4
  kttxWeeksHK1: number[]; // e.g. [3, 6, 11, 14]
  kttxWeeksHK2: number[]; // e.g. [21, 23, 29, 31]
  customEvents?: ExamEventDefinition[];
}

export interface ExamEvent {
  id: string;
  term: 1 | 2;
  title: string;
  type: 'kttx' | 'giua_ky' | 'cuoi_ky';
  week: number;
  exactDateText: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isPast: boolean;
  isCurrent: boolean;
  suggestedScope: string;
  lessonCount: number;
  chapterSummaries: { chapter: string; lessons: string[] }[];
}

export interface Cognitive3Levels {
  biet: number;
  hieu: number;
  vanDung: number;
}

export interface SpecCognitive3Columns {
  biet: string;
  hieu: string;
  vanDung: string;
}

export interface MatrixCellScore {
  tn: number; // Số câu trắc nghiệm nhiều lựa chọn / TNKQ chuẩn
  tl: number; // Số câu tự luận
  tn1?: number; // Dạng I: TN Nhiều lựa chọn (0.25đ/câu)
  tn2?: number; // Dạng II: TN Đúng/Sai (1.0đ/câu 4 ý hoặc 0.25đ/lệnh)
  tn3?: number; // Dạng III: TN Trả lời ngắn (0.25đ - 0.5đ/câu)
}

export interface MatrixRow {
  id: string;
  tt: number;
  chuong: string; // Chương / Chủ đề
  noiDung: string; // Nội dung / Đơn vị kiến thức
  soTiet?: number; // Số tiết thực tế từ PPCT
  tiLeThoiLuong?: number; // % thời lượng thực tế
  
  // Cấu trúc Phụ lục 1 mới theo hình (19 cột: 3 dạng TNKQ + Tự luận x 3 mức độ Biết, Hiểu, Vận dụng)
  nhieuLuaChon?: Cognitive3Levels; // TNKQ Nhiều lựa chọn (Biết, Hiểu, Vận dụng)
  dungSai?: Cognitive3Levels;      // TNKQ "Đúng - sai" (Biết, Hiểu, Vận dụng)
  traLoiNgan?: Cognitive3Levels;   // TNKQ Trả lời ngắn (Biết, Hiểu, Vận dụng)
  tuLuan?: Cognitive3Levels;       // Tự luận (Biết, Hiểu, Vận dụng)

  // Trường tương thích
  nhanBiet: MatrixCellScore;
  thongHieu: MatrixCellScore;
  vanDung: MatrixCellScore;
  vanDungCao: MatrixCellScore;
  customScore?: number;
  tiLeDiem?: number;
  ghiChu?: string;
}

export type MatrixStructureType = 'moet_2025_new' | 'standard_2018';

export interface MatrixConfig {
  schoolName: string;
  department: string;
  subject: string;
  grade: string;
  examPeriod: string; // e.g. "Kiểm tra giữa học kỳ I"
  examDuration: string; // e.g. "90 phút"
  
  // Giới hạn nội dung kiểm tra theo PPCT (khoảng tuần & tiết cụ thể)
  limitWeekFrom: number; // e.g. 1
  limitWeekTo: number; // e.g. 9
  limitPeriodTo?: number; // e.g. tiết 35
  selectedLessonKeys?: string[]; // Danh sách bài học/chủ đề cụ thể được chọn trong phạm vi
  
  // Tỉ lệ % Trắc nghiệm / Tự luận (mặc định 70% TN, 30% TL)
  ratioTn: number; // 70 (%)
  ratioTl: number; // 30 (%)
  
  // Cấu trúc ma trận: Cấu trúc mới BGD (Đầy đủ 3 dạng TN + TL) hoặc Chuẩn (TNKQ & TL)
  structureType: MatrixStructureType;
  
  scorePerTn: number; // e.g. 0.25
  scorePerTn1: number; // e.g. 0.25 (Dạng I: 4 lựa chọn)
  scorePerTn2: number; // e.g. 1.0 (Dạng II: Đúng/Sai 4 ý)
  scorePerTn3: number; // e.g. 0.5 (Dạng III: Trả lời ngắn)
  scorePerTl: number; // e.g. 1.0 (Tự luận)
  
  academicYear: string; // e.g. "2026 - 2027"
  targetTotalScore: number; // 10
  cognitiveLevelRatios: {
    nhanBiet: number; // e.g. 40 (%)
    thongHieu: number; // e.g. 30 (%)
    vanDung: number; // e.g. 20 (%)
    vanDungCao: number; // e.g. 10 (%)
  };
  sampleLoadedName?: string;
  officialDocumentRef?: string; // e.g. "Công văn số .../SGDĐT-GDTrH&TX"
  activeSgkBookId?: string; // ID của bộ SGK đang sử dụng để đối chiếu YCCĐ
  activeSgkVolume?: 1 | 2 | 'all'; // Tập 1 (HK1), Tập 2 (HK2) hoặc Cả hai tập
}

export type CognitiveLevel = 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao';

export interface SpecificationItem {
  id: string;
  mucDo: CognitiveLevel;
  mucDoLabel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  yeuCauCanDat: string;
  
  // 12 ô câu hỏi cho Phụ lục 2 mới (chuẩn 16 cột theo ảnh)
  nlc?: SpecCognitive3Columns; // TNKQ Nhiều lựa chọn: { biet: string, hieu: string, vanDung: string }
  ds?: SpecCognitive3Columns;  // TNKQ Đúng - sai: { biet: string, hieu: string, vanDung: string }
  tln?: SpecCognitive3Columns; // TNKQ Trả lời ngắn: { biet: string, hieu: string, vanDung: string }
  tl?: SpecCognitive3Columns;  // Tự luận: { biet: string, hieu: string, vanDung: string }

  soCauTN?: number;
  soCauTL?: number;
  cauHoiTNText?: string; // e.g. "[C1]", "[C2-C3]", "[C13]"
  cauHoiTLText?: string; // e.g. "[C19]", "[C20]"
  diem?: number;
}

export interface SpecificationRow {
  id: string;
  tt?: number;
  chuong: string; // Tên Chương / Chủ đề (e.g. "Chủ đề 1: Hàm số bậc nhất (15 tiết)")
  soTietChuong?: number;
  noiDung: string; // Tên Nội dung / Đơn vị kiến thức
  items: SpecificationItem[];
}

export interface TopicPointCalc {
  topicIndex: number;
  topicName: string;
  periods: number;
  rawScore: number;
  roundedScore: number;
}

// ==========================================
// THÔNG TIN VÀ DỮ LIỆU DÀNH CHO GIÁO VIÊN CHỦ NHIỆM (GVCN)
// ==========================================

export type TabType = 'progress' | 'matrix' | 'exam_builder' | 'gvcn';

export interface GvcnClassInfo {
  className: string; // e.g. "Lớp 9A1"
  grade: string; // "9"
  academicYear: string; // "2026 - 2027"
  schoolName: string;
  homeroomTeacher: string; // Tên GVCN
  room: string; // e.g. "Phòng 204 - Dãy B"
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  youthUnionMembers: number; // Đội viên / Đoàn viên
  boardOfLeaders: {
    monitor: string; // Lớp trưởng
    viceMonitorStudy: string; // Lớp phó học tập
    viceMonitorDiscipline: string; // Lớp phó lao động / kỷ luật
    treasurer: string; // Thủ quỹ
    secretary: string; // Bí thư Chi đội
  };
  parentCommittee: {
    head: string; // Trưởng ban đại diện CMHS
    headPhone: string;
    deputy: string; // Phó ban đại diện CMHS
    deputyPhone: string;
    zaloGroupLink?: string;
  };
}

export interface GvcnClassRule {
  id: string;
  category: 'chuyen_can' | 'tac_phong' | 'hoc_tap' | 've_sinh' | 'dao_duc';
  categoryLabel: string;
  title: string;
  description: string;
  penaltyPoints: number; // Điểm trừ khi vi phạm (vd: -2, -5)
  rewardPoints: number; // Điểm cộng nếu làm tốt (vd: +2, +5)
}

export interface GvcnSubjectGrade {
  subject: string; // e.g. "Toán", "Ngữ văn", "Tiếng Anh", "KHTN", "Lịch sử & Địa lý", "GDCD", "Tin học", "Công nghệ", "GDTC", "Nghệ thuật"
  ddgTx: (number | string)[]; // Điểm ĐĐGtx1, tx2, tx3...
  ddgGk?: number | string; // Điểm ĐĐGgk
  ddgCk?: number | string; // Điểm ĐĐGck
  dtbMhk?: number | string; // Điểm ĐTBmhk
  danhGia?: 'Đ' | 'CĐ'; // Đạt / Chưa đạt đối với môn đánh giá bằng nhận xét
}

export interface GvcnStudentGrades {
  semester: 'HK1' | 'HK2' | 'CN';
  dtbChung: number; // Điểm trung bình các môn học
  hocLucTT22: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
  subjects: GvcnSubjectGrade[];
}

export interface GvcnTT22Evaluation {
  renLuyen: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt'; // Kết quả rèn luyện (Hạnh kiểm) theo TT22
  hocTap: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt'; // Kết quả học tập (Học lực) theo TT22
  phamChat: string; // Nhận xét về phẩm chất (Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm)
  nangLuc: string; // Nhận xét về năng lực (Tự chủ, giao tiếp, sáng tạo & năng lực đặc thù)
  nhanXetChung: string; // Nhận xét tổng thể của GVCN vào học bạ / vnEdu
  khenThuong?: 'Học sinh Xuất sắc' | 'Học sinh Giỏi' | 'Khen thưởng chuyên đề' | 'Không';
  updatedAt?: string;
}

export interface GvcnStudent {
  id: string;
  stt: number;
  studentCode?: string; // Mã học sinh vnEdu (e.g. "2100456789")
  name: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  group: 1 | 2 | 3 | 4; // Tổ 1, 2, 3, 4
  phone?: string;
  parentName: string;
  parentPhone: string;
  address?: string;
  role?: string; // "Lớp trưởng", "Tổ trưởng", "Học sinh"
  category?: 'normal' | 'gifted' | 'difficult' | 'special_care'; // Phân loại học sinh
  note?: string;
  grades?: GvcnStudentGrades;
  tt22Evaluation?: GvcnTT22Evaluation;
}

export interface GvcnLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  week: number;
  studentId: string;
  studentName: string;
  group: 1 | 2 | 3 | 4;
  type: 'violation' | 'merit'; // Vi phạm hoặc Việc tốt / Khen thưởng
  category: 'chuyen_can' | 'tac_phong' | 'hoc_tap' | 've_sinh' | 'dao_duc' | 'khen_thuong';
  description: string;
  points: number; // Điểm thay đổi (âm hoặc dương)
  status: 'resolved' | 'pending' | 'parent_notified';
  resolutionNote?: string;
}

export interface GvcnGroupScore {
  group: 1 | 2 | 3 | 4;
  groupName: string; // "Tổ 1", "Tổ 2", ...
  leaderName: string;
  initialPoints: number; // 100
  deductedPoints: number;
  bonusPoints: number;
  totalPoints: number;
  rank: number;
  note?: string;
}

export interface GvcnWeeklyRecord {
  week: number;
  dateRange: string; // e.g. "07/09/2026 - 12/09/2026"
  groupScores: GvcnGroupScore[];
  logs: GvcnLogEntry[];
  meetingMinutes?: {
    date: string;
    teacherComment: string;
    monitorReport: string;
    specialNotices: string;
    nextWeekGoals: string;
    commendations: string[]; // Tuyên dương
    reminders: string[]; // Nhắc nhở
  };
}

export interface GvcnSpecialStudent {
  id: string;
  studentId: string;
  studentName: string;
  group: number;
  type: 'kho_khan' | 'yeu_kem' | 'ca_biet' | 'tam_ly';
  typeLabel: string;
  circumstance: string; // Hoàn cảnh gia đình, nguyên nhân
  pedagogicalMeasures: string; // Biện pháp sư phạm của GVCN (uốn nắn tích cực)
  assignedBuddy?: string; // Đôi bạn cùng tiến
  progressNotes: {
    date: string;
    note: string;
    status: 'improving' | 'stable' | 'needs_attention';
  }[];
}

export interface GvcnParentContact {
  id: string;
  date: string;
  studentName: string;
  parentName: string;
  phone: string;
  contactMethod: 'phone' | 'direct_meeting' | 'zalo' | 'home_visit';
  reason: string;
  content: string;
  parentFeedback: string;
  resultAgreement: string;
  status: 'completed' | 'follow_up_needed';
}

export interface GvcnMonthlyTask {
  month: number; // 9 -> 5
  monthName: string; // "Tháng 9/2026"
  theme: string; // Chủ điểm tháng
  tasks: {
    id: string;
    title: string;
    targetWeek: number;
    deadline?: string;
    completed: boolean;
    note?: string;
  }[];
}

// ==========================================
// THÔNG TIN VÀ DỮ LIỆU TẠO ĐỀ KIỂM TRA (EXAM BUILDER)
// ==========================================

export type ExamLevelType = 'kttx' | 'giua_ky' | 'cuoi_ky' | 'custom';
export type ExamStructureFormat = 'moet_2025_new' | 'standard_2018' | 'standard_70_30' | 'tn_only' | 'tl_only';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface ExamQuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ExamTrueFalseStatement {
  subKey: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  explanation?: string;
}

export interface ExamEssayGradingStep {
  step: string;
  point: number;
}

export interface ExamQuestion {
  id: string;
  code: string; // "[C1]", "[C2]", "[C13]"...
  section: 'part1_mcq' | 'part2_true_false' | 'part3_short_answer' | 'part4_essay';
  type: QuestionType;
  prompt: string;
  
  // MCQ (Dạng 1)
  options?: ExamQuestionOption[];
  correctOption?: 'A' | 'B' | 'C' | 'D';

  // True / False 4 ý (Dạng 2)
  tfStatements?: ExamTrueFalseStatement[];

  // Trả lời ngắn (Dạng 3)
  shortAnswerText?: string;

  // Tự luận (Dạng 4)
  essayGradingSteps?: ExamEssayGradingStep[];

  // Metadata & Bám sát Ma trận & YCCĐ
  score: number;
  cognitiveLevel: 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao';
  cognitiveLevelLabel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  chapter: string;
  lesson: string;
  learningObjective?: string; // Yêu cầu cần đạt tương ứng
  solutionExplanation?: string; // Lời giải và giải thích chi tiết
}

export interface ExamPaperConfig {
  examLevel: ExamLevelType; // 'kttx' | 'giua_ky' | 'cuoi_ky' | 'custom'
  title: string; // e.g. "ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I"
  subTitle?: string;
  schoolName: string;
  department: string;
  subject: string;
  grade: string;
  academicYear: string;
  durationMinutes: number; // 15, 45, 60, 90
  examCode: string; // "101", "102", "103", "104"
  semester: 1 | 2;
  
  // Chế độ: 'matrix_aligned' (Mặc định cho Giữa kỳ & Cuối kỳ) hoặc 'custom' (Tùy chỉnh linh hoạt)
  mode: 'matrix_aligned' | 'custom';
  format: ExamStructureFormat;

  // Phạm vi nội dung
  weekFrom: number;
  weekTo: number;
  selectedTopics: string[]; // Danh sách bài học/chủ đề được chọn
  
  // Cấu hình số câu (Dùng khi tùy chỉnh hoặc hiển thị tổng hợp)
  countPart1Mcq: number; // Số câu TN 4 lựa chọn (0.25đ)
  countPart2Tf: number;  // Số câu Đúng/Sai (1.0đ/câu 4 ý)
  countPart3Short: number; // Số câu Trả lời ngắn (0.5đ)
  countPart4Essay: number; // Số câu Tự luận
  
  scorePerMcq: number; // 0.25
  scorePerTf: number;  // 1.0
  scorePerShort: number; // 0.5
  scorePerEssay: number; // 1.0 - 2.0
  
  // Tỷ lệ %
  ratioTn: number; // e.g. 70 (%)
  ratioTl: number; // e.g. 30 (%)
}

export interface ExamPaper {
  id: string;
  config: ExamPaperConfig;
  createdAt: string;
  questions: ExamQuestion[];
  totalScore: number;
  matrixAlignmentSummary: {
    totalQuestions: number;
    mcqCount: number;
    tfCount: number;
    shortCount: number;
    essayCount: number;
    scoreNhanBiet: number;
    scoreThongHieu: number;
    scoreVanDung: number;
    scoreVanDungCao: number;
    scorePart1: number;
    scorePart2: number;
    scorePart3: number;
    scorePart4: number;
    percentTn: number;
    percentTl: number;
  };
}

// ==========================================
// THÔNG TIN VÀ CẤU TRÚC KẾ HOẠCH BÀI DẠY (KHBD / GIÁO ÁN THEO CÔNG VĂN 5512 BỘ GD&ĐT)
// ==========================================

export interface LessonPlanActivityStep {
  stepNumber: 1 | 2 | 3 | 4;
  stepName: string; // e.g. "Bước 1: Chuyển giao nhiệm vụ học tập"
  teacherAction: string; // Hoạt động giáo viên (Giao nhiệm vụ, hướng dẫn, gợi ý)
  studentAction: string; // Hoạt động học sinh (Tiếp nhận, làm việc cá nhân/nhóm)
}

export interface LessonPlanActivity {
  id: string;
  name: string; // "Hoạt động 1: Xác định vấn đề / Khởi động", "Hoạt động 2: Hình thành kiến thức mới", "Hoạt động 3: Luyện tập", "Hoạt động 4: Vận dụng"
  timeEstimate?: string; // e.g. "7 phút", "20 phút"
  objective: string; // a) Mục tiêu
  content: string; // b) Nội dung
  product: string; // c) Sản phẩm
  organizationSteps: LessonPlanActivityStep[]; // d) Tổ chức thực hiện (4 bước chuẩn)
}

export interface LessonPlan {
  id: string;
  lessonKey?: string; // Mã bài học đối chiếu PPCT
  lessonTitle: string; // Tên bài dạy chuẩn (e.g. "BÀI 1: PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN")
  chapterName?: string; // Tên chương / chủ đề
  subject: string; // Môn học (e.g. "Toán")
  grade: string; // Khối lớp (e.g. "9")
  periods: number; // Thời gian thực hiện (số tiết)
  periodRangeText?: string; // e.g. "Tiết 1 - 2 (Tuần 1)"
  weekNumber?: number; // Tuần theo PPCT
  schoolName?: string;
  teacherName?: string;
  academicYear?: string;

  // Nguồn kế hoạch:
  sourceType: 'standard_cv5512' | 'external_link' | 'uploaded_file';
  externalLink?: string; // Đường link Google Drive, OneDrive, web chứa giáo án
  masterTermLink?: string; // Link thư mục tổng cho cả Tập 1 / Học kì 1
  term?: 1 | 2; // Học kì 1 hoặc 2
  volume?: 1 | 2; // Tập 1 hoặc Tập 2
  sourceFileName?: string;
  uploadedAt?: string;
  fileContentText?: string; // Nội dung thô hoặc trích xuất từ file

  // Cấu trúc chuẩn Công văn 5512/BGDĐT-GDTrH của Bộ GD&ĐT:
  objectives: {
    knowledge: string[]; // 1. Về kiến thức
    generalCompetencies: string[]; // 2. Về năng lực chung (Tự chủ & tự học, giao tiếp & hợp tác, giải quyết VĐ)
    subjectCompetencies: string[]; // 2. Về năng lực đặc thù Toán (Tư duy & lập luận, mô hình hóa, giải quyết VĐ...)
    qualities: string[]; // 3. Về phẩm chất (Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm)
  };

  equipmentAndMaterials: {
    teacher: string[]; // 1. Thiết bị của GV (Kế hoạch bài dạy, bài giảng điện tử, SGK, SGV, MTCT, PHT...)
    students: string[]; // 2. Thiết bị của HS (SGK, vở ghi, đồ dùng học tập: compa, thước kẻ, MTCT...)
  };

  activities: LessonPlanActivity[]; // III. Tiến trình dạy học (4 hoạt động chuẩn với 4 bước mỗi HĐ)

  appendix?: {
    worksheets?: { title: string; content: string }[]; // Phiếu học tập đính kèm
    rubrics?: string; // Tiêu chí đánh giá hoạt động nhóm
  };
}


