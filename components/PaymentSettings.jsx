"use client";

import { useEffect, useState } from "react";

// Admin uploads up to 2 UPI QRs; students see both when they choose UPI.
const SLOTS = [
  { n: 1, idKey: "upiId", labelKey: "upiLabel", urlKey: "upiQrUrl", dataKey: "upiQrDataUri" },
  { n: 2, idKey: "upiId2", labelKey: "upiLabel2", urlKey: "upiQr2Url", dataKey: "upiQr2DataUri" },
];

export default function PaymentSettings() {
  const [form, setForm] = useState({ upiId: "", upiLabel: "", upiId2: "", upiLabel2: "" });
  const [files, setFiles] = useState({}); // dataKey -> data URI (new uploads)
  const [current, setCurrent] = useState({}); // urlKey -> saved url
  const [msg, setMsg] = useState("");

  function applySettings(s) {
    setForm({ upiId: s?.upiId || "", upiLabel: s?.upiLabel || "", upiId2: s?.upiId2 || "", upiLabel2: s?.upiLabel2 || "" });
    setCurrent({ upiQrUrl: s?.upiQrUrl || "", upiQr2Url: s?.upiQr2Url || "" });
  }

  useEffect(() => {
    fetch("/api/school-settings").then((r) => r.json()).then(({ settings }) => applySettings(settings));
  }, []);

  function pick(dataKey, e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setFiles((p) => ({ ...p, [dataKey]: r.result }));
    r.readAsDataURL(f);
  }

  async function save() {
    setMsg("Saving…");
    const res = await fetch("/api/school-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...files }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Failed");
    applySettings(d.settings); setFiles({}); setMsg("Saved ✔");
  }

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <h2 className="font-display text-xl font-bold text-navy">UPI Payment QR (2 tak)</h2>
      <p className="mt-1 text-sm text-navy-600">Jab student fees me UPI chunega to ye QR khulenge. Dusra QR optional hai.</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {SLOTS.map((s) => {
          const preview = files[s.dataKey] || current[s.urlKey];
          return (
            <div key={s.n} className="rounded-lg border border-navy-100 p-4">
              <p className="mb-3 text-sm font-bold text-navy">QR {s.n}</p>
              {preview && /* eslint-disable-next-line @next/next/no-img-element */ <img src={preview} alt={`UPI QR ${s.n}`} className="mb-3 h-44 w-44 rounded-lg border border-navy-100 object-contain p-2" />}
              <div className="space-y-3">
                <input type="file" accept="image/*" onChange={(e) => pick(s.dataKey, e)} className="block text-sm" />
                <input value={form[s.labelKey]} onChange={(e) => setForm({ ...form, [s.labelKey]: e.target.value })}
                  placeholder="Label (e.g. PhonePe / Bank)" className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm" />
                <input value={form[s.idKey]} onChange={(e) => setForm({ ...form, [s.idKey]: e.target.value })}
                  placeholder="UPI ID (e.g. school@upi)" className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy">Save QR</button>
        {msg && <p className="text-sm text-navy-600">{msg}</p>}
      </div>
    </div>
  );
}
