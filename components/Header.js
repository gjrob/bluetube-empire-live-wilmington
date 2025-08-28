export default function Header() {
  return (
    <header style={{borderBottom:'1px solid rgba(255,255,255,.08)'}}>
      <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{margin:0, fontWeight:700}}>BlueTubeTV</h1>
        <nav style={{display:'flex', gap:16}}>
          <a href="/" className="btn" style={{background:'transparent', border:'1px solid rgba(255,255,255,.2)'}}>Home</a>
          <a href="/live" className="btn">Watch Live (WebRTC)</a>
          <a href="/live-hls" className="btn" style={{background:'#1d4ed8'}}>Backup (LL-HLS)</a>
        </nav>
      </div>
    </header>
  );
}
