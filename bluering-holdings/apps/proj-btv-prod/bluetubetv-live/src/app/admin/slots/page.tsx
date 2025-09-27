"use client";
import { useEffect, useMemo, useState } from "react";
import type { SlotSchedule, GameSlot, SlotItem } from "../../../lib/schemas/slots";

const SLOTS: GameSlot[] = ["Q1", "Q2", "HALF", "Q3", "Q4"];

export default function AdminSlotsPage() {
  const [data, setData] = useState<SlotSchedule | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/slots", { cache: "no-store" });
    const json = await r.json();
    setData(json as SlotSchedule);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!data) return;
    setBusy(true);
    await fetch("/api/slots", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
  }

  async function activate(slot: GameSlot) {
    await fetch("/api/slots/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot }),
    });
    await load();
  }

  // Add a new placement as a URL overlay (simple, flexible)
  function add(slot: GameSlot) {
    if (!data) return;
    const item: SlotItem = {
      id: crypto.randomUUID(),
      active: true,
      label: "Placement",
      sponsor: { id: crypto.randomUUID(), name: "Sponsor" },
      weight: 1,
      kind: "url",
      url: "/overlay/rockstar?text=ROCK%20STAR&theme=gold",
    } as SlotItem;

    setData({
      ...data,
      slots: { ...data.slots, [slot]: [...data.slots[slot], item] },
    });
  }

  function toggle(slot: GameSlot, id: string, on: boolean) {
    if (!data) return;
    setData({
      ...data,
      slots: {
        ...data.slots,
        [slot]: data.slots[slot].map((x) => (x.id === id ? { ...x, active: on } : x)),
      },
    });
  }

  // Update the relevant URL field based on kind
  function updateUrl(slot: GameSlot, id: string, value: string) {
    if (!data) return;
    setData({
      ...data,
      slots: {
        ...data.slots,
        [slot]: data.slots[slot].map((x) => {
          if (x.id !== id) return x;
          if (x.kind === "url") return { ...x, url: value };
          if (x.kind === "promo") return { ...x, promoSrc: value };
          if (x.kind === "image") return { ...x, img: value };
          if (x.kind === "qr-card") return { ...x, qr: value }; // or set q
          return x;
        }),
      },
    });
  }

  const recapHref = useMemo(
    () => `/api/recap?gameId=${encodeURIComponent(data?.gameId ?? "")}`,
    [data?.gameId]
  );

  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Game Slots — {data.gameId}</h1>

      <div className="flex gap-2 items-center">
        {SLOTS.map((s) => (
          <button
            key={s}
            onClick={() => activate(s)}
            className={`px-3 py-2 rounded border ${
              data.activeSlot === s ? "bg-black text-white" : "bg-white"
            }`}
          >
            Live: {s}
          </button>
        ))}
        <a className="ml-auto underline" href={recapHref}>
          Download Recap (CSV)
        </a>
      </div>

      {SLOTS.map((s) => (
        <div key={s} className="rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{s}</h2>
            <button onClick={() => add(s)} className="px-2 py-1 border rounded">
              Add Placement
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            {data.slots[s].length === 0 && (
              <div className="text-sm opacity-60">No items yet.</div>
            )}

            {data.slots[s].map((item) => {
              // choose the editable URL field based on kind
              const value =
                item.kind === "url"
                  ? item.url
                  : item.kind === "promo"
                  ? item.promoSrc
                  : item.kind === "image"
                  ? item.img
                  : item.kind === "qr-card"
                  ? item.qr ?? item.q ?? ""
                  : "";

              const previewHref =
                item.kind === "url"
                  ? item.url
                  : item.kind === "promo"
                  ? item.promoSrc
                  : item.kind === "image"
                  ? `/overlay/image?img=${encodeURIComponent(item.img)}`
                  : item.kind === "qr-card"
                  ? `/overlay/qr-card?${new URLSearchParams({
                      img: item.img ?? "",
                      q: item.q ?? "",
                      qr: item.qr ?? "",
                      cta: item.cta ?? "",
                      w: item.w ?? "520",
                    }).toString()}`
                  : "#";

              return (
                <div key={item.id} className="grid md:grid-cols-12 gap-2 items-center">
                  <label className="text-xs md:col-span-2">{item.label ?? item.kind}</label>

                  <input
                    className="md:col-span-8 border rounded p-2 text-sm"
                    value={value ?? ""}
                    onChange={(e) => updateUrl(s, item.id, e.target.value)}
                    placeholder={
                      item.kind === "url"
                        ? "/overlay/… or https://…"
                        : item.kind === "promo"
                        ? "promoSrc (image URL)"
                        : item.kind === "image"
                        ? "img (image URL)"
                        : "qr (image URL) or q (link)"
                    }
                  />

                  <label className="md:col-span-1 text-xs flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!item.active}
                      onChange={(e) => toggle(s, item.id, e.target.checked)}
                    />
                    active
                  </label>

                  <a
                    className="md:col-span-1 underline text-xs"
                    href={previewHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button onClick={save} disabled={busy} className="px-3 py-2 border rounded">
          {busy ? "Saving…" : "Save"}
        </button>
        <button onClick={load} className="px-3 py-2 border rounded">
          Reload
        </button>
      </div>
    </div>
  );
}
