import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Link2,
  FileDown,
  User,
  GraduationCap
} from 'lucide-react';
import { LessonPlan } from '../../types';
import { exportLessonPlanToDocx } from '../../utils/lessonPlanDocxExport';

interface LessonPlanViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan | null;
  onUpdatePlan?: (updated: LessonPlan) => void;
}

export const LessonPlanViewerModal: React.FC<LessonPlanViewerModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdatePlan,
}) => {
  const [activeSection, setActiveSection] = useState<'full' | 'objectives' | 'materials' | 'activities' | 'appendix'>('full');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !plan) return null;

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      await exportLessonPlanToDocx(plan);
    } catch (err) {
      console.error('Lỗi khi xuất file Word KHBD:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-700/70 text-emerald-100 border border-emerald-500/30">
                  Chuẩn Công Văn 5512/BGDĐT-GDTrH
                </span>
                {plan.sourceType === 'external_link' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    <span>Liên kết ngoài</span>
                  </span>
                )}
                {plan.sourceType === 'uploaded_file' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    File đã tải lên
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">
                {plan.lessonTitle}
              </h3>
              <p className="text-xs text-emerald-200 flex items-center gap-2">
                <span>{plan.subject} {plan.grade}</span>
                <span>•</span>
                <span>{plan.periodRangeText || `${plan.periods} tiết`}</span>
                {plan.weekNumber && (
                  <>
                    <span>•</span>
                    <span>Tuần {plan.weekNumber}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* External link button */}
            {plan.externalLink && (
              <a
                href={plan.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20"
                title="Mở liên kết chứa kế hoạch bài dạy"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Mở Link Ngoài</span>
              </a>
            )}

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20"
              title="In kế hoạch bài dạy"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">In</span>
            </button>

            {/* Export Word button */}
            <button
              onClick={handleExportWord}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
              title="Tải kế hoạch bài dạy về dưới dạng file Word (.docx) chuẩn Bộ GD&ĐT"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'Đang tạo Word...' : 'Tải File Word (.docx)'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50 flex-shrink-0 print:hidden overflow-x-auto">
          {[
            { id: 'full', label: 'Toàn Bộ Kế Hoạch Bài Dạy' },
            { id: 'objectives', label: 'I. Mục Tiêu' },
            { id: 'materials', label: 'II. Thiết Bị & Học Liệu' },
            { id: 'activities', label: 'III. Tiến Trình Dạy Học (4 HĐ)' },
            { id: 'appendix', label: 'IV. Phiếu Học Tập & Phụ Lục' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* External Link & Master Folder Notice Banner if present */}
        {(plan.externalLink || plan.masterTermLink) && (
          <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs text-sky-950 print:hidden">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <div>
                <span>
                  {plan.masterTermLink ? (
                    <>Được liên kết từ <strong>Thư mục Tập {plan.term || 1} (Google Drive/OneDrive)</strong>: </>
                  ) : (
                    <>KHBD này được liên kết trực tuyến: </>
                  )}
                </span>
                <span className="font-mono text-[11px] text-sky-700 underline truncate block max-w-lg">
                  {plan.externalLink || plan.masterTermLink}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={plan.externalLink || plan.masterTermLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
              >
                <span>Mở trong Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Main Document Content Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 scrollbar-thin bg-slate-100/70">
          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-300 text-slate-900 font-sans leading-relaxed space-y-6 print:shadow-none print:border-none print:p-0 print:text-black">
            
            {/* Header Phụ lục IV chuẩn Công văn số 5512/BGDĐT-GDTrH */}
            <div className="space-y-4 border-b border-slate-300 pb-5">
              <div className="text-center space-y-0.5">
                <div className="font-bold text-xs sm:text-sm uppercase text-slate-900 tracking-wide">
                  Phụ lục IV
                </div>
                <h1 className="font-black text-sm sm:text-base uppercase text-slate-900 tracking-tight">
                  KHUNG KẾ HOẠCH BÀI DẠY
                </h1>
                <div className="text-xs text-slate-700 italic">
                  (Kèm theo Công văn số 5512/BGDĐT-GDTrH ngày 18 tháng 12 năm 2020 của Bộ GDĐT)
                </div>
              </div>

              {/* Bảng thông tin Trường / Tổ và Họ tên Giáo viên theo đúng mẫu ảnh */}
              <div className="border border-slate-400 rounded-lg overflow-hidden bg-slate-50/50 print:bg-white print:border-black">
                <table className="w-full border-collapse text-xs sm:text-[13px]">
                  <tbody>
                    <tr>
                      <td className="w-1/2 p-2.5 sm:p-3 align-top border-r border-slate-300 print:border-black space-y-1">
                        <div>
                          <strong className="font-bold">Trường:</strong>{' '}
                          <span className="font-semibold text-slate-800">{plan.schoolName || 'THCS Lê Quý Đôn'}</span>
                        </div>
                        <div>
                          <strong className="font-bold">Tổ:</strong>{' '}
                          <span className="font-semibold text-slate-800">Toán - Tin học</span>
                        </div>
                      </td>
                      <td className="w-1/2 p-2.5 sm:p-3 align-top space-y-1">
                        <div>
                          <strong className="font-bold">Họ và tên giáo viên:</strong>{' '}
                          <span className="font-semibold text-slate-800">{plan.teacherName || 'Nguyễn Văn Trọng'}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] italic">
                          Năm học: {plan.academicYear || '2026 - 2027'}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tên bài dạy và phân phối môn học */}
              <div className="text-center space-y-1 pt-2">
                <div className="text-sm sm:text-base font-black text-emerald-900 uppercase tracking-tight">
                  TÊN BÀI DẠY: {plan.lessonTitle.replace(/^BÀI\s+\d+[:.]?\s*/i, '')}
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-slate-800">
                  Môn học/Hoạt động giáo dục: <span className="uppercase">{plan.subject}</span>; lớp: {plan.grade}
                </div>
                <div className="text-xs text-slate-600 italic">
                  Thời gian thực hiện: {plan.periods} tiết ({plan.periodRangeText || `Tiết 1 - ${plan.periods}`})
                </div>
              </div>
            </div>

            {/* SECTION I: MỤC TIÊU */}
            {(activeSection === 'full' || activeSection === 'objectives') && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase border-b-2 border-emerald-800 pb-1 flex items-center justify-between">
                  <span>I. Mục tiêu</span>
                  <span className="text-[11px] font-normal text-slate-500 normal-case italic print:hidden">
                    (Theo yêu cầu cần đạt của CT GDPT 2018)
                  </span>
                </h3>

                {/* 1. Về kiến thức */}
                <div className="space-y-1 pl-1">
                  <div className="font-bold text-xs sm:text-[13px] text-slate-900">
                    1. Về kiến thức:
                  </div>
                  <p className="text-xs text-slate-500 italic pl-3">
                    Nêu cụ thể nội dung kiến thức học sinh cần học trong bài theo yêu cầu cần đạt của nội dung giáo dục/chủ đề tương ứng trong chương trình môn học:
                  </p>
                  <ul className="list-disc list-outside text-xs sm:text-[13px] text-slate-800 space-y-1 pl-7">
                    {(plan.objectives?.knowledge || []).map((k, i) => (
                      <li key={i} className="leading-relaxed">{k}</li>
                    ))}
                  </ul>
                </div>

                {/* 2. Về năng lực */}
                <div className="space-y-2 pl-1 pt-1">
                  <div className="font-bold text-xs sm:text-[13px] text-slate-900">
                    2. Về năng lực:
                  </div>
                  <p className="text-xs text-slate-500 italic pl-3">
                    Nêu cụ thể yêu cầu học sinh làm được gì (biểu hiện cụ thể của năng lực chung và năng lực đặc thù môn học cần phát triển) trong hoạt động học để chiếm lĩnh và vận dụng kiến thức:
                  </p>
                  
                  {/* Bảng Năng lực vẽ rõ ràng */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden my-2 print:border-black">
                    <table className="w-full border-collapse text-xs sm:text-[13px]">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 print:bg-slate-200 print:border-black">
                        <tr>
                          <th className="p-2 border-r border-slate-300 print:border-black text-left w-1/3">Nhóm năng lực</th>
                          <th className="p-2 text-left w-2/3">Yêu cầu cần đạt / Biểu hiện cụ thể</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 print:divide-black">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-950 align-top border-r border-slate-300 print:border-black bg-slate-50/50 print:bg-transparent">
                            a) Năng lực chung
                          </td>
                          <td className="p-2.5 align-top">
                            <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
                              {(plan.objectives?.generalCompetencies || []).map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-950 align-top border-r border-slate-300 print:border-black bg-slate-50/50 print:bg-transparent">
                            b) Năng lực đặc thù (Môn Toán)
                          </td>
                          <td className="p-2.5 align-top">
                            <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
                              {(plan.objectives?.subjectCompetencies || []).map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Về phẩm chất */}
                <div className="space-y-1 pl-1 pt-1">
                  <div className="font-bold text-xs sm:text-[13px] text-slate-900">
                    3. Về phẩm chất:
                  </div>
                  <p className="text-xs text-slate-500 italic pl-3">
                    Nêu cụ thể yêu cầu về hành vi, thái độ (biểu hiện cụ thể của phẩm chất cần phát triển gắn với nội dung bài dạy) của học sinh trong quá trình thực hiện nhiệm vụ học tập và vận dụng kiến thức vào cuộc sống:
                  </p>
                  <ul className="list-disc list-outside text-xs sm:text-[13px] text-slate-800 space-y-1 pl-7">
                    {(plan.objectives?.qualities || []).map((q, i) => (
                      <li key={i} className="leading-relaxed">{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* SECTION II: THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
            {(activeSection === 'full' || activeSection === 'materials') && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase border-b-2 border-emerald-800 pb-1 flex items-center justify-between">
                  <span>II. Thiết bị dạy học và học liệu</span>
                  <span className="text-[11px] font-normal text-slate-500 normal-case italic print:hidden">
                    (Vẽ bảng rõ ràng)
                  </span>
                </h3>

                <p className="text-xs text-slate-500 italic pl-1">
                  Nêu cụ thể các thiết bị dạy học và học liệu được sử dụng trong bài dạy để tổ chức cho học sinh hoạt động nhằm đạt được mục tiêu, yêu cầu của bài dạy:
                </p>

                {/* Bảng vẽ rõ ràng cho thiết bị dạy học và học liệu */}
                <div className="border border-slate-400 rounded-lg overflow-hidden shadow-2xs print:border-black">
                  <table className="w-full border-collapse text-xs sm:text-[13px]">
                    <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300 print:bg-slate-200 print:border-black text-center">
                      <tr>
                        <th className="p-2.5 w-14 border-r border-slate-300 print:border-black">STT</th>
                        <th className="p-2.5 w-36 sm:w-44 border-r border-slate-300 print:border-black text-left">Đối tượng</th>
                        <th className="p-2.5 text-left">Thiết bị dạy học và học liệu cụ thể</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 print:divide-black">
                      <tr>
                        <td className="p-2.5 text-center font-bold text-slate-600 border-r border-slate-300 print:border-black">
                          1
                        </td>
                        <td className="p-2.5 font-bold text-emerald-950 border-r border-slate-300 print:border-black bg-slate-50/50 print:bg-transparent">
                          Giáo viên (GV)
                        </td>
                        <td className="p-2.5 align-top">
                          <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
                            {(plan.equipmentAndMaterials?.teacher || []).map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-center font-bold text-slate-600 border-r border-slate-300 print:border-black">
                          2
                        </td>
                        <td className="p-2.5 font-bold text-emerald-950 border-r border-slate-300 print:border-black bg-slate-50/50 print:bg-transparent">
                          Học sinh (HS)
                        </td>
                        <td className="p-2.5 align-top">
                          <ul className="list-disc list-outside pl-4 space-y-1 text-slate-800">
                            {(plan.equipmentAndMaterials?.students || []).map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION III: TIẾN TRÌNH DẠY HỌC */}
            {(activeSection === 'full' || activeSection === 'activities') && (
              <div className="space-y-6 pt-4">
                <div className="border-b-2 border-emerald-800 pb-1 flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">
                    III. Tiến trình dạy học
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full print:hidden">
                    Chuẩn 4 Hoạt động theo CV 5512
                  </span>
                </div>

                {(plan.activities || []).map((act, idx) => (
                  <div key={act.id || idx} className="space-y-3 pt-2">
                    {/* Tên hoạt động */}
                    <div className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg flex items-center justify-between print:bg-transparent print:border-black">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase">
                        {act.name}
                      </h4>
                      {act.timeEstimate && (
                        <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-300 px-2 py-0.5 rounded-md print:border-none">
                          {act.timeEstimate}
                        </span>
                      )}
                    </div>

                    {/* 3 mục a, b, c đầu hoạt động */}
                    <div className="space-y-2 text-xs sm:text-[13px] text-slate-800 pl-2">
                      <p className="leading-relaxed">
                        <strong className="font-bold text-slate-900">a) Mục tiêu:</strong>{' '}
                        {act.objective}
                      </p>
                      <p className="leading-relaxed">
                        <strong className="font-bold text-slate-900">b) Nội dung:</strong>{' '}
                        {act.content}
                      </p>
                      <p className="leading-relaxed">
                        <strong className="font-bold text-slate-900">c) Sản phẩm:</strong>{' '}
                        {act.product}
                      </p>
                    </div>

                    {/* d) Tổ chức thực hiện: VẼ BẢNG RÕ RÀNG VỚI 4 BƯỚC */}
                    <div className="space-y-2 pt-1">
                      <div className="font-bold text-xs sm:text-[13px] text-slate-900 pl-2">
                        d) Tổ chức thực hiện:
                      </div>

                      {/* Bảng Tổ chức thực hiện được kẻ viền đen/xám rõ ràng */}
                      <div className="border border-slate-400 rounded-lg overflow-hidden shadow-2xs print:border-black">
                        <table className="w-full border-collapse text-xs sm:text-[13px] table-fixed">
                          <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] tracking-wider border-b border-slate-400 print:bg-slate-200 print:border-black">
                            <tr>
                              <th className="p-3 w-1/2 text-left border-r border-slate-400 print:border-black">
                                HOẠT ĐỘNG CỦA GIÁO VIÊN
                              </th>
                              <th className="p-3 w-1/2 text-left">
                                HOẠT ĐỘNG CỦA HỌC SINH
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300 print:divide-black">
                            {(act.organizationSteps || []).map((st, sIdx) => (
                              <tr key={sIdx} className="hover:bg-slate-50/70">
                                <td className="p-3 align-top border-r border-slate-300 print:border-black space-y-1.5">
                                  <div className="font-bold text-emerald-950 uppercase text-[11px] sm:text-xs">
                                    {st.stepName}
                                  </div>
                                  <p className="text-slate-800 leading-relaxed text-xs sm:text-[12.5px]">
                                    {st.teacherAction}
                                  </p>
                                </td>
                                <td className="p-3 align-top bg-slate-50/30 print:bg-transparent space-y-1.5">
                                  <div className="font-semibold text-slate-500 uppercase text-[10px] hidden sm:block">
                                    (Phản hồi & Sản phẩm HS)
                                  </div>
                                  <p className="text-slate-800 leading-relaxed text-xs sm:text-[12.5px]">
                                    {st.studentAction}
                                  </p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION IV: PHỤ LỤC & PHIẾU HỌC TẬP - VẼ BẢNG RÕ RÀNG */}
            {(activeSection === 'full' || activeSection === 'appendix') && plan.appendix?.worksheets && (
              <div className="space-y-4 pt-4">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase border-b-2 border-emerald-800 pb-1 flex items-center justify-between">
                  <span>IV. Hồ sơ dạy học và Phụ lục</span>
                  <span className="text-[11px] font-normal text-slate-500 normal-case italic print:hidden">
                    (Phiếu học tập & Bảng tiêu chí đánh giá)
                  </span>
                </h3>

                <div className="space-y-3">
                  {plan.appendix.worksheets.map((ws, wIdx) => (
                    <div key={wIdx} className="border border-slate-300 rounded-lg overflow-hidden print:border-black">
                      <div className="bg-slate-100 px-3.5 py-2 font-bold text-xs uppercase text-slate-900 border-b border-slate-300 print:border-black">
                        {wIdx + 1}. {ws.title}
                      </div>
                      <div className="p-3 sm:p-4 text-xs sm:text-[13px] text-slate-800 bg-white">
                        <pre className="font-sans whitespace-pre-wrap leading-relaxed">
                          {ws.content}
                        </pre>
                      </div>
                    </div>
                  ))}

                  {plan.appendix.rubrics && (
                    <div className="border border-slate-300 rounded-lg overflow-hidden print:border-black">
                      <div className="bg-slate-100 px-3.5 py-2 font-bold text-xs uppercase text-slate-900 border-b border-slate-300 print:border-black">
                        Bảng tiêu chí đánh giá (Rubrics hoạt động nhóm & cá nhân)
                      </div>
                      <div className="p-3 sm:p-4 text-xs sm:text-[13px] text-slate-700 bg-white italic">
                        {plan.appendix.rubrics}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GHI CHÚ QUAN TRỌNG CỦA CÔNG VĂN 5512 (TỪ ẢNH 4) */}
            <div className="mt-8 p-4 bg-amber-50/60 border border-amber-300 rounded-xl text-xs space-y-2 text-slate-800 print:bg-transparent print:border-slate-400">
              <div className="font-black text-amber-950 uppercase flex items-center gap-1.5 text-xs sm:text-sm">
                <span>Ghi chú hướng dẫn thực hiện theo Công văn số 5512/BGDĐT-GDTrH:</span>
              </div>
              <ol className="list-decimal list-outside pl-5 space-y-1.5 leading-relaxed text-slate-700">
                <li>
                  Mỗi bài dạy có thể được thực hiện trong nhiều tiết học, bảo đảm đủ thời gian dành cho mỗi hoạt động để học sinh thực hiện hiệu quả. Hệ thống câu hỏi, bài tập luyện tập cần bảo đảm yêu cầu tối thiểu về số lượng và đủ về thể loại theo yêu cầu phát triển các kĩ năng. Hoạt động vận dụng được thực hiện đối với những bài hoặc nhóm bài có nội dung phù hợp và chủ yếu được giao cho học sinh thực hiện ở ngoài lớp học.
                </li>
                <li>
                  Trong Kế hoạch bài dạy không cần nêu cụ thể lời nói của giáo viên, học sinh mà tập trung mô tả rõ hoạt động cụ thể của giáo viên: giáo viên giao nhiệm vụ/yêu cầu/quan sát/theo dõi/hướng dẫn/nhận xét/gợi ý/kiểm tra/đánh giá; học sinh thực hiện/đọc/nghe/nhìn/viết/trình bày/báo cáo/thí nghiệm/thực hành.
                </li>
                <li>
                  Việc kiểm tra, đánh giá thường xuyên được thực hiện trong quá trình tổ chức các hoạt động học và được thiết kế trong Kế hoạch bài dạy thông qua các hình thức: hỏi - đáp, viết, thực hành, thí nghiệm, thuyết trình, sản phẩm học tập.
                </li>
                <li>
                  <strong>Các bước tổ chức thực hiện một hoạt động học:</strong> Giao nhiệm vụ học tập; Thực hiện nhiệm vụ (học sinh thực hiện; giáo viên theo dõi, hỗ trợ); Báo cáo, thảo luận (giáo viên tổ chức, điều hành; học sinh báo cáo, thảo luận); Kết luận, nhận định (giáo viên chốt kiến thức).
                </li>
              </ol>
            </div>

            {/* Footer Ký Tên */}
            <div className="grid grid-cols-2 gap-4 text-center pt-6 border-t border-slate-300 print:border-black">
              <div className="space-y-1">
                <div className="font-bold text-xs uppercase text-slate-900">
                  DUYỆT CỦA TỔ TRƯỞNG CHUYÊN MÔN
                </div>
                <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                <div className="h-16" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600 italic">
                  ..., ngày ..... tháng ..... năm 2026
                </div>
                <div className="font-bold text-xs uppercase text-slate-900">
                  GIÁO VIÊN SOẠN THẢO
                </div>
                <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
                <div className="h-10" />
                <div className="font-bold text-xs text-slate-900">
                  {plan.teacherName || 'Nguyễn Văn Trọng'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
