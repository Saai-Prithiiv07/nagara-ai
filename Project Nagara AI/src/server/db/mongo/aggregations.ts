/**
 * MongoDB Aggregation Pipeline Service
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Aggregation Pipeline Stages:
 *   1. $match: Filter documents by date and risk criteria
 *   2. $unwind: Deconstruct embedded array of readings
 *   3. $group: Group by wardId to compute aggregate metrics ($avg, $max, $min)
 *   4. $project: Format and shape output attributes
 *   5. $sort: Rank results in descending order of climate severity
 */

import { WardTelemetryDocument } from './models';

export interface AggregationResult {
  wardId: string;
  totalReadingsCount: number;
  averageTemperatureC: number;
  peakTemperatureC: number;
  averagePm25: number;
  totalRainfallMm: number;
  severityGrade: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

/**
 * Executes a simulated 5-stage MongoDB Aggregation Pipeline.
 *
 * Equivalent Mongoose pipeline:
 * [
 *   { $match: { avgRiskIndex: { $gte: minRisk } } },
 *   { $unwind: "$readings" },
 *   { $group: {
 *       _id: "$wardId",
 *       avgTemp: { $avg: "$readings.tempCelsius" },
 *       maxTemp: { $max: "$readings.tempCelsius" },
 *       avgPm25: { $avg: "$readings.pm25" },
 *       sumRain: { $sum: "$readings.rainGaugeMm" },
 *       count: { $sum: 1 }
 *   }},
 *   { $project: { ... } },
 *   { $sort: { avgTemp: -1 } }
 * ]
 */
export function executeTelemetryAggregationPipeline(
  documents: WardTelemetryDocument[],
  minRisk = 30.0
): AggregationResult[] {
  // STAGE 1: $match
  const matchedDocs = documents.filter((doc) => doc.avgRiskIndex >= minRisk);

  // STAGE 2: $unwind embedded readings & STAGE 3: $group by wardId
  const groups = new Map<
    string,
    {
      temps: number[];
      pm25s: number[];
      rains: number[];
    }
  >();

  for (const doc of matchedDocs) {
    const existing = groups.get(doc.wardId) || { temps: [], pm25s: [], rains: [] };
    for (const r of doc.readings) {
      existing.temps.push(r.tempCelsius);
      existing.pm25s.push(r.pm25);
      existing.rains.push(r.rainGaugeMm);
    }
    groups.set(doc.wardId, existing);
  }

  // STAGE 4: $project
  const projected: AggregationResult[] = [];
  for (const [wardId, data] of groups.entries()) {
    if (data.temps.length === 0) continue;

    const avgTemp = data.temps.reduce((a, b) => a + b, 0) / data.temps.length;
    const maxTemp = Math.max(...data.temps);
    const avgPm25 = data.pm25s.reduce((a, b) => a + b, 0) / data.pm25s.length;
    const sumRain = data.rains.reduce((a, b) => a + b, 0);

    let severityGrade: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';
    if (avgTemp > 33.0 || avgPm25 > 100) {
      severityGrade = 'CRITICAL';
    } else if (avgTemp > 30.0 || avgPm25 > 60) {
      severityGrade = 'ELEVATED';
    }

    projected.push({
      wardId,
      totalReadingsCount: data.temps.length,
      averageTemperatureC: Number(avgTemp.toFixed(2)),
      peakTemperatureC: Number(maxTemp.toFixed(2)),
      averagePm25: Number(avgPm25.toFixed(1)),
      totalRainfallMm: Number(sumRain.toFixed(2)),
      severityGrade,
    });
  }

  // STAGE 5: $sort (Descending by average temperature)
  return projected.sort((a, b) => b.averageTemperatureC - a.averageTemperatureC);
}
