"use client";

import React, { Suspense } from "react";
import MultiCamPlayer from "./players/MultiCamPlayer";
import FeaturedChip from "./FeaturedChip";  // ✅ import ONLY from the shim; no try/catch, no require
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import ImpressionSummary from "./ImpressionSummary";


export default function AdminDashboard() {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">BlueTubeTV • Admin</h1>
          <p className="text-sm text-neutral-400">command deck for streams, overlays, and the money map.</p>
        </header>
        <TabsContent value="streams" className="mt-6">
  <div className="mb-3 flex items-center gap-3 flex-wrap">
    <a href="/admin/grid" className="btn-sm-subtle">Open Multi-Cam Grid</a>
    <button
      className="btn-sm-subtle"
      onClick={async () => { await fetch("/api/streams/feature", { method: "DELETE" }); }}
    >
      Clear Feature
    </button>
    <FeaturedChip />
  </div>

  <Suspense fallback={<div className="p-6">Loading streams…</div>}>
    <MultiCamPlayer />
  </Suspense>
</TabsContent>
        <Tabs defaultValue="streams" className="w-full">
          <TabsList className="grid grid-cols-5 gap-2 bg-neutral-900/60 p-2 rounded-xl">
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="overlays">Overlays/Pins</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="mt-6">
            <Suspense fallback={<div className="p-6">Loading streams…</div>}>
              <MultiCamPlayer />
            </Suspense>
          </TabsContent>

          <TabsContent value="overlays" className="mt-6">
            <div className="rounded-2xl border border-neutral-800 p-6 bg-neutral-950">
              <h2 className="text-xl font-semibold mb-3">Overlays & Pins</h2>
              <p className="text-neutral-400 text-sm mb-4">Upload assets, set rotations, assign to streams.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 p-4"><p className="text-sm">Uploader (stub)</p></div>
                <div className="rounded-xl border border-neutral-800 p-4"><p className="text-sm">Rotation schedule (stub)</p></div>
              </div>
            </div>
          </TabsContent>

  <TabsContent value="analytics" className="mt-6">
  <div className="rounded-2xl border border-neutral-800 p-6 bg-neutral-950">
    <h2 className="text-xl font-semibold mb-3">Analytics</h2>
    <p className="text-neutral-400 text-sm">Impressions, scans, redemptions.</p>
    <div className="mt-4 grid gap-4">
      <ImpressionSummary />
    </div>
  </div>
</TabsContent>


          <TabsContent value="accounting" className="mt-6">
            <div className="rounded-2xl border border-neutral-800 p-6 bg-neutral-950">
              <h2 className="text-xl font-semibold mb-3">Accounting</h2>
              <p className="text-neutral-400 text-sm">Sponsorships, tips, revenue.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <StatCard label="Revenue (MTD)" value="$0.00" />
                <StatCard label="Sponsorships" value="0" />
                <StatCard label="Tips" value="0" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="rounded-2xl border border-neutral-800 p-6 bg-neutral-950">
              <h2 className="text-xl font-semibold mb-3">Brandpack</h2>
              <p className="text-neutral-400 text-sm">Colors, fonts, logos.</p>
              <div className="mt-4 rounded-xl border border-neutral-800 p-4 text-sm">brand form (stub)</div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-950">
      <p className="text-neutral-400 text-xs">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
