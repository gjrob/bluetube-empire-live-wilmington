export default function Footer() {
  return (
    <footer style={{borderTop:'1px solid rgba(255,255,255,.08)', marginTop:32}}>
      <div className="container" style={{opacity:.7, fontSize:14}}>
        © {new Date().getFullYear()} BlueTubeTV · Lightning-fast live
      </div>
    </footer>
  );
}
