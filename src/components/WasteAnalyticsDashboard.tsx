import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Leaf,
  Scale,
  CloudSun,
} from 'lucide-react';
import { WasteLogRecord } from '../types/waste';
import {
  aggregateWasteStats,
  buildTimeTrendPoints,
  filterRecordsByPeriod,
  CATEGORY_META,
} from '../utils/wasteAnalytics';

interface Props {
  records: WasteLogRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAllRecords: () => void;
  onSelectRecordForDetail: (record: WasteLogRecord) => void;
}

export const WasteAnalyticsDashboard: React.FC<Props> = ({
  records,
  onDeleteRecord,
  onClearAllRecords,
  onSelectRecordForDetail,
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Filter records by period first
  const filteredByPeriod = useMemo(() => {
    return filterRecordsByPeriod(records, period);
  }, [records, period]);

  // Compute stats on the period records
  const stats = useMemo(() => {
    return aggregateWasteStats(filteredByPeriod);
  }, [filteredByPeriod]);

  // Trend points for chart
  const daysCount = period === 'today' ? 1 : period === '30days' ? 30 : 7;
  const trendPoints = useMemo(() => {
    return buildTimeTrendPoints(filteredByPeriod, daysCount);
  }, [filteredByPeriod, daysCount]);

  // Max value for scaling SVG chart
  const maxTrendGrams = useMemo(() => {
    const maxVal = Math.max(...trendPoints.map((p) => p.totalGrams), 100);
    return Math.ceil(maxVal * 1.15);
  }, [trendPoints]);

  // Table items filtered by search and category
  const tableRecords = useMemo(() => {
    return filteredByPeriod.filter((rec) => {
      const matchSearch =
        searchQuery === '' ||
        rec.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.primaryMaterial.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || rec.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [filteredByPeriod, searchQuery, categoryFilter]);

  // Export data as JSON / CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Thời gian',
      'Tên vật phẩm',
      'Nhóm rác',
      'Vật liệu chính',
      'Mức tái chế (%)',
      'Khối lượng (g)',
      'Thùng rác',
    ];
    const rows = filteredByPeriod.map((r) => [
      r.id,
      new Date(r.loggedAt || r.timestamp).toLocaleString('vi-VN'),
      `"${r.itemName.replace(/"/g, '""')}"`,
      r.categoryNameVi,
      `"${r.primaryMaterial.replace(/"/g, '""')}"`,
      r.recyclabilityScore,
      r.estimatedWeightGrams,
      r.binNameVi,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecoscan_thong_ke_rac_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thống Kê Lượng Rác & Tái Chế Theo Thời Gian
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi khối lượng phát thải, tỷ lệ tuần hoàn và lượng CO2e đã tiết kiệm
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              period === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Hôm Nay
          </button>
          <button
            onClick={() => setPeriod('7days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              period === '7days'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            7 Ngày Qua
          </button>
          <button
            onClick={() => setPeriod('30days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              period === '30days'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            30 Ngày Qua
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              period === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Tất Cả
          </button>
        </div>
      </div>

      {/* 4 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Tổng Rác Phân Loại</span>
            <Scale className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalWeightKg}{' '}
            <span className="text-sm font-sans font-medium text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Từ {stats.totalItems} món đồ đã quét
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Rác Tái Chế Thu Hồi</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {stats.recyclableWeightKg}{' '}
            <span className="text-sm font-sans font-medium text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Giấy, lon nhôm, nhựa PET tái sinh
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Tỷ Lệ Tái Chế Đạt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.recyclingRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {stats.recyclingRate >= 60 ? 'Mục tiêu kinh tế tuần hoàn tốt' : 'Cần tăng cường rác tái chế'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Giảm Phát Thải CO2e</span>
            <CloudSun className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            ~{stats.co2SavedKg}{' '}
            <span className="text-sm font-sans font-medium text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Tương đương hấp thụ 1 cây xanh/tháng
          </div>
        </div>
      </div>

      {/* Interactive Time Series Chart & Material Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Biểu Đồ Khối Lượng Rác Phát Sinh Theo Ngày
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khối lượng (gram) rác tái chế và tổng lượng rác theo từng ngày
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-slate-300 dark:bg-slate-700" />
                <span>Tổng Rác</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                <span>Tái Chế Được</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Bars */}
          <div className="h-64 w-full relative flex items-end justify-between gap-1 sm:gap-3 pt-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            {trendPoints.map((point, index) => {
              const totalHeightPct = Math.min(100, Math.max(4, (point.totalGrams / maxTrendGrams) * 100));
              const recyclableHeightPct = Math.min(
                totalHeightPct,
                Math.max(0, (point.recyclableGrams / maxTrendGrams) * 100)
              );
              const isHovered = hoveredPointIndex === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredPointIndex(index)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                      <div className="font-bold">{point.dateStr}</div>
                      <div className="text-slate-300 font-mono tabular-nums">
                        Tổng: {point.totalGrams}g · Tái chế: {point.recyclableGrams}g ({point.count} món)
                      </div>
                    </div>
                  )}

                  {/* Bar Container */}
                  <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end relative h-full">
                    {/* Background bar for total */}
                    <div
                      style={{ height: `${totalHeightPct}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isHovered ? 'bg-slate-400 dark:bg-slate-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      {/* Recyclable portion */}
                      <div
                        style={{ height: `${(point.recyclableGrams / Math.max(1, point.totalGrams)) * 100}%` }}
                        className="w-full bg-emerald-600 rounded-t-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Day Label */}
                  <span className="absolute -bottom-6 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3">
            <span>Đơn vị tính: gram (g)</span>
            <span>Di chuột vào cột để xem chi tiết ngày đó</span>
          </div>
        </div>

        {/* Material Distribution Breakdown (Điểm đặc biệt: nhận diện vật liệu) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Phân Bổ Theo Vật Liệu
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Tỷ lệ các loại vật liệu nhận diện trong thời gian qua
            </p>

            <div className="space-y-4">
              {stats.materialBreakdown.length > 0 ? (
                stats.materialBreakdown.map((mat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {mat.material}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 shrink-0">
                        {mat.percentage}% ({mat.weightKg} kg)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${mat.percentage}%` }}
                        className={`h-full rounded-full ${
                          i === 0
                            ? 'bg-emerald-500'
                            : i === 1
                            ? 'bg-blue-500'
                            : i === 2
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Chưa có dữ liệu phân tích vật liệu trong chu kỳ này.
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution Chips */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
              Phân Loại Rác Tại Nguồn
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stats.categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {cat.nameVi}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-slate-500 text-[11px] mt-1 pl-4">
                    {cat.count} món · {cat.weightKg} kg ({cat.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Log Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nhật Ký Quét & Phân Loại Chi Tiết
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách chi tiết các món rác đã được AI định danh và lưu trữ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm vật phẩm, vật liệu..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="recyclable">Rác Tái Chế</option>
              <option value="organic">Rác Hữu Cơ</option>
              <option value="residual">Rác Còn Lại</option>
              <option value="hazardous">Rác Nguy Hại</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>

            {/* Clear All */}
            {records.length > 0 && (
              <button
                onClick={onClearAllRecords}
                title="Xóa toàn bộ dữ liệu lịch sử"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Vật phẩm</th>
                <th className="py-3 px-4">Nhóm rác & Thùng chỉ định</th>
                <th className="py-3 px-4">Vật liệu chính</th>
                <th className="py-3 px-4 text-center">Tái chế</th>
                <th className="py-3 px-4 text-right">Khối lượng</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableRecords.length > 0 ? (
                tableRecords.map((rec) => {
                  const catMeta = CATEGORY_META[rec.category] || CATEGORY_META.residual;
                  const dateObj = new Date(rec.loggedAt || rec.timestamp);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {dateObj.toLocaleDateString('vi-VN')} {dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Item */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {rec.imageUrl ? (
                            <img
                              src={rec.imageUrl}
                              alt={rec.itemName}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Leaf className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => onSelectRecordForDetail(rec)}
                              className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors"
                            >
                              {rec.itemName}
                            </button>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {rec.recyclabilityExplanation}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Bin */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: catMeta.hex }}
                          />
                          <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                            {rec.categoryNameVi}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                          {rec.binNameVi}
                        </div>
                      </td>

                      {/* Material */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {rec.primaryMaterial}
                      </td>

                      {/* Recyclability Score */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono tabular-nums text-xs font-bold px-2 py-0.5 rounded ${
                            rec.recyclabilityScore >= 70
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : rec.recyclabilityScore >= 40
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {rec.recyclabilityScore}%
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {rec.estimatedWeightGrams} g
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectRecordForDetail(rec)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            title="Xóa mục này"
                            aria-label={`Xóa ${rec.itemName}`}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    Không tìm thấy dữ liệu rác phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
