export type OverlaySlot =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "full";

export type OverlayItem =
  | { id: string; slot: OverlaySlot; img: string; href?: string; w?: number; h?: number; html?: never; weight?: number }
  | { id: string; slot: OverlaySlot; html: string; href?: string; w?: number; h?: number; img?: never; weight?: number };

export type RotationRule = {
  slot: OverlaySlot;              // which corner/area to rotate
  cadenceSec: number;             // how often to rotate
  durationSec?: number;           // optional: visibility window (if different from cadence)
  startAt?: string;               // ISO window start (optional)
  endAt?: string;                 // ISO window end (optional)
  maxConcurrent?: number;         // usually 1; could be >1 for stacks
};

export type RotationPlan = RotationRule[];

export type ImpressionEvent = {
  streamId: string;
  itemId: string;
  slot: OverlaySlot;
  visibleSec: number;             // seconds this item was visible in this burst
  startedAt: string;              // ISO
  endedAt: string;                // ISO
  layout?: string;                // optional: solo/split-2/grid-3
};
