import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  BookMarked,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  Globe,
  Link2,
  FileDown,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { SgkBook, SgkChapter, SgkLesson, PpctDataset } from '../types';
import {
  parseSgkFile,
  generateSampleSgkExcel,
  recognizeSgkFromUrl,
  OFFICIAL_SGK_LINKS,
  exportSgkToExcel,
  exportSgkToJson,
  exportSgkToDocx,
} from '../utils/sgkParser';

interface SgkManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sgkBooks: SgkBook[];
  activePpct: PpctDataset;
  onUpdateSgkBooks: (books: SgkBook[]) => void;
  onLinkSgkToPpct: (ppctId: string, volume1Id?: string, volume2Id?: string) => void;
  onApplySgkToMatrix?: (bookId: string, volume: 1 | 2 | 'all') => void;
}

export const SgkManagerModal: React.FC<SgkManagerModalProps> = ({
  isOpen,
  onClose,
  sgkBooks,
  activePpct,
  onUpdateSgkBooks,
  onLinkSgkToPpct,
  onApplySgkToMatrix,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVolumeTab, setActiveVolumeTab] = useState<1 | 2>(1);
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    const defaultBook = sgkBooks.find((b) => b.volume === 1);
    return defaultBook ? defaultBook.id : sgkBooks[0]?.id || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lesson: SgkLesson } | null>(null);

  // URL input & recognition state
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [sourceMode, setSourceMode] = useState<'link' | 'upload' | 'export'>('link');

  if (!isOpen) return null;

  // Filter books matching current volume tab
  const booksInVolume = sgkBooks.filter((b) => b.volume === activeVolumeTab);
  
  // Find currently active book or fallback
  const currentBook =
    sgkBooks.find((b) => b.id === selectedBookId && b.volume === activeVolumeTab) ||
    booksInVolume[0] ||
    sgkBooks[0];

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadMessage(null);
      const parsedBook = await parseSgkFile(file);
      parsedBook.volume = activeVolumeTab; // Associate with current volume tab
      
      const newBooks = [...sgkBooks, parsedBook];
      onUpdateSgkBooks(newBooks);
      setSelectedBookId(parsedBook.id);
      
      // Auto-link to active PPCT
      if (activeVolumeTab === 1) {
        onLinkSgkToPpct(activePpct.id, parsedBook.id, activePpct.sgkVolume2Id);
      } else {
        onLinkSgkToPpct(activePpct.id, activePpct.sgkVolume1Id, parsedBook.id);
      }

      setUploadMessage(`Đã nạp thành công bộ SGK "${parsedBook.title}" (${parsedBook.chapters.length} chương, ${parsedBook.chapters.reduce((s, c) => s + c.lessons.length, 0)} bài học)!`);
    } catch (err: any) {
      console.error('Error uploading SGK file:', err);
      setUploadMessage(`Lỗi khi đọc file: ${err.message || 'Định dạng không hợp lệ'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRecognizeUrl = async (customUrl?: string) => {
    const targetUrl = (customUrl || urlInput).trim();
    if (!targetUrl) {
      setUploadMessage('Vui lòng nhập hoặc chọn một đường link SGK chính thống.');
      return;
    }

    try {
      setIsProcessingUrl(true);
      setUploadMessage('Đang kết nối trang chính thống và phân tích dữ liệu SGK...');

      const result = await recognizeSgkFromUrl(targetUrl, activeVolumeTab, activePpct.grade);
      const parsedBook = result.book;
      parsedBook.volume = activeVolumeTab;

      // Check if book already exists in list, if so update it, else append
      const existingIdx = sgkBooks.findIndex(
        (b) => b.id === parsedBook.id || (b.title === parsedBook.title && b.volume === parsedBook.volume)
      );
      let newBooks: SgkBook[];
      if (existingIdx >= 0) {
        newBooks = [...sgkBooks];
        newBooks[existingIdx] = parsedBook;
      } else {
        newBooks = [...sgkBooks, parsedBook];
      }

      onUpdateSgkBooks(newBooks);
      setSelectedBookId(parsedBook.id);

      // Auto-link to active PPCT
      if (activeVolumeTab === 1) {
        onLinkSgkToPpct(activePpct.id, parsedBook.id, activePpct.sgkVolume2Id);
      } else {
        onLinkSgkToPpct(activePpct.id, activePpct.sgkVolume1Id, parsedBook.id);
      }

      setUploadMessage(result.message);
      if (!customUrl) setUrlInput('');
    } catch (err: any) {
      console.error('Error recognizing SGK from URL:', err);
      setUploadMessage(`Không thể nhận diện: ${err.message || 'Lỗi kết nối'}`);
    } finally {
      setIsProcessingUrl(false);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (sgkBooks.length <= 2) {
      alert('Không thể xóa bộ sách giáo khoa mặc định chuẩn.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa bộ sách giáo khoa này?')) {
      const remaining = sgkBooks.filter((b) => b.id !== bookId);
      onUpdateSgkBooks(remaining);
      const fallback = remaining.find((b) => b.volume === activeVolumeTab);
      if (fallback) setSelectedBookId(fallback.id);
    }
  };

  const handleSaveEditedLesson = () => {
    if (!editingLesson || !currentBook) return;

    const updatedChapters = currentBook.chapters.map((ch) => {
      if (ch.id === editingLesson.chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map((l) =>
            l.id === editingLesson.lesson.id ? editingLesson.lesson : l
          ),
        };
      }
      return ch;
    });

    const updatedBook = {
      ...currentBook,
      chapters: updatedChapters,
    };

    const updatedBooks = sgkBooks.map((b) => (b.id === updatedBook.id ? updatedBook : b));
    onUpdateSgkBooks(updatedBooks);
    setEditingLesson(null);
    setUploadMessage('Đã lưu các thay đổi yêu cầu cần đạt cho bài học.');
  };

  const handleApplyToMatrix = () => {
    if (onApplySgkToMatrix && currentBook) {
      onApplySgkToMatrix(currentBook.id, activeVolumeTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between flex-shrink-0 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
              <BookOpen className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Quản lý Sách Giáo Khoa & Yêu Cầu Cần Đạt (SGK Toán)
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Tải lên SGK Tập 1, Tập 2 để ma trận & bảng đặc tả đề kiểm tra bám sát 100% cấu trúc nội dung và yêu cầu cần đạt GDPT 2018
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Tabs: Tập 1 (Học kỳ I) vs Tập 2 (Học kỳ II) */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveVolumeTab(1);
                const book1 = sgkBooks.find((b) => b.volume === 1);
                if (book1) setSelectedBookId(book1.id);
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
                activeVolumeTab === 1
                  ? 'bg-white text-emerald-900 border-slate-200 shadow-2xs font-semibold'
                  : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <BookMarked className={`w-4 h-4 ${activeVolumeTab === 1 ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>SGK TOÁN TẬP 1 (HỌC KỲ I — 72 TIẾT)</span>
              {activePpct.sgkVolume1Id && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã liên kết với PPCT" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveVolumeTab(2);
                const book2 = sgkBooks.find((b) => b.volume === 2);
                if (book2) setSelectedBookId(book2.id);
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
                activeVolumeTab === 2
                  ? 'bg-white text-emerald-900 border-slate-200 shadow-2xs font-semibold'
                  : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <BookMarked className={`w-4 h-4 ${activeVolumeTab === 2 ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>SGK TOÁN TẬP 2 (HỌC KỲ II — 68 TIẾT)</span>
              {activePpct.sgkVolume2Id && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã liên kết với PPCT" />
              )}
            </button>
          </div>

          {/* Mode Switcher: Link vs File vs Export */}
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={() => setSourceMode('link')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                sourceMode === 'link'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Nhập Link chính thống</span>
            </button>

            <button
              onClick={() => setSourceMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                sourceMode === 'upload'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file lên</span>
            </button>

            <button
              onClick={() => setSourceMode('export')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                sourceMode === 'export'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu SGK</span>
            </button>
          </div>
        </div>

        {/* Dynamic Source Panel based on active sourceMode */}
        {sourceMode === 'link' && (
          <div className="px-6 py-3.5 bg-emerald-50/70 border-b border-emerald-200/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Dán link SGK từ trang chính thống (Hành Trang Số: hanhtrangso.nxbgd.vn, Hoc10: hoc10.vn, hoclieu.vn, hoặc link PDF)..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRecognizeUrl();
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono shadow-2xs"
                />
                {urlInput && (
                  <button
                    onClick={() => setUrlInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => handleRecognizeUrl()}
                disabled={isProcessingUrl || !urlInput.trim()}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all flex-shrink-0"
              >
                {isProcessingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Đang kết nối & nhận diện...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Đọc & Nhận diện SGK</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets from Authorized Educational Portals */}
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <span className="font-semibold text-emerald-950 flex items-center gap-1">
                <Link2 className="w-3 h-3 text-emerald-700" />
                <span>Trang chính thống mẫu:</span>
              </span>

              {OFFICIAL_SGK_LINKS.filter((item) => item.volume === activeVolumeTab).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setUrlInput(preset.url);
                    handleRecognizeUrl(preset.url);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300/80 rounded-md font-medium transition-all shadow-2xs text-[11px]"
                  title={`Tự động đọc và nạp: ${preset.title} (${preset.publisher})`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{preset.sourcePortal}: {preset.seriesName}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                </button>
              ))}

              <button
                onClick={() => {
                  const hocLieu = OFFICIAL_SGK_LINKS.find((l) => l.id === 'link-hoclieu-9');
                  if (hocLieu) {
                    setUrlInput(hocLieu.url);
                    handleRecognizeUrl(hocLieu.url);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300/80 rounded-md font-medium transition-all shadow-2xs text-[11px]"
              >
                <span>Học liệu số Bộ GD&ĐT</span>
              </button>
            </div>
          </div>
        )}

        {sourceMode === 'upload' && (
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,.json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-2xs disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-emerald-200" />
                <span>{isUploading ? 'Đang đọc file...' : `Chọn tệp tải lên (Word, PDF, Excel, JSON)`}</span>
              </button>

              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-slate-700">Định dạng hỗ trợ:</span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-mono">.docx</span>
                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-mono">.pdf</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-mono">.xlsx</span>
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-mono">.json</span>
              </div>
            </div>

            <button
              onClick={() => generateSampleSgkExcel(activeVolumeTab)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs"
              title="Tải file mẫu Excel chuẩn để soạn danh mục bài & YCCĐ"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Tải file Excel mẫu chuẩn</span>
            </button>
          </div>
        )}

        {sourceMode === 'export' && (
          <div className="px-6 py-3.5 bg-blue-50/60 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-blue-950 font-medium">
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>Xuất dữ liệu bộ sách đang chọn: <strong>{currentBook?.title}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => currentBook && exportSgkToExcel(currentBook)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Xuất danh mục và yêu cầu cần đạt 3 mức độ ra file Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => currentBook && exportSgkToDocx(currentBook)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Xuất bảng danh mục YCCĐ ra file Word để in ấn và nộp tổ chuyên môn"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xuất Word (.doc)</span>
              </button>

              <button
                onClick={() => currentBook && exportSgkToJson(currentBook)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Xuất file JSON sao lưu"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất JSON</span>
              </button>
            </div>
          </div>
        )}

        {/* Message notification if any */}
        {uploadMessage && (
          <div className="px-6 py-2.5 bg-emerald-100/80 border-b border-emerald-300 text-xs text-emerald-900 flex items-center justify-between animate-fade-in font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{uploadMessage}</span>
            </div>
            <button onClick={() => setUploadMessage(null)} className="text-emerald-800 hover:text-emerald-950 p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 bg-slate-50/50">
          
          {/* Left Column: Sgk Book Selector & Information */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bộ sách SGK Tập {activeVolumeTab}
                </h3>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  {booksInVolume.length} bộ sách
                </span>
              </div>

              <div className="space-y-2">
                {booksInVolume.map((book) => {
                  const isSelected = currentBook?.id === book.id;
                  const isLinked =
                    activeVolumeTab === 1
                      ? activePpct.sgkVolume1Id === book.id
                      : activePpct.sgkVolume2Id === book.id;

                  const totalChapters = book.chapters.length;
                  const totalLessons = book.chapters.reduce((sum, c) => sum + c.lessons.length, 0);

                  return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-slate-900 leading-snug">
                          {book.title}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <span>{totalChapters} chương</span>
                        <span>•</span>
                        <span>{totalLessons} bài học</span>
                        <span>•</span>
                        <span className="truncate max-w-[110px]">{book.publisher}</span>
                      </div>

                      {book.sourceUrl && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-mono truncate">
                          <Globe className="w-2.5 h-2.5 text-emerald-700 flex-shrink-0" />
                          <span className="truncate">{book.sourceUrl.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}

                      {isLinked ? (
                        <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đang liên kết với PPCT {activePpct.grade}</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeVolumeTab === 1) {
                              onLinkSgkToPpct(activePpct.id, book.id, activePpct.sgkVolume2Id);
                            } else {
                              onLinkSgkToPpct(activePpct.id, activePpct.sgkVolume1Id, book.id);
                            }
                            setUploadMessage(`Đã liên kết bộ SGK "${book.title}" với PPCT môn ${activePpct.subject} K${activePpct.grade}!`);
                          }}
                          className="mt-2.5 text-[11px] text-emerald-800 hover:text-emerald-950 font-medium hover:underline flex items-center gap-1"
                        >
                          <span>Gán làm SGK chính cho PPCT</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {book.series === 'custom' && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id);
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa sách này</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instruction Box */}
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Cách thức hoạt động:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900/90">
                1. Hệ thống tự động ánh xạ bài học trong Phân phối chương trình (PPCT) với từng bài trong SGK tương ứng (Tập 1 cho HK1, Tập 2 cho HK2).
              </p>
              <p className="leading-relaxed text-[11px] text-amber-900/90">
                2. Khi tạo <strong>Ma trận</strong> & <strong>Bảng đặc tả đề kiểm tra</strong> (Phụ lục 1 & 2), các Yêu cầu cần đạt chuẩn (Biết, Hiểu, Vận dụng) sẽ được nạp trực tiếp từ bộ SGK đã chọn.
              </p>
            </div>
          </div>

          {/* Right Column: Chapters, Lessons & Learning Objectives Viewer / Editor */}
          <div className="flex-1 space-y-4">
            
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm bài học, chương, hoặc YCCĐ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {onApplySgkToMatrix && (
                <button
                  onClick={handleApplyToMatrix}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                  title="Đồng bộ ngay các Yêu cầu cần đạt từ bộ SGK này vào Bảng đặc tả đề thi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Áp dụng vào Bảng đặc tả Ma trận</span>
                </button>
              )}
            </div>

            {/* Editing Lesson Modal / Inline Form if active */}
            {editingLesson && (
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-800" />
                    <span>Chỉnh sửa Yêu cầu cần đạt: {editingLesson.lesson.title}</span>
                  </div>
                  <button
                    onClick={() => setEditingLesson(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Tên bài học / Tiêu đề:
                    </label>
                    <input
                      type="text"
                      value={editingLesson.lesson.title}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          lesson: { ...editingLesson.lesson, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-emerald-900 block mb-1">
                      Yêu cầu cần đạt — Mức 1: Nhận biết
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.lesson.objectives.nhanBiet}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          lesson: {
                            ...editingLesson.lesson,
                            objectives: {
                              ...editingLesson.lesson.objectives,
                              nhanBiet: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-blue-900 block mb-1">
                      Yêu cầu cần đạt — Mức 2: Thông hiểu
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.lesson.objectives.thongHieu}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          lesson: {
                            ...editingLesson.lesson,
                            objectives: {
                              ...editingLesson.lesson.objectives,
                              thongHieu: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-purple-900 block mb-1">
                      Yêu cầu cần đạt — Mức 3: Vận dụng (và Vận dụng cao)
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.lesson.objectives.vanDung}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          lesson: {
                            ...editingLesson.lesson,
                            objectives: {
                              ...editingLesson.lesson.objectives,
                              vanDung: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSaveEditedLesson}
                      className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chapters & Lessons Accordion List */}
            {currentBook ? (
              <div className="space-y-3">
                {currentBook.chapters.map((chapter) => {
                  const isExpanded = expandedChapters[chapter.id] !== false; // Default expanded

                  // Filter lessons in chapter by search query
                  const filteredLessons = chapter.lessons.filter((l) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (l.title || '').toLowerCase().includes(q) ||
                      (chapter.title || '').toLowerCase().includes(q) ||
                      (l.objectives?.nhanBiet || '').toLowerCase().includes(q) ||
                      (l.objectives?.thongHieu || '').toLowerCase().includes(q) ||
                      (l.objectives?.vanDung || '').toLowerCase().includes(q)
                    );
                  });

                  if (searchQuery && filteredLessons.length === 0) return null;

                  return (
                    <div
                      key={chapter.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                    >
                      {/* Chapter Header */}
                      <div
                        onClick={() => toggleChapter(chapter.id)}
                        className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-200/80"
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <div>
                            <span className="font-bold text-xs text-slate-900">
                              {chapter.title}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2 font-mono">
                              ({chapter.totalPeriods} tiết • {chapter.lessons.length} bài)
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            chapter.branch === 'DaiSo'
                              ? 'bg-blue-100 text-blue-800'
                              : chapter.branch === 'HinhHoc'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {chapter.branch === 'DaiSo'
                            ? 'Đại số'
                            : chapter.branch === 'HinhHoc'
                            ? 'Hình học'
                            : 'Thống kê & XS'}
                        </span>
                      </div>

                      {/* Lesson Items */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 p-2">
                          {filteredLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3 hover:bg-slate-50/70 rounded-lg transition-colors space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-bold text-xs text-slate-900">
                                    {lesson.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium">
                                    Thời lượng: {lesson.periods} tiết {lesson.pageRange ? `• ${lesson.pageRange}` : ''}
                                  </div>
                                </div>

                                <button
                                  onClick={() => setEditingLesson({ chapterId: chapter.id, lesson })}
                                  className="px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors flex items-center gap-1"
                                  title="Chỉnh sửa chi tiết Yêu cầu cần đạt của bài này"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Sửa YCCĐ</span>
                                </button>
                              </div>

                              {/* 3 Cognitive Levels Requirements Preview */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                                <div className="bg-emerald-50/50 p-2 rounded-md border border-emerald-100">
                                  <div className="font-bold text-emerald-900 mb-0.5">Nhận biết:</div>
                                  <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                                    {lesson.objectives.nhanBiet}
                                  </div>
                                </div>

                                <div className="bg-blue-50/50 p-2 rounded-md border border-blue-100">
                                  <div className="font-bold text-blue-900 mb-0.5">Thông hiểu:</div>
                                  <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                                    {lesson.objectives.thongHieu}
                                  </div>
                                </div>

                                <div className="bg-purple-50/50 p-2 rounded-md border border-purple-100">
                                  <div className="font-bold text-purple-900 mb-0.5">Vận dụng:</div>
                                  <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                                    {lesson.objectives.vanDung}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                Chưa có bộ sách nào cho Tập {activeVolumeTab}. Hãy bấm "Tải lên SGK Tập {activeVolumeTab}" để nạp nội dung.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Đang chọn: <strong>{currentBook?.title}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
            {onApplySgkToMatrix && (
              <button
                onClick={handleApplyToMatrix}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Áp dụng vào Ma trận & Bảng đặc tả</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
