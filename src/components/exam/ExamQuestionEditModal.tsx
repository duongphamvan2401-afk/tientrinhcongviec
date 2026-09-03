import React, { useState } from 'react';
import {
  X,
  Check,
  RefreshCw,
  HelpCircle,
  Award,
  BookOpen,
  Trash2,
  Plus,
  Code,
  Sigma,
} from 'lucide-react';
import { ExamQuestion } from '../../types';
import { LatexRenderer, formatQuestionLatex } from '../../utils/latexUtils';

interface ExamQuestionEditModalProps {
  question: ExamQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ExamQuestion) => void;
  onRegenerateEquivalent?: (question: ExamQuestion) => void;
  onDelete?: (id: string) => void;
}

const QUICK_LATEX_SYMBOLS = [
  { label: 'x²', latex: '$x^2$' },
  { label: 'a/b', latex: '$\\frac{a}{b}$' },
  { label: '√x', latex: '$\\sqrt{x}$' },
  { label: 'π', latex: '$\\pi$' },
  { label: 'α', latex: '$\\alpha$' },
  { label: 'vec{u}', latex: '$\\vec{u}$' },
  { label: '∫', latex: '$\\int$' },
  { label: 'lim', latex: '$\\lim_{x \\to \\infty}$' },
  { label: '≤', latex: '$\\le$' },
  { label: '≥', latex: '$\\ge$' },
  { label: '≠', latex: '$\\neq$' },
  { label: '∈', latex: '$\\in$' },
  { label: '∞', latex: '$\\infty$' },
];

export const ExamQuestionEditModal: React.FC<ExamQuestionEditModalProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
  onRegenerateEquivalent,
  onDelete,
}) => {
  if (!isOpen || !question) return null;

  const [formData, setFormData] = useState<ExamQuestion>(() => formatQuestionLatex(question));
  const [showPreview, setShowPreview] = useState<boolean>(true);

  const handleOptionChange = (key: 'A' | 'B' | 'C' | 'D', text: string) => {
    if (!formData.options) return;
    const updated = formData.options.map((o) => (o.key === key ? { ...o, text } : o));
    setFormData({ ...formData, options: updated });
  };

  const handleInsertSymbol = (sym: string) => {
    setFormData((prev) => ({
      ...prev,
      prompt: (prev.prompt || '') + ' ' + sym,
    }));
  };

  const handleTfChange = (subKey: 'a' | 'b' | 'c' | 'd', field: 'text' | 'isCorrect' | 'explanation', val: any) => {
    if (!formData.tfStatements) return;
    const updated = formData.tfStatements.map((st) => (st.subKey === subKey ? { ...st, [field]: val } : st));
    setFormData({ ...formData, tfStatements: updated });
  };

  const handleAddGradingStep = () => {
    const steps = formData.essayGradingSteps ? [...formData.essayGradingSteps] : [];
    steps.push({ step: 'Bước phân tích / tính toán tiếp theo...', point: 0.25 });
    setFormData({ ...formData, essayGradingSteps: steps });
  };

  const handleRemoveGradingStep = (index: number) => {
    if (!formData.essayGradingSteps) return;
    const steps = formData.essayGradingSteps.filter((_, i) => i !== index);
    setFormData({ ...formData, essayGradingSteps: steps });
  };

  const handleGradingStepChange = (index: number, field: 'step' | 'point', val: any) => {
    if (!formData.essayGradingSteps) return;
    const steps = [...formData.essayGradingSteps];
    steps[index] = { ...steps[index], [field]: val };
    setFormData({ ...formData, essayGradingSteps: steps });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg font-bold text-sm">
              {formData.code}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Chỉnh sửa nội dung câu hỏi
              </h3>
              <p className="text-xs text-slate-500">
                {formData.chapter} • {formData.lesson}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mức độ nhận thức
              </label>
              <select
                value={formData.cognitiveLevel}
                onChange={(e) => {
                  const val = e.target.value as any;
                  const label =
                    val === 'nhanBiet'
                      ? 'Nhận biết'
                      : val === 'thongHieu'
                      ? 'Thông hiểu'
                      : val === 'vanDung'
                      ? 'Vận dụng'
                      : 'Vận dụng cao';
                  setFormData({ ...formData, cognitiveLevel: val, cognitiveLevelLabel: label });
                }}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="nhanBiet">Nhận biết</option>
                <option value="thongHieu">Thông hiểu</option>
                <option value="vanDung">Vận dụng</option>
                <option value="vanDungCao">Vận dụng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Điểm số câu hỏi
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Đổi câu tương đương
              </label>
              {onRegenerateEquivalent && (
                <button
                  type="button"
                  onClick={() => onRegenerateEquivalent(formData)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                >
                  <RefreshCw size={13} />
                  Lấy từ ngân hàng
                </button>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nội dung câu hỏi (Đề bài — Hỗ trợ LaTeX: <code className="font-mono text-indigo-700 font-semibold">$...$</code>)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Sigma size={13} />
                {showPreview ? 'Ẩn xem trước công thức' : 'Xem trước KaTeX'}
              </button>
            </div>

            {/* Quick LaTeX Symbols Bar */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2 p-1.5 bg-slate-100/90 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase px-1">Chèn nhanh:</span>
              {QUICK_LATEX_SYMBOLS.map((sym) => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => handleInsertSymbol(sym.latex)}
                  title={`Chèn ${sym.latex}`}
                  className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-300 rounded font-mono text-xs transition-colors shadow-2xs"
                >
                  {sym.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
              placeholder="Nhập nội dung câu hỏi (ví dụ: Cho hàm số $y = \frac{ax+b}{cx+d}$ có đồ thị...)"
            />

            {/* Live KaTeX Preview Box */}
            {showPreview && formData.prompt && (
              <div className="mt-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-200/80">
                <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mb-1 flex items-center gap-1">
                  <Code size={12} /> Xem trước công thức hiển thị (KaTeX / MathType):
                </div>
                <div className="text-sm font-medium text-slate-900">
                  <LatexRenderer text={formData.prompt} />
                </div>
              </div>
            )}
          </div>

          {/* Form specific to Question Type */}
          {/* 1. MCQ */}
          {formData.section === 'part1_mcq' && formData.options && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Các phương án lựa chọn (Chọn nút tròn để đặt đáp án đúng):
              </label>
              <div className="space-y-2">
                {formData.options.map((opt) => (
                  <div key={opt.key} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, correctOption: opt.key })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                        formData.correctOption === opt.key
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt.key}
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(opt.key, e.target.value)}
                      className={`flex-1 border rounded-lg px-3 py-1.5 text-sm ${
                        formData.correctOption === opt.key
                          ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-medium'
                          : 'border-slate-300 bg-white text-slate-800'
                      }`}
                    />
                    {formData.correctOption === opt.key && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                        <Check size={14} /> Đáp án đúng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. True / False 4 statements */}
          {formData.section === 'part2_true_false' && formData.tfStatements && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Các mệnh đề con a), b), c), d) và tính Đúng / Sai:
              </label>
              <div className="space-y-3">
                {formData.tfStatements.map((st) => (
                  <div
                    key={st.subKey}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 uppercase w-6">
                        {st.subKey})
                      </span>
                      <input
                        type="text"
                        value={st.text}
                        onChange={(e) => handleTfChange(st.subKey, 'text', e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1 text-sm bg-white text-slate-800"
                        placeholder="Nội dung mệnh đề..."
                      />
                      <div className="flex rounded-lg overflow-hidden border border-slate-300 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTfChange(st.subKey, 'isCorrect', true)}
                          className={`px-3 py-1 text-xs font-bold transition-colors ${
                            st.isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ĐÚNG
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTfChange(st.subKey, 'isCorrect', false)}
                          className={`px-3 py-1 text-xs font-bold transition-colors ${
                            !st.isCorrect
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          SAI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Short answer */}
          {formData.section === 'part3_short_answer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đáp số chuẩn (Học sinh điền kết quả vào ô):
              </label>
              <input
                type="text"
                value={formData.shortAnswerText || ''}
                onChange={(e) => setFormData({ ...formData, shortAnswerText: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-semibold text-indigo-700"
                placeholder="Ví dụ: 6 hoặc 2.5 hoặc -1/2..."
              />
            </div>
          )}

          {/* 4. Essay Steps */}
          {formData.section === 'part4_essay' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Barem điểm chi tiết các bước giải (Tự luận):
                </label>
                <button
                  type="button"
                  onClick={handleAddGradingStep}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={14} /> Thêm bước barem
                </button>
              </div>

              <div className="space-y-2">
                {(formData.essayGradingSteps || []).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      value={step.step}
                      onChange={(e) => handleGradingStepChange(sIdx, 'step', e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-800"
                    />
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="10"
                      value={step.point}
                      onChange={(e) => handleGradingStepChange(sIdx, 'point', parseFloat(e.target.value) || 0)}
                      className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-xs bg-white text-slate-800 font-bold text-center"
                    />
                    <span className="text-xs text-slate-500 font-medium">điểm</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGradingStep(sIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lời giải và giải thích chi tiết */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lời giải chi tiết & Hướng dẫn sư phạm
            </label>
            <textarea
              rows={2}
              value={formData.solutionExplanation || ''}
              onChange={(e) => setFormData({ ...formData, solutionExplanation: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 bg-white"
              placeholder="Giải thích tại sao đáp án này đúng, các bước giải mẫu..."
            />
          </div>

          {/* Yêu cầu cần đạt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Yêu cầu cần đạt (Bản đặc tả Ma trận Phụ lục II)
            </label>
            <input
              type="text"
              value={formData.learningObjective || ''}
              onChange={(e) => setFormData({ ...formData, learningObjective: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-slate-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi đề thi không?')) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
                Xóa câu hỏi này
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                const normalized = formatQuestionLatex(formData);
                onSave(normalized);
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check size={16} />
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
