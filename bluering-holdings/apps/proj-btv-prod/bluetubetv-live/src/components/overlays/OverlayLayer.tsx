"use client";

import React from "react";

export type OverlaySlot =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "full";

export type OverlayItem =
  | { id: string; slot: OverlaySlot; img: string; href?: string; w?: number; h?: number; html?: never }
  | { id: string; slot: OverlaySlot; html: string; href?: string; w?: number; h?: number; img?: never };

export default function OverlayLayer({ items }: { items?: OverlayItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {items.map((o) => (
        <Slot key={o.id} slot={o.slot} w={o.w} h={o.h}>
          {"img" in o && o.img ? (
            <a
              className="pointer-events-auto"
              href={o.href ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={o.img}
                alt=""
                style={{
                  width: o.w ? `${o.w}px` : "auto",
                  height: o.h ? `${o.h}px` : "auto",
                }}
              />
            </a>
          ) : (
            <div
              className="pointer-events-auto"
              dangerouslySetInnerHTML={{ __html: (o as any).html }}
            />
          )}
        </Slot>
      ))}
    </div>
  );
}

function Slot({
  slot,
  children,
  w,
  h,
}: {
  slot: OverlaySlot;
  children: React.ReactNode;
  w?: number;
  h?: number;
}) {
  const base = "absolute p-2";
  const map: Record<OverlaySlot, string> = {
    "top-left": `${base} left-2 top-2`,
    "top-center": `${base} left-1/2 -translate-x-1/2 top-2`,
    "top-right": `${base} right-2 top-2`,
    "bottom-left": `${base} left-2 bottom-2`,
    "bottom-center": `${base} left-1/2 -translate-x-1/2 bottom-2`,
    "bottom-right": `${base} right-2 bottom-2`,
    full: "absolute inset-0 flex items-center justify-center",
  };
  return (
    <div
      className={map[slot]}
      style={{
        width: w ? `${w}px` : undefined,
        height: h ? `${h}px` : undefined,
      }}
    >
      {children}
    </div>
  );
}
