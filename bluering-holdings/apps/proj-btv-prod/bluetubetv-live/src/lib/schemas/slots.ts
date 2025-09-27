// src/lib/schemas/slots.ts

// src/lib/schemas/slots.ts

// quarters
export type SlotKey = "Q1" | "Q2" | "HALF" | "Q3" | "Q4";
export type GameSlot = SlotKey;

// optional sponsor metadata
export type Sponsor = { id: string; name: string; url?: string; logo?: string };

// every creative carries id/active (+ optional metadata)
export type SlotBase = {
  id: string;
  active: boolean;
  label?: string;
  sponsor?: Sponsor;
  weight?: number;
};

// creative union
export type SlotItem =
  | (SlotBase & {
      kind: "image";
      img: string;
      w?: string;
      anchor?: string;
      x?: string;
      y?: string;
      animate?: string;
      holdMs?: number;
      href?: string;
    })
  | (SlotBase & {
      kind: "qr-card";
      img?: string;
      q?: string;      // data to encode
      qr?: string;     // direct QR image URL (overrides q)
      label?: string;
      cta?: string;
      href?: string;
      w?: string;
      anchor?: string;
      x?: string;
      y?: string;
      animate?: string;
      holdMs?: number;
    })
  | (SlotBase & {
      kind: "promo";        // simple image promo
      promoSrc: string;
      width?: number;
    })
  | (SlotBase & {
      kind: "url";          // full overlay URL passthrough
      url: string;          // absolute or relative
    });

// schedule doc
export type SlotSchedule = {
  gameId: string;
  updatedAt: string;
  activeSlot: SlotKey;
  activeIndex: number;
  slots: Record<SlotKey, SlotItem[]>;
};

// analytics
export type ImpressionEvent = {
  id: string;
  when: number;         // epoch ms
  gameId?: string;
  slot?: SlotKey;
  itemId?: string;      // not "slotItemId"
};

export type ScanEvent = ImpressionEvent & {
  href?: string;
};
