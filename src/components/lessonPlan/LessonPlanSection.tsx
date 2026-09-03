import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Link2,
  FileDown,
  Eye,
  ExternalLink,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Trash2,
  FolderOpen,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Clock,
  GraduationCap
} from 'lucide-react';
import { LessonPlan, PpctDataset } from '../../types';
import { defaultSampleLessonPlans } from '../../data/standardLessonPlanTemplates';
import { LessonPlanViewerModal } from './LessonPlanViewerModal';
import { LessonPlanUploadModal } from './LessonPlanUploadModal';
import { LessonPlanTermBatchModal } from './LessonPlanTermBatchModal';
import { exportLessonPlanToDocx } from '../../utils/lessonPlanDocxExport';

interface LessonPlanSectionProps {
  activeDataset: PpctDataset;
  currentWeek: number;
}

const STORAGE_KEY = 'app_lesson_plans';

export const LessonPlanSection: React.FC<LessonPlanSectionProps> = ({
  activeDataset,
  currentWeek,
}) => {
  // Load plans from localStorage or defaults
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load lesson plans from localStorage', e);
    }
    return defaultSampleLessonPlans;
  });

  const [selectedPlanForView, setSelectedPlanForView] = useState<LessonPlan | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBatchTermModalOpen, setIsBatchTermModalOpen] = useState(false);
  const [batchModalTerm, setBatchModalTerm] = useState<1 | 2>(1);
  const [viewMode, setViewMode] = useState<'table' | 'chapters'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [termFilter, setTermFilter] = useState<'all' | 'term1' | 'term2'>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'link' | 'file' | 'template'>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.warn('Could not save lesson plans to localStorage', e);
    }
  }, [plans]);

  const handleSaveNewPlan = (newPlan: LessonPlan) => {
    setPlans((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.lessonTitle.toLowerCase().trim() === newPlan.lessonTitle.toLowerCase().trim()
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newPlan;
        return updated;
      }
      return [newPlan, ...prev];
    });
  };

  const handleSaveBatchPlans = (batchPlans: LessonPlan[]) => {
    setPlans((prev) => {
      const map = new Map<string, LessonPlan>();
      // Keep existing plans
      prev.forEach((p) => {
        map.set(p.lessonTitle.toLowerCase().trim(), p);
      });
      // Merge batch plans (overwrite or add)
      batchPlans.forEach((p) => {
        map.set(p.lessonTitle.toLowerCase().trim(), p);
      });
      // Sort by week then period
      return Array.from(map.values()).sort(
        (a, b) => (a.weekNumber || 1) - (b.weekNumber || 1)
      );
    });
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Thầy/Cô có chắc chắn muốn xóa Kế hoạch bài dạy này?')) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleExportWord = async (plan: LessonPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setExportingId(plan.id);
      await exportLessonPlanToDocx(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingId(null);
    }
  };

  const openBatchForTerm1 = () => {
    setBatchModalTerm(1);
    setIsBatchTermModalOpen(true);
  };

  const openBatchForTerm2 = () => {
    setBatchModalTerm(2);
    setIsBatchTermModalOpen(true);
  };

  // Tìm link tổng của Tập 1 nếu có
  const masterTerm1Link = useMemo(() => {
    const pWithMaster = plans.find(
      (p) =>
        (p.term === 1 || p.volume === 1 || (p.weekNumber && p.weekNumber <= 18)) &&
        (p.masterTermLink || (p.sourceType === 'external_link' && p.externalLink))
    );
    return pWithMaster?.masterTermLink || pWithMaster?.externalLink || '';
  }, [plans]);

  // Tìm link tổng của Tập 2 nếu có
  const masterTerm2Link = useMemo(() => {
    const pWithMaster = plans.find(
      (p) =>
        (p.term === 2 || p.volume === 2 || (p.weekNumber && p.weekNumber > 18)) &&
        (p.masterTermLink || (p.sourceType === 'external_link' && p.externalLink))
    );
    return pWithMaster?.masterTermLink || pWithMaster?.externalLink || '';
  }, [plans]);

  // Thống kê số lượng bài theo Tập
  const term1Count = useMemo(() => {
    return plans.filter(
      (p) => p.term === 1 || p.volume === 1 || (p.weekNumber !== undefined && p.weekNumber <= 18)
    ).length;
  }, [plans]);

  const term2Count = useMemo(() => {
    return plans.filter(
      (p) => p.term === 2 || p.volume === 2 || (p.weekNumber !== undefined && p.weekNumber > 18)
    ).length;
  }, [plans]);

  // Danh sách các chương duy nhất để làm bộ lọc
  const uniqueChapters = useMemo(() => {
    const chaps = plans
      .map((p) => p.chapterName)
      .filter((c): c is string => Boolean(c && c.trim().length > 0));
    return Array.from(new Set(chaps));
  }, [plans]);

  // Lọc danh sách KHBD
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchSearch =
        (p.lessonTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.chapterName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const isTerm1 = p.term === 1 || p.volume === 1 || (p.weekNumber !== undefined && p.weekNumber <= 18);
      const isTerm2 = p.term === 2 || p.volume === 2 || (p.weekNumber !== undefined && p.weekNumber > 18);

      const matchTerm =
        termFilter === 'all' ||
        (termFilter === 'term1' && isTerm1) ||
        (termFilter === 'term2' && isTerm2);

      const matchChapter =
        chapterFilter === 'all' || p.chapterName === chapterFilter;

      const matchType =
        filterType === 'all' ||
        (filterType === 'link' && p.sourceType === 'external_link') ||
        (filterType === 'file' && p.sourceType === 'uploaded_file') ||
        (filterType === 'template' && p.sourceType === 'standard_cv5512');

      return matchSearch && matchTerm && matchChapter && matchType;
    });
  }, [plans, searchQuery, termFilter, chapterFilter, filterType]);

  // Gom nhóm danh sách bài theo chương (phục vụ View theo Chương)
  const groupedByChapter = useMemo(() => {
    const map = new Map<string, { chapterName: string; isTerm1: boolean; plans: LessonPlan[] }>();
    filteredPlans.forEach((p) => {
      const isTerm1 = p.term === 1 || p.volume === 1 || (p.weekNumber !== undefined && p.weekNumber <= 18);
      const chName = p.chapterName || (isTerm1 ? 'Chương trình Tập 1' : 'Chương trình Tập 2');
      if (!map.has(chName)) {
        map.set(chName, {
          chapterName: chName,
          isTerm1,
          plans: [p],
        });
      } else {
        map.get(chName)!.plans.push(p);
      }
    });
    return Array.from(map.values());
  }, [filteredPlans]);

  // Tìm KHBD của tuần hiện tại (hoặc bài đầu tiên)
  const currentWeekPlan =
    plans.find((p) => p.weekNumber === currentWeek) ||
    plans[0] ||
    null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
      {/* Top Banner Header */}
      <div className="p-5 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
                  Chuẩn Công Văn 5512/BGDĐT-GDTrH
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  Môn Toán {activeDataset?.grade ? `Khối ${activeDataset.grade}` : 'THCS'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Kế Hoạch Bài Dạy (KHBD / Giáo Án Môn Toán)
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5 max-w-2xl">
                Quản lý kế hoạch bài dạy bám sát PPCT: hỗ trợ <strong>nhập 1 link cho cả Tập 1 và Tập 2</strong>, ứng dụng tự động nhận dạng đầy đủ các chương, bài học và nội dung chi tiết từng bài theo đúng chuẩn Bộ GD&ĐT.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút Nhập Link Cả Tập 1 */}
            <button
              onClick={openBatchForTerm1}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02]"
              title="Nhập 1 link Drive cho cả Tập 1 (Tuần 1 - 18), hệ thống tự nhận dạng toàn bộ chương và bài học"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>⚡ Nhập Link Cả Tập 1 (Tuần 1-18)</span>
            </button>

            {/* Nút Nhập Link Cả Tập 2 (Mới bổ sung theo yêu cầu) */}
            <button
              onClick={openBatchForTerm2}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-400 via-indigo-500 to-teal-400 hover:from-sky-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md hover:scale-[1.02]"
              title="Nhập 1 link Drive cho cả Tập 2 (Tuần 19 - 35), hệ thống tự nhận dạng đầy đủ chương VI - X và chi tiết từng bài"
            >
              <Sparkles className="w-4 h-4 text-indigo-950" />
              <span>⚡ Nhập Link Cả Tập 2 (Tuần 19-35)</span>
            </button>

            {/* Nút Thêm Từng Bài / Tải Lên File */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Thêm Từng Bài / Tải File</span>
            </button>
          </div>
        </div>

        {/* Master Drive Link Status Banners (Both Tập 1 & Tập 2) */}
        <div className="relative z-10 mt-3 pt-3 border-t border-emerald-800/40 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {/* Tập 1 Status */}
          <div className="flex items-center justify-between gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 truncate">
              <FolderOpen className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span className="font-bold text-emerald-200 flex-shrink-0">
                Kho Lưu Trữ Tập 1:
              </span>
              {masterTerm1Link ? (
                <a
                  href={masterTerm1Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:underline flex items-center gap-1 truncate font-mono text-[11px]"
                  title="Mở thư mục Google Drive của Tập 1"
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{masterTerm1Link}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 text-[11px] italic">Chưa liên kết</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600/60 text-emerald-100 font-bold text-[10px] border border-emerald-400/30">
                {term1Count} bài T.1
              </span>
              <button
                onClick={openBatchForTerm1}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold transition-all"
              >
                {masterTerm1Link ? 'Đồng bộ lại' : 'Nhập link'}
              </button>
            </div>
          </div>

          {/* Tập 2 Status */}
          <div className="flex items-center justify-between gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 truncate">
              <FolderOpen className="w-4 h-4 text-sky-300 flex-shrink-0" />
              <span className="font-bold text-sky-200 flex-shrink-0">
                Kho Lưu Trữ Tập 2:
              </span>
              {masterTerm2Link ? (
                <a
                  href={masterTerm2Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:underline flex items-center gap-1 truncate font-mono text-[11px]"
                  title="Mở thư mục Google Drive của Tập 2"
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{masterTerm2Link}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-amber-300/90 text-[11px] font-medium">Chưa liên kết link Tập 2</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600/60 text-indigo-100 font-bold text-[10px] border border-indigo-400/30">
                {term2Count} bài T.2
              </span>
              <button
                onClick={openBatchForTerm2}
                className="px-2 py-0.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-[10px] font-black transition-all shadow-xs"
              >
                {masterTerm2Link ? 'Đồng bộ lại' : 'Nhập link Tập 2'}
              </button>
            </div>
          </div>
        </div>

        {/* Highlight Card for Current Week's Plan */}
        {currentWeekPlan && (
          <div className="mt-3 pt-3 border-t border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Bài dạy gợi ý tuần {currentWeek}
                </span>
                <span className="text-emerald-400">•</span>
                <span className="text-xs font-semibold text-slate-200">
                  {currentWeekPlan.periodRangeText || `${currentWeekPlan.periods} tiết`}
                </span>
                {currentWeekPlan.chapterName && (
                  <>
                    <span className="text-emerald-400">•</span>
                    <span className="text-[11px] text-emerald-200 truncate max-w-[280px]">
                      {currentWeekPlan.chapterName}
                    </span>
                  </>
                )}
              </div>
              <h4 className="font-bold text-sm text-white line-clamp-1">
                {currentWeekPlan.lessonTitle}
              </h4>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedPlanForView(currentWeekPlan)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-300" />
                <span>Xem chi tiết (CV 5512)</span>
              </button>

              <button
                onClick={(e) => handleExportWord(currentWeekPlan, e)}
                disabled={exportingId === currentWeekPlan.id}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{exportingId === currentWeekPlan.id ? 'Đang xuất...' : 'Tải File Word (.docx)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 pt-1 space-y-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài dạy, chương..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Term Tabs */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">
            {[
              { id: 'all', label: `Tất cả (${plans.length})` },
              { id: 'term1', label: `Tập 1 (${term1Count})` },
              { id: 'term2', label: `Tập 2 (${term2Count})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTermFilter(tab.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  termFilter === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Filter by Type */}
            {[
              { id: 'all', label: 'Mọi nguồn' },
              { id: 'link', label: 'Có Link' },
              { id: 'file', label: 'File' },
              { id: 'template', label: 'Chuẩn 5512' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* View Mode Toggle: Table vs Chapter Breakdown */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng bảng tổng hợp"
              >
                <List className="w-3.5 h-3.5" />
                <span>Bảng</span>
              </button>

              <button
                onClick={() => setViewMode('chapters')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                  viewMode === 'chapters'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem theo từng chương chi tiết"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Theo Chương ({groupedByChapter.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter by Chapter dropdown */}
        {uniqueChapters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Chương:</span>
            </span>
            <button
              onClick={() => setChapterFilter('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                chapterFilter === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả các chương
            </button>
            {uniqueChapters.map((chap) => (
              <button
                key={chap}
                onClick={() => setChapterFilter(chap)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  chapterFilter === chap
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={chap}
              >
                {chap}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Table View or Full Chapter Breakdown View */}
      <div className="px-5 pb-5">
        {filteredPlans.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50">
            <p className="font-bold text-slate-800 text-sm mb-1">
              Chưa có Kế hoạch bài dạy nào phù hợp với bộ lọc hiện tại.
            </p>
            <p className="text-xs text-slate-500 mb-4 max-w-lg mx-auto">
              Thầy/Cô có thể nhập trực tiếp 1 link Drive cho cả Tập 1 hoặc Tập 2. Ứng dụng sẽ tự động nhận diện toàn bộ các chương và nội dung chi tiết từng bài.
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                onClick={openBatchForTerm1}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nhập Link Cả Tập 1 (Tuần 1 - 18)</span>
              </button>
              <button
                onClick={openBatchForTerm2}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nhập Link Cả Tập 2 (Tuần 19 - 35)</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'chapters' ? (
          /* ================= CHAPTER BREAKDOWN VIEW ================= */
          <div className="space-y-4">
            {groupedByChapter.map((group, gIdx) => {
              const totalChapterPeriods = group.plans.reduce((acc, p) => acc + (p.periods || 2), 0);
              return (
                <div
                  key={gIdx}
                  className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white"
                >
                  {/* Chapter Header */}
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          group.isTerm1
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {group.isTerm1 ? 'Tập 1' : 'Tập 2'}
                      </span>
                      <h4 className="font-black text-sm text-slate-900">
                        {group.chapterName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        {group.plans.length} bài dạy ({totalChapterPeriods} tiết)
                      </span>
                    </div>
                  </div>

                  {/* Lessons in this Chapter */}
                  <div className="divide-y divide-slate-100">
                    {group.plans.map((plan) => {
                      return (
                        <div
                          key={plan.id}
                          className="p-3.5 hover:bg-emerald-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {plan.weekNumber ? `Tuần ${plan.weekNumber}` : 'Tuần —'}
                              </span>
                              <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {plan.periodRangeText || `${plan.periods} tiết`}
                              </span>
                              {plan.masterTermLink && (
                                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  <span>Đã liên kết Drive</span>
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                4 Hoạt Động CV 5512
                              </span>
                            </div>

                            <h5 className="font-bold text-sm text-slate-900">
                              {plan.lessonTitle}
                            </h5>

                            {plan.objectives?.knowledge?.[0] && (
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                <strong>Mục tiêu:</strong> {plan.objectives.knowledge[0]}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                            {/* Xem chi tiết bài */}
                            <button
                              onClick={() => setSelectedPlanForView(plan)}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                              title="Xem chi tiết toàn bộ giáo án chuẩn CV 5512"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem Chi Tiết Bài</span>
                            </button>

                            {/* Tải Word */}
                            <button
                              onClick={(e) => handleExportWord(plan, e)}
                              disabled={exportingId === plan.id}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                              title="Tải kế hoạch bài dạy dạng file Word (.docx)"
                            >
                              <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Word</span>
                            </button>

                            {/* Mở link Drive */}
                            {(plan.externalLink || plan.masterTermLink) && (
                              <a
                                href={plan.externalLink || plan.masterTermLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-xl border border-sky-200 transition-all"
                                title="Mở thư mục / file trên Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Xóa */}
                            <button
                              onClick={(e) => handleDeletePlan(plan.id, e)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Xóa bài dạy"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= TABLE VIEW ================= */
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3.5 py-3 text-center w-14">Học Kỳ</th>
                  <th className="px-3.5 py-3 text-center w-14">Tuần</th>
                  <th className="px-3.5 py-3">Tên Bài Dạy & Chương Tương Ứng (CV 5512)</th>
                  <th className="px-3 py-3 text-center w-24">Thời Lượng</th>
                  <th className="px-3 py-3 w-40">Nguồn Kế Hoạch</th>
                  <th className="px-3.5 py-3 text-center w-48">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => {
                  const isTerm1 =
                    plan.term === 1 || plan.volume === 1 || (plan.weekNumber !== undefined && plan.weekNumber <= 18);
                  return (
                    <tr
                      key={plan.id}
                      onClick={() => setSelectedPlanForView(plan)}
                      className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                            isTerm1
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {isTerm1 ? 'Tập 1' : 'Tập 2'}
                        </span>
                      </td>

                      <td className="px-3.5 py-3 text-center font-bold text-slate-500 font-mono">
                        {plan.weekNumber ? `T.${plan.weekNumber}` : '—'}
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {plan.lessonTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                          <span className="font-medium text-emerald-800">{plan.chapterName}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                        {plan.periodRangeText || `${plan.periods} tiết`}
                      </td>

                      <td className="px-3 py-3">
                        {plan.sourceType === 'external_link' || plan.externalLink ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              <Link2 className="w-3 h-3" />
                              <span>{plan.masterTermLink ? (isTerm1 ? 'Thư mục Tập 1' : 'Thư mục Tập 2') : 'Link online'}</span>
                            </span>
                            {plan.externalLink && (
                              <a
                                href={plan.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5 truncate max-w-[140px]"
                                title={plan.externalLink}
                              >
                                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">Mở Drive</span>
                              </a>
                            )}
                          </div>
                        ) : plan.sourceType === 'uploaded_file' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">File tải lên</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Chuẩn CV 5512</span>
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Xem trực tiếp */}
                          <button
                            onClick={() => setSelectedPlanForView(plan)}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                            title="Xem trực tiếp nội dung chi tiết bài học"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>

                          {/* Tải Word */}
                          <button
                            onClick={(e) => handleExportWord(plan, e)}
                            disabled={exportingId === plan.id}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                            title="Tải kế hoạch bài dạy về dưới dạng file Word (.docx) chuẩn Bộ GD&ĐT"
                          >
                            <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Word</span>
                          </button>

                          {/* Mở link nếu có */}
                          {(plan.externalLink || plan.masterTermLink) && (
                            <a
                              href={plan.externalLink || plan.masterTermLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-md transition-all"
                              title="Mở liên kết Drive / tài liệu gốc"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Xóa */}
                          <button
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                            title="Xóa kế hoạch bài dạy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {selectedPlanForView && (
        <LessonPlanViewerModal
          isOpen={!!selectedPlanForView}
          onClose={() => setSelectedPlanForView(null)}
          plan={selectedPlanForView}
        />
      )}

      {/* Single Upload & Link Modal */}
      {isUploadModalOpen && (
        <LessonPlanUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          activeDataset={activeDataset}
          onSaveLessonPlan={handleSaveNewPlan}
          onOpenBatchTermModal={() => openBatchForTerm1()}
        />
      )}

      {/* Batch Term Modal (Hỗ trợ cả Tập 1 và Tập 2) */}
      {isBatchTermModalOpen && (
        <LessonPlanTermBatchModal
          isOpen={isBatchTermModalOpen}
          onClose={() => setIsBatchTermModalOpen(false)}
          activeDataset={activeDataset}
          onSaveBatchPlans={handleSaveBatchPlans}
          initialTerm={batchModalTerm}
          initialMasterLink={batchModalTerm === 1 ? masterTerm1Link : masterTerm2Link}
        />
      )}
    </div>
  );
};
