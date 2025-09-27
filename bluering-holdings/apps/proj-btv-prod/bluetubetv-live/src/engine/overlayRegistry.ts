// src/engine/overlayRegistry.ts
export type OverlayKey = "none" | "rockstar" | "chef" | "football";
export type OverlayDef =
  | { kind: "none" }
  | { kind: "html"; src: string }
  | { kind: "react"; comp: string };

export const OVERLAYS: Record<OverlayKey, OverlayDef> = {
  none:     { kind: "none" },                        // ← no component name
  rockstar: { kind: "html",  src: "/overlays/rockstar.html" },
  chef:     { kind: "html",  src: "/overlays/chef.html" },  // add later
  football: { kind: "react", comp: "FootballScoreBug" },    // optional
};

export function resolveOverlay(key?: string): OverlayKey {
  const k = (key || "").toLowerCase() as OverlayKey;
  return k in OVERLAYS ? k : "none";
}