"use client";
import React from "react";

export default function AdminGrid10() {
  return (
    <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="border rounded-2xl p-4">🔧 Engine Status</div>
      <div className="border rounded-2xl p-4"><a className="underline" href="/admin/slots">Slots Scheduler</a></div>
      <div className="border rounded-2xl p-4"><a className="underline" href="/api/recap">Download Recap (CSV)</a></div>
    </div>
  );
}
