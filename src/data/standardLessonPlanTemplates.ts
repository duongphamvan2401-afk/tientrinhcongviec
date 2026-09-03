import { LessonPlan } from '../types';

/**
 * Trợ lý trích xuất mục tiêu và hoạt động chi tiết phù hợp với từng chủ đề chuyên môn
 */
function getSpecializedLessonDetails(title: string, chapter: string, grade: string = '9') {
  const t = (title + ' ' + chapter).toLowerCase();

  // 1. CHƯƠNG VI TẬP 2: HÀM SỐ y = ax² VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN
  if (t.includes('hàm số y = ax') || t.includes('y = ax²') || t.includes('đồ thị')) {
    return {
      knowledge: [
        'Nắm vững định nghĩa hàm số y = ax² (a ≠ 0), tập xác định, tính chất đồng biến, nghịch biến khi a > 0 và khi a < 0.',
        'Mô tả và vẽ chính xác dạng đồ thị hàm số y = ax² (parabol có đỉnh O(0,0), nhận trục tung Oy làm trục đối xứng).',
        'Biết cách lập bảng giá trị với các điểm đối xứng và biểu diễn các điểm tương ứng trên mặt phẳng tọa độ Oxy.',
        'Nhận biết một số hình ảnh thực tế có dạng đường cong parabol (cầu treo, tia nước phun, gương parabol).'
      ],
      act1Content: 'Học sinh quan sát hình ảnh cây cầu treo Cổng Vàng (Golden Gate) hoặc đài phun nước, giáo viên đặt câu hỏi: "Quỹ đạo chuyển động của tia nước có dạng đường cong gì và phương trình toán học mô tả nó như thế nào?"',
      act2Content: 'Học sinh thực hiện điền bảng giá trị của y = 2x² và y = -2x², nhận xét tính đối xứng của các giá trị y, xác định tọa độ đỉnh và chiều mở bề lõm của parabol.',
      act3Content: 'Vẽ đồ thị hai hàm số y = x² và y = -1/2 x² trên cùng mặt phẳng tọa độ; tìm tọa độ giao điểm của parabol với đường thẳng d: y = 2x + 3.',
      act4Content: 'Bài toán thực tế: Một quả bóng được sút lên có quỹ đạo h = -4.9t² + 20t. Tính thời gian bóng chạm đất và độ cao cực đại của quả bóng.',
      ws1: '1. Điền vào bảng giá trị x thuộc {-3, -2, -1, 0, 1, 2, 3} cho hàm số y = 1/2 x².\n2. Nhận xét vị trí của parabol so với trục Ox khi hệ số a > 0 và a < 0.\n3. Điểm M(2; 2) và N(-2; -2) có thuộc đồ thị hàm số y = 1/2 x² không?'
    };
  }

  if (t.includes('phương trình bậc hai') || t.includes('công thức nghiệm')) {
    return {
      knowledge: [
        'Nhận biết dạng tổng quát phương trình bậc hai một ẩn: ax² + bx + c = 0 (a ≠ 0) và xác định đúng các hệ số a, b, c.',
        'Nắm vững công thức tính biệt thức Δ = b² - 4ac (và Δ\' = b\'² - ac khi hệ số b chẵn).',
        'Vận dụng thành thạo điều kiện số nghiệm: Δ > 0 (2 nghiệm phân biệt), Δ = 0 (nghiệm kép x1 = x2 = -b/(2a)), Δ < 0 (phương trình vô nghiệm).',
        'Sử dụng thành thạo máy tính cầm tay (MTCT) để giải và kiểm tra nghiệm của phương trình bậc hai.'
      ],
      act1Content: 'Giải bài toán cổ: Tìm cạnh của một mảnh đất hình chữ nhật có chu vi 30m và diện tích 54m² dẫn đến phương trình x² - 15x + 54 = 0.',
      act2Content: 'GV hướng dẫn học sinh biến đổi đưa ax² + bx + c = 0 về dạng (x + b/(2a))² = (b² - 4ac)/(4a²), từ đó rút ra công thức nghiệm thông qua biệt thức Δ.',
      act3Content: 'Thực hành giải 3 phương trình bậc hai đại diện cho 3 trường hợp: Δ > 0 (x² - 7x + 10 = 0), Δ = 0 (4x² - 12x + 9 = 0), Δ < 0 (2x² - 3x + 5 = 0).',
      act4Content: 'Vận dụng: Tìm điều kiện của tham số m để phương trình x² - 2(m + 1)x + m² - 3 = 0 có hai nghiệm phân biệt.',
      ws1: '1. Xác định hệ số a, b, c và tính Δ cho các PT: a) 3x² + 5x - 2 = 0; b) x² - 6x + 9 = 0; c) 2x² - x + 4 = 0.\n2. Kết luận số nghiệm và tìm nghiệm cụ thể (nếu có).'
    };
  }

  if (t.includes('viète') || t.includes('vi-ét') || t.includes('vi-et')) {
    return {
      knowledge: [
        'Phát biểu và chứng minh được Định lí Viète: Nếu x1, x2 là hai nghiệm của ax² + bx + c = 0 (a ≠ 0) thì x1 + x2 = -b/a và x1.x2 = c/a.',
        'Áp dụng quy tắc nhẩm nghiệm nhanh: Nếu a + b + c = 0 thì x1 = 1, x2 = c/a; Nếu a - b + c = 0 thì x1 = -1, x2 = -c/a.',
        'Biết cách tìm hai số u và v khi biết tổng u + v = S và tích u.v = P (u và v là nghiệm của X² - SX + P = 0 với S² - 4P ≥ 0).',
        'Tính giá trị biểu thức đối xứng của các nghiệm (x1² + x2², 1/x1 + 1/x2, |x1 - x2|) mà không cần giải phương trình.'
      ],
      act1Content: 'Cho hai nghiệm x1 = 2, x2 = 3 của phương trình x² - 5x + 6 = 0. So sánh x1 + x2 và x1.x2 với các hệ số của phương trình để phát hiện mối quan hệ.',
      act2Content: 'Xây dựng Định lí Viète từ công thức nghiệm tổng quát. Khám phá trường hợp đặc biệt a + b + c = 0 và a - b + c = 0 qua các ví dụ trực quan.',
      act3Content: 'Nhẩm nghiệm các phương trình: a) 2026x² - 2027x + 1 = 0; b) 5x² + 7x + 2 = 0. Tính x1² + x2² của phương trình x² - 4x + 1 = 0.',
      act4Content: 'Tìm hai kích thước chiều dài và chiều rộng của khu vườn hình chữ nhật có chu vi 40m và diện tích 96m² bằng định lý đảo Viète.',
      ws1: '1. Không giải phương trình 2x² - 7x + 3 = 0, hãy tính: A = x1 + x2; B = x1.x2; C = x1² + x2²; D = 1/x1 + 1/x2.\n2. Tìm hai số biết tổng S = -7 và tích P = 12.'
    };
  }

  if (t.includes('lập phương trình') || t.includes('bài toán thực tế')) {
    return {
      knowledge: [
        'Nắm vững quy trình 3 bước giải bài toán bằng cách lập phương trình: (1) Lập PT; (2) Giải PT; (3) Đối chiếu điều kiện và kết luận.',
        'Kỹ năng chọn ẩn số hợp lý, đặt đơn vị và điều kiện thực tế cho ẩn số (nguyên dương, lớn hơn 0...).',
        'Biểu diễn các đại lượng chưa biết theo ẩn và các đại lượng đã biết thông qua bảng phân tích dữ kiện.',
        'Phân loại các dạng toán thực tế phổ biến: Toán chuyển động (s = v.t), toán làm chung - làm riêng (năng suất), toán hình học và toán kinh tế.'
      ],
      act1Content: 'Nêu tình huống: Một xưởng may nhận may 300 bộ quần áo trong một thời gian quy định. Nhờ cải tiến kỹ thuật, mỗi ngày may thêm 5 bộ nên hoàn thành sớm 3 ngày. GV dẫn dắt HS lập phương trình.',
      act2Content: 'Phân tích dữ kiện qua bảng 3 cột (Năng suất, Thời gian, Khối lượng công việc); chọn ẩn x là số sản phẩm may mỗi ngày theo kế hoạch; thiết lập phương trình 300/x - 300/(x+5) = 3.',
      act3Content: 'Học sinh hoạt động nhóm giải phương trình quy về bậc hai: 3x² + 15x - 1500 = 0. Đối chiếu nghiệm x = 20 (nhận), x = -25 (loại).',
      act4Content: 'Học sinh tự thiết kế một bài toán thực tế liên quan đến chi tiêu gia đình hoặc thời gian di chuyển bằng xe đạp điện từ nhà đến trường.',
      ws1: 'Bài toán: Một ô tô dự định đi từ A đến B cách nhau 120 km trong một thời gian dự định. Sau khi đi được nửa quãng đường, xe tăng vận tốc thêm 10 km/h nên đến B sớm hơn dự định 12 phút. Tính vận tốc dự định của ô tô.'
    };
  }

  // 2. CHƯƠNG VII TẬP 2: MỘT SỐ YẾU TỐ THỐNG KÊ
  if (t.includes('thống kê') || t.includes('tần số') || t.includes('biểu đồ')) {
    return {
      knowledge: [
        'Hiểu và nhận biết được bảng tần số và bảng tần số tương đối của một mẫu số liệu thống kê.',
        'Nắm vững công thức tần số tương đối: fi = (mi / N) * 100% (trong đó mi là tần số của giá trị xi, N là kích thước mẫu).',
        'Đọc, phân tích và vẽ chính xác biểu đồ tần số, biểu đồ tần số tương đối (dạng biểu đồ cột, biểu đồ đoạn thẳng hoặc biểu đồ hình quạt tròn).',
        'Rút ra nhận xét, kết luận có ý nghĩa thực tế từ bảng số liệu và biểu đồ thống kê.'
      ],
      act1Content: 'Khảo sát nhanh cỡ giày của 40 học sinh trong lớp. Thu thập dữ liệu thô và thảo luận cách trình bày số liệu sao cho người xem nắm bắt nhanh nhất cỡ giày phổ biến nhất.',
      act2Content: 'Học sinh lập bảng tần số cho dữ liệu cỡ giày; tính tần số tương đối của từng nhóm; học cách chia hình quạt tròn theo tỉ lệ phần trăm tương ứng.',
      act3Content: 'Vẽ biểu đồ tần số tương đối dạng cột cho bảng phân bố điểm kiểm tra giữa kỳ môn Toán; nhận xét tỷ lệ học sinh đạt loại Khá - Giỏi.',
      act4Content: 'Đọc biểu đồ cơ cấu các ngành kinh tế của địa phương; viết báo cáo ngắn 3-5 câu dự báo xu hướng việc làm.',
      ws1: 'Cho mẫu số liệu điểm số của 20 học sinh: 7, 8, 9, 6, 8, 7, 10, 8, 9, 7, 6, 8, 7, 9, 8, 10, 7, 8, 9, 8.\n1. Lập bảng tần số và tần số tương đối.\n2. Vẽ biểu đồ đoạn thẳng biểu diễn mẫu số liệu trên.'
    };
  }

  // 3. CHƯƠNG VIII TẬP 2: MỘT SỐ YẾU TỐ XÁC SUẤT
  if (t.includes('xác suất') || t.includes('phép thử') || t.includes('không gian mẫu') || t.includes('biến cố')) {
    return {
      knowledge: [
        'Nhận biết phép thử ngẫu nhiên, mô tả được không gian mẫu Ω của phép thử đơn giản (tung đồng xu, gieo xúc xắc, rút thẻ).',
        'Hiểu khái niệm biến cố, biến cố thuận lợi, biến cố chắc chắn, biến cố không thể.',
        'Tính xác suất của biến cố theo định nghĩa cổ điển: P(A) = n(A) / n(Ω).',
        'Phân biệt xác suất lý thuyết và xác suất thực nghiệm thông qua các thí nghiệm lặp lại nhiều lần.'
      ],
      act1Content: 'Cho 2 học sinh thực hiện tung đồng xu 20 lần; ghi lại số lần xuất hiện mặt ngửa; so sánh tỉ số thực nghiệm với tỉ số lý thuyết 1/2.',
      act2Content: 'Xác định không gian mẫu khi gieo một con xúc xắc 6 mặt; liệt kê các kết quả thuận lợi cho biến cố "Xuất hiện mặt có số chấm là số nguyên tố".',
      act3Content: 'Tính xác suất khi rút ngẫu nhiên 1 lá bài từ cỗ bài tây 52 lá; tính xác suất rút được quân Át (Ace) hoặc quân hình cơ.',
      act4Content: 'Trò chơi hội chợ: Phân tích tính công bằng của một trò chơi quay số trúng thưởng trong ngày hội xuân của trường.',
      ws1: 'Gieo đồng thời hai con xúc xắc cân đối. 1. Liệt kê số phần tử của không gian mẫu Ω.\n2. Tính xác suất của các biến cố: A: "Tổng số chấm bằng 7"; B: "Hai con xúc xắc xuất hiện số chấm giống nhau".'
    };
  }

  // 4. CHƯƠNG IX TẬP 2: ĐƯỜNG TRÒN VÀ ĐA GIÁC ĐỀU
  if (t.includes('góc ở tâm') || t.includes('góc nội tiếp') || t.includes('đa giác đều') || t.includes('cung tròn') || t.includes('quạt tròn') || t.includes('phép quay')) {
    return {
      knowledge: [
        'Nhận biết góc ở tâm, góc nội tiếp của đường tròn và mối liên hệ: Trong một đường tròn, số đo góc nội tiếp bằng nửa số đo góc ở tâm cùng chắn một cung.',
        'Nắm vững tính chất: Các góc nội tiếp cùng chắn một cung (hoặc các cung bằng nhau) thì bằng nhau; góc nội tiếp chắn nửa đường tròn là góc vuông.',
        'Định nghĩa đa giác đều, tâm đối xứng, trục đối xứng; nhận biết phép quay giữ nguyên đa giác đều.',
        'Thuộc và vận dụng công thức tính độ dài đường tròn C = 2πR, độ dài cung tròn l = (πRn)/180, diện tích hình tròn S = πR², diện tích hình quạt tròn Sq = (πR²n)/360.'
      ],
      act1Content: 'Sử dụng phần mềm GeoGebra hoặc compa vẽ đường tròn (O), vẽ góc ở tâm AOB và góc nội tiếp AMB cùng chắn cung AB. Dùng thước đo góc đo hai góc và nhận xét.',
      act2Content: 'Chứng minh định lí về góc nội tiếp trong 3 trường hợp (tâm O nằm trên một cạnh, tâm O nằm bên trong góc, tâm O nằm bên ngoài góc).',
      act3Content: 'Bài tập: Cho tam giác ABC nội tiếp (O) đường kính BC = 10 cm, góc ABC = 60°. Tính độ dài cạnh AB, AC và diện tích hình quạt tròn tạo bởi cung nhỏ AC.',
      act4Content: 'Ứng dụng thực tế: Tính độ dài vòm cong của một chiếc cầu bán nguyệt có khẩu độ 20m và diện tích lớp sơn phủ bề mặt cung tròn.',
      ws1: '1. Cho đường tròn (O; 5cm), cung AB có số đo 72°. Tính độ dài cung AB và diện tích hình quạt tròn AOB.\n2. Chứng minh tứ giác ABCD có góc ngoài tại một đỉnh bằng góc trong tại đỉnh đối diện là tứ giác nội tiếp.'
    };
  }

  // 5. CHƯƠNG X TẬP 2: MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN
  if (t.includes('hình trụ') || t.includes('hình nón') || t.includes('hình cầu') || t.includes('thực tiễn') || t.includes('hình khối')) {
    return {
      knowledge: [
        'Mô tả các yếu tố của hình trụ, hình nón, hình cầu (bán kính đáy r, chiều cao h, đường sinh l, tâm và bán kính mặt cầu R).',
        'Thuộc và sử dụng thành thạo các công thức tính diện tích xung quanh, diện tích toàn phần và thể tích:\n' +
        '  - Hình trụ: Sxq = 2πrh, V = πr²h.\n' +
        '  - Hình nón: Sxq = πrl (với l² = h² + r²), V = 1/3 πr²h.\n' +
        '  - Hình cầu: S = 4πR², V = 4/3 πR³.',
        'Giải quyết các bài toán liên quan đến vật thể thực tế trong đời sống (lon nước ngọt, chiếc nón lá, thùng chứa nước, quả bóng đá, bể chứa hình cầu).'
      ],
      act1Content: 'Cho học sinh quan sát các vật thật: Hộp sữa đặc (hình trụ), chiếc nón lá (hình nón), quả địa cầu (hình cầu). GV đặt câu hỏi: "Làm thế nào để tính lượng kim loại cần dùng làm vỏ hộp sữa và thể tích sữa chứa bên trong?"',
      act2Content: 'Mô phỏng sự tạo thành hình trụ khi quay hình chữ nhật quanh một cạnh; hình nón khi quay tam giác vuông quanh một cạnh góc vuông; hình cầu khi quay nửa hình tròn quanh đường kính.',
      act3Content: 'Tính diện tích toàn phần và thể tích của chiếc lon nước ngọt có bán kính đáy 3cm và chiều cao 12cm. Tính diện tích lá cọ làm nón lá có đường kính đáy 40cm, chiều cao 25cm.',
      act4Content: 'Thiết kế mô hình: Tính toán thể tích nước tối đa mà một bồn chứa hình trụ kết hợp hai đầu bán cầu có thể tích trữ cho khu dân cư.',
      ws1: '1. Một hình nón có đường kính đáy 16cm và chiều cao 6cm. Tính độ dài đường sinh l, diện tích xung quanh và thể tích hình nón.\n2. Quả bóng rổ tiêu chuẩn có bán kính 12cm. Tính diện tích bề mặt da của quả bóng và lượng không khí bơm đầy bên trong.'
    };
  }

  // 6. ÔN TẬP THI VÀO 10 THPT & TỔNG KẾT
  if (t.includes('ôn tập') || t.includes('lớp 10') || t.includes('thi vào 10') || t.includes('kiểm tra')) {
    return {
      knowledge: [
        'Hệ thống hóa toàn bộ kiến thức trọng tâm môn Toán THCS: Biểu thức đại số và căn thức, Hệ phương trình, Phương trình bậc hai và định lí Viète, Hàm số bậc nhất và bậc hai, Hình học đường tròn, Hình khối thực tế.',
        'Rèn luyện kỹ năng phân tích cấu trúc đề thi tuyển sinh vào lớp 10 THPT theo định dạng chuẩn mới nhất của Sở GD&ĐT.',
        'Khắc phục các lỗi sai thường gặp (quên đặt điều kiện xác định, kết luận sai, vẽ hình sai tỉ lệ, thiếu đơn vị).',
        'Rèn luyện chiến thuật phân bổ thời gian hợp lý (câu dễ làm trước, câu khó làm sau, kiểm tra lại bài bằng máy tính cầm tay).'
      ],
      act1Content: 'Trình chiếu ma trận và cấu trúc đề thi thử vào lớp 10 năm học mới; phân tích thang điểm chi tiết từng câu và các điểm "bẫy" học sinh dễ mất điểm.',
      act2Content: 'Chia nhóm giải quyết 4 chuyên đề cốt lõi: Nhóm 1: Rút gọn biểu thức chứa căn; Nhóm 2: Hệ PT và giải toán bằng cách lập PT; Nhóm 3: Phương trình bậc hai chứa tham số m; Nhóm 4: Bài toán hình học tổng hợp.',
      act3Content: 'Thực hành giải trọn vẹn 1 đề thi thử trong thời gian chuẩn; giáo viên hướng dẫn chấm chéo bài của bạn theo barem điểm chính thức.',
      act4Content: 'Xây dựng kế hoạch ôn tập cá nhân trong giai đoạn nước rút; tự làm sổ tay tổng hợp công thức toán học cần nhớ.',
      ws1: 'Đề luyện tập: Bài 1 (2,0đ) Rút gọn biểu thức; Bài 2 (2,0đ) Giải toán lập PT; Bài 3 (2,0đ) Hàm số parabol và đường thẳng; Bài 4 (3,5đ) Hình học đường tròn nội tiếp; Bài 5 (0,5đ) Bất đẳng thức giá trị nhỏ nhất.'
    };
  }

  // MẶC ĐỊNH CHO CÁC BÀI TẬP 1 HOẶC CHƯA PHÂN LOẠI
  return {
    knowledge: [
      `Nhận biết được khái niệm, định nghĩa và dạng tổng quát của ${title}.`,
      `Hiểu và nắm vững các tính chất, quy tắc biến đổi và phương pháp giải liên quan đến ${title}.`,
      `Vận dụng được kiến thức về ${title} để giải quyết bài tập và các tình huống toán học thực tiễn bám sát yêu cầu cần đạt của Chương trình GDPT 2018.`
    ],
    act1Content: `Học sinh quan sát tình huống thực tế hoặc bài toán gợi mở liên quan đến ${title}, tạo mâu thuẫn nhận thức để xuất hiện vấn đề cần nghiên cứu.`,
    act2Content: `Nghiên cứu SGK, thảo luận nhóm với Phiếu học tập số 1 để xây dựng định nghĩa, tính chất và các bước thực hiện của ${title}.`,
    act3Content: `Thực hành giải các bài tập cơ bản và nâng cao có hướng dẫn để củng cố kỹ năng tính toán và trình bày lập luận toán học.`,
    act4Content: `Giải quyết bài toán thực tế vận dụng kiến thức bài học vào đời sống; giao nhiệm vụ tìm tòi mở rộng về nhà.`,
    ws1: `Họ và tên: ........................................... Lớp: ${grade}A1\nNhiệm vụ: Thực hiện bài tập khám phá kiến thức trọng tâm bài ${title}.`
  };
}

/**
 * Tạo Kế hoạch bài dạy (KHBD / Giáo án) chuẩn cấu trúc Công văn 5512/BGDĐT-GDTrH
 * và cập nhật mới nhất của Bộ Giáo dục và Đào tạo cho môn Toán
 */
export function generateCV5512LessonPlan(params: {
  lessonTitle: string;
  chapterName?: string;
  grade?: string;
  periods?: number;
  periodRangeText?: string;
  weekNumber?: number;
  schoolName?: string;
  teacherName?: string;
  academicYear?: string;
  sourceType?: 'standard_cv5512' | 'external_link' | 'uploaded_file';
  externalLink?: string;
  masterTermLink?: string;
  term?: 1 | 2;
  volume?: 1 | 2;
}): LessonPlan {
  const grade = params.grade || '9';
  const periods = params.periods || 2;
  const title = params.lessonTitle || 'BÀI 1: PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN';
  const week = params.weekNumber || 1;
  const school = params.schoolName || 'TRƯỜNG THCS LÊ QUÝ ĐÔN';
  const teacher = params.teacherName || 'Nguyễn Văn Trọng';
  const year = params.academicYear || '2026 - 2027';
  const term = params.term || (week <= 18 ? 1 : 2);
  const volume = params.volume || term;
  const chapter = params.chapterName || (term === 2 ? 'CHƯƠNG VI: HÀM SỐ Y = AX² VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN' : 'CHƯƠNG I: PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN');

  // Trích xuất tên ngắn gọn của bài
  const cleanTitle = title.replace(/^BÀI\s+\d+[:.]?\s*/i, '').trim();

  // Lấy chi tiết chuyên môn toán học theo từng chủ đề bài học
  const spec = getSpecializedLessonDetails(title, chapter, grade);

  return {
    id: `khbd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    lessonKey: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    lessonTitle: title,
    chapterName: chapter,
    subject: 'TOÁN',
    grade,
    periods,
    periodRangeText: params.periodRangeText || `Tiết 1 - ${periods} (Tuần ${week})`,
    weekNumber: week,
    schoolName: school,
    teacherName: teacher,
    academicYear: year,
    term,
    volume,
    sourceType: params.sourceType || (params.externalLink ? 'external_link' : 'standard_cv5512'),
    externalLink: params.externalLink,
    masterTermLink: params.masterTermLink,
    uploadedAt: new Date().toLocaleDateString('vi-VN'),

    // I. MỤC TIÊU (Chuẩn Công văn 5512/BGDĐT-GDTrH)
    objectives: {
      // 1. Về kiến thức
      knowledge: spec.knowledge,

      // 2. Về năng lực chung
      generalCompetencies: [
        'Năng lực tự chủ và tự học: Tự giác tìm tòi, đọc SGK, chuẩn bị bài và tích cực thực hiện các nhiệm vụ cá nhân.',
        'Năng lực giao tiếp và hợp tác: Tương tác tích cực với bạn học trong thảo luận nhóm, biết lắng nghe và phản biện khoa học có căn cứ.',
        'Năng lực giải quyết vấn đề và sáng tạo: Biết phân tích tình huống có vấn đề, phát hiện quy luật và đề xuất các cách giải quyết khác nhau.'
      ],

      // 2. Về năng lực đặc thù Toán học
      subjectCompetencies: [
        `Năng lực tư duy và lập luận toán học: So sánh, khái quát hóa để nhận biết dạng toán của ${cleanTitle}; biết suy luận hợp lý trong quá trình lập luận và tính toán.`,
        'Năng lực mô hình hóa toán học: Chuyển đổi bài toán thực tế sang mô hình toán học tương ứng và kiểm tra tính hợp lí của nghiệm trong ngữ cảnh thực tiễn.',
        'Năng lực giải quyết vấn đề toán học: Lựa chọn và thực hiện được các thao tác đại số, hình học phù hợp để tìm ra kết quả chính xác.',
        'Năng lực giao tiếp toán học: Sử dụng chính xác ngôn ngữ toán học (kí hiệu, thuật ngữ, công thức, hình vẽ) để trình bày lời giải rõ ràng, mạch lạc.',
        'Năng lực sử dụng công cụ, phương tiện học toán: Sử dụng thành thạo thước kẻ, ê-ke, compa và máy tính cầm tay (MTCT) để hỗ trợ tính toán và kiểm tra kết quả.'
      ],

      // 3. Về phẩm chất
      qualities: [
        'Chăm chỉ: Có tinh thần vượt khó, kiên trì hoàn thành các bài tập và nhiệm vụ học tập được giao.',
        'Trung thực: Tự giác làm bài, khách quan và trung thực khi tự đánh giá và đánh giá chéo kết quả của bạn.',
        'Trách nhiệm: Có ý thức hợp tác cao trong làm việc nhóm, bảo vệ đồ dùng học tập của bản thân và lớp học.'
      ]
    },

    // II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
    equipmentAndMaterials: {
      teacher: [
        'Kế hoạch bài dạy (giáo án), sách giáo khoa (SGK), sách giáo viên (SGV) môn Toán.',
        'Thiết bị trình chiếu (máy chiếu/ti vi), bài giảng điện tử (PowerPoint / Canva) có các hình ảnh và hiệu ứng trực quan minh họa.',
        'Phiếu học tập số 1, Phiếu học tập số 2 (in sẵn cho các nhóm học sinh).',
        'Thước thẳng chia vạch, ê-ke, compa, phấn màu hoặc bút dạ bảng, máy tính cầm tay.'
      ],
      students: [
        'Sách giáo khoa, vở ghi bài, vở bài tập Toán.',
        'Đồ dùng học tập: Thước kẻ, compa, ê-ke, bút chì, tẩy, máy tính cầm tay (MTCT).',
        'Đọc trước nội dung bài học ở nhà theo hướng dẫn của giáo viên trong tiết trước.'
      ]
    },

    // III. TIẾN TRÌNH DẠY HỌC (4 hoạt động chuẩn theo Phụ lục IV Công văn 5512/BGDĐT-GDTrH)
    activities: [
      {
        id: 'act-1',
        name: `Hoạt động 1: Xác định vấn đề/nhiệm vụ học tập/Mở đầu (Khởi động: ${cleanTitle})`,
        timeEstimate: '7 phút',
        objective: 'Giúp học sinh xác định được vấn đề/nhiệm vụ cụ thể cần giải quyết trong bài học hoặc xác định rõ cách thức giải quyết vấn đề/thực hiện nhiệm vụ trong các hoạt động tiếp theo của bài học; kích hoạt kiến thức nền tảng và tạo hứng thú học tập.',
        content: spec.act1Content,
        product: 'Trình bày cụ thể yêu cầu về nội dung và hình thức của sản phẩm: Kết quả xử lí tình huống; câu trả lời, dự đoán của học sinh trên bảng phụ/vở nháp; mô tả được vấn đề cần giải quyết hoặc nhiệm vụ học tập phải thực hiện tiếp theo.',
        organizationSteps: [
          {
            stepNumber: 1,
            stepName: 'Bước 1: Giao nhiệm vụ học tập',
            teacherAction: 'GV trình chiếu tình huống/hình ảnh thực tế liên quan đến bài học, nêu câu hỏi gợi mở tạo tình huống có vấn đề và giao nhiệm vụ cụ thể cho học sinh (yêu cầu đọc, quan sát và suy nghĩ trong 2 phút).',
            studentAction: 'HS tiếp nhận nhiệm vụ, quan sát màn hình/SGK, đọc kỹ câu hỏi và kích hoạt kiến thức đã học để tìm mối liên hệ.'
          },
          {
            stepNumber: 2,
            stepName: 'Bước 2: Thực hiện nhiệm vụ (học sinh thực hiện; giáo viên theo dõi, hỗ trợ)',
            teacherAction: 'GV theo dõi, bao quát cả lớp; phát hiện những khó khăn mà học sinh gặp phải và kịp thời gợi ý định hướng; dự kiến các mức độ hoàn thành nhiệm vụ của học sinh.',
            studentAction: 'HS làm việc cá nhân ghi nhanh dự đoán vào vở nháp, sau đó trao đổi ngắn gọn với bạn cùng bàn để thống nhất câu trả lời.'
          },
          {
            stepNumber: 3,
            stepName: 'Bước 3: Báo cáo, thảo luận (giáo viên tổ chức, điều hành; học sinh báo cáo, thảo luận)',
            teacherAction: 'GV lựa chọn đại diện 1 - 2 nhóm/học sinh báo cáo kết quả trước lớp; điều hành lớp lắng nghe, nhận xét và nêu câu hỏi phản biện.',
            studentAction: 'Đại diện học sinh đứng dậy trình bày kết quả dự đoán; các học sinh khác chú ý lắng nghe, so sánh với kết quả của mình và nhận xét, bổ sung.'
          },
          {
            stepNumber: 4,
            stepName: 'Bước 4: Kết luận, nhận định (giáo viên đánh giá, chốt kiến thức)',
            teacherAction: `GV nhận xét thái độ làm việc và câu trả lời của học sinh, chính xác hóa kết quả và dẫn dắt vào bài học mới: "${title}".`,
            studentAction: 'HS lắng nghe giáo viên nhận xét, định hình được nhiệm vụ trọng tâm của bài học và ghi tên bài mới vào vở.'
          }
        ]
      },
      {
        id: 'act-2',
        name: `Hoạt động 2: Hình thành kiến thức mới/giải quyết vấn đề/thực thi nhiệm vụ đặt ra từ Hoạt động 1 (${cleanTitle})`,
        timeEstimate: '22 phút',
        objective: `Giúp học sinh thực hiện nhiệm vụ học tập để chiếm lĩnh kiến thức mới, giải quyết trọn vẹn vấn đề đặt ra từ Hoạt động 1 liên quan đến ${cleanTitle}.`,
        content: spec.act2Content,
        product: 'Trình bày cụ thể về kiến thức mới/kết quả giải quyết vấn đề: Định nghĩa, công thức, định lý, quy tắc giải được chuẩn hóa vào vở ghi; bài giải các ví dụ minh họa trong Phiếu học tập số 1.',
        organizationSteps: [
          {
            stepNumber: 1,
            stepName: 'Bước 1: Giao nhiệm vụ học tập',
            teacherAction: 'GV chia lớp thành các nhóm học tập (4 - 6 HS), phát Phiếu học tập số 1; giao nhiệm vụ cụ thể cho các nhóm đọc SGK, làm việc với học liệu để khám phá kiến thức mới.',
            studentAction: 'HS tập hợp nhóm, phân công nhóm trưởng điều hành và thư ký ghi biên bản; đọc kỹ các câu hỏi trong Phiếu học tập số 1.'
          },
          {
            stepNumber: 2,
            stepName: 'Bước 2: Thực hiện nhiệm vụ (học sinh thực hiện; giáo viên theo dõi, hỗ trợ)',
            teacherAction: 'GV theo dõi sát sao hoạt động của các nhóm, kịp thời hỗ trợ các nhóm gặp khó khăn; dự kiến những hiểu lầm thường gặp của học sinh và đưa ra gợi ý phù hợp.',
            studentAction: 'Các thành viên trong nhóm thảo luận sôi nổi, cùng nhau giải quyết từng câu hỏi trong phiếu; thư ký tổng hợp kết quả viết vào bảng nhóm/bảng phụ.'
          },
          {
            stepNumber: 3,
            stepName: 'Bước 3: Báo cáo, thảo luận (giáo viên tổ chức, điều hành; học sinh báo cáo, thảo luận)',
            teacherAction: 'GV yêu cầu 1 nhóm treo sản phẩm lên bảng chính để báo cáo; chỉ định các nhóm khác đổi chéo sản phẩm để đối chiếu, nhận xét và phản biện.',
            studentAction: 'Đại diện nhóm báo cáo rõ ràng các nội dung đã tìm hiểu; các nhóm khác chú ý theo dõi, nêu câu hỏi thắc mắc và đóng góp ý kiến.'
          },
          {
            stepNumber: 4,
            stepName: 'Bước 4: Kết luận, nhận định (giáo viên đánh giá, chốt kiến thức)',
            teacherAction: 'GV nhận xét quá trình làm việc nhóm, đánh giá sản phẩm của từng nhóm; chuẩn hóa kiến thức trọng tâm trên màn chiếu/bảng phụ; nhấn mạnh những điểm then chốt cần ghi nhớ.',
            studentAction: 'HS chú ý lắng nghe, đối chiếu với bài làm của nhóm mình để sửa chữa và ghi chép kiến thức chuẩn vào vở bài học.'
          }
        ]
      },
      {
        id: 'act-3',
        name: 'Hoạt động 3: Luyện tập',
        timeEstimate: '11 phút',
        objective: 'Vận dụng kiến thức đã học và phát triển các kĩ năng giải toán, tính toán, biến đổi đại số và lập luận logic cho học sinh.',
        content: spec.act3Content,
        product: 'Đáp án, lời giải của các câu hỏi trắc nghiệm và bài tập tự luận do học sinh thực hiện trên bảng lớp và trong vở bài tập.',
        organizationSteps: [
          {
            stepNumber: 1,
            stepName: 'Bước 1: Giao nhiệm vụ học tập',
            teacherAction: 'GV giao hệ thống câu hỏi, bài tập cụ thể trong SGK và Phiếu học tập số 2; yêu cầu học sinh làm việc độc lập trong thời gian quy định (5 phút).',
            studentAction: 'HS mở SGK/vở bài tập, đọc kỹ đề bài, xác định dạng toán và bắt tay vào giải bài tập cá nhân.'
          },
          {
            stepNumber: 2,
            stepName: 'Bước 2: Thực hiện nhiệm vụ (học sinh thực hiện; giáo viên theo dõi, hỗ trợ)',
            teacherAction: 'GV đi quan sát khắp lớp, kiểm tra tiến độ làm bài của học sinh; hướng dẫn riêng cho những học sinh còn lúng túng; gọi 2 học sinh lên bảng làm bài.',
            studentAction: '2 HS được chỉ định lên bảng trình bày lời giải; các HS còn lại tiếp tục hoàn thành bài vào vở, tự kiểm tra lại kết quả bằng máy tính cầm tay.'
          },
          {
            stepNumber: 3,
            stepName: 'Bước 3: Báo cáo, thảo luận (giáo viên tổ chức, điều hành; học sinh báo cáo, thảo luận)',
            teacherAction: 'GV điều hành lớp nhận xét bài giải trên bảng về phương pháp, các bước trình bày và kết quả cuối cùng.',
            studentAction: 'HS dưới lớp nhận xét, bổ sung hoặc trình bày cách giải khác ngắn gọn hơn nếu có.'
          },
          {
            stepNumber: 4,
            stepName: 'Bước 4: Kết luận, nhận định (giáo viên đánh giá, chốt kiến thức)',
            teacherAction: 'GV sửa lỗi sai cụ thể bằng bút đỏ/phấn màu, chấm điểm biểu dương những học sinh làm bài tốt; tổng kết các lưu ý và sai lầm thường gặp.',
            studentAction: 'HS ghi chép những lưu ý quan trọng vào vở, sửa lại các bước giải chưa chuẩn xác.'
          }
        ]
      },
      {
        id: 'act-4',
        name: 'Hoạt động 4: Vận dụng',
        timeEstimate: '5 phút',
        objective: `Phát triển năng lực của học sinh thông qua nhiệm vụ/yêu cầu vận dụng kiến thức, kĩ năng về ${cleanTitle} vào thực tiễn cuộc sống.`,
        content: spec.act4Content,
        product: 'Yêu cầu về nội dung và hình thức báo cáo: Bài giải chi tiết, mô hình hoặc bài thu hoạch giải quyết tình huống thực tế được nộp vào buổi học kế tiếp.',
        organizationSteps: [
          {
            stepNumber: 1,
            stepName: 'Bước 1: Giao nhiệm vụ học tập',
            teacherAction: 'GV mô tả rõ bài toán/tình huống thực tiễn gắn với nội dung bài học; giao nhiệm vụ cho học sinh thực hiện ngoài giờ học trên lớp.',
            studentAction: 'HS tiếp nhận nhiệm vụ vận dụng, ghi chép hoặc lưu lại nội dung yêu cầu về nhà.'
          },
          {
            stepNumber: 2,
            stepName: 'Bước 2: Thực hiện nhiệm vụ (học sinh thực hiện; giáo viên theo dõi, hỗ trợ)',
            teacherAction: 'GV hướng dẫn học sinh cách tìm kiếm thông tin, đo đạc thực tế hoặc sử dụng công cụ tính toán hỗ trợ; sẵn sàng hỗ trợ trực tuyến qua nhóm học tập.',
            studentAction: 'HS xây dựng kế hoạch thực hiện cá nhân hoặc nhóm bạn gần nhà, tiến hành thu thập số liệu và vận dụng kiến thức bài học để giải quyết.'
          },
          {
            stepNumber: 3,
            stepName: 'Bước 3: Báo cáo, thảo luận (giáo viên tổ chức, điều hành; học sinh báo cáo, thảo luận)',
            teacherAction: 'Giao học sinh nộp báo cáo sản phẩm vào đầu tiết học sau; tổ chức cho đại diện một số học sinh báo cáo nhanh kết quả.',
            studentAction: 'HS hoàn thiện sản phẩm báo cáo theo đúng thời hạn quy định và chia sẻ kinh nghiệm cùng các bạn.'
          },
          {
            stepNumber: 4,
            stepName: 'Bước 4: Kết luận, nhận định & Dặn dò',
            teacherAction: 'GV nhận xét tinh thần vận dụng thực tiễn của học sinh; hướng dẫn học sinh tự học ở nhà và chuẩn bị chu đáo cho bài học tiếp theo.',
            studentAction: 'HS ghi nhận đánh giá của giáo viên, ghi lại những điều cần chuẩn bị cho tiết học sau.'
          }
        ]
      }
    ],

    // IV. HỒ SƠ DẠY HỌC & PHỤ LỤC
    appendix: {
      worksheets: [
        {
          title: 'PHIẾU HỌC TẬP SỐ 1: KHÁM PHÁ KIẾN THỨC MỚI',
          content: spec.ws1
        },
        {
          title: 'PHIẾU HỌC TẬP SỐ 2: BÀI TẬP LUYỆN TẬP VÀ ĐÁNH GIÁ NHANH',
          content: `1. Trắc nghiệm (4 câu): Chọn đáp án đúng nhất theo yêu cầu của bài học.\n2. Tự luận: Vận dụng giải bài tập thực hành theo các bước chuẩn đã học.`
        }
      ],
      rubrics: 'Tiêu chí đánh giá hoạt động nhóm: (1) Tinh thần hợp tác: 2 điểm; (2) Tiến độ thời gian: 2 điểm; (3) Tính chính xác của bài làm: 4 điểm; (4) Thuyết trình & phản biện: 2 điểm.'
    }
  };
}

/**
 * Danh sách các bài học mẫu sẵn có theo chuẩn GDPT 2018
 */
export const defaultSampleLessonPlans: LessonPlan[] = [
  generateCV5512LessonPlan({
    lessonTitle: 'BÀI 1: PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    chapterName: 'CHƯƠNG I: PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    grade: '9',
    periods: 2,
    periodRangeText: 'Tiết 1 - 2 (Tuần 1)',
    weekNumber: 1
  }),
  generateCV5512LessonPlan({
    lessonTitle: 'BÀI 2: HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    chapterName: 'CHƯƠNG I: PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    grade: '9',
    periods: 3,
    periodRangeText: 'Tiết 3 - 5 (Tuần 1 - 2)',
    weekNumber: 2
  }),
  generateCV5512LessonPlan({
    lessonTitle: 'BÀI 3: GIẢI HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    chapterName: 'CHƯƠNG I: PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    grade: '9',
    periods: 4,
    periodRangeText: 'Tiết 6 - 9 (Tuần 2 - 3)',
    weekNumber: 3
  }),
  generateCV5512LessonPlan({
    lessonTitle: 'BÀI 1: CĂN BẬC HAI VÀ CĂN THỨC BẬC HAI',
    chapterName: 'CHƯƠNG II: CĂN BẬC HAI VÀ CĂN BẬC BA',
    grade: '9',
    periods: 3,
    periodRangeText: 'Tiết 12 - 14 (Tuần 4)',
    weekNumber: 4
  }),
  generateCV5512LessonPlan({
    lessonTitle: 'BÀI 1: ĐỊNH LÍ THALÈS TRONG TAM GIÁC',
    chapterName: 'CHƯƠNG IV: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG & TAM GIÁC ĐỒNG DẠNG',
    grade: '9',
    periods: 2,
    periodRangeText: 'Tiết 20 - 21 (Tuần 6)',
    weekNumber: 6
  })
];
