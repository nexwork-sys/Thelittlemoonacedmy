"use client";

import { useEffect, useMemo, useState } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const label = (m) => { const [y, mm] = m.split("-").map(Number); return `${MONTHS[mm - 1]} ${y}`; };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

// Admin: pick teacher + month + amount -> "Mark Paid". Teacher then downloads the slip.
export default function SalaryManager() {
  const months = useMemo(monthOptions, []);
  const thisMonth = months[11];
  const [teachers, setTeachers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ teacher: "", month: thisMonth, amount: "", mode: "cash", note: "" });
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dup, setDup] = useState(false);
  const [ok, setOk] = useState(null);

  const load = () => {
    fetch("/api/staff").then((r) => r.json()).then((d) => setTeachers((d.staff || []).filter((u) => u.role === "teacher" && u.active !== false)));
    fetch("/api/salary").then((r) => r.json()).then((d) => setPayments(d.payments || []));
  };
  useEffect(load, []);

  async function submit(e, force = false) {
    e?.preventDefault();
    setBusy(true); setError(""); setDup(false); setOk(null);
    const res = await fetch("/api/salary", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount), force }),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setError(d.error || "Failed"); setDup(!!d.duplicate); return; }
    setOk(d.payment);
    setForm((f) => ({ ...f, amount: "", note: "" }));
    load();
  }

  async function remove(p) {
    if (!confirm(`${p.teacherName} ki ${label(p.month)} ki salary entry hatayein? Teacher ki slip bhi hat jayegi.`)) return;
    await fetch(`/api/salary/${p._id}`, { method: "DELETE" });
    load();
  }

  const shown = payments.filter((p) => !filter || String(p.teacher) === filter);
  const total = shown.reduce((s, p) => s + p.amount, 0);
  const inp = "w-full rounded-xl border border-navy-100 px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
        <h2 className="font-display text-lg text-navy">Salary pay karein</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-navy-400">Teacher</label>
            <select required value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className={inp}>
              <option value="">— Teacher select karein —</option>
              {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}{t.teacherId ? ` (${t.teacherId})` : ""}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-navy-400">Month</label>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className={inp}>
              {months.map((m) => <option key={m} value={m}>{label(m)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-navy-400">Amount (₹)</label>
            <input required type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={`${inp} font-bold`} />
          </div>
          <div>
            <label className="text-xs text-navy-400">Payment mode</label>
            <div className="flex gap-2">
              {[["cash", "Cash"], ["upi", "UPI"], ["bank", "Bank"]].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setForm({ ...form, mode: v })}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${form.mode === v ? "border-navy bg-navy text-white" : "border-navy-100 text-navy-600"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <input placeholder="Remark (optional) — jaise bonus, advance" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inp} />
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            {dup && <button type="button" onClick={() => submit(null, true)} className="ml-2 font-bold underline">Phir bhi paid mark karein</button>}
          </div>
        )}
        {ok && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <span>✔ {ok.teacherName} ki {label(ok.month)} ki salary {inr(ok.amount)} paid mark ho gayi. Teacher ab slip download kar sakta hai.</span>
            <a href={`/api/salary/${ok._id}/slip`} className="rounded-md bg-navy px-3 py-1 font-semibold text-white">Slip download</a>
          </div>
        )}
        <button disabled={busy} className="w-full rounded-xl bg-brass px-5 py-2.5 font-bold text-navy disabled:opacity-50">{busy ? "Saving…" : "Mark as Paid"}</button>
      </form>

      <div className="rounded-xl border border-navy-100 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg text-navy">Salary history <span className="text-sm font-normal text-navy-400">· total {inr(total)}</span></h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-navy-100 px-3 py-1.5 text-sm">
            <option value="">Sabhi teachers</option>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-navy-400"><th className="py-2">Teacher</th><th>Month</th><th>Paid on</th><th>Mode</th><th className="text-right">Amount</th><th /></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p._id} className="border-t border-navy-50">
                  <td className="py-2"><b>{p.teacherName}</b><p className="text-xs text-navy-400">{p.slipNo}</p></td>
                  <td>{label(p.month)}</td><td>{fmt(p.paidAt)}</td><td className="uppercase">{p.mode}</td>
                  <td className="text-right font-semibold text-emerald-700">{inr(p.amount)}</td>
                  <td className="space-x-2 whitespace-nowrap pl-3 text-right">
                    <a href={`/api/salary/${p._id}/slip`} className="rounded-md border border-navy-100 px-2.5 py-1 text-xs">Slip</a>
                    <button onClick={() => remove(p)} className="text-xs text-maroon hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={6} className="py-6 text-center text-navy-400">Abhi koi salary entry nahi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
