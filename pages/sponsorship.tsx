const badges = [
  { key: "castle-legacy",  title: "Castle Street Legacy Badge",  blurb: "Founding sponsor of Castle St." },
  { key: "empire-builder",  title: "Empire Builder Badge",       blurb: "Architects of BlueTubeTV." },
  { key: "recovery-champion", title: "Recovery Champion Badge",  blurb: "Fuel the message of recovery." },
  { key: "founders-circle", title: "Founder’s Circle (1–10)",    blurb: "Numbered founder slot." }
];

export default function Sponsorship(){
  async function buy(badge:string){
    const r = await fetch(`/api/checkout?badge=${badge}`);
    const j = await r.json();
    if (j.url) window.location.href = j.url;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Founders ($10,000)</h1>
      <p className="mb-6 opacity-80">ADKT × BlueTubeTV • Castle Street Legacy</p>
      <div className="grid gap-4">
        {badges.map(b => (
          <div key={b.key} className="rounded-xl p-4 bg-white/5">
            <div className="font-semibold text-lg">{b.title}</div>
            <div className="opacity-80 text-sm mb-3">{b.blurb}</div>
            <button onClick={()=>buy(b.key)} className="px-4 py-2 rounded-lg bg-white text-black font-semibold">
              Sponsor — $10,000
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
