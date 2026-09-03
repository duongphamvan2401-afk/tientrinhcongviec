import React, { useState } from 'react';
import {
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Check,
  Printer,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { MatrixConfig, MatrixRow, SpecificationRow, SpecificationItem } from '../types';

interface SpecificationTableProps {
  config: MatrixConfig;
  matrixRows: MatrixRow[];
  specRows: SpecificationRow[];
  onUpdateSpecRows: (rows: SpecificationRow[]) => void;
  onSyncFromMatrix: () => void;
  onExportSpecWord: () => void;
  onExportFullWord: () => void;
  onPrintPreview: () => void;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({
  config,
  matrixRows,
  specRows,
  onUpdateSpecRows,
  onSyncFromMatrix,
  onExportSpecWord,
  onExportFullWord,
  onPrintPreview,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Form edit states
  const [tempYCCDat, setTempYCCDat] = useState<string>('');
  const [tempNlcBiet, setTempNlcBiet] = useState<string>('');
  const [tempNlcHieu, setTempNlcHieu] = useState<string>('');
  const [tempNlcVd, setTempNlcVd] = useState<string>('');
  const [tempDsBiet, setTempDsBiet] = useState<string>('');
  const [tempDsHieu, setTempDsHieu] = useState<string>('');
  const [tempDsVd, setTempDsVd] = useState<string>('');
  const [tempTlnBiet, setTempTlnBiet] = useState<string>('');
  const [tempTlnHieu, setTempTlnHieu] = useState<string>('');
  const [tempTlnVd, setTempTlnVd] = useState<string>('');
  const [tempTlBiet, setTempTlBiet] = useState<string>('');
  const [tempTlHieu, setTempTlHieu] = useState<string>('');
  const [tempTlVd, setTempTlVd] = useState<string>('');

  const startEditItem = (rowId: string, item: SpecificationItem) => {
    setEditingRowId(rowId);
    setEditingItemId(item.id);
    setTempYCCDat(item.yeuCauCanDat || '');
    setTempNlcBiet(item.nlc?.biet || '');
    setTempNlcHieu(item.nlc?.hieu || '');
    setTempNlcVd(item.nlc?.vanDung || '');
    setTempDsBiet(item.ds?.biet || '');
    setTempDsHieu(item.ds?.hieu || '');
    setTempDsVd(item.ds?.vanDung || '');
    setTempTlnBiet(item.tln?.biet || '');
    setTempTlnHieu(item.tln?.hieu || '');
    setTempTlnVd(item.tln?.vanDung || '');
    setTempTlBiet(item.tl?.biet || '');
    setTempTlHieu(item.tl?.hieu || '');
    setTempTlVd(item.tl?.vanDung || '');
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingRowId(null);
  };

  const saveEditItem = (rowId: string, itemId: string) => {
    const updated = specRows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          items: r.items.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  yeuCauCanDat: tempYCCDat,
                  nlc: { biet: tempNlcBiet, hieu: tempNlcHieu, vanDung: tempNlcVd },
                  ds: { biet: tempDsBiet, hieu: tempDsHieu, vanDung: tempDsVd },
                  tln: { biet: tempTlnBiet, hieu: tempTlnHieu, vanDung: tempTlnVd },
                  tl: { biet: tempTlBiet, hieu: tempTlHieu, vanDung: tempTlVd },
                }
              : it
          ),
        };
      }
      return r;
    });

    onUpdateSpecRows(updated);
    setEditingItemId(null);
    setEditingRowId(null);
  };

  const handleDeleteItem = (rowId: string, itemId: string) => {
    const updated = specRows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          items: r.items.filter((it) => it.id !== itemId),
        };
      }
      return r;
    });
    onUpdateSpecRows(updated);
  };

  const handleAddItem = (rowId: string, level: 'nhanBiet' | 'thongHieu' | 'vanDung') => {
    const levelLabels = {
      nhanBiet: 'Nhận biết' as const,
      thongHieu: 'Thông hiểu' as const,
      vanDung: 'Vận dụng' as const,
    };

    const newItem: SpecificationItem = {
      id: `spec-item-custom-${Date.now()}`,
      mucDo: level,
      mucDoLabel: levelLabels[level],
      yeuCauCanDat: `- Nêu và trình bày được yêu cầu cần đạt về nội dung này theo chương trình GDPT 2018.`,
      nlc: { biet: '', hieu: '', vanDung: '' },
      ds: { biet: '', hieu: '', vanDung: '' },
      tln: { biet: '', hieu: '', vanDung: '' },
      tl: { biet: '', hieu: '', vanDung: '' },
    };

    const updated = specRows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          items: [...r.items, newItem],
        };
      }
      return r;
    });
    onUpdateSpecRows(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mb-8">
      {/* Top Header & Actions */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Khung Bảng đặc tả đề kiểm tra (Phụ lục II)
            </h2>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              Chuẩn 16 cột Bộ GD&ĐT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Môn: <strong>{config.subject} {config.grade}</strong> | Đợt: <strong>{config.examPeriod}</strong> | Số lượng: <strong>{specRows.length} chủ đề / đơn vị kiến thức</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSyncFromMatrix}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Đồng bộ tự động các mức độ và số câu hỏi từ Khung Ma trận"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Đồng bộ từ Ma trận (PL I)</span>
          </button>

          <button
            onClick={onExportSpecWord}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất Bảng đặc tả (PL II)</span>
          </button>

          <button
            onClick={onExportFullWord}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
            title="Xuất cả Khung Ma trận (PL I) và Bảng đặc tả (PL II) vào 1 file Word"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Xuất Trọn bộ (PL I + PL II)</span>
          </button>

          <button
            onClick={onPrintPreview}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Document Banner */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 text-center">
        <p className="text-xs font-bold text-slate-500 tracking-wider">PHỤ LỤC II</p>
        <h3 className="text-sm font-bold text-slate-900 uppercase mt-0.5">
          KHUNG BẢNG ĐẶC TẢ ĐỀ KIỂM TRA {config.examPeriod.toUpperCase()}
        </h3>
        <p className="text-xs font-semibold text-slate-700">
          MÔN HỌC: {config.subject.toUpperCase()} — LỚP {config.grade} — NĂM HỌC {config.academicYear}
        </p>
        {config.officialDocumentRef?.trim() && (
          <p className="text-[11px] italic text-slate-500 mt-0.5">
            {config.officialDocumentRef}
          </p>
        )}
      </div>

      {/* Guidance Alert */}
      <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Cấu trúc bảng đặc tả 16 cột gồm: <strong>Nhiều lựa chọn</strong> (Biết, Hiểu, Vận dụng), <strong>“Đúng - sai”</strong> (Biết, Hiểu, Vận dụng), <strong>Trả lời ngắn</strong> (Biết, Hiểu, Vận dụng), và <strong>Tự luận</strong> (Biết, Hiểu, Vận dụng). Thầy/Cô có thể bấm vào <Edit3 className="w-3 h-3 inline text-slate-600" /> để sửa yêu cầu cần đạt hoặc số câu trực tiếp.
        </span>
      </div>

      {/* 16-Column Specification Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-800 border-collapse border border-slate-300">
          <thead>
            {/* Header Tier 1 */}
            <tr className="bg-slate-100 text-slate-800 font-semibold text-center border-b border-slate-300">
              <th rowSpan={4} className="py-2 px-2 border border-slate-300 w-10 text-center">
                TT
              </th>
              <th rowSpan={4} className="py-2 px-3 border border-slate-300 w-44 text-center font-bold">
                Chủ đề
              </th>
              <th rowSpan={4} className="py-2 px-3 border border-slate-300 w-48 text-center font-bold">
                Nội dung kiến thức
              </th>
              <th rowSpan={4} className="py-2 px-4 border border-slate-300 min-w-[280px] text-center font-bold">
                Yêu cầu cần đạt
              </th>
              <th colSpan={12} className="py-2 px-2 border border-slate-300 text-center font-bold bg-slate-200/80">
                Số câu hỏi ở các mức độ đánh giá
              </th>
              <th rowSpan={4} className="py-2 px-1 border border-slate-300 w-14 text-center">
                Sửa
              </th>
            </tr>

            {/* Header Tier 2 */}
            <tr className="bg-slate-100 text-slate-800 font-semibold text-center border-b border-slate-300">
              <th colSpan={9} className="py-1.5 px-2 border border-slate-300 text-center font-bold bg-blue-50/70">
                TNKQ
              </th>
              <th colSpan={3} className="py-1.5 px-2 border border-slate-300 text-center font-bold bg-purple-50/70">
                Tự luận
              </th>
            </tr>

            {/* Header Tier 3 */}
            <tr className="bg-slate-50 text-slate-700 font-medium text-center border-b border-slate-300 italic">
              <th colSpan={3} className="py-1 px-1 border border-slate-300 text-center">
                Nhiều lựa chọn
              </th>
              <th colSpan={3} className="py-1 px-1 border border-slate-300 text-center">
                “Đúng - sai”
              </th>
              <th colSpan={3} className="py-1 px-1 border border-slate-300 text-center">
                Trả lời ngắn
              </th>
              <th colSpan={3} className="py-1 px-1 border border-slate-300 text-center">
                Tự luận
              </th>
            </tr>

            {/* Header Tier 4: Cognitive levels */}
            <tr className="bg-slate-100 text-slate-800 font-medium text-center border-b border-slate-300 text-[11px]">
              {/* Nhiều lựa chọn */}
              <th className="py-1 px-1 border border-slate-300 w-14">Biết</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Hiểu</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Vận dụng</th>
              {/* Đúng sai */}
              <th className="py-1 px-1 border border-slate-300 w-14">Biết</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Hiểu</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Vận dụng</th>
              {/* Trả lời ngắn */}
              <th className="py-1 px-1 border border-slate-300 w-14">Biết</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Hiểu</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Vận dụng</th>
              {/* Tự luận */}
              <th className="py-1 px-1 border border-slate-300 w-14">Biết</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Hiểu</th>
              <th className="py-1 px-1 border border-slate-300 w-14">Vận dụng</th>
            </tr>
          </thead>
          <tbody>
            {specRows.length === 0 ? (
              <tr>
                <td colSpan={17} className="py-8 text-center text-slate-400">
                  Chưa có dữ liệu bảng đặc tả. Bấm nút <strong>"Đồng bộ từ Ma trận"</strong> để tự động tạo theo chuẩn BGD.
                </td>
              </tr>
            ) : (
              specRows.map((row, rowIdx) => {
                const totalItems = row.items.length || 1;

                return row.items.map((item, itemIdx) => {
                  const isFirstItemOfRow = itemIdx === 0;
                  const isEditing = editingItemId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-200 hover:bg-slate-50/50 transition-colors ${
                        itemIdx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      {/* Column 1: TT */}
                      {isFirstItemOfRow && (
                        <td
                          rowSpan={totalItems}
                          className="py-2 px-1 text-center font-semibold text-slate-800 border border-slate-300 align-top bg-white"
                        >
                          {rowIdx + 1}
                        </td>
                      )}

                      {/* Column 2: Chủ đề */}
                      {isFirstItemOfRow && (
                        <td
                          rowSpan={totalItems}
                          className="py-2.5 px-3 font-semibold text-slate-900 border border-slate-300 align-top bg-white whitespace-pre-line"
                        >
                          {row.chuong}
                        </td>
                      )}

                      {/* Column 3: Nội dung kiến thức */}
                      {isFirstItemOfRow && (
                        <td
                          rowSpan={totalItems}
                          className="py-2.5 px-3 font-medium text-slate-800 border border-slate-300 align-top bg-white whitespace-pre-line"
                        >
                          <div>{row.noiDung}</div>
                          <div className="flex gap-1 mt-2.5">
                            <button
                              onClick={() => handleAddItem(row.id, 'nhanBiet')}
                              className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300"
                              title="Thêm mức độ Nhận biết"
                            >
                              +NB
                            </button>
                            <button
                              onClick={() => handleAddItem(row.id, 'thongHieu')}
                              className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300"
                              title="Thêm mức độ Thông hiểu"
                            >
                              +TH
                            </button>
                            <button
                              onClick={() => handleAddItem(row.id, 'vanDung')}
                              className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300"
                              title="Thêm mức độ Vận dụng"
                            >
                              +VD
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Column 4: Yêu cầu cần đạt */}
                      <td className="py-2.5 px-3.5 border border-slate-300 align-top text-left">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="font-semibold text-blue-700">
                              Mức độ: {item.mucDoLabel}
                            </div>
                            <textarea
                              value={tempYCCDat}
                              onChange={(e) => setTempYCCDat(e.target.value)}
                              rows={4}
                              className="w-full text-xs p-2 border border-blue-400 rounded-md focus:ring-1 focus:ring-blue-500 bg-white"
                              placeholder="Nhập yêu cầu cần đạt..."
                            />
                            {/* In-place 12-column inputs */}
                            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-2">
                              <div className="font-semibold text-slate-700">Gán số câu hỏi:</div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                  <label className="block text-[10px] text-slate-500">Nhiều LC - Biết</label>
                                  <input
                                    type="text"
                                    value={tempNlcBiet}
                                    onChange={(e) => setTempNlcBiet(e.target.value)}
                                    placeholder="Câu 1, 2"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Nhiều LC - Hiểu</label>
                                  <input
                                    type="text"
                                    value={tempNlcHieu}
                                    onChange={(e) => setTempNlcHieu(e.target.value)}
                                    placeholder="Câu 3, 4"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Đúng/Sai - Biết</label>
                                  <input
                                    type="text"
                                    value={tempDsBiet}
                                    onChange={(e) => setTempDsBiet(e.target.value)}
                                    placeholder="Câu 13"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Đúng/Sai - Hiểu</label>
                                  <input
                                    type="text"
                                    value={tempDsHieu}
                                    onChange={(e) => setTempDsHieu(e.target.value)}
                                    placeholder="Câu 14"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Trả lời ngắn - Biết</label>
                                  <input
                                    type="text"
                                    value={tempTlnBiet}
                                    onChange={(e) => setTempTlnBiet(e.target.value)}
                                    placeholder="Câu 15"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Trả lời ngắn - Hiểu</label>
                                  <input
                                    type="text"
                                    value={tempTlnHieu}
                                    onChange={(e) => setTempTlnHieu(e.target.value)}
                                    placeholder="Câu 16"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500">Tự luận - Vận dụng</label>
                                  <input
                                    type="text"
                                    value={tempTlVd}
                                    onChange={(e) => setTempTlVd(e.target.value)}
                                    placeholder="19 a"
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  onClick={cancelEdit}
                                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => saveEditItem(row.id, item.id)}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold"
                                >
                                  Lưu
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900 mb-1">
                              {item.mucDoLabel}:
                            </div>
                            <div className="whitespace-pre-line text-slate-700 leading-relaxed pl-2">
                              {item.yeuCauCanDat}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 12 Question columns */}
                      {/* Nhiều lựa chọn: Biết, Hiểu, Vận dụng */}
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-slate-50/20">
                        {item.nlc?.biet || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-slate-50/20">
                        {item.nlc?.hieu || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-slate-50/20">
                        {item.nlc?.vanDung || ''}
                      </td>

                      {/* Đúng sai: Biết, Hiểu, Vận dụng */}
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-blue-50/20">
                        {item.ds?.biet || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-blue-50/20">
                        {item.ds?.hieu || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-blue-50/20">
                        {item.ds?.vanDung || ''}
                      </td>

                      {/* Trả lời ngắn: Biết, Hiểu, Vận dụng */}
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-emerald-50/20">
                        {item.tln?.biet || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-emerald-50/20">
                        {item.tln?.hieu || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-emerald-50/20">
                        {item.tln?.vanDung || ''}
                      </td>

                      {/* Tự luận: Biết, Hiểu, Vận dụng */}
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-purple-50/20">
                        {item.tl?.biet || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-purple-50/20">
                        {item.tl?.hieu || ''}
                      </td>
                      <td className="py-2 px-1 text-center font-medium text-slate-900 border border-slate-300 align-middle bg-purple-50/20">
                        {item.tl?.vanDung || ''}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-1 text-center border border-slate-300 align-middle">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <button
                              onClick={() => saveEditItem(row.id, item.id)}
                              className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded transition-colors"
                              title="Lưu thay đổi"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditItem(row.id, item)}
                              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                              title="Chỉnh sửa dòng này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(row.id, item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa mức độ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span>
            Tổng số chủ đề / nội dung: <strong>{specRows.length}</strong>
          </span>
          <span className="text-slate-500">
            Khung chuẩn Bộ GD&ĐT: <strong>12 câu Nhiều lựa chọn (3.0đ) + 2 câu Đúng/Sai (2.0đ) + 4 câu Trả lời ngắn (2.0đ) + 3 câu Tự luận (3.0đ)</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportSpecWord}
            className="px-3 py-1 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 transition-colors"
          >
            Tải Bảng đặc tả (PL II) Word
          </button>
          <button
            onClick={onExportFullWord}
            className="px-3 py-1 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 transition-colors"
          >
            Tải Trọn bộ (PL I + PL II) Word
          </button>
        </div>
      </div>
    </div>
  );
};
