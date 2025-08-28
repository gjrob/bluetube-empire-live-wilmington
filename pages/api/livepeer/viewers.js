// /pages/api/livepeer/viewers.js
export default async function handler(req,res){
  const { playbackId } = req.query;
  if (!playbackId) return res.status(400).json({ error:"playbackId required" });

  const key = process.env.LIVEPEER_API_KEY;
  if (!key) return res.json({ viewers: null }); // silently hide if no key

  try{
    const r = await fetch(`https://livepeer.studio/api/metrics/views?playbackId=${playbackId}`, {
      headers: { Authorization: `Bearer ${key}` }
    });
    const j = await r.json();
    const viewers = j?.viewCount ?? j?.data?.viewers ?? j?.viewers ?? 0;
    res.json({ viewers });
  }catch{ res.json({ viewers:null }); }
}
