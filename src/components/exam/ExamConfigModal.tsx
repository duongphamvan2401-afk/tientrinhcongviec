import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Layers,
  BookOpen,
  Scale,
  RefreshCw,
} from 'lucide-react';
import {
  ExamLevelType,
  ExamStructureFormat,
  ExamPaperConfig,
  MatrixConfig,
  PpctDataset,
} from '../../types';

interface ExamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: ExamPaperConfig;
  matrixConfig: MatrixConfig;
  ppctDataset: PpctDataset;
  onApplyConfig: (newConfig: ExamPaperConfig, generateNew: boolean) => void;
}

export const ExamConfigModal: React.FC<ExamConfigModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  matrixConfig,
  ppctDataset,
  onApplyConfig,
}) => {
  if (!isOpen) return null;

  const [examLevel, setExamLevel] = useState<ExamLevelType>(initialConfig.examLevel);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(initialConfig.mode === 'custom');
  const [format, setFormat] = useState<ExamStructureFormat>(initialConfig.format || 'moet_2025_new');
  
  const [title, setTitle] = useState<string>(initialConfig.title);
  const [schoolName, setSchoolName] = useState<string>(initialConfig.schoolName);
  const [department, setDepartment] = useState<string>(initialConfig.department);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialConfig.durationMinutes);
  const [examCode, setExamCode] = useState<string>(initialConfig.examCode || '101');
  
  const [weekFrom, setWeekFrom] = useState<number>(initialConfig.weekFrom || 1);
  const [weekTo, setWeekTo] = useState<number>(initialConfig.weekTo || 9);
  
  // Custom Counts
  const [countPart1, setCountPart1] = useState<number>(initialConfig.countPart1Mcq);
  const [countPart2, setCountPart2] = useState<number>(initialConfig.countPart2Tf);
  const [countPart3, setCountPart3] = useState<number>(initialConfig.countPart3Short);
  const [countPart4, setCountPart4] = useState<number>(initialConfig.countPart4Essay);

  const [scorePerMcq, setScorePerMcq] = useState<number>(initialConfig.scorePerMcq || 0.25);
  const [scorePerTf, setScorePerTf] = useState<number>(initialConfig.scorePerTf || 1.0);
  const [scorePerShort, setScorePerShort] = useState<number>(initialConfig.scorePerShort || 0.5);
  const [scorePerEssay, setScorePerEssay] = useState<number>(initialConfig.scorePerEssay || 1.0);

  // Selected topics in the weeks
  const availableLessons: string[] = Array.from(
    new Set<string>(
      ppctDataset.lessons
        .filter((l) => l.tuan >= weekFrom && l.tuan <= weekTo)
        .map((l) => l.baiHoc)
    )
  );

  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialConfig.selectedTopics && initialConfig.selectedTopics.length > 0
      ? initialConfig.selectedTopics
      : availableLessons
  );

  // Switch level presets
  const handleSelectExamLevel = (level: ExamLevelType) => {
    setExamLevel(level);

    if (level === 'kttx') {
      setTitle('ĐỀ KIỂM TRA THƯỜNG XUYÊN');
      setDurationMinutes(15);
      setIsCustomMode(true);
      setFormat('tn_only');
      setCountPart1(10);
      setCountPart2(0);
      setCountPart3(0);
      setCountPart4(0);
      setScorePerMcq(1.0);
      setWeekTo(Math.min(ppctDataset.totalWeeks || 35, weekFrom + 3));
    } else if (level === 'giua_ky') {
      setTitle('ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I');
      setDurationMinutes(90);
      setIsCustomMode(false); // Mặc định theo ma trận & YCCĐ
      setFormat('moet_2025_new');
      setCountPart1(12);
      setCountPart2(2);
      setCountPart3(4);
      setCountPart4(2);
      setScorePerMcq(0.25);
      setScorePerTf(1.0);
      setScorePerShort(0.5);
      setScorePerEssay(1.5);
      setWeekFrom(1);
      setWeekTo(9);
    } else if (level === 'cuoi_ky') {
      setTitle('ĐỀ KIỂM TRA ĐỊNH KỲ CUỐI HỌC KỲ I');
      setDurationMinutes(90);
      setIsCustomMode(false); // Mặc định theo ma trận & YCCĐ
      setFormat('moet_2025_new');
      setCountPart1(12);
      setCountPart2(2);
      setCountPart3(4);
      setCountPart4(2);
      setScorePerMcq(0.25);
      setScorePerTf(1.0);
      setScorePerShort(0.5);
      setScorePerEssay(1.5);
      setWeekFrom(1);
      setWeekTo(18);
    } else {
      setTitle('ĐỀ KIỂM TRA MÔN ' + (ppctDataset.subject || 'TOÁN').toUpperCase());
      setIsCustomMode(true);
    }
  };

  // Switch format presets
  const handleSelectFormat = (fmt: ExamStructureFormat) => {
    setFormat(fmt);
    if (fmt === 'tn_only') {
      setCountPart1(10);
      setCountPart2(0);
      setCountPart3(0);
      setCountPart4(0);
      setScorePerMcq(1.0);
    } else if (fmt === 'tl_only') {
      setCountPart1(0);
      setCountPart2(0);
      setCountPart3(0);
      setCountPart4(4);
      setScorePerEssay(2.5);
    } else if (fmt === 'standard_70_30') {
      setCountPart1(28); // 28 x 0.25 = 7.0 điểm
      setCountPart2(0);
      setCountPart3(0);
      setCountPart4(2);  // 2 bài TL = 3.0 điểm
      setScorePerMcq(0.25);
      setScorePerEssay(1.5);
    } else {
      // moet_2025_new
      setCountPart1(12); // 3.0đ
      setCountPart2(2);  // 2.0đ
      setCountPart3(4);  // 2.0đ
      setCountPart4(2);  // 3.0đ
      setScorePerMcq(0.25);
      setScorePerTf(1.0);
      setScorePerShort(0.5);
      setScorePerEssay(1.5);
    }
  };

  // Tính tổng điểm thời gian thực
  const calculatedTotalScore = +(
    countPart1 * scorePerMcq +
    countPart2 * scorePerTf +
    countPart3 * scorePerShort +
    countPart4 * scorePerEssay
  ).toFixed(2);

  const isBalanced = Math.abs(calculatedTotalScore - 10.0) < 0.01;

  const handleAutoBalance = () => {
    const rawTn = countPart1 * scorePerMcq + countPart2 * scorePerTf + countPart3 * scorePerShort;
    if (countPart4 > 0) {
      const remaining = Math.max(0, 10 - rawTn);
      setScorePerEssay(+(remaining / countPart4).toFixed(2));
    } else if (countPart1 > 0) {
      setScorePerMcq(+(10 / countPart1).toFixed(2));
    }
  };

  const handleToggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) return; // giữ tối thiểu 1 chủ đề
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSaveAndGenerate = () => {
    const newConfig: ExamPaperConfig = {
      ...initialConfig,
      examLevel,
      title,
      schoolName,
      department,
      durationMinutes,
      examCode,
      mode: isCustomMode ? 'custom' : 'matrix_aligned',
      format,
      weekFrom,
      weekTo,
      selectedTopics,
      countPart1Mcq: countPart1,
      countPart2Tf: countPart2,
      countPart3Short: countPart3,
      countPart4Essay: countPart4,
      scorePerMcq,
      scorePerTf,
      scorePerShort,
      scorePerEssay,
    };

    onApplyConfig(newConfig, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Tùy chỉnh & Cấu hình Đề kiểm tra
              </h3>
              <p className="text-xs text-slate-500">
                Linh hoạt theo mức độ kiểm tra thường xuyên, giữa kỳ, cuối kỳ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* 1. Mức độ kiểm tra (Selection Tabs) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Mức độ kiểm tra
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectExamLevel('kttx')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  examLevel === 'kttx'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="text-xs font-bold">KTTX (15 - 45p)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Đánh giá thường xuyên
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectExamLevel('giua_ky')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  examLevel === 'giua_ky'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  Giữa Học Kỳ
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                    Ma trận
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Định kỳ tuần 9 / 27
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectExamLevel('cuoi_ky')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  examLevel === 'cuoi_ky'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  Cuối Học Kỳ
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                    Ma trận
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Định kỳ tuần 18 / 35
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectExamLevel('custom')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  examLevel === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="text-xs font-bold">Khảo sát / Tự chọn</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Ôn tập & kiểm tra khác
                </div>
              </button>
            </div>
          </div>

          {/* Banner thông báo chế độ ma trận chuẩn Bộ GD&ĐT cho Giữa kỳ & Cuối kỳ */}
          {(examLevel === 'giua_ky' || examLevel === 'cuoi_ky') && !isCustomMode ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div className="flex-1 text-xs space-y-1">
                <div className="font-bold text-emerald-950 text-sm">
                  ⭐ Chế độ Chuẩn: Tự động bám sát Ma trận (Phụ lục I) và Yêu cầu cần đạt (Phụ lục II)
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Đề thi được kiến tạo 100% chuẩn xác từ ma trận đã thiết lập. Từng câu hỏi
                  được gán mã [C1], [C2]... ứng đúng vị trí bài học, tỉ lệ nhận thức (Nhận biết, Thông hiểu,
                  Vận dụng, Vận dụng cao) và Yêu cầu cần đạt chuẩn Bộ GD&ĐT.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <Sliders size={13} />
                    Bật chế độ Tùy chỉnh (Khi có nhu cầu thay đổi số câu, hình thức, nội dung)
                  </button>
                </div>
              </div>
            </div>
          ) : (examLevel === 'giua_ky' || examLevel === 'cuoi_ky') && isCustomMode ? (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                <span>Đang bật chế độ tùy biến số câu hỏi, hình thức và nội dung kiểm tra.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="font-bold text-indigo-700 hover:underline shrink-0 ml-2"
              >
                Quay lại Chuẩn Ma trận & YCCĐ
              </button>
            </div>
          ) : null}

          {/* 2. Thông tin chung */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Tiêu đề và Thời lượng
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tiêu đề đề thi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Thời gian làm bài
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 45)}
                    className="w-full border border-slate-300 rounded-lg pl-3 pr-12 py-1.5 text-xs text-slate-800 font-semibold bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    phút
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tên trường
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tổ chuyên môn
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mã đề khởi tạo
                </label>
                <input
                  type="text"
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold text-center bg-white"
                  placeholder="101"
                />
              </div>
            </div>
          </div>

          {/* 3. Tùy chỉnh Cấu trúc & Số lượng câu hỏi (Khi là KTTX hoặc bật Tùy chỉnh) */}
          {(isCustomMode || examLevel === 'kttx') && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Tùy chỉnh Hình thức & Số lượng câu hỏi
              </label>

              {/* Lựa chọn hình thức cấu trúc */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectFormat('moet_2025_new')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    format === 'moet_2025_new'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold">Chuẩn BGD 2025</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Phần I, II, III, IV
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectFormat('standard_70_30')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    format === 'standard_70_30'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold">70% TN + 30% TL</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Cổ điển 28 TN + TL
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectFormat('tn_only')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    format === 'tn_only'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold">100% Trắc nghiệm</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Thích hợp 15 - 20 phút
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectFormat('tl_only')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    format === 'tl_only'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold">100% Tự luận</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Bài tập tính toán
                  </div>
                </button>
              </div>

              {/* Bảng chỉnh số câu và điểm số */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* P1 */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-bold text-slate-800">
                      Phần I: TN 4 lựa chọn
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số câu:</span>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={countPart1}
                          onChange={(e) => setCountPart1(parseInt(e.target.value, 10) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Điểm/câu:</span>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={scorePerMcq}
                          onChange={(e) => setScorePerMcq(parseFloat(e.target.value) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center text-xs"
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700 text-right">
                        = {(countPart1 * scorePerMcq).toFixed(2)} đ
                      </div>
                    </div>
                  </div>

                  {/* P2 */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-bold text-slate-800">
                      Phần II: TN Đúng/Sai
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số câu:</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={countPart2}
                          onChange={(e) => setCountPart2(parseInt(e.target.value, 10) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Điểm/câu:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={scorePerTf}
                          onChange={(e) => setScorePerTf(parseFloat(e.target.value) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center text-xs"
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700 text-right">
                        = {(countPart2 * scorePerTf).toFixed(2)} đ
                      </div>
                    </div>
                  </div>

                  {/* P3 */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-bold text-slate-800">
                      Phần III: Trả lời ngắn
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số câu:</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={countPart3}
                          onChange={(e) => setCountPart3(parseInt(e.target.value, 10) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Điểm/câu:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={scorePerShort}
                          onChange={(e) => setScorePerShort(parseFloat(e.target.value) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center text-xs"
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700 text-right">
                        = {(countPart3 * scorePerShort).toFixed(2)} đ
                      </div>
                    </div>
                  </div>

                  {/* P4 */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-bold text-slate-800">
                      Phần IV: Tự luận
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số câu/bài:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={countPart4}
                          onChange={(e) => setCountPart4(parseInt(e.target.value, 10) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Điểm/bài:</span>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={scorePerEssay}
                          onChange={(e) => setScorePerEssay(parseFloat(e.target.value) || 0)}
                          className="w-16 border rounded px-1.5 py-0.5 text-center text-xs"
                        />
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700 text-right">
                        = {(countPart4 * scorePerEssay).toFixed(2)} đ
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score balance indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className={isBalanced ? 'text-emerald-600' : 'text-amber-600'} />
                    <span className="text-xs font-medium text-slate-600">
                      Tổng điểm đề thi:{' '}
                      <strong className={isBalanced ? 'text-emerald-700 font-bold text-sm' : 'text-amber-700 font-bold text-sm'}>
                        {calculatedTotalScore} / 10.0 đ
                      </strong>
                    </span>
                    {!isBalanced && (
                      <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                        Chưa cân bằng tròn 10 điểm
                      </span>
                    )}
                  </div>

                  {!isBalanced && (
                    <button
                      type="button"
                      onClick={handleAutoBalance}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw size={13} />
                      Tự động cân bằng 10.0đ
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. Nội dung kiểm tra & Phạm vi bài học */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Nội dung & Phạm vi bài học (Từ tuần đến tuần)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Từ tuần:</span>
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={weekFrom}
                  onChange={(e) => setWeekFrom(parseInt(e.target.value, 10) || 1)}
                  className="w-14 border rounded px-1.5 py-0.5 text-center font-bold text-xs"
                />
                <span className="text-slate-500">Đến tuần:</span>
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={weekTo}
                  onChange={(e) => setWeekTo(parseInt(e.target.value, 10) || 9)}
                  className="w-14 border rounded px-1.5 py-0.5 text-center font-bold text-xs"
                />
              </div>
            </div>

            {/* Checklist bài học */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto space-y-1.5">
              <div className="text-[11px] text-slate-500 font-semibold mb-1 flex items-center justify-between">
                <span>Chọn bài học đưa vào nội dung kiểm tra:</span>
                <div className="flex gap-2 text-indigo-600">
                  <button
                    type="button"
                    onClick={() => setSelectedTopics(availableLessons)}
                    className="hover:underline"
                  >
                    Chọn tất cả
                  </button>
                </div>
              </div>
              {availableLessons.length > 0 ? (
                availableLessons.map((topic, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic)}
                      onChange={() => handleToggleTopic(topic)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-800 font-medium">{topic}</span>
                  </label>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic p-2 text-center">
                  Không có bài học nào trong khoảng tuần này. Hãy điều chỉnh lại tuần bắt đầu và tuần kết thúc.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSaveAndGenerate}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            Tạo & Áp dụng Đề kiểm tra
          </button>
        </div>
      </div>
    </div>
  );
};
