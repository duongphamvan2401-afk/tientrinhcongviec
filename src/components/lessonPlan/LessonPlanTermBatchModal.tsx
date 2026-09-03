import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Link2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Eye,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { LessonPlan, PpctDataset } from '../../types';
import {
  recognizeTermLessons,
  convertRecognizedToLessonPlans,
  RecognizedLessonPlanItem,
} from '../../utils/lessonPlanTermMatcher';
import { generateCV5512LessonPlan } from '../../data/standardLessonPlanTemplates';

interface LessonPlanTermBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDataset: PpctDataset;
  onSaveBatchPlans: (plans: LessonPlan[]) => void;
  initialTerm?: 1 | 2;
  initialMasterLink?: string;
}

export function LessonPlanTermBatchModal({
  isOpen,
  onClose,
  activeDataset,
  onSaveBatchPlans,
  initialTerm = 1,
  initialMasterLink,
}: LessonPlanTermBatchModalProps) {
  const [selectedTerm, setSelectedTerm] = useState<1 | 2>(initialTerm || 1);
  const [masterLink, setMasterLink] = useState(initialMasterLink || '');
  const [showAdvancedPaste, setShowAdvancedPaste] = useState(false);
  const [customRawText, setCustomRawText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [schoolName, setSchoolName] = useState(activeDataset?.school || 'TRƯỜNG THCS LÊ QUÝ ĐÔN');
  const [teacherName, setTeacherName] = useState('Nguyễn Văn Trọng');
  const [academicYear, setAcademicYear] = useState(activeDataset?.academicYear || '2026 - 2027');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewItem, setPreviewItem] = useState<RecognizedLessonPlanItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTerm) setSelectedTerm(initialTerm);
      if (initialMasterLink) setMasterLink(initialMasterLink);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTerm, initialMasterLink]);

  // Tự động nhận dạng danh sách bài học và chương của Tập
  const recognizedItems = useMemo(() => {
    return recognizeTermLessons(activeDataset, selectedTerm, masterLink, customRawText);
  }, [activeDataset, selectedTerm, masterLink, customRawText]);

  // Trạng thái tick chọn từng bài
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Cập nhật selectedIds khi danh sách nhận dạng thay đổi
  const effectiveItems: RecognizedLessonPlanItem[] = useMemo(() => {
    return recognizedItems.map((item) => ({
      ...item,
      isSelected: selectedIds[item.id] !== undefined ? selectedIds[item.id] : true,
    }));
  }, [recognizedItems, selectedIds]);

  // Thống kê chi tiết từng chương của Tập đã chọn
  const chapterBreakdown = useMemo(() => {
    const map = new Map<string, { chapterName: string; lessonCount: number; periodCount: number }>();
    effectiveItems.forEach((item) => {
      const ch = item.chapterName || (selectedTerm === 1 ? 'Chương trình Tập 1' : 'Chương trình Tập 2');
      if (!map.has(ch)) {
        map.set(ch, { chapterName: ch, lessonCount: 1, periodCount: item.periods });
      } else {
        const cur = map.get(ch)!;
        cur.lessonCount += 1;
        cur.periodCount += item.periods;
      }
    });
    return Array.from(map.values());
  }, [effectiveItems, selectedTerm]);

  if (!isOpen) return null;

  const totalRecognized = effectiveItems.length;
  const totalSelected = effectiveItems.filter((i) => i.isSelected).length;

  // Lọc theo tìm kiếm và lọc theo chương
  const filteredDisplayItems = effectiveItems.filter((i) => {
    const matchSearch =
      i.lessonTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      i.chapterName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchChapter = chapterFilter === 'all' || i.chapterName === chapterFilter;
    return matchSearch && matchChapter;
  });

  const handleToggleSelectAll = () => {
    const allSelected = effectiveItems.every((i) => i.isSelected);
    const nextState: Record<string, boolean> = {};
    effectiveItems.forEach((i) => {
      nextState[i.id] = !allSelected;
    });
    setSelectedIds(nextState);
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : false,
    }));
  };

  const handleApplySampleDriveLink = () => {
    if (selectedTerm === 1) {
      setMasterLink('https://drive.google.com/drive/folders/1Toan9_Tap1_KHBD_CV5512_Full_BoGiaoAn');
    } else {
      setMasterLink('https://drive.google.com/drive/folders/1Toan9_Tap2_KHBD_CV5512_Full_BoGiaoAn');
    }
    setErrorMsg('');
  };

  const handleSubmit = () => {
    setErrorMsg('');
    if (!masterLink.trim() && !customRawText.trim()) {
      setErrorMsg(`Vui lòng nhập đường link Google Drive / OneDrive hoặc thư mục giáo án cho Tập ${selectedTerm}!`);
      return;
    }

    if (totalSelected === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 bài học để áp dụng!');
      return;
    }

    try {
      const plansToSave = convertRecognizedToLessonPlans(
        effectiveItems,
        activeDataset?.grade || '9',
        schoolName,
        teacherName,
        academicYear,
        masterLink.trim()
      );

      onSaveBatchPlans(plansToSave);
      setSuccessMsg(
        `Đã tự động nhận dạng và tạo thành công ${plansToSave.length} kế hoạch bài dạy cho toàn bộ Tập ${selectedTerm}!`
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu kế hoạch bài dạy.');
    }
  };

  // Xem trước nội dung chi tiết của 1 bài học
  const previewPlanObject: LessonPlan | null = previewItem
    ? generateCV5512LessonPlan({
        lessonTitle: previewItem.lessonTitle,
        chapterName: previewItem.chapterName,
        grade: activeDataset?.grade || '9',
        periods: previewItem.periods,
        periodRangeText: previewItem.periodRangeText,
        weekNumber: previewItem.weekNumber,
        schoolName,
        teacherName,
        academicYear,
        term: previewItem.term,
        volume: previewItem.volume,
        masterTermLink: masterLink || undefined,
        externalLink: previewItem.assignedLink || masterLink || undefined,
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Tập {selectedTerm} Toàn Bộ Nội Dung
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  Môn Toán {activeDataset?.grade ? `Khối ${activeDataset.grade}` : 'THCS'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Nhập Link Kế Hoạch Bài Dạy Cho Cả Tập {selectedTerm} (Tuần {selectedTerm === 1 ? '1 - 18' : '19 - 35'})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Term Switcher & Scope Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Chọn Tập / Học kỳ:</span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-300/60">
              <button
                type="button"
                onClick={() => {
                  setSelectedTerm(1);
                  setChapterFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  selectedTerm === 1
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tập 1 (Tuần 1 &rarr; 18)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTerm(2);
                  setChapterFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  selectedTerm === 2
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tập 2 (Tuần 19 &rarr; 35)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>{chapterBreakdown.length} Chương / Chủ Đề</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{totalRecognized} bài học ({effectiveItems.reduce((acc, i) => acc + i.periods, 0)} tiết)</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Master Drive Link Input */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-black text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <Link2 className="w-4 h-4 text-emerald-700" />
                <span>Link Thư Mục / Kế Hoạch Bài Dạy Trọn Bộ Tập {selectedTerm}:</span>
              </label>
              <button
                type="button"
                onClick={handleApplySampleDriveLink}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline"
              >
                Dán link mẫu Drive Tập {selectedTerm}
              </button>
            </div>

            <div className="relative">
              <input
                type="url"
                value={masterLink}
                onChange={(e) => setMasterLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... hoặc OneDrive, thư viện trường học"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden shadow-2xs"
              />
              <FolderOpen className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
            </div>

            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              💡 <strong>Cơ chế tự động nhận dạng:</strong> Thầy/Cô chỉ cần dán <strong>1 đường link thư mục Google Drive (hoặc OneDrive/link tài liệu số)</strong> cho cả Tập {selectedTerm}. Hệ thống sẽ tự động liên kết đường dẫn này vào <strong>tất cả {totalRecognized} bài học</strong> thuộc đầy đủ các chương trong Tập {selectedTerm}, tự động tạo nội dung chi tiết theo <strong>Công văn 5512/BGDĐT-GDTrH</strong>.
            </p>
          </div>

          {/* Chapter Breakdown Summary Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cơ Cấu Toàn Bộ Các Chương Của Tập {selectedTerm}:</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Nhấp vào từng chương để lọc danh sách bài bên dưới
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChapterFilter('all')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  chapterFilter === 'all'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">Toàn bộ các chương Tập {selectedTerm}</div>
                  <div className={`text-[10px] mt-0.5 ${chapterFilter === 'all' ? 'text-emerald-200' : 'text-slate-500'}`}>
                    Hiển thị trọn bộ tất cả nội dung
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                  chapterFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {totalRecognized} bài
                </span>
              </button>

              {chapterBreakdown.map((ch, idx) => {
                const isSelected = chapterFilter === ch.chapterName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChapterFilter(isSelected ? 'all' : ch.chapterName)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-xs truncate" title={ch.chapterName}>
                        {ch.chapterName}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {ch.periodCount} tiết PPCT
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {ch.lessonCount} bài
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced: Option to paste custom files / detailed links */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/60">
            <button
              type="button"
              onClick={() => setShowAdvancedPaste(!showAdvancedPaste)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">
                  Tuỳ chọn nâng cao: Dán danh sách file / link chi tiết của các bài
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-semibold">
                  Tùy chọn
                </span>
              </div>
              {showAdvancedPaste ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showAdvancedPaste && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-2">
                <p className="text-[11px] text-slate-500">
                  Nếu Thầy/Cô có danh sách link riêng cho từng bài trong Google Drive hoặc danh sách tên file, hãy dán vào đây. Thuật toán sẽ tự động phân tích số bài, tên bài, tên chương và gán đúng link riêng cho từng bài học!
                </p>
                <textarea
                  rows={4}
                  value={customRawText}
                  onChange={(e) => setCustomRawText(e.target.value)}
                  placeholder={`Ví dụ:\nBài 16 - Hàm số y = ax²: https://drive.google.com/file/d/1...\nBài 17 - Phương trình bậc hai: https://drive.google.com/file/d/2...\nChương IX - Đường tròn: https://drive.google.com/drive/folders/3...`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Live Preview Table of Recognized Lessons */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-slate-800 text-xs">
                  Nội Dung Chi Tiết Từng Bài Tập {selectedTerm} ({totalSelected}/{totalRecognized} bài):
                </span>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline"
                >
                  {effectiveItems.every((i) => i.isSelected) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
                {chapterFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                    <span>Đang lọc: {chapterFilter}</span>
                    <button
                      type="button"
                      onClick={() => setChapterFilter('all')}
                      className="hover:text-rose-600 ml-1 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Lọc tên bài hoặc chương..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={effectiveItems.length > 0 && effectiveItems.every((i) => i.isSelected)}
                        onChange={handleToggleSelectAll}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="px-2 py-2.5 text-center w-14">Tuần</th>
                    <th className="px-3 py-2.5">Tên Bài Học & Chương Phù Hợp</th>
                    <th className="px-3 py-2.5 text-center w-24">Thời Lượng</th>
                    <th className="px-3 py-2.5 w-36">Liên Kết Drive</th>
                    <th className="px-3 py-2.5 text-center w-28">Nội Dung Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisplayItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        Không tìm thấy bài học nào phù hợp trong Tập {selectedTerm}.
                      </td>
                    </tr>
                  ) : (
                    filteredDisplayItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`transition-colors cursor-pointer ${
                          item.isSelected ? 'hover:bg-emerald-50/50' : 'opacity-60 bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={item.isSelected}
                            onChange={() => handleToggleItem(item.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>

                        <td className="px-2 py-2 text-center font-bold text-slate-600 font-mono">
                          T.{item.weekNumber}
                        </td>

                        <td className="px-3 py-2">
                          <div className="font-bold text-slate-900 line-clamp-1">
                            {item.lessonTitle}
                          </div>
                          <div className="text-[11px] text-emerald-800 font-medium line-clamp-1">
                            {item.chapterName}
                          </div>
                        </td>

                        <td className="px-3 py-2 text-center font-mono text-[11px] font-semibold text-slate-600">
                          {item.periodRangeText}
                        </td>

                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Đúng Chương & Bài</span>
                            </span>

                            {item.assignedLink ? (
                              <div className="flex items-center gap-1 text-[10px] text-sky-700 truncate max-w-[140px]">
                                <Link2 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{item.assignedLink}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-700 block">
                                Sẽ liên kết link Tập {selectedTerm}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all shadow-2xs"
                            title="Xem chi tiết nội dung CV 5512 của bài học này"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Xem chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* School & Teacher Information Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-slate-700">
            <div>
              <label className="font-bold text-[11px] block mb-1">Trường THCS:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="font-bold text-[11px] block mb-1">Giáo viên giảng dạy:</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="font-bold text-[11px] block mb-1">Năm học:</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex-shrink-0 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>
              Tự động áp dụng cấu trúc <strong>Công văn 5512</strong> (Mục tiêu, Thiết bị, 4 Hoạt động chuẩn) cho toàn bộ Tập {selectedTerm}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-all"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className={`px-5 py-2 text-white rounded-xl font-black shadow-md flex items-center gap-2 transition-all ${
                selectedTerm === 1
                  ? 'bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700'
                  : 'bg-gradient-to-r from-indigo-700 to-teal-800 hover:from-indigo-600 hover:to-teal-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Áp Dụng Cho Cả Tập {selectedTerm} ({totalSelected} Bài Dạy)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Detail Preview Modal for a single lesson in batch modal */}
      {previewPlanObject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-5 py-3.5 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300">
                  Xem Trước Nội Dung Chi Tiết Chuẩn CV 5512
                </span>
                <h3 className="text-sm sm:text-base font-black line-clamp-1">
                  {previewPlanObject.lessonTitle}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-slate-700">
                <div>
                  <span className="font-bold text-emerald-800">{previewPlanObject.chapterName}</span>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {previewPlanObject.periodRangeText} • Tuần {previewPlanObject.weekNumber}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Tập {previewPlanObject.term}
                </span>
              </div>

              {/* I. Mục tiêu */}
              <div className="space-y-1.5">
                <h4 className="font-black text-slate-900 text-xs border-b pb-1 border-slate-200">
                  I. MỤC TIÊU DẠY HỌC
                </h4>
                <div className="space-y-1 pl-2 text-slate-700">
                  <div className="font-bold text-slate-800">1. Về kiến thức:</div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {previewPlanObject.objectives.knowledge.map((k, idx) => (
                      <li key={idx}>{k}</li>
                    ))}
                  </ul>
                  <div className="font-bold text-slate-800 mt-2">2. Về năng lực:</div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {previewPlanObject.objectives.subjectCompetencies.slice(0, 3).map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* II. Thiết bị */}
              <div className="space-y-1.5">
                <h4 className="font-black text-slate-900 text-xs border-b pb-1 border-slate-200">
                  II. THIẾT BỊ DẠY HỌC & HỌC LIỆU
                </h4>
                <p className="text-slate-700 pl-2">
                  • <strong>Giáo viên:</strong> SGK, kế hoạch bài dạy, bài giảng trình chiếu, thước thẳng, ê-ke, compa, MTCT.<br />
                  • <strong>Học sinh:</strong> SGK, vở ghi, dụng cụ học tập, máy tính cầm tay, đọc trước bài học.
                </p>
              </div>

              {/* III. Tiến trình 4 hoạt động */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs border-b pb-1 border-slate-200">
                  III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN CÔNG VĂN 5512)
                </h4>
                <div className="space-y-2 pl-1">
                  {previewPlanObject.activities.map((act) => (
                    <div key={act.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span>{act.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{act.timeEstimate}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Nội dung:</strong> {act.content}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Sản phẩm:</strong> {act.product}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* IV. Phiếu học tập */}
              {previewPlanObject.appendix?.worksheets?.[0] && (
                <div className="space-y-1.5">
                  <h4 className="font-black text-slate-900 text-xs border-b pb-1 border-slate-200">
                    IV. PHIẾU HỌC TẬP MINH HỌA
                  </h4>
                  <pre className="p-2.5 bg-amber-50/70 border border-amber-200 text-amber-950 rounded-xl text-[11px] font-sans whitespace-pre-wrap">
                    {previewPlanObject.appendix.worksheets[0].content}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
              >
                Đóng Xem Trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
