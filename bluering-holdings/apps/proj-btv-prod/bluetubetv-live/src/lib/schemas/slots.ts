export type GameSlot = "Q1" | "Q2" | "HALF" | "Q3" | "Q4";

export type SlotItem = {
  id: string;
  label: string;
  overlayUrl: string;
  sponsor: { id: string; name: string; contact?: string };
  weight?: number;
  active?: boolean;
};

export type SlotSchedule = {
  gameId: string;
  updatedAt: string;
  activeSlot: GameSlot;
  slots: Record<GameSlot, SlotItem[]>;
};

export type ImpressionEvent = {
  ts: string;
  gameId: string;
  slot: GameSlot;
  slotItemId: string;
  viewerHash?: string;
};

export type ScanEvent = {
  ts: string;
  gameId: string;
  slot: GameSlot;
  slotItemId: string;
  campaignId: string;
  ua?: string;
  ref?: string;
};
