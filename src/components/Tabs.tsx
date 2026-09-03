import React, { useRef } from 'react';
import { Gauge, Table2, BookOpen, Plus, Upload, Check, BookMarked, GraduationCap, ListOrdered } from 'lucide-react';
import { PpctDataset, TabType } from '../types';
import { parsePpctFile } from '../utils/fileParser';

export type { TabType };

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  matrixRowCount?: number;
  datasets?: PpctDataset[];
  activeDatasetId?: string;
  onSelectDataset?: (id: string) => void;
  onAddDataset?: (dataset: PpctDataset) => void;
  onOpenUploadModal?: (grade?: string) => void;
  onOpenSgkManager?: () => void;
  onOpenFullPpct?: () => void;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onTabChange,
  matrixRowCount = 0,
  datasets = [],
  activeDatasetId = '',
  onSelectDataset,
  onAddDataset,
  onOpenUploadModal,
  onOpenSgkManager,
  onOpenFullPpct,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onAddDataset) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const parsed = await parsePpctFile(files[i]);
        onAddDataset(parsed);
      } catch (err: any) {
        console.warn('[PPCT Parser] Thông báo nạp file:', files[i]?.name, err?.message || err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200">
      {/* Primary Navigation Mode (Tiến độ & Ma trận & GVCN & SGK) */}
      <div className="inline-flex items-center gap-2 flex-wrap">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onTabChange('progress')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'progress'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Gauge className="w-4 h-4 text-emerald-600" />
            <span>Tiến độ & Lịch kiểm tra</span>
          </button>

          <button
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'matrix'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Table2 className="w-4 h-4 text-emerald-600" />
            <span>Ma trận đề kiểm tra</span>
            {matrixRowCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {matrixRowCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('exam_builder')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'exam_builder'
                ? 'bg-white text-indigo-800 shadow-xs border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Tạo đề kiểm tra</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full">
              Chuẩn BGD
            </span>
          </button>

          <button
            onClick={() => onTabChange('gvcn')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'gvcn'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Công tác GVCN</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              Lớp 9A1
            </span>
          </button>
        </div>

        {onOpenFullPpct && (
          <button
            onClick={onOpenFullPpct}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Xem toàn bộ Phân phối chương trình cả năm để có cái nhìn tổng quát"
          >
            <ListOrdered className="w-4 h-4 text-emerald-200" />
            <span>Toàn bộ PPCT</span>
          </button>
        )}

        {onOpenSgkManager && (
          <button
            onClick={onOpenSgkManager}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300/80 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            title="Quản lý & Tải lên Sách Giáo Khoa Toán Tập 1, Tập 2 (PDF, Excel) để bám sát Yêu cầu cần đạt"
          >
            <BookMarked className="w-4 h-4 text-emerald-700" />
            <span>Sách Giáo Khoa (Tập 1, 2)</span>
          </button>
        )}
      </div>

      {/* Multi-PPCT Dataset Tabs (Khối lớp) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <span className="text-xs text-slate-500 mr-1 hidden sm:inline flex-shrink-0 font-medium">
          PPCT Tabs:
        </span>

        {datasets.map((dataset) => {
          const isSelected = dataset.id === activeDatasetId;
          return (
            <button
              key={dataset.id}
              onClick={() => onSelectDataset?.(dataset.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title={`Môn ${dataset.subject || 'Toán'} - Khối ${dataset.grade || 'Chưa rõ'} (${dataset.totalLessons || dataset.lessons.length} tiết)`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`} />
              <span>{dataset.name}</span>
              {dataset.grade && (
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  K{dataset.grade}
                </span>
              )}
            </button>
          );
        })}

        {/* Nút Tùy chỉnh Khối & Tải lên PPCT */}
        {onAddDataset && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => (onOpenUploadModal ? onOpenUploadModal() : fileInputRef.current?.click())}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs hover:shadow-xs flex-shrink-0"
              title="Tùy chỉnh khối và tải lên file PPCT môn Toán (140 tiết)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-200" />
              <span>+ Tải lên PPCT theo Khối</span>
            </button>

            {/* 4 Grade Quick Buttons */}
            {['6', '7', '8', '9'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => onOpenUploadModal?.(grade)}
                className="px-2 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 rounded-md transition-colors"
                title={`Tải lên PPCT Toán Khối ${grade}`}
              >
                K{grade}
              </button>
            ))}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".xlsx,.xls,.csv,.doc,.docx"
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};

