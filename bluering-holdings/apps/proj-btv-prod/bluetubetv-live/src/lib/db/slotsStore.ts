import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type {
  SlotSchedule,
  SlotItem,
  SlotKey,          // use SlotKey for function params
  ImpressionEvent,
  ScanEvent,
} from "../schemas/slots";   // <-- confirm this relative path

// on-disk files
const DATA_DIR = path.join(process.cwd(), "var");
const SLOTS_FILE = path.join(DATA_DIR, "slots.json");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");

/** ensure data dir & seed files */
async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(SLOTS_FILE);
  } catch {
    const base: SlotSchedule = {
      gameId: "demo-001",
      updatedAt: new Date().toISOString(),
      activeSlot: "Q1",
      activeIndex: 0,
      slots: { Q1: [], Q2: [], HALF: [], Q3: [], Q4: [] },
    };
    await fs.writeFile(SLOTS_FILE, JSON.stringify(base, null, 2));
  }

  try {
    await fs.access(METRICS_FILE);
  } catch {
    await fs.writeFile(
      METRICS_FILE,
      JSON.stringify({ impressions: [], scans: [] }, null, 2)
    );
  }
}

/** schedule io */
export async function readSchedule(): Promise<SlotSchedule> {
  await ensure();
  return JSON.parse(await fs.readFile(SLOTS_FILE, "utf8"));
}

export async function writeSchedule(s: SlotSchedule) {
  s.updatedAt = new Date().toISOString();
  await fs.writeFile(SLOTS_FILE, JSON.stringify(s, null, 2));
}

/** mutate schedule */
export async function addItem(
  slot: SlotKey,
  item: Omit<SlotItem, "id" | "active"> & Partial<Pick<SlotItem, "id" | "active">>
) {
  const s = await readSchedule();
  const id = item.id ?? randomUUID();
  const active = item.active ?? true;
  const full = { ...(item as any), id, active } as SlotItem;
  s.slots[slot].push(full);
  await writeSchedule(s);
  return id;
}

export async function setActiveSlot(slot: SlotKey) {
  const s = await readSchedule();
  s.activeSlot = slot;
  await writeSchedule(s);
}

export async function setActiveIndex(i: number) {
  const s = await readSchedule();
  const list = s.slots?.[s.activeSlot] ?? [];
  s.activeIndex = Math.min(Math.max(0, i), Math.max(0, list.length - 1));
  await writeSchedule(s);
  return s.activeIndex;
}

export async function toggleItem(slot: SlotKey, id: string, on: boolean) {
  const s = await readSchedule();
  const v = s.slots[slot];
  const i = v.findIndex((x) => x.id === id);
  if (i >= 0) {
    v[i].active = on;
    await writeSchedule(s);
  }
}

/** pick the currently live item (respect activeIndex, fallback to first active) */
export async function getCurrentItem(): Promise<SlotItem | null> {
  const s = await readSchedule();
  const list = s.slots?.[s.activeSlot] ?? [];
  const idx = Number.isFinite(s.activeIndex) ? s.activeIndex : 0;
  return (list[idx]?.active ? list[idx] : undefined) ?? list.find((x) => x.active) ?? null;
}

/** metrics io */
type Metrics = { impressions: ImpressionEvent[]; scans: ScanEvent[] };

async function readMetrics(): Promise<Metrics> {
  await ensure();
  return JSON.parse(await fs.readFile(METRICS_FILE, "utf8"));
}
async function writeMetrics(m: Metrics) {
  await fs.writeFile(METRICS_FILE, JSON.stringify(m, null, 2));
}

export async function recordImpression(ev: ImpressionEvent) {
  const m = await readMetrics();
  m.impressions.push(ev);
  await writeMetrics(m);
}

export async function recordScan(ev: ScanEvent) {
  const m = await readMetrics();
  m.scans.push(ev);
  await writeMetrics(m);
}

export async function getMetrics(gameId?: string) {
  const m = await readMetrics();
  if (!gameId) return m;
  return {
    impressions: m.impressions.filter((x) => x.gameId === gameId),
    scans: m.scans.filter((x) => x.gameId === gameId),
  };
}
