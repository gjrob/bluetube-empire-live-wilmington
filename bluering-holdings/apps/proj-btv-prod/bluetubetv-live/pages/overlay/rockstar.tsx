// pages/overlay/rockstar.tsx
import { useMemo } from "react";
import { useRouter } from "next/router";

const RockstarOverlayPage = () => {
  const { asPath } = useRouter();

  // forward all query params to the static HTML overlay in /public/overlays
  const src = useMemo(() => {
    const q = asPath.split("?")[1] || "";
    return `/overlays/rockstar.html${q ? `?${q}` : ""}`;
  }, [asPath]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "transparent" }}>
      <iframe
        src={src}
        title="Rockstar Overlay"
        style={{
          border: "0",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        allow="autoplay; clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default RockstarOverlayPage;
