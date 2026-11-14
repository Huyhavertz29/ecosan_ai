import {
  MaterialDetail,
  TimeTrendPoint,
  WasteCategory,
  WasteLogRecord,
  WasteStatsSummary,
} from '../types/waste';

export const CATEGORY_META: Record<
  WasteCategory,
  { nameVi: string; binName: string; color: string; hex: string; desc: string }
> = {
  recyclable: {
    nameVi: 'Rác Tái Chế',
    binName: 'Thùng Xanh Dương / Trắng (Tái chế)',
    color: 'blue',
    hex: '#2563EB',
    desc: 'Giấy, bìa carton, chai nhựa, vỏ lon kim loại, đồ thủy tinh sạch',
  },
  organic: {
    nameVi: 'Rác Thực Phẩm / Hữu Cơ',
    binName: 'Thùng Xanh Lá (Hữu cơ)',
    color: 'green',
    hex: '#16A34A',
    desc: 'Thức ăn thừa, rau củ quả, vỏ trứng, bã cà phê, hoa lá mục',
  },
  residual: {
    nameVi: 'Rác Còn Lại / Vô Cơ',
    binName: 'Thùng Xám / Đen (Rác còn lại)',
    color: 'gray',
    hex: '#64748B',
    desc: 'Hộp xốp bẩn dầu mỡ, tã lót, khăn ướt, túi ni-lông bẩn không tái chế',
  },
  hazardous: {
    nameVi: 'Rác Nguy Hại',
    binName: 'Thùng Đỏ / Cam (Nguy hại)',
    color: 'red',
    hex: '#DC2626',
    desc: 'Pin cũ, bóng đèn huỳnh quang, ắc quy, chai lọ hóa chất diệt côn trùng',
  },
  electronic: {
    nameVi: 'Rác Điện Tử (E-waste)',
    binName: 'Điểm Thu Gom Điện Tử Chuyên Biệt',
    color: 'yellow',
    hex: '#D97706',
    desc: 'Bảng mạch, điện thoại cũ, sạc cáp hỏng, thiết bị điện gia dụng',
  },
};

/**
 * Returns recyclability evaluation label, badge text and semantic grade
 */
export function calculateRecyclabilityGrade(score: number): {
  gradeText: string;
  colorClass: string;
  level: 'very_high' | 'high' | 'medium' | 'low' | 'none';
} {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 80) {
    return {
      gradeText: 'Khả năng tái chế rất cao',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      level: 'very_high',
    };
  }
  if (clamped >= 60) {
    return {
      gradeText: 'Khả năng tái chế cao',
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
      level: 'high',
    };
  }
  if (clamped >= 40) {
    return {
      gradeText: 'Tái chế có điều kiện / Trung bình',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      level: 'medium',
    };
  }
  if (clamped >= 20) {
    return {
      gradeText: 'Khó tái chế / Cần xử lý đặc biệt',
      colorClass: 'text-orange-700 bg-orange-50 border-orange-200',
      level: 'low',
    };
  }
  return {
    gradeText: 'Không thể tái chế thông thường',
    colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
    level: 'none',
  };
}

/**
 * Calculates estimated CO2 emissions saved if properly sorted / recycled
 * Based on EPA WARM model and average carbon emission factors:
 * - Recyclable metals/aluminum: ~9 kg CO2e / kg
 * - PET plastic: ~1.5 - 2.0 kg CO2e / kg
 * - Paper/cardboard: ~1.2 kg CO2e / kg
 * - Organic composting vs landfill methane: ~0.5 kg CO2e / kg
 */
export function estimateCo2SavedKg(
  category: WasteCategory,
  weightGrams: number,
  recyclabilityScore: number
): number {
  const weightKg = Math.max(0, weightGrams) / 1000;
  let factor = 0.5;

  if (category === 'recyclable') {
    // scale factor with recyclability
    factor = 1.2 + (recyclabilityScore / 100) * 1.8; // between 1.2 and 3.0 kg CO2 / kg
  } else if (category === 'organic') {
    factor = 0.6; // avoids methane in landfills
  } else if (category === 'electronic') {
    factor = 3.5; // high embodied energy in e-waste
  } else if (category === 'hazardous') {
    factor = 0.8;
  } else {
    // residual waste
    factor = 0.1;
  }

  const saved = weightKg * factor * (recyclabilityScore > 0 ? (recyclabilityScore / 100) : 0.2);
  return Number(saved.toFixed(3));
}

/**
 * Filters waste records based on time period
 */
export function filterRecordsByPeriod(
  records: WasteLogRecord[],
  period: 'today' | '7days' | '30days' | 'all',
  refDate: Date = new Date()
): WasteLogRecord[] {
  if (period === 'all') return records;

  const refTime = refDate.getTime();
  const startOfDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();

  return records.filter((rec) => {
    const recTime = new Date(rec.loggedAt || rec.timestamp).getTime();
    if (isNaN(recTime)) return true;

    if (period === 'today') {
      return recTime >= startOfDay;
    }
    if (period === '7days') {
      const sevenDaysAgo = refTime - 7 * 24 * 60 * 60 * 1000;
      return recTime >= sevenDaysAgo;
    }
    if (period === '30days') {
      const thirtyDaysAgo = refTime - 30 * 24 * 60 * 60 * 1000;
      return recTime >= thirtyDaysAgo;
    }
    return true;
  });
}

/**
 * Aggregates summary statistics for a given list of waste logs
 */
export function aggregateWasteStats(records: WasteLogRecord[]): WasteStatsSummary {
  const totalItems = records.length;
  let totalWeightGrams = 0;
  let recyclableWeightGrams = 0;
  let totalCo2SavedKg = 0;

  const categoryWeights: Record<WasteCategory, { count: number; grams: number }> = {
    recyclable: { count: 0, grams: 0 },
    organic: { count: 0, grams: 0 },
    residual: { count: 0, grams: 0 },
    hazardous: { count: 0, grams: 0 },
    electronic: { count: 0, grams: 0 },
  };

  const materialWeights: Record<string, number> = {};

  for (const rec of records) {
    const weight = rec.estimatedWeightGrams || 100;
    totalWeightGrams += weight;
    totalCo2SavedKg += rec.co2SavedKg || estimateCo2SavedKg(rec.category, weight, rec.recyclabilityScore || 0);

    const cat = rec.category in categoryWeights ? rec.category : 'residual';
    categoryWeights[cat].count += 1;
    categoryWeights[cat].grams += weight;

    if (cat === 'recyclable') {
      recyclableWeightGrams += weight;
    }

    // Material tracking
    if (rec.materials && rec.materials.length > 0) {
      for (const mat of rec.materials) {
        const matWeight = (weight * (mat.percentage || 100)) / 100;
        const matKey = mat.name.trim() || rec.primaryMaterial || 'Vật liệu hỗn hợp';
        materialWeights[matKey] = (materialWeights[matKey] || 0) + matWeight;
      }
    } else if (rec.primaryMaterial) {
      materialWeights[rec.primaryMaterial] = (materialWeights[rec.primaryMaterial] || 0) + weight;
    }
  }

  const totalWeightKg = Number((totalWeightGrams / 1000).toFixed(2));
  const recyclableWeightKg = Number((recyclableWeightGrams / 1000).toFixed(2));
  const recyclingRate =
    totalWeightGrams > 0
      ? Number(((recyclableWeightGrams / totalWeightGrams) * 100).toFixed(1))
      : 0;

  const categoryBreakdown = (Object.keys(categoryWeights) as WasteCategory[]).map((cat) => {
    const data = categoryWeights[cat];
    const catKg = Number((data.grams / 1000).toFixed(2));
    const pct = totalWeightGrams > 0 ? Number(((data.grams / totalWeightGrams) * 100).toFixed(1)) : 0;
    return {
      category: cat,
      nameVi: CATEGORY_META[cat].nameVi,
      count: data.count,
      weightKg: catKg,
      percentage: pct,
      color: CATEGORY_META[cat].hex,
    };
  });

  const sortedMaterials = Object.entries(materialWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([mat, grams]) => {
      const matKg = Number((grams / 1000).toFixed(2));
      const pct = totalWeightGrams > 0 ? Number(((grams / totalWeightGrams) * 100).toFixed(1)) : 0;
      return {
        material: mat,
        weightKg: matKg,
        percentage: pct,
      };
    });

  return {
    totalItems,
    totalWeightKg,
    recyclableWeightKg,
    recyclingRate,
    co2SavedKg: Number(totalCo2SavedKg.toFixed(2)),
    categoryBreakdown,
    materialBreakdown: sortedMaterials,
  };
}

/**
 * Builds chronological daily trend data points for chart visualization
 */
export function buildTimeTrendPoints(
  records: WasteLogRecord[],
  daysCount: number = 7,
  refDate: Date = new Date()
): TimeTrendPoint[] {
  const points: TimeTrendPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

    const startOfTargetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const endOfTargetDay = startOfTargetDay + 24 * 60 * 60 * 1000;

    const dayRecords = records.filter((r) => {
      const t = new Date(r.loggedAt || r.timestamp).getTime();
      return t >= startOfTargetDay && t < endOfTargetDay;
    });

    let totalGrams = 0;
    let recyclableGrams = 0;
    let organicGrams = 0;

    for (const r of dayRecords) {
      const w = r.estimatedWeightGrams || 100;
      totalGrams += w;
      if (r.category === 'recyclable') recyclableGrams += w;
      if (r.category === 'organic') organicGrams += w;
    }

    points.push({
      label: dayLabel,
      dateStr,
      totalGrams,
      recyclableGrams,
      organicGrams,
      count: dayRecords.length,
    });
  }

  return points;
}
