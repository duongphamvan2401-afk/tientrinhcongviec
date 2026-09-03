import React from 'react';
import { Sliders, Calendar, RotateCcw, Clock, BookOpen, Layers, Radio } from 'lucide-react';
import { TimeframeConfig } from '../types';
import { formatDateVN, parseDate } from '../utils/dateCalculations';

interface TimeframeSidebarProps {
  config: TimeframeConfig;
  isRealTime?: boolean;
  liveTime?: Date;
  onSyncRealTime?: () => void;
  onChange: (updated: Partial<TimeframeConfig>) => void;
  onReset: () => void;
}

export const TimeframeSidebar: React.FC<TimeframeSidebarProps> = ({
  config,
  isRealTime = true,
  liveTime,
  onSyncRealTime,
  onChange,
  onReset,
}) => {
  const periodsPerWeek = config.periodsPerWeek || 4;
  const weeksHK1 = config.totalWeeksHK1 || 18;
  const weeksHK2 = config.totalWeeksHK2 || 17;
  const weeksYear = config.totalWeeksYear || 35;

  const totalPeriodsHK1 = config.totalPeriodsHK1 || weeksHK1 * periodsPerWeek;
  const totalPeriodsHK2 = config.totalPeriodsHK2 || weeksHK2 * periodsPerWeek;
  const totalPeriodsYear = config.totalPeriodsYear || weeksYear * periodsPerWeek;

  const kttxHK1 = config.kttxWeeksHK1 || [3, 6, 11, 14];
  const kttxHK2 = config.kttxWeeksHK2 || [21, 23, 29, 31];
  const kttxCount = config.kttxCountPerTerm || 4;

  const handleUpdatePeriodsPerWeek = (val: number) => {
    const p = Math.max(1, Math.min(10, val));
    onChange({
      periodsPerWeek: p,
      totalPeriodsHK1: weeksHK1 * p,
      totalPeriodsHK2: weeksHK2 * p,
      totalPeriodsYear: (weeksHK1 + weeksHK2) * p,
    });
  };

  const handleUpdateKttxWeekHK1 = (index: number, week: number) => {
    const updated = [...kttxHK1];
    updated[index] = week;
    onChange({ kttxWeeksHK1: updated });
  };

  const handleUpdateKttxWeekHK2 = (index: number, week: number) => {
    const updated = [...kttxHK2];
    updated[index] = week;
    onChange({ kttxWeeksHK2: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>Cấu hình Tiến độ & Kiểm tra</span>
        </h2>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
          title="Đặt lại cài đặt mặc định (140 tiết / 35 tuần)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Mặc định</span>
        </button>
      </div>

      {/* Overview stats badge */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs space-y-1.5 text-emerald-900">
        <div className="flex items-center justify-between font-bold">
          <span>Tổng năm học:</span>
          <span className="text-sm text-emerald-800 font-mono">{totalPeriodsYear} tiết / {weeksYear} tuần</span>
        </div>
        <div className="flex items-center justify-between text-slate-700 text-[11px] pt-1 border-t border-emerald-200/50">
          <span>Học kỳ I: <strong>{totalPeriodsHK1} tiết</strong> ({weeksHK1} tuần)</span>
          <span>Học kỳ II: <strong>{totalPeriodsHK2} tiết</strong> ({weeksHK2} tuần)</span>
        </div>
      </div>

      {/* Real-time sync status card */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            Thời gian tính tiến độ
          </span>
          {isRealTime ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Thời gian thực
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-full">
              Mô phỏng
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-600 flex items-center justify-between">
          <span>Ngày đang tính:</span>
          <span className="font-mono font-bold text-slate-900">
            {formatDateVN(parseDate(config.currentDate))}
          </span>
        </div>
        {!isRealTime && onSyncRealTime && (
          <button
            type="button"
            onClick={onSyncRealTime}
            className="w-full py-1 text-center text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Đồng bộ về thời gian thực hôm nay</span>
          </button>
        )}
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Số tiết mỗi tuần */}
        <div>
          <label className="block font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Số tiết mỗi tuần
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">{periodsPerWeek} tiết/tuần</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={periodsPerWeek}
            onChange={(e) => handleUpdatePeriodsPerWeek(parseInt(e.target.value, 10) || 4)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
          />
        </div>

        {/* Ngày bắt đầu tuần 1 */}
        <div>
          <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Ngày khai giảng / Tuần 1
          </label>
          <input
            type="date"
            value={config.startDateWeek1}
            onChange={(e) => onChange({ startDateWeek1: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Số tuần HK1 và Năm học */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Số tuần HK I
            </label>
            <input
              type="number"
              min={10}
              max={25}
              value={weeksHK1}
              onChange={(e) => {
                const w1 = parseInt(e.target.value, 10) || 18;
                onChange({
                  totalWeeksHK1: w1,
                  totalPeriodsHK1: w1 * periodsPerWeek,
                });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Số tuần Cả năm
            </label>
            <input
              type="number"
              min={25}
              max={40}
              value={weeksYear}
              onChange={(e) => {
                const wy = parseInt(e.target.value, 10) || 35;
                const w2 = wy - weeksHK1;
                onChange({
                  totalWeeksYear: wy,
                  totalWeeksHK2: w2,
                  totalPeriodsYear: wy * periodsPerWeek,
                  totalPeriodsHK2: w2 * periodsPerWeek,
                });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Số cột KTTX */}
        <div>
          <label className="block font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span>Số cột KTTX mỗi học kỳ</span>
            <span className="text-slate-500 font-semibold">{kttxCount} cột</span>
          </label>
          <select
            value={kttxCount}
            onChange={(e) => onChange({ kttxCountPerTerm: parseInt(e.target.value, 10) || 4 })}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          >
            <option value={2}>2 cột KTTX / kỳ</option>
            <option value={3}>3 cột KTTX / kỳ</option>
            <option value={4}>4 cột KTTX / kỳ (Chuẩn)</option>
          </select>
        </div>

        {/* Tuần KTTX Học kỳ I */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Thời điểm KTTX Học kỳ I
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: kttxCount }).map((_, idx) => (
              <div key={`kttx-hk1-${idx}`}>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  KTTX {idx + 1} (Tuần)
                </label>
                <input
                  type="number"
                  min={1}
                  max={weeksHK1}
                  value={kttxHK1[idx] || (idx + 1) * 3}
                  onChange={(e) => handleUpdateKttxWeekHK1(idx, parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-center font-medium text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tuần KTTX Học kỳ II */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Thời điểm KTTX Học kỳ II
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: kttxCount }).map((_, idx) => (
              <div key={`kttx-hk2-${idx}`}>
                <label className="block text-[10px] text-slate-500 mb-0.5">
                  KTTX {idx + 1} (Tuần)
                </label>
                <input
                  type="number"
                  min={weeksHK1 + 1}
                  max={weeksYear}
                  value={kttxHK2[idx] || (weeksHK1 + 1 + idx * 3)}
                  onChange={(e) => handleUpdateKttxWeekHK2(idx, parseInt(e.target.value, 10) || weeksHK1 + 1)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-center font-medium text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tuần kiểm tra Định kỳ HK1 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tuần Giữa kỳ I
            </label>
            <input
              type="number"
              min={5}
              max={15}
              value={config.midtermWeekHK1}
              onChange={(e) => onChange({ midtermWeekHK1: parseInt(e.target.value, 10) || 9 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tuần Cuối kỳ I
            </label>
            <input
              type="number"
              min={15}
              max={20}
              value={config.finalWeekHK1}
              onChange={(e) => onChange({ finalWeekHK1: parseInt(e.target.value, 10) || 18 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Tuần kiểm tra Định kỳ HK2 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tuần Giữa kỳ II
            </label>
            <input
              type="number"
              min={22}
              max={30}
              value={config.midtermWeekHK2}
              onChange={(e) => onChange({ midtermWeekHK2: parseInt(e.target.value, 10) || 26 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tuần Cuối kỳ II
            </label>
            <input
              type="number"
              min={30}
              max={38}
              value={config.finalWeekHK2}
              onChange={(e) => onChange({ finalWeekHK2: parseInt(e.target.value, 10) || 33 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Ngày bắt đầu thi & Số ngày */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Ngày thi (Thứ)
            </label>
            <input
              type="number"
              min={2}
              max={7}
              value={config.examStartDayOfWeek}
              onChange={(e) => onChange({ examStartDayOfWeek: parseInt(e.target.value, 10) || 5 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Số ngày thi
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={config.examDurationDays}
              onChange={(e) => onChange({ examDurationDays: parseInt(e.target.value, 10) || 2 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
