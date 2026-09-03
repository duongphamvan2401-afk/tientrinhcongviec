import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sliders,
  Sparkles,
  Shuffle,
  RefreshCw,
  Plus,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  ExamPaper,
  ExamPaperConfig,
  ExamQuestion,
  ExamLevelType,
  MatrixConfig,
  MatrixRow,
  SpecificationRow,
  PpctDataset,
  SgkBook,
  ExamEvent,
} from '../../types';
import {
  generateExamPaperFromMatrix,
  generateCustomExamPaper,
  shuffleExamPaper,
  regenerateSingleQuestion,
} from '../../utils/examGenerator';
import { ExamPaperView } from './ExamPaperView';
import { ExamConfigModal } from './ExamConfigModal';
import { ExamQuestionEditModal } from './ExamQuestionEditModal';

interface ExamBuilderTabProps {
  matrixConfig: MatrixConfig;
  matrixRows: MatrixRow[];
  specRows: SpecificationRow[];
  activePpct: PpctDataset;
  exams: ExamEvent[];
  sgkBooks?: SgkBook[];
  examSyncTimestamp?: number;
  onOpenMatrixTab: () => void;
}

const STORAGE_KEY = 'teacher_hub_active_exam_paper';

export const ExamBuilderTab: React.FC<ExamBuilderTabProps> = ({
  matrixConfig,
  matrixRows,
  specRows,
  activePpct,
  exams,
  sgkBooks,
  examSyncTimestamp,
  onOpenMatrixTab,
}) => {
  // Active exam paper
  const [examPaper, setExamPaper] = useState<ExamPaper | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved exam paper', e);
    }
    return null;
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Auto-generate a default exam paper on first visit if none exists
  useEffect(() => {
    if (!examPaper) {
      const defaultPaper = generateExamPaperFromMatrix(
        matrixConfig,
        matrixRows,
        specRows,
        activePpct,
        'giua_ky',
        '101'
      );
      setExamPaper(defaultPaper);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPaper));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync whenever examSyncTimestamp updates from Matrix tab
  useEffect(() => {
    if (examSyncTimestamp && examSyncTimestamp > 0) {
      const isFinal = matrixConfig.examPeriod.toLowerCase().includes('cuối');
      const synced = generateExamPaperFromMatrix(
        matrixConfig,
        matrixRows,
        specRows,
        activePpct,
        isFinal ? 'cuoi_ky' : 'giua_ky',
        examPaper?.config.examCode || '101'
      );
      savePaper(synced);
      setSyncToast(`Đã đồng bộ thành công đề thi & đáp án theo Ma trận ${matrixConfig.examPeriod}!`);
      const timer = setTimeout(() => setSyncToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [examSyncTimestamp]);

  // Save to localStorage when changed
  const savePaper = (paper: ExamPaper | null) => {
    setExamPaper(paper);
    if (paper) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(paper));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Re-sync from current matrix explicitly
  const handleManualSyncMatrix = () => {
    const isFinal = matrixConfig.examPeriod.toLowerCase().includes('cuối');
    const isKttx = matrixConfig.examPeriod.toLowerCase().includes('thường xuyên');
    const level: ExamLevelType = isKttx ? 'kttx' : isFinal ? 'cuoi_ky' : 'giua_ky';

    const synced = generateExamPaperFromMatrix(
      matrixConfig,
      matrixRows,
      specRows,
      activePpct,
      level,
      examPaper?.config.examCode || '101'
    );
    savePaper(synced);
    setSyncToast('Đã tái lập và đồng bộ toàn diện Đề thi & Đáp án theo Ma trận hiện tại!');
    const timer = setTimeout(() => setSyncToast(null), 4000);
  };

  // Handler for Quick Generator buttons
  const handleQuickGenerate = (level: ExamLevelType) => {
    if (level === 'kttx') {
      const newPaper = generateCustomExamPaper(
        {
          examLevel: 'kttx',
          title: 'ĐỀ KIỂM TRA THƯỜNG XUYÊN 15 PHÚT',
          durationMinutes: 15,
          format: 'tn_only',
          countPart1Mcq: 10,
          scorePerMcq: 1.0,
          countPart2Tf: 0,
          countPart3Short: 0,
          countPart4Essay: 0,
          weekFrom: 1,
          weekTo: 4,
          subject: activePpct.subject || 'Toán',
          grade: activePpct.grade || '9',
        },
        activePpct,
        sgkBooks
      );
      savePaper(newPaper);
    } else {
      // Giữa kì hoặc Cuối kì: Chuẩn Ma trận & YCCĐ
      const newPaper = generateExamPaperFromMatrix(
        matrixConfig,
        matrixRows,
        specRows,
        activePpct,
        level,
        '101'
      );
      savePaper(newPaper);
    }
  };

  // Handler for applying new config from Modal
  const handleApplyConfig = (newConfig: ExamPaperConfig, generateNew: boolean) => {
    if (generateNew) {
      let newPaper: ExamPaper;
      if (newConfig.mode === 'matrix_aligned') {
        newPaper = generateExamPaperFromMatrix(
          matrixConfig,
          matrixRows,
          specRows,
          activePpct,
          newConfig.examLevel,
          newConfig.examCode
        );
        // Cập nhật các thông tin tùy chỉnh như tên trường, thời lượng
        newPaper = {
          ...newPaper,
          config: {
            ...newPaper.config,
            title: newConfig.title,
            schoolName: newConfig.schoolName,
            department: newConfig.department,
            durationMinutes: newConfig.durationMinutes,
            examCode: newConfig.examCode,
          },
        };
      } else {
        newPaper = generateCustomExamPaper(newConfig, activePpct, sgkBooks);
      }
      savePaper(newPaper);
    } else if (examPaper) {
      savePaper({
        ...examPaper,
        config: newConfig,
      });
    }
  };

  // Shuffle paper (xáo trộn câu hỏi và tạo mã đề mới)
  const handleShuffle = (newCode: string) => {
    if (!examPaper) return;
    const shuffled = shuffleExamPaper(examPaper, newCode);
    savePaper(shuffled);
  };

  // Sửa câu hỏi
  const handleSaveQuestion = (updated: ExamQuestion) => {
    if (!examPaper) return;
    const updatedQuestions = examPaper.questions.map((q) => (q.id === updated.id ? updated : q));
    savePaper({
      ...examPaper,
      questions: updatedQuestions,
    });
  };

  // Đổi câu hỏi tương đương từ ngân hàng
  const handleRegenerateEquivalent = (question: ExamQuestion) => {
    if (!examPaper) return;
    const replaced = regenerateSingleQuestion(question, examPaper.questions);
    const updatedQuestions = examPaper.questions.map((q) => (q.id === question.id ? replaced : q));
    savePaper({
      ...examPaper,
      questions: updatedQuestions,
    });
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (id: string) => {
    if (!examPaper) return;
    const filtered = examPaper.questions.filter((q) => q.id !== id);
    // Đánh lại số thứ tự câu
    const reIndexed = filtered.map((q, idx) => ({ ...q, code: `[C${idx + 1}]` }));
    savePaper({
      ...examPaper,
      questions: reIndexed,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{syncToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Tạo Đề Kiểm Tra & Đánh Giá
              </h2>
              {examPaper?.config.mode === 'matrix_aligned' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Chuẩn Ma trận & YCCĐ
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Tùy chỉnh linh hoạt
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Kiểm tra thường xuyên, Giữa kỳ, Cuối kỳ • Xuất Word (.docx), In ấn chuẩn Bộ GD&ĐT
            </p>
          </div>
        </div>

        {/* Fast presets buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickGenerate('kttx')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
          >
            <Zap size={14} className="text-amber-500" />
            KTTX 15 phút (10 TN)
          </button>

          <button
            type="button"
            onClick={() => handleQuickGenerate('giua_ky')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <CheckCircle2 size={14} className="text-emerald-600" />
            Đề Giữa kỳ (Theo Ma trận)
          </button>

          <button
            type="button"
            onClick={() => handleQuickGenerate('cuoi_ky')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
          >
            <CheckCircle2 size={14} className="text-purple-600" />
            Đề Cuối kỳ (Theo Ma trận)
          </button>

          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs transition-colors"
          >
            <Sliders size={14} />
            Tùy biến số câu & hình thức
          </button>
        </div>
      </div>

      {/* Bảng liên thông trực tiếp Ma trận & Bảng đặc tả */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Liên thông đồng bộ Ma trận (PL I) & Bảng đặc tả (PL II)
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{matrixConfig.examPeriod || 'Kiểm tra Giữa kì I'}</span>
              <span className="text-xs font-normal text-indigo-200">
                (Môn {matrixConfig.subject || activePpct.subject} {matrixConfig.grade || activePpct.grade} • Tuần {matrixConfig.limitWeekFrom || 1} đến {matrixConfig.limitWeekTo || 9})
              </span>
            </h3>
            <p className="text-xs text-indigo-200 max-w-2xl">
              Căn cứ chính xác theo Khung Ma trận {matrixRows.length} bài học và Bảng đặc tả Yêu cầu cần đạt. Mọi thay đổi trong Ma trận được liên thông tự động vào Đề thi & Đáp án.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleManualSyncMatrix}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-950 bg-amber-300 hover:bg-amber-400 rounded-xl shadow-xs transition-colors"
              title="Tải lại toàn bộ câu hỏi bám sát Ma trận và Bảng đặc tả hiện hành"
            >
              <RefreshCw size={14} />
              Đồng bộ lại theo Ma trận
            </button>

            <button
              type="button"
              onClick={onOpenMatrixTab}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-500/50 rounded-xl transition-colors"
              title="Quay lại tab Ma trận đề & Bảng đặc tả"
            >
              <BookOpen size={14} />
              Xem Ma trận & Đặc tả
            </button>
          </div>
        </div>

        {/* 4 Dạng câu hỏi breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-indigo-700/60">
          <div className="bg-indigo-950/50 rounded-xl p-2.5 border border-indigo-700/40">
            <div className="text-[11px] text-indigo-300 font-medium">Dạng I: Trắc nghiệm 4 lựa chọn</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {examPaper?.questions.filter((q) => q.section === 'part1_mcq').length || 0} câu
              <span className="text-xs font-normal text-indigo-300 ml-1.5">
                ({((examPaper?.questions.filter((q) => q.section === 'part1_mcq').length || 0) * (matrixConfig.scorePerTn1 || 0.25)).toFixed(2)}đ)
              </span>
            </div>
          </div>

          <div className="bg-indigo-950/50 rounded-xl p-2.5 border border-indigo-700/40">
            <div className="text-[11px] text-indigo-300 font-medium">Dạng II: Trắc nghiệm Đúng/Sai</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {examPaper?.questions.filter((q) => q.section === 'part2_true_false').length || 0} câu
              <span className="text-xs font-normal text-indigo-300 ml-1.5">
                ({((examPaper?.questions.filter((q) => q.section === 'part2_true_false').length || 0) * (matrixConfig.scorePerTn2 || 1.0)).toFixed(2)}đ)
              </span>
            </div>
          </div>

          <div className="bg-indigo-950/50 rounded-xl p-2.5 border border-indigo-700/40">
            <div className="text-[11px] text-indigo-300 font-medium">Dạng III: Trả lời ngắn</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {examPaper?.questions.filter((q) => q.section === 'part3_short_answer').length || 0} câu
              <span className="text-xs font-normal text-indigo-300 ml-1.5">
                ({((examPaper?.questions.filter((q) => q.section === 'part3_short_answer').length || 0) * (matrixConfig.scorePerTn3 || 0.5)).toFixed(2)}đ)
              </span>
            </div>
          </div>

          <div className="bg-indigo-950/50 rounded-xl p-2.5 border border-indigo-700/40">
            <div className="text-[11px] text-indigo-300 font-medium">Dạng IV: Bài toán Tự luận</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {examPaper?.questions.filter((q) => q.section === 'part4_essay').length || 0} bài
              <span className="text-xs font-normal text-indigo-300 ml-1.5">
                ({(examPaper?.questions.filter((q) => q.section === 'part4_essay').reduce((s, q) => s + q.score, 0) || 0).toFixed(2)}đ)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Exam View */}
      {examPaper ? (
        <ExamPaperView
          paper={examPaper}
          matrixConfig={matrixConfig}
          matrixRows={matrixRows}
          specRows={specRows}
          onShuffleExam={handleShuffle}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          onEditQuestion={(q) => setEditingQuestion(q)}
          onRegenerateEquivalent={handleRegenerateEquivalent}
        />
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Chưa có đề thi nào được khởi tạo
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Thầy/Cô có thể tạo đề tự động theo Ma trận & Yêu cầu cần đạt, hoặc tùy chỉnh số lượng câu hỏi và thời lượng làm bài theo nhu cầu.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleQuickGenerate('giua_ky')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Tạo đề Giữa kỳ theo Ma trận
            </button>
            <button
              type="button"
              onClick={() => handleQuickGenerate('kttx')}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tạo đề kiểm tra thường xuyên
            </button>
          </div>
        </div>
      )}

      {/* Modal Tùy chỉnh cấu hình đề */}
      {isConfigModalOpen && examPaper && (
        <ExamConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          initialConfig={examPaper.config}
          matrixConfig={matrixConfig}
          ppctDataset={activePpct}
          onApplyConfig={handleApplyConfig}
        />
      )}

      {/* Modal Chỉnh sửa câu hỏi đơn */}
      {editingQuestion && (
        <ExamQuestionEditModal
          isOpen={!!editingQuestion}
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={handleSaveQuestion}
          onRegenerateEquivalent={handleRegenerateEquivalent}
          onDelete={handleDeleteQuestion}
        />
      )}
    </div>
  );
};
