"use client";

import { useEffect, useState } from "react";

// Admin uploads the school's UPI QR; students see it when they choose UPI.
export default function PaymentSettings() {
  const [upiId, setUpiId] = useState("");
  const [qr, setQr] = useState(null);
  const [current, setCurrent] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/school-settings").then((r) => r.json()).then(({ settings }) => {
      setUpiId(settings?.upiId || ""); setCurrent(settings?.upiQrUrl || "");
    });
  }, []);

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setQr(r.result);
    r.readAsDataURL(f);
  }
  async function save() {
    setMsg("Saving…");
    const res = await fetch("/api/school-settings", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upiId, ...(qr ? { upiQrDataUri: qr } : {}) }) });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Failed");
    setCurrent(d.settings.upiQrUrl || ""); setQr(null); setMsg("Saved ✔");
  }

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <h2 className="font-display text-xl font-bold text-navy">UPI Payment QR</h2>
      <p className="mt-1 text-sm text-navy-600">Jab student fees me UPI chunega to yahi QR khulega.</p>
      <div className="mt-4 flex flex-wrap items-start gap-6">
        {(qr || current) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr || current} alt="UPI QR" className="h-44 w-44 rounded-lg border border-navy-100 object-contain p-2" />}
        <div className="space-y-3">
          <input type="file" accept="image/*" onChange={pick} className="block text-sm" />
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="UPI ID (e.g. school@upi)" className="w-72 rounded-lg border border-navy-100 px-3 py-2 text-sm" />
          <button onClick={save} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy">Save QR</button>
          {msg && <p className="text-sm text-navy-600">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
