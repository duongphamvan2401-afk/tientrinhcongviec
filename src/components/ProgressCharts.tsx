import React from 'react';
import { Gauge } from 'lucide-react';
import { PpctDataset, TimeframeConfig } from '../types';

interface ProgressChartsProps {
  ppct: PpctDataset;
  config: TimeframeConfig;
  currentWeek: number;
  term: 1 | 2;
  isBeforeTerm: boolean;
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  ppct,
  config,
  currentWeek,
  term,
  isBeforeTerm,
}) => {
  const totalPeriods =
    ppct.lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0) || config.totalPeriodsYear || 140;
  const hk1Periods =
    ppct.lessons
      .filter((l) => l.hocKy === 1)
      .reduce((sum, l) => sum + (l.soTiet || 1), 0) || config.totalPeriodsHK1 || 72;
  const hk2Periods =
    ppct.lessons
      .filter((l) => l.hocKy === 2)
      .reduce((sum, l) => sum + (l.soTiet || 1), 0) || config.totalPeriodsHK2 || 68;

  const taughtPeriods = isBeforeTerm
    ? 0
    : ppct.lessons
        .filter((l) => l.tuan <= currentWeek)
        .reduce((sum, l) => sum + (l.soTiet || 1), 0);

  const taughtHk1 = isBeforeTerm
    ? 0
    : ppct.lessons
        .filter((l) => l.hocKy === 1 && l.tuan <= currentWeek)
        .reduce((sum, l) => sum + (l.soTiet || 1), 0);

  const taughtHk2 = isBeforeTerm
    ? 0
    : ppct.lessons
        .filter((l) => l.hocKy === 2 && l.tuan <= currentWeek)
        .reduce((sum, l) => sum + (l.soTiet || 1), 0);

  // Percentage calculations
  const pctLessonsHk1 = Math.min(100, Math.round((taughtHk1 / (hk1Periods || 1)) * 100));
  const pctLessonsHk2 = Math.min(100, Math.round((taughtHk2 / (hk2Periods || 1)) * 100));
  const pctLessonsYear = Math.min(100, Math.round((taughtPeriods / (totalPeriods || 1)) * 100));

  const pctTimeHk1 = isBeforeTerm
    ? 0
    : Math.min(100, Math.round((Math.min(currentWeek, config.totalWeeksHK1) / config.totalWeeksHK1) * 100));

  const pctTimeHk2 =
    isBeforeTerm || currentWeek <= config.totalWeeksHK1
      ? 0
      : Math.min(
          100,
          Math.round(
            ((currentWeek - config.totalWeeksHK1) /
              Math.max(1, config.totalWeeksYear - config.totalWeeksHK1)) *
              100
          )
        );

  const pctTimeYear = isBeforeTerm
    ? 0
    : Math.min(100, Math.round((Math.min(currentWeek, config.totalWeeksYear) / config.totalWeeksYear) * 100));

  // Donut chart calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pctLessonsYear / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="w-4 h-4 text-emerald-700" />
        <h2 className="text-base font-semibold text-slate-800">
          Biểu đồ tiến độ (kế hoạch so với thời gian thực)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-48 border-b border-l border-slate-200 flex items-end justify-around px-4 pb-2">
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
              <div className="border-b border-dashed border-slate-100 flex justify-between pr-2">
                <span>100%</span>
              </div>
              <div className="border-b border-dashed border-slate-100 flex justify-between pr-2">
                <span>75%</span>
              </div>
              <div className="border-b border-dashed border-slate-100 flex justify-between pr-2">
                <span>50%</span>
              </div>
              <div className="border-b border-dashed border-slate-100 flex justify-between pr-2">
                <span>25%</span>
              </div>
              <div className="border-b border-slate-200 flex justify-between pr-2">
                <span>0%</span>
              </div>
            </div>

            {/* Bars: Học kỳ I */}
            <div className="relative z-10 flex items-end gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center">
                <div
                  style={{ height: `${Math.max(4, pctLessonsHk1 * 1.5)}px` }}
                  className="w-5 sm:w-7 bg-emerald-700 rounded-t-sm transition-all duration-500 hover:opacity-90"
                  title={`Tiết đã dạy HK I: ${pctLessonsHk1}%`}
                />
              </div>
              <div className="flex flex-col items-center">
                <div
                  style={{ height: `${Math.max(4, pctTimeHk1 * 1.5)}px` }}
                  className="w-5 sm:w-7 bg-slate-500 rounded-t-sm transition-all duration-500 hover:opacity-90"
                  title={`Thời gian HK I: ${pctTimeHk1}%`}
                />
              </div>
            </div>

            {/* Bars: Học kỳ II */}
            <div className="relative z-10 flex items-end gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center">
                <div
                  style={{ height: `${Math.max(4, pctLessonsHk2 * 1.5)}px` }}
                  className="w-5 sm:w-7 bg-emerald-700 rounded-t-sm transition-all duration-500 hover:opacity-90"
                  title={`Tiết đã dạy HK II: ${pctLessonsHk2}%`}
                />
              </div>
              <div className="flex flex-col items-center">
                <div
                  style={{ height: `${Math.max(4, pctTimeHk2 * 1.5)}px` }}
                  className="w-5 sm:w-7 bg-slate-500 rounded-t-sm transition-all duration-500 hover:opacity-90"
                  title={`Thời gian HK II: ${pctTimeHk2}%`}
                />
              </div>
            </div>

            {/* Bars: Cả năm */}
            <div className="relative z-10 flex items-end gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center">
                <div
                  style={{ height: `${Math.max(4, pctLessonsYear * 1.5)}px` }}
                  className="w-5 sm:w-7 bg-emerald-700 rounded-t-sm transition-all duration-500 hover:opacity-90"
                  title={`Tiết đã dạy Cả năm: ${pctLessonsYear}%`}
                />
              </div>
              <div className="flex flex-col items-center">
                <div
                  style={{ height: `${Math.max(4, pctTimeYear * 1.5)}px` }}
                  className="w-5 sm:w-7 bg-slate-500 rounded-t-sm transition-all duration-500 hover:opacity-90"
                  title={`Thời gian Cả năm: ${pctTimeYear}%`}
                />
              </div>
            </div>
          </div>

          {/* Bar Chart Labels */}
          <div className="flex justify-around text-xs font-medium text-slate-600 px-4">
            <span>Học kỳ I</span>
            <span>Học kỳ II</span>
            <span>Cả năm</span>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-700 rounded-xs" />
              <span>Tiết đã dạy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-500 rounded-xs" />
              <span>Thời gian đã qua</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100"
                strokeWidth="18"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-emerald-700 transition-all duration-700 ease-out"
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-800">{pctLessonsYear}%</span>
              <span className="text-[11px] text-slate-500 font-medium">Hoàn thành</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span>Đã hoàn thành</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span>Còn lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars for Terms */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Học kỳ I</span>
            <span>{pctLessonsHk1}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${pctLessonsHk1}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Học kỳ II</span>
            <span>{pctLessonsHk2}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${pctLessonsHk2}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Cả năm</span>
            <span>{pctLessonsYear}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${pctLessonsYear}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
