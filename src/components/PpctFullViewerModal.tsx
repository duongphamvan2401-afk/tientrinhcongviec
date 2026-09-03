import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Calendar,
  BookOpen,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Edit2,
  BookMarked,
  GraduationCap
} from 'lucide-react';
import { PpctDataset, PpctLesson, ExamEvent } from '../types';

interface PpctFullViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasets: PpctDataset[];
  activeDatasetId: string;
  onSelectDataset: (id: string) => void;
  onUpdateAcademicYear?: (datasetId: string, newYear: string) => void;
  onExportExcel: () => void;
  onSelectExamForMatrix?: (exam: ExamEvent) => void;
}

export const PpctFullViewerModal: React.FC<PpctFullViewerModalProps> = ({
  isOpen,
  onClose,
  datasets,
  activeDatasetId,
  onSelectDataset,
  onUpdateAcademicYear,
  onExportExcel,
  onSelectExamForMatrix,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<'all' | 1 | 2>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [onlyExamLessons, setOnlyExamLessons] = useState(false);
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [customYearInput, setCustomYearInput] = useState('');

  const activeDataset = useMemo(() => {
    return datasets.find((d) => d.id === activeDatasetId) || datasets[0];
  }, [datasets, activeDatasetId]);

  if (!isOpen || !activeDataset) return null;

  const currentYear = activeDataset.academicYear || '2025 - 2026';

  // Extract all distinct chapters
  const allChapters = useMemo(() => {
    const set = new Set<string>();
    activeDataset.lessons.forEach((l) => {
      if (l.chuong) set.add(l.chuong.trim());
    });
    return Array.from(set);
  }, [activeDataset]);

  // Filter lessons based on active filters
  const filteredLessons = useMemo(() => {
    return activeDataset.lessons.filter((l) => {
      // Term filter
      if (selectedTerm !== 'all' && l.hocKy !== selectedTerm) return false;

      // Chapter filter
      if (selectedChapter !== 'all' && l.chuong !== selectedChapter) return false;

      // Exam only filter
      if (onlyExamLessons) {
        const isExam =
          /kiểm tra|giữa kì|giữa kỳ|cuối kì|cuối kỳ|kttx|thường xuyên|đánh giá/i.test(l.baiHoc) ||
          /kiểm tra|ôn tập/i.test(l.chuong);
        if (!isExam) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = l.baiHoc.toLowerCase().includes(q);
        const matchChapter = l.chuong.toLowerCase().includes(q);
        const matchPeriod = String(l.tietPPCT || l.stt).includes(q);
        const matchWeek = `tuần ${l.tuan}`.includes(q) || String(l.tuan) === q;
        if (!matchTitle && !matchChapter && !matchPeriod && !matchWeek) return false;
      }

      return true;
    });
  }, [activeDataset, selectedTerm, selectedChapter, onlyExamLessons, searchTerm]);

  // Statistics
  const totalLessonsCount = activeDataset.lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0) || activeDataset.totalLessons || 140;
  const hk1Lessons = activeDataset.lessons.filter((l) => l.hocKy === 1);
  const hk2Lessons = activeDataset.lessons.filter((l) => l.hocKy === 2);
  const hk1Periods = hk1Lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0);
  const hk2Periods = hk2Lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0);

  // Categorize lesson badge
  const getLessonBadge = (lesson: PpctLesson) => {
    const text = (lesson.baiHoc + ' ' + lesson.chuong).toLowerCase();
    if (text.includes('cuối học kỳ') || text.includes('cuối học kì') || text.includes('cuối kì') || text.includes('cuối kỳ')) {
      return {
        label: 'Kiểm tra Cuối kỳ (90p)',
        color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      };
    }
    if (text.includes('giữa học kỳ') || text.includes('giữa học kì') || text.includes('giữa kì') || text.includes('giữa kỳ')) {
      return {
        label: 'Kiểm tra Giữa kỳ (90p)',
        color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      };
    }
    if (text.includes('thường xuyên') || text.includes('kttx')) {
      return {
        label: 'Kiểm tra thường xuyên',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
      };
    }
    if (text.includes('ôn tập')) {
      return {
        label: 'Ôn tập trọng tâm',
        color: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    if (text.includes('thực hành') || text.includes('trải nghiệm')) {
      return {
        label: 'Hoạt động trải nghiệm',
        color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      };
    }
    return null;
  };

  const handleSaveAcademicYear = (year: string) => {
    if (onUpdateAcademicYear && year.trim()) {
      onUpdateAcademicYear(activeDataset.id, year.trim());
    }
    setIsEditingYear(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/30 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-semibold flex items-center gap-1">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Toàn bộ Phân phối chương trình</span>
              </span>
              <span className="bg-white/15 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                Khối {activeDataset.grade || '9'}
              </span>
              <span className="bg-white/15 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                {totalLessonsCount} tiết / 35 tuần
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{activeDataset.name}</span>
            </h2>

            {/* Academic Year Quick Editor */}
            <div className="flex items-center gap-2 text-xs text-emerald-100 pt-0.5">
              <span>Năm học:</span>
              {isEditingYear ? (
                <div className="flex items-center gap-1.5 bg-white text-slate-800 p-1 rounded-lg shadow-sm">
                  <input
                    type="text"
                    defaultValue={currentYear}
                    placeholder="VD: 2025 - 2026"
                    className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold"
                    autoFocus
                    onChange={(e) => setCustomYearInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveAcademicYear(customYearInput || currentYear);
                      } else if (e.key === 'Escape') {
                        setIsEditingYear(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSaveAcademicYear(customYearInput || currentYear)}
                    className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded"
                    title="Lưu năm học"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingYear(false)}
                    className="p-1 text-slate-500 hover:text-slate-700"
                    title="Hủy"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-emerald-700/60 px-2 py-0.5 rounded border border-emerald-600/50">
                    {currentYear}
                  </span>
                  <button
                    onClick={() => {
                      setCustomYearInput(currentYear);
                      setIsEditingYear(true);
                    }}
                    className="text-emerald-200 hover:text-white underline text-xs flex items-center gap-0.5"
                    title="Chỉnh sửa năm học"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Tùy chỉnh</span>
                  </button>

                  {/* Preset quick year picker */}
                  <div className="hidden sm:flex items-center gap-1 ml-2">
                    {['2024 - 2025', '2025 - 2026', '2026 - 2027', '2027 - 2028'].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => handleSaveAcademicYear(yr)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                          yr === currentYear
                            ? 'bg-white text-emerald-900 font-bold'
                            : 'bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-medium transition-colors shadow-2xs"
              title="Xuất toàn bộ 140 tiết PPCT ra file Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-medium transition-colors shadow-2xs"
              title="In hoặc lưu PDF toàn bộ bảng PPCT"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>In PPCT</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grade / Dataset Switcher Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap mr-1">
              Chọn khối xem:
            </span>
            {datasets.map((ds) => {
              const isSelected = ds.id === activeDatasetId;
              return (
                <button
                  key={ds.id}
                  onClick={() => onSelectDataset(ds.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap text-xs ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200/60'
                  }`}
                >
                  <GraduationCap className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`} />
                  <span>{ds.name.split('—')[0].trim() || `Khối ${ds.grade}`}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ds.lessons.reduce((s, l) => s + (l.soTiet || 1), 0) || ds.totalLessons || 140}t
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline whitespace-nowrap font-medium">
            Trường: <strong className="text-slate-700">{activeDataset.school || 'TRƯỜNG THCS NGUYỄN DU'}</strong>
          </span>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Toàn bộ năm học</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {totalLessonsCount} <span className="text-xs font-normal text-slate-500">tiết</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              35 tuần (4 tiết/tuần)
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Học kỳ I</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {hk1Periods || 72} <span className="text-xs font-normal text-slate-500">tiết</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Tuần 1 ➔ Tuần 18 (GK1 T9, CK1 T18)
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Học kỳ II</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {hk2Periods || 68} <span className="text-xs font-normal text-slate-500">tiết</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Tuần 19 ➔ Tuần 35 (GK2 T26, CK2 T33)
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Số chương / chủ đề</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {allChapters.length} <span className="text-xs font-normal text-slate-500">chủ đề</span>
            </div>
            <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
              Chuẩn CT GDPT 2018
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Term selector buttons */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setSelectedTerm('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedTerm === 'all'
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cả năm ({totalLessonsCount}t)
              </button>
              <button
                onClick={() => setSelectedTerm(1)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedTerm === 1
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Học kỳ I (18 tuần)
              </button>
              <button
                onClick={() => setSelectedTerm(2)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  selectedTerm === 2
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Học kỳ II (17 tuần)
              </button>
            </div>

            {/* Chapter filter dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 max-w-[220px] truncate"
              >
                <option value="all">Tất cả các chương</option>
                {allChapters.map((ch, idx) => (
                  <option key={idx} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle only exams */}
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 select-none">
              <input
                type="checkbox"
                checked={onlyExamLessons}
                onChange={(e) => setOnlyExamLessons(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="font-medium">Chỉ hiện tiết kiểm tra / ôn tập</span>
            </label>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bài học, tuần, tiết..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Table (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-center">
                  <th className="p-2.5 w-12 border-r border-slate-200">STT</th>
                  <th className="p-2.5 w-16 border-r border-slate-200">Tuần</th>
                  <th className="p-2.5 w-14 border-r border-slate-200">HK</th>
                  <th className="p-2.5 w-20 border-r border-slate-200">Tiết PPCT</th>
                  <th className="p-2.5 text-left border-r border-slate-200">Tên bài dạy / Nội dung hoạt động</th>
                  <th className="p-2.5 text-left w-56 border-r border-slate-200 hidden md:table-cell">Chương / Chủ đề</th>
                  <th className="p-2.5 w-16 border-r border-slate-200">Số tiết</th>
                  <th className="p-2.5 w-44 text-center">Mốc kiểm tra / Phân loại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLessons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Không tìm thấy tiết học nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredLessons.map((lesson, idx) => {
                    const badge = getLessonBadge(lesson);
                    const isExamRow = Boolean(badge && (badge.label.includes('Kiểm tra') || badge.label.includes('Cuối kỳ') || badge.label.includes('Giữa kỳ')));
                    
                    return (
                      <tr
                        key={lesson.id || idx}
                        className={`transition-colors ${
                          isExamRow
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : idx % 2 === 0
                            ? 'bg-white hover:bg-slate-50'
                            : 'bg-slate-50/40 hover:bg-slate-100/60'
                        }`}
                      >
                        <td className="p-2.5 text-center text-slate-500 font-mono border-r border-slate-200">
                          {lesson.stt || idx + 1}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-slate-800 border-r border-slate-200">
                          Tuần {lesson.tuan}
                        </td>
                        <td className="p-2.5 text-center text-slate-600 border-r border-slate-200">
                          HK{lesson.hocKy}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-800 border-r border-slate-200">
                          {lesson.tietPPCT ? `Tiết ${lesson.tietPPCT}` : `T${lesson.stt}`}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800 border-r border-slate-200">
                          <span className={isExamRow ? 'font-bold text-amber-950' : ''}>
                            {lesson.baiHoc}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 text-[11px] border-r border-slate-200 hidden md:table-cell">
                          {lesson.chuong}
                        </td>
                        <td className="p-2.5 text-center font-semibold text-slate-700 border-r border-slate-200">
                          {lesson.soTiet || 1}
                        </td>
                        <td className="p-2.5 text-center">
                          {badge ? (
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${badge.color}`}>
                              {badge.label}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span>Hiển thị: <strong>{filteredLessons.length}</strong> / {activeDataset.lessons.length} bài dạy</span>
            <span>•</span>
            <span>Tổng số tiết: <strong>{filteredLessons.reduce((s, l) => s + (l.soTiet || 1), 0)}</strong> tiết</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
