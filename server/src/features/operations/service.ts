// Operations repository: reads the live operational picture from Firestore
// and advances the simulated crowd-telemetry feed. The simulator stands in
// for real gate/turnstile sensors — swapping it for a sensor ingest keeps
// every read path unchanged (see docs/decisions.md). Pure density logic
// lives in crowd.ts.
//
// If Firestore is unavailable (API disabled, permission denied, etc.),
// operations fall back to mock data so the dashboard remains functional.
import { FieldValue, type QueryDocumentSnapshot } from '@google-cloud/firestore';
import type { z } from 'zod';

import { TELEMETRY_REFILL_MAX_GROWTH } from '../../config/constants.js';
import { COLLECTIONS, getFirestore, SUSTAINABILITY_DOC_ID, isFirestoreAvailable, markFirestoreUnavailable } from '../../lib/firestore.js';
import { logger } from '../../lib/logger.js';
import { getMockSnapshot } from '../../lib/mock-data.js';
import { nextOccupancy, toZoneOccupancy } from './crowd.js';
import { incidentSchema, sustainabilityMetricsSchema, zoneRecordSchema } from './schemas.js';
import { BASELINE_INCIDENTS, BASELINE_SUSTAINABILITY, BASELINE_ZONES } from './seed-data.js';
import type { OpsSnapshot } from './types.js';

/**
 * Parses Firestore documents against a schema, skipping (and logging) any
 * that fail — a corrupt document must never take down the snapshot pipeline.
 */
function parseDocuments<T>(schema: z.ZodType<T>, documents: QueryDocumentSnapshot[]): T[] {
  return documents.flatMap((document) => {
    const parsed = schema.safeParse(document.data());
    if (!parsed.success) {
      logger.warn({ id: document.id }, 'Skipping malformed operations document');
      return [];
    }
    return [parsed.data];
  });
}

/** Seeds baseline zones, incidents and sustainability if the DB is empty. */
export async function ensureSeeded(): Promise<void> {
  if (!isFirestoreAvailable()) {
    logger.info('Firestore unavailable; skipping seeding (mock data will be used)');
    return;
  }

  try {
    const db = getFirestore();

    // Check if zones collection has any documents
    logger.debug('Checking if Firestore collections are populated...');
    const existing = await db.collection(COLLECTIONS.zones).limit(1).get();

    if (!existing.empty) {
      logger.info('Firestore collections already populated, skipping seed');
      return;
    }

    logger.info('Firestore collections are empty, seeding with baseline data...');

    // Create a batch write to seed all collections atomically
    const batch = db.batch();

    // Seed zones
    for (const zone of BASELINE_ZONES) {
      const zoneRef = db.collection(COLLECTIONS.zones).doc(zone.id);
      batch.set(zoneRef, zone);
    }
    logger.debug(`Prepared ${String(BASELINE_ZONES.length)} zones for seeding`);

    // Seed incidents
    for (const incident of BASELINE_INCIDENTS) {
      const incidentRef = db.collection(COLLECTIONS.incidents).doc(incident.id);
      batch.set(incidentRef, incident);
    }
    logger.debug(`Prepared ${String(BASELINE_INCIDENTS.length)} incidents for seeding`);

    // Seed sustainability metrics
    const sustainabilityRef = db
      .collection(COLLECTIONS.sustainability)
      .doc(SUSTAINABILITY_DOC_ID);
    batch.set(sustainabilityRef, BASELINE_SUSTAINABILITY);
    logger.debug('Prepared sustainability metrics for seeding');

    // Commit all writes at once
    await batch.commit();
    logger.info('Successfully seeded baseline operations data into Firestore');
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(
      { errorCode, errorMessage, err: error },
      'Failed to seed Firestore collections',
    );

    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('disabled')) {
      markFirestoreUnavailable(errorMessage);
      logger.warn('Firestore API unavailable; operations will use mock data');
    } else {
      // Re-throw other errors so they're visible in startup logs
      throw error;
    }
  }
}

/** Reads the current operational snapshot from Firestore, or mock data if unavailable. */
export async function getSnapshot(): Promise<OpsSnapshot> {
  if (!isFirestoreAvailable()) {
    logger.debug('Firestore unavailable; returning mock snapshot');
    return getMockSnapshot();
  }

  try {
    const db = getFirestore();
    const [zonesSnap, incidentsSnap, sustainabilitySnap] = await Promise.all([
      db.collection(COLLECTIONS.zones).get(),
      db.collection(COLLECTIONS.incidents).get(),
      db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID).get(),
    ]);

    const zones = parseDocuments(zoneRecordSchema, zonesSnap.docs)
      .map(toZoneOccupancy)
      .sort((a, b) => b.densityPct - a.densityPct);

    // If no zones exist, return mock data (collections not yet seeded)
    if (zones.length === 0) {
      logger.debug('Operations collections are empty; returning mock snapshot');
      return getMockSnapshot();
    }

    const incidents = parseDocuments(incidentSchema, incidentsSnap.docs).sort((a, b) =>
      b.reportedAt.localeCompare(a.reportedAt),
    );
    const parsedSustainability = sustainabilityMetricsSchema.safeParse(sustainabilitySnap.data());
    const sustainability = parsedSustainability.success
      ? parsedSustainability.data
      : BASELINE_SUSTAINABILITY;

    return { zones, incidents, sustainability, generatedAt: new Date().toISOString() };
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.warn(
      { errorCode, errorMessage },
      'Failed to read operations snapshot; falling back to mock data',
    );

    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('disabled')) {
      markFirestoreUnavailable(errorMessage);
    }

    // Always fallback to mock data on read errors
    return getMockSnapshot();
  }
}

/**
 * Advances the simulated telemetry feed one tick: nudges every zone's
 * occupancy and grows the water-refill sustainability counter.
 *
 * @param random - Injectable source of randomness for deterministic tests.
 */
export async function advanceTelemetry(random: () => number = Math.random): Promise<void> {
  if (!isFirestoreAvailable()) {
    logger.debug('Firestore unavailable; skipping telemetry tick');
    return;
  }

  try {
    const db = getFirestore();
    const zonesSnap = await db.collection(COLLECTIONS.zones).get();

    // If no zones exist yet (not seeded), skip this tick
    if (zonesSnap.empty) {
      logger.debug('No zones in Firestore; skipping telemetry tick');
      return;
    }

    const batch = db.batch();
    for (const doc of zonesSnap.docs) {
      const zone = zoneRecordSchema.safeParse(doc.data());
      if (!zone.success) {
        logger.warn({ id: doc.id }, 'Skipping malformed zone during telemetry tick');
        continue;
      }
      batch.update(doc.ref, { occupancy: nextOccupancy(zone.data, random) });
    }
    const refillGrowth = Math.round(random() * TELEMETRY_REFILL_MAX_GROWTH);
    batch.set(
      db.collection(COLLECTIONS.sustainability).doc(SUSTAINABILITY_DOC_ID),
      { waterRefillCount: FieldValue.increment(refillGrowth) },
      { merge: true },
    );
    await batch.commit();
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.warn(
      { errorCode, errorMessage },
      'Telemetry tick failed; will retry on next tick',
    );

    if (errorCode === 'PERMISSION_DENIED' || errorMessage.includes('disabled')) {
      markFirestoreUnavailable(errorMessage);
    }
    // Don't re-throw: telemetry is best-effort and should not crash the server
  }
}
