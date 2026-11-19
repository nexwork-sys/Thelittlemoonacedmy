"use client";

import { useEffect, useState } from "react";

const empty = { label: "", upiId: "", current: "", file: null };

// One QR slot: preview + file picker + label + UPI ID.
function Slot({ title, v, set, onRemove }) {
  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set({ ...v, file: r.result });
    r.readAsDataURL(f);
  }
  const img = v.file || v.current;
  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-navy">{title}</h3>
        {onRemove && (v.current || v.file) && <button type="button" onClick={onRemove} className="text-xs text-maroon hover:underline">Remove</button>}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        {img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={img} alt={title} className="h-40 w-40 rounded-lg border border-navy-100 object-contain p-2" />
          : <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-navy-100 text-xs text-navy-400">No QR</div>}
        <div className="space-y-2">
          <input type="file" accept="image/*" onChange={pick} className="block text-sm" />
          <input value={v.label} onChange={(e) => set({ ...v, label: e.target.value })} placeholder="Label (e.g. PhonePe / School A/c)" className="w-64 rounded-lg border border-navy-100 px-3 py-2 text-sm" />
          <input value={v.upiId} onChange={(e) => set({ ...v, upiId: e.target.value })} placeholder="UPI ID (e.g. school@upi)" className="w-64 rounded-lg border border-navy-100 px-3 py-2 text-sm" />
        </div>
      </div>
    </div>
  );
}

// Admin uploads up to 2 UPI QRs; students see both when they choose UPI.
export default function PaymentSettings() {
  const [a, setA] = useState(empty);
  const [b, setB] = useState(empty);
  const [removeB, setRemoveB] = useState(false);
  const [msg, setMsg] = useState("");

  function apply(s) {
    setA({ label: s?.upiLabel || "", upiId: s?.upiId || "", current: s?.upiQrUrl || "", file: null });
    setB({ label: s?.upiLabel2 || "", upiId: s?.upiId2 || "", current: s?.upiQr2Url || "", file: null });
  }
  useEffect(() => { fetch("/api/school-settings").then((r) => r.json()).then(({ settings }) => apply(settings)); }, []);

  async function save() {
    setMsg("Saving…");
    const body = {
      upiId: a.upiId, upiLabel: a.label, ...(a.file ? { upiQrDataUri: a.file } : {}),
      ...(removeB ? { removeQr2: true } : { upiId2: b.upiId, upiLabel2: b.label, ...(b.file ? { upiQr2DataUri: b.file } : {}) }),
    };
    const res = await fetch("/api/school-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Failed");
    setRemoveB(false); apply(d.settings); setMsg("Saved ✔");
  }

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <h2 className="font-display text-xl font-bold text-navy">UPI Payment QR (2 tak)</h2>
      <p className="mt-1 text-sm text-navy-600">Student jab UPI chunega to yahan upload kiye dono QR dikhenge.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Slot title="QR 1" v={a} set={setA} />
        <Slot title="QR 2 (optional)" v={removeB ? empty : b} set={(x) => { setRemoveB(false); setB(x); }}
          onRemove={() => { setRemoveB(true); setB(empty); }} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy">Save QR</button>
        {msg && <p className="text-sm text-navy-600">{msg}</p>}
      </div>
    </div>
  );
}
