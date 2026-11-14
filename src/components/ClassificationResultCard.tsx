import React, { useState, useEffect  } from 'react';
import {
  Recycle,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
  Clock,
  CloudSun,
  Layers,
  ArrowRight,
  BookmarkCheck,
  MapPin,
  Scale,
} from 'lucide-react';
import { WasteClassificationResult } from '../types/waste';
import { calculateRecyclabilityGrade, CATEGORY_META } from '../utils/wasteAnalytics';


interface Props {
  result: WasteClassificationResult;
  onSaveToLog: (record: WasteClassificationResult, customWeight?: number) => void;
  isSaved?: boolean;
}

export const ClassificationResultCard: React.FC<Props> = ({
  result,
  onSaveToLog,
  isSaved = false,
}) => {
  const [weight, setWeight] = useState<number>(result.estimatedWeightGrams || 50);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(isSaved);

  useEffect(() => {
    setWeight(result.estimatedWeightGrams || 50);
    setSavedSuccess(isSaved);
  }, [result, isSaved]);

  const grade = calculateRecyclabilityGrade(result.recyclabilityScore);
  const catMeta = CATEGORY_META[result.category] || CATEGORY_META.residual;

  const handleSave = () => {
    onSaveToLog({
      ...result,
      estimatedWeightGrams: weight,
    }, weight);
    setSavedSuccess(true);
  };

  const getBinBgColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 text-white border-blue-700';
      case 'green':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'red':
        return 'bg-rose-600 text-white border-rose-700';
      case 'gray':
        return 'bg-slate-700 text-white border-slate-800';
      default:
        return 'bg-amber-600 text-white border-amber-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Top Banner / Summary */}
      <div className="p-5 sm:p-7 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {result.categoryNameVi}
              </span>
              <span aria-hidden="true">·</span>
              <span>Độ tin cậy {(result.confidence * 100).toFixed(0)}%</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Ước tính {result.estimatedWeightGrams}g</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {result.itemName}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {result.recyclabilityExplanation}
            </p>
          </div>

          {/* Recyclability Score Gauge */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-200 dark:text-slate-700"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className={
                    result.recyclabilityScore >= 70
                      ? 'text-emerald-600'
                      : result.recyclabilityScore >= 40
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                  fill="transparent"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * result.recyclabilityScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-base font-bold tabular-nums text-slate-900 dark:text-white">
                {result.recyclabilityScore}%
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Mức độ tái chế</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {grade.gradeText}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Vật liệu: <span className="font-medium text-slate-700 dark:text-slate-300">{result.primaryMaterial}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-7">
        {/* Recommended Bin & Action Guide */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Thùng Rác & Quy Trình Xử Lý
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Bin Color Box */}
            <div className={`md:col-span-4 rounded-xl p-5 border flex flex-col justify-between ${getBinBgColor(result.binColor)}`}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-85 block mb-1">
                  Màu thùng rác chỉ định
                </span>
                <div className="text-lg font-bold leading-tight">
                  {result.binNameVi}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 text-xs opacity-90 leading-relaxed">
                {catMeta.desc}
              </div>
            </div>

            {/* Step by step checklist */}
            <div className="md:col-span-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Các bước chuẩn bị trước khi vứt:
              </div>
              <ol className="space-y-2.5">
                {result.disposalSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {result.doNotDo && result.doNotDo.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Lưu ý tuyệt đối tránh:</span>
                  </div>
                  <ul className="space-y-1">
                    {result.doNotDo.map((item, idx) => (
                      <li key={idx} className="text-xs text-rose-700 dark:text-rose-300 pl-4 relative before:content-['•'] before:absolute before:left-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Material Breakdown (Điểm đặc biệt: nhận diện vật liệu) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Chi Tiết Thành Phần Vật Liệu Nhận Diện
            </h3>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Lớp vật liệu</th>
                  <th className="py-3 px-4 text-right">Tỷ lệ</th>
                  <th className="py-3 px-4">Khả năng tái chế</th>
                  <th className="py-3 px-4">Đặc tính & Lưu ý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.materials.map((mat, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {mat.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {mat.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                        mat.recyclability === 'high'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : mat.recyclability === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {mat.recyclability === 'high' ? 'Cao' : mat.recyclability === 'medium' ? 'Trung bình' : 'Khó / Không'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {mat.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact & Upcycling Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian phân hủy</span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {result.decompositionTime}
            </div>
            <div className="text-[11px] text-slate-500">Ngoài môi trường tự nhiên nếu chôn lấp</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CloudSun className="w-3.5 h-3.5 text-emerald-500" />
              <span>Giảm phát thải CO2e</span>
            </div>
            <div className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              ~{result.co2SavedKg} kg CO2e
            </div>
            <div className="text-[11px] text-slate-500">Tiết kiệm khi tái chế / tránh chôn lấp</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Điểm thu gom phù hợp</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
              {result.locationTip || 'Thùng rác phân loại hoặc trạm ve chai'}
            </div>
          </div>
        </div>

        {/* Upcycling Creative Ideas */}
        {result.upcyclingIdeas && result.upcyclingIdeas.length > 0 && (
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ý Tưởng Tái Sử Dụng Sáng Tạo (Upcycling DIY)</span>
            </div>
            <ul className="space-y-1.5">
              {result.upcyclingIdeas.map((idea, idx) => (
                <li key={idx} className="text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Save to Log Bar (Thống kê lượng rác theo thời gian) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Scale className="w-4 h-4 text-slate-400" />
              <span>Khối lượng thực tế:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="50000"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-20 px-2.5 py-1 text-sm font-mono tabular-nums text-right border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-500 font-medium">gram</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              savedSuccess
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Ghi Nhận Vào Thống Kê</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Ghi Nhận & Đưa Vào Nhật Ký Rác</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
