import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Users,
  Award,
  AlertTriangle,
  Calendar,
  Sparkles,
  Printer,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { GvcnWeeklyRecord } from '../../types';

interface GvcnMeetingSectionProps {
  activeWeek: number;
  weeklyRecord: GvcnWeeklyRecord | undefined;
  onUpdateMeetingMinutes: (week: number, minutes: NonNullable<GvcnWeeklyRecord['meetingMinutes']>) => void;
}

export const GvcnMeetingSection: React.FC<GvcnMeetingSectionProps> = ({
  activeWeek,
  weeklyRecord,
  onUpdateMeetingMinutes,
}) => {
  const initialMinutes = weeklyRecord?.meetingMinutes || {
    date: `Thứ Bảy cuối tuần ${activeWeek} (Tiết 5)`,
    teacherComment: 'Lớp giữ vững nề nếp tốt. Ban cán sự điều hành có trách nhiệm. Cần tiếp tục duy trì tinh thần tự học và chuẩn bị bài chu đáo.',
    monitorReport: 'Lớp trưởng báo cáo: Sĩ số 42/42 duy trì đều đặn. 4 tổ đều đạt trên 95 điểm. Nề nếp trực nhật sạch sẽ.',
    specialNotices: 'Nhắc nhở học sinh mang đầy đủ đồ dùng học tập bộ môn Toán và KHTN. Đội viên đeo khăn quàng đỏ đầy đủ.',
    nextWeekGoals: 'Phấn đấu dẫn đầu thi đua toàn trường. Tăng cường phong trào "Đôi bạn cùng tiến" môn Toán và Tiếng Anh.',
    commendations: ['Tổ 1 (Đạt cờ luân lưu thi đua tuần)', 'Lê Hoàng Nam (Gương sáng học tập)', 'Trần Minh Anh (Gương mẫu nề nếp)'],
    reminders: ['Trần Đình Trọng (Chấn chỉnh giờ giấc)', 'Chu Thành Nam (Làm bài tập đầy đủ)'],
  };

  const [minutes, setMinutes] = useState(initialMinutes);
  const [saveToast, setSaveToast] = useState(false);

  // New commendation / reminder inputs
  const [newCommendation, setNewCommendation] = useState('');
  const [newReminder, setNewReminder] = useState('');

  const handleSave = () => {
    onUpdateMeetingMinutes(activeWeek, minutes);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const addCommendation = () => {
    if (!newCommendation.trim()) return;
    setMinutes((prev) => ({
      ...prev,
      commendations: [...prev.commendations, newCommendation.trim()],
    }));
    setNewCommendation('');
  };

  const removeCommendation = (idx: number) => {
    setMinutes((prev) => ({
      ...prev,
      commendations: prev.commendations.filter((_, i) => i !== idx),
    }));
  };

  const addReminder = () => {
    if (!newReminder.trim()) return;
    setMinutes((prev) => ({
      ...prev,
      reminders: [...prev.reminders, newReminder.trim()],
    }));
    setNewReminder('');
  };

  const removeReminder = (idx: number) => {
    setMinutes((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Pedagogical Note Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 flex-shrink-0">
            <FileText className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Sổ Biên Bản Sinh Hoạt Lớp Cuối Tuần — Tuần {activeWeek}</span>
              <span className="px-2 py-0.5 text-[11px] bg-teal-500/30 text-teal-200 rounded-full font-semibold border border-teal-400/30">
                Quy trình 5 bước kinh nghiệm
              </span>
            </h3>
            <p className="text-xs text-teal-200/90 mt-1 leading-relaxed max-w-3xl">
              Tiết sinh hoạt lớp là thời khắc giáo dục nhân cách quý giá nhất trong tuần. Quy trình mẫu mực gồm: (1) Cán sự lớp báo cáo → (2) 4 Tổ trưởng nhận xét chéo → (3) GVCN biểu dương & định hướng uốn nắn → (4) Triển khai kế hoạch tuần tới → (5) Sinh hoạt chuyên đề kỹ năng sống.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <Printer className="w-3.5 h-3.5 text-teal-200" />
            <span>In biên bản</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Lưu sổ tuần {activeWeek}</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Đã lưu thành công Biên bản sinh hoạt lớp Tuần {activeWeek}!</span>
        </div>
      )}

      {/* Main Protocol Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
        {/* Step 1 & 2: Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">1</span>
              <span>Báo cáo của Lớp trưởng & Ban cán sự lớp</span>
            </label>
            <textarea
              rows={4}
              value={minutes.monitorReport}
              onChange={(e) => setMinutes({ ...minutes, monitorReport: e.target.value })}
              placeholder="Tình hình sĩ số, nề nếp truy bài, các tiết học tốt trong tuần..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">2</span>
              <span>Thời gian & Địa điểm sinh hoạt</span>
            </label>
            <input
              type="text"
              value={minutes.date}
              onChange={(e) => setMinutes({ ...minutes, date: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800 mb-2"
            />
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>Thành phần tham dự:</strong> Thầy GVCN Nguyễn Văn Trọng cùng toàn thể 42 học sinh Lớp 9A1.
            </div>
          </div>
        </div>

        {/* Step 3: Teacher Comment & Evaluation */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] font-black flex items-center justify-center">3</span>
            <span>Đánh giá & Nhận xét sư phạm của Giáo viên Chủ nhiệm</span>
          </label>
          <textarea
            rows={4}
            value={minutes.teacherComment}
            onChange={(e) => setMinutes({ ...minutes, teacherComment: e.target.value })}
            placeholder="GVCN nhận xét tổng thể tình hình học tập, nề nếp, đạo đức, những chuyển biến tích cực và điểm cần chấn chỉnh..."
            className="w-full text-xs p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed text-slate-800 font-medium"
          />
        </div>

        {/* Commendations & Reminders Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          {/* Tuyên dương */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Tuyên dương & Biểu dương cá nhân / Tổ</span>
              </h4>
              <span className="text-[11px] font-bold text-emerald-700">
                {minutes.commendations.length} nội dung
              </span>
            </div>

            <div className="space-y-1.5">
              {minutes.commendations.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-100 text-xs text-slate-800"
                >
                  <span className="font-medium text-emerald-950">⭐ {item}</span>
                  <button
                    onClick={() => removeCommendation(idx)}
                    className="text-slate-400 hover:text-rose-600 text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newCommendation}
                onChange={(e) => setNewCommendation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCommendation()}
                placeholder="Nhập tên HS / thành tích tuyên dương..."
                className="flex-1 text-xs p-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addCommendation}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Nhắc nhở */}
          <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Nhắc nhở & Biện pháp uốn nắn khuyết điểm</span>
              </h4>
              <span className="text-[11px] font-bold text-rose-700">
                {minutes.reminders.length} nội dung
              </span>
            </div>

            <div className="space-y-1.5">
              {minutes.reminders.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-lg border border-rose-100 text-xs text-slate-800"
                >
                  <span className="font-medium text-rose-950">⚠️ {item}</span>
                  <button
                    onClick={() => removeReminder(idx)}
                    className="text-slate-400 hover:text-rose-600 text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                placeholder="Nhập nội dung nhắc nhở uốn nắn..."
                className="flex-1 text-xs p-2 bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={addReminder}
                className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Step 4: Next Week Goals */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">4</span>
            <span>Phương hướng & Kế hoạch trọng tâm Tuần tiếp theo</span>
          </label>
          <textarea
            rows={3}
            value={minutes.nextWeekGoals}
            onChange={(e) => setMinutes({ ...minutes, nextWeekGoals: e.target.value })}
            placeholder="Nêu rõ chỉ tiêu thi đua, kế hoạch kiểm tra bài cũ, các hoạt động của tuần tới..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed text-slate-800 font-medium"
          />
        </div>

        {/* Step 5: Special notices */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">5</span>
            <span>Nội dung dặn dò của nhà trường & Sinh hoạt chuyên đề đạo đức</span>
          </label>
          <textarea
            rows={2}
            value={minutes.specialNotices}
            onChange={(e) => setMinutes({ ...minutes, specialNotices: e.target.value })}
            placeholder="Thông báo lịch thi, đồng phục, họp phụ huynh, hoạt động ngoại khóa..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed text-slate-800 font-medium"
          />
        </div>
      </div>
    </div>
  );
};
