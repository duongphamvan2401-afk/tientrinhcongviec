import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  BookOpen,
  Filter,
  Eye,
  Save,
  HelpCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { GvcnStudent, GvcnClassInfo, GvcnTT22Evaluation } from '../../types';
import {
  exportTT22EvaluationExcel,
  generateTT22CommentForStudent,
  TT22_COMMENT_BANK,
} from '../../utils/vneduExcel';

interface GvcnTT22EvaluationSectionProps {
  students: GvcnStudent[];
  classInfo: GvcnClassInfo;
  onUpdateStudents: (updated: GvcnStudent[]) => void;
  onSelectStudent: (student: GvcnStudent) => void;
}

export const GvcnTT22EvaluationSection: React.FC<GvcnTT22EvaluationSectionProps> = ({
  students,
  classInfo,
  onUpdateStudents,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string | 'all'>('all');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [showBankModal, setShowBankModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Tự động sinh nhận xét cho tất cả học sinh trong lớp
  const handleBatchAutoGenerate = () => {
    const updated = students.map((s) => ({
      ...s,
      tt22Evaluation: generateTT22CommentForStudent(s),
    }));
    onUpdateStudents(updated);
    showToast(`Đã tự động tạo nhận xét sư phạm chuẩn TT22 cho toàn bộ ${students.length} học sinh!`);
  };

  // Tự động sinh lại nhận xét cho 1 em
  const handleSingleAutoGenerate = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          tt22Evaluation: generateTT22CommentForStudent(s),
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    showToast('Đã tạo gợi ý nhận xét mới cho học sinh!');
  };

  // Thay đổi trường nhận xét trực tiếp
  const handleFieldChange = (
    studentId: string,
    field: keyof GvcnTT22Evaluation,
    value: string
  ) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const prevEval = s.tt22Evaluation || generateTT22CommentForStudent(s);
        return {
          ...s,
          tt22Evaluation: {
            ...prevEval,
            [field]: value,
            updatedAt: new Date().toLocaleDateString('vi-VN'),
          },
        };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  // Xuất file Excel nhận xét theo chuẩn TT22
  const handleExportExcel = () => {
    exportTT22EvaluationExcel(classInfo, students);
    showToast(`Đã xuất và tải về file Excel nhận xét TT22 lớp ${classInfo.className}!`);
  };

  // Thống kê nhanh TT22
  const stats = {
    xuatSac: students.filter((s) => s.tt22Evaluation?.khenThuong === 'Học sinh Xuất sắc').length,
    gioi: students.filter((s) => s.tt22Evaluation?.khenThuong === 'Học sinh Giỏi').length,
    hocTapTot: students.filter((s) => s.tt22Evaluation?.hocTap === 'Tốt').length,
    hocTapKha: students.filter((s) => s.tt22Evaluation?.hocTap === 'Khá').length,
    hocTapDat: students.filter((s) => s.tt22Evaluation?.hocTap === 'Đạt').length,
    renLuyenTot: students.filter((s) => (s.tt22Evaluation?.renLuyen || 'Tốt') === 'Tốt').length,
  };

  const filteredStudents = students.filter((s) => {
    const evalData = s.tt22Evaluation || generateTT22CommentForStudent(s);
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const matchRank = selectedRank === 'all' || evalData.hocTap === selectedRank;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
      (evalData.nhanXetChung && evalData.nhanXetChung.toLowerCase().includes(q));
    return matchGroup && matchRank && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner & Control Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>Đánh Giá & Nhận Xét Học Sinh Theo TT22 (Bộ GD&ĐT)</span>
              <span className="px-2.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-bold">
                TT 22/2021/TT-BGDĐT
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Đánh giá định kỳ kết quả Rèn luyện, Học tập, 5 phẩm chất, năng lực và lời nhận xét chung của GVCN vào học bạ / vnEdu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tự động sinh nhận xét cả lớp */}
            <button
              onClick={handleBatchAutoGenerate}
              className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Tự Động Nhận Xét Cả Lớp (TT22)</span>
            </button>

            {/* Tải file Excel nhận xét về */}
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Tải File Excel Nhận Xét Về</span>
            </button>

            {/* Ngân hàng nhận xét */}
            <button
              onClick={() => setShowBankModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>Ngân Hàng Câu Nhận Xét</span>
            </button>
          </div>
        </div>

        {/* Thông báo thao tác */}
        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Thống kê 4 khối xếp loại TT22 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">
              Học Sinh Xuất Sắc & Giỏi
            </span>
            <span className="text-lg font-black text-emerald-950">
              {stats.xuatSac + stats.gioi} <span className="text-xs font-normal">({stats.xuatSac} Xuất sắc, {stats.gioi} Giỏi)</span>
            </span>
          </div>

          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold uppercase text-blue-800 block">
              Học Lực Mức Tốt
            </span>
            <span className="text-lg font-black text-blue-950">
              {stats.hocTapTot} / {students.length} <span className="text-xs font-normal">({((stats.hocTapTot / (students.length || 1)) * 100).toFixed(0)}%)</span>
            </span>
          </div>

          <div className="bg-cyan-50/80 p-3 rounded-xl border border-cyan-200">
            <span className="text-[10px] font-bold uppercase text-cyan-800 block">
              Học Lực Mức Khá
            </span>
            <span className="text-lg font-black text-cyan-950">
              {stats.hocTapKha} / {students.length} <span className="text-xs font-normal">({((stats.hocTapKha / (students.length || 1)) * 100).toFixed(0)}%)</span>
            </span>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">
              Rèn Luyện Mức Tốt
            </span>
            <span className="text-lg font-black text-amber-950">
              {stats.renLuyenTot} / {students.length} <span className="text-xs font-normal">({((stats.renLuyenTot / (students.length || 1)) * 100).toFixed(0)}%)</span>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-semibold">Tổ:</span>
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedGroup === 'all'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả
              </button>
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(g)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedGroup === g
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tổ {g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs ml-0 sm:ml-2">
              <span className="text-slate-500 font-semibold">Lọc Học lực:</span>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="all">Tất cả các mức</option>
                <option value="Tốt">Mức Tốt</option>
                <option value="Khá">Mức Khá</option>
                <option value="Đạt">Mức Đạt</option>
                <option value="Chưa đạt">Mức Chưa đạt</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc nội dung nhận xét..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Main TT22 Evaluation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-3 text-center w-10">STT</th>
                <th className="px-3 py-3 w-40">Học Sinh</th>
                <th className="px-2 py-3 text-center w-14">ĐTB</th>
                <th className="px-2 py-3 text-center w-24">Rèn Luyện</th>
                <th className="px-2 py-3 text-center w-24">Học Tập</th>
                <th className="px-3 py-3 min-w-[220px]">Nhận Xét Phẩm Chất</th>
                <th className="px-3 py-3 min-w-[220px]">Nhận Xét Năng Lực</th>
                <th className="px-3 py-3 min-w-[280px]">Nhận Xét Chung GVCN (VnEdu)</th>
                <th className="px-2 py-3 text-center w-28">Khen Thưởng</th>
                <th className="px-2 py-3 text-center w-20">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const evalData = s.tt22Evaluation || generateTT22CommentForStudent(s);
                  const dtb = s.grades?.dtbChung ?? (s.category === 'gifted' ? 8.8 : s.category === 'difficult' ? 5.2 : 7.6);

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-3 py-3 text-center font-bold text-slate-400">
                        {s.stt}
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {s.studentCode || `VNE9A1${String(s.stt).padStart(3, '0')}`} • Tổ {s.group}
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center font-black font-mono text-emerald-900 bg-emerald-50/40">
                        {dtb.toFixed(1)}
                      </td>

                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={evalData.renLuyen}
                          onChange={(e) => handleFieldChange(s.id, 'renLuyen', e.target.value)}
                          className={`w-full py-1 px-1.5 text-[11px] font-bold rounded-lg border focus:outline-hidden ${
                            evalData.renLuyen === 'Tốt'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : evalData.renLuyen === 'Khá'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Đạt">Đạt</option>
                          <option value="Chưa đạt">Chưa đạt</option>
                        </select>
                      </td>

                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={evalData.hocTap}
                          onChange={(e) => handleFieldChange(s.id, 'hocTap', e.target.value)}
                          className={`w-full py-1 px-1.5 text-[11px] font-bold rounded-lg border focus:outline-hidden ${
                            evalData.hocTap === 'Tốt'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : evalData.hocTap === 'Khá'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : evalData.hocTap === 'Đạt'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Đạt">Đạt</option>
                          <option value="Chưa đạt">Chưa đạt</option>
                        </select>
                      </td>

                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          rows={2}
                          value={evalData.phamChat}
                          onChange={(e) => handleFieldChange(s.id, 'phamChat', e.target.value)}
                          className="w-full p-1.5 text-[11px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden leading-snug"
                        />
                      </td>

                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          rows={2}
                          value={evalData.nangLuc}
                          onChange={(e) => handleFieldChange(s.id, 'nangLuc', e.target.value)}
                          className="w-full p-1.5 text-[11px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden leading-snug"
                        />
                      </td>

                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          rows={2}
                          value={evalData.nhanXetChung}
                          onChange={(e) => handleFieldChange(s.id, 'nhanXetChung', e.target.value)}
                          className="w-full p-1.5 text-[11px] font-medium text-slate-900 bg-emerald-50/20 hover:bg-white focus:bg-white border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-hidden leading-snug"
                        />
                      </td>

                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={evalData.khenThuong || 'Không'}
                          onChange={(e) => handleFieldChange(s.id, 'khenThuong', e.target.value)}
                          className="w-full py-1 px-1.5 text-[10px] font-bold rounded-lg border border-slate-200 bg-white focus:outline-hidden"
                        >
                          <option value="Không">Không</option>
                          <option value="Học sinh Giỏi">HS Giỏi</option>
                          <option value="Học sinh Xuất sắc">HS Xuất sắc</option>
                          <option value="Khen thưởng chuyên đề">Chuyên đề</option>
                        </select>
                      </td>

                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => handleSingleAutoGenerate(s.id, e)}
                            title="Gợi ý câu nhận xét mới"
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-md transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectStudent(s)}
                            title="Xem hồ sơ toàn diện 360°"
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-md transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Đã nhập dữ liệu TT22 cho <strong>{students.length}</strong> học sinh • Mọi chỉnh sửa được tự động lưu ngay lập tức
          </span>
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Bảng Nhận Xét Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Modal Ngân Hàng Câu Nhận Xét TT22 */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Ngân Hàng Câu Nhận Xét Chuẩn Thông Tư 22/2021/TT-BGDĐT</h3>
              </div>
              <button
                onClick={() => setShowBankModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin text-xs">
              {/* Phẩm chất */}
              <div>
                <h4 className="text-sm font-black text-emerald-900 uppercase border-b pb-2 mb-3">
                  1. Gợi Ý Nhận Xét 5 Phẩm Chất Chủ Yếu
                </h4>
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Mức Tốt:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {TT22_COMMENT_BANK.phamChat.tot.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">Mức Khá:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {TT22_COMMENT_BANK.phamChat.kha.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">Mức Đạt:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {TT22_COMMENT_BANK.phamChat.dat.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Năng lực */}
              <div>
                <h4 className="text-sm font-black text-emerald-900 uppercase border-b pb-2 mb-3">
                  2. Gợi Ý Nhận Xét Năng Lực Cốt Lõi
                </h4>
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Mức Tốt:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {TT22_COMMENT_BANK.nangLuc.tot.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">Mức Khá:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {TT22_COMMENT_BANK.nangLuc.kha.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lời nhận xét chung của GVCN */}
              <div>
                <h4 className="text-sm font-black text-emerald-900 uppercase border-b pb-2 mb-3">
                  3. Gợi Ý Lời Nhận Xét Tổng Hợp Của GVCN (Vào Học Bạ / VnEdu)
                </h4>
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Học sinh Xuất sắc / Giỏi:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {[...TT22_COMMENT_BANK.nhanXetChung.xuatSac, ...TT22_COMMENT_BANK.nhanXetChung.gioi].map(
                        (c, i) => (
                          <li key={i}>{c}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">Học sinh Khá:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {TT22_COMMENT_BANK.nhanXetChung.kha.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">Học sinh Đạt / Cần Cố Gắng:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {[...TT22_COMMENT_BANK.nhanXetChung.dat, ...TT22_COMMENT_BANK.nhanXetChung.chuaDat].map(
                        (c, i) => (
                          <li key={i}>{c}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Đóng Ngân Hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
