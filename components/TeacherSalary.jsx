"use client";

import { useEffect, useState } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const label = (m) => { const [y, mm] = m.split("-").map(Number); return `${MONTHS[mm - 1]} ${y}`; };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");

// Teacher: sees own paid salaries and downloads the slip.
export default function TeacherSalary() {
  const [payments, setPayments] = useState(null);
  useEffect(() => { fetch("/api/salary").then((r) => r.json()).then((d) => setPayments(d.payments || [])); }, []);

  if (!payments) return <p className="text-sm text-navy-400">Loading…</p>;
  return (
    <div className="space-y-3">
      {!payments.length && <p className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400">Abhi tak koi salary paid nahi hui.</p>}
      {payments.map((p) => (
        <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white p-4">
          <div className="text-sm">
            <p className="font-display text-lg text-navy">{label(p.month)}</p>
            <p className="text-xs text-navy-400">{p.slipNo} · Paid on {fmt(p.paidAt)} · {p.mode.toUpperCase()}{p.note ? ` · ${p.note}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Paid</span>
            <span className="font-display text-xl font-bold text-navy">{inr(p.amount)}</span>
            <a href={`/api/salary/${p._id}/slip`} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Download Slip</a>
          </div>
        </div>
      ))}
    </div>
  );
}
