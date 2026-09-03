import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { GvcnStudent, GvcnClassRule, GvcnLogEntry } from '../../types';

interface GvcnQuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: GvcnStudent[];
  rules: GvcnClassRule[];
  activeWeek: number;
  onSaveLog: (log: GvcnLogEntry) => void;
}

export const GvcnQuickLogModal: React.FC<GvcnQuickLogModalProps> = ({
  isOpen,
  onClose,
  students,
  rules,
  activeWeek,
  onSaveLog,
}) => {
  const [studentId, setStudentId] = useState<string>('');
  const [logType, setLogType] = useState<'violation' | 'merit'>('violation');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [points, setPoints] = useState<number>(-2);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [status, setStatus] = useState<GvcnLogEntry['status']>('resolved');

  if (!isOpen) return null;

  const handleRuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    setSelectedRuleId(rId);
    const rule = rules.find((r) => r.id === rId);
    if (rule) {
      if (logType === 'violation') {
        setPoints(rule.penaltyPoints);
        setCustomDesc(rule.title);
      } else {
        setPoints(rule.rewardPoints);
        setCustomDesc(rule.title);
      }
    }
  };

  const handleTypeToggle = (type: 'violation' | 'merit') => {
    setLogType(type);
    if (type === 'violation') {
      setPoints(-2);
    } else {
      setPoints(5);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === studentId);
    if (!student || !customDesc.trim()) return;

    const newLog: GvcnLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      week: activeWeek,
      studentId: student.id,
      studentName: student.name,
      group: student.group,
      type: logType,
      category: 'chuyen_can',
      description: customDesc.trim(),
      points: Number(points),
      status,
      resolutionNote: resolutionNote.trim() || undefined,
    };

    onSaveLog(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {logType === 'violation' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <Award className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-sm font-bold">
              Ghi Nhận Nề Nếp & Việc Tốt — Tuần {activeWeek}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Type switch */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeToggle('violation')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                logType === 'violation'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Vi phạm nề nếp</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('merit')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                logType === 'merit'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Việc tốt / Khen thưởng</span>
            </button>
          </div>

          {/* Student selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Chọn Học sinh ghi nhận
            </label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stt}. {s.name} (Tổ {s.group})
                </option>
              ))}
            </select>
          </div>

          {/* Preset Rule selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Chọn nhanh theo Quy chế nề nếp (Tùy chọn)
            </label>
            <select
              value={selectedRuleId}
              onChange={handleRuleChange}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
            >
              <option value="">-- Chọn theo bảng quy định --</option>
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.categoryLabel}] {r.title} ({logType === 'violation' ? r.penaltyPoints : `+${r.rewardPoints}`}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Chi tiết hành vi / Sự việc
            </label>
            <textarea
              required
              rows={2}
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder={
                logType === 'violation'
                  ? 'Ví dụ: Đi học muộn 10 phút, quên mang bảng nhóm...'
                  : 'Ví dụ: Đạt điểm 10 miệng Toán, nhặt được của rơi trả bạn...'
              }
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Points & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Điểm cộng / trừ
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className={`w-full p-2 rounded-xl font-bold border focus:outline-none ${
                  points < 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trạng thái xử lý
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
              >
                <option value="resolved">Đã uốn nắn / tuyên dương</option>
                <option value="pending">Đang theo dõi</option>
                <option value="parent_notified">Đã báo Phụ huynh</option>
              </select>
            </div>
          </div>

          {/* Resolution note */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Biện pháp sư phạm của GVCN / Cam kết của học sinh
            </label>
            <input
              type="text"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Nhắc nhở riêng, giao việc bù, khen ngợi dưới cờ..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-xs"
            >
              Lưu ghi nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
