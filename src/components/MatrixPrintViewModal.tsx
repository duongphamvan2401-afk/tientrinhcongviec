import React, { useRef, useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { MatrixConfig, MatrixRow } from '../types';
import { generateSpecificationFromMatrix, calculateTopicPointSummary, getMatrixRow19Values } from '../utils/dateCalculations';
import { calculateMatrixTotals } from '../utils/matrixBalancer';

interface MatrixPrintViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MatrixConfig;
  rows: MatrixRow[];
  onExportWord: () => void;
}

export const MatrixPrintViewModal: React.FC<MatrixPrintViewModalProps> = ({
  isOpen,
  onClose,
  config,
  rows,
  onExportWord,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'pl1' | 'pl2'>('both');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const specRows = generateSpecificationFromMatrix(rows, config.grade, config.subject);
  const topicSummary = calculateTopicPointSummary(rows, true);

  // Group rows by chapter
  const chapterGroups = new Map<string, MatrixRow[]>();
  rows.forEach((r) => {
    const ch = r.chuong || 'Chủ đề chung';
    const list = chapterGroups.get(ch) || [];
    list.push(r);
    chapterGroups.set(ch, list);
  });

  // Calculate totals across 19 columns
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

  const stats = calculateMatrixTotals(rows);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header Actions */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-100/90">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Xem trước trang in ma trận & bảng đặc tả (Khổ A4 — Times New Roman)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Selector */}
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs mr-2">
              <button
                onClick={() => setActiveTab('both')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'both' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600'
                }`}
              >
                Cả PL I & PL II
              </button>
              <button
                onClick={() => setActiveTab('pl1')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'pl1' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600'
                }`}
              >
                Chỉ PL I
              </button>
              <button
                onClick={() => setActiveTab('pl2')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'pl2' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600'
                }`}
              >
                Chỉ PL II
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In trang này</span>
            </button>
            <button
              onClick={onExportWord}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Tải file Word</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/50 flex justify-center">
          <div
            ref={printRef}
            className="bg-white shadow-lg p-8 sm:p-12 w-full max-w-5xl rounded-sm text-slate-900 font-serif leading-relaxed text-xs space-y-10"
            style={{ fontFamily: "'Times New Roman', 'Tinos', serif" }}
          >
            {/* SECTION 1: PHỤ LỤC I */}
            {(activeTab === 'both' || activeTab === 'pl1') && (
              <div>
                <p className="font-bold text-sm text-left">Phụ lục I</p>
                <div className="text-center my-3">
                  <h1 className="text-base font-bold uppercase tracking-wide">
                    KHUNG MA TRẬN ĐỀ KIỂM TRA {config.examPeriod.toUpperCase()}
                  </h1>
                  <p className="text-sm font-bold uppercase mt-0.5">
                    MÔN HỌC: {config.subject.toUpperCase()}, LỚP {config.grade}, NĂM HỌC {config.academicYear}
                  </p>
                  {config.officialDocumentRef?.trim() && (
                    <p className="text-xs italic text-slate-700 mt-0.5">
                      {config.officialDocumentRef}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs space-y-1 my-4">
                  <p>
                    <strong>- Thời điểm kiểm tra:</strong> {config.examPeriod} (khi kết thúc nội dung từ Tuần {config.limitWeekFrom || 1} đến Tuần {config.limitWeekTo}{config.limitPeriodTo ? `, đến Tiết ${config.limitPeriodTo}` : ''})
                  </p>
                  <p>
                    <strong>- Thời gian làm bài:</strong> {config.examDuration}
                  </p>
                  <p>
                    <strong>- Hình thức kiểm tra:</strong> Kết hợp giữa trắc nghiệm và tự luận (tỉ lệ 70% trắc nghiệm; 30% tự luận).
                  </p>
                  <p>
                    <strong>- Cấu trúc đề:</strong>
                  </p>
                  <p className="pl-4">
                    + Mức độ đề: <strong>30% Nhận biết; 40% Thông hiểu; 30% Vận dụng (trong đó: 20% Vận dụng; 10% Vận dụng cao)</strong>.
                  </p>
                  <p className="pl-4">
                    + Phần trắc nghiệm: <strong>7,0 điểm</strong> (đầy đủ 3 dạng: 12 câu nhiều lựa chọn (3,0 điểm), 2 câu Đúng/Sai (2,0 điểm), 4 câu trả lời ngắn (2,0 điểm) — không có dạng nào 0%).
                  </p>
                  <p className="pl-4">
                    + Phần tự luận: <strong>3,0 điểm</strong> (gồm 3 bài: 2 bài Vận dụng 2,0 điểm và 1 bài Vận dụng cao 1,0 điểm).
                  </p>

                  <p className="italic pt-1">
                    - Bảng tính điểm kiểm tra định kì của mỗi chủ đề/bài học theo số tiết thực tế:
                  </p>
                  <table className="w-full text-xs border border-black text-center border-collapse my-2">
                    <thead>
                      <tr className="font-bold bg-slate-50 border border-black">
                        <th className="border border-black p-1 text-left">Chủ đề/bài học</th>
                        {topicSummary.items.map((item) => (
                          <th key={item.topicIndex} className="border border-black p-1">
                            Chủ đề {item.topicIndex}
                          </th>
                        ))}
                        <th className="border border-black p-1">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border border-black">
                        <td className="border border-black p-1 text-left">Số tiết</td>
                        {topicSummary.items.map((item) => (
                          <td key={item.topicIndex} className="border border-black p-1">{item.periods}</td>
                        ))}
                        <td className="border border-black p-1 font-bold">{topicSummary.totalPeriods}</td>
                      </tr>
                      <tr className="border border-black">
                        <td className="border border-black p-1 text-left">Điểm</td>
                        {topicSummary.items.map((item) => (
                          <td key={item.topicIndex} className="border border-black p-1">{item.rawScore.toFixed(2)}</td>
                        ))}
                        <td className="border border-black p-1">10.0</td>
                      </tr>
                      <tr className="border border-black font-bold bg-slate-50">
                        <td className="border border-black p-1 text-left">Điểm làm tròn</td>
                        {topicSummary.items.map((item) => (
                          <td key={item.topicIndex} className="border border-black p-1">{item.roundedScore.toString().replace('.', ',')}</td>
                        ))}
                        <td className="border border-black p-1">{topicSummary.totalScore.toString().replace('.', ',')}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="font-bold pt-2">- Nội dung khung ma trận:</p>
                </div>

                {/* 19-Column Table */}
                <table className="w-full text-[10.5px] border border-black text-center border-collapse mb-6">
                  <thead>
                    <tr className="font-bold bg-slate-50 border border-black">
                      <th rowSpan={4} className="border border-black p-1 text-center w-8">TT</th>
                      <th rowSpan={4} className="border border-black p-1 text-left min-w-[100px]">Chủ đề</th>
                      <th rowSpan={4} className="border border-black p-1 text-left min-w-[120px]">Nội dung kiến thức</th>
                      <th colSpan={12} className="border border-black p-1 text-center">Mức độ đánh giá</th>
                      <th colSpan={3} rowSpan={3} className="border border-black p-1 text-center">Tổng</th>
                      <th rowSpan={4} className="border border-black p-1 text-center w-12">Tỉ lệ<br />%<br />điểm</th>
                    </tr>
                    <tr className="font-bold bg-slate-50 border border-black">
                      <th colSpan={9} className="border border-black p-0.5 text-center">TNKQ</th>
                      <th colSpan={3} rowSpan={2} className="border border-black p-0.5 text-center">Tự luận</th>
                    </tr>
                    <tr className="font-bold bg-slate-50 border border-black text-[10px]">
                      <th colSpan={3} className="border border-black p-0.5 italic">Nhiều lựa chọn</th>
                      <th colSpan={3} className="border border-black p-0.5 italic">“Đúng - sai”</th>
                      <th colSpan={3} className="border border-black p-0.5 italic">Trả lời ngắn</th>
                    </tr>
                    <tr className="font-bold bg-slate-50 border border-black text-[9.5px]">
                      <th className="border border-black p-0.5">Biết</th>
                      <th className="border border-black p-0.5">Hiểu</th>
                      <th className="border border-black p-0.5">Vận dụng</th>
                      <th className="border border-black p-0.5">Biết</th>
                      <th className="border border-black p-0.5">Hiểu</th>
                      <th className="border border-black p-0.5">Vận dụng</th>
                      <th className="border border-black p-0.5">Biết</th>
                      <th className="border border-black p-0.5">Hiểu</th>
                      <th className="border border-black p-0.5">Vận dụng</th>
                      <th className="border border-black p-0.5">Biết</th>
                      <th className="border border-black p-0.5">Hiểu</th>
                      <th className="border border-black p-0.5">Vận dụng</th>
                      <th className="border border-black p-0.5">Biết</th>
                      <th className="border border-black p-0.5">Hiểu</th>
                      <th className="border border-black p-0.5">Vận dụng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(chapterGroups.entries()).map(([chName, chRows], chIdx) => {
                      return chRows.map((r, rIdx) => {
                        const isFirst = rIdx === 0;
                        const vals = getMatrixRow19Values(r);

                        return (
                          <tr key={r.id} className="border border-black">
                            <td className="border border-black p-0.5 text-center">{r.tt || chIdx + 1}</td>
                            {isFirst && (
                              <td rowSpan={chRows.length} className="border border-black p-1 text-left font-medium align-top">
                                {chName}
                              </td>
                            )}
                            <td className="border border-black p-1 text-left">{r.noiDung}</td>
                            {/* Nhiều lựa chọn */}
                            <td className="border border-black p-0.5">{vals.nlc.biet || ''}</td>
                            <td className="border border-black p-0.5">{vals.nlc.hieu || ''}</td>
                            <td className="border border-black p-0.5">{vals.nlc.vanDung || ''}</td>
                            {/* Đúng - sai */}
                            <td className="border border-black p-0.5">{vals.ds.biet || ''}</td>
                            <td className="border border-black p-0.5">{vals.ds.hieu || ''}</td>
                            <td className="border border-black p-0.5">{vals.ds.vanDung || ''}</td>
                            {/* Trả lời ngắn */}
                            <td className="border border-black p-0.5">{vals.tln.biet || ''}</td>
                            <td className="border border-black p-0.5">{vals.tln.hieu || ''}</td>
                            <td className="border border-black p-0.5">{vals.tln.vanDung || ''}</td>
                            {/* Tự luận */}
                            <td className="border border-black p-0.5">{vals.tl.biet || ''}</td>
                            <td className="border border-black p-0.5">{vals.tl.hieu || ''}</td>
                            <td className="border border-black p-0.5">{vals.tl.vanDung || ''}</td>
                            {/* Tổng */}
                            <td className="border border-black p-0.5 font-bold">{vals.tongBiet || ''}</td>
                            <td className="border border-black p-0.5 font-bold">{vals.tongHieu || ''}</td>
                            <td className="border border-black p-0.5 font-bold">{vals.tongVanDung || ''}</td>
                            {/* Điểm / % */}
                            <td className="border border-black p-0.5 font-bold">{vals.formattedScore}</td>
                          </tr>
                        );
                      });
                    })}

                    {/* Summary Row 1: Tổng số câu */}
                    <tr className="border border-black font-bold bg-slate-50 text-center">
                      <td colSpan={3} className="border border-black p-1 text-left">Tổng số câu</td>
                      <td className="border border-black p-0.5">{sumNlcBiet || ''}</td>
                      <td className="border border-black p-0.5">{sumNlcHieu || ''}</td>
                      <td className="border border-black p-0.5">{sumNlcVanDung || ''}</td>
                      <td className="border border-black p-0.5">{sumDsBiet || ''}</td>
                      <td className="border border-black p-0.5">{sumDsHieu || ''}</td>
                      <td className="border border-black p-0.5">{sumDsVanDung || ''}</td>
                      <td className="border border-black p-0.5">{sumTlnBiet || ''}</td>
                      <td className="border border-black p-0.5">{sumTlnHieu || ''}</td>
                      <td className="border border-black p-0.5">{sumTlnVanDung || ''}</td>
                      <td className="border border-black p-0.5">{sumTlBiet || ''}</td>
                      <td className="border border-black p-0.5">{sumTlHieu || ''}</td>
                      <td className="border border-black p-0.5">{sumTlVanDung || ''}</td>
                      <td className="border border-black p-0.5">{sumTotalBiet}</td>
                      <td className="border border-black p-0.5">{sumTotalHieu}</td>
                      <td className="border border-black p-0.5">{sumTotalVanDung}</td>
                      <td className="border border-black p-0.5">{grandTotalQuestions} câu</td>
                    </tr>

                    {/* Summary Row 2: Tỉ lệ % điểm */}
                    <tr className="border border-black font-bold bg-slate-50 text-center">
                      <td colSpan={3} className="border border-black p-1 text-left">Tỉ lệ % điểm</td>
                      <td colSpan={3} className="border border-black p-0.5">{pctNlc}%</td>
                      <td colSpan={3} className="border border-black p-0.5">{pctDs}%</td>
                      <td colSpan={3} className="border border-black p-0.5">{pctTln}%</td>
                      <td colSpan={3} className="border border-black p-0.5">{pctTl}%</td>
                      <td className="border border-black p-0.5">{pctBiet}%</td>
                      <td className="border border-black p-0.5">{pctHieu}%</td>
                      <td className="border border-black p-0.5">{pctVanDung}%</td>
                      <td className="border border-black p-0.5">100%</td>
                    </tr>

                    {/* Summary Row 3: Tổng điểm */}
                    <tr className="border border-black font-bold bg-slate-50 text-center">
                      <td colSpan={3} className="border border-black p-1 text-left">Tổng điểm</td>
                      <td colSpan={3} className="border border-black p-0.5">{scoreNlc.toString().replace('.', ',')} điểm</td>
                      <td colSpan={3} className="border border-black p-0.5">{scoreDs.toString().replace('.', ',')} điểm</td>
                      <td colSpan={3} className="border border-black p-0.5">{scoreTln.toString().replace('.', ',')} điểm</td>
                      <td colSpan={3} className="border border-black p-0.5">{scoreTl.toString().replace('.', ',')} điểm</td>
                      <td className="border border-black p-0.5">{scoreBiet.toString().replace('.', ',')}</td>
                      <td className="border border-black p-0.5">{scoreHieu.toString().replace('.', ',')}</td>
                      <td className="border border-black p-0.5">{scoreVanDung.toString().replace('.', ',')}</td>
                      <td className="border border-black p-0.5">10,0 điểm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* SECTION 2: PHỤ LỤC II */}
            {(activeTab === 'both' || activeTab === 'pl2') && (
              <div className="pt-6 border-t-2 border-dashed border-slate-300">
                <p className="font-bold text-sm text-left">Phụ lục II</p>
                <div className="text-center my-3">
                  <h1 className="text-base font-bold uppercase tracking-wide">
                    KHUNG BẢNG ĐẶC TẢ ĐỀ KIỂM TRA {config.examPeriod.toUpperCase()}
                  </h1>
                  <p className="text-sm font-bold uppercase mt-0.5">
                    MÔN HỌC: {config.subject.toUpperCase()}, LỚP {config.grade}, NĂM HỌC {config.academicYear}
                  </p>
                  {config.officialDocumentRef?.trim() && (
                    <p className="text-xs italic text-slate-700 mt-0.5">
                      {config.officialDocumentRef}
                    </p>
                  )}
                </div>

                <table className="w-full text-[10px] border border-black text-left border-collapse mb-6">
                  <thead>
                    <tr className="font-bold bg-slate-50 border border-black text-center">
                      <th rowSpan={4} className="border border-black p-1 w-6">
                        TT
                      </th>
                      <th rowSpan={4} className="border border-black p-1 w-28">
                        Chủ đề
                      </th>
                      <th rowSpan={4} className="border border-black p-1 w-32">
                        Nội dung kiến thức
                      </th>
                      <th rowSpan={4} className="border border-black p-1.5 min-w-[200px]">
                        Yêu cầu cần đạt
                      </th>
                      <th colSpan={12} className="border border-black p-1">
                        Số câu hỏi ở các mức độ đánh giá
                      </th>
                    </tr>
                    <tr className="font-bold bg-slate-50 border border-black text-center">
                      <th colSpan={9} className="border border-black p-0.5">TNKQ</th>
                      <th colSpan={3} className="border border-black p-0.5">Tự luận</th>
                    </tr>
                    <tr className="font-medium italic bg-slate-50 border border-black text-center text-[9px]">
                      <th colSpan={3} className="border border-black p-0.5">Nhiều lựa chọn</th>
                      <th colSpan={3} className="border border-black p-0.5">“Đúng - sai”</th>
                      <th colSpan={3} className="border border-black p-0.5">Trả lời ngắn</th>
                      <th colSpan={3} className="border border-black p-0.5">Tự luận</th>
                    </tr>
                    <tr className="font-medium bg-slate-50 border border-black text-center text-[9px]">
                      <th className="border border-black p-0.5 w-7">Biết</th>
                      <th className="border border-black p-0.5 w-7">Hiểu</th>
                      <th className="border border-black p-0.5 w-7">Vận dụng</th>
                      <th className="border border-black p-0.5 w-7">Biết</th>
                      <th className="border border-black p-0.5 w-7">Hiểu</th>
                      <th className="border border-black p-0.5 w-7">Vận dụng</th>
                      <th className="border border-black p-0.5 w-7">Biết</th>
                      <th className="border border-black p-0.5 w-7">Hiểu</th>
                      <th className="border border-black p-0.5 w-7">Vận dụng</th>
                      <th className="border border-black p-0.5 w-7">Biết</th>
                      <th className="border border-black p-0.5 w-7">Hiểu</th>
                      <th className="border border-black p-0.5 w-7">Vận dụng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map((row, rIdx) => {
                      const totalItems = row.items.length || 1;
                      return row.items.map((it, itIdx) => (
                        <tr key={it.id} className="border border-black">
                          {itIdx === 0 && (
                            <td rowSpan={totalItems} className="border border-black p-1 text-center font-bold align-top">
                              {rIdx + 1}
                            </td>
                          )}
                          {itIdx === 0 && (
                            <td rowSpan={totalItems} className="border border-black p-1 font-bold align-top whitespace-pre-line">
                              {row.chuong}
                            </td>
                          )}
                          {itIdx === 0 && (
                            <td rowSpan={totalItems} className="border border-black p-1 font-medium align-top whitespace-pre-line">
                              {row.noiDung}
                            </td>
                          )}
                          <td className="border border-black p-1 align-top text-left">
                            <div className="font-bold">{it.mucDoLabel}:</div>
                            <div className="whitespace-pre-line text-slate-800">{it.yeuCauCanDat}</div>
                          </td>
                          {/* 12 columns */}
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.nlc?.biet || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.nlc?.hieu || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.nlc?.vanDung || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.ds?.biet || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.ds?.hieu || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.ds?.vanDung || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.tln?.biet || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.tln?.hieu || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.tln?.vanDung || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.tl?.biet || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.tl?.hieu || ''}</td>
                          <td className="border border-black p-0.5 text-center font-medium align-middle">{it.tl?.vanDung || ''}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 text-center text-xs mt-8 font-bold">
                  <div>
                    <p>BAN GIÁM HIỆU DUYỆT</p>
                  </div>
                  <div>
                    <p>TỔ TRƯỞNG CHUYÊN MÔN</p>
                  </div>
                  <div>
                    <p className="font-normal italic">Ngày ..... tháng ..... năm 2026</p>
                    <p className="mt-1">NGƯỜI LẬP BẢNG ĐẶC TẢ</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
