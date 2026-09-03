import React from 'react';
import { PpctDataset, TimeframeConfig, ExamEvent } from '../types';
import { PpctSidebar } from './PpctSidebar';
import { TimeframeSidebar } from './TimeframeSidebar';
import { StatCards } from './StatCards';
import { ProgressCharts } from './ProgressCharts';
import { UpcomingExams } from './UpcomingExams';
import { ExamScheduleTable } from './ExamScheduleTable';
import { LessonPlanSection } from './lessonPlan/LessonPlanSection';

interface ProgressAndScheduleTabProps {
  datasets: PpctDataset[];
  activeDatasetId: string;
  activeDataset: PpctDataset;
  timeframeConfig: TimeframeConfig;
  currentWeek: number;
  term: 1 | 2;
  isBeforeTerm: boolean;
  exams: ExamEvent[];
  onSelectDataset: (id: string) => void;
  onAddDataset: (dataset: PpctDataset) => void;
  onDeleteDataset: (id: string) => void;
  onUpdateDatasetName: (id: string, newName: string) => void;
  onUpdateAcademicYear?: (id: string, newYear: string) => void;
  onUpdateTimeframeConfig: (updated: Partial<TimeframeConfig>) => void;
  onResetTimeframeConfig: () => void;
  onOpenManualEditor: () => void;
  onOpenFullPpct: () => void;
  onExportPpctExcel: () => void;
  onSelectExamForMatrix: (exam: ExamEvent) => void;
  onOpenUploadModal?: (grade?: string) => void;
  isRealTime?: boolean;
  onSyncRealTime?: () => void;
}

export const ProgressAndScheduleTab: React.FC<ProgressAndScheduleTabProps> = ({
  datasets,
  activeDatasetId,
  activeDataset,
  timeframeConfig,
  currentWeek,
  term,
  isBeforeTerm,
  exams,
  onSelectDataset,
  onAddDataset,
  onDeleteDataset,
  onUpdateDatasetName,
  onUpdateAcademicYear,
  onUpdateTimeframeConfig,
  onResetTimeframeConfig,
  onOpenManualEditor,
  onOpenFullPpct,
  onExportPpctExcel,
  onSelectExamForMatrix,
  onOpenUploadModal,
  isRealTime = true,
  onSyncRealTime,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Sidebars */}
      <div className="lg:col-span-4 xl:col-span-3.5 space-y-6">
        <PpctSidebar
          datasets={datasets}
          activeDatasetId={activeDatasetId}
          onSelectDataset={onSelectDataset}
          onAddDataset={onAddDataset}
          onDeleteDataset={onDeleteDataset}
          onUpdateDatasetName={onUpdateDatasetName}
          onUpdateAcademicYear={onUpdateAcademicYear}
          onOpenManualEditor={onOpenManualEditor}
          onOpenFullPpct={onOpenFullPpct}
          onExportPpctExcel={onExportPpctExcel}
          onOpenUploadModal={onOpenUploadModal}
        />

        <TimeframeSidebar
          config={timeframeConfig}
          isRealTime={isRealTime}
          onSyncRealTime={onSyncRealTime}
          onChange={onUpdateTimeframeConfig}
          onReset={onResetTimeframeConfig}
        />
      </div>

      {/* Right Column: Dashboard Stats, Charts & Exam Schedules */}
      <div className="lg:col-span-8 xl:col-span-8.5 space-y-6">
        {/* Empty state prompt if no PPCT has been uploaded */}
        {datasets.length === 0 && (
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 bg-emerald-700/80 rounded-full text-xs font-semibold text-emerald-100 uppercase tracking-wider mb-2">
                  Chuẩn GDPT 2018 — 140 tiết / 35 tuần
                </span>
                <h3 className="text-lg font-bold text-white">
                  Chưa có PPCT nào — Tùy chỉnh khối và tải lên PPCT môn Toán
                </h3>
                <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                  Hệ thống không tải sẵn PPCT mặc định. Thầy/Cô vui lòng chọn Khối lớp bên dưới và tải lên file Word (.docx) hoặc Excel (.xlsx) để quản lý tiến độ và ma trận đề.
                </p>
              </div>
            </div>

            {/* 4 Grade buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { g: '6', label: 'Khối 6', desc: 'Toán 6 — 140 tiết' },
                { g: '7', label: 'Khối 7', desc: 'Toán 7 — 140 tiết' },
                { g: '8', label: 'Khối 8', desc: 'Toán 8 — 140 tiết' },
                { g: '9', label: 'Khối 9', desc: 'Toán 9 — 140 tiết' },
              ].map((item) => (
                <button
                  key={item.g}
                  onClick={() => onOpenUploadModal?.(item.g)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-emerald-300 rounded-xl p-3.5 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{item.label}</span>
                    <span className="text-emerald-300 group-hover:translate-x-0.5 transition-transform font-bold text-xs">&rarr;</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <StatCards
          ppct={activeDataset}
          config={timeframeConfig}
          currentWeek={currentWeek}
          term={term}
          isBeforeTerm={isBeforeTerm}
        />

        <ProgressCharts
          ppct={activeDataset}
          config={timeframeConfig}
          currentWeek={currentWeek}
          term={term}
          isBeforeTerm={isBeforeTerm}
        />

        <LessonPlanSection
          activeDataset={activeDataset}
          currentWeek={currentWeek}
        />

        <UpcomingExams
          exams={exams}
          onSelectExamForMatrix={onSelectExamForMatrix}
        />

        <ExamScheduleTable
          exams={exams}
          onSelectExamForMatrix={onSelectExamForMatrix}
        />
      </div>
    </div>
  );
};
