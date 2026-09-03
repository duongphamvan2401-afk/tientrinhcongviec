import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, Trash2, Edit3, Plus, Download, FileText, ChevronRight, ListOrdered } from 'lucide-react';
import { PpctDataset } from '../types';
import { parsePpctFile } from '../utils/fileParser';

interface PpctSidebarProps {
  datasets: PpctDataset[];
  activeDatasetId: string;
  onSelectDataset: (id: string) => void;
  onAddDataset: (dataset: PpctDataset) => void;
  onDeleteDataset: (id: string) => void;
  onUpdateDatasetName: (id: string, newName: string) => void;
  onUpdateAcademicYear?: (id: string, newYear: string) => void;
  onOpenManualEditor: () => void;
  onOpenFullPpct: () => void;
  onExportPpctExcel: () => void;
  onOpenUploadModal?: (grade?: string) => void;
}

export const PpctSidebar: React.FC<PpctSidebarProps> = ({
  datasets,
  activeDatasetId,
  onSelectDataset,
  onAddDataset,
  onDeleteDataset,
  onUpdateDatasetName,
  onUpdateAcademicYear,
  onOpenManualEditor,
  onOpenFullPpct,
  onExportPpctExcel,
  onOpenUploadModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const parsed = await parsePpctFile(file);
        onAddDataset(parsed);
      } catch (err: any) {
        console.warn('[PPCT Parser] Thông báo đọc file:', file.name, err?.message || err);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-700" />
          <span>Phân phối chương trình</span>
        </h2>
      </div>

      {/* Primary Grade-Customized Upload Button */}
      <div className="space-y-2 mb-4">
        <button
          onClick={() => (onOpenUploadModal ? onOpenUploadModal() : fileInputRef.current?.click())}
          className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow"
        >
          <Upload className="w-4 h-4 text-emerald-200" />
          <span>Tùy chỉnh Khối & Tải lên PPCT</span>
        </button>

        {/* Quick Grade Selection Chips */}
        <div className="flex items-center justify-between gap-1 pt-1">
          <span className="text-[11px] text-slate-500 font-medium">Chọn nhanh khối:</span>
          <div className="flex items-center gap-1">
            {['6', '7', '8', '9'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => (onOpenUploadModal ? onOpenUploadModal(grade) : null)}
                className="px-2 py-0.5 text-xs font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-md border border-slate-200 transition-colors"
                title={`Tải lên PPCT Toán Khối ${grade}`}
              >
                K{grade}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fallback direct file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".xlsx,.xls,.csv,.doc,.docx"
        className="hidden"
      />

      {/* Datasets list */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-slate-600">
            PPCT trong hệ thống ({datasets.length})
          </label>
        </div>

        {datasets.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
            <p className="text-xs text-slate-500">Chưa có PPCT nào được tải lên</p>
            <button
              type="button"
              onClick={() => onOpenUploadModal?.()}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
            >
              + Chọn khối & tải lên ngay
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {datasets.map((dataset) => {
              const isSelected = dataset.id === activeDatasetId;
              const totalPeriods =
                dataset.lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0) ||
                dataset.totalLessons ||
                140;
              return (
                <div
                  key={dataset.id}
                  onClick={() => onSelectDataset(dataset.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="truncate">{dataset.name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {totalPeriods} tiết
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDataset(dataset.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                      title="Xóa PPCT này khỏi hệ thống"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút Xem toàn bộ PPCT tổng quát */}
        <button
          onClick={onOpenFullPpct}
          disabled={datasets.length === 0}
          className="w-full mt-2.5 py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow group"
        >
          <ListOrdered className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
          <span>Xem toàn bộ PPCT (Tổng quát cả năm)</span>
        </button>
      </div>

      {/* Display name input */}
      {activeDataset && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Tên hiển thị (khối/lớp)
          </label>
          <input
            type="text"
            value={activeDataset.name}
            onChange={(e) => onUpdateDatasetName(activeDataset.id, e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>
      )}

      {/* Academic Year input */}
      {activeDataset && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center justify-between">
            <span>Năm học áp dụng</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Tùy chỉnh</span>
          </label>
          <input
            type="text"
            value={activeDataset.academicYear || '2025 - 2026'}
            onChange={(e) => onUpdateAcademicYear?.(activeDataset.id, e.target.value)}
            placeholder="2025 - 2026"
            className="w-full bg-slate-50/80 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none font-medium"
          />
        </div>
      )}

      {/* Manual data editor trigger & actions */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <button
          onClick={onOpenManualEditor}
          className="text-xs text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-1.5 transition-colors group"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          <span>Chỉnh sửa / Dán dữ liệu PPCT thủ công</span>
        </button>

        <button
          onClick={onExportPpctExcel}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Xuất toàn bộ PPCT & Lịch KT ra Excel</span>
        </button>
      </div>
    </div>
  );
};
