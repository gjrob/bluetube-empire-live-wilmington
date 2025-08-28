// /pages/api/mint/mint-moment.js
export default async function handler(req,res){
  const now = new Date().toISOString();
  const metadata = {
    name: `BlueTubeTV Moment ${now}`,
    description: "Captured live on BlueTubeTV.",
    image: `${req.headers.origin}/offline-poster.jpg`,
    external_url: `${req.headers.origin}/live?at=${encodeURIComponent(now)}`
  };
  res.json({ ok:true, metadata, message:"Metadata ready — save URI or ownerMint on-chain." });
}
