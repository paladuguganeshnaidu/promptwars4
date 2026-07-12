// Mock operational data used when Firestore API is unavailable or disabled.
// This allows the operations dashboard to display baseline data even without
// database connectivity, improving resilience on free-tier deployments.
import type { OpsSnapshot } from '../features/operations/types.js';
import { BASELINE_INCIDENTS, BASELINE_SUSTAINABILITY, BASELINE_ZONES } from '../features/operations/seed-data.js';
import { toZoneOccupancy } from '../features/operations/crowd.js';

/** Returns a snapshot with baseline mock data (no Firestore required). */
export function getMockSnapshot(): OpsSnapshot {
  const zones = BASELINE_ZONES.map(toZoneOccupancy).sort((a, b) => b.densityPct - a.densityPct);
  const incidents = BASELINE_INCIDENTS.sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt),
  );

  return {
    zones,
    incidents,
    sustainability: BASELINE_SUSTAINABILITY,
    generatedAt: new Date().toISOString(),
  };
}
