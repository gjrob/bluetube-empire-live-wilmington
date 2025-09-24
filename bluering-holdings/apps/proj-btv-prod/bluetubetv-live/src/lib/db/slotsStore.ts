import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type {
  SlotSchedule, SlotItem, GameSlot,
  ImpressionEvent, ScanEvent
} from "@/lib/schemas/slots";

const DATA_DIR = path.join(process.cwd(), "var");
const SLOTS_FILE = path.join(DATA_DIR, "slots.json");
const METRICS_FILE = path.join(DATA_DIR, "metrics.json");

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(SLOTS_FILE); }
  catch {
    const base: SlotSchedule = {
      gameId: "demo-001",
      updatedAt: new Date().toISOString(),
      activeSlot: "Q1",
      slots: { Q1: [], Q2: [], HALF: [], Q3: [], Q4: [] }
    };
    await fs.writeFile(SLOTS_FILE, JSON.stringify(base, null, 2));
  }
  try { await fs.access(METRICS_FILE); }
  catch { await fs.writeFile(METRICS_FILE, JSON.stringify({ impressions: [], scans: [] }, null, 2)); }
}

export async function readSchedule(): Promise<SlotSchedule> {
  await ensure();
  return JSON.parse(await fs.readFile(SLOTS_FILE, "utf8"));
}
export async function writeSchedule(s: SlotSchedule) {
  s.updatedAt = new Date().toISOString();
  await fs.writeFile(SLOTS_FILE, JSON.stringify(s, null, 2));
}

export async function addItem(slot: GameSlot, item: Omit<SlotItem,"id"> & Partial<Pick<SlotItem,"id">>) {
  const s = await readSchedule();
  const id = item.id ?? randomUUID();
  s.slots[slot].push({ ...item, id, active: item.active ?? true });
  await writeSchedule(s);
  return id;
}

export async function setActiveSlot(slot: GameSlot) {
  const s = await readSchedule();
  s.activeSlot = slot;
  await writeSchedule(s);
}

export async function toggleItem(slot: GameSlot, id: string, on: boolean) {
  const s = await readSchedule();
  const v = s.slots[slot];
  const i = v.findIndex(x => x.id === id);
  if (i >= 0) { v[i].active = on; await writeSchedule(s); }
}

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
    impressions: m.impressions.filter(x => x.gameId === gameId),
    scans: m.scans.filter(x => x.gameId === gameId),
  };
}
