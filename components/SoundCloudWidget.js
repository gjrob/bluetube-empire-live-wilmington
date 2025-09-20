// components/SoundCloudWidget.js
export default function SoundCloudWidget({
  trackId,        // numeric ID (preferred)  e.g. "943082998"
  trackUrl,       // OR full URL e.g. "https://soundcloud.com/artist/track"
  autoPlay = false,
  visual = true,
  height = 320,
  className = "",
}) {
  const inner = trackId
    ? `https://api.soundcloud.com/tracks/${trackId}`
    : String(trackUrl || "");

  const src =
    `https://w.soundcloud.com/player/` +
    `?url=${encodeURIComponent(inner)}` +
    `&auto_play=${autoPlay ? "true" : "false"}` +
    `&visual=${visual ? "true" : "false"}`;

  return (
    <iframe
      title="SoundCloud"
      src={src}
      allow="autoplay; encrypted-media"
      style={{ width: "100%", height, border: 0, borderRadius: 12 }}
      className={className}
    />
  );
}
