import React, { useState } from 'react';
import {
  User,
  X,
  Phone,
  Printer,
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import {
  GvcnStudent,
  GvcnClassInfo,
  GvcnSpecialStudent,
  GvcnLogEntry,
  GvcnParentContact,
  GvcnTT22Evaluation,
} from '../../types';
import { generateTT22CommentForStudent } from '../../utils/vneduExcel';

interface GvcnStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GvcnStudent | null;
  classInfo: GvcnClassInfo;
  onUpdateStudent: (updated: GvcnStudent) => void;
  specialRecord?: GvcnSpecialStudent;
  logs?: GvcnLogEntry[];
  parentContacts?: GvcnParentContact[];
}

export const GvcnStudentProfileModal: React.FC<GvcnStudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  classInfo,
  onUpdateStudent,
  specialRecord,
  logs = [],
  parentContacts = [],
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'grades' | 'tt22' | 'conduct'>('info');
  const [editEvaluation, setEditEvaluation] = useState<GvcnTT22Evaluation | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !student) return null;

  // Initialize evaluation state if not set
  const currentEvaluation = editEvaluation || student.tt22Evaluation || generateTT22CommentForStudent(student);

  const studentLogs = logs.filter((l) => l.studentId === student.id || l.studentName === student.name);
  const studentContacts = parentContacts.filter(
    (c) => (c.studentName || '').toLowerCase().trim() === (student.name || '').toLowerCase().trim()
  );

  const handleSaveEvaluation = () => {
    const updated: GvcnStudent = {
      ...student,
      tt22Evaluation: {
        ...currentEvaluation,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
      },
    };
    onUpdateStudent(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAutoSuggestTT22 = () => {
    const generated = generateTT22CommentForStudent(student);
    setEditEvaluation(generated);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasGrades = typeof student.grades?.dtbChung === 'number';
  const dtb = hasGrades ? student.grades!.dtbChung! : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none">
        {/* Top Header Card */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white flex-shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner flex-shrink-0">
                {student.gender === 'Nữ' ? '👧' : '👦'}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl font-black text-white">{student.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-700/80 text-emerald-100 border border-emerald-500/40">
                    Mã vnEdu: {student.studentCode || `VNE9A1${String(student.stt).padStart(3, '0')}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/15 text-white">
                    Tổ {student.group}
                  </span>
                  {student.role && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      {student.role}
                    </span>
                  )}
                </div>

                <div className="text-xs text-emerald-200/90 mt-1 flex items-center gap-3 flex-wrap">
                  <span>STT: #{student.stt}</span>
                  <span>•</span>
                  <span>{classInfo.className} ({classInfo.academicYear})</span>
                  <span>•</span>
                  <span>GVCN: {classInfo.homeroomTeacher}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20"
                title="In phiếu học sinh"
              >
                <Printer className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">In Phiếu</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Vital Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-emerald-800/40">
            <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">ĐTB Các Môn</span>
              <span className="text-base font-black text-white">
                {hasGrades && dtb !== null ? dtb.toFixed(1) : '— (Chưa có)'}
              </span>
            </div>
            <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block">Học Lực (TT22)</span>
              <span className="text-base font-black text-white">
                {hasGrades ? currentEvaluation.hocTap : 'Chưa có điểm'}
              </span>
            </div>
            <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Rèn Luyện (TT22)</span>
              <span className="text-base font-black text-white">{currentEvaluation.renLuyen}</span>
            </div>
            <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Khen Thưởng</span>
              <span className="text-xs font-bold text-white block truncate">
                {hasGrades ? (currentEvaluation.khenThuong || 'Chưa xét') : 'Chưa xét (Chờ điểm)'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50 flex-shrink-0 print:hidden overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Lý Lịch & Gia Đình</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'grades'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Bảng Điểm VnEdu</span>
          </button>

          <button
            onClick={() => setActiveTab('tt22')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'tt22'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3. Đánh Giá & Nhận Xét TT22</span>
          </button>

          <button
            onClick={() => setActiveTab('conduct')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'conduct'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Nề Nếp & Liên Lạc CMHS</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          {savedSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Đã lưu thành công nhận xét và thông tin học sinh!</span>
            </div>
          )}

          {/* TAB 1: LÝ LỊCH & GIA ĐÌNH */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thông tin học sinh */}
                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>Thông tin cá nhân học sinh</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Họ và tên:</span>
                      <span className="font-bold text-slate-900">{student.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Mã học sinh (VnEdu):</span>
                      <span className="font-bold font-mono text-emerald-700">
                        {student.studentCode || `VNE9A1${String(student.stt).padStart(3, '0')}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Ngày sinh:</span>
                      <span className="font-bold text-slate-900">{student.dob}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Giới tính:</span>
                      <span className="font-bold text-slate-900">{student.gender}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Tổ sinh hoạt:</span>
                      <span className="font-bold text-slate-900">Tổ {student.group}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Chức vụ trong lớp:</span>
                      <span className="font-bold text-emerald-800">{student.role || 'Học sinh'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-medium">Phân loại học sinh:</span>
                      <span className="font-bold">
                        {student.category === 'gifted' && (
                          <span className="text-emerald-700">⭐ Học sinh Giỏi / Năng khiếu</span>
                        )}
                        {student.category === 'special_care' && (
                          <span className="text-rose-700">⚠️ Cần quan tâm theo dõi</span>
                        )}
                        {student.category === 'difficult' && (
                          <span className="text-amber-700">🧡 Hoàn cảnh khó khăn</span>
                        )}
                        {(!student.category || student.category === 'normal') && (
                          <span className="text-slate-700">Học sinh bình thường</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin phụ huynh & gia đình */}
                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Thông tin gia đình & Liên lạc</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Họ tên Cha/Mẹ/Người giám hộ:</span>
                      <span className="font-bold text-slate-900">{student.parentName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Số điện thoại liên lạc:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{student.parentPhone}</span>
                        <a
                          href={`tel:${student.parentPhone.replace(/[^0-9]/g, '')}`}
                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Gọi ngay</span>
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Địa chỉ thường trú:</span>
                      <span className="font-medium text-slate-900 text-right max-w-[200px]">
                        {student.address || 'Quận Ba Đình, TP. Hà Nội'}
                      </span>
                    </div>
                    <div className="py-2">
                      <span className="text-slate-500 font-medium block mb-1">Ghi chú của GVCN:</span>
                      <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                        {student.note || 'Học sinh chấp hành tốt nề nếp, không có biểu hiện bất thường.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tình trạng đặc biệt nếu có */}
              {specialRecord && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Hồ Sơ Quan Tâm Sư Phạm Của GVCN</span>
                  </h4>
                  <p className="text-xs text-amber-800 mb-2">
                    <strong className="font-bold">Nguyên nhân/Hoàn cảnh:</strong> {specialRecord.circumstance}
                  </p>
                  <p className="text-xs text-amber-800 mb-2">
                    <strong className="font-bold">Biện pháp sư phạm uốn nắn:</strong>{' '}
                    {specialRecord.pedagogicalMeasures}
                  </p>
                  {specialRecord.assignedBuddy && (
                    <p className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>Đôi bạn cùng tiến kèm cặp: {specialRecord.assignedBuddy}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BẢNG ĐIỂM CHI TIẾT VNEDU */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div>
                  <h4 className="text-xs font-black uppercase text-emerald-900">
                    Bảng Điểm VnEdu Học Kỳ — {classInfo.academicYear}
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Hệ thống tính điểm và đánh giá theo Thông tư 22/2021/TT-BGDĐT
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600 font-semibold block">Điểm trung bình các môn:</span>
                  <span className="text-xl font-black text-emerald-800">
                    {hasGrades && dtb !== null ? dtb.toFixed(1) : '—'}
                  </span>
                </div>
              </div>

              {!hasGrades || !student.grades?.subjects || student.grades.subjects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h5 className="font-bold text-sm text-slate-800">Học sinh chưa có điểm số</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hồ sơ em <strong>{student.name}</strong> hiện tại chỉ hiển thị thông tin lý lịch cá nhân.
                      Khi Thầy/Cô tải lên file Excel <strong>Bảng Điểm VnEdu</strong> ở màn hình chính, điểm số tất cả các môn sẽ tự động đồng bộ vào đây.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5">Môn Học</th>
                        <th className="px-3 py-2.5 text-center">ĐĐGtx1</th>
                        <th className="px-3 py-2.5 text-center">ĐĐGtx2</th>
                        <th className="px-3 py-2.5 text-center">ĐĐGtx3</th>
                        <th className="px-3 py-2.5 text-center">ĐĐGgk</th>
                        <th className="px-3 py-2.5 text-center">ĐĐGck</th>
                        <th className="px-3 py-2.5 text-center bg-emerald-50 text-emerald-900 font-black">
                          ĐTBmhk
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {student.grades.subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2 font-bold text-slate-800">{sub.subject}</td>
                          <td className="px-3 py-2 text-center text-slate-600 font-mono">
                            {sub.ddgTx[0] ?? '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600 font-mono">
                            {sub.ddgTx[1] ?? '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600 font-mono">
                            {sub.ddgTx[2] ?? '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600 font-mono font-semibold">
                            {sub.ddgGk ?? '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600 font-mono font-semibold">
                            {sub.ddgCk ?? '-'}
                          </td>
                          <td className="px-3 py-2 text-center font-bold font-mono bg-emerald-50/50 text-emerald-800">
                            {sub.dtbMhk ?? '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ĐÁNH GIÁ & NHẬN XÉT THEO TT22 */}
          {activeTab === 'tt22' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200">
                <div>
                  <h4 className="text-xs font-black uppercase text-blue-900">
                    Đánh Giá Định Kỳ Theo Thông Tư 22/2021/TT-BGDĐT
                  </h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Đánh giá kết quả Rèn luyện, Học tập, 5 Phẩm chất và các Năng lực cốt lõi
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoSuggestTT22}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gợi Ý Chuẩn TT22</span>
                </button>
              </div>

              {/* Rèn luyện & Học tập Mức xếp loại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kết quả Rèn luyện (Hạnh kiểm) theo TT22:
                  </label>
                  <select
                    value={currentEvaluation.renLuyen}
                    onChange={(e) =>
                      setEditEvaluation({
                        ...currentEvaluation,
                        renLuyen: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Tốt">Tốt (Ý thức tự giác, nề nếp gương mẫu)</option>
                    <option value="Khá">Khá (Chấp hành tốt nội quy)</option>
                    <option value="Đạt">Đạt (Có cố gắng, còn nhắc nhở)</option>
                    <option value="Chưa đạt">Chưa đạt (Vi phạm nhiều lần)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kết quả Học tập (Học lực) theo TT22:
                  </label>
                  <select
                    value={currentEvaluation.hocTap}
                    onChange={(e) =>
                      setEditEvaluation({
                        ...currentEvaluation,
                        hocTap: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Tốt">Tốt (ĐTB ≥ 8.0, không môn &lt; 6.5)</option>
                    <option value="Khá">Khá (ĐTB ≥ 6.5, không môn &lt; 5.0)</option>
                    <option value="Đạt">Đạt (ĐTB ≥ 5.0, không môn &lt; 3.5)</option>
                    <option value="Chưa đạt">Chưa đạt</option>
                  </select>
                </div>
              </div>

              {/* 5 Phẩm chất chủ yếu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận xét về 5 Phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm):
                </label>
                <textarea
                  rows={2}
                  value={currentEvaluation.phamChat}
                  onChange={(e) =>
                    setEditEvaluation({
                      ...currentEvaluation,
                      phamChat: e.target.value,
                    })
                  }
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Năng lực cốt lõi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận xét về Năng lực cốt lõi (Tự chủ & tự học, Giao tiếp & hợp tác, Sáng tạo, Năng lực đặc thù):
                </label>
                <textarea
                  rows={2}
                  value={currentEvaluation.nangLuc}
                  onChange={(e) =>
                    setEditEvaluation({
                      ...currentEvaluation,
                      nangLuc: e.target.value,
                    })
                  }
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Lời nhận xét chung của GVCN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời nhận xét chung của GVCN (Dùng nhập Học bạ / Sổ điểm điện tử VnEdu):
                </label>
                <textarea
                  rows={3}
                  value={currentEvaluation.nhanXetChung}
                  onChange={(e) =>
                    setEditEvaluation({
                      ...currentEvaluation,
                      nhanXetChung: e.target.value,
                    })
                  }
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900 leading-relaxed"
                />
              </div>

              {/* Khen thưởng */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Danh hiệu thi đua / Khen thưởng:
                </label>
                <select
                  value={currentEvaluation.khenThuong || 'Không'}
                  onChange={(e) =>
                    setEditEvaluation({
                      ...currentEvaluation,
                      khenThuong: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Không">Không khen thưởng</option>
                  <option value="Học sinh Giỏi">Học sinh Giỏi (Rèn luyện Tốt, Học tập Tốt)</option>
                  <option value="Học sinh Xuất sắc">
                    Học sinh Xuất sắc (Rèn luyện Tốt, Học tập Tốt, có ít nhất 6 môn ≥ 9.0)
                  </option>
                  <option value="Khen thưởng chuyên đề">Khen thưởng chuyên đề / Hoạt động phong trào</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Nhận Xét & Đánh Giá TT22</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NỀ NẾP & LIÊN LẠC CMHS */}
          {activeTab === 'conduct' && (
            <div className="space-y-6">
              {/* Nhật ký việc tốt & vi phạm */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Lịch Sử Thi Đua Nề Nếp & Việc Tốt ({studentLogs.length} lần ghi nhận)</span>
                </h4>

                {studentLogs.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                    Chưa có vi phạm hay trừ điểm nào ghi nhận trong sổ nề nếp tuần.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                          log.type === 'merit'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-rose-50/70 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Tuần {log.week} ({log.date})</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                log.type === 'merit'
                                  ? 'bg-emerald-200 text-emerald-800'
                                  : 'bg-rose-200 text-rose-800'
                              }`}
                            >
                              {log.type === 'merit' ? `+${log.points}đ (Việc tốt)` : `${log.points}đ (Vi phạm)`}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-700">{log.description}</p>
                          {log.resolutionNote && (
                            <p className="mt-1 text-[11px] text-emerald-800 font-medium">
                              Biện pháp GVCN: {log.resolutionNote}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nhật ký liên lạc phụ huynh */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Nhật Ký Trao Đổi Phụ Huynh ({studentContacts.length} cuộc liên lạc)</span>
                </h4>

                {studentContacts.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                    Chưa có cuộc gọi hoặc buổi làm việc trực tiếp riêng nào được lưu.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {studentContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Ngày {contact.date} — {contact.contactMethod === 'phone' ? 'Gọi điện' : 'Gặp trực tiếp'}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                            {contact.status === 'completed' ? 'Đã phối hợp tốt' : 'Cần theo dõi thêm'}
                          </span>
                        </div>
                        <p className="text-slate-700"><strong className="text-slate-900">Nội dung trao đổi:</strong> {contact.content}</p>
                        <p className="text-slate-700"><strong className="text-slate-900">Ý kiến gia đình:</strong> {contact.parentFeedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            Hồ sơ học sinh lưu trữ chuẩn hệ sinh thái vnEdu & Sổ chủ nhiệm BGD
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Đóng Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
};
