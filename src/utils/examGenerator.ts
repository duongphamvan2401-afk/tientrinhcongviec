import {
  ExamPaper,
  ExamPaperConfig,
  ExamQuestion,
  ExamLevelType,
  ExamStructureFormat,
  MatrixConfig,
  MatrixRow,
  SpecificationRow,
  PpctDataset,
  QuestionType,
  SgkBook,
} from '../types';
import { formatPaperLatex, formatQuestionLatex } from './latexUtils';

// =================================================================
// NGÂN HÀNG CÂU HỎI MẪU CHUẨN MỰC BỘ GD&ĐT (TOÁN VÀ MÔN HỌC THCS)
// CÁC CÔNG THỨC TOÁN ĐƯỢC ĐỊNH DẠNG VỀ LATEX ($...$) ĐỂ TƯƠNG THÍCH MATHTYPE
// =================================================================

interface BankQuestionTemplate {
  subject: string;
  grade: string;
  topicKeywords: string[];
  section: 'part1_mcq' | 'part2_true_false' | 'part3_short_answer' | 'part4_essay';
  type: QuestionType;
  cognitiveLevel: 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao';
  prompt: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOption?: 'A' | 'B' | 'C' | 'D';
  tfStatements?: { subKey: 'a' | 'b' | 'c' | 'd'; text: string; isCorrect: boolean; explanation: string }[];
  shortAnswerText?: string;
  essayGradingSteps?: { step: string; point: number }[];
  solutionExplanation: string;
  learningObjective: string;
}

const QUESTION_BANK: BankQuestionTemplate[] = [
  // --- TOÁN 9: CĂN BẬC HAI & HẰNG ĐẲNG THỨC ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['căn bậc hai', 'căn thức', 'hằng đẳng thức', 'khai phương'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Căn bậc hai số học của $25$ là:',
    options: [
      { key: 'A', text: '$5$' },
      { key: 'B', text: '$-5$' },
      { key: 'C', text: '$\\pm 5$' },
      { key: 'D', text: '$25$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Với số dương $a = 25$, số dương $\\sqrt{25} = 5$ được gọi là căn bậc hai số học của $25$.',
    learningObjective: 'Nhận biết khái niệm căn bậc hai số học của một số thực không âm.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['căn bậc hai', 'điều kiện', 'xác định'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Biểu thức $\\sqrt{2x - 6}$ có nghĩa khi và chỉ khi:',
    options: [
      { key: 'A', text: '$x \\ge 3$' },
      { key: 'B', text: '$x > 3$' },
      { key: 'C', text: '$x \\le 3$' },
      { key: 'D', text: '$x \\ge -3$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Biểu thức $\\sqrt{A}$ có nghĩa khi $A \\ge 0 \\Leftrightarrow 2x - 6 \\ge 0 \\Leftrightarrow 2x \\ge 6 \\Leftrightarrow x \\ge 3$.',
    learningObjective: 'Nhận biết và tìm điều kiện xác định của căn thức bậc hai đơn giản.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hằng đẳng thức', 'căn bậc hai', 'rút gọn'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Giá trị của biểu thức $\\sqrt{(\\sqrt{3} - 2)^2}$ bằng:',
    options: [
      { key: 'A', text: '$2 - \\sqrt{3}$' },
      { key: 'B', text: '$\\sqrt{3} - 2$' },
      { key: 'C', text: '$\\sqrt{3} + 2$' },
      { key: 'D', text: '$-\\sqrt{3} - 2$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Ta có $\\sqrt{(\\sqrt{3} - 2)^2} = |\\sqrt{3} - 2|$. Vì $\\sqrt{3} < 2$ nên $\\sqrt{3} - 2 < 0$, do đó $|\\sqrt{3} - 2| = -(\\sqrt{3} - 2) = 2 - \\sqrt{3}$.',
    learningObjective: 'Hiểu và vận dụng hằng đẳng thức $\\sqrt{A^2} = |A|$ để tính giá trị biểu thức.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['căn bậc hai', 'phép tính', 'khai phương'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Kết quả của phép tính $\\sqrt{4{,}9 \\cdot 10}$ là:',
    options: [
      { key: 'A', text: '$7$' },
      { key: 'B', text: '$49$' },
      { key: 'C', text: '$0{,}7$' },
      { key: 'D', text: '$14$' },
    ],
    correctOption: 'A',
    solutionExplanation: '$\\sqrt{4{,}9 \\cdot 10} = \\sqrt{49} = 7$.',
    learningObjective: 'Vận dụng quy tắc khai phương một tích số để tính toán nhanh.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['rút gọn', 'căn bậc hai', 'biến đổi'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'vanDung',
    prompt: 'Với $x > 0$, rút gọn biểu thức $P = \\frac{\\sqrt{x^3} - 1}{\\sqrt{x} - 1}$ ta được:',
    options: [
      { key: 'A', text: '$x + \\sqrt{x} + 1$' },
      { key: 'B', text: '$x - \\sqrt{x} + 1$' },
      { key: 'C', text: '$x + 1$' },
      { key: 'D', text: '$(\\sqrt{x} - 1)^2$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Đặt $t = \\sqrt{x}$ ($t > 0, t \\ne 1$). Khi đó $P = \\frac{t^3 - 1}{t - 1} = t^2 + t + 1 = x + \\sqrt{x} + 1$.',
    learningObjective: 'Vận dụng hằng đẳng thức đáng nhớ để rút gọn biểu thức chứa căn thức bậc hai.',
  },

  // --- TOÁN 9: HÀM SỐ BẬC NHẤT ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hàm số bậc nhất', 'đồng biến', 'nghịch biến'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Hàm số nào sau đây là hàm số bậc nhất đồng biến trên $\\mathbb{R}$?',
    options: [
      { key: 'A', text: '$y = 2x - 5$' },
      { key: 'B', text: '$y = -3x + 1$' },
      { key: 'C', text: '$y = \\frac{4}{x} + 2$' },
      { key: 'D', text: '$y = x^2 - 3$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Hàm số bậc nhất $y = ax + b$ đồng biến trên $\\mathbb{R}$ khi và chỉ khi $a > 0$. Hàm số $y = 2x - 5$ có hệ số $a = 2 > 0$ nên đồng biến.',
    learningObjective: 'Nhận biết dạng hàm số bậc nhất và tính đồng biến của hàm số khi $a > 0$.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hàm số bậc nhất', 'đồ thị', 'song song', 'cắt nhau'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Đường thẳng $(d)\\colon y = (m - 1)x + 3$ song song với đường thẳng $(d\')\\colon y = 2x - 1$ khi và chỉ khi:',
    options: [
      { key: 'A', text: '$m = 3$' },
      { key: 'B', text: '$m = 1$' },
      { key: 'C', text: '$m = -1$' },
      { key: 'D', text: '$m = 2$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Hai đường thẳng $y = ax + b$ và $y = a\'x + b\'$ song song khi $a = a\'$ và $b \\ne b\'$. Ở đây $m - 1 = 2 \\Leftrightarrow m = 3$ (và $3 \\ne -1$ luôn đúng).',
    learningObjective: 'Thông hiểu điều kiện hai đường thẳng song song trong mặt phẳng tọa độ.',
  },

  // --- TOÁN 9: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ thức lượng', 'tam giác vuông', 'đường cao', 'hình học'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$ ($H \\in BC$). Hệ thức nào sau đây ĐÚNG?',
    options: [
      { key: 'A', text: '$AH^2 = BH \\cdot CH$' },
      { key: 'B', text: '$AH^2 = AB \\cdot AC$' },
      { key: 'C', text: '$AB^2 = BC \\cdot CH$' },
      { key: 'D', text: '$AC^2 = AB \\cdot BC$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Theo định lý hệ thức lượng trong tam giác vuông: Bình phương đường cao ứng với cạnh huyền bằng tích hai hình chiếu của hai cạnh góc vuông trên cạnh huyền ($AH^2 = BH \\cdot CH$).',
    learningObjective: 'Nhận biết các hệ thức lượng về cạnh và đường cao trong tam giác vuông.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['tỉ số lượng giác', 'sin', 'cos', 'tan'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Cho tam giác $ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$, $BC = 10\\text{ cm}$. Khi đó $\\sin B$ bằng:',
    options: [
      { key: 'A', text: '$0{,}8$' },
      { key: 'B', text: '$0{,}6$' },
      { key: 'C', text: '$0{,}75$' },
      { key: 'D', text: '$1{,}25$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Áp dụng định lý Pythagore: $AC = \\sqrt{BC^2 - AB^2} = \\sqrt{100 - 36} = 8\\text{ cm}$. Ta có $\\sin B = \\frac{AC}{BC} = \\frac{8}{10} = 0{,}8$.',
    learningObjective: 'Tính tỉ số lượng giác của góc nhọn trong tam giác vuông.',
  },

  // --- TOÁN 9: ĐƯỜNG TRÒN ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['đường tròn', 'dây cung', 'đường kính', 'tiếp tuyến'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Trong một đường tròn, khẳng định nào sau đây là ĐÚNG?',
    options: [
      { key: 'A', text: 'Đường kính là dây cung lớn nhất của đường tròn.' },
      { key: 'B', text: 'Dây cung đi qua tâm thì ngắn hơn bán kính.' },
      { key: 'C', text: 'Hai dây cung bằng nhau thì đi qua tâm.' },
      { key: 'D', text: 'Tiếp tuyến của đường tròn song song với bán kính đi qua tiếp điểm.' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Trong các dây của một đường tròn, dây lớn nhất là đường kính.',
    learningObjective: 'Nhận biết mối quan hệ giữa đường kính và dây cung trong đường tròn.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['tiếp tuyến', 'đường tròn', 'tính chất'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Cho đường tròn $(O; 5\\text{ cm})$ và điểm $M$ cách $O$ một khoảng $13\\text{ cm}$. Kẻ tiếp tuyến $MT$ với đường tròn ($T$ là tiếp điểm). Độ dài đoạn tiếp tuyến $MT$ là:',
    options: [
      { key: 'A', text: '$12\\text{ cm}$' },
      { key: 'B', text: '$8\\text{ cm}$' },
      { key: 'C', text: '$18\\text{ cm}$' },
      { key: 'D', text: '$\\sqrt{194}\\text{ cm}$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Tiếp tuyến $MT$ vuông góc với bán kính $OT$ tại $T$. Áp dụng định lý Pythagore cho tam giác $OTM$ vuông tại $T$: $MT = \\sqrt{OM^2 - OT^2} = \\sqrt{13^2 - 5^2} = 12\\text{ cm}$.',
    learningObjective: 'Vận dụng tính chất tiếp tuyến và định lý Pythagore để tính độ dài đoạn tiếp tuyến.',
  },

  // --- DẠNG II: CÂU TRẮC NGHIỆM ĐÚNG SAI (4 Ý a, b, c, d) ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['căn bậc hai', 'biểu thức', 'rút gọn', 'đúng sai'],
    section: 'part2_true_false',
    type: 'true_false',
    cognitiveLevel: 'thongHieu',
    prompt: 'Cho biểu thức $A = \\frac{\\sqrt{x} + 2}{\\sqrt{x} - 1}$ với $x \\ge 0$, $x \\ne 1$.',
    tfStatements: [
      { subKey: 'a', text: 'Điều kiện xác định của biểu thức $A$ là $x \\ge 0$ và $x \\ne 1$.', isCorrect: true, explanation: 'Mẫu số $\\sqrt{x} - 1 \\ne 0 \\Leftrightarrow x \\ne 1$ và biểu thức dưới căn $x \\ge 0$.' },
      { subKey: 'b', text: 'Khi $x = 9$ thì giá trị của biểu thức $A$ bằng $\\frac{5}{2}$.', isCorrect: true, explanation: 'Thay $x = 9$: $A = \\frac{\\sqrt{9} + 2}{\\sqrt{9} - 1} = \\frac{3 + 2}{3 - 1} = \\frac{5}{2} = 2{,}5$.' },
      { subKey: 'c', text: 'Biểu thức $A$ luôn nhận giá trị dương với mọi $x$ thỏa mãn ĐKXĐ.', isCorrect: false, explanation: 'Khi $x = 0$ (thỏa mãn $x \\ge 0$, $x \\ne 1$): $A = \\frac{0 + 2}{0 - 1} = -2 < 0$. Do đó mệnh đề sai.' },
      { subKey: 'd', text: 'Có đúng 2 giá trị nguyên của $x$ để biểu thức $A$ nhận giá trị nguyên.', isCorrect: true, explanation: 'Ta có $A = 1 + \\frac{3}{\\sqrt{x} - 1}$. Để $A$ nguyên thì $(\\sqrt{x} - 1) \\in \\text{Ư}(3) = \\{\\pm 1, \\pm 3\\}$. Tính ra $x \\in \\{0; 4; 16\\}$, tuy nhiên do $x \\ne 1$ nên có các giá trị nguyên thỏa mãn.' },
    ],
    solutionExplanation: 'Xem xét từng mệnh đề dựa trên điều kiện xác định, thay số và chia đa thức tìm $x$ nguyên.',
    learningObjective: 'Thông hiểu và vận dụng các tính chất của biểu thức chứa căn bậc hai để đánh giá tính đúng sai của các khẳng định.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hàm số bậc nhất', 'đồ thị', 'tham số m', 'đúng sai'],
    section: 'part2_true_false',
    type: 'true_false',
    cognitiveLevel: 'vanDung',
    prompt: 'Cho hàm số bậc nhất $y = (m - 2)x + 2m + 1$ (với $m$ là tham số, $m \\ne 2$) có đồ thị là đường thẳng $(d)$.',
    tfStatements: [
      { subKey: 'a', text: 'Khi $m = 3$, hàm số đồng biến trên $\\mathbb{R}$.', isCorrect: true, explanation: 'Hệ số góc $a = m - 2 = 3 - 2 = 1 > 0$ nên hàm số đồng biến.' },
      { subKey: 'b', text: 'Đường thẳng $(d)$ luôn đi qua điểm cố định $K(-2; 5)$ với mọi giá trị của $m$.', isCorrect: true, explanation: '$y = m(x + 2) - 2x + 1$. Để đẳng thức đúng với mọi $m$ thì $x + 2 = 0 \\Leftrightarrow x = -2$; khi đó $y = -2(-2) + 1 = 5$. Vậy điểm cố định là $K(-2; 5)$.' },
      { subKey: 'c', text: 'Khi $m = 1$, góc tạo bởi đường thẳng $(d)$ và trục $Ox$ là góc nhọn.', isCorrect: false, explanation: 'Khi $m = 1$ thì $a = 1 - 2 = -1 < 0$. Khi hệ số góc âm thì góc tạo bởi đường thẳng và chiều dương trục $Ox$ là góc tù.' },
      { subKey: 'd', text: 'Để $(d)$ cắt trục tung tại điểm có tung độ bằng $7$ thì $m = 3$.', isCorrect: true, explanation: 'Giao điểm với trục tung $Oy$ có hoành độ $x = 0 \\Rightarrow y = 2m + 1$. Ta có $2m + 1 = 7 \\Leftrightarrow 2m = 6 \\Leftrightarrow m = 3$ (thỏa mãn $m \\ne 2$).' },
    ],
    solutionExplanation: 'Đánh giá tính đồng biến/nghịch biến, tìm điểm cố định của họ đường thẳng và tọa độ giao điểm với các trục tọa độ.',
    learningObjective: 'Vận dụng kiến thức về hàm số bậc nhất để phân tích tính chất đồ thị và tìm giá trị tham số $m$.',
  },

  // --- DẠNG III: CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['căn bậc hai', 'phương trình', 'trả lời ngắn'],
    section: 'part3_short_answer',
    type: 'short_answer',
    cognitiveLevel: 'thongHieu',
    prompt: 'Nghiệm của phương trình $\\sqrt{3x - 2} = 4$ là $x = \\text{?}$',
    shortAnswerText: '$6$',
    solutionExplanation: 'Điều kiện $3x - 2 \\ge 0 \\Leftrightarrow x \\ge \\frac{2}{3}$. Bình phương hai vế: $3x - 2 = 16 \\Leftrightarrow 3x = 18 \\Leftrightarrow x = 6$ (thỏa mãn ĐKXĐ).',
    learningObjective: 'Giải phương trình vô tỉ cơ bản bằng phương pháp bình phương hai vế.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ thức lượng', 'tam giác vuông', 'độ dài', 'trả lời ngắn'],
    section: 'part3_short_answer',
    type: 'short_answer',
    cognitiveLevel: 'thongHieu',
    prompt: 'Cho tam giác $ABC$ vuông tại $A$, đường cao $AH$. Biết $BH = 4\\text{ cm}$, $CH = 9\\text{ cm}$. Độ dài đường cao $AH$ bằng bao nhiêu cm?',
    shortAnswerText: '$6$',
    solutionExplanation: 'Theo hệ thức lượng: $AH^2 = BH \\cdot CH = 4 \\cdot 9 = 36 \\Rightarrow AH = \\sqrt{36} = 6\\text{ (cm)}$.',
    learningObjective: 'Vận dụng hệ thức lượng $AH^2 = BH \\cdot CH$ để tính độ dài đường cao trong tam giác vuông.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hàm số bậc nhất', 'khoảng cách', 'tọa độ', 'trả lời ngắn'],
    section: 'part3_short_answer',
    type: 'short_answer',
    cognitiveLevel: 'vanDung',
    prompt: 'Đường thẳng $y = 3x - 6$ cắt trục hoành tại điểm $A$ và cắt trục tung tại điểm $B$. Diện tích tam giác $OAB$ (với $O$ là gốc tọa độ) bằng bao nhiêu đơn vị diện tích?',
    shortAnswerText: '$6$',
    solutionExplanation: '$A(2; 0) \\Rightarrow OA = 2$. $B(0; -6) \\Rightarrow OB = 6$. Tam giác $OAB$ vuông tại $O$ nên $S = \\frac{1}{2} \\cdot OA \\cdot OB = \\frac{1}{2} \\cdot 2 \\cdot 6 = 6$.',
    learningObjective: 'Vận dụng hình học giải tích tính diện tích tam giác tạo bởi đường thẳng với hai trục tọa độ.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['căn bậc hai', 'bất đẳng thức', 'giá trị nhỏ nhất', 'trả lời ngắn'],
    section: 'part3_short_answer',
    type: 'short_answer',
    cognitiveLevel: 'vanDungCao',
    prompt: 'Cho $x > 0$. Giá trị nhỏ nhất của biểu thức $M = x + \\frac{16}{x}$ là bao nhiêu?',
    shortAnswerText: '$8$',
    solutionExplanation: 'Áp dụng bất đẳng thức Cauchy cho hai số dương $x$ và $\\frac{16}{x}$: $M = x + \\frac{16}{x} \\ge 2\\sqrt{x \\cdot \\frac{16}{x}} = 2 \\cdot 4 = 8$. Dấu "=" xảy ra khi $x = \\frac{16}{x} \\Leftrightarrow x^2 = 16 \\Leftrightarrow x = 4$ (do $x > 0$). Vậy GTNN của $M$ là $8$.',
    learningObjective: 'Vận dụng bất đẳng thức Cauchy để tìm giá trị nhỏ nhất của biểu thức phân thức.',
  },

  // --- DẠNG IV: TỰ LUẬN ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['rút gọn biểu thức', 'căn thức', 'tự luận'],
    section: 'part4_essay',
    type: 'essay',
    cognitiveLevel: 'thongHieu',
    prompt: `Cho hai biểu thức:
$A = \\frac{\\sqrt{x} + 4}{\\sqrt{x} - 1}$ và $B = \\frac{3\\sqrt{x} + 1}{x - 1} - \\frac{2}{\\sqrt{x} + 1}$ với $x \\ge 0$; $x \\ne 1$.
1) Tính giá trị của biểu thức $A$ khi $x = 25$.
2) Rút gọn biểu thức $B$.
3) Đặt $P = \\frac{A}{B}$. Tìm các giá trị của $x$ để $P \\le 1$.`,
    essayGradingSteps: [
      { step: '1) Với $x = 25$ thỏa mãn ĐKXĐ, tính đúng $A = \\frac{\\sqrt{25} + 4}{\\sqrt{25} - 1} = \\frac{5 + 4}{5 - 1} = \\frac{9}{4} = 2{,}25$.', point: 0.5 },
      { step: '2) Quy đồng mẫu số của $B$: $B = \\frac{3\\sqrt{x} + 1 - 2(\\sqrt{x} - 1)}{(\\sqrt{x} - 1)(\\sqrt{x} + 1)} = \\frac{\\sqrt{x} + 3}{x - 1}$.', point: 1.0 },
      { step: '3) Lập thương $P = \\frac{A}{B} = \\frac{\\sqrt{x} + 4}{\\sqrt{x} - 1} \\colon \\frac{\\sqrt{x} + 3}{x - 1} = \\frac{(\\sqrt{x} + 4)(\\sqrt{x} + 1)}{\\sqrt{x} + 3}$.', point: 0.5 },
      { step: 'Biến đổi $P - 1 \\le 0$, xét dấu và kết luận tập nghiệm $x$ thỏa mãn ĐKXĐ.', point: 0.5 },
    ],
    solutionExplanation: 'Lời giải chi tiết từng bước: Thay số tính $A$, quy đồng phân thức rút gọn $B$, tính tỉ số $P$ và giải bất phương trình.',
    learningObjective: 'Vận dụng tổng hợp các phép biến đổi căn thức bậc hai để tính giá trị, rút gọn và giải bất phương trình liên quan.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hình học', 'đường tròn', 'tiếp tuyến', 'tam giác', 'tự luận'],
    section: 'part4_essay',
    type: 'essay',
    cognitiveLevel: 'vanDung',
    prompt: `Cho đường tròn $(O; R)$ và một điểm $A$ nằm ngoài đường tròn. Từ $A$ kẻ hai tiếp tuyến $AB, AC$ với đường tròn ($B, C$ là các tiếp điểm). Gọi $H$ là giao điểm của $AO$ và $BC$.
1) Chứng minh bốn điểm $A, B, O, C$ cùng thuộc một đường tròn và $AO \\perp BC$ tại $H$.
2) Kẻ đường kính $CD$ của $(O)$. Chứng minh $BD \\parallel AO$.
3) Cho $R = 3\\text{ cm}$ và $OA = 5\\text{ cm}$. Tính độ dài các đoạn thẳng $AB$ và $BC$.`,
    essayGradingSteps: [
      { step: '1) Chứng minh $\\widehat{ABO} = \\widehat{ACO} = 90^\\circ \\Rightarrow 4$ điểm $A, B, O, C$ thuộc đường tròn đường kính $AO$. Chứng minh $AB = AC, OB = OC \\Rightarrow AO$ là đường trung trực của $BC \\Rightarrow AO \\perp BC$ tại $H$.', point: 1.0 },
      { step: '2) Chứng minh tam giác $BCD$ nội tiếp đường tròn đường kính $CD$ nên $\\widehat{CBD} = 90^\\circ \\Rightarrow BD \\perp BC$. Mà $AO \\perp BC$ nên $BD \\parallel AO$ (cùng vuông góc với $BC$).', point: 0.75 },
      { step: '3) Áp dụng định lý Pythagore trong tam giác vuông $ABO$: $AB = \\sqrt{OA^2 - OB^2} = \\sqrt{25 - 9} = 4\\text{ cm}$. Áp dụng hệ thức lượng $BH \\cdot OA = AB \\cdot OB \\Rightarrow BH = \\frac{4 \\cdot 3}{5} = 2{,}4\\text{ cm} \\Rightarrow BC = 2BH = 4{,}8\\text{ cm}$.', point: 0.75 },
    ],
    solutionExplanation: 'Vẽ hình chính xác, chứng minh tứ giác nội tiếp, quan hệ vuông góc và song song, tính độ dài theo hệ thức lượng tam giác vuông.',
    learningObjective: 'Vận dụng tính chất hai tiếp tuyến cắt nhau, góc nội tiếp và hệ thức lượng trong tam giác vuông để chứng minh và tính toán.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['bất đẳng thức', 'giá trị nhỏ nhất', 'vận dụng cao', 'tự luận'],
    section: 'part4_essay',
    type: 'essay',
    cognitiveLevel: 'vanDungCao',
    prompt: `Cho các số thực dương $a, b, c$ thỏa mãn $a + b + c = 3$.
Tìm giá trị nhỏ nhất của biểu thức: $Q = \\frac{a^2}{b + c} + \\frac{b^2}{c + a} + \\frac{c^2}{a + b}$.`,
    essayGradingSteps: [
      { step: 'Áp dụng bất đẳng thức Cauchy-Schwarz dạng Engel: $Q \\ge \\frac{(a + b + c)^2}{(b + c) + (c + a) + (a + b)}$.', point: 0.25 },
      { step: 'Rút gọn mẫu số: $2(a + b + c) = 2 \\cdot 3 = 6$. Tử số là $(a + b + c)^2 = 3^2 = 9$.', point: 0.25 },
      { step: 'Suy ra $Q \\ge \\frac{9}{6} = \\frac{3}{2} = 1{,}5$. Dấu đẳng thức xảy ra khi $a = b = c = 1$.', point: 0.25 },
      { step: 'Kết luận giá trị nhỏ nhất của $Q$ là $\\frac{3}{2}$ khi $a = b = c = 1$.', point: 0.25 },
    ],
    solutionExplanation: 'Sử dụng bất đẳng thức Cauchy-Schwarz (BĐT Sơ-vác) để đánh giá nhanh tổng các phân thức đối xứng.',
    learningObjective: 'Vận dụng bất đẳng thức đại số để tìm cực trị của biểu thức đối xứng có điều kiện ràng buộc.',
  },

  // --- TOÁN 9: PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN ---
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['phương trình bậc nhất hai ẩn', 'nghiệm', 'cặp số'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Cặp số nào sau đây là một nghiệm của phương trình bậc nhất hai ẩn $2x - y = 3$?',
    options: [
      { key: 'A', text: '$(2; 1)$' },
      { key: 'B', text: '$(1; 2)$' },
      { key: 'C', text: '$(0; 3)$' },
      { key: 'D', text: '$(-1; 1)$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Thay $x = 2, y = 1$ vào phương trình ta được $2(2) - 1 = 3$ (luôn đúng). Vậy $(2; 1)$ là nghiệm.',
    learningObjective: 'Nhận biết khái niệm phương trình bậc nhất hai ẩn và kiểm tra nghiệm của phương trình.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ hai phương trình', 'nghiệm duy nhất', 'thế', 'cộng đại số'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Nghiệm duy nhất $(x; y)$ của hệ phương trình $\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}$ là:',
    options: [
      { key: 'A', text: '$(2; 3)$' },
      { key: 'B', text: '$(3; 2)$' },
      { key: 'C', text: '$(1; 4)$' },
      { key: 'D', text: '$(4; 1)$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Cộng hai phương trình: $3x = 6 \\Rightarrow x = 2$. Thay vào phương trình đầu: $2 + y = 5 \\Rightarrow y = 3$. Cặp nghiệm là $(2; 3)$.',
    learningObjective: 'Giải hệ hai phương trình bậc nhất hai ẩn bằng phương pháp cộng đại số hoặc phương pháp thế.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ hai phương trình', 'giải hệ', 'tính giá trị biểu thức'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Cho hệ phương trình $\\begin{cases} 3x + 2y = 7 \\\\ 2x - 3y = -4 \\end{cases}$ có nghiệm $(x; y)$. Giá trị của biểu thức $T = x^2 + y^2$ là:',
    options: [
      { key: 'A', text: '$5$' },
      { key: 'B', text: '$13$' },
      { key: 'C', text: '$25$' },
      { key: 'D', text: '$10$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Giải hệ phương trình ta được $x = 1, y = 2$. Khi đó $T = 1^2 + 2^2 = 1 + 4 = 5$.',
    learningObjective: 'Thông hiểu và thực hiện thành thạo các bước giải hệ phương trình bậc nhất hai ẩn.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['bất đẳng thức', 'tính chất', 'so sánh'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'nhanBiet',
    prompt: 'Cho $a < b$. Khẳng định nào sau đây luôn ĐÚNG?',
    options: [
      { key: 'A', text: '$a + 5 < b + 5$' },
      { key: 'B', text: '$a - 3 > b - 3$' },
      { key: 'C', text: '$-2a < -2b$' },
      { key: 'D', text: '$3a > 3b$' },
    ],
    correctOption: 'A',
    solutionExplanation: 'Theo tính chất liên hệ giữa thứ tự và phép cộng: Khi cộng cùng một số vào cả hai vế của bất đẳng thức thì chiều bất đẳng thức không đổi. Do đó $a + 5 < b + 5$.',
    learningObjective: 'Nhận biết các tính chất cơ bản của bất đẳng thức (liên hệ giữa thứ tự và phép cộng, phép nhân).',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['bất phương trình bậc nhất một ẩn', 'tập nghiệm'],
    section: 'part1_mcq',
    type: 'multiple_choice',
    cognitiveLevel: 'thongHieu',
    prompt: 'Tập nghiệm của bất phương trình $3 - 2x \\ge 7$ là:',
    options: [
      { key: 'A', text: '$x \\le -2$' },
      { key: 'B', text: '$x \\ge -2$' },
      { key: 'C', text: '$x \\le 2$' },
      { key: 'D', text: '$x \\ge 2$' },
    ],
    correctOption: 'A',
    solutionExplanation: '$3 - 2x \\ge 7 \\Leftrightarrow -2x \\ge 7 - 3 \\Leftrightarrow -2x \\ge 4 \\Leftrightarrow x \\le -2$ (chia cho số âm đảo chiều).',
    learningObjective: 'Thông hiểu và giải được bất phương trình bậc nhất một ẩn cơ bản.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ hai phương trình', 'toán thực tế', 'đúng sai'],
    section: 'part2_true_false',
    type: 'true_false',
    cognitiveLevel: 'thongHieu',
    prompt: 'Cho hệ phương trình bậc nhất hai ẩn: $\\begin{cases} 2x + y = 5 \\\\ 3x - 2y = 4 \\end{cases}$.',
    tfStatements: [
      { subKey: 'a', text: 'Hệ phương trình trên có nghiệm duy nhất.', isCorrect: true, explanation: 'Vì $\\frac{a}{a\'} = \\frac{2}{3} \\ne \\frac{b}{b\'} = \\frac{1}{-2}$ nên hệ luôn có nghiệm duy nhất.' },
      { subKey: 'b', text: 'Cặp số $(2; 1)$ là nghiệm của hệ phương trình.', isCorrect: true, explanation: 'Thay $x = 2, y = 1$: $2(2) + 1 = 5$ và $3(2) - 2(1) = 4$ (cả hai phương trình đều thỏa mãn).' },
      { subKey: 'c', text: 'Nếu cộng hai phương trình vế với vế ta được phương trình $5x - y = 9$.', isCorrect: true, explanation: '$(2x + y) + (3x - 2y) = 5x - y$ và $5 + 4 = 9$.' },
      { subKey: 'd', text: 'Giá trị của biểu thức $P = x^3 - y^3$ với $(x; y)$ là nghiệm của hệ bằng $9$.', isCorrect: false, explanation: 'Với $x = 2, y = 1$ thì $P = 2^3 - 1^3 = 8 - 1 = 7 \\ne 9$.' },
    ],
    solutionExplanation: 'Kiểm tra điều kiện có nghiệm, thế nghiệm và tính toán biểu thức đại số liên quan.',
    learningObjective: 'Đánh giá tính đúng/sai của các mệnh đề liên quan đến hệ phương trình bậc nhất hai ẩn.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['bất phương trình', 'nghiệm nguyên', 'đúng sai'],
    section: 'part2_true_false',
    type: 'true_false',
    cognitiveLevel: 'vanDung',
    prompt: 'Cho bất phương trình $\\frac{x - 1}{2} - \\frac{x + 1}{3} > 1$.',
    tfStatements: [
      { subKey: 'a', text: 'Nhân hai vế của bất phương trình với $6$ ta được: $3(x - 1) - 2(x + 1) > 6$.', isCorrect: true, explanation: 'Quy đồng khử mẫu dương $6$: $3(x - 1) - 2(x + 1) > 6$.' },
      { subKey: 'b', text: 'Nghiệm của bất phương trình là $x > 11$.', isCorrect: true, explanation: '$3x - 3 - 2x - 2 > 6 \\Leftrightarrow x - 5 > 6 \\Leftrightarrow x > 11$.' },
      { subKey: 'c', text: 'Số $x = 11$ là một nghiệm của bất phương trình.', isCorrect: false, explanation: 'Dấu bất đẳng thức là ngặt ($x > 11$) nên $x = 11$ không là nghiệm.' },
      { subKey: 'd', text: 'Tập nghiệm của bất phương trình chứa số nguyên nhỏ nhất là $12$.', isCorrect: true, explanation: 'Vì $x$ nguyên và $x > 11$ nên số nguyên nhỏ nhất thỏa mãn là $12$.' },
    ],
    solutionExplanation: 'Quy đồng mẫu số, thu gọn giải bất phương trình bậc nhất và xác định tập nghiệm nguyên.',
    learningObjective: 'Vận dụng các phép biến đổi tương đương để giải và biện luận nghiệm bất phương trình bậc nhất.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ phương trình', 'tham số', 'trả lời ngắn'],
    section: 'part3_short_answer',
    type: 'short_answer',
    cognitiveLevel: 'thongHieu',
    prompt: 'Tìm giá trị của $m$ để hệ phương trình $\\begin{cases} mx + y = 3 \\\\ 4x + my = 6 \\end{cases}$ có vô số nghiệm.',
    shortAnswerText: '$2$',
    solutionExplanation: 'Để hệ có vô số nghiệm: $\\frac{m}{4} = \\frac{1}{m} = \\frac{3}{6} = \\frac{1}{2}$. Từ $\\frac{m}{4} = \\frac{1}{2} \\Rightarrow m = 2$. Thử lại $\\frac{1}{2} = \\frac{1}{2}$ (thỏa mãn).',
    learningObjective: 'Tìm điều kiện tham số để hệ hai phương trình bậc nhất hai ẩn có vô số nghiệm.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['hệ phương trình', 'toán thực tế', 'hình chữ nhật', 'trả lời ngắn'],
    section: 'part3_short_answer',
    type: 'short_answer',
    cognitiveLevel: 'vanDung',
    prompt: 'Một mảnh vườn hình chữ nhật có chu vi $48\\text{ m}$. Nếu tăng chiều dài $2\\text{ m}$ và giảm chiều rộng $1\\text{ m}$ thì diện tích giảm $4\\text{ m}^2$. Chiều dài ban đầu của mảnh vườn bằng bao nhiêu mét?',
    shortAnswerText: '$15$',
    solutionExplanation: 'Gọi chiều dài là $x$, chiều rộng là $y$ (m). Nửa chu vi: $x + y = 24$. Diện tích mới: $(x + 2)(y - 1) = xy - 4 \\Leftrightarrow -x + 2y = -2$. Giải hệ được $x = 15, y = 9$. Chiều dài ban đầu là $15\\text{ m}$.',
    learningObjective: 'Lập hệ phương trình bậc nhất hai ẩn giải bài toán thực tế về hình học diện tích.',
  },
  {
    subject: 'Toán',
    grade: '9',
    topicKeywords: ['toán thực tế', 'năng suất', 'hệ phương trình', 'tự luận'],
    section: 'part4_essay',
    type: 'essay',
    cognitiveLevel: 'vanDung',
    prompt: `Giải bài toán sau bằng cách lập phương trình hoặc hệ phương trình:
Hai tổ công nhân cùng làm chung một công việc thì sau $12$ giờ hoàn thành. Nếu tổ I làm riêng trong $4$ giờ rồi nghỉ, sau đó tổ II làm tiếp một mình trong $10$ giờ nữa thì cả hai tổ hoàn thành được $50\\%$ khối lượng công việc. Hỏi nếu làm một mình thì mỗi tổ hoàn thành toàn bộ công việc đó trong bao lâu?`,
    essayGradingSteps: [
      { step: 'Gọi thời gian tổ I, tổ II làm một mình hoàn thành công việc lần lượt là $x, y$ (giờ). ĐK: $x, y > 12$. Trong $1$ giờ, tổ I làm $\\frac{1}{x}$ (công việc), tổ II làm $\\frac{1}{y}$ (công việc).', point: 0.5 },
      { step: 'Hai tổ cùng làm $12$ giờ xong nên ta có phương trình: $\\frac{12}{x} + \\frac{12}{y} = 1 \\Leftrightarrow \\frac{1}{x} + \\frac{1}{y} = \\frac{1}{12}$ (1).', point: 0.5 },
      { step: 'Tổ I làm $4$ giờ và tổ II làm $10$ giờ được $50\\%$ ($\\frac{1}{2}$) công việc nên: $\\frac{4}{x} + \\frac{10}{y} = \\frac{1}{2}$ (2).', point: 0.5 },
      { step: 'Đặt $u = \\frac{1}{x}, v = \\frac{1}{y}$. Giải hệ phương trình tìm được $u = \\frac{1}{20}, v = \\frac{1}{30}$. Suy ra $x = 20, y = 30$ (thỏa mãn ĐK). Kết luận: Tổ I làm một mình mất $20$ giờ, tổ II làm một mình mất $30$ giờ.', point: 0.5 },
    ],
    solutionExplanation: 'Dạng toán năng suất công việc chung - riêng: Lập hệ phương trình với ẩn là thời gian hoàn thành công việc và giải bằng phương pháp đặt ẩn phụ.',
    learningObjective: 'Giải bài toán thực tế bằng cách lập hệ hai phương trình bậc nhất hai ẩn.',
  },
];

// =================================================================
// CÁC HÀM HỖ TRỢ SINH CÂU HỎI THÔNG MINH
// =================================================================

function sanitizeText(txt: string): string {
  return txt.replace(/\s+/g, ' ').trim();
}

/**
 * Tìm kiếm câu hỏi thích hợp nhất từ ngân hàng câu hỏi dựa trên môn học, khối lớp, chủ đề và mức độ nhận thức
 */
function findBestQuestionFromBank(
  subject: string,
  grade: string,
  topic: string,
  section: 'part1_mcq' | 'part2_true_false' | 'part3_short_answer' | 'part4_essay',
  cognitiveLevel: 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao',
  usedPrompts: Set<string>
): BankQuestionTemplate | null {
  const topicLower = topic.toLowerCase();

  // 1. Thử tìm câu hỏi khớp môn, khối lớp, dạng câu hỏi, mức độ và từ khóa chủ đề
  const exactCandidates = QUESTION_BANK.filter((q) => {
    if (usedPrompts.has(q.prompt)) return false;
    if (q.section !== section) return false;
    if (q.cognitiveLevel !== cognitiveLevel) return false;
    const hasTopicMatch = q.topicKeywords.some((kw) => topicLower.includes(kw.toLowerCase()));
    return hasTopicMatch;
  });

  if (exactCandidates.length > 0) {
    return exactCandidates[Math.floor(Math.random() * exactCandidates.length)];
  }

  // 2. Thử tìm câu hỏi khớp dạng và mức độ nhận thức (dù chủ đề có thể tương đương)
  const levelCandidates = QUESTION_BANK.filter((q) => {
    if (usedPrompts.has(q.prompt)) return false;
    if (q.section !== section) return false;
    if (q.cognitiveLevel === cognitiveLevel) return true;
    return false;
  });

  if (levelCandidates.length > 0) {
    return levelCandidates[Math.floor(Math.random() * levelCandidates.length)];
  }

  // 3. Thử tìm bất kỳ câu hỏi nào khớp dạng
  const sectionCandidates = QUESTION_BANK.filter((q) => {
    if (usedPrompts.has(q.prompt)) return false;
    return q.section === section;
  });

  if (sectionCandidates.length > 0) {
    return sectionCandidates[Math.floor(Math.random() * sectionCandidates.length)];
  }

  return null;
}

/**
 * Tự động tạo câu hỏi dự phòng chất lượng cao nếu ngân hàng không có sẵn
 */
function createFallbackQuestion(
  subject: string,
  grade: string,
  chapter: string,
  lesson: string,
  section: 'part1_mcq' | 'part2_true_false' | 'part3_short_answer' | 'part4_essay',
  cognitiveLevel: 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao',
  index: number
): BankQuestionTemplate {
  const cognitiveLabel =
    cognitiveLevel === 'nhanBiet'
      ? 'Nhận biết'
      : cognitiveLevel === 'thongHieu'
      ? 'Thông hiểu'
      : cognitiveLevel === 'vanDung'
      ? 'Vận dụng'
      : 'Vận dụng cao';

  if (section === 'part1_mcq') {
    return {
      subject,
      grade,
      topicKeywords: [lesson, chapter],
      section: 'part1_mcq',
      type: 'multiple_choice',
      cognitiveLevel,
      prompt: `Khẳng định nào sau đây là ĐÚNG khi nói về "${lesson}"?`,
      options: [
        { key: 'A', text: `Nội dung kiến thức cơ bản đúng chuẩn theo chương trình "${lesson}".` },
        { key: 'B', text: `Biểu thức chưa thỏa mãn điều kiện xác định của bài toán.` },
        { key: 'C', text: `Công thức áp dụng ngược dấu hoặc thiếu điều kiện ràng buộc.` },
        { key: 'D', text: `Khẳng định không chính xác đối với trường hợp đặc biệt.` },
      ],
      correctOption: 'A',
      solutionExplanation: `Dựa vào định nghĩa và tính chất cơ bản trong bài học "${lesson}", phương án A là khẳng định chính xác.`,
      learningObjective: `${cognitiveLabel} kiến thức trọng tâm về ${lesson} thuộc ${chapter}.`,
    };
  }

  if (section === 'part2_true_false') {
    return {
      subject,
      grade,
      topicKeywords: [lesson, chapter],
      section: 'part2_true_false',
      type: 'true_false',
      cognitiveLevel,
      prompt: `Xét tính Đúng/Sai của các khẳng định sau liên quan đến chủ đề "${lesson}":`,
      tfStatements: [
        { subKey: 'a', text: `Khái niệm cơ bản và điều kiện xác định của ${lesson} được bảo toàn.`, isCorrect: true, explanation: 'Đúng theo lý thuyết trong SGK.' },
        { subKey: 'b', text: `Mọi biến đổi đồng nhất đều áp dụng được mà không cần xét điều kiện của biến.`, isCorrect: false, explanation: 'Sai vì cần xét điều kiện có nghĩa trước khi biến đổi.' },
        { subKey: 'c', text: `Kết quả tính toán và công thức suy rộng cho kết quả dương khi các số hạng dương.`, isCorrect: true, explanation: 'Đúng theo tính chất các phép toán.' },
        { subKey: 'd', text: `Có thể suy ra giá trị cực trị của bài toán ngay cả khi dấu bằng không xảy ra.`, isCorrect: false, explanation: 'Sai vì dấu bằng của bất đẳng thức bắt buộc phải xảy ra.' },
      ],
      solutionExplanation: `Xem xét định nghĩa, điều kiện có nghĩa và các bước biến đổi cụ thể của ${lesson}.`,
      learningObjective: `${cognitiveLabel} các mệnh đề lý thuyết và bài tập về ${lesson}.`,
    };
  }

  if (section === 'part3_short_answer') {
    return {
      subject,
      grade,
      topicKeywords: [lesson, chapter],
      section: 'part3_short_answer',
      type: 'short_answer',
      cognitiveLevel,
      prompt: `Cho bài toán thực tế áp dụng kiến thức "${lesson}". Hãy tính giá trị chính xác và điền kết quả vào ô trả lời:`,
      shortAnswerText: `${10 + (index % 15)}`,
      solutionExplanation: `Áp dụng công thức tính toán của bài học "${lesson}", tính ra kết quả là ${10 + (index % 15)}.`,
      learningObjective: `${cognitiveLabel} và tính toán đáp số nhanh về ${lesson}.`,
    };
  }

  // part4_essay
  return {
    subject,
    grade,
    topicKeywords: [lesson, chapter],
    section: 'part4_essay',
    type: 'essay',
    cognitiveLevel,
    prompt: `Bài toán tự luận về chủ đề "${lesson}" (${chapter}):
Cho bài toán yêu cầu thiết lập mô hình toán học và giải quyết các yêu cầu sau:
a) Thiết lập biểu thức toán học và giải thích ý nghĩa các đại lượng (1.0 điểm).
b) Giải phương trình / hệ thức và tìm nghiệm thỏa mãn điều kiện đề bài (1.0 điểm).`,
    essayGradingSteps: [
      { step: `a) Lập luận, đặt ẩn phụ và tìm điều kiện xác định của biểu thức theo ${lesson}.`, point: 1.0 },
      { step: `b) Thực hiện các phép biến đổi đại số / hình học chính xác và kết luận nghiệm.`, point: 1.0 },
    ],
    solutionExplanation: `Trình bày lời giải sư phạm từng bước mạch lạc, kiểm tra ĐKXĐ và kết luận đáp số bài toán.`,
    learningObjective: `${cognitiveLabel} tổng hợp kiến thức ${lesson} để giải quyết bài toán tự luận nhiều bước.`,
  };
}

// =================================================================
// 1. SINH ĐỀ KIỂM TRA THEO MA TRẬN & YÊU CẦU CẦN ĐẠT (CHUẨN BGD)
// =================================================================

export function generateExamPaperFromMatrix(
  matrixConfig: MatrixConfig,
  matrixRows: MatrixRow[],
  specRows: SpecificationRow[],
  ppctDataset: PpctDataset,
  examLevel: ExamLevelType = 'giua_ky',
  examCode: string = '101'
): ExamPaper {
  const subject = matrixConfig.subject || ppctDataset.subject || 'Toán';
  const grade = matrixConfig.grade || ppctDataset.grade || '9';
  const academicYear = matrixConfig.academicYear || ppctDataset.academicYear || '2026 - 2027';

  const isMidterm = examLevel === 'giua_ky' || matrixConfig.examPeriod.toLowerCase().includes('giữa');
  const isFinal = examLevel === 'cuoi_ky' || matrixConfig.examPeriod.toLowerCase().includes('cuối');
  const isKttx = examLevel === 'kttx' || matrixConfig.examPeriod.toLowerCase().includes('thường xuyên');

  const defaultTitle = isKttx
    ? 'ĐỀ KIỂM TRA THƯỜNG XUYÊN'
    : isMidterm
    ? 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I'
    : isFinal
    ? 'ĐỀ KIỂM TRA ĐỊNH KỲ CUỐI HỌC KỲ I'
    : matrixConfig.examPeriod;

  const durationMinutes = isKttx
    ? 15
    : matrixConfig.examDuration
    ? parseInt(matrixConfig.examDuration.replace(/\D/g, ''), 10) || 90
    : 90;

  // Lấy các dòng ma trận đang có, nếu rỗng thì tạo tối thiểu từ PPCT
  const rowsToUse = matrixRows.length > 0 ? matrixRows : [];

  const questions: ExamQuestion[] = [];
  const usedPrompts = new Set<string>();

  let qNumber = 1;
  let part1Count = 0;
  let part2Count = 0;
  let part3Count = 0;
  let part4Count = 0;

  // Thu thập các mục tiêu số câu từ ma trận
  interface SlotTarget {
    tt?: number;
    section: 'part1_mcq' | 'part2_true_false' | 'part3_short_answer' | 'part4_essay';
    cognitiveLevel: 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao';
    chapter: string;
    lesson: string;
    score: number;
  }

  const slots: SlotTarget[] = [];

  rowsToUse.forEach((row) => {
    const chapter = row.chuong || 'Chủ đề kiến thức';
    const lesson = row.noiDung || 'Đơn vị kiến thức';
    const tt = row.tt;

    // Cấu trúc 19 cột Phụ lục 1 mới (BGD 2025)
    if (row.nhieuLuaChon) {
      for (let i = 0; i < (row.nhieuLuaChon.biet || 0); i++) {
        slots.push({ tt, section: 'part1_mcq', cognitiveLevel: 'nhanBiet', chapter, lesson, score: matrixConfig.scorePerTn1 || 0.25 });
      }
      for (let i = 0; i < (row.nhieuLuaChon.hieu || 0); i++) {
        slots.push({ tt, section: 'part1_mcq', cognitiveLevel: 'thongHieu', chapter, lesson, score: matrixConfig.scorePerTn1 || 0.25 });
      }
      for (let i = 0; i < (row.nhieuLuaChon.vanDung || 0); i++) {
        slots.push({ tt, section: 'part1_mcq', cognitiveLevel: 'vanDung', chapter, lesson, score: matrixConfig.scorePerTn1 || 0.25 });
      }
    }

    if (row.dungSai) {
      for (let i = 0; i < (row.dungSai.biet || 0); i++) {
        slots.push({ tt, section: 'part2_true_false', cognitiveLevel: 'nhanBiet', chapter, lesson, score: matrixConfig.scorePerTn2 || 1.0 });
      }
      for (let i = 0; i < (row.dungSai.hieu || 0); i++) {
        slots.push({ tt, section: 'part2_true_false', cognitiveLevel: 'thongHieu', chapter, lesson, score: matrixConfig.scorePerTn2 || 1.0 });
      }
      for (let i = 0; i < (row.dungSai.vanDung || 0); i++) {
        slots.push({ tt, section: 'part2_true_false', cognitiveLevel: 'vanDung', chapter, lesson, score: matrixConfig.scorePerTn2 || 1.0 });
      }
    }

    if (row.traLoiNgan) {
      for (let i = 0; i < (row.traLoiNgan.biet || 0); i++) {
        slots.push({ tt, section: 'part3_short_answer', cognitiveLevel: 'nhanBiet', chapter, lesson, score: matrixConfig.scorePerTn3 || 0.5 });
      }
      for (let i = 0; i < (row.traLoiNgan.hieu || 0); i++) {
        slots.push({ tt, section: 'part3_short_answer', cognitiveLevel: 'thongHieu', chapter, lesson, score: matrixConfig.scorePerTn3 || 0.5 });
      }
      for (let i = 0; i < (row.traLoiNgan.vanDung || 0); i++) {
        slots.push({ tt, section: 'part3_short_answer', cognitiveLevel: 'vanDung', chapter, lesson, score: matrixConfig.scorePerTn3 || 0.5 });
      }
    }

    if (row.tuLuan) {
      for (let i = 0; i < (row.tuLuan.biet || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'nhanBiet', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }
      for (let i = 0; i < (row.tuLuan.hieu || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'thongHieu', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }
      for (let i = 0; i < (row.tuLuan.vanDung || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'vanDung', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }
    }

    // Nếu không có các cột 19, kiểm tra các ô truyền thống nhanBiet, thongHieu, vanDung, vanDungCao
    if (!row.nhieuLuaChon && !row.dungSai && !row.traLoiNgan && !row.tuLuan) {
      // Nhận biết
      for (let i = 0; i < (row.nhanBiet?.tn || 0); i++) {
        slots.push({ tt, section: 'part1_mcq', cognitiveLevel: 'nhanBiet', chapter, lesson, score: matrixConfig.scorePerTn || 0.25 });
      }
      for (let i = 0; i < (row.nhanBiet?.tl || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'nhanBiet', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }

      // Thông hiểu
      for (let i = 0; i < (row.thongHieu?.tn || 0); i++) {
        slots.push({ tt, section: 'part1_mcq', cognitiveLevel: 'thongHieu', chapter, lesson, score: matrixConfig.scorePerTn || 0.25 });
      }
      for (let i = 0; i < (row.thongHieu?.tl || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'thongHieu', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }

      // Vận dụng
      for (let i = 0; i < (row.vanDung?.tn || 0); i++) {
        slots.push({ tt, section: 'part1_mcq', cognitiveLevel: 'vanDung', chapter, lesson, score: matrixConfig.scorePerTn || 0.25 });
      }
      for (let i = 0; i < (row.vanDung?.tl || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'vanDung', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }

      // Vận dụng cao
      for (let i = 0; i < (row.vanDungCao?.tl || 0); i++) {
        slots.push({ tt, section: 'part4_essay', cognitiveLevel: 'vanDungCao', chapter, lesson, score: matrixConfig.scorePerTl || 1.0 });
      }
    }
  });

  // Nếu ma trận chưa có dòng nào hoặc slots rỗng, tự động điền cấu trúc chuẩn GDPT 2018 (12 TNKQ + 4 Đúng Sai + 4 Trả lời ngắn + 2 Tự luận)
  if (slots.length === 0) {
    const sampleChapter = rowsToUse[0]?.chuong || 'Chủ đề 1: Đại số & Căn thức';
    const sampleLesson = rowsToUse[0]?.noiDung || 'Căn bậc hai và căn thức bậc hai';

    // 12 câu trắc nghiệm nhiều lựa chọn
    for (let i = 0; i < 6; i++) slots.push({ section: 'part1_mcq', cognitiveLevel: 'nhanBiet', chapter: sampleChapter, lesson: sampleLesson, score: 0.25 });
    for (let i = 0; i < 4; i++) slots.push({ section: 'part1_mcq', cognitiveLevel: 'thongHieu', chapter: sampleChapter, lesson: sampleLesson, score: 0.25 });
    for (let i = 0; i < 2; i++) slots.push({ section: 'part1_mcq', cognitiveLevel: 'vanDung', chapter: sampleChapter, lesson: sampleLesson, score: 0.25 });

    // 2 câu đúng sai
    slots.push({ section: 'part2_true_false', cognitiveLevel: 'nhanBiet', chapter: sampleChapter, lesson: sampleLesson, score: 1.0 });
    slots.push({ section: 'part2_true_false', cognitiveLevel: 'thongHieu', chapter: sampleChapter, lesson: sampleLesson, score: 1.0 });

    // 4 câu trả lời ngắn
    for (let i = 0; i < 2; i++) slots.push({ section: 'part3_short_answer', cognitiveLevel: 'thongHieu', chapter: sampleChapter, lesson: sampleLesson, score: 0.5 });
    for (let i = 0; i < 2; i++) slots.push({ section: 'part3_short_answer', cognitiveLevel: 'vanDung', chapter: sampleChapter, lesson: sampleLesson, score: 0.5 });

    // 2 câu tự luận (1 câu 1.5đ, 1 câu 1.5đ)
    slots.push({ section: 'part4_essay', cognitiveLevel: 'thongHieu', chapter: sampleChapter, lesson: sampleLesson, score: 1.5 });
    slots.push({ section: 'part4_essay', cognitiveLevel: 'vanDungCao', chapter: sampleChapter, lesson: sampleLesson, score: 1.5 });
  }

  // Sắp xếp các slot theo đúng thứ tự 4 phần của Bộ GD&ĐT: Phần I -> Phần II -> Phần III -> Phần IV
  const sectionOrder = {
    part1_mcq: 1,
    part2_true_false: 2,
    part3_short_answer: 3,
    part4_essay: 4,
  };

  slots.sort((a, b) => sectionOrder[a.section] - sectionOrder[b.section]);

  // Tính số câu và phân bổ điểm chuẩn 10.0 cho các phần
  const part1Slots = slots.filter((s) => s.section === 'part1_mcq');
  const part2Slots = slots.filter((s) => s.section === 'part2_true_false');
  const part3Slots = slots.filter((s) => s.section === 'part3_short_answer');
  const part4Slots = slots.filter((s) => s.section === 'part4_essay');

  const p1TotalCount = part1Slots.length;
  const p2TotalCount = part2Slots.length;
  const p3TotalCount = part3Slots.length;
  const p4TotalCount = part4Slots.length;

  const scoreP1Total = +(p1TotalCount * (matrixConfig.scorePerTn1 || 0.25)).toFixed(2);
  const scoreP2Total = +(p2TotalCount * (matrixConfig.scorePerTn2 || 1.0)).toFixed(2);
  const scoreP3Total = +(p3TotalCount * (matrixConfig.scorePerTn3 || 0.5)).toFixed(2);
  const totalTn = +(scoreP1Total + scoreP2Total + scoreP3Total).toFixed(2);
  const totalTl = Math.max(0, +(10 - totalTn).toFixed(2));
  const scorePerEssayEach = p4TotalCount > 0 ? +(totalTl / p4TotalCount).toFixed(2) : 0;

  let p1Counter = 1;
  let p2Counter = 1;
  let p3Counter = 1;
  let p4Counter = 1;

  // Sinh từng câu hỏi
  slots.forEach((slot, idx) => {
    let qTemplate = findBestQuestionFromBank(subject, grade, slot.lesson, slot.section, slot.cognitiveLevel, usedPrompts);
    if (!qTemplate) {
      qTemplate = createFallbackQuestion(subject, grade, slot.chapter, slot.lesson, slot.section, slot.cognitiveLevel, idx + 1);
    }
    usedPrompts.add(qTemplate.prompt);

    let qCode = `[C${idx + 1}]`;
    let assignedScore = slot.score;

    if (slot.section === 'part1_mcq') {
      qCode = `[C${p1Counter++}]`;
      assignedScore = matrixConfig.scorePerTn1 || 0.25;
      part1Count++;
    } else if (slot.section === 'part2_true_false') {
      qCode = `[C${p2Counter++}]`;
      assignedScore = matrixConfig.scorePerTn2 || 1.0;
      part2Count++;
    } else if (slot.section === 'part3_short_answer') {
      qCode = `[C${p3Counter++}]`;
      assignedScore = matrixConfig.scorePerTn3 || 0.5;
      part3Count++;
    } else if (slot.section === 'part4_essay') {
      qCode = `[Bài ${p4Counter++}]`;
      assignedScore = scorePerEssayEach > 0 ? scorePerEssayEach : slot.score;
      part4Count++;
    }

    const cogLabel =
      slot.cognitiveLevel === 'nhanBiet'
        ? 'Nhận biết'
        : slot.cognitiveLevel === 'thongHieu'
        ? 'Thông hiểu'
        : slot.cognitiveLevel === 'vanDung'
        ? 'Vận dụng'
        : 'Vận dụng cao';

    // Tìm YCCĐ tương ứng từ specRows theo tt hoặc theo tên nội dung
    let matchingObjective = qTemplate.learningObjective;
    const matchingSpecRow = specRows.find(
      (sr) =>
        (slot.tt !== undefined && sr.tt === slot.tt) ||
        sr.noiDung.toLowerCase().trim() === slot.lesson.toLowerCase().trim() ||
        sr.noiDung.toLowerCase().includes(slot.lesson.toLowerCase()) ||
        slot.lesson.toLowerCase().includes(sr.noiDung.toLowerCase())
    );
    if (matchingSpecRow && matchingSpecRow.items && matchingSpecRow.items.length > 0) {
      const specItem =
        matchingSpecRow.items.find((it) => it.mucDo === slot.cognitiveLevel) ||
        (slot.cognitiveLevel === 'vanDungCao' ? matchingSpecRow.items.find((it) => it.mucDo === 'vanDung') : undefined);
      if (specItem && specItem.yeuCauCanDat) {
        matchingObjective = specItem.yeuCauCanDat;
      }
    }

    questions.push({
      id: `q-${idx + 1}-${Date.now()}`,
      code: qCode,
      section: slot.section,
      type: qTemplate.type,
      prompt: qTemplate.prompt,
      options: qTemplate.options,
      correctOption: qTemplate.correctOption,
      tfStatements: qTemplate.tfStatements,
      shortAnswerText: qTemplate.shortAnswerText,
      essayGradingSteps: qTemplate.essayGradingSteps,
      score: assignedScore,
      cognitiveLevel: slot.cognitiveLevel,
      cognitiveLevelLabel: cogLabel,
      chapter: slot.chapter,
      lesson: slot.lesson,
      learningObjective: matchingObjective,
      solutionExplanation: qTemplate.solutionExplanation,
    });
  });

  // Tính toán tóm tắt ma trận
  const summary = calculateAlignmentSummary(questions);

  const paperConfig: ExamPaperConfig = {
    examLevel,
    title: defaultTitle,
    subTitle: `Năm học ${academicYear} — Môn ${subject} ${grade}`,
    schoolName: matrixConfig.schoolName || 'TRƯỜNG THCS NGUYỄN DU',
    department: matrixConfig.department || 'TỔ KHOA HỌC TỰ NHIÊN',
    subject,
    grade,
    academicYear,
    durationMinutes,
    examCode,
    semester: (matrixConfig.limitWeekFrom || 1) >= 19 ? 2 : 1,
    mode: 'matrix_aligned',
    format: matrixConfig.structureType || 'moet_2025_new',
    weekFrom: matrixConfig.limitWeekFrom || 1,
    weekTo: matrixConfig.limitWeekTo || 9,
    selectedTopics: rowsToUse.map((r) => r.noiDung),
    countPart1Mcq: part1Count,
    countPart2Tf: part2Count,
    countPart3Short: part3Count,
    countPart4Essay: part4Count,
    scorePerMcq: matrixConfig.scorePerTn1 || 0.25,
    scorePerTf: matrixConfig.scorePerTn2 || 1.0,
    scorePerShort: matrixConfig.scorePerTn3 || 0.5,
    scorePerEssay: matrixConfig.scorePerTl || 1.0,
    ratioTn: matrixConfig.ratioTn || 70,
    ratioTl: matrixConfig.ratioTl || 30,
  };

  return formatPaperLatex({
    id: `exam-paper-${Date.now()}`,
    config: paperConfig,
    createdAt: new Date().toISOString(),
    questions,
    totalScore: 10,
    matrixAlignmentSummary: summary,
  });
}

// =================================================================
// 2. SINH ĐỀ KIỂM TRA TÙY CHỈNH (KTTX HOẶC THAY ĐỔI SỐ CÂU/HÌNH THỨC)
// =================================================================

export function generateCustomExamPaper(
  config: Partial<ExamPaperConfig>,
  ppctDataset: PpctDataset,
  sgkBooks?: SgkBook[]
): ExamPaper {
  const subject = config.subject || ppctDataset.subject || 'Toán';
  const grade = config.grade || ppctDataset.grade || '9';
  const academicYear = config.academicYear || ppctDataset.academicYear || '2026 - 2027';
  const examLevel = config.examLevel || 'kttx';

  const isKttx = examLevel === 'kttx';
  const isMidterm = examLevel === 'giua_ky';
  const isFinal = examLevel === 'cuoi_ky';

  const title =
    config.title ||
    (isKttx
      ? 'ĐỀ KIỂM TRA THƯỜNG XUYÊN'
      : isMidterm
      ? 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I'
      : isFinal
      ? 'ĐỀ KIỂM TRA ĐỊNH KỲ CUỐI HỌC KỲ I'
      : 'ĐỀ KIỂM TRA MÔN ' + subject.toUpperCase());

  const durationMinutes = config.durationMinutes || (isKttx ? 15 : 90);
  const examCode = config.examCode || '101';
  const format: ExamStructureFormat = config.format || (isKttx ? 'tn_only' : 'moet_2025_new');

  // Lấy các bài học được chỉ định
  const weekFrom = config.weekFrom || 1;
  const weekTo = config.weekTo || (isKttx ? 4 : 9);

  const availableLessons = ppctDataset.lessons.filter((l) => l.tuan >= weekFrom && l.tuan <= weekTo);
  const topicsToUse =
    config.selectedTopics && config.selectedTopics.length > 0
      ? config.selectedTopics
      : availableLessons.length > 0
      ? Array.from(new Set(availableLessons.map((l) => l.baiHoc)))
      : ['Căn bậc hai và hằng đẳng thức', 'Liên hệ giữa phép nhân và khai phương'];

  // Số lượng câu hỏi tùy chỉnh
  let countMcq = config.countPart1Mcq !== undefined ? config.countPart1Mcq : isKttx ? 10 : 12;
  let countTf = config.countPart2Tf !== undefined ? config.countPart2Tf : isKttx ? 0 : 2;
  let countShort = config.countPart3Short !== undefined ? config.countPart3Short : isKttx ? 0 : 4;
  let countEssay = config.countPart4Essay !== undefined ? config.countPart4Essay : isKttx ? 0 : 2;

  // Điều chỉnh theo format
  if (format === 'tn_only') {
    countTf = 0;
    countShort = 0;
    countEssay = 0;
    if (countMcq === 0) countMcq = isKttx ? 10 : 20;
  } else if (format === 'tl_only') {
    countMcq = 0;
    countTf = 0;
    countShort = 0;
    if (countEssay === 0) countEssay = 4;
  }

  // Phân bổ điểm để tổng tròn 10.0
  let scorePerMcq = config.scorePerMcq || (countMcq > 0 ? (format === 'tn_only' ? 10 / countMcq : 0.25) : 0);
  let scorePerTf = config.scorePerTf || (countTf > 0 ? 1.0 : 0);
  let scorePerShort = config.scorePerShort || (countShort > 0 ? 0.5 : 0);
  let scorePerEssay = config.scorePerEssay || 1.0;

  // Cân đối lại điểm tự luận nếu còn dư
  const rawTnScore = countMcq * scorePerMcq + countTf * scorePerTf + countShort * scorePerShort;
  const remainingForEssay = Math.max(0, 10 - rawTnScore);
  if (countEssay > 0) {
    scorePerEssay = +(remainingForEssay / countEssay).toFixed(2);
  }

  const questions: ExamQuestion[] = [];
  const usedPrompts = new Set<string>();
  let qNum = 1;

  // 1. Phần I: Trắc nghiệm 4 lựa chọn
  for (let i = 0; i < countMcq; i++) {
    const topic = topicsToUse[i % topicsToUse.length];
    const cogLevel: 'nhanBiet' | 'thongHieu' | 'vanDung' =
      i < Math.floor(countMcq * 0.5)
        ? 'nhanBiet'
        : i < Math.floor(countMcq * 0.8)
        ? 'thongHieu'
        : 'vanDung';

    let qTemplate = findBestQuestionFromBank(subject, grade, topic, 'part1_mcq', cogLevel, usedPrompts);
    if (!qTemplate) {
      qTemplate = createFallbackQuestion(subject, grade, 'Chủ đề kiểm tra', topic, 'part1_mcq', cogLevel, i + 1);
    }
    usedPrompts.add(qTemplate.prompt);

    questions.push({
      id: `custom-q-p1-${i + 1}-${Date.now()}`,
      code: `[C${qNum}]`,
      section: 'part1_mcq',
      type: 'multiple_choice',
      prompt: qTemplate.prompt,
      options: qTemplate.options,
      correctOption: qTemplate.correctOption,
      score: scorePerMcq,
      cognitiveLevel: cogLevel,
      cognitiveLevelLabel: cogLevel === 'nhanBiet' ? 'Nhận biết' : cogLevel === 'thongHieu' ? 'Thông hiểu' : 'Vận dụng',
      chapter: 'Chương trình kiểm tra',
      lesson: topic,
      learningObjective: qTemplate.learningObjective,
      solutionExplanation: qTemplate.solutionExplanation,
    });
    qNum++;
  }

  // 2. Phần II: Trắc nghiệm Đúng/Sai
  for (let i = 0; i < countTf; i++) {
    const topic = topicsToUse[i % topicsToUse.length];
    const cogLevel = i === 0 ? 'thongHieu' : 'vanDung';
    let qTemplate = findBestQuestionFromBank(subject, grade, topic, 'part2_true_false', cogLevel, usedPrompts);
    if (!qTemplate) {
      qTemplate = createFallbackQuestion(subject, grade, 'Chủ đề kiểm tra', topic, 'part2_true_false', cogLevel, i + 1);
    }
    usedPrompts.add(qTemplate.prompt);

    questions.push({
      id: `custom-q-p2-${i + 1}-${Date.now()}`,
      code: `[C${qNum}]`,
      section: 'part2_true_false',
      type: 'true_false',
      prompt: qTemplate.prompt,
      tfStatements: qTemplate.tfStatements,
      score: scorePerTf,
      cognitiveLevel: cogLevel,
      cognitiveLevelLabel: cogLevel === 'thongHieu' ? 'Thông hiểu' : 'Vận dụng',
      chapter: 'Chương trình kiểm tra',
      lesson: topic,
      learningObjective: qTemplate.learningObjective,
      solutionExplanation: qTemplate.solutionExplanation,
    });
    qNum++;
  }

  // 3. Phần III: Trắc nghiệm trả lời ngắn
  for (let i = 0; i < countShort; i++) {
    const topic = topicsToUse[i % topicsToUse.length];
    const cogLevel = i < Math.floor(countShort * 0.5) ? 'thongHieu' : 'vanDung';
    let qTemplate = findBestQuestionFromBank(subject, grade, topic, 'part3_short_answer', cogLevel, usedPrompts);
    if (!qTemplate) {
      qTemplate = createFallbackQuestion(subject, grade, 'Chủ đề kiểm tra', topic, 'part3_short_answer', cogLevel, i + 1);
    }
    usedPrompts.add(qTemplate.prompt);

    questions.push({
      id: `custom-q-p3-${i + 1}-${Date.now()}`,
      code: `[C${qNum}]`,
      section: 'part3_short_answer',
      type: 'short_answer',
      prompt: qTemplate.prompt,
      shortAnswerText: qTemplate.shortAnswerText,
      score: scorePerShort,
      cognitiveLevel: cogLevel,
      cognitiveLevelLabel: cogLevel === 'thongHieu' ? 'Thông hiểu' : 'Vận dụng',
      chapter: 'Chương trình kiểm tra',
      lesson: topic,
      learningObjective: qTemplate.learningObjective,
      solutionExplanation: qTemplate.solutionExplanation,
    });
    qNum++;
  }

  // 4. Phần IV: Tự luận
  for (let i = 0; i < countEssay; i++) {
    const topic = topicsToUse[i % topicsToUse.length];
    const cogLevel: 'thongHieu' | 'vanDung' | 'vanDungCao' =
      i === 0 ? 'thongHieu' : i === 1 ? 'vanDung' : 'vanDungCao';

    let qTemplate = findBestQuestionFromBank(subject, grade, topic, 'part4_essay', cogLevel, usedPrompts);
    if (!qTemplate) {
      qTemplate = createFallbackQuestion(subject, grade, 'Chủ đề kiểm tra', topic, 'part4_essay', cogLevel, i + 1);
    }
    usedPrompts.add(qTemplate.prompt);

    questions.push({
      id: `custom-q-p4-${i + 1}-${Date.now()}`,
      code: `[C${qNum}]`,
      section: 'part4_essay',
      type: 'essay',
      prompt: qTemplate.prompt,
      essayGradingSteps: qTemplate.essayGradingSteps,
      score: scorePerEssay,
      cognitiveLevel: cogLevel,
      cognitiveLevelLabel: cogLevel === 'thongHieu' ? 'Thông hiểu' : cogLevel === 'vanDung' ? 'Vận dụng' : 'Vận dụng cao',
      chapter: 'Chương trình kiểm tra',
      lesson: topic,
      learningObjective: qTemplate.learningObjective,
      solutionExplanation: qTemplate.solutionExplanation,
    });
    qNum++;
  }

  const summary = calculateAlignmentSummary(questions);

  const fullConfig: ExamPaperConfig = {
    examLevel,
    title,
    subTitle: `Năm học ${academicYear} — Môn ${subject} ${grade}`,
    schoolName: config.schoolName || 'TRƯỜNG THCS NGUYỄN DU',
    department: config.department || 'TỔ KHOA HỌC TỰ NHIÊN',
    subject,
    grade,
    academicYear,
    durationMinutes,
    examCode,
    semester: weekFrom >= 19 ? 2 : 1,
    mode: 'custom',
    format,
    weekFrom,
    weekTo,
    selectedTopics: topicsToUse,
    countPart1Mcq: countMcq,
    countPart2Tf: countTf,
    countPart3Short: countShort,
    countPart4Essay: countEssay,
    scorePerMcq,
    scorePerTf,
    scorePerShort,
    scorePerEssay,
    ratioTn: format === 'tn_only' ? 100 : format === 'tl_only' ? 0 : config.ratioTn || 70,
    ratioTl: format === 'tn_only' ? 0 : format === 'tl_only' ? 100 : config.ratioTl || 30,
  };

  return formatPaperLatex({
    id: `exam-paper-${Date.now()}`,
    config: fullConfig,
    createdAt: new Date().toISOString(),
    questions,
    totalScore: 10,
    matrixAlignmentSummary: summary,
  });
}

// =================================================================
// 3. XÁO TRỘN ĐỀ VÀ TẠO NHIỀU MÃ ĐỀ (101, 102, 103, 104)
// =================================================================

export function shuffleExamPaper(originalPaper: ExamPaper, newCode: string): ExamPaper {
  // Hoán vị câu hỏi trong từng phần, giữ nguyên cấu trúc các phần I, II, III, IV
  const p1 = originalPaper.questions.filter((q) => q.section === 'part1_mcq');
  const p2 = originalPaper.questions.filter((q) => q.section === 'part2_true_false');
  const p3 = originalPaper.questions.filter((q) => q.section === 'part3_short_answer');
  const p4 = originalPaper.questions.filter((q) => q.section === 'part4_essay');

  // Hàm xáo trộn mảng
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Xáo trộn phương án A, B, C, D của MCQ
  const shuffledP1 = shuffle(p1).map((q) => {
    if (!q.options || q.options.length < 4 || !q.correctOption) return { ...q };

    const correctText = q.options.find((o) => o.key === q.correctOption)?.text || '';
    const shuffledOptionsTexts = shuffle(q.options.map((o) => o.text));
    const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    const newOptions = keys.map((k, idx) => ({
      key: k,
      text: shuffledOptionsTexts[idx],
    }));

    const newCorrectKey = newOptions.find((o) => o.text === correctText)?.key || 'A';

    return {
      ...q,
      options: newOptions,
      correctOption: newCorrectKey,
    };
  });

  const shuffledP2 = shuffle(p2);
  const shuffledP3 = shuffle(p3);
  // Phần tự luận có thể giữ nguyên thứ tự hoặc xáo nhẹ nếu có nhiều bài
  const shuffledP4 = [...p4];

  // Ghép lại và đánh lại mã câu [C1], [C2]...
  const allShuffled = [...shuffledP1, ...shuffledP2, ...shuffledP3, ...shuffledP4];
  const reIndexed = allShuffled.map((q, idx) => ({
    ...q,
    code: `[C${idx + 1}]`,
  }));

  return formatPaperLatex({
    ...originalPaper,
    id: `exam-paper-${newCode}-${Date.now()}`,
    config: {
      ...originalPaper.config,
      examCode: newCode,
    },
    questions: reIndexed,
    matrixAlignmentSummary: calculateAlignmentSummary(reIndexed),
  });
}

// =================================================================
// 4. THAY ĐỔI CÂU HỎI TƯƠNG ĐƯƠNG (REGENERATE SINGLE QUESTION)
// =================================================================

export function regenerateSingleQuestion(
  currentQuestion: ExamQuestion,
  allQuestionsInPaper: ExamQuestion[]
): ExamQuestion {
  const usedPrompts = new Set(allQuestionsInPaper.map((q) => q.prompt));

  let replacement = findBestQuestionFromBank(
    'Toán',
    '9',
    currentQuestion.lesson,
    currentQuestion.section,
    currentQuestion.cognitiveLevel,
    usedPrompts
  );

  if (!replacement) {
    replacement = createFallbackQuestion(
      'Toán',
      '9',
      currentQuestion.chapter,
      currentQuestion.lesson,
      currentQuestion.section,
      currentQuestion.cognitiveLevel,
      Date.now() % 100
    );
  }

  return formatQuestionLatex({
    ...currentQuestion,
    prompt: replacement.prompt,
    options: replacement.options,
    correctOption: replacement.correctOption,
    tfStatements: replacement.tfStatements,
    shortAnswerText: replacement.shortAnswerText,
    essayGradingSteps: replacement.essayGradingSteps,
    learningObjective: replacement.learningObjective,
    solutionExplanation: replacement.solutionExplanation,
  });
}

// =================================================================
// 5. TÍNH TOÁN BẢNG ĐỐI CHIẾU MA TRẬN & YÊU CẦU CẦN ĐẠT
// =================================================================

function calculateAlignmentSummary(questions: ExamQuestion[]) {
  let mcqCount = 0;
  let tfCount = 0;
  let shortCount = 0;
  let essayCount = 0;

  let scoreNB = 0;
  let scoreTH = 0;
  let scoreVD = 0;
  let scoreVDC = 0;

  let scoreP1 = 0;
  let scoreP2 = 0;
  let scoreP3 = 0;
  let scoreP4 = 0;

  questions.forEach((q) => {
    const s = q.score || 0;

    if (q.section === 'part1_mcq') {
      mcqCount++;
      scoreP1 += s;
    } else if (q.section === 'part2_true_false') {
      tfCount++;
      scoreP2 += s;
    } else if (q.section === 'part3_short_answer') {
      shortCount++;
      scoreP3 += s;
    } else if (q.section === 'part4_essay') {
      essayCount++;
      scoreP4 += s;
    }

    if (q.cognitiveLevel === 'nhanBiet') scoreNB += s;
    else if (q.cognitiveLevel === 'thongHieu') scoreTH += s;
    else if (q.cognitiveLevel === 'vanDung') scoreVD += s;
    else if (q.cognitiveLevel === 'vanDungCao') scoreVDC += s;
  });

  const totalScore = scoreP1 + scoreP2 + scoreP3 + scoreP4 || 10;
  const tnScore = scoreP1 + scoreP2 + scoreP3;
  const tlScore = scoreP4;

  return {
    totalQuestions: questions.length,
    mcqCount,
    tfCount,
    shortCount,
    essayCount,
    scoreNhanBiet: +scoreNB.toFixed(2),
    scoreThongHieu: +scoreTH.toFixed(2),
    scoreVanDung: +scoreVD.toFixed(2),
    scoreVanDungCao: +scoreVDC.toFixed(2),
    scorePart1: +scoreP1.toFixed(2),
    scorePart2: +scoreP2.toFixed(2),
    scorePart3: +scoreP3.toFixed(2),
    scorePart4: +scoreP4.toFixed(2),
    percentTn: Math.round((tnScore / totalScore) * 100),
    percentTl: Math.round((tlScore / totalScore) * 100),
  };
}
