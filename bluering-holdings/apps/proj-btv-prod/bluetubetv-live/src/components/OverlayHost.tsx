"use client";
import dynamic from "next/dynamic";
import HtmlOverlay from "./HtmlOverlay";
import type { OverlayDef } from "../engine/overlayRegistry";

export default function OverlayHost({
  overlay, open = true
}: { overlay: OverlayDef, open?: boolean }) {
 if (overlay.kind === "none") return null;
  const ReactOverlay =
    overlay.kind === "react"
      ? dynamic(() => import(`./overlays/${overlay.comp}`))
      : null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* simple slide-from-top when open toggles */}
      <div className={`transition-transform duration-700 ${open ? "translate-y-0" : "-translate-y-full"}`}>
        {overlay.kind === "html"  && overlay.src  && <HtmlOverlay src={overlay.src} />}
        {overlay.kind === "react" && ReactOverlay && (
          <div className="pointer-events-none">
            <ReactOverlay />
          </div>
        )}
      </div>
    </div>
  );
}
