import React, { useState } from 'react';
import {
  Users,
  Search,
  X,
  Printer,
  Phone,
  UserCheck,
  Shield,
  Download,
  Filter,
} from 'lucide-react';
import { GvcnStudent, GvcnClassInfo } from '../../types';

interface GvcnStudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: GvcnStudent[];
  classInfo: GvcnClassInfo;
  onSelectStudent?: (student: GvcnStudent) => void;
}

export const GvcnStudentListModal: React.FC<GvcnStudentListModalProps> = ({
  isOpen,
  onClose,
  students,
  classInfo,
  onSelectStudent,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) => {
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
      (s.parentName || '').toLowerCase().includes(q) ||
      (s.parentPhone || '').includes(searchQuery);
    return matchGroup && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
              <Users className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Danh Sách Học Sinh & Hồ Sơ Liên Lạc {classInfo.className}</span>
                <span className="px-2 py-0.5 text-xs bg-emerald-700/60 text-emerald-100 rounded-full font-semibold">
                  Sĩ số: {classInfo.totalStudents} HS ({classInfo.maleCount} Nam, {classInfo.femaleCount} Nữ)
                </span>
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                GVCN: {classInfo.homeroomTeacher} • {classInfo.schoolName} ({classInfo.academicYear})
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

        {/* Filters and search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedGroup === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Toàn bộ lớp ({students.length})
            </button>
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedGroup === g
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Tổ {g} ({students.filter((s) => s.group === g).length})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên HS, phụ huynh, SĐT..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-52 sm:w-64"
              />
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-medium hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In danh sách</span>
            </button>
          </div>
        </div>

        {/* Table container */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3 text-center">Giới tính</th>
                  <th className="p-3 text-center">Ngày sinh</th>
                  <th className="p-3 text-center">Tổ</th>
                  <th className="p-3">Chức vụ / Nhiệm vụ</th>
                  <th className="p-3">Họ tên Phụ huynh</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Đặc điểm / Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                    className="hover:bg-emerald-50/60 transition-colors cursor-pointer"
                  >
                    <td className="p-3 text-center font-bold text-slate-500">
                      {student.stt}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{student.name}</span>
                        {student.category === 'gifted' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            HSG
                          </span>
                        )}
                        {student.category === 'special_care' && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                            Theo dõi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center text-slate-600">
                      {student.gender}
                    </td>
                    <td className="p-3 text-center text-slate-600 font-medium">
                      {student.dob}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800">
                      Tổ {student.group}
                    </td>
                    <td className="p-3">
                      {student.role ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded border border-emerald-200">
                          {student.role}
                        </span>
                      ) : (
                        <span className="text-slate-400">Học sinh</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {student.parentName}
                    </td>
                    <td className="p-3 text-emerald-800 font-bold">
                      <a href={`tel:${student.parentPhone}`} className="hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {student.parentPhone}
                      </a>
                    </td>
                    <td className="p-3 text-slate-500 italic max-w-xs truncate" title={student.note}>
                      {student.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0 text-xs text-slate-600">
          <span>Hiển thị <strong>{filteredStudents.length}</strong> / {students.length} học sinh</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
