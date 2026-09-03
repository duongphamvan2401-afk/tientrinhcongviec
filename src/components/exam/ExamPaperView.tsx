import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Download,
  Shuffle,
  Sliders,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronDown,
  Edit3,
  RefreshCw,
  Plus,
  BookOpen,
  Eye,
  ListOrdered,
  FileCheck2,
  TableProperties,
  Code,
  Sigma,
} from 'lucide-react';
import { ExamPaper, ExamQuestion, MatrixConfig, MatrixRow, SpecificationRow } from '../../types';
import { exportExamPaperToDocx } from '../../utils/examDocxExport';
import { LatexRenderer, formatPaperLatex } from '../../utils/latexUtils';

interface ExamPaperViewProps {
  paper: ExamPaper;
  matrixConfig?: MatrixConfig;
  matrixRows?: MatrixRow[];
  specRows?: SpecificationRow[];
  onShuffleExam: (newCode: string) => void;
  onOpenConfig: () => void;
  onEditQuestion: (question: ExamQuestion) => void;
  onRegenerateEquivalent: (question: ExamQuestion) => void;
}

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({
  paper,
  matrixConfig,
  matrixRows,
  specRows,
  onShuffleExam,
  onOpenConfig,
  onEditQuestion,
  onRegenerateEquivalent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'exam' | 'solutions' | 'matrix_alignment'>('exam');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showRawLatex, setShowRawLatex] = useState<boolean>(false);

  // Đảm bảo toàn bộ câu hỏi và đáp án được chuẩn hóa cú pháp LaTeX
  const formattedPaper = React.useMemo(() => formatPaperLatex(paper), [paper]);
  const cfg = formattedPaper.config;

  const handleExportDocx = async (mode: 'exam_only' | 'solutions_only' | 'full_package') => {
    try {
      setIsExporting(true);
      await exportExamPaperToDocx(formattedPaper, mode, matrixConfig, matrixRows, specRows);
    } catch (err) {
      console.error('Docx export failed:', err);
      alert('Không thể tạo file Word. Xin vui lòng thử lại.');
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const p1 = formattedPaper.questions.filter((q) => q.section === 'part1_mcq');
  const p2 = formattedPaper.questions.filter((q) => q.section === 'part2_true_false');
  const p3 = formattedPaper.questions.filter((q) => q.section === 'part3_short_answer');
  const p4 = formattedPaper.questions.filter((q) => q.section === 'part4_essay');

  const summary = formattedPaper.matrixAlignmentSummary;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('exam')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'exam'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={15} />
            Đề thi học sinh
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('solutions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'solutions'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 size={15} />
            Đáp án & Barem chấm
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matrix_alignment')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'matrix_alignment'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties size={15} />
            Đối chiếu Ma trận & YCCĐ
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {/* Mã đề selector & Shuffle */}
          <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl p-0.5">
            <span className="px-2.5 text-xs font-bold text-slate-600">Mã:</span>
            {['101', '102', '103', '104'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onShuffleExam(code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  cfg.examCode === code
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {code}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                const randomCode = (Math.floor(Math.random() * 800) + 101).toString();
                onShuffleExam(randomCode);
              }}
              title="Xáo trộn câu hỏi và tạo mã đề ngẫu nhiên mới"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-lg transition-colors ml-0.5"
            >
              <Shuffle size={14} />
            </button>
          </div>

          {/* Config Button */}
          <button
            type="button"
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
          >
            <Sliders size={14} />
            Cấu hình đề
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Download size={14} />
              {isExporting ? 'Đang xuất Word...' : 'Tải file Word'}
              <ChevronDown size={14} />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => handleExportDocx('exam_only')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileText size={14} className="text-indigo-600" />
                  Đề thi học sinh (.docx)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportDocx('solutions_only')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileCheck2 size={14} className="text-emerald-600" />
                  Đáp án & Barem (.docx)
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => handleExportDocx('full_package')}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 font-bold text-indigo-700 flex items-center gap-2"
                >
                  <Download size={14} className="text-indigo-600" />
                  Trọn bộ: Đề + Đáp án + Ma trận & Đặc tả (.docx)
                </button>
              </div>
            )}
          </div>

          {/* LaTeX / MathType Mode Toggle */}
          <button
            type="button"
            onClick={() => setShowRawLatex(!showRawLatex)}
            title={showRawLatex ? "Hiển thị công thức toán học KaTeX trực quan" : "Xem mã nguồn LaTeX ($...) để sao chép vào MathType"}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              showRawLatex
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Code size={14} />
            {showRawLatex ? 'Mã LaTeX ($)' : 'LaTeX & MathType'}
          </button>

          {/* Print Preview Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
          >
            <Printer size={14} />
            In ấn (A4)
          </button>
        </div>
      </div>

      {/* LaTeX & MathType Info Notice */}
      <div className="bg-linear-to-r from-indigo-50/90 via-blue-50/70 to-emerald-50/60 border border-indigo-200/80 rounded-2xl p-3.5 px-4 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700 font-sans shadow-2xs print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            ∑
          </span>
          <div>
            <span className="font-bold text-indigo-900">Chuẩn hóa LaTeX / MathType 100%: </span>
            <span className="text-slate-600">
              Tất cả các công thức toán trong đề đã được đóng gói chuẩn mã LaTeX (<code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">$...$</code>).
              Khi tải file Word, Thầy/Cô mở trong Word và nhấn phím tắt <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[11px] font-bold text-indigo-800 shadow-2xs">Alt + \</kbd> (hoặc qua menu MathType &gt; Toggle TeX) để chuyển thành công thức MathType tương tác.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRawLatex(!showRawLatex)}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline shrink-0 cursor-pointer"
        >
          {showRawLatex ? 'Xem dạng công thức trực quan' : 'Xem mã nguồn LaTeX ($)'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: ĐỀ THI HỌC SINH (CHUẨN FORM GIẤY THI) */}
      {/* ========================================================================= */}
      {activeSubTab === 'exam' && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 max-w-4xl mx-auto font-serif text-slate-900 print:shadow-none print:border-none print:p-0">
          {/* Header 2 Columns */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300 text-center font-sans">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-800">
                {cfg.schoolName}
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {cfg.department}
              </div>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-md border border-slate-300 text-xs font-bold text-slate-900">
                MÃ ĐỀ: {cfg.examCode}
              </div>
              <div className="text-[10px] text-slate-500 italic mt-0.5">
                (Đề thi gồm {paper.questions.length} câu)
              </div>
            </div>

            <div>
              <div className="text-sm font-bold uppercase text-slate-900">
                {cfg.title}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                MÔN: {cfg.subject.toUpperCase()} — KHỐI {cfg.grade}
              </div>
              <div className="text-[11px] font-medium text-slate-600">
                Năm học: {cfg.academicYear}
              </div>
              <div className="text-[11px] text-slate-600 italic mt-0.5">
                Thời gian làm bài: {cfg.durationMinutes} phút (không kể thời gian phát đề)
              </div>
            </div>
          </div>

          {/* Student Info & Score Box */}
          <div className="my-6 grid grid-cols-3 border border-slate-400 font-sans text-xs">
            <div className="col-span-2 p-3 space-y-2 border-r border-slate-400">
              <div className="flex">
                <span className="font-semibold text-slate-700 w-32">Họ và tên thí sinh:</span>
                <span className="flex-1 border-b border-dotted border-slate-400"></span>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-1">
                  <span className="font-semibold text-slate-700 w-12">Lớp:</span>
                  <span className="flex-1 border-b border-dotted border-slate-400"></span>
                </div>
                <div className="flex flex-1">
                  <span className="font-semibold text-slate-700 w-32">Số báo danh (SBD):</span>
                  <span className="flex-1 border-b border-dotted border-slate-400"></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 text-center">
              <div className="border-r border-slate-400 p-2 flex flex-col justify-between">
                <div className="font-bold text-[11px] uppercase">Điểm số</div>
                <div className="h-10"></div>
              </div>
              <div className="p-2 flex flex-col justify-between">
                <div className="font-bold text-[11px] uppercase">Lời phê giáo viên</div>
                <div className="h-10"></div>
              </div>
            </div>
          </div>

          {/* Bảng phiếu trả lời nhanh cho trắc nghiệm */}
          {p1.length > 0 && (
            <div className="my-6 p-3 bg-slate-50 border border-slate-300 rounded-lg font-sans">
              <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Phiếu trả lời nhanh Phần I (Tô tròn đáp án đúng):
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center text-xs">
                {p1.map((_, idx) => (
                  <div key={idx} className="border border-slate-300 rounded p-1 bg-white">
                    <div className="font-bold text-[10px] text-slate-500">C{idx + 1}</div>
                    <div className="flex justify-center gap-0.5 text-[9px] font-bold text-slate-400 mt-0.5">
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                      <span>D</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTIONS CONTAINER */}
          <div className="space-y-8 text-sm leading-relaxed">
            {/* PHẦN I */}
            {p1.length > 0 && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-2.5 rounded-lg font-sans">
                  <h4 className="font-bold text-slate-900 text-sm">
                    PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (
                    {(p1.length * (p1[0].score || 0.25)).toFixed(2)} điểm)
                  </h4>
                  <p className="text-xs text-slate-600 italic">
                    Thí sinh trả lời từ câu 1 đến câu {p1.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.
                  </p>
                </div>

                <div className="space-y-4 pl-1">
                  {p1.map((q, idx) => (
                    <div
                      key={q.id}
                      className="group relative p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Action buttons on hover */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 font-sans">
                        <button
                          type="button"
                          onClick={() => onRegenerateEquivalent(q)}
                          title="Đổi câu tương đương từ ngân hàng"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditQuestion(q)}
                          title="Sửa nội dung câu hỏi"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>

                      <div className="font-medium">
                        <span className="font-bold">Câu {idx + 1}: </span>
                        <LatexRenderer text={q.prompt} showRawLatex={showRawLatex} />
                      </div>

                      {q.options && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-1 pl-2">
                          {q.options.map((opt) => (
                            <div key={opt.key} className="flex items-baseline gap-1.5">
                              <span className="font-bold">{opt.key}.</span>
                              <LatexRenderer text={opt.text} showRawLatex={showRawLatex} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHẦN II */}
            {p2.length > 0 && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-2.5 rounded-lg font-sans">
                  <h4 className="font-bold text-slate-900 text-sm">
                    PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI (
                    {(p2.length * (p2[0].score || 1.0)).toFixed(2)} điểm)
                  </h4>
                  <p className="text-xs text-slate-600 italic">
                    Thí sinh trả lời từ câu 1 đến câu {p2.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
                  </p>
                </div>

                <div className="space-y-5 pl-1">
                  {p2.map((q, idx) => (
                    <div
                      key={q.id}
                      className="group relative p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 font-sans">
                        <button
                          type="button"
                          onClick={() => onRegenerateEquivalent(q)}
                          title="Đổi câu tương đương từ ngân hàng"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditQuestion(q)}
                          title="Sửa nội dung câu hỏi"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>

                      <div className="font-medium">
                        <span className="font-bold">Câu {idx + 1}: </span>
                        <LatexRenderer text={q.prompt} showRawLatex={showRawLatex} />
                      </div>

                      {q.tfStatements && (
                        <div className="mt-2 space-y-1.5 pl-4">
                          {q.tfStatements.map((st) => (
                            <div key={st.subKey} className="flex items-start gap-2">
                              <span className="font-bold">{st.subKey})</span>
                              <LatexRenderer text={st.text} showRawLatex={showRawLatex} className="flex-1" />
                              <div className="flex gap-2 text-xs font-sans text-slate-400 print:text-slate-900 shrink-0 font-medium">
                                <span>[ ] Đúng</span>
                                <span>[ ] Sai</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHẦN III */}
            {p3.length > 0 && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-2.5 rounded-lg font-sans">
                  <h4 className="font-bold text-slate-900 text-sm">
                    PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (
                    {(p3.length * (p3[0].score || 0.5)).toFixed(2)} điểm)
                  </h4>
                  <p className="text-xs text-slate-600 italic">
                    Thí sinh trả lời từ câu 1 đến câu {p3.length}. Viết đáp số vào ô trống tương ứng.
                  </p>
                </div>

                <div className="space-y-4 pl-1">
                  {p3.map((q, idx) => (
                    <div
                      key={q.id}
                      className="group relative p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 font-sans">
                        <button
                          type="button"
                          onClick={() => onRegenerateEquivalent(q)}
                          title="Đổi câu tương đương từ ngân hàng"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditQuestion(q)}
                          title="Sửa nội dung câu hỏi"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>

                      <div className="font-medium">
                        <span className="font-bold">Câu {idx + 1}: </span>
                        <LatexRenderer text={q.prompt} showRawLatex={showRawLatex} />
                      </div>

                      <div className="mt-2 flex items-center gap-2 pl-4 text-xs font-sans">
                        <span className="text-slate-600 font-semibold">Đáp số:</span>
                        <div className="w-36 h-6 border border-slate-400 rounded bg-white"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHẦN IV */}
            {p4.length > 0 && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-2.5 rounded-lg font-sans">
                  <h4 className="font-bold text-slate-900 text-sm">
                    PHẦN IV. TỰ LUẬN (
                    {p4.reduce((acc, q) => acc + (q.score || 1.0), 0).toFixed(2)} điểm)
                  </h4>
                  <p className="text-xs text-slate-600 italic">
                    Thí sinh trình bày chi tiết lời giải các bài toán sau vào giấy thi.
                  </p>
                </div>

                <div className="space-y-5 pl-1">
                  {p4.map((q, idx) => (
                    <div
                      key={q.id}
                      className="group relative p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 font-sans">
                        <button
                          type="button"
                          onClick={() => onRegenerateEquivalent(q)}
                          title="Đổi bài toán tương đương"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditQuestion(q)}
                          title="Sửa nội dung bài toán"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 shadow-2xs"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>

                      <div className="whitespace-pre-line leading-relaxed">
                        <span className="font-bold">Bài {idx + 1} ({q.score || 1.0} điểm): </span>
                        <LatexRenderer text={q.prompt} showRawLatex={showRawLatex} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center font-sans space-y-1">
            <div className="font-bold tracking-widest text-slate-700 text-xs">
              ---------- HẾT ----------
            </div>
            <div className="text-[11px] text-slate-500 italic">
              Cán bộ coi thi không giải thích gì thêm. Thí sinh không được sử dụng tài liệu.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ĐÁP ÁN VÀ BAREM CHẤM CHI TIẾT */}
      {/* ========================================================================= */}
      {activeSubTab === 'solutions' && (
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 max-w-4xl mx-auto font-sans text-slate-900 space-y-8">
          <div className="text-center border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 uppercase">
              HƯỚNG DẪN CHẤM & ĐÁP ÁN ĐỀ KIỂM TRA MÃ {cfg.examCode}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Môn: {cfg.subject} — Khối {cfg.grade} • Năm học: {cfg.academicYear}
            </p>
          </div>

          {/* 1. Phần I Đáp án */}
          {p1.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                  1
                </span>
                ĐÁP ÁN PHẦN I — TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN (Mỗi câu 0.25 điểm)
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center text-xs">
                {p1.map((q, idx) => (
                  <div key={q.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <div className="text-slate-500 font-medium">Câu {idx + 1}</div>
                    <div className="font-black text-indigo-700 text-sm mt-0.5">
                      {q.correctOption || 'A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Phần II Đáp án */}
          {p2.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                  2
                </span>
                ĐÁP ÁN PHẦN II — TRẮC NGHIỆM ĐÚNG SAI
              </h4>
              <p className="text-xs text-slate-500 italic">
                Quy tắc tính điểm theo chuẩn BGD: Đúng 1 ý: 0.1đ • Đúng 2 ý: 0.25đ • Đúng 3 ý: 0.5đ • Đúng 4 ý: 1.0đ.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-16 text-center">Câu</th>
                      <th className="p-2.5 w-24 text-center">Lệnh a)</th>
                      <th className="p-2.5 w-24 text-center">Lệnh b)</th>
                      <th className="p-2.5 w-24 text-center">Lệnh c)</th>
                      <th className="p-2.5 w-24 text-center">Lệnh d)</th>
                      <th className="p-2.5">Giải thích sư phạm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {p2.map((q, idx) => {
                      const a = q.tfStatements?.find((s) => s.subKey === 'a')?.isCorrect ? 'ĐÚNG' : 'SAI';
                      const b = q.tfStatements?.find((s) => s.subKey === 'b')?.isCorrect ? 'ĐÚNG' : 'SAI';
                      const c = q.tfStatements?.find((s) => s.subKey === 'c')?.isCorrect ? 'ĐÚNG' : 'SAI';
                      const d = q.tfStatements?.find((s) => s.subKey === 'd')?.isCorrect ? 'ĐÚNG' : 'SAI';

                      return (
                        <tr key={q.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-center text-indigo-700">Câu {idx + 1}</td>
                          <td className={`p-2.5 font-bold text-center ${a === 'ĐÚNG' ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                            {a}
                          </td>
                          <td className={`p-2.5 font-bold text-center ${b === 'ĐÚNG' ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                            {b}
                          </td>
                          <td className={`p-2.5 font-bold text-center ${c === 'ĐÚNG' ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                            {c}
                          </td>
                          <td className={`p-2.5 font-bold text-center ${d === 'ĐÚNG' ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                            {d}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            <LatexRenderer text={q.solutionExplanation || 'Theo lý thuyết SGK'} showRawLatex={showRawLatex} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Phần III Đáp án */}
          {p3.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                  3
                </span>
                ĐÁP ÁN PHẦN III — TRẢ LỜI NGẮN (Mỗi câu 0.5 điểm)
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-16 text-center">Câu</th>
                      <th className="p-2.5 w-36 text-center">Đáp số chuẩn</th>
                      <th className="p-2.5">Hướng dẫn giải vắn tắt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {p3.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-center text-indigo-700">Câu {idx + 1}</td>
                        <td className="p-2.5 font-bold text-center text-emerald-700 bg-emerald-50/50 text-sm">
                          <LatexRenderer text={q.shortAnswerText || '---'} showRawLatex={showRawLatex} />
                        </td>
                        <td className="p-2.5 text-slate-600">
                          <LatexRenderer text={q.solutionExplanation || 'Tính theo công thức SGK'} showRawLatex={showRawLatex} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Phần IV Barem Tự luận */}
          {p4.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                  4
                </span>
                BAREM ĐIỂM CHI TIẾT PHẦN IV — TỰ LUẬN
              </h4>

              <div className="space-y-4">
                {p4.map((q, idx) => (
                  <div key={q.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200">
                      <span className="font-bold text-xs text-slate-800">
                        Bài {idx + 1} ({q.score || 1.0} điểm) — {q.lesson}
                      </span>
                    </div>

                    <div className="p-3 bg-white">
                      {q.essayGradingSteps && q.essayGradingSteps.length > 0 ? (
                        <div className="divide-y divide-slate-100 text-xs">
                          {q.essayGradingSteps.map((step, sIdx) => (
                            <div key={sIdx} className="py-2 flex items-start justify-between gap-4">
                              <span className="text-slate-700">
                                <LatexRenderer text={step.step} showRawLatex={showRawLatex} />
                              </span>
                              <span className="font-bold text-indigo-700 shrink-0 bg-indigo-50 px-2 py-0.5 rounded">
                                {step.point.toFixed(2)} đ
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 leading-relaxed">
                          <LatexRenderer text={q.solutionExplanation || 'Trình bày đầy đủ các bước giải.'} showRawLatex={showRawLatex} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: BẢNG ĐỐI CHIẾU MA TRẬN & YÊU CẦU CẦN ĐẠT */}
      {/* ========================================================================= */}
      {activeSubTab === 'matrix_alignment' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-5xl mx-auto font-sans text-slate-900 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TableProperties className="text-indigo-600" size={18} />
                Bảng Đối Chiếu Ma Trận & Yêu Cầu Cần Đạt (Bộ GD&ĐT)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảo đảm 100% câu hỏi trong đề thi khớp nối với Phụ lục I và Phụ lục II
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                Tỉ lệ TN: {summary.percentTn}% ({summary.scorePart1 + summary.scorePart2 + summary.scorePart3}đ)
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                Tỉ lệ TL: {summary.percentTl}% ({summary.scorePart4}đ)
              </span>
            </div>
          </div>

          {/* Cognitive Level Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
              <div className="text-xs font-bold text-blue-900">Nhận biết</div>
              <div className="text-xl font-extrabold text-blue-700 mt-1">
                {summary.scoreNhanBiet} đ
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">
                {Math.round((summary.scoreNhanBiet / 10) * 100)}% tổng số điểm
              </div>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900">Thông hiểu</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">
                {summary.scoreThongHieu} đ
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">
                {Math.round((summary.scoreThongHieu / 10) * 100)}% tổng số điểm
              </div>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
              <div className="text-xs font-bold text-amber-900">Vận dụng</div>
              <div className="text-xl font-extrabold text-amber-700 mt-1">
                {summary.scoreVanDung} đ
              </div>
              <div className="text-[11px] text-amber-600 mt-0.5">
                {Math.round((summary.scoreVanDung / 10) * 100)}% tổng số điểm
              </div>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200">
              <div className="text-xs font-bold text-rose-900">Vận dụng cao</div>
              <div className="text-xl font-extrabold text-rose-700 mt-1">
                {summary.scoreVanDungCao} đ
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">
                {Math.round((summary.scoreVanDungCao / 10) * 100)}% tổng số điểm
              </div>
            </div>
          </div>

          {/* Full Question-by-Question Alignment Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-16 text-center">Mã câu</th>
                    <th className="p-2.5 w-32">Phần thi</th>
                    <th className="p-2.5 w-24 text-center">Mức độ</th>
                    <th className="p-2.5 w-16 text-center">Điểm</th>
                    <th className="p-2.5 w-48">Đơn vị kiến thức (Bài học)</th>
                    <th className="p-2.5">Yêu cầu cần đạt (YCCĐ chuẩn BGD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paper.questions.map((q) => {
                    const sectionLabel =
                      q.section === 'part1_mcq'
                        ? 'Phần I: TN Nhiều lựa chọn'
                        : q.section === 'part2_true_false'
                        ? 'Phần II: TN Đúng/Sai'
                        : q.section === 'part3_short_answer'
                        ? 'Phần III: Trả lời ngắn'
                        : 'Phần IV: Tự luận';

                    const cogBadge =
                      q.cognitiveLevel === 'nhanBiet'
                        ? 'bg-blue-100 text-blue-800'
                        : q.cognitiveLevel === 'thongHieu'
                        ? 'bg-emerald-100 text-emerald-800'
                        : q.cognitiveLevel === 'vanDung'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800';

                    return (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-center text-indigo-700">{q.code}</td>
                        <td className="p-2.5 text-slate-600 font-medium">{sectionLabel}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${cogBadge}`}>
                            {q.cognitiveLevelLabel}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-center text-slate-800">
                          {(q.score || 0).toFixed(2)}đ
                        </td>
                        <td className="p-2.5 font-medium text-slate-800">{q.lesson}</td>
                        <td className="p-2.5 text-slate-600 leading-relaxed">
                          {q.learningObjective || 'Yêu cầu cần đạt chuẩn CTGDPT 2018.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
