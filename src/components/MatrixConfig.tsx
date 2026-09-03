import React, { useRef, useState } from 'react';
import {
  Settings,
  Sparkles,
  Upload,
  Sliders,
  Calendar,
  Layers,
  CheckCircle2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ListFilter,
  Info,
  Clock,
  BookOpen,
  BookMarked,
  ListOrdered,
} from 'lucide-react';
import { MatrixConfig, ExamEvent, PpctDataset, PpctLesson, SgkBook } from '../types';

interface MatrixConfigProps {
  config: MatrixConfig;
  exams: ExamEvent[];
  activePpct: PpctDataset;
  sgkBooks?: SgkBook[];
  onChange: (updated: Partial<MatrixConfig>) => void;
  onGenerateFromPpct: () => void;
  onLoadSampleTemplate: (file: File) => void;
  onOpenSgkManager?: () => void;
  onOpenFullPpct?: () => void;
}

export const MatrixConfigSection: React.FC<MatrixConfigProps> = ({
  config,
  exams,
  activePpct,
  sgkBooks = [],
  onChange,
  onGenerateFromPpct,
  onLoadSampleTemplate,
  onOpenSgkManager,
  onOpenFullPpct,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLessonSelector, setShowLessonSelector] = useState(false);

  const weekFrom = config.limitWeekFrom || 1;
  const weekTo = config.limitWeekTo || 9;

  // Determine active SGK Book based on config or term
  const activeVolume = weekFrom >= 19 ? 2 : (weekTo <= 18 ? 1 : 'all');
  const matchedSgkBook = sgkBooks.find((b) => {
    if (config.activeSgkBookId) return b.id === config.activeSgkBookId;
    if (activeVolume === 1 && activePpct.sgkVolume1Id) return b.id === activePpct.sgkVolume1Id;
    if (activeVolume === 2 && activePpct.sgkVolume2Id) return b.id === activePpct.sgkVolume2Id;
    return b.volume === (activeVolume === 2 ? 2 : 1);
  }) || sgkBooks[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadSampleTemplate(file);
    }
  };

  // Extract all lessons in the range [weekFrom, weekTo] and optionally limitPeriodTo
  const lessonsInWeekRange = activePpct.lessons.filter((l) => {
    if (l.tuan < weekFrom || l.tuan > weekTo) return false;
    if (config.limitPeriodTo && l.tietPPCT && l.tietPPCT > config.limitPeriodTo) return false;
    return true;
  });

  // Calculate distinct topics / units in range
  const lessonKeysInRange = Array.from(
    new Set(
      lessonsInWeekRange.map((l) => `${l.chuong}:::${l.baiHoc.replace(/\(t\d+\)/g, '').trim()}`)
    )
  );

  // Filter based on selectedLessonKeys if user customized
  const activeSelectedKeys = config.selectedLessonKeys ?? lessonKeysInRange;
  
  const effectiveLessons = lessonsInWeekRange.filter((l) => {
    const key = `${l.chuong}:::${l.baiHoc.replace(/\(t\d+\)/g, '').trim()}`;
    return activeSelectedKeys.includes(key);
  });

  const totalPeriodsInScope = effectiveLessons.reduce((sum, l) => sum + (l.soTiet || 1), 0);

  // Group lessons by Chapter for the lesson selector modal/accordion
  const chapterGroups = new Map<string, { key: string; topic: string; lessonList: PpctLesson[]; periods: number }[]>();
  
  lessonsInWeekRange.forEach((l) => {
    const topicName = l.baiHoc.replace(/\(t\d+\)/g, '').trim();
    const key = `${l.chuong}:::${topicName}`;
    const chapterName = l.chuong;

    const list = chapterGroups.get(chapterName) || [];
    const existing = list.find((item) => item.key === key);
    if (existing) {
      existing.lessonList.push(l);
      existing.periods += (l.soTiet || 1);
    } else {
      list.push({
        key,
        topic: topicName,
        lessonList: [l],
        periods: (l.soTiet || 1),
      });
      chapterGroups.set(chapterName, list);
    }
  });

  const handleToggleLessonKey = (key: string) => {
    let updated: string[];
    if (activeSelectedKeys.includes(key)) {
      updated = activeSelectedKeys.filter((k) => k !== key);
    } else {
      updated = [...activeSelectedKeys, key];
    }
    onChange({ selectedLessonKeys: updated });
  };

  const handleSelectAllLessons = () => {
    onChange({ selectedLessonKeys: lessonKeysInRange });
  };

  const handleDeselectAllLessons = () => {
    onChange({ selectedLessonKeys: [] });
  };

  const ratioPresets = [
    { tn: 70, tl: 30, label: '70% TN — 30% TL (Chuẩn BGD)' },
    { tn: 60, tl: 40, label: '60% TN — 40% TL' },
    { tn: 50, tl: 50, label: '50% TN — 50% TL' },
    { tn: 80, tl: 20, label: '80% TN — 20% TL' },
    { tn: 100, tl: 0, label: '100% Trắc nghiệm' },
  ];

  // Practical presets matching Vietnamese school terms
  const practicalScopePresets = [
    {
      label: '🎯 Giữa HK1 (Tuần 1 – 9)',
      from: 1,
      to: 9,
      periodName: 'Kiểm tra giữa học kỳ I',
      desc: 'Khoảng tuần 1 đến tuần 9',
    },
    {
      label: '🎯 Cuối HK1: Cả HK1 (Tuần 1 – 18)',
      from: 1,
      to: 18,
      periodName: 'Kiểm tra cuối học kỳ I',
      desc: 'Toàn bộ kiến thức Học kỳ I',
    },
    {
      label: '🎯 Cuối HK1: Nửa sau (Tuần 10 – 18)',
      from: 10,
      to: 18,
      periodName: 'Kiểm tra cuối học kỳ I (Nửa sau HK1)',
      desc: 'Kiến thức sau kiểm tra giữa kỳ 1',
    },
    {
      label: '🎯 Giữa HK2 (Tuần 19 – 26)',
      from: 19,
      to: 26,
      periodName: 'Kiểm tra giữa học kỳ II',
      desc: 'Khoảng tuần 19 đến tuần 26',
    },
    {
      label: '🎯 Cuối HK2: Cả HK2 (Tuần 19 – 35)',
      from: 19,
      to: 35,
      periodName: 'Kiểm tra cuối học kỳ II',
      desc: 'Toàn bộ kiến thức Học kỳ II',
    },
    {
      label: '🎯 Cuối HK2: Nửa sau (Tuần 27 – 35)',
      from: 27,
      to: 35,
      periodName: 'Kiểm tra cuối học kỳ II (Nửa sau HK2)',
      desc: 'Kiến thức sau kiểm tra giữa kỳ 2',
    },
    {
      label: '🎯 Cả năm học (Tuần 1 – 35)',
      from: 1,
      to: 35,
      periodName: 'Kiểm tra tổng hợp cả năm',
      desc: 'Toàn bộ năm học (Tuần 1 -> 35)',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
      {/* Top Header with Active PPCT Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Thông tin & Cấu hình Giới hạn Ma trận đề</h2>
            <p className="text-xs text-slate-500">
              Thiết lập chính xác phạm vi tuần kiểm tra, lọc bài học thực tế và quy định cấu trúc điểm
            </p>
          </div>
        </div>

        {/* Grade & Subject Auto-Sync Indicator & SGK Integration Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-900">
            <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
            <span>PPCT:</span>
            <strong className="font-semibold text-emerald-950">
              Môn {activePpct.subject} — Khối {activePpct.grade}
            </strong>
          </div>

          {onOpenFullPpct && (
            <button
              type="button"
              onClick={onOpenFullPpct}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300 rounded-lg px-3 py-1.5 text-xs text-emerald-950 font-medium transition-colors shadow-2xs group"
              title="Xem toàn bộ Phân phối chương trình (140 tiết) để đối chiếu"
            >
              <ListOrdered className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>Xem toàn bộ PPCT</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSgkManager}
            className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100/90 border border-teal-300 rounded-lg px-3 py-1.5 text-xs text-teal-950 font-medium transition-colors shadow-2xs group"
            title="Nhấn để mở Bảng quản lý & Tải lên Sách Giáo Khoa Toán Tập 1, Tập 2"
          >
            <BookMarked className="w-3.5 h-3.5 text-teal-700 group-hover:scale-110 transition-transform" />
            <span>SGK bám sát:</span>
            <strong className="font-bold text-teal-900 underline decoration-teal-400">
              {matchedSgkBook ? `${matchedSgkBook.title} (Tập ${matchedSgkBook.volume})` : 'Toán 9 (Tập 1 & 2)'}
            </strong>
          </button>
        </div>
      </div>

      {/* Row 1: Thông tin hành chính (Trường, Môn, Khối, Năm học, Đợt kiểm tra, Thời gian) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Trường học</label>
          <input
            type="text"
            value={config.schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
            placeholder="TRƯỜNG THCS ..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Tổ bộ môn</label>
          <input
            type="text"
            value={config.department}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="Tổ Toán - Tin"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Môn học</label>
          <input
            type="text"
            value={config.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            placeholder="Toán"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Khối / Lớp</label>
          <input
            type="text"
            value={config.grade}
            onChange={(e) => onChange({ grade: e.target.value })}
            placeholder="9"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span>Năm học</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Tùy chỉnh</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={config.academicYear || '2025 - 2026'}
              onChange={(e) => onChange({ academicYear: e.target.value })}
              placeholder="2025 - 2026"
              list="academic-year-presets"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
            />
            <datalist id="academic-year-presets">
              <option value="2024 - 2025" />
              <option value="2025 - 2026" />
              <option value="2026 - 2027" />
              <option value="2027 - 2028" />
            </datalist>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Thời gian làm bài</label>
          <input
            type="text"
            value={config.examDuration}
            onChange={(e) => onChange({ examDuration: e.target.value })}
            placeholder="90 phút"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Row 2: THẺ GIỚI HẠN PHẠM VI TUẦN KIỂM TRA & TỈ LỆ ĐIỂM TRẮC NGHIỆM / TỰ LUẬN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Module 1: GIỚI HẠN CỤ THỂ PHẠM VI TUẦN THEO THỰC TẾ GIẢNG DẠY */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Giới hạn nội dung kiểm tra theo PPCT:</span>
              </label>
              <span className="font-bold text-emerald-800 text-xs bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Từ Tuần {weekFrom} ➔ Đến Tuần {weekTo}
              </span>
            </div>

            {/* Range Pickers: From Week & To Week */}
            <div className="grid grid-cols-2 gap-3 mb-3 bg-white p-2.5 rounded-lg border border-slate-200">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-medium text-slate-600">Từ tuần:</span>
                  <span className="font-bold text-emerald-800">Tuần {weekFrom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={35}
                    value={weekFrom}
                    onChange={(e) => {
                      const fromVal = Math.min(35, Math.max(1, parseInt(e.target.value, 10) || 1));
                      const newTo = Math.max(fromVal, weekTo);
                      onChange({ limitWeekFrom: fromVal, limitWeekTo: newTo, selectedLessonKeys: undefined });
                    }}
                    className="w-full accent-emerald-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={weekFrom}
                    onChange={(e) => {
                      const fromVal = Math.min(35, Math.max(1, parseInt(e.target.value, 10) || 1));
                      const newTo = Math.max(fromVal, weekTo);
                      onChange({ limitWeekFrom: fromVal, limitWeekTo: newTo, selectedLessonKeys: undefined });
                    }}
                    className="w-12 text-center bg-slate-50 border border-slate-300 rounded py-0.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-medium text-slate-600">Đến tuần:</span>
                  <span className="font-bold text-emerald-800">Tuần {weekTo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={weekFrom}
                    max={35}
                    value={weekTo}
                    onChange={(e) => {
                      const toVal = Math.min(35, Math.max(weekFrom, parseInt(e.target.value, 10) || weekFrom));
                      onChange({ limitWeekTo: toVal, selectedLessonKeys: undefined });
                    }}
                    className="w-full accent-emerald-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min={weekFrom}
                    max={35}
                    value={weekTo}
                    onChange={(e) => {
                      const toVal = Math.min(35, Math.max(weekFrom, parseInt(e.target.value, 10) || weekFrom));
                      onChange({ limitWeekTo: toVal, selectedLessonKeys: undefined });
                    }}
                    className="w-12 text-center bg-slate-50 border border-slate-300 rounded py-0.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Optional Specific Limit by Period Number */}
            <div className="flex items-center justify-between gap-2 mb-3 bg-slate-100/70 p-2 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-medium text-slate-700">
                  Giới hạn cụ thể đến Tiết số:
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={200}
                  placeholder="Tất cả tiết"
                  value={config.limitPeriodTo || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    onChange({ limitPeriodTo: val, selectedLessonKeys: undefined });
                  }}
                  className="w-24 text-center bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 placeholder:text-[10px]"
                />
                {config.limitPeriodTo && (
                  <button
                    type="button"
                    onClick={() => onChange({ limitPeriodTo: undefined, selectedLessonKeys: undefined })}
                    className="text-[10px] text-red-600 hover:text-red-700 underline"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Quick preset buttons matching actual teaching milestones */}
            <div className="mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Chọn nhanh các mốc kiểm tra thực tế:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {practicalScopePresets.map((p) => {
                  const isCurrent = weekFrom === p.from && weekTo === p.to;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        onChange({
                          limitWeekFrom: p.from,
                          limitWeekTo: p.to,
                          examPeriod: p.periodName,
                          limitPeriodTo: undefined,
                          selectedLessonKeys: undefined,
                        });
                      }}
                      title={p.desc}
                      className={`px-2 py-1.5 rounded-md text-[10.5px] font-medium transition-all text-left truncate ${
                        isCurrent
                          ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                          : 'bg-white hover:bg-slate-200/70 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scope Summary & Interactive Lesson Selector Trigger */}
          <div className="pt-2.5 mt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] text-slate-700">
              <span>Đang chọn: </span>
              <strong className="text-emerald-900 font-bold">{effectiveLessons.length} bài học</strong>
              <span> ({totalPeriodsInScope} tiết thực tế)</span>
            </div>

            <button
              type="button"
              onClick={() => setShowLessonSelector(!showLessonSelector)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{showLessonSelector ? 'Đóng danh sách bài' : 'Xem & Tùy chọn bài học'}</span>
              {showLessonSelector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Module 2: Quy định tỉ lệ Trắc nghiệm / Tự luận (70% TN - 30% TL) */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span>Quy định tỉ lệ điểm Trắc nghiệm & Tự luận:</span>
              </label>
              <div className="flex items-center gap-1 font-bold text-xs">
                <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  TN: {config.ratioTn}% ({(config.ratioTn * 0.1).toFixed(1)}đ)
                </span>
                <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                  TL: {config.ratioTl}% ({(config.ratioTl * 0.1).toFixed(1)}đ)
                </span>
              </div>
            </div>

            {/* Interactive Ratio Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
              {ratioPresets.map((r) => (
                <button
                  key={`${r.tn}-${r.tl}`}
                  type="button"
                  onClick={() => onChange({ ratioTn: r.tn, ratioTl: r.tl })}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-all text-center ${
                    config.ratioTn === r.tn && config.ratioTl === r.tl
                      ? 'bg-blue-700 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-slate-200/70 border border-slate-200 text-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Slider for custom adjustments */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3">
              <div className="flex justify-between text-[11px] text-slate-600 mb-1.5">
                <span className="font-medium text-blue-800">Trắc nghiệm: {config.ratioTn}% ({(config.ratioTn * 0.1).toFixed(1)} điểm)</span>
                <span className="font-medium text-purple-800">Tự luận: {config.ratioTl}% ({(config.ratioTl * 0.1).toFixed(1)} điểm)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={config.ratioTn}
                onChange={(e) => {
                  const tnVal = parseInt(e.target.value, 10);
                  onChange({ ratioTn: tnVal, ratioTl: 100 - tnVal });
                }}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Explanation Note */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2 text-[11px] text-blue-900 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Theo hướng dẫn kiểm tra đánh giá định kỳ của Bộ GD&ĐT, tỉ lệ chuẩn khuyến khích là <strong>70% Trắc nghiệm khách quan</strong> và <strong>30% Tự luận</strong> trên thang điểm 10.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE LESSON SELECTOR: CHO PHÉP CHỌN / LỌC TỪNG BÀI HỌC CỤ THỂ TRONG PHẠM VI TUẦN */}
      {showLessonSelector && (
        <div className="mb-4 bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 text-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-3 border-b border-emerald-200/80">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-800" />
                <span>Danh sách bài học trong phạm vi (Tuần {weekFrom} đến {weekTo})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Tích chọn hoặc bỏ chọn từng bài học để điều chỉnh chính xác theo tình hình thực tế lớp học (giảm tải, chưa dạy kịp, v.v.)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllLessons}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[11px] font-medium transition-colors"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Chọn tất cả ({lessonKeysInRange.length})</span>
              </button>
              <button
                type="button"
                onClick={handleDeselectAllLessons}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-[11px] font-medium transition-colors"
              >
                <Square className="w-3 h-3" />
                <span>Bỏ chọn hết</span>
              </button>
            </div>
          </div>

          {/* Chapters and lessons accordion grid */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {Array.from(chapterGroups.entries()).map(([chapterName, topics]) => (
              <div key={chapterName} className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
                <h4 className="font-semibold text-emerald-950 text-xs mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>{chapterName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {topics.reduce((sum, t) => sum + t.periods, 0)} tiết
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {topics.map((topicItem) => {
                    const isChecked = activeSelectedKeys.includes(topicItem.key);
                    const weekNumbers = Array.from(new Set(topicItem.lessonList.map((l) => l.tuan))).join(', ');
                    return (
                      <label
                        key={topicItem.key}
                        onClick={() => handleToggleLessonKey(topicItem.key)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by label
                          className="mt-0.5 accent-emerald-700 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-xs block leading-snug">
                            {topicItem.topic}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            <span>Tuần: {weekNumbers}</span>
                            <span>•</span>
                            <span>Thời lượng: {topicItem.periods} tiết</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: CẤU TRÚC ĐỀ THEO BỘ GD&ĐT VÀ THANG ĐIỂM CHI TIẾT */}
      <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">Cấu trúc định dạng câu hỏi theo Bộ GD&ĐT:</span>
          </div>

          {/* Toggle structure format */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => onChange({ structureType: 'moet_2025_new' })}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                config.structureType === 'moet_2025_new'
                  ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cấu trúc Mới 2025 (3 dạng TN + Tự luận)
            </button>
            <button
              type="button"
              onClick={() => onChange({ structureType: 'standard_2018' })}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                config.structureType === 'standard_2018'
                  ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cấu trúc Chuẩn (TNKQ & Tự luận)
            </button>
          </div>
        </div>

        {/* Detailed Explanation of question forms */}
        {config.structureType === 'moet_2025_new' ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Phần I: TN Nhiều lựa chọn</strong>
              <span className="text-slate-600">Mỗi câu 0.25đ (4 lựa chọn chọn 1). Thang điểm: ~3.0 - 4.0đ</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Phần II: TN Đúng / Sai</strong>
              <span className="text-slate-600">Mỗi câu 4 lệnh a,b,c,d (Tối đa 1.0đ/câu). Thang điểm: ~2.0đ</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Phần III: TN Trả lời ngắn</strong>
              <span className="text-slate-600">Điền đáp án số (0.25đ - 0.5đ/câu). Thang điểm: ~1.0 - 2.0đ</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Phần IV: Tự luận</strong>
              <span className="text-slate-600">Trình bày bài giải chi tiết. Thang điểm: {(config.ratioTl * 0.1).toFixed(1)}đ ({config.ratioTl}%)</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Trắc nghiệm khách quan (TNKQ)</strong>
              <span className="text-slate-600">Gồm {Math.round((config.ratioTn * 0.1) / config.scorePerTn)} câu (0.25đ/câu) phân bố đều theo 4 mức độ</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <strong className="text-emerald-900 block font-semibold mb-0.5">Tự luận (TL)</strong>
              <span className="text-slate-600">Gồm ~{Math.round((config.ratioTl * 0.1) / config.scorePerTl)} câu tự luận bám sát trọng tâm kiến thức</span>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Action Buttons & Generation triggers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onGenerateFromPpct}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-xs hover:shadow-sm"
            title="Tự động tính toán số tiết, số điểm và cân bằng số lượng câu hỏi theo PPCT trong phạm vi tuần đã chọn"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>Tự động tính & Cân bằng ma trận (Bám sát Tuần {weekFrom}–{weekTo})</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx,.doc,.xlsx,.xls,.csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Nạp file mẫu (.docx/.xlsx)</span>
          </button>
        </div>

        {config.sampleLoadedName && (
          <span className="text-xs text-slate-600 italic flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 not-italic inline flex-shrink-0" />
            <span className="text-slate-500">Trạng thái:</span>
            <strong className="text-slate-800 not-italic font-medium">{config.sampleLoadedName}</strong>
          </span>
        )}
      </div>
    </div>
  );
};
