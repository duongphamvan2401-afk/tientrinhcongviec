import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, Calendar, School } from 'lucide-react';
import { PpctDataset } from '../types';
import { parsePpctFile } from '../utils/fileParser';
import {
  defaultPpctDataset6,
  defaultPpctDataset7,
  defaultPpctDataset8,
  defaultPpctDataset9,
} from '../data/defaultData';

interface UploadPpctModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDataset: (dataset: PpctDataset) => void;
  initialGrade?: string;
}

export const UploadPpctModal: React.FC<UploadPpctModalProps> = ({
  isOpen,
  onClose,
  onAddDataset,
  initialGrade = '9',
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [academicYear, setAcademicYear] = useState<string>('2025 - 2026');
  const [schoolName, setSchoolName] = useState<string>('TRƯỜNG THCS NGUYỄN DU');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setErrorMessage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn file Word (.docx) hoặc Excel (.xlsx) trước khi tải lên.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsed = await parsePpctFile(selectedFile, {
        grade: selectedGrade,
        subject: 'Toán',
        academicYear,
        school: schoolName,
      });

      onAddDataset(parsed);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    } catch (err: any) {
      console.error('[UploadPpctModal] Lỗi xử lý file:', err);
      setErrorMessage(
        err?.message || 'Không thể đọc nội dung file. Vui lòng kiểm tra định dạng file Word (.docx) hoặc Excel (.xlsx).'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleData = () => {
    let sample: PpctDataset;
    switch (selectedGrade) {
      case '6':
        sample = { ...defaultPpctDataset6, id: `sample-k6-${Date.now()}` };
        break;
      case '7':
        sample = { ...defaultPpctDataset7, id: `sample-k7-${Date.now()}` };
        break;
      case '8':
        sample = { ...defaultPpctDataset8, id: `sample-k8-${Date.now()}` };
        break;
      case '9':
      default:
        sample = { ...defaultPpctDataset9, id: `sample-k9-${Date.now()}` };
        break;
    }

    sample.academicYear = academicYear;
    if (schoolName) sample.school = schoolName;

    onAddDataset(sample);
    onClose();
  };

  const gradeOptions = [
    { grade: '6', label: 'Khối 6', desc: 'Lớp 6 — 140 tiết (35 tuần)' },
    { grade: '7', label: 'Khối 7', desc: 'Lớp 7 — 140 tiết (35 tuần)' },
    { grade: '8', label: 'Khối 8', desc: 'Lớp 8 — 140 tiết (35 tuần)' },
    { grade: '9', label: 'Khối 9', desc: 'Lớp 9 — 140 tiết (35 tuần)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Upload className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Tùy chỉnh Khối & Tải lên PPCT Môn Toán
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Nhận diện chính xác môn Toán chuẩn 140 tiết / 35 tuần (Chương trình GDPT 2018)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: Chọn Khối lớp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Bước 1: Chọn Khối lớp để phân phối</span>
              <span className="text-emerald-700 font-semibold normal-case">Đang chọn: Khối {selectedGrade}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {gradeOptions.map((opt) => {
                const isSelected = selectedGrade === opt.grade;
                return (
                  <button
                    key={opt.grade}
                    type="button"
                    onClick={() => handleGradeChange(opt.grade)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-700/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">140 tiết</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Thông tin môn học & chuẩn thời lượng */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-slate-800">Môn học:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Toán (Toán {selectedGrade})
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tổng số: <strong className="text-emerald-800 font-bold">140 tiết</strong> / 35 tuần</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Năm học áp dụng</span>
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2025 - 2026"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tên trường THCS</span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="TRƯỜNG THCS NGUYỄN DU"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic leading-relaxed">
              * Quy định GDPT 2018: Học kỳ I có 18 tuần × 4 tiết = 72 tiết; Học kỳ II có 17 tuần × 4 tiết = 68 tiết.
            </p>
          </div>

          {/* Step 3: Chọn file Word / Excel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Bước 2: Chọn hoặc kéo thả file PPCT (Word .docx / Excel .xlsx)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".docx,.doc,.xlsx,.xls,.csv"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Bấm để đổi file khác
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Bấm để chọn file Word (.docx) hoặc Excel (.xlsx)
                  </p>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ file Word kế hoạch giáo dục môn Toán, file Excel phân phối chương trình 140 tiết
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dùng mẫu thử nghiệm Toán {selectedGrade} (140 tiết)</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isProcessing}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang nhận diện & nạp 140 tiết...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tải lên PPCT Khối {selectedGrade}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
