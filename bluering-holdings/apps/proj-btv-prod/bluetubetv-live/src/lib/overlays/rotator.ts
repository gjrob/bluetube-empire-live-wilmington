import { OverlayItem, OverlaySlot, RotationPlan } from "./types";

export function isWithinWindow(now: Date, startAt?: string, endAt?: string) {
  const s = startAt ? new Date(startAt) : null;
  const e = endAt ? new Date(endAt) : null;
  if (s && now < s) return false;
  if (e && now > e) return false;
  return true;
}

export function pickWeighted<T extends { weight?: number }>(items: T[], seed = 0): T | undefined {
  if (!items.length) return undefined;
  const total = items.reduce((a, b) => a + (b.weight ?? 1), 0);
  const r = (hash32(seed.toString()) % 10000) / 10000 * total;
  let acc = 0;
  for (const it of items) {
    acc += it.weight ?? 1;
    if (r <= acc) return it;
  }
  return items[items.length - 1];
}

// Cheap deterministic hash for “seeded” rotation so all viewers see the same pick at time T
function hash32(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Given all overlays, a per-slot rotation plan, current time, and a seed key,
 * return the active overlay IDs for each slot.
 */
export function computeActiveBySlot(opts: {
  all: OverlayItem[];
  plan: RotationPlan;
  now: Date;
  seedKey: string; // e.g., `${streamId}:${Math.floor(now.getTime()/cadence*1000)}`
}): Record<OverlaySlot, OverlayItem[]> {
  const { all, plan, now, seedKey } = opts;
  const bySlot = groupBySlot(all);
  const out: Record<OverlaySlot, OverlayItem[]> = {
    "top-left": [], "top-center": [], "top-right": [],
    "bottom-left": [], "bottom-center": [], "bottom-right": [], "full": []
  };

  for (const rule of plan) {
    if (!isWithinWindow(now, rule.startAt, rule.endAt)) continue;
    const pool = bySlot[rule.slot] ?? [];
    if (!pool.length) continue;

    const max = rule.maxConcurrent ?? 1;
    // Use cadenceSec to derive a deterministic pick window
    const cadenceMs = (rule.cadenceSec || 10) * 1000;
    const tick = Math.floor(now.getTime() / cadenceMs);
    // make a stable seed per slot
    let localSeed = hash32(`${seedKey}:${rule.slot}:${tick}`).toString();

    const chosen: OverlayItem[] = [];
    const used = new Set<string>();
    for (let i = 0; i < Math.min(max, pool.length); i++) {
      // Filter out already used IDs for this round
      const candidates = pool.filter(p => !used.has(p.id));
      const pick = pickWeighted(candidates, hash32(localSeed + ":" + i));
      if (pick) {
        chosen.push(pick);
        used.add(pick.id);
      }
    }
    out[rule.slot] = chosen;
  }

  return out;
}

function groupBySlot(all: OverlayItem[]): Record<OverlaySlot, OverlayItem[]> {
  const map: Record<OverlaySlot, OverlayItem[]> = {
    "top-left": [], "top-center": [], "top-right": [],
    "bottom-left": [], "bottom-center": [], "bottom-right": [], "full": []
  };
  for (const it of all) map[it.slot].push(it);
  return map;
}
