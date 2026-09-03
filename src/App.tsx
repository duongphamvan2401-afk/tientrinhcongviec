/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs, TabType } from './components/Tabs';
import { ProgressAndScheduleTab } from './components/ProgressAndScheduleTab';
import { MatrixTab } from './components/MatrixTab';
import { ExamBuilderTab } from './components/exam/ExamBuilderTab';
import { GvcnDashboardTab } from './components/gvcn/GvcnDashboardTab';
import { PpctManualEditorModal } from './components/PpctManualEditorModal';
import { SgkManagerModal } from './components/SgkManagerModal';
import { PpctFullViewerModal } from './components/PpctFullViewerModal';
import { UploadPpctModal } from './components/UploadPpctModal';
import {
  defaultPpctDataset,
  defaultDatasets,
  defaultTimeframeConfig,
  defaultMatrixConfig,
  defaultMatrixRows,
} from './data/defaultData';
import { INITIAL_SGK_BOOKS } from './data/sgkData';
import { PpctDataset, PpctLesson, TimeframeConfig, MatrixConfig, MatrixRow, ExamEvent, SgkBook } from './types';
import { calculateCurrentWeek, generateExamSchedule, generateMatrixFromPpct, generateSpecificationFromMatrix, getTodayDateStr } from './utils/dateCalculations';
import { exportPpctToExcel } from './utils/excelExport';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('progress');

  // SGK Books state (Tập 1 & Tập 2)
  const [sgkBooks, setSgkBooks] = useState<SgkBook[]>(() => {
    const saved = localStorage.getItem('ppct_sgk_books');
    if (saved) {
      try {
        const parsed: SgkBook[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved SGK books', e);
      }
    }
    return INITIAL_SGK_BOOKS;
  });

  const [isSgkManagerOpen, setIsSgkManagerOpen] = useState(false);
  const [isFullPpctViewerOpen, setIsFullPpctViewerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadModalGrade, setUploadModalGrade] = useState<string>('9');
  const [examSyncTimestamp, setExamSyncTimestamp] = useState<number>(0);

  // Datasets — "không để sẵn các ppct của các khối, cho phép tùy chỉnh khối rồi mới tải lên"
  const [datasets, setDatasets] = useState<PpctDataset[]>(() => {
    const saved = localStorage.getItem('ppct_datasets');
    if (saved) {
      try {
        const parsed: PpctDataset[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Loại bỏ các bộ PPCT mặc định nếu người dùng không tự tải lên
          const defaultIds = new Set([
            'ppct-toan-9-2026',
            'ppct-toan-8-default',
            'ppct-toan-7-default',
            'ppct-toan-6-default',
            'toan-9',
            'toan-8',
            'toan-7',
            'toan-6',
          ]);
          const userOnly = parsed.filter((d) => !defaultIds.has(d.id));

          if (userOnly.length > 0) {
            // Tự động chuẩn hóa: Đảm bảo nhận diện đúng môn Toán và 140 tiết
            return userOnly.map((ds) => {
              let subject = ds.subject || 'Toán';
              let name = ds.name || '';
              if (
                subject === 'Ngữ văn' &&
                (/toan|toán/i.test(name) || /toan|toán/i.test(ds.fileName || ''))
              ) {
                subject = 'Toán';
                name = name.replace(/^Ngữ\s+văn/i, 'Toán');
              }
              const totalP =
                ds.lessons?.reduce((sum, l) => sum + (l.soTiet || 1), 0) || ds.totalLessons || 140;
              return {
                ...ds,
                subject,
                name,
                totalLessons: totalP,
              };
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse saved datasets', e);
      }
    }
    // Không để sẵn các PPCT của các khối theo yêu cầu
    return [];
  });

  // Real-time date & clock tracking (defaults to real-time)
  const [isRealTime, setIsRealTime] = useState<boolean>(() => {
    const saved = localStorage.getItem('ppct_is_realtime');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [liveTime, setLiveTime] = useState<Date>(() => new Date());

  const [activeDatasetId, setActiveDatasetId] = useState<string>(() => {
    return datasets[0]?.id || '';
  });

  // Timeframe configuration - synchronized with real-time by default
  const [timeframeConfig, setTimeframeConfig] = useState<TimeframeConfig>(() => {
    const todayStr = getTodayDateStr(new Date());
    const saved = localStorage.getItem('ppct_timeframe_config');
    const savedIsRealTime = localStorage.getItem('ppct_is_realtime');
    const shouldBeRealTime = savedIsRealTime !== null ? JSON.parse(savedIsRealTime) : true;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultTimeframeConfig,
          ...parsed,
          currentDate: shouldBeRealTime ? todayStr : (parsed.currentDate || todayStr),
        };
      } catch (e) {
        console.error('Failed to parse saved timeframe config', e);
      }
    }
    return {
      ...defaultTimeframeConfig,
      currentDate: todayStr,
    };
  });

  // Matrix configuration & rows
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(() => {
    const saved = localStorage.getItem('ppct_matrix_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved matrix config', e);
      }
    }
    return defaultMatrixConfig;
  });

  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>(() => {
    const saved = localStorage.getItem('ppct_matrix_rows');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved matrix rows', e);
      }
    }
    return defaultMatrixRows;
  });

  // Modal states
  const [isManualEditorOpen, setIsManualEditorOpen] = useState(false);

  // Active dataset reference
  const activeDataset = useMemo(() => {
    return datasets.find((d) => d.id === activeDatasetId) || datasets[0] || defaultPpctDataset;
  }, [datasets, activeDatasetId]);

  // Current week and term calculations
  const { week: currentWeek, term: currentTerm, isBeforeTerm } = useMemo(() => {
    return calculateCurrentWeek(timeframeConfig.startDateWeek1, timeframeConfig.currentDate);
  }, [timeframeConfig.startDateWeek1, timeframeConfig.currentDate]);

  // Generated exam schedules for the entire year
  const exams: ExamEvent[] = useMemo(() => {
    return generateExamSchedule(timeframeConfig, activeDataset);
  }, [timeframeConfig, activeDataset]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ppct_datasets', JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    localStorage.setItem('ppct_timeframe_config', JSON.stringify(timeframeConfig));
  }, [timeframeConfig]);

  useEffect(() => {
    localStorage.setItem('ppct_is_realtime', JSON.stringify(isRealTime));
  }, [isRealTime]);

  // Real-time ticking and midnight automatic update
  useEffect(() => {
    if (isRealTime) {
      const todayStr = getTodayDateStr(new Date());
      setTimeframeConfig((prev) => (prev.currentDate !== todayStr ? { ...prev, currentDate: todayStr } : prev));
    }

    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now);

      if (isRealTime) {
        const todayStr = getTodayDateStr(now);
        setTimeframeConfig((prev) => {
          if (prev.currentDate !== todayStr) {
            return { ...prev, currentDate: todayStr };
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRealTime]);

  useEffect(() => {
    localStorage.setItem('ppct_matrix_config', JSON.stringify(matrixConfig));
  }, [matrixConfig]);

  useEffect(() => {
    localStorage.setItem('ppct_matrix_rows', JSON.stringify(matrixRows));
  }, [matrixRows]);

  useEffect(() => {
    localStorage.setItem('ppct_sgk_books', JSON.stringify(sgkBooks));
  }, [sgkBooks]);

  // Handlers
  const handleSelectDataset = (id: string) => {
    setActiveDatasetId(id);
    const selected = datasets.find((d) => d.id === id);
    if (selected) {
      setMatrixConfig((prev) => ({
        ...prev,
        subject: selected.subject || prev.subject,
        grade: selected.grade || prev.grade,
      }));
    }
  };

  const handleLinkSgkToPpct = (ppctId: string, volume1Id?: string, volume2Id?: string) => {
    setDatasets((prev) =>
      prev.map((d) =>
        d.id === ppctId
          ? {
              ...d,
              sgkVolume1Id: volume1Id !== undefined ? volume1Id : d.sgkVolume1Id,
              sgkVolume2Id: volume2Id !== undefined ? volume2Id : d.sgkVolume2Id,
            }
          : d
      )
    );
  };

  const handleApplySgkToMatrix = (bookId: string, volume: 1 | 2 | 'all') => {
    setMatrixConfig((prev) => ({
      ...prev,
      activeSgkBookId: bookId,
      activeSgkVolume: volume,
    }));
    setActiveTab('matrix');
  };

  const handleOpenUploadModal = (grade?: string) => {
    if (grade) setUploadModalGrade(grade);
    setIsUploadModalOpen(true);
  };

  const handleAddDataset = (newDataset: PpctDataset) => {
    setDatasets((prev) => [newDataset, ...prev]);
    setActiveDatasetId(newDataset.id);
    setMatrixConfig((prev) => ({
      ...prev,
      subject: newDataset.subject || prev.subject,
      grade: newDataset.grade || prev.grade,
    }));
  };

  const handleDeleteDataset = (id: string) => {
    const remaining = datasets.filter((d) => d.id !== id);
    setDatasets(remaining);
    if (activeDatasetId === id) {
      setActiveDatasetId(remaining[0]?.id || '');
    }
  };

  const handleUpdateDatasetName = (id: string, newName: string) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: newName } : d))
    );
  };

  const handleUpdateAcademicYear = (id: string, newYear: string) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, academicYear: newYear } : d))
    );
    if (activeDatasetId === id) {
      setMatrixConfig((prev) => ({
        ...prev,
        academicYear: newYear,
      }));
    }
  };

  const handleUpdateTimeframeConfig = (updated: Partial<TimeframeConfig>) => {
    setTimeframeConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleSyncRealTime = () => {
    setIsRealTime(true);
    const todayStr = getTodayDateStr(new Date());
    handleUpdateTimeframeConfig({ currentDate: todayStr });
  };

  const handleDateChange = (newDate: string) => {
    const todayStr = getTodayDateStr(new Date());
    if (newDate === todayStr) {
      setIsRealTime(true);
    } else {
      setIsRealTime(false);
    }
    handleUpdateTimeframeConfig({ currentDate: newDate });
  };

  const handleResetTimeframeConfig = () => {
    const todayStr = getTodayDateStr(new Date());
    setIsRealTime(true);
    setTimeframeConfig({
      ...defaultTimeframeConfig,
      currentDate: todayStr,
    });
  };

  const handleSaveManualPpctLessons = (updatedLessons: PpctLesson[]) => {
    setDatasets((prev) =>
      prev.map((d) =>
        d.id === activeDatasetId
          ? {
              ...d,
              lessons: updatedLessons,
              totalLessons: updatedLessons.length,
            }
          : d
      )
    );
  };

  const handleExportPpctExcel = () => {
    exportPpctToExcel(activeDataset, exams);
  };

  // Switch to Matrix tab and automatically build the matrix for that specific exam period
  const handleSelectExamForMatrix = (exam: ExamEvent) => {
    const weekFrom = exam.term === 2 ? 19 : 1;
    const weekTo = exam.week;

    setMatrixConfig((prev) => ({
      ...prev,
      examPeriod: exam.title,
      limitWeekFrom: weekFrom,
      limitWeekTo: weekTo,
      subject: activeDataset.subject || prev.subject,
      grade: activeDataset.grade || prev.grade,
      sampleLoadedName: `Đồng bộ theo ${exam.title} (Tuần ${weekFrom}–${weekTo}) — Khối ${activeDataset.grade}`,
    }));

    const generated = generateMatrixFromPpct(activeDataset, {
      limitWeekFrom: weekFrom,
      limitWeekTo: weekTo,
      targetWeek: weekTo,
      ratioTn: matrixConfig.ratioTn || 70,
      ratioTl: matrixConfig.ratioTl || 30,
      structureType: matrixConfig.structureType || 'moet_2025_new',
      scorePerTn: matrixConfig.scorePerTn || 0.25,
      scorePerTn1: matrixConfig.scorePerTn1 || 0.25,
      scorePerTn2: matrixConfig.scorePerTn2 || 1.0,
      scorePerTn3: matrixConfig.scorePerTn3 || 0.5,
      scorePerTl: matrixConfig.scorePerTl || 1.0,
      targetScore: 10,
    });

    if (generated.length > 0) {
      setMatrixRows(generated);
    }

    setActiveTab('matrix');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateMatrixConfig = (updated: Partial<MatrixConfig>) => {
    setMatrixConfig((prev) => ({ ...prev, ...updated }));
  };

  const activeVolume = (matrixConfig.limitWeekFrom || 1) >= 19 ? 2 : ((matrixConfig.limitWeekTo || 9) <= 18 ? 1 : 'all');
  const specRows = useMemo(() => {
    return generateSpecificationFromMatrix(
      matrixRows,
      matrixConfig.grade,
      matrixConfig.subject,
      sgkBooks,
      activeVolume
    );
  }, [matrixRows, matrixConfig.grade, matrixConfig.subject, matrixConfig.limitWeekFrom, matrixConfig.limitWeekTo, sgkBooks, activeVolume]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        currentDateStr={timeframeConfig.currentDate}
        startDateWeek1Str={timeframeConfig.startDateWeek1}
        currentWeek={currentWeek}
        term={currentTerm}
        isBeforeTerm={isBeforeTerm}
        isRealTime={isRealTime}
        liveTime={liveTime}
        onDateChange={handleDateChange}
        onSyncRealTime={handleSyncRealTime}
        onResetDate={handleSyncRealTime}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Tabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          matrixRowCount={matrixRows.length}
          datasets={datasets}
          activeDatasetId={activeDatasetId}
          onSelectDataset={handleSelectDataset}
          onAddDataset={handleAddDataset}
          onOpenUploadModal={handleOpenUploadModal}
          onOpenSgkManager={() => setIsSgkManagerOpen(true)}
          onOpenFullPpct={() => setIsFullPpctViewerOpen(true)}
        />

        {activeTab === 'progress' ? (
          <ProgressAndScheduleTab
            datasets={datasets}
            activeDatasetId={activeDatasetId}
            activeDataset={activeDataset}
            timeframeConfig={timeframeConfig}
            currentWeek={currentWeek}
            term={currentTerm}
            isBeforeTerm={isBeforeTerm}
            exams={exams}
            isRealTime={isRealTime}
            onSyncRealTime={handleSyncRealTime}
            onSelectDataset={handleSelectDataset}
            onAddDataset={handleAddDataset}
            onDeleteDataset={handleDeleteDataset}
            onUpdateDatasetName={handleUpdateDatasetName}
            onUpdateAcademicYear={handleUpdateAcademicYear}
            onUpdateTimeframeConfig={handleUpdateTimeframeConfig}
            onResetTimeframeConfig={handleResetTimeframeConfig}
            onOpenManualEditor={() => setIsManualEditorOpen(true)}
            onOpenFullPpct={() => setIsFullPpctViewerOpen(true)}
            onExportPpctExcel={handleExportPpctExcel}
            onSelectExamForMatrix={handleSelectExamForMatrix}
            onOpenUploadModal={handleOpenUploadModal}
          />
        ) : activeTab === 'matrix' ? (
          <MatrixTab
            config={matrixConfig}
            rows={matrixRows}
            exams={exams}
            activePpct={activeDataset}
            sgkBooks={sgkBooks}
            onUpdateConfig={handleUpdateMatrixConfig}
            onUpdateRows={setMatrixRows}
            onOpenSgkManager={() => setIsSgkManagerOpen(true)}
            onOpenFullPpct={() => setIsFullPpctViewerOpen(true)}
            onOpenExamBuilder={() => {
              setExamSyncTimestamp(Date.now());
              setActiveTab('exam_builder');
            }}
          />
        ) : activeTab === 'exam_builder' ? (
          <ExamBuilderTab
            matrixConfig={matrixConfig}
            matrixRows={matrixRows}
            specRows={specRows}
            activePpct={activeDataset}
            exams={exams}
            sgkBooks={sgkBooks}
            examSyncTimestamp={examSyncTimestamp}
            onOpenMatrixTab={() => setActiveTab('matrix')}
          />
        ) : (
          <GvcnDashboardTab />
        )}
      </main>

      {/* Upload PPCT Modal: Chọn Khối trước rồi mới tải lên */}
      <UploadPpctModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddDataset={handleAddDataset}
        initialGrade={uploadModalGrade}
      />

      {/* Sgk Manager Modal (Tập 1, Tập 2) */}
      <SgkManagerModal
        isOpen={isSgkManagerOpen}
        onClose={() => setIsSgkManagerOpen(false)}
        sgkBooks={sgkBooks}
        activePpct={activeDataset}
        onUpdateSgkBooks={setSgkBooks}
        onLinkSgkToPpct={handleLinkSgkToPpct}
        onApplySgkToMatrix={handleApplySgkToMatrix}
      />

      {/* Manual PPCT editor modal */}
      <PpctManualEditorModal
        dataset={activeDataset}
        isOpen={isManualEditorOpen}
        onClose={() => setIsManualEditorOpen(false)}
        onSave={handleSaveManualPpctLessons}
      />

      {/* Full PPCT Viewer Modal (Toàn bộ 140 tiết cả năm) */}
      <PpctFullViewerModal
        isOpen={isFullPpctViewerOpen}
        onClose={() => setIsFullPpctViewerOpen(false)}
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        onSelectDataset={handleSelectDataset}
        onUpdateAcademicYear={handleUpdateAcademicYear}
        onExportExcel={handleExportPpctExcel}
        onSelectExamForMatrix={handleSelectExamForMatrix}
      />
    </div>
  );
}
