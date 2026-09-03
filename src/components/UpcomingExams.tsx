import React from 'react';
import { CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import { ExamEvent } from '../types';

interface UpcomingExamsProps {
  exams: ExamEvent[];
  onSelectExamForMatrix: (exam: ExamEvent) => void;
}

export const UpcomingExams: React.FC<UpcomingExamsProps> = ({
  exams,
  onSelectExamForMatrix,
}) => {
  // Take next 4 upcoming exams that haven't passed (or closest 4)
  const upcoming = exams
    .filter((e) => e.daysRemaining >= 0)
    .slice(0, 4);

  const displayList = upcoming.length > 0 ? upcoming : exams.slice(0, 4);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3.5">
        <CalendarDays className="w-4 h-4 text-emerald-700" />
        <h2 className="text-base font-semibold text-slate-800">Sắp tới</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayList.map((exam) => {
          const isMidtermOrFinal = exam.type === 'giua_ky' || exam.type === 'cuoi_ky';
          return (
            <div
              key={exam.id}
              onClick={() => onSelectExamForMatrix(exam)}
              className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-500/80 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden"
            >
              {isMidtermOrFinal && (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-600" />
              )}
              <div className="min-w-0 flex-1 pl-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                    {exam.title}
                  </h3>
                  {isMidtermOrFinal && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-medium px-1.5 py-0.5 rounded">
                      Định kỳ
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {exam.exactDateText}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-800 text-white shadow-2xs">
                  Còn {exam.daysRemaining} ngày
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
