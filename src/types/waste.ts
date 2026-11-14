export type WasteCategory =
  | 'recyclable'
  | 'organic'
  | 'residual'
  | 'hazardous'
  | 'electronic';

export interface MaterialDetail {
  name: string;
  percentage: number;
  recyclability: 'high' | 'medium' | 'low' | 'none';
  notes: string;
}

export interface WasteClassificationResult {
  id: string;
  timestamp: string;
  itemName: string;
  category: WasteCategory;
  categoryNameVi: string;
  confidence: number;
  materials: MaterialDetail[];
  primaryMaterial: string;
  recyclabilityScore: number; // 0 - 100
  recyclabilityExplanation: string;
  binColor: 'green' | 'blue' | 'gray' | 'red' | 'yellow';
  binNameVi: string;
  disposalSteps: string[];
  doNotDo: string[];
  decompositionTime: string;
  estimatedWeightGrams: number;
  co2SavedKg: number;
  upcyclingIdeas: string[];
  imageUrl?: string;
  locationTip?: string;
}

export interface WasteLogRecord extends WasteClassificationResult {
  loggedAt: string; // ISO string
}

export interface WasteStatsSummary {
  totalItems: number;
  totalWeightKg: number;
  recyclableWeightKg: number;
  recyclingRate: number; // percentage 0 - 100
  co2SavedKg: number;
  categoryBreakdown: {
    category: WasteCategory;
    nameVi: string;
    count: number;
    weightKg: number;
    percentage: number;
    color: string;
  }[];
  materialBreakdown: {
    material: string;
    weightKg: number;
    percentage: number;
  }[];
}

export interface TimeTrendPoint {
  label: string;
  dateStr: string;
  totalGrams: number;
  recyclableGrams: number;
  organicGrams: number;
  count: number;
}
