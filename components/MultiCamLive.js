'use client';
import React, { useEffect, useRef } from 'react';

/** Attach HLS to a <video> (Hls.js + Safari fallback) */
async function attachHls(video, src, onOnline) {
  if (!video || !src) return;
  try {
    const { default: Hls } = await import('hls.js');
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 3, capLevelToPlayerSize: true });
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
      hls.on(Hls.Events.MANIFEST_PARSED, () => { onOnline?.(true); video.play?.().catch(() => {}); });
      return () => { try { hls.destroy(); } catch {} };
    }
  } catch {}
  // Safari fallback
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    const onMeta = () => { onOnline?.(true); video.removeEventListener('loadedmetadata', onMeta); };
    video.addEventListener('loadedmetadata', onMeta, { once: true });
    video.src = src;
  }
}

export default function MultiCamLive({
  state = { layout: 'single', active: 'a', audioFrom: 'a' }, // 'single'|'split', 'a'|'b', 'a'|'b'|'sc'
  urls = {
    a: process.env.NEXT_PUBLIC_HLS_A || '',
    b: process.env.NEXT_PUBLIC_HLS_B || '',
  },
  overlay = true,
  soundcloud = { trackId: null, trackUrl: null }, // optional (audioFrom:'sc' shows iframe on right)
  onReady = (_which, _ok) => {},
  promo,
}) {
  const vA = useRef(null);
  const vB = useRef(null);

  // wire streams
  useEffect(() => {
    let cleanup;
    (async () => { cleanup = await attachHls(vA.current, urls.a, (ok) => onReady('a', ok)); })();
    return () => { if (cleanup) cleanup(); };
  }, [urls.a, onReady]);
  useEffect(() => {
    let cleanup;
    (async () => { cleanup = await attachHls(vB.current, urls.b, (ok) => onReady('b', ok)); })();
    return () => { if (cleanup) cleanup(); };
  }, [urls.b, onReady]);

  // keep mute state synced to audio choice
  useEffect(() => {
    if (vA.current) vA.current.muted = state.audioFrom !== 'a';
    if (vB.current) vB.current.muted = state.audioFrom !== 'b';
  }, [state.audioFrom]);

  const showSC = state.audioFrom === 'sc' && (soundcloud.trackId || soundcloud.trackUrl);
  const scUrl = soundcloud.trackUrl
    ? encodeURIComponent(soundcloud.trackUrl)
    : soundcloud.trackId
    ? encodeURIComponent(`https://api.soundcloud.com/tracks/${soundcloud.trackId}`)
    : '';

  return (
      <div style={{ position:'relative', borderRadius:20, overflow:'hidden', background:'#0b1d41', boxShadow:'0 10px 28px rgba(0,0,0,.3)' }}>

    
      {state.layout === 'single' ? (
        <div style={{ padding: 8 }}>
          {state.active === 'a' ? (
            <video ref={vA} playsInline controls muted={state.audioFrom !== 'a'}
                   style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}/>
          ) : (
            <video ref={vB} playsInline controls muted={state.audioFrom !== 'b'}
                   style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}/>
          )}
          </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 8 }}>
          <div>
            <video ref={vA} playsInline controls muted={state.audioFrom !== 'a'}
                   style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}/>
          </div>
          <div>
            {showSC ? (
              <iframe
                title="SoundCloud"
                src={`https://w.soundcloud.com/player/?url=${scUrl}&auto_play=true&visual=true`}
                allow="autoplay"
                style={{ width: '100%', height: 360, border: 0 }}
              />
            ) : (
              <video ref={vB} playsInline controls muted={state.audioFrom !== 'b'}
                     style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}/>
            )}
          </div>
        </div>
      )}

           {/* ADKT overlay inside the player */}
      {overlay && (
        <>
          <img
            src="/overlays/adkt-drip-top.svg"
            alt=""
            style={{
              position: 'absolute',
              left: 0, right: 0, top: 0,
              height: 'clamp(72px, 12vw, 140px)',
              zIndex: 5, pointerEvents: 'none'
            }}
          />
          <img
            src="/overlays/adkt-badge.svg"
            alt=""
            style={{
              position: 'absolute',
              right: 12, top: 12,
              width: 180, zIndex: 6, pointerEvents: 'none', opacity: .98
            }}
          />
        </>
      )}

      {/* QR / promo image */}
      {promo && promo.src ? (
        <img
          src={promo.src}
          alt=""
          style={{
            position: 'absolute',
            right: 12,              // change to left:12 to anchor left
            bottom: 12,
            width: promo.width ?? 140,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,.35)',
            zIndex: 7,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </div>         
  );
}                
