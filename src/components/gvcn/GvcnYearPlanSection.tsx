import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Sparkles,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { GvcnMonthlyTask } from '../../types';

interface GvcnYearPlanSectionProps {
  monthlyTasks: GvcnMonthlyTask[];
  onToggleTask: (month: number, taskId: string) => void;
  onAddTask: (month: number, title: string, targetWeek: number) => void;
}

export const GvcnYearPlanSection: React.FC<GvcnYearPlanSectionProps> = ({
  monthlyTasks,
  onToggleTask,
  onAddTask,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskWeek, setNewTaskWeek] = useState<number>(1);

  const activeMonthData = monthlyTasks.find((m) => m.month === selectedMonth) || monthlyTasks[0];

  // Overall statistics
  const totalAllTasks = monthlyTasks.reduce((s, m) => s + m.tasks.length, 0);
  const completedAllTasks = monthlyTasks.reduce(
    (s, m) => s + m.tasks.filter((t) => t.completed).length,
    0
  );
  const overallPercentage = Math.round((completedAllTasks / (totalAllTasks || 1)) * 100);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(selectedMonth, newTaskTitle.trim(), Number(newTaskWeek));
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Pedagogical Insight Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-stone-900 text-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
        <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30 flex-shrink-0">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Kế Hoạch Trọng Tâm 9 Tháng Năm Học 2026 - 2027 (Khối 9 THCS)</span>
            <span className="px-2 py-0.5 text-[10px] bg-amber-400/20 text-amber-200 rounded-full font-semibold border border-amber-400/30">
              Khung thời gian chuẩn Bộ GD&ĐT
            </span>
          </h3>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            <strong>Nguyên tắc tổ chức của GVCN kinh nghiệm:</strong> <em>"Làm chủ thời gian là làm chủ chất lượng lớp học."</em> Kế hoạch năm học chia làm 9 tháng theo từng chủ điểm giáo dục xuyên suốt, đồng hành cùng các mốc then chốt: Khảo sát chất lượng, Thi Giữa kỳ - Cuối kỳ, Tri ân 20/11, Định hướng phân luồng vào lớp 10 và Lễ trưởng thành ra trường.
          </p>
        </div>
      </div>

      {/* Year Progress Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Tiến độ hoàn thành kế hoạch công tác chủ nhiệm năm:
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Đã hoàn thành <strong>{completedAllTasks}</strong> / {totalAllTasks} đầu việc trọng tâm ({overallPercentage}%)
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 flex items-center gap-3">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <span className="text-xs font-black text-emerald-900 flex-shrink-0">
            {overallPercentage}%
          </span>
        </div>
      </div>

      {/* Month Tabs: Tháng 9 -> Tháng 5 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {monthlyTasks.map((m) => {
          const isSelected = m.month === selectedMonth;
          const completedCount = m.tasks.filter((t) => t.completed).length;
          const isAllDone = completedCount === m.tasks.length && m.tasks.length > 0;

          return (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(m.month)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{m.monthName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-emerald-700 text-white'
                    : isAllDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {completedCount}/{m.tasks.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Month Checklist Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Month Header Banner */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50/50 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Kế hoạch trọng tâm {activeMonthData.monthName}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {activeMonthData.theme}
              </h3>
            </div>

            <div className="text-xs bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 font-bold shadow-2xs">
              Hoàn thành:{' '}
              {activeMonthData.tasks.filter((t) => t.completed).length} /{' '}
              {activeMonthData.tasks.length} nhiệm vụ
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="p-5 divide-y divide-slate-100 space-y-3">
          {activeMonthData.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(activeMonthData.month, task.id)}
              className="pt-3 first:pt-0 flex items-start justify-between gap-3 cursor-pointer group hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="mt-0.5 text-emerald-700 focus:outline-none flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                  )}
                </button>

                <div className="space-y-1">
                  <div
                    className={`text-xs font-medium leading-relaxed ${
                      task.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800 group-hover:text-emerald-950 font-semibold'
                    }`}
                  >
                    {task.title}
                  </div>

                  {task.note && (
                    <div className="text-[11px] text-slate-500 italic">
                      Ghi chú: {task.note}
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold flex-shrink-0 border border-slate-200">
                Tuần {task.targetWeek}
              </span>
            </div>
          ))}
        </div>

        {/* Add custom task to active month */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={`Thêm công việc mới cho ${activeMonthData.monthName}...`}
              className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />

            <div className="flex items-center gap-2">
              <select
                value={newTaskWeek}
                onChange={(e) => setNewTaskWeek(Number(e.target.value))}
                className="text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm việc</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
