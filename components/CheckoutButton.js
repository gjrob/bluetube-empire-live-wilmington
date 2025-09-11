export default function CheckoutButton({
  label = "Sponsor Now",
  tier,                   // "standard" | "premium" | "marquee" (or leave undefined and pass amount)
  amount,                 // number in dollars if you want custom price
  sponsorId = "",
  campaign = "showcase",
}) {
  const onClick = async () => {
    const r = await fetch("/api/stripe/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, amount, sponsorId, campaign }),
    });
    const data = await r.json();
    if (!r.ok || !data?.url) return alert(data?.error || "Stripe error");
    window.location.assign(data.url);
  };

  return <button className="angle" onClick={onClick}>{label}</button>;
}
