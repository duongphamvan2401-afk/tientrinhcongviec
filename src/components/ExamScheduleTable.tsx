import React from 'react';
import { CalendarRange, Sparkles, Table2, CheckCircle2, Clock } from 'lucide-react';
import { ExamEvent } from '../types';

interface ExamScheduleTableProps {
  exams: ExamEvent[];
  onSelectExamForMatrix: (exam: ExamEvent) => void;
}

export const ExamScheduleTable: React.FC<ExamScheduleTableProps> = ({
  exams,
  onSelectExamForMatrix,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-emerald-700" />
          <h2 className="text-base font-semibold text-slate-800">
            Kế hoạch kiểm tra cả năm ({exams.length} đợt)
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Nội dung kiến thức tự động cập nhật theo tiến độ PPCT từng tuần
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3.5 text-center w-12">Kỳ</th>
              <th className="py-3 px-3.5 min-w-[180px]">Đợt kiểm tra</th>
              <th className="py-3 px-3 text-center w-14">Tuần</th>
              <th className="py-3 px-3.5 min-w-[200px]">Thời gian chính xác</th>
              <th className="py-3 px-3.5 text-center w-28">Còn lại</th>
              <th className="py-3 px-4 min-w-[280px]">Nội dung kiểm tra gợi ý</th>
              <th className="py-3 px-3.5 text-right w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {exams.map((exam) => {
              const isPast = exam.daysRemaining < 0;
              const isUrgent = exam.daysRemaining >= 0 && exam.daysRemaining <= 14;

              return (
                <tr
                  key={exam.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="py-3.5 px-3.5 text-center font-medium text-slate-900">
                    {exam.term === 1 ? 'I' : 'II'}
                  </td>
                  <td className="py-3.5 px-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{exam.title}</span>
                      {(exam.type === 'giua_ky' || exam.type === 'cuoi_ky') && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          Định kỳ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                    {exam.week}
                  </td>
                  <td className="py-3.5 px-3.5 text-slate-600">
                    {exam.exactDateText}
                  </td>
                  <td className="py-3.5 px-3.5 text-center">
                    {isPast ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã qua
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          isUrgent
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {exam.daysRemaining} ngày
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                    <div className="text-[11px] font-semibold text-slate-800 mb-1">
                      {exam.suggestedScope}
                    </div>
                    <ul className="space-y-0.5 list-disc list-inside text-[11px] text-slate-600 max-h-24 overflow-y-auto pr-1">
                      {exam.chapterSummaries.map((c, i) => (
                        <li key={i} className="truncate">
                          <span className="font-medium text-slate-700">{c.chapter}:</span>{' '}
                          {c.lessons.slice(0, 2).join('; ')}
                          {c.lessons.length > 2 && ' ...'}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    <button
                      onClick={() => onSelectExamForMatrix(exam)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-emerald-700 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-700 rounded-lg text-xs font-medium transition-all shadow-2xs group-hover:border-emerald-600"
                      title="Tự động đồng bộ và nạp ma trận kiểm tra cho đợt này"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tạo ma trận</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
