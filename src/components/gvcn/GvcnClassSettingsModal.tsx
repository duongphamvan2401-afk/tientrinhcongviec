import React, { useState } from 'react';
import {
  Settings,
  X,
  Save,
  School,
  User,
  Users,
  Building,
  Phone,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { GvcnClassInfo } from '../../types';

interface GvcnClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: GvcnClassInfo;
  onSaveClassInfo: (updated: GvcnClassInfo) => void;
}

export const GvcnClassSettingsModal: React.FC<GvcnClassSettingsModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  onSaveClassInfo,
}) => {
  const [formData, setFormData] = useState<GvcnClassInfo>(classInfo);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassInfo(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
              <Settings className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tùy Chỉnh Thông Tin Lớp Chủ Nhiệm & Giáo Viên
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Cập nhật thông tin lớp, tên GVCN, năm học và ban đại diện CMHS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 scrollbar-thin">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Đã lưu thành công thông tin lớp và GVCN!</span>
            </div>
          )}

          {/* 1. Thông tin định danh cơ bản */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-700" />
              <span>Thông tin Trường & Lớp Chủ Nhiệm</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Lớp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="ví dụ: Lớp 9A1, Lớp 8B..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khối Lớp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="ví dụ: 9, 8, 7, 6..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Giáo Viên Chủ Nhiệm (GVCN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.homeroomTeacher}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                  placeholder="ví dụ: Thầy Nguyễn Văn Trọng..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Năm Học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="ví dụ: 2026 - 2027"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Trường Học
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="ví dụ: Trường THCS Lê Quý Đôn"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phòng Học & Vị Trí
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="ví dụ: Phòng 204 — Khu nhà B (Tầng 2)"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Ban Cán Sự Lớp */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Ban Cán Sự Lớp (Cán Sự Điều Hành)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp Trưởng
                </label>
                <input
                  type="text"
                  value={formData.boardOfLeaders.monitor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boardOfLeaders: { ...formData.boardOfLeaders, monitor: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp Phó Học Tập
                </label>
                <input
                  type="text"
                  value={formData.boardOfLeaders.viceMonitorStudy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boardOfLeaders: { ...formData.boardOfLeaders, viceMonitorStudy: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp Phó Kỷ Luật & Nề Nếp
                </label>
                <input
                  type="text"
                  value={formData.boardOfLeaders.viceMonitorDiscipline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boardOfLeaders: {
                        ...formData.boardOfLeaders,
                        viceMonitorDiscipline: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thủ Quỹ Lớp
                </label>
                <input
                  type="text"
                  value={formData.boardOfLeaders.treasurer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boardOfLeaders: { ...formData.boardOfLeaders, treasurer: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bí Thư Chi Đội (Đoàn/Đội)
                </label>
                <input
                  type="text"
                  value={formData.boardOfLeaders.secretary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boardOfLeaders: { ...formData.boardOfLeaders, secretary: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 3. Ban Đại Diện Cha Mẹ Học Sinh (CMHS) */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Ban Đại Diện Cha Mẹ Học Sinh (CMHS)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trưởng Ban Đại Diện CMHS
                </label>
                <input
                  type="text"
                  value={formData.parentCommittee.head}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentCommittee: { ...formData.parentCommittee, head: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SĐT Trưởng Ban
                </label>
                <input
                  type="text"
                  value={formData.parentCommittee.headPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentCommittee: { ...formData.parentCommittee, headPhone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phó Ban Đại Diện CMHS
                </label>
                <input
                  type="text"
                  value={formData.parentCommittee.deputy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentCommittee: { ...formData.parentCommittee, deputy: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SĐT Phó Ban
                </label>
                <input
                  type="text"
                  value={formData.parentCommittee.deputyPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentCommittee: { ...formData.parentCommittee, deputyPhone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link Nhóm Zalo Phụ Huynh Lớp
                </label>
                <input
                  type="text"
                  value={formData.parentCommittee.zaloGroupLink || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentCommittee: { ...formData.parentCommittee, zaloGroupLink: e.target.value },
                    })
                  }
                  placeholder="https://zalo.me/g/..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
