import React from 'react';
import { GraduationCap, Calendar, Clock, RotateCcw, Radio } from 'lucide-react';
import { formatDateVN, formatTimeVN, getDayOfWeekVN, parseDate } from '../utils/dateCalculations';

interface HeaderProps {
  currentDateStr: string;
  startDateWeek1Str: string;
  currentWeek: number;
  term: 1 | 2;
  isBeforeTerm: boolean;
  isRealTime: boolean;
  liveTime: Date;
  onDateChange: (newDate: string) => void;
  onSyncRealTime: () => void;
  onResetDate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  startDateWeek1Str,
  currentWeek,
  term,
  isBeforeTerm,
  isRealTime,
  liveTime,
  onDateChange,
  onSyncRealTime,
  onResetDate,
}) => {
  const currentDate = parseDate(currentDateStr);
  const startDate = parseDate(startDateWeek1Str);

  const termText = term === 1 ? 'HK I' : 'HK II';
  const weekText = isBeforeTerm ? 'tuần 0' : `tuần ${currentWeek}`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Tiến độ PPCT & Ma trận đề kiểm tra
            </h1>
            <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 flex-wrap mt-1">
              {isRealTime ? (
                <>
                  {/* Pulsing Live indicator */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Thời gian thực</span>
                  </span>

                  <span className="font-semibold text-slate-800">
                    {getDayOfWeekVN(liveTime)}, {formatDateVN(liveTime)}
                  </span>

                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                    {formatTimeVN(liveTime)}
                  </span>
                </>
              ) : (
                <>
                  {/* Simulation indicator */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>Đang mô phỏng</span>
                  </span>

                  <span>
                    Ngày xem: <strong className="text-slate-900">{formatDateVN(currentDate)}</strong>
                  </span>
                </>
              )}

              <span className="text-slate-300 hidden sm:inline">—</span>

              <span>
                đang ở <strong>{weekText}</strong> ({termText}),
              </span>

              <span className="text-slate-500 text-xs">
                tuần 1 bắt đầu <strong>{formatDateVN(startDate)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Date Controls: Real-time vs Simulation */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isRealTime ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-600 hidden sm:inline">Mô phỏng ngày:</span>
              <input
                type="date"
                value={currentDateStr}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                title="Chọn ngày khác để kiểm tra tiến độ của tuần học đó"
              />
              <button
                onClick={onSyncRealTime}
                className="text-emerald-700 hover:text-emerald-900 p-1 hover:bg-emerald-50 rounded transition-colors"
                title="Làm mới đồng bộ thời gian thực"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50/90 border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="font-medium text-amber-900 hidden sm:inline">Mô phỏng:</span>
              <input
                type="date"
                value={currentDateStr}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-white border border-amber-300 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none text-slate-800 cursor-pointer"
              />
              <button
                onClick={onSyncRealTime}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold transition-all shadow-xs"
                title="Quay lại thời gian thực tế ngay bây giờ"
              >
                <Radio className="w-3 h-3 text-emerald-200 animate-pulse" />
                <span>Về thời gian thực</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
