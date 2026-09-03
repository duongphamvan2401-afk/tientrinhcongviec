import React, { useState } from 'react';
import {
  HeartHandshake,
  PhoneCall,
  UserCheck,
  Plus,
  Search,
  MessageSquare,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
  Building2,
} from 'lucide-react';
import {
  GvcnSpecialStudent,
  GvcnParentContact,
  GvcnClassInfo,
  GvcnStudent,
} from '../../types';

interface GvcnSpecialStudentsSectionProps {
  specialStudents: GvcnSpecialStudent[];
  parentContacts: GvcnParentContact[];
  classInfo: GvcnClassInfo;
  students: GvcnStudent[];
  onAddSpecialNote: (studentId: string, note: string, status: 'improving' | 'stable' | 'needs_attention') => void;
  onAddParentContact: (contact: GvcnParentContact) => void;
}

export const GvcnSpecialStudentsSection: React.FC<GvcnSpecialStudentsSectionProps> = ({
  specialStudents,
  parentContacts,
  classInfo,
  students,
  onAddSpecialNote,
  onAddParentContact,
}) => {
  const [subTab, setSubTab] = useState<'students' | 'contacts'>('students');
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<string | null>(null);
  const [newProgressNote, setNewProgressNote] = useState<string>('');
  const [newProgressStatus, setNewProgressStatus] = useState<'improving' | 'stable' | 'needs_attention'>('improving');

  // New parent contact modal state
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [contactStudentName, setContactStudentName] = useState<string>('');
  const [contactParentName, setContactParentName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactMethod, setContactMethod] = useState<GvcnParentContact['contactMethod']>('phone');
  const [contactReason, setContactReason] = useState<string>('');
  const [contactContent, setContactContent] = useState<string>('');
  const [contactAgreement, setContactAgreement] = useState<string>('');

  const handleStudentSelectForContact = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentName = e.target.value;
    setContactStudentName(studentName);
    const found = students.find((s) => s.name === studentName);
    if (found) {
      setContactParentName(found.parentName);
      setContactPhone(found.parentPhone);
    }
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactStudentName || !contactContent) return;

    const newContact: GvcnParentContact = {
      id: `contact-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN'),
      studentName: contactStudentName,
      parentName: contactParentName || 'Phụ huynh học sinh',
      phone: contactPhone || 'Chưa cập nhật',
      contactMethod,
      reason: contactReason || 'Trao đổi tình hình học tập và rèn luyện',
      content: contactContent,
      parentFeedback: 'Phụ huynh ghi nhận và cam kết phối hợp cùng GVCN.',
      resultAgreement: contactAgreement || 'Tiếp tục theo dõi đôn đốc học sinh tại nhà.',
      status: 'completed',
    };

    onAddParentContact(newContact);
    setShowAddContactModal(false);
    setContactContent('');
    setContactReason('');
    setContactAgreement('');
  };

  const handleSaveProgressNote = (specialStudentId: string) => {
    if (!newProgressNote.trim()) return;
    onAddSpecialNote(specialStudentId, newProgressNote.trim(), newProgressStatus);
    setNewProgressNote('');
    setSelectedStudentForNote(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Pedagogical Insight Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 flex-shrink-0">
          <HeartHandshake className="w-5 h-5 text-blue-300" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Theo Dõi Học Sinh Cần Quan Tâm Đặc Biệt & Phối Hợp Gia Đình (CMHS)</span>
            <span className="px-2 py-0.5 text-[10px] bg-blue-400/20 text-blue-200 rounded-full font-semibold border border-blue-400/30">
              Nghệ thuật Sư phạm GVCN
            </span>
          </h3>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            <strong>Bí quyết của GVCN dày dạn kinh nghiệm:</strong> <em>"Không có học sinh cá biệt, chỉ có học sinh chưa được thấu hiểu đúng cách."</em> Việc phân hóa đối tượng (hoàn cảnh khó khăn, hổng kiến thức, tâm lý lứa tuổi dậy thì) kết hợp với kênh liên lạc kịp thời, tế nhị cùng phụ huynh giúp cảm hóa và nâng đỡ từng học sinh tiến bộ vững chắc.
          </p>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('students')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'students'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Học sinh Cần Quan Tâm Đặc Biệt ({specialStudents.length} em)</span>
          </button>

          <button
            onClick={() => setSubTab('contacts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              subTab === 'contacts'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Nhật Ký Liên Lạc Phụ Huynh ({parentContacts.length} lượt)</span>
          </button>
        </div>

        {subTab === 'contacts' && (
          <button
            onClick={() => setShowAddContactModal(true)}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi nhận liên lạc PH</span>
          </button>
        )}
      </div>

      {/* TAB A: HỌC SINH CẦN QUAN TÂM ĐẶC BIỆT */}
      {subTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {specialStudents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900">
                        {item.studentName}
                      </h4>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold border border-slate-200">
                        Tổ {item.group}
                      </span>
                    </div>
                    <span
                      className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'yeu_kem'
                          ? 'bg-rose-100 text-rose-800'
                          : item.type === 'kho_khan'
                          ? 'bg-amber-100 text-amber-800'
                          : item.type === 'ca_biet'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      ● {item.typeLabel}
                    </span>
                  </div>

                  {item.assignedBuddy && (
                    <div className="text-right text-[11px] bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <div className="text-[10px] text-emerald-700 font-semibold uppercase">Đôi bạn cùng tiến</div>
                      <div className="font-bold">{item.assignedBuddy}</div>
                    </div>
                  )}
                </div>

                {/* Hoàn cảnh & Biện pháp sư phạm */}
                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <strong className="text-slate-800 block mb-1">
                      Hoàn cảnh & Nguyên nhân:
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      {item.circumstance}
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <strong className="text-emerald-950 block mb-1">
                      Biện pháp uốn nắn tích cực của GVCN:
                    </strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {item.pedagogicalMeasures}
                    </p>
                  </div>
                </div>

                {/* Lịch sử theo dõi tiến bộ */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nhật ký ghi nhận chuyển biến tiến bộ:</span>
                  </div>

                  <div className="space-y-1.5">
                    {item.progressNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <span className="font-bold text-slate-700 mr-1.5">
                            [{note.date}]:
                          </span>
                          <span className="text-slate-600">{note.note}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded flex-shrink-0">
                          {note.status === 'improving' ? '📈 Tiến bộ' : 'Đang theo dõi'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Progress Note Button / Form */}
              <div className="pt-2">
                {selectedStudentForNote === item.id ? (
                  <div className="bg-slate-50 p-3 rounded-xl border border-emerald-200 space-y-2 text-xs animate-fade-in">
                    <textarea
                      rows={2}
                      value={newProgressNote}
                      onChange={(e) => setNewProgressNote(e.target.value)}
                      placeholder="Ghi nhận biểu hiện tiến bộ mới nhất của học sinh..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={newProgressStatus}
                        onChange={(e) => setNewProgressStatus(e.target.value as any)}
                        className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="improving">Có chuyển biến tốt</option>
                        <option value="stable">Duy trì ổn định</option>
                        <option value="needs_attention">Cần chú ý thêm</option>
                      </select>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForNote(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveProgressNote(item.id)}
                          className="px-3 py-1 bg-emerald-800 text-white rounded-lg text-xs font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedStudentForNote(item.id)}
                    className="w-full py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-dashed border-slate-300 hover:border-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ghi nhận chuyển biến tiến bộ của em</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB B: NHẬT KÝ LIÊN LẠC PHỤ HUYNH */}
      {subTab === 'contacts' && (
        <div className="space-y-5">
          {/* Ban đại diện CMHS Contact card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-4.5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Thường Trực Ban Đại Diện Cha Mẹ Học Sinh Lớp 9A1</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Trưởng ban đại diện:</span>
                <span className="font-bold text-slate-900 block text-sm">{classInfo.parentCommittee.head}</span>
                <span className="text-emerald-800 font-semibold flex items-center gap-1 mt-1">
                  <PhoneCall className="w-3 h-3" /> {classInfo.parentCommittee.headPhone}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Phó ban đại diện:</span>
                <span className="font-bold text-slate-900 block text-sm">{classInfo.parentCommittee.deputy}</span>
                <span className="text-emerald-800 font-semibold flex items-center gap-1 mt-1">
                  <PhoneCall className="w-3 h-3" /> {classInfo.parentCommittee.deputyPhone}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Kênh kết nối chính thức:</span>
                <span className="font-bold text-slate-900 block text-sm">Nhóm Zalo Lớp 9A1 (42/42 PH)</span>
                <span className="text-blue-700 font-semibold flex items-center gap-1 mt-1 underline">
                  <MessageSquare className="w-3 h-3" /> zalo.me/g/lop9a1-lequydon
                </span>
              </div>
            </div>
          </div>

          {/* Contact history cards */}
          <div className="space-y-3">
            {parentContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Học sinh: {contact.studentName}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs text-slate-600 font-medium">
                          Phụ huynh: <strong>{contact.parentName}</strong> ({contact.phone})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Ngày trao đổi: {contact.date} | Hình thức:{' '}
                        {contact.contactMethod === 'phone'
                          ? 'Điện thoại'
                          : contact.contactMethod === 'direct_meeting'
                          ? 'Gặp trực tiếp'
                          : contact.contactMethod === 'zalo'
                          ? 'Tin nhắn Zalo'
                          : 'Thăm nhà'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ Đã thống nhất biện pháp
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-800 block mb-1">
                      Lý do & Nội dung trao đổi của GVCN:
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      {contact.content}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <strong className="text-blue-950 block mb-1">
                      Phản hồi của Phụ huynh & Thỏa thuận phối hợp:
                    </strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {contact.resultAgreement}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Parent Contact */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-700" />
              <span>Ghi Nhận Cuộc Trao Đổi Với Cha Mẹ Học Sinh</span>
            </h3>

            <form onSubmit={handleCreateContact} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chọn Học sinh</label>
                  <select
                    required
                    value={contactStudentName}
                    onChange={handleStudentSelectForContact}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="">-- Chọn học sinh trong lớp --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.stt}. {s.name} (Tổ {s.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức trao đổi</label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="phone">Gọi điện thoại</option>
                    <option value="direct_meeting">Mời gặp trực tiếp tại trường</option>
                    <option value="zalo">Nhắn tin Zalo</option>
                    <option value="home_visit">Đến thăm gia đình</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ tên Phụ huynh</label>
                  <input
                    type="text"
                    value={contactParentName}
                    onChange={(e) => setContactParentName(e.target.value)}
                    placeholder="Bác / Cô..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="09xx.xxx.xxx"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý do liên lạc</label>
                <input
                  type="text"
                  value={contactReason}
                  onChange={(e) => setContactReason(e.target.value)}
                  placeholder="Ví dụ: Thông báo việc học sinh thường xuyên ngủ gật trong giờ học..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung trao đổi cụ thể</label>
                <textarea
                  required
                  rows={3}
                  value={contactContent}
                  onChange={(e) => setContactContent(e.target.value)}
                  placeholder="GVCN thông báo tình hình, tìm hiểu nguyên nhân gia đình..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kết quả & Thỏa thuận phối hợp của phụ huynh</label>
                <textarea
                  rows={2}
                  value={contactAgreement}
                  onChange={(e) => setContactAgreement(e.target.value)}
                  placeholder="Phụ huynh nhất trí giải pháp, cam kết đôn đốc con tại nhà..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold"
                >
                  Lưu vào nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
