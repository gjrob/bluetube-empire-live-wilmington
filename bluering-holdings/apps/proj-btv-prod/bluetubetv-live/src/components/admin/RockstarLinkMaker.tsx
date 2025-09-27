// src/components/admin/RockstarLinkMaker.tsx
"use client";
import { useMemo, useState } from "react";
export default function RockstarLinkMaker() {
  const [text,setText] = useState("ROCK ★ STAR");
  const [openAt,setOpenAt] = useState("800");
  const [speed,setSpeed] = useState("1800");
  const [theme,setTheme] = useState("gold");
  const href = useMemo(() => {
    const p = new URLSearchParams({ text, openAt, speed, theme });
    return `/overlay/rockstar?${p.toString()}`;
  }, [text,openAt,speed,theme]);
  return (
    <div className="grid gap-2">
      <input className="border p-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Banner text"/>
      <div className="grid grid-cols-3 gap-2">
        <input className="border p-2" value={openAt} onChange={e=>setOpenAt(e.target.value)} placeholder="openAt ms"/>
        <input className="border p-2" value={speed} onChange={e=>setSpeed(e.target.value)} placeholder="speed ms"/>
        <select className="border p-2" value={theme} onChange={e=>setTheme(e.target.value)}>
          <option>gold</option><option>electric</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input className="border p-2 flex-1" value={href} readOnly />
        <button className="border px-3 py-2" onClick={()=>navigator.clipboard.writeText(location.origin+href)}>Copy</button>
      </div>
      <a className="underline" href={href} target="_blank">Preview</a>
    </div>
  );
}
