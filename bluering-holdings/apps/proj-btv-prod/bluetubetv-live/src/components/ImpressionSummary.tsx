"use client";

import React, { useEffect, useState } from "react";

export default function ImpressionSummary() {
  const [data, setData] = useState<{ total: number; byItem: Record<string, number> } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics/impression");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load impressions", err);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(id);
  }, []);

  if (!data) return <p className="text-sm text-neutral-400">Loading impressions…</p>;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <h3 className="text-lg font-semibold mb-2">Impressions Summary</h3>
      <p className="text-sm text-neutral-400 mb-4">Total events: {data.total}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-neutral-400 text-xs">
            <th className="text-left">Item</th>
            <th className="text-right">Seconds Visible</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.byItem).map(([item, sec]) => (
            <tr key={item}>
              <td className="py-1">{item}</td>
              <td className="text-right">{sec}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
