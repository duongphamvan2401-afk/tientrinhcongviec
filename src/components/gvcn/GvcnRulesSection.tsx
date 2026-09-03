import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileCheck2,
  Scale,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { GvcnClassRule } from '../../types';

interface GvcnRulesSectionProps {
  rules: GvcnClassRule[];
  onAddRule: (rule: GvcnClassRule) => void;
  onDeleteRule: (id: string) => void;
}

export const GvcnRulesSection: React.FC<GvcnRulesSectionProps> = ({
  rules,
  onAddRule,
  onDeleteRule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New rule form state
  const [newCategory, setNewCategory] = useState<GvcnClassRule['category']>('hoc_tap');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPenalty, setNewPenalty] = useState<number>(-2);
  const [newReward, setNewReward] = useState<number>(2);

  const categories = [
    { key: 'all', label: 'Tất cả quy định' },
    { key: 'chuyen_can', label: 'Chuyên cần & Giờ giấc' },
    { key: 'tac_phong', label: 'Đồng phục & Tác phong' },
    { key: 'hoc_tap', label: 'Nề nếp học tập' },
    { key: 've_sinh', label: 'Vệ sinh & Cơ sở vật chất' },
    { key: 'dao_duc', label: 'Đạo đức & Văn hóa học đường' },
  ];

  const filteredRules = rules.filter((r) => {
    const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const catObj = categories.find((c) => c.key === newCategory);
    const rule: GvcnClassRule = {
      id: `rule-${Date.now()}`,
      category: newCategory,
      categoryLabel: catObj ? catObj.label : 'Quy định',
      title: newTitle.trim(),
      description: newDesc.trim(),
      penaltyPoints: Number(newPenalty),
      rewardPoints: Number(newReward),
    };

    onAddRule(rule);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Lời dặn kinh nghiệm của GVCN */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>Hệ Thống Quy Chế Lớp Học & Thang Điểm Thi Đua 4 Tổ</span>
              <span className="px-2 py-0.5 text-[11px] bg-emerald-200/80 text-emerald-900 rounded-full font-semibold">
                Chuẩn GDPT 2018 & Thông tư 22/BGDĐT
              </span>
            </h3>
            <p className="text-xs text-emerald-900/85 leading-relaxed">
              <strong>Kinh nghiệm sư phạm:</strong> <em>"Nội quy lớp học không phải là công cụ trừng phạt, mà là chiếc khung rèn luyện nhân cách và ý thức trách nhiệm."</em> Mỗi tuần, 4 tổ khởi điểm <strong>100 điểm</strong>. Việc chấm điểm thi đua chéo giữa 4 tổ kết hợp sự công tâm của Ban cán sự lớp giúp hình thành tính tự giác và tinh thần tập thể cao độ.
            </p>
          </div>
        </div>
      </div>

      {/* Control bar: Search, filter & Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Category selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.key
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search & Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nội quy, từ khóa..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm quy định</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule, idx) => (
          <div
            key={rule.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between group"
          >
            <div>
              {/* Category & Title */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {rule.categoryLabel}
                  </span>
                </div>
                
                {rules.length > 5 && (
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Xóa quy định này"
                  >
                    ×
                  </button>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-emerald-900 transition-colors">
                {rule.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {rule.description}
              </p>
            </div>

            {/* Score pill badges */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Vi phạm: <strong>{rule.penaltyPoints} điểm</strong></span>
              </div>

              {rule.rewardPoints > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 font-semibold">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Khen thưởng: <strong>+{rule.rewardPoints} điểm</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Thông tư 22 / Xếp loại Hạnh kiểm & Rèn luyện Reference Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Tiêu Chí Đánh Giá Kết Quả Rèn Luyện Theo Thông Tư 22/2021/TT-BGDĐT</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="font-bold text-emerald-800 text-sm mb-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Mức Tốt</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Thực hiện tốt các nội quy, quy chế; có ý thức tự giác cao; tích cực tham gia hoạt động lớp, trường; có tinh thần tương thân tương ái, giúp đỡ bạn bè cùng tiến bộ.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
            <div className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Mức Khá</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Thực hiện đầy đủ nhiệm vụ của học sinh; chấp hành tốt nội quy; tích cực học tập rèn luyện; có ý thức khắc phục khi được nhắc nhở.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
            <div className="font-bold text-amber-800 text-sm mb-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Mức Đạt</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Thực hiện được các nhiệm vụ rèn luyện cơ bản; còn có lúc vi phạm nội quy nhưng biết nhận lỗi và sửa chữa sau khi được thầy cô nhắc nhở.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs">
            <div className="font-bold text-rose-800 text-sm mb-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Mức Chưa Đạt</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Chưa hoàn thành các nhiệm vụ của học sinh; vi phạm kỷ luật nhiều lần dù đã được uốn nắn, giáo dục nhưng chưa chịu khắc phục tiến bộ.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add Rule */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Thêm Quy Định Nề Nếp Lớp Học Mới
            </h3>
            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhóm nội dung</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="chuyen_can">Chuyên cần & Giờ giấc</option>
                  <option value="tac_phong">Đồng phục & Tác phong</option>
                  <option value="hoc_tap">Nề nếp học tập & Chuẩn bị bài</option>
                  <option value="ve_sinh">Vệ sinh & Cơ sở vật chất</option>
                  <option value="dao_duc">Đạo đức & Văn hóa học đường</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề quy định</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Giữ gìn trật tự trong giờ tự quản"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết yêu cầu</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Quy định rõ ràng hành vi được làm và không được làm..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-rose-700 mb-1">Điểm trừ vi phạm</label>
                  <input
                    type="number"
                    max={0}
                    value={newPenalty}
                    onChange={(e) => setNewPenalty(Number(e.target.value))}
                    className="w-full p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-emerald-700 mb-1">Điểm cộng việc tốt</label>
                  <input
                    type="number"
                    min={0}
                    value={newReward}
                    onChange={(e) => setNewReward(Number(e.target.value))}
                    className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold"
                >
                  Lưu quy định
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
