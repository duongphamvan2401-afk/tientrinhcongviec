import React, { useState } from 'react';
import { X, Plus, Trash2, Clipboard, Check, Save } from 'lucide-react';
import { PpctDataset, PpctLesson } from '../types';
import { parsePastedPpctText } from '../utils/fileParser';

interface PpctManualEditorModalProps {
  dataset: PpctDataset;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLessons: PpctLesson[]) => void;
}

export const PpctManualEditorModal: React.FC<PpctManualEditorModalProps> = ({
  dataset,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [lessons, setLessons] = useState<PpctLesson[]>([...dataset.lessons]);
  const [pasteText, setPasteText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'paste'>('table');
  const [hasCopied, setHasCopied] = useState(false);

  const handleAddLesson = () => {
    const nextStt = lessons.length + 1;
    const nextTuan = Math.ceil(nextStt / 4) || 1;
    const newLesson: PpctLesson = {
      id: `lesson-${Date.now()}`,
      stt: nextStt,
      tuan: Math.min(35, nextTuan),
      hocKy: nextTuan <= 18 ? 1 : 2,
      chuong: lessons[lessons.length - 1]?.chuong || 'Chương I',
      baiHoc: `Bài học mới (Tiết ${nextStt})`,
    };
    setLessons([...lessons, newLesson]);
  };

  const handleUpdateLesson = (id: string, field: keyof PpctLesson, value: any) => {
    setLessons(
      lessons.map((l) => {
        if (l.id === id) {
          const updated = { ...l, [field]: value };
          if (field === 'tuan') {
            updated.hocKy = Number(value) <= 18 ? 1 : 2;
          }
          return updated;
        }
        return l;
      })
    );
  };

  const handleDeleteLesson = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  const handleApplyPasted = () => {
    if (!pasteText.trim()) return;
    const parsed = parsePastedPpctText(pasteText);
    if (parsed.length > 0) {
      setLessons(parsed);
      setActiveSubTab('table');
      setPasteText('');
    }
  };

  const handleSaveAll = () => {
    onSave(lessons);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Chỉnh sửa danh sách tiết PPCT
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {dataset.name} — Tổng số: {lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0)} tiết ({lessons.length} bài/mục)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-white gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('table')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeSubTab === 'table'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Danh sách chi tiết ({lessons.reduce((sum, l) => sum + (l.soTiet || 1), 0)} tiết)
          </button>
          <button
            onClick={() => setActiveSubTab('paste')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeSubTab === 'paste'
                ? 'border-emerald-700 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dán dữ liệu nhanh từ Excel/Word
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeSubTab === 'table' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500">
                  Bạn có thể chỉnh sửa trực tiếp từng ô bên dưới.
                </span>
                <button
                  onClick={handleAddLesson}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm tiết học</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-14">Tiết</th>
                      <th className="py-2.5 px-3 text-center w-16">Tuần</th>
                      <th className="py-2.5 px-3 text-center w-16">Kỳ</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Chương / Chủ đề</th>
                      <th className="py-2.5 px-3 min-w-[300px]">Tên bài học / Nội dung</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessons.map((lesson, idx) => (
                      <tr key={lesson.id} className="hover:bg-slate-50/60">
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            value={lesson.stt}
                            onChange={(e) =>
                              handleUpdateLesson(lesson.id, 'stt', parseInt(e.target.value, 10) || idx + 1)
                            }
                            className="w-12 text-center bg-slate-50 border border-slate-200 rounded py-1 text-xs"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            value={lesson.tuan}
                            onChange={(e) =>
                              handleUpdateLesson(lesson.id, 'tuan', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-12 text-center bg-slate-50 border border-slate-200 rounded py-1 text-xs"
                          />
                        </td>
                        <td className="p-1.5 text-center font-medium text-slate-700">
                          {lesson.hocKy === 1 ? 'HK I' : 'HK II'}
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={lesson.chuong}
                            onChange={(e) => handleUpdateLesson(lesson.id, 'chuong', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={lesson.baiHoc}
                            onChange={(e) => handleUpdateLesson(lesson.id, 'baiHoc', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            title="Xóa tiết này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Sao chép bảng từ file Word hoặc cột từ file Excel và dán trực tiếp vào khung dưới. Mỗi dòng tương ứng một tiết học hoặc một chương.
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Ví dụ định dạng dán:\n1\t1\tBài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn (t1)\n2\t1\tBài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn (t2)\n3\t2\tBài 2. Giải hệ hai phương trình bậc nhất hai ẩn (t1)...`}
                rows={12}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                onClick={handleApplyPasted}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Phân tích và nạp dữ liệu</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tổng cộng: {lessons.length} tiết PPCT
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
