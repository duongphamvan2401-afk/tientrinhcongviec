import React, { useState } from 'react';
import {
  Plus,
  FileText,
  FileSpreadsheet,
  Trash2,
  Printer,
  CheckCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  RefreshCw,
  AlertTriangle,
  Minus,
} from 'lucide-react';
import { MatrixConfig, MatrixRow } from '../types';
import { calculateTopicPointSummary, getMatrixRow19Values } from '../utils/dateCalculations';
import {
  calculateMatrixTotals,
  rebalanceMatrixWhenCellEdited,
  adjustFormatQuestions,
  resetToStandardMoetMatrix,
} from '../utils/matrixBalancer';

interface MatrixTableProps {
  config: MatrixConfig;
  rows: MatrixRow[];
  onUpdateRow: (id: string, field: string, value: any) => void;
  onUpdateNestedRow?: (
    id: string,
    group: 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao',
    type: 'tn' | 'tl',
    value: number
  ) => void;
  onUpdate19Cell?: (
    id: string,
    category: 'nhieuLuaChon' | 'dungSai' | 'traLoiNgan' | 'tuLuan',
    level: 'biet' | 'hieu' | 'vanDung',
    value: number
  ) => void;
  onBulkUpdateRows?: (rows: MatrixRow[]) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onExportWord: () => void;
  onExportExcel: () => void;
  onPrintPreview: () => void;
  onGoToSpec?: () => void;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  config,
  rows,
  onUpdateRow,
  onUpdateNestedRow,
  onUpdate19Cell,
  onBulkUpdateRows,
  onAddRow,
  onDeleteRow,
  onExportWord,
  onExportExcel,
  onPrintPreview,
  onGoToSpec,
}) => {
  const [showTopicCalc, setShowTopicCalc] = useState<boolean>(true);
  const [autoBalance, setAutoBalance] = useState<boolean>(true);

  // Group rows by chapter
  const chapterGroups = new Map<string, MatrixRow[]>();
  rows.forEach((r) => {
    const ch = r.chuong || 'Chủ đề chung';
    const list = chapterGroups.get(ch) || [];
    list.push(r);
    chapterGroups.set(ch, list);
  });

  const totalTaughtPeriods = rows.reduce((sum, r) => sum + (r.soTiet || 1), 0);

  // Comprehensive matrix format and cognitive statistics
  const stats = calculateMatrixTotals(rows);

  // Helper to handle cell value changes with intelligent auto-rebalancing
  const handleCellChange = (
    row: MatrixRow,
    category: 'nhieuLuaChon' | 'dungSai' | 'traLoiNgan' | 'tuLuan',
    level: 'biet' | 'hieu' | 'vanDung',
    rawVal: string
  ) => {
    const val = rawVal === '' ? 0 : Math.max(0, parseInt(rawVal, 10) || 0);

    // If auto-balance is active and bulk update is available, rebalance across the matrix
    if (autoBalance && onBulkUpdateRows) {
      const balancedRows = rebalanceMatrixWhenCellEdited(rows, row.id, category, level, val);
      onBulkUpdateRows(balancedRows);
      return;
    }

    if (onUpdate19Cell) {
      onUpdate19Cell(row.id, category, level, val);
      return;
    }

    const curCat = row[category] || { biet: 0, hieu: 0, vanDung: 0 };
    const updatedCat = { ...curCat, [level]: val };

    const nlc =
      category === 'nhieuLuaChon'
        ? updatedCat
        : row.nhieuLuaChon || {
            biet: row.nhanBiet?.tn1 || 0,
            hieu: row.thongHieu?.tn1 || 0,
            vanDung: 0,
          };
    const ds =
      category === 'dungSai'
        ? updatedCat
        : row.dungSai || {
            biet: row.nhanBiet?.tn2 || 0,
            hieu: row.thongHieu?.tn2 || 0,
            vanDung: 0,
          };
    const tln =
      category === 'traLoiNgan'
        ? updatedCat
        : row.traLoiNgan || {
            biet: row.nhanBiet?.tn3 || 0,
            hieu: row.thongHieu?.tn3 || 0,
            vanDung: 0,
          };
    const tl =
      category === 'tuLuan'
        ? updatedCat
        : row.tuLuan || {
            biet: row.nhanBiet?.tl || 0,
            hieu: row.thongHieu?.tl || 0,
            vanDung: (row.vanDung?.tl || 0) + (row.vanDungCao?.tl || 0),
          };

    onUpdateRow(row.id, category, updatedCat);

    // Sync legacy nhanBiet, thongHieu, vanDung, vanDungCao
    onUpdateRow(row.id, 'nhanBiet', {
      tn: (nlc.biet || 0) + (ds.biet || 0) + (tln.biet || 0),
      tl: tl.biet || 0,
      tn1: nlc.biet || 0,
      tn2: ds.biet || 0,
      tn3: tln.biet || 0,
    });
    onUpdateRow(row.id, 'thongHieu', {
      tn: (nlc.hieu || 0) + (ds.hieu || 0) + (tln.hieu || 0),
      tl: tl.hieu || 0,
      tn1: nlc.hieu || 0,
      tn2: ds.hieu || 0,
      tn3: tln.hieu || 0,
    });
    onUpdateRow(row.id, 'vanDung', {
      tn: (nlc.vanDung || 0) + (ds.vanDung || 0) + (tln.vanDung || 0),
      tl: tl.vanDung || 0,
      tn1: nlc.vanDung || 0,
      tn2: ds.vanDung || 0,
      tn3: tln.vanDung || 0,
    });
  };

  const handleAdjustFormat = (fmt: 'nlc' | 'ds' | 'tln' | 'tl', delta: number) => {
    if (onBulkUpdateRows) {
      const adjusted = adjustFormatQuestions(rows, fmt, delta);
      onBulkUpdateRows(adjusted);
    }
  };

  const handleResetToStandard = () => {
    if (onBulkUpdateRows) {
      const standard = resetToStandardMoetMatrix(rows);
      onBulkUpdateRows(standard);
    }
  };

  // Calculate totals across all 19 columns
  let sumNlcBiet = 0;
  let sumNlcHieu = 0;
  let sumNlcVanDung = 0;

  let sumDsBiet = 0;
  let sumDsHieu = 0;
  let sumDsVanDung = 0;

  let sumTlnBiet = 0;
  let sumTlnHieu = 0;
  let sumTlnVanDung = 0;

  let sumTlBiet = 0;
  let sumTlHieu = 0;
  let sumTlVanDung = 0;

  let grandScore = 0;

  rows.forEach((r) => {
    const vals = getMatrixRow19Values(r);
    sumNlcBiet += vals.nlc.biet;
    sumNlcHieu += vals.nlc.hieu;
    sumNlcVanDung += vals.nlc.vanDung;

    sumDsBiet += vals.ds.biet;
    sumDsHieu += vals.ds.hieu;
    sumDsVanDung += vals.ds.vanDung;

    sumTlnBiet += vals.tln.biet;
    sumTlnHieu += vals.tln.hieu;
    sumTlnVanDung += vals.tln.vanDung;

    sumTlBiet += vals.tl.biet;
    sumTlHieu += vals.tl.hieu;
    sumTlVanDung += vals.tl.vanDung;

    grandScore += vals.score;
  });

  const sumTotalBiet = sumNlcBiet + sumDsBiet + sumTlnBiet + sumTlBiet;
  const sumTotalHieu = sumNlcHieu + sumDsHieu + sumTlnHieu + sumTlHieu;
  const sumTotalVanDung = sumNlcVanDung + sumDsVanDung + sumTlnVanDung + sumTlVanDung;

  const totalNlcQuestions = sumNlcBiet + sumNlcHieu + sumNlcVanDung;
  const totalDsQuestions = sumDsBiet + sumDsHieu + sumDsVanDung;
  const totalTlnQuestions = sumTlnBiet + sumTlnHieu + sumTlnVanDung;
  const totalTlQuestions = sumTlBiet + sumTlHieu + sumTlVanDung;
  const grandTotalQuestions = totalNlcQuestions + totalDsQuestions + totalTlnQuestions + totalTlQuestions;

  const scoreNlc = stats.scoreNlc;
  const scoreDs = stats.scoreDs;
  const scoreTln = stats.scoreTln;
  const scoreTl = stats.scoreTl;

  const scoreBiet = stats.scoreBiet;
  const scoreHieu = stats.scoreHieu;
  const scoreVanDung = stats.scoreVanDung;
  const scoreVanDungCao = stats.scoreVanDungCao;

  const pctNlc = stats.pctNlc;
  const pctDs = stats.pctDs;
  const pctTln = stats.pctTln;
  const pctTl = stats.pctTl;

  const pctBiet = stats.pctBiet;
  const pctHieu = stats.pctHieu;
  const pctVanDung = stats.pctVanDung;
  const pctVanDungCao = stats.pctVanDungCao;

  const topicSummary = calculateTopicPointSummary(rows, true);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mb-8">
      {/* Top action bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Khung Ma trận đề kiểm tra (Phụ lục I)
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              Chuẩn mẫu 19 cột Bộ GD&ĐT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Môn: <strong>{config.subject} {config.grade}</strong> | Phạm vi: <strong>Tuần {config.limitWeekFrom || 1} – Tuần {config.limitWeekTo}</strong> | Số tiết: <strong>{totalTaughtPeriods} tiết</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddRow}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Thêm dòng</span>
          </button>

          <button
            onClick={onExportWord}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất Ma trận (PL I) Word</span>
          </button>

          <button
            onClick={onExportExcel}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={onPrintPreview}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Xem và in ma trận trực tiếp"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>In / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Header Banner Phụ lục I */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 text-center">
        <p className="text-xs font-bold text-slate-500 tracking-wider">PHỤ LỤC I</p>
        <h3 className="text-sm font-bold text-slate-900 uppercase mt-0.5">
          KHUNG MA TRẬN ĐỀ KIỂM TRA {config.examPeriod.toUpperCase()}
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

      {/* Official Exam Metadata & Parameters */}
      <div className="p-4 bg-slate-50/40 border-b border-slate-200 text-xs text-slate-700 space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-slate-900 min-w-[130px]">• Thời điểm kiểm tra:</span>
          <span>{config.examPeriod} (khi kết thúc nội dung từ Tuần {config.limitWeekFrom || 1} đến Tuần {config.limitWeekTo}{config.limitPeriodTo ? `, đến Tiết ${config.limitPeriodTo}` : ''})</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold text-slate-900 min-w-[130px]">• Thời gian làm bài:</span>
          <span>{config.examDuration}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold text-slate-900 min-w-[130px]">• Hình thức kiểm tra:</span>
          <span>Kết hợp giữa trắc nghiệm và tự luận (tỉ lệ <strong>70% trắc nghiệm; 30% tự luận</strong>).</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-semibold text-slate-900 min-w-[130px]">• Cấu trúc đề:</span>
          <div className="space-y-1">
            <div>
              + Mức độ đề: <strong>30% Nhận biết; 40% Thông hiểu; 30% Vận dụng (trong đó: 20% Vận dụng; 10% Vận dụng cao)</strong>.
            </div>
            <div>
              + Phần trắc nghiệm: <strong>7,0 điểm</strong> (đầy đủ 3 dạng: 12 câu nhiều lựa chọn (3,0 điểm), 2 câu Đúng/Sai (2,0 điểm), 4 câu trả lời ngắn (2,0 điểm) — tuyệt đối không để dạng nào 0%).
            </div>
            <div>
              + Phần tự luận: <strong>3,0 điểm</strong> (gồm 3 bài: 2 bài Vận dụng 2,0 điểm và 1 bài Vận dụng cao 1,0 điểm).
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Matrix Balancer & Auto-compensation Panel */}
      <div className="p-4 bg-gradient-to-r from-emerald-900/5 via-slate-50 to-blue-900/5 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Bộ điều khiển cân bằng ma trận & Tự động bù trừ điểm số
                </h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Chuẩn 30% Biết - 40% Hiểu - 30% VD
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Khi tăng câu hỏi phần này sẽ tự động giảm phần khác để giữ chuẩn 10,0 điểm và không để bất kỳ dạng trắc nghiệm nào chiếm 0%.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="checkbox"
                checked={autoBalance}
                onChange={(e) => setAutoBalance(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-semibold text-[11px]">Tự động cân bằng khi sửa ô</span>
            </label>

            <button
              onClick={handleResetToStandard}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              title="Đặt lại ma trận về đúng tỉ lệ chuẩn Bộ GD&ĐT 30% Biết - 40% Hiểu - 30% VD với phân bố đa dạng"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chuẩn hóa 30 - 40 - 30</span>
            </button>
          </div>
        </div>

        {/* Warning if any format is 0% */}
        {stats.hasZeroFormat && (
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Lưu ý quan trọng:</strong> Hiện có dạng câu hỏi đang chiếm 0%! Theo quy định của Bộ GD&ĐT, ma trận kiểm tra giữa kỳ và cuối kỳ phải có đầy đủ 3 dạng trắc nghiệm và phần tự luận, không được để bất kỳ dạng nào chiếm 0%. Bấm nút <strong>"Chuẩn hóa 30 - 40 - 30"</strong> để tự động bổ sung.
            </span>
          </div>
        )}

        {/* Format Quick Controls Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
          {/* Format 1: Nhiều lựa chọn */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800">Dạng I: Nhiều lựa chọn</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                0,25đ/câu
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <div className="text-base font-black text-slate-900">
                {stats.totalNlc} <span className="text-xs font-normal text-slate-500">câu</span>
              </div>
              <div className="text-xs font-semibold text-blue-900">
                {stats.scoreNlc.toFixed(2).replace('.', ',')}đ ({stats.pctNlc}%)
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleAdjustFormat('nlc', -1)}
                disabled={stats.totalNlc <= 1}
                className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors"
                title="Giảm 1 câu Nhiều lựa chọn (bù sang phần khác)"
              >
                <Minus className="w-3 h-3" />
                <span>Bớt câu</span>
              </button>
              <button
                onClick={() => handleAdjustFormat('nlc', 1)}
                className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors border border-emerald-200"
                title="Tăng 1 câu Nhiều lựa chọn (tự động bớt phần khác)"
              >
                <Plus className="w-3 h-3" />
                <span>Tăng câu</span>
              </button>
            </div>
          </div>

          {/* Format 2: Đúng / Sai */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800">Dạng II: Đúng / Sai</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                1,0đ/câu (4 ý)
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <div className="text-base font-black text-slate-900">
                {stats.totalDs} <span className="text-xs font-normal text-slate-500">câu</span>
              </div>
              <div className="text-xs font-semibold text-emerald-900">
                {stats.scoreDs.toFixed(1).replace('.', ',')}đ ({stats.pctDs}%)
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleAdjustFormat('ds', -1)}
                disabled={stats.totalDs <= 1}
                className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors"
                title="Giảm 1 câu Đúng/Sai (bù sang phần khác)"
              >
                <Minus className="w-3 h-3" />
                <span>Bớt câu</span>
              </button>
              <button
                onClick={() => handleAdjustFormat('ds', 1)}
                className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors border border-emerald-200"
                title="Tăng 1 câu Đúng/Sai (tự động bớt phần khác)"
              >
                <Plus className="w-3 h-3" />
                <span>Tăng câu</span>
              </button>
            </div>
          </div>

          {/* Format 3: Trả lời ngắn */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800">Dạng III: Trả lời ngắn</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                0,5đ/câu
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <div className="text-base font-black text-slate-900">
                {stats.totalTln} <span className="text-xs font-normal text-slate-500">câu</span>
              </div>
              <div className="text-xs font-semibold text-indigo-900">
                {stats.scoreTln.toFixed(1).replace('.', ',')}đ ({stats.pctTln}%)
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleAdjustFormat('tln', -1)}
                disabled={stats.totalTln <= 1}
                className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors"
                title="Giảm 1 câu Trả lời ngắn (bù sang phần khác)"
              >
                <Minus className="w-3 h-3" />
                <span>Bớt câu</span>
              </button>
              <button
                onClick={() => handleAdjustFormat('tln', 1)}
                className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors border border-emerald-200"
                title="Tăng 1 câu Trả lời ngắn (tự động bớt phần khác)"
              >
                <Plus className="w-3 h-3" />
                <span>Tăng câu</span>
              </button>
            </div>
          </div>

          {/* Format 4: Tự luận */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800">Phần Tự luận</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                1,0đ/câu
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <div className="text-base font-black text-slate-900">
                {stats.totalTl} <span className="text-xs font-normal text-slate-500">bài</span>
              </div>
              <div className="text-xs font-semibold text-purple-900">
                {stats.scoreTl.toFixed(1).replace('.', ',')}đ ({stats.pctTl}%)
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleAdjustFormat('tl', -1)}
                disabled={stats.totalTl <= 1}
                className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors"
                title="Giảm 1 bài Tự luận (bù sang trắc nghiệm)"
              >
                <Minus className="w-3 h-3" />
                <span>Bớt bài</span>
              </button>
              <button
                onClick={() => handleAdjustFormat('tl', 1)}
                className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors border border-emerald-200"
                title="Tăng 1 bài Tự luận (tự động bớt trắc nghiệm)"
              >
                <Plus className="w-3 h-3" />
                <span>Tăng bài</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cognitive Distribution Progress Bar */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
            <span className="font-bold text-slate-800">
              Phân bố mức độ nhận thức hiện tại:
            </span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Nhận biết: <strong>{stats.pctBiet}%</strong> ({stats.scoreBiet.toFixed(1).replace('.', ',')}đ / chuẩn 30% = 3,0đ)
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-900">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Thông hiểu: <strong>{stats.pctHieu}%</strong> ({stats.scoreHieu.toFixed(1).replace('.', ',')}đ / chuẩn 40% = 4,0đ)
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                Vận dụng: <strong>{stats.pctVanDung + stats.pctVanDungCao}%</strong> ({(stats.scoreVanDung + stats.scoreVanDungCao).toFixed(1).replace('.', ',')}đ / chuẩn 30% = 3,0đ)
                <span className="text-[10px] text-slate-500 font-normal">
                  [VD: {stats.pctVanDung}% ({stats.scoreVanDung.toFixed(1).replace('.', ',')}đ) • VDC: {stats.pctVanDungCao}% ({stats.scoreVanDungCao.toFixed(1).replace('.', ',')}đ)]
                </span>
              </span>
              <span className={`font-black px-2 py-0.5 rounded text-[11px] ${stats.isBalanced ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                Tổng: {stats.grandScore.toFixed(1).replace('.', ',')} / 10,0 điểm
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, stats.pctBiet)}%` }}
              className="h-full bg-emerald-500 transition-all"
              title={`Nhận biết: ${stats.pctBiet}%`}
            />
            <div
              style={{ width: `${Math.min(100, stats.pctHieu)}%` }}
              className="h-full bg-blue-500 transition-all"
              title={`Thông hiểu: ${stats.pctHieu}%`}
            />
            <div
              style={{ width: `${Math.min(100, stats.pctVanDung)}%` }}
              className="h-full bg-amber-500 transition-all"
              title={`Vận dụng: ${stats.pctVanDung}%`}
            />
            <div
              style={{ width: `${Math.min(100, stats.pctVanDungCao)}%` }}
              className="h-full bg-rose-500 transition-all"
              title={`Vận dụng cao: ${stats.pctVanDungCao}%`}
            />
          </div>
        </div>
      </div>

      {/* Topic Point Calculation Section */}
      <div className="border-b border-slate-200 bg-white">
        <button
          onClick={() => setShowTopicCalc(!showTopicCalc)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>- Bảng tính điểm kiểm tra định kì của mỗi chủ đề/bài học theo số tiết thực tế (Công thức: Điểm = (Số tiết × 10) / Tổng số tiết)</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <span>{showTopicCalc ? 'Thu gọn' : 'Xem chi tiết'}</span>
            {showTopicCalc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showTopicCalc && (
          <div className="px-4 pb-3 overflow-x-auto">
            <table className="w-full text-xs text-slate-800 border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <th className="py-2 px-3 text-left border-r border-slate-300 w-48">Chủ đề / Bài học</th>
                  {topicSummary.items.map((item) => (
                    <th key={item.topicIndex} className="py-2 px-2 text-center border-r border-slate-300 min-w-[70px]">
                      Chủ đề {item.topicIndex}
                    </th>
                  ))}
                  <th className="py-2 px-3 text-center bg-slate-200 font-bold w-20">Tổng</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 px-3 font-medium border-r border-slate-300 bg-slate-50">Số tiết</td>
                  {topicSummary.items.map((item) => (
                    <td key={item.topicIndex} className="py-1.5 px-2 text-center border-r border-slate-300 font-semibold">
                      {item.periods}
                    </td>
                  ))}
                  <td className="py-1.5 px-2 text-center font-bold bg-slate-100">{topicSummary.totalPeriods}</td>
                </tr>
                <tr className="border-b border-slate-200 text-slate-600">
                  <td className="py-1.5 px-3 font-medium border-r border-slate-300 bg-slate-50">Điểm (chưa làm tròn)</td>
                  {topicSummary.items.map((item) => (
                    <td key={item.topicIndex} className="py-1.5 px-2 text-center border-r border-slate-300 font-mono text-[11px]">
                      {item.rawScore.toFixed(2)}
                    </td>
                  ))}
                  <td className="py-1.5 px-2 text-center font-bold bg-slate-100">10.0</td>
                </tr>
                <tr className="bg-emerald-50/50 font-semibold text-emerald-900">
                  <td className="py-1.5 px-3 border-r border-slate-300">Điểm làm tròn chuẩn</td>
                  {topicSummary.items.map((item) => (
                    <td key={item.topicIndex} className="py-1.5 px-2 text-center border-r border-slate-300 font-bold text-emerald-800">
                      {item.roundedScore.toString().replace('.', ',')}
                    </td>
                  ))}
                  <td className="py-1.5 px-2 text-center font-bold bg-emerald-100/70 text-emerald-950">
                    {topicSummary.totalScore.toString().replace('.', ',')}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-slate-500 italic mt-1.5">
              * Điểm mỗi chủ đề được hệ thống tự động tính toán dựa trên số tiết đã học để cân đối số lượng câu hỏi trắc nghiệm và tự luận chính xác tuyệt đối.
            </p>
          </div>
        )}
      </div>

      {/* Frame Table Header Title */}
      <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 font-medium text-xs text-slate-700">
        - Nội dung khung ma trận (Phụ lục 1)
      </div>

      {/* The 19-Column Matrix Table matching the user's official MOET format */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-slate-800 border-collapse">
          <thead>
            {/* Header Row 1 */}
            <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-300 text-center">
              <th rowSpan={4} className="py-2 px-2 border-r border-slate-300 w-10 text-center">
                TT
              </th>
              <th rowSpan={4} className="py-2 px-3 border-r border-slate-300 min-w-[140px] text-left">
                Chủ đề
              </th>
              <th rowSpan={4} className="py-2 px-3 border-r border-slate-300 min-w-[180px] text-left">
                Nội dung kiến thức
              </th>
              <th colSpan={12} className="py-2 px-2 border-r border-slate-300 bg-slate-200/80 font-bold text-center">
                Mức độ đánh giá
              </th>
              <th colSpan={3} rowSpan={3} className="py-2 px-2 border-r border-slate-300 bg-slate-150 font-bold text-center">
                Tổng
              </th>
              <th rowSpan={4} className="py-2 px-2 border-r border-slate-300 w-16 bg-slate-100 font-bold text-center leading-tight">
                Tỉ lệ<br />%<br />điểm
              </th>
              <th rowSpan={4} className="py-2 px-1 text-center w-8"></th>
            </tr>

            {/* Header Row 2 */}
            <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-300 text-center">
              <th colSpan={9} className="py-1.5 px-2 border-r border-slate-300 bg-blue-50/70 text-blue-950 font-bold text-center">
                TNKQ
              </th>
              <th colSpan={3} rowSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-purple-50/70 text-purple-950 font-bold text-center">
                Tự luận
              </th>
            </tr>

            {/* Header Row 3 */}
            <tr className="bg-slate-50 text-slate-800 font-medium text-[11px] border-b border-slate-300 text-center">
              <th colSpan={3} className="py-1 px-1.5 border-r border-slate-300 italic text-blue-900">
                Nhiều lựa chọn
              </th>
              <th colSpan={3} className="py-1 px-1.5 border-r border-slate-300 italic text-blue-900">
                “Đúng - sai”
              </th>
              <th colSpan={3} className="py-1 px-1.5 border-r border-slate-300 italic text-blue-900">
                Trả lời ngắn
              </th>
            </tr>

            {/* Header Row 4: Biết, Hiểu, Vận dụng for all categories */}
            <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b-2 border-slate-300 text-center">
              {/* Nhiều lựa chọn */}
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-emerald-50 text-emerald-900">Biết</th>
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-blue-50 text-blue-900">Hiểu</th>
              <th className="py-1 px-1 border-r border-slate-300 min-w-[32px] bg-amber-50 text-amber-900">Vận dụng</th>

              {/* Đúng - sai */}
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-emerald-50 text-emerald-900">Biết</th>
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-blue-50 text-blue-900">Hiểu</th>
              <th className="py-1 px-1 border-r border-slate-300 min-w-[32px] bg-amber-50 text-amber-900">Vận dụng</th>

              {/* Trả lời ngắn */}
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-emerald-50 text-emerald-900">Biết</th>
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-blue-50 text-blue-900">Hiểu</th>
              <th className="py-1 px-1 border-r border-slate-300 min-w-[32px] bg-amber-50 text-amber-900">Vận dụng</th>

              {/* Tự luận */}
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-emerald-50 text-emerald-900">Biết</th>
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-blue-50 text-blue-900">Hiểu</th>
              <th className="py-1 px-1 border-r border-slate-300 min-w-[32px] bg-amber-50 text-amber-900">Vận dụng</th>

              {/* Tổng */}
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-emerald-100/60 text-emerald-950 font-bold">Biết</th>
              <th className="py-1 px-1 border-r border-slate-200 min-w-[32px] bg-blue-100/60 text-blue-950 font-bold">Hiểu</th>
              <th className="py-1 px-1 border-r border-slate-300 min-w-[32px] bg-amber-100/60 text-amber-950 font-bold">Vận dụng</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 font-sans">
            {Array.from(chapterGroups.entries()).map(([chapterName, chapterRows], chIdx) => {
              return chapterRows.map((row, rowIdx) => {
                const isFirstRow = rowIdx === 0;
                const vals = getMatrixRow19Values(row);

                return (
                  <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                    {/* (1) TT */}
                    <td className="py-2 px-1 text-center border-r border-slate-200 font-medium text-slate-600">
                      {row.tt || chIdx + 1}
                    </td>

                    {/* (2) Chủ đề (rowspan by chapter) */}
                    {isFirstRow && (
                      <td
                        rowSpan={chapterRows.length}
                        className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200 align-top bg-white"
                      >
                        <div className="text-slate-900 font-medium">{chapterName}</div>
                      </td>
                    )}

                    {/* (3) Nội dung kiến thức */}
                    <td className="p-1 border-r border-slate-200">
                      <input
                        type="text"
                        value={row.noiDung}
                        onChange={(e) => onUpdateRow(row.id, 'noiDung', e.target.value)}
                        className="w-full bg-transparent hover:bg-slate-100/60 focus:bg-white border border-transparent hover:border-slate-200 focus:border-emerald-600 rounded px-2 py-1 text-slate-900 focus:outline-none text-xs"
                        placeholder="Nội dung / bài học..."
                      />
                    </td>

                    {/* (4, 5, 6) Nhiều lựa chọn: Biết, Hiểu, Vận dụng */}
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.nlc.biet || ''}
                        onChange={(e) => handleCellChange(row, 'nhieuLuaChon', 'biet', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-emerald-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.nlc.hieu || ''}
                        onChange={(e) => handleCellChange(row, 'nhieuLuaChon', 'hieu', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-blue-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-300 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.nlc.vanDung || ''}
                        onChange={(e) => handleCellChange(row, 'nhieuLuaChon', 'vanDung', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-amber-900"
                        placeholder=""
                      />
                    </td>

                    {/* (7, 8, 9) Đúng - sai: Biết, Hiểu, Vận dụng */}
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.ds.biet || ''}
                        onChange={(e) => handleCellChange(row, 'dungSai', 'biet', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-emerald-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.ds.hieu || ''}
                        onChange={(e) => handleCellChange(row, 'dungSai', 'hieu', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-blue-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-300 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.ds.vanDung || ''}
                        onChange={(e) => handleCellChange(row, 'dungSai', 'vanDung', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-amber-900"
                        placeholder=""
                      />
                    </td>

                    {/* (10, 11, 12) Trả lời ngắn: Biết, Hiểu, Vận dụng */}
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.tln.biet || ''}
                        onChange={(e) => handleCellChange(row, 'traLoiNgan', 'biet', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-emerald-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.tln.hieu || ''}
                        onChange={(e) => handleCellChange(row, 'traLoiNgan', 'hieu', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-blue-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-300 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.tln.vanDung || ''}
                        onChange={(e) => handleCellChange(row, 'traLoiNgan', 'vanDung', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-amber-900"
                        placeholder=""
                      />
                    </td>

                    {/* (13, 14, 15) Tự luận: Biết, Hiểu, Vận dụng */}
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.tl.biet || ''}
                        onChange={(e) => handleCellChange(row, 'tuLuan', 'biet', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-emerald-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.tl.hieu || ''}
                        onChange={(e) => handleCellChange(row, 'tuLuan', 'hieu', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-blue-900"
                        placeholder=""
                      />
                    </td>
                    <td className="p-1 border-r border-slate-300 text-center">
                      <input
                        type="number"
                        min={0}
                        value={vals.tl.vanDung || ''}
                        onChange={(e) => handleCellChange(row, 'tuLuan', 'vanDung', e.target.value)}
                        className="w-8 text-center bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-600 rounded py-0.5 text-xs focus:outline-none font-semibold text-amber-900"
                        placeholder=""
                      />
                    </td>

                    {/* (16, 17, 18) Tổng: Biết, Hiểu, Vận dụng */}
                    <td className="py-1 px-1 text-center border-r border-slate-200 font-bold text-emerald-900 bg-emerald-50/40">
                      {vals.tongBiet || ''}
                    </td>
                    <td className="py-1 px-1 text-center border-r border-slate-200 font-bold text-blue-900 bg-blue-50/40">
                      {vals.tongHieu || ''}
                    </td>
                    <td className="py-1 px-1 text-center border-r border-slate-300 font-bold text-amber-900 bg-amber-50/40">
                      {vals.tongVanDung || ''}
                    </td>

                    {/* (19) Tỉ lệ % điểm (hoặc điểm số của dòng) */}
                    <td className="py-1 px-2 text-center border-r border-slate-300 font-bold text-slate-900 bg-slate-50">
                      {vals.formattedScore}
                    </td>

                    {/* Delete button */}
                    <td className="py-1 px-1 text-center">
                      {rows.length > 1 && (
                        <button
                          onClick={() => onDeleteRow(row.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              });
            })}

            {/* Summary Row 1: Tổng số câu */}
            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-center">
              <td colSpan={3} className="py-2.5 px-3 text-left border-r border-slate-300">
                Tổng số câu
              </td>
              {/* Nhiều lựa chọn */}
              <td className="py-1.5 px-1 border-r border-slate-200 text-emerald-900">{sumNlcBiet || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-200 text-blue-900">{sumNlcHieu || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-300 text-amber-900">{sumNlcVanDung || ''}</td>

              {/* Đúng - sai */}
              <td className="py-1.5 px-1 border-r border-slate-200 text-emerald-900">{sumDsBiet || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-200 text-blue-900">{sumDsHieu || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-300 text-amber-900">{sumDsVanDung || ''}</td>

              {/* Trả lời ngắn */}
              <td className="py-1.5 px-1 border-r border-slate-200 text-emerald-900">{sumTlnBiet || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-200 text-blue-900">{sumTlnHieu || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-300 text-amber-900">{sumTlnVanDung || ''}</td>

              {/* Tự luận */}
              <td className="py-1.5 px-1 border-r border-slate-200 text-emerald-900">{sumTlBiet || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-200 text-blue-900">{sumTlHieu || ''}</td>
              <td className="py-1.5 px-1 border-r border-slate-300 text-amber-900">{sumTlVanDung || ''}</td>

              {/* Tổng */}
              <td className="py-1.5 px-1 border-r border-slate-200 text-emerald-950 bg-emerald-100/50">{sumTotalBiet}</td>
              <td className="py-1.5 px-1 border-r border-slate-200 text-blue-950 bg-blue-100/50">{sumTotalHieu}</td>
              <td className="py-1.5 px-1 border-r border-slate-300 text-amber-950 bg-amber-100/50">{sumTotalVanDung}</td>

              {/* Tỉ lệ % điểm */}
              <td className="py-1.5 px-1 border-r border-slate-300 text-slate-900 bg-slate-200/60">
                {grandTotalQuestions} câu
              </td>
              <td></td>
            </tr>

            {/* Summary Row 2: Tỉ lệ % điểm */}
            <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 text-center">
              <td colSpan={3} className="py-2 px-3 text-left border-r border-slate-300">
                Tỉ lệ % điểm
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-blue-900 bg-blue-50/40">
                {pctNlc}%
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-blue-900 bg-blue-50/40">
                {pctDs}%
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-blue-900 bg-blue-50/40">
                {pctTln}%
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-purple-900 bg-purple-50/40">
                {pctTl}%
              </td>
              <td className="py-2 px-1 border-r border-slate-200 text-emerald-900 bg-emerald-100/40">{pctBiet}%</td>
              <td className="py-2 px-1 border-r border-slate-200 text-blue-900 bg-blue-100/40">{pctHieu}%</td>
              <td className="py-2 px-1 border-r border-slate-300 text-amber-900 bg-amber-100/40">
                {pctVanDung + pctVanDungCao}%
                <span className="block text-[9px] text-slate-500 font-normal">
                  ({pctVanDung}% VD + {pctVanDungCao}% VDC)
                </span>
              </td>
              <td className="py-2 px-1 border-r border-slate-300 text-emerald-950 bg-emerald-100/60 font-black">
                100%
              </td>
              <td></td>
            </tr>

            {/* Summary Row 3: Tổng điểm */}
            <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200 text-center">
              <td colSpan={3} className="py-2 px-3 text-left border-r border-slate-300">
                Tổng điểm
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-blue-950 bg-blue-50/70">
                {scoreNlc.toFixed(2).replace('.', ',')} điểm
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-blue-950 bg-blue-50/70">
                {scoreDs.toFixed(1).replace('.', ',')} điểm
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-blue-950 bg-blue-50/70">
                {scoreTln.toFixed(1).replace('.', ',')} điểm
              </td>
              <td colSpan={3} className="py-2 px-1 border-r border-slate-300 text-purple-950 bg-purple-50/70">
                {scoreTl.toFixed(1).replace('.', ',')} điểm
              </td>
              <td className="py-2 px-1 border-r border-slate-200 text-emerald-900 bg-emerald-100/60">
                {scoreBiet.toFixed(1).replace('.', ',')}
              </td>
              <td className="py-2 px-1 border-r border-slate-200 text-blue-900 bg-blue-100/60">
                {scoreHieu.toFixed(1).replace('.', ',')}
              </td>
              <td className="py-2 px-1 border-r border-slate-300 text-amber-900 bg-amber-100/60">
                {(scoreVanDung + scoreVanDungCao).toFixed(1).replace('.', ',')}
                <span className="block text-[9px] text-slate-500 font-normal">
                  ({scoreVanDung.toFixed(1).replace('.', ',')} VD + {scoreVanDungCao.toFixed(1).replace('.', ',')} VDC)
                </span>
              </td>
              <td className="py-2 px-1 border-r border-slate-300 text-emerald-950 bg-emerald-200/70 font-black">
                {grandScore.toFixed(1).replace('.', ',')} điểm
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Validation Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>
              Tổng cộng: <strong>{grandTotalQuestions} câu</strong> (18 câu TNKQ: 12 nhiều lựa chọn [3.0đ] + 2 Đúng/Sai [2.0đ] + 4 trả lời ngắn [2.0đ]; và {totalTlQuestions} câu Tự luận [3.0đ] = <strong>10,0 điểm</strong>).
            </span>
          </div>
        </div>

        {onGoToSpec && (
          <button
            onClick={onGoToSpec}
            className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <span>Xem Bảng đặc tả (Phụ lục II)</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
};
