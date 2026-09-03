import React, { useState } from 'react';
import {
  Trophy,
  AlertCircle,
  CheckCircle2,
  Plus,
  Filter,
  Calendar,
  Users,
  Award,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { GvcnWeeklyRecord, GvcnLogEntry, GvcnStudent } from '../../types';

interface GvcnWeeklyRecordSectionProps {
  weeklyRecords: GvcnWeeklyRecord[];
  activeWeek: number;
  onSelectWeek: (week: number) => void;
  onOpenQuickLogModal: () => void;
  students: GvcnStudent[];
  onSelectStudent?: (student: GvcnStudent) => void;
}

export const GvcnWeeklyRecordSection: React.FC<GvcnWeeklyRecordSectionProps> = ({
  weeklyRecords,
  activeWeek,
  onSelectWeek,
  onOpenQuickLogModal,
  students,
  onSelectStudent,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'violation' | 'merit'>('all');

  // Find record for active week or construct fallback
  const currentRecord = weeklyRecords.find((r) => r.week === activeWeek) || {
    week: activeWeek,
    dateRange: `Tuần ${activeWeek}`,
    groupScores: [
      { group: 1, groupName: 'Tổ 1', leaderName: 'Nguyễn Tuấn Dũng', initialPoints: 100, deductedPoints: 0, bonusPoints: 0, totalPoints: 100, rank: 1 },
      { group: 2, groupName: 'Tổ 2', leaderName: 'Nguyễn Mai Chi', initialPoints: 100, deductedPoints: 0, bonusPoints: 0, totalPoints: 100, rank: 1 },
      { group: 3, groupName: 'Tổ 3', leaderName: 'Vũ Quốc Bảo', initialPoints: 100, deductedPoints: 0, bonusPoints: 0, totalPoints: 100, rank: 1 },
      { group: 4, groupName: 'Tổ 4', leaderName: 'Nguyễn Diệu Linh', initialPoints: 100, deductedPoints: 0, bonusPoints: 0, totalPoints: 100, rank: 1 },
    ],
    logs: [],
  };

  const filteredLogs = currentRecord.logs.filter((log) => {
    const matchGroup = selectedGroupFilter === 'all' || log.group === selectedGroupFilter;
    const matchType = selectedTypeFilter === 'all' || log.type === selectedTypeFilter;
    return matchGroup && matchType;
  });

  const totalViolations = currentRecord.logs.filter((l) => l.type === 'violation').length;
  const totalMerits = currentRecord.logs.filter((l) => l.type === 'merit').length;

  const handlePrintWeeklyReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar: Week Selector, Date Range, & Action buttons */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800 text-white rounded-xl shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="week-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Theo dõi Tuần:
              </label>
              <select
                id="week-select"
                value={activeWeek}
                onChange={(e) => onSelectWeek(Number(e.target.value))}
                className="text-sm font-bold text-emerald-950 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} {w <= 18 ? '(Học kỳ I)' : '(Học kỳ II)'}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Thời gian: <strong>{currentRecord.dateRange}</strong>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickLogModal}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi nhận Nề nếp / Việc tốt</span>
          </button>

          <button
            onClick={handlePrintWeeklyReport}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="In hoặc lưu PDF Báo cáo thi đua tuần"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>In sổ tuần</span>
          </button>
        </div>
      </div>

      {/* 4 Group Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentRecord.groupScores.map((group) => {
          const isRank1 = group.rank === 1;
          return (
            <div
              key={group.group}
              className={`rounded-2xl p-4.5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isRank1
                  ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-amber-300 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Rank Banner */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    {group.groupName}
                  </span>
                  {isRank1 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                      <Trophy className="w-3 h-3 text-amber-100" />
                      <span>CỜ LUÂN LƯU</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">Hạng</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      group.rank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-2xs'
                        : group.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : group.rank === 3
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {group.rank}
                  </span>
                </div>
              </div>

              {/* Group Leader info */}
              <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Tổ trưởng: <strong>{group.leaderName}</strong></span>
              </div>

              {/* Score calculation formula box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Điểm khởi điểm:</span>
                  <span className="font-semibold">{group.initialPoints} đ</span>
                </div>
                <div className="flex items-center justify-between text-rose-700">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>Điểm trừ vi phạm:</span>
                  </span>
                  <span className="font-bold">{group.deductedPoints} đ</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Điểm cộng khen thưởng:</span>
                  </span>
                  <span className="font-bold">+{group.bonusPoints} đ</span>
                </div>
              </div>

              {/* Final Score */}
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tổng điểm tuần:
                </span>
                <span className="text-xl font-black text-emerald-950">
                  {group.totalPoints} <span className="text-xs font-normal text-slate-500">điểm</span>
                </span>
              </div>

              {group.note && (
                <div className="mt-2 text-[11px] text-slate-500 italic bg-white/80 px-2 py-1 rounded border border-slate-100">
                  {group.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Logs Table Header & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Nhật Ký Nề Nếp & Việc Tốt Tuần {activeWeek}</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                {currentRecord.logs.length} sự việc
              </span>
            </h4>
            
            <div className="hidden sm:flex items-center gap-2 text-xs ml-4">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Award className="w-3.5 h-3.5" /> {totalMerits} việc tốt
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-rose-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {totalViolations} vi phạm
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Filter by Group */}
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-700"
            >
              <option value="all">Tất cả 4 Tổ</option>
              <option value="1">Tổ 1</option>
              <option value="2">Tổ 2</option>
              <option value="3">Tổ 3</option>
              <option value="4">Tổ 4</option>
            </select>

            {/* Filter by Type */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-700"
            >
              <option value="all">Tất cả sự việc</option>
              <option value="violation">Chỉ xem Vi phạm</option>
              <option value="merit">Chỉ xem Việc tốt / Khen thưởng</option>
            </select>
          </div>
        </div>

        {/* Logs List */}
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const isMerit = log.type === 'merit';
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${
                        isMerit
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isMerit ? <Award className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectStudent) {
                              const found = students.find(
                                (s) => s.id === log.studentId || s.name === log.studentName
                              );
                              if (found) onSelectStudent(found);
                            }
                          }}
                          className="font-bold text-slate-900 text-sm hover:text-emerald-700 hover:underline text-left cursor-pointer"
                        >
                          {log.studentName}
                        </button>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                          Tổ {log.group}
                        </span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.date}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed font-medium">
                        {log.description}
                      </p>

                      {log.resolutionNote && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block mt-0.5">
                          <strong>Biện pháp xử lý của GVCN:</strong> {log.resolutionNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Points delta & Status badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div
                      className={`text-sm font-black px-2.5 py-0.5 rounded-md ${
                        isMerit
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.points > 0 ? `+${log.points}` : log.points} đ
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'parent_notified'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status === 'resolved'
                        ? '✓ Đã uốn nắn'
                        : log.status === 'parent_notified'
                        ? '📞 Đã báo PH'
                        : '⏳ Đang theo dõi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            Không có ghi nhận nề nếp nào trong Tuần {activeWeek} phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};
