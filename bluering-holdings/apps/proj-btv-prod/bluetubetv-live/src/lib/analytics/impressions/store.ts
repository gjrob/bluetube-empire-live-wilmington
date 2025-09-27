// Lightweight dev-only in-memory store (resets on redeploy)
// For production, swap to Redis / DB (see note below).

export type Impression = {
  itemId: string;
  visibleSec: number;
  ts?: number; // optional timestamp
  when?: number; // optional timestamp for when the impression was added
};

// Reuse the same array across hot reloads / serverless invocations (where supported)
const globalKey = '__btv_impressions__' as const;
const g = globalThis as unknown as { [globalKey]?: Impression[] };

export const memoryStore: Impression[] = g[globalKey] ?? (g[globalKey] = []);

export function addImpression(e: Impression) {
  memoryStore.push({ when: Date.now(), ...e });
}

export function clearImpressions() {
  memoryStore.length = 0;
}
