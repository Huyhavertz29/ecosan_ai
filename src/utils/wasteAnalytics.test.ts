import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRecyclabilityGrade,
  estimateCo2SavedKg,
  filterRecordsByPeriod,
  aggregateWasteStats,
  buildTimeTrendPoints,
} from './wasteAnalytics';
import { WasteLogRecord } from '../types/waste';

test('calculateRecyclabilityGrade returns accurate grade categories', () => {
  const vHigh = calculateRecyclabilityGrade(95);
  assert.equal(vHigh.level, 'very_high');

  const high = calculateRecyclabilityGrade(68);
  assert.equal(high.level, 'high');

  const medium = calculateRecyclabilityGrade(45);
  assert.equal(medium.level, 'medium');

  const low = calculateRecyclabilityGrade(25);
  assert.equal(low.level, 'low');

  const none = calculateRecyclabilityGrade(10);
  assert.equal(none.level, 'none');
});

test('estimateCo2SavedKg yields positive carbon reduction for recyclables and organics', () => {
  const recSaved = estimateCo2SavedKg('recyclable', 500, 90);
  assert.ok(recSaved > 0, 'Recyclables should yield positive CO2 savings');

  const orgSaved = estimateCo2SavedKg('organic', 1000, 70);
  assert.ok(orgSaved > 0, 'Organics should save emissions from landfill avoidance');
});

test('aggregateWasteStats computes correct weights, rates, and category distribution', () => {
  const dummyLogs: WasteLogRecord[] = [
    {
      id: '1',
      timestamp: '2026-11-10T10:00:00.000Z',
      loggedAt: '2026-11-10T10:00:00.000Z',
      itemName: 'Chai nhựa Lavie',
      category: 'recyclable',
      categoryNameVi: 'Rác Tái Chế',
      confidence: 0.95,
      materials: [{ name: 'Nhựa PET', percentage: 100, recyclability: 'high', notes: 'Thân chai' }],
      primaryMaterial: 'Nhựa PET',
      recyclabilityScore: 90,
      recyclabilityExplanation: 'Dễ tái chế',
      binColor: 'blue',
      binNameVi: 'Thùng Xanh Dương',
      disposalSteps: ['Súc rửa sạch', 'Bóp bẹp'],
      doNotDo: ['Không vứt kèm chất lỏng'],
      decompositionTime: '450 năm',
      estimatedWeightGrams: 30,
      co2SavedKg: 0.08,
      upcyclingIdeas: ['Làm chậu cây mini'],
    },
    {
      id: '2',
      timestamp: '2026-11-10T11:00:00.000Z',
      loggedAt: '2026-11-10T11:00:00.000Z',
      itemName: 'Vỏ chuối',
      category: 'organic',
      categoryNameVi: 'Rác Thực Phẩm / Hữu Cơ',
      confidence: 0.98,
      materials: [{ name: 'Chất hữu cơ tự nhiên', percentage: 100, recyclability: 'high', notes: 'Dễ ủ phân' }],
      primaryMaterial: 'Hữu cơ',
      recyclabilityScore: 85,
      recyclabilityExplanation: 'Ủ phân compost tốt',
      binColor: 'green',
      binNameVi: 'Thùng Xanh Lá',
      disposalSteps: ['Cho vào thùng hữu cơ'],
      doNotDo: ['Không bọc túi nilon'],
      decompositionTime: '2-4 tuần',
      estimatedWeightGrams: 70,
      co2SavedKg: 0.04,
      upcyclingIdeas: ['Ủ phân vi sinh bón cây'],
    },
  ];

  const stats = aggregateWasteStats(dummyLogs);
  assert.equal(stats.totalItems, 2);
  assert.equal(stats.totalWeightKg, 0.1); // 30g + 70g = 100g = 0.1kg
  assert.equal(stats.recyclableWeightKg, 0.03); // 30g = 0.03kg
  assert.equal(stats.recyclingRate, 30); // 30% recyclable
  assert.equal(stats.co2SavedKg, 0.12);
});

test('buildTimeTrendPoints generates discrete daily time buckets', () => {
  const refDate = new Date('2026-11-11T12:00:00.000Z');
  const dummyLogs: WasteLogRecord[] = [
    {
      id: '1',
      timestamp: '2026-11-11T08:00:00.000Z',
      loggedAt: '2026-11-11T08:00:00.000Z',
      itemName: 'Lon nước ngọt',
      category: 'recyclable',
      categoryNameVi: 'Rác Tái Chế',
      confidence: 0.96,
      materials: [{ name: 'Nhôm', percentage: 100, recyclability: 'high', notes: 'Kim loại' }],
      primaryMaterial: 'Nhôm',
      recyclabilityScore: 95,
      recyclabilityExplanation: 'Nhôm tái chế vô hạn lần',
      binColor: 'blue',
      binNameVi: 'Thùng Xanh Dương',
      disposalSteps: ['Làm bẹp'],
      doNotDo: [],
      decompositionTime: '200 năm',
      estimatedWeightGrams: 15,
      co2SavedKg: 0.1,
      upcyclingIdeas: [],
    },
  ];

  const points = buildTimeTrendPoints(dummyLogs, 7, refDate);
  assert.equal(points.length, 7);
  // Last point is today (11/11)
  const todayPoint = points[points.length - 1];
  assert.equal(todayPoint.count, 1);
  assert.equal(todayPoint.totalGrams, 15);
  assert.equal(todayPoint.recyclableGrams, 15);
});
