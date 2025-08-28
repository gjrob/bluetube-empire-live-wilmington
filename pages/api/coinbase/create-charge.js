// /pages/api/coinbase/create-charge.js
export default async function handler(req,res){
  try{
    const { name, amount } = req.body || {};
    const r = await fetch("https://api.commerce.coinbase.com/charges", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY,
        "X-CC-Version":"2018-03-22",
      },
      body: JSON.stringify({
        name, pricing_type:"fixed_price",
        local_price:{ amount:String(amount), currency:"USD" },
        metadata:{ stream:"bluetubetv", kind:"tip" },
      }),
    });
    const j = await r.json();
    res.json({ hosted_url: j?.data?.hosted_url });
  }catch(e){ res.status(500).json({error:e.message}); }
}
