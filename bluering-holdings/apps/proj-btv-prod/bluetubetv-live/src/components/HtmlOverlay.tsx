"use client";
import { useEffect, useState, useMemo } from "react";

export default function HtmlOverlay({ src, pointerEventsNone = true }:{
  src: string; pointerEventsNone?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
useEffect(() => { console.log("HtmlOverlay mounted:", src); }, [src]);

const style = useMemo<React.CSSProperties>(() => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  border: "0",
  background: "transparent",
  zIndex: 999999,          // be above everything
  pointerEvents: pointerEventsNone ? "none" : "auto",
  opacity: loaded ? 1 : 0,
  transition: "opacity 240ms ease",
  outline: "2px solid red" // TEMP: remove after you see it
}), [loaded, pointerEventsNone]);


  useEffect(() => { const t=setTimeout(()=>setLoaded(true),50); return ()=>clearTimeout(t); }, []);
  return <iframe src={src} title="HTML Overlay" style={style} />;
}
