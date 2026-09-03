import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link2,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { LessonPlan, PpctDataset } from '../../types';
import { generateCV5512LessonPlan } from '../../data/standardLessonPlanTemplates';

interface LessonPlanUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDataset: PpctDataset;
  onSaveLessonPlan: (plan: LessonPlan) => void;
  onOpenBatchTermModal?: () => void;
}

export const LessonPlanUploadModal: React.FC<LessonPlanUploadModalProps> = ({
  isOpen,
  onClose,
  activeDataset,
  onSaveLessonPlan,
  onOpenBatchTermModal,
}) => {
  const [tab, setTab] = useState<'link' | 'upload' | 'template'>('link');
  const [lessonTitle, setLessonTitle] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [grade, setGrade] = useState(activeDataset?.grade || '9');
  const [periods, setPeriods] = useState<number>(2);
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [externalLink, setExternalLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Lấy danh sách các bài học gợi ý từ PPCT hiện tại
  const availableLessons: string[] = Array.from(
    new Set(
      (activeDataset?.lessons || [])
        .map((l) => l.tenBaiHoc)
        .filter((name): name is string => Boolean(name && name.trim().length > 0))
    )
  );

  const handleSelectLessonSuggestion = (name: string) => {
    setLessonTitle(name);
    const found = activeDataset.lessons.find((l) => l.tenBaiHoc === name);
    if (found) {
      if (found.chuDe) setChapterName(found.chuDe);
      if (found.thoiLuongTiet) setPeriods(found.thoiLuongTiet);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!lessonTitle) {
        const clean = file.name.replace(/\.[^/.]+$/, '').replace(/KHBD_|KHBD/i, '').replace(/_/g, ' ');
        setLessonTitle(clean);
      }
    }
  };

  const handleSubmit = () => {
    setErrorMsg('');
    if (!lessonTitle.trim()) {
      setErrorMsg('Vui lòng nhập hoặc chọn Tên bài dạy!');
      return;
    }

    if (tab === 'link') {
      if (!externalLink.trim()) {
        setErrorMsg('Vui lòng nhập đường link chứa kế hoạch bài dạy!');
        return;
      }

      // Tạo lesson plan với link
      const basePlan = generateCV5512LessonPlan({
        lessonTitle: lessonTitle.trim(),
        chapterName: chapterName || 'CHƯƠNG TRÌNH MÔN TOÁN',
        grade,
        periods,
        weekNumber,
        schoolName: 'TRƯỜNG THCS LÊ QUÝ ĐÔN',
      });

      const finalPlan: LessonPlan = {
        ...basePlan,
        sourceType: 'external_link',
        externalLink: externalLink.trim(),
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
      };

      onSaveLessonPlan(finalPlan);
      setSuccessMsg('Đã lưu Kế hoạch bài dạy với liên kết trực tuyến thành công!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else if (tab === 'upload') {
      if (!uploadedFile) {
        setErrorMsg('Vui lòng chọn file Kế hoạch bài dạy (.docx, .doc, .pdf, .txt)!');
        return;
      }

      const basePlan = generateCV5512LessonPlan({
        lessonTitle: lessonTitle.trim(),
        chapterName: chapterName || 'CHƯƠNG TRÌNH MÔN TOÁN',
        grade,
        periods,
        weekNumber,
        schoolName: 'TRƯỜNG THCS LÊ QUÝ ĐÔN',
      });

      const finalPlan: LessonPlan = {
        ...basePlan,
        sourceType: 'uploaded_file',
        sourceFileName: uploadedFile.name,
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
      };

      onSaveLessonPlan(finalPlan);
      setSuccessMsg(`Đã tải lên và lưu kế hoạch bài dạy "${uploadedFile.name}" thành công!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // Chuẩn CV 5512
      const basePlan = generateCV5512LessonPlan({
        lessonTitle: lessonTitle.trim(),
        chapterName: chapterName || 'CHƯƠNG TRÌNH MÔN TOÁN',
        grade,
        periods,
        weekNumber,
        schoolName: 'TRƯỜNG THCS LÊ QUÝ ĐÔN',
      });

      onSaveLessonPlan(basePlan);
      setSuccessMsg('Đã tạo thành công Kế hoạch bài dạy theo mẫu chuẩn Công văn 5512!');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Thêm Kế Hoạch Bài Dạy (KHBD / Giáo Án)
              </h3>
              <p className="text-xs text-emerald-200">
                Nhập link trực tuyến, tải file lên hoặc tạo nhanh mẫu chuẩn Công văn 5512 Bộ GD&ĐT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => { setTab('link'); setErrorMsg(''); }}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'link'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>1. Nhập Link Trực Tuyến</span>
          </button>

          <button
            onClick={() => { setTab('upload'); setErrorMsg(''); }}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'upload'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Tải File Word/PDF</span>
          </button>

          <button
            onClick={() => { setTab('template'); setErrorMsg(''); }}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              tab === 'template'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Mẫu Chuẩn CV 5512</span>
          </button>
        </div>

        {/* Quick Shortcut for Batch Term 1 Link */}
        {onOpenBatchTermModal && (
          <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="font-bold text-amber-950 block">
                  Nhập link cho cả Tập 1 (Tất cả nội dung)?
                </span>
                <span className="text-[11px] text-slate-600">
                  Hệ thống tự động nhận dạng toàn bộ bài học & chương phù hợp theo PPCT, không cần nhập từng bài.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBatchTermModal();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 flex-shrink-0 transition-all shadow-xs"
            >
              <span>Mở Nhập Cả Tập 1 &rarr;</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: NHẬP LINK */}
          {tab === 'link' && (
            <div className="space-y-3.5 bg-sky-50/50 p-4 rounded-xl border border-sky-200">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Đường dẫn (URL / Link) Kế hoạch bài dạy:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... hoặc OneDrive, Google Docs"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900 font-mono text-xs"
                  />
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Thầy/Cô có thể dán link Google Drive (chia sẻ công khai hoặc nội bộ), link OneDrive, link kho học liệu trực tuyến của nhà trường.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TẢI FILE */}
          {tab === 'upload' && (
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".docx, .doc, .pdf, .txt"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-400 bg-white hover:bg-emerald-50/40 p-6 rounded-2xl text-center cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  {uploadedFile ? uploadedFile.name : 'Bấm vào đây để chọn file Kế hoạch bài dạy'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hỗ trợ các định dạng file: Microsoft Word (.docx, .doc), PDF (.pdf) hoặc Text (.txt)
                </p>
                {uploadedFile && (
                  <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                    Đã chọn file: {(uploadedFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MẪU CHUẨN CV 5512 */}
          {tab === 'template' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Mẫu Kế hoạch bài dạy Công văn 5512/BGDĐT-GDTrH</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Hệ thống tự động biên soạn KHBD chuẩn cấu trúc 4 bước của Bộ Giáo dục và Đào tạo:
                <strong> Mục tiêu (Kiến thức, Năng lực, Phẩm chất)</strong> &bull;
                <strong> Thiết bị & Học liệu</strong> &bull;
                <strong> 4 Hoạt động dạy học (Khởi động, Hình thành KT, Luyện tập, Vận dụng)</strong> &bull;
                <strong> Phiếu học tập & Rubrics đánh giá</strong>.
              </p>
            </div>
          )}

          {/* THÔNG TIN BÀI DẠY */}
          <div className="space-y-3 pt-2">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
              Thông Tin Chi Tiết Bài Học:
            </h4>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tên bài dạy / Bài học:
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ví dụ: BÀI 1: PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold text-slate-900"
              />

              {/* Gợi ý bài học từ PPCT */}
              {availableLessons.length > 0 && (
                <div className="mt-2">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    Gợi ý bài từ PPCT đang chọn:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                    {availableLessons.slice(0, 8).map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectLessonSuggestion(name)}
                        className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-md text-[10px] truncate max-w-[200px]"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Khối Lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="6">Khối 6</option>
                  <option value="7">Khối 7</option>
                  <option value="8">Khối 8</option>
                  <option value="9">Khối 9</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Tiết Thực Hiện:</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={periods}
                  onChange={(e) => setPeriods(parseInt(e.target.value, 10) || 2)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tuần PPCT:</label>
                <input
                  type="number"
                  min={1}
                  max={35}
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Hủy Bỏ
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {tab === 'link'
                ? 'Lưu Kế Hoạch Bài Dạy (Link)'
                : tab === 'upload'
                ? 'Lưu File Kế Hoạch Bài Dạy'
                : 'Tạo Kế Hoạch Bài Dạy Chuẩn 5512'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
