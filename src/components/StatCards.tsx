import React from 'react';
import { PpctDataset, TimeframeConfig } from '../types';

interface StatCardsProps {
  ppct: PpctDataset;
  config: TimeframeConfig;
  currentWeek: number;
  term: 1 | 2;
  isBeforeTerm: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
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

  // Calculate taught periods based on current week
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

  const percentYear = Math.min(100, Math.round((taughtPeriods / (totalPeriods || 1)) * 100));
  const percentHk1 = Math.min(100, Math.round((taughtHk1 / (hk1Periods || 1)) * 100));
  const percentHk2 = Math.min(100, Math.round((taughtHk2 / (hk2Periods || 1)) * 100));

  const weekProgressHk1 = isBeforeTerm
    ? 0
    : Math.min(100, Math.round((Math.min(currentWeek, config.totalWeeksHK1) / config.totalWeeksHK1) * 100));

  const weekProgressHk2 =
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

  const displayWeek = isBeforeTerm ? 0 : Math.min(currentWeek, config.totalWeeksYear);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Cả năm */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
        <h3 className="text-xs font-medium text-slate-500 mb-1.5">Tiến độ cả năm</h3>
        <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
          {percentYear}%
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {taughtPeriods}/{totalPeriods} tiết • tuần {displayWeek}/{config.totalWeeksYear}
        </div>
      </div>

      {/* Card 2: Học kỳ I */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
        <h3 className="text-xs font-medium text-slate-500 mb-1.5">Học kỳ I</h3>
        <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
          {percentHk1}%
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {taughtHk1}/{hk1Periods} tiết • thời gian {weekProgressHk1}%
        </div>
      </div>

      {/* Card 3: Học kỳ II */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
        <h3 className="text-xs font-medium text-slate-500 mb-1.5">Học kỳ II</h3>
        <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
          {percentHk2}%
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {taughtHk2}/{hk2Periods} tiết • thời gian {weekProgressHk2}%
        </div>
      </div>
    </div>
  );
};
