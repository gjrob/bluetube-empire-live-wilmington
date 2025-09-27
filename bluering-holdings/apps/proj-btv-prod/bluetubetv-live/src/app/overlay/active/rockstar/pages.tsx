'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RockstarOverlayPage() {
  const params = useSearchParams();

  // rebuild ?query=string to pass through to the HTML overlay
  const qs = useMemo(() => {
    const out = new URLSearchParams();
    if (params) {
      params.forEach((v, k) => out.append(k, v));
    }
    const s = out.toString();
    return s ? `?${s}` : '';
  }, [params]);

  const src = `/overlays/rockstar.html${qs}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent' }}>
      <iframe
        src={src}
        title="Rockstar Overlay"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        allow="autoplay; clipboard-read; clipboard-write"
      />
    </div>
  );
}
