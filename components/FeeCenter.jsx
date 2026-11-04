"use client";

import { useEffect, useState, useCallback } from "react";
import { monthLabel } from "@/lib/fees";

const CLASSES = ["Nursery","LKG","UKG","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-");

// Fee centre. role="admin": full control (approve, reminders, class fees).
// role="teacher": read-only view of own class + receipt lookup.
export default function FeeCenter({ role = "admin" }) {
  const admin = role === "admin";
  const [tab, setTab] = useState(admin ? "approvals" : "overview");
  const [className, setClassName] = useState("");
  const [ov, setOv] = useState({ rows: [], totals: {} });
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [classFees, setClassFees] = useState({});
  const [receipt, setReceipt] = useState("");
  const [found, setFound] = useState(null);
  const [onlyDue, setOnlyDue] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const q = className ? `?className=${encodeURIComponent(className)}` : "";
    const [o, p, a, cf] = await Promise.all([
      fetch(`/api/fees/overview${q}`).then((r) => r.json()),
      fetch("/api/fees/payments?status=pending").then((r) => r.json()),
      fetch("/api/fees/payments").then((r) => r.json()),
      fetch("/api/fees/class-fees").then((r) => r.json()),
    ]);
    setOv(o); setPending(p.payments || []); setAll(a.payments || []);
    setClassFees(Object.fromEntries((cf.fees || []).map((f) => [f.className, f.monthlyFee])));
  }, [className]);
  useEffect(() => { load(); }, [load]);

  async function decide(id, status) {
    let adminNote;
    if (status === "rejected") { adminNote = prompt("Reject karne ka reason (optional)") || undefined; }
    await fetch(`/api/fees/payments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, adminNote }) });
    load();
  }
  async function unlock(r, on) {
    await fetch("/api/fees/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: r._id, unlock: on }) });
    load();
  }
  async function lookup(e) {
    e.preventDefault();
    const d = await fetch(`/api/fees/payments?receipt=${encodeURIComponent(receipt)}`).then((r) => r.json());
    setFound(d.payments?.[0] || false);
  }
  async function remind(rows) {
    await fetch("/api/fees/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: rows.map((r) => r._id) }) });
    setMsg(`${rows.length} student(s) ko reminder bhej diya (Student ERP me dikhega).`);
    load();
  }
  const waLink = (r) =>
    `https://wa.me/91${(r.guardianMobile || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
      `Namaste, The Little Moon Academy se. ${r.name} (${r.className}) ki ${inr(r.balance)} fees baaki hai. Kripya Student ERP (ID: ${r.studentId}) se jama karein. Dhanyawad.`)}`;
  async function saveClassFees() {
    await fetch("/api/fees/class-fees", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fees: CLASSES.map((c) => ({ className: c, monthlyFee: classFees[c] || 0 })) }) });
    setMsg("Class fees save ho gayi."); load();
  }

  const t = ov.totals || {};
  const rows = (ov.rows || []).filter((r) => (onlyDue ? r.balance > 0 : true));
  const tabs = [
    ...(admin ? [["approvals", `Approvals${pending.length ? ` (${pending.length})` : ""}`]] : []),
    ["overview", "Pending Fees"], ["history", "All Receipts"], ["lookup", "Receipt Check"],
    ...(admin ? [["setup", "Class Fees"]] : []),
  ];
  const th = "py-2 text-left text-xs uppercase tracking-wide text-navy-400";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Fees Collected", inr(t.collected), "text-emerald-600"], ["Pending Fees", inr(t.pending), "text-red-600"],
          ["Awaiting Approval", inr(t.awaitingApproval), "text-amber-600"], ["Students with Dues", `${t.defaulters ?? 0} / ${t.students ?? 0}`, "text-navy"]].map(([l, v, c]) => (
          <div key={l} className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{l}</p>
            <p className={`mt-1 font-display text-2xl font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === k ? "bg-navy text-white" : "border border-navy-100 bg-white text-navy-600"}`}>{l}</button>
        ))}
        {admin && (
          <select value={className} onChange={(e) => setClassName(e.target.value)} className="ml-auto rounded-lg border border-navy-100 px-3 py-2 text-sm">
            <option value="">All classes</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        )}
      </div>
      {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}

      {tab === "approvals" && (
        <div className="space-y-3">
          {(ov.rows || []).filter((r) => r.docRequestAt && r.balance > 0 && !r.docUnlock).map((r) => (
            <div key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
              <p><b>{r.name}</b> ({r.className}) ne admit card / result download ki request ki hai — fees pending <b className="text-red-600">{inr(r.balance)}</b>.</p>
              <button onClick={() => unlock(r, true)} className="rounded-lg bg-navy px-4 py-2 font-bold text-white">Download Approve</button>
            </div>
          ))}
          {!pending.length && <p className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400">Koi pending payment nahi. 🎉</p>}
          {pending.map((p) => (
            <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-4">
              <div className="text-sm">
                <p className="font-bold text-navy">{p.studentName} <span className="font-normal text-navy-400">· {p.className} · Roll {p.rollNumber ?? "-"} · {p.studentId}</span></p>
                <p className="mt-0.5">Receipt <b>{p.receiptNo}</b> · {fmt(p.createdAt)} · <b className="uppercase">{p.mode}</b>{p.receivedBy && <> → cash diya: <b>{p.receivedBy}</b></>}{p.upiRef && <> · UTR {p.upiRef}</>}</p>
                <p className="text-xs text-navy-400">{p.months.map(monthLabel).join(", ")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-navy">{inr(p.amount)}</span>
                <button onClick={() => decide(p._id, "approved")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Approve</button>
                <button onClick={() => decide(p._id, "rejected")} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "overview" && (
        <div className="rounded-xl border border-navy-100 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyDue} onChange={(e) => setOnlyDue(e.target.checked)} /> Sirf pending wale</label>
            {admin && rows.length > 0 && <button onClick={() => remind(rows)} className="rounded-lg bg-brass px-4 py-2 text-sm font-bold text-navy">🔔 Sabko Reminder bhejein ({rows.length})</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr><th className={th}>Student</th><th className={th}>Class</th><th className={th}>Pending months</th><th className={`${th} text-right`}>Paid</th><th className={`${th} text-right`}>Pending</th><th className={th}> </th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t border-navy-50">
                    <td className="py-2"><b>{r.name}</b><p className="text-xs text-navy-400">{r.studentId}</p></td>
                    <td>{r.className}{r.rollNumber ? ` · ${r.rollNumber}` : ""}</td>
                    <td>{r.pendingMonths}</td>
                    <td className="text-right text-emerald-700">{inr(r.paid)}</td>
                    <td className="text-right font-bold text-red-600">{inr(r.balance)}{r.awaiting ? <span className="block text-xs font-normal text-amber-600">{inr(r.awaiting)} approval pending</span> : null}</td>
                    <td className="space-x-2 whitespace-nowrap pl-3 text-right">
                      {r.balance > 0 && r.guardianMobile && <a href={waLink(r)} target="_blank" rel="noreferrer" className="rounded-md bg-green-500 px-2.5 py-1 text-xs font-bold text-white">WhatsApp</a>}
                      {admin && r.balance > 0 && <button onClick={() => unlock(r, !r.docUnlock)} className={`rounded-md border px-2.5 py-1 text-xs ${r.docUnlock ? "border-emerald-500 text-emerald-700" : "border-navy-100"}`}>{r.docUnlock ? "✔ Download allowed" : "Allow download"}</button>}
                      {admin && r.balance > 0 && <button onClick={() => remind([r])} className="rounded-md border border-brass px-2.5 py-1 text-xs">{r.lastReminderAt ? `Reminded ${fmt(r.lastReminderAt)}` : "Remind"}</button>}
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6} className="py-6 text-center text-navy-400">Koi student nahi mila.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white p-4">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr><th className={th}>Receipt</th><th className={th}>Student</th><th className={th}>Date</th><th className={th}>Mode</th><th className={`${th} text-right`}>Amount</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {all.map((p) => (
                <tr key={p._id} className="border-t border-navy-50">
                  <td className="py-2 font-semibold">{p.receiptNo}</td><td>{p.studentName} <span className="text-xs text-navy-400">{p.className}</span></td>
                  <td>{fmt(p.createdAt)}</td><td className="uppercase">{p.mode}{p.receivedBy ? ` (${p.receivedBy})` : ""}</td>
                  <td className="text-right font-semibold">{inr(p.amount)}</td>
                  <td className="pl-3 capitalize">{p.status}{admin && p.status !== "approved" && <button onClick={() => decide(p._id, "approved")} className="ml-2 text-xs text-emerald-700 underline">approve</button>}</td>
                </tr>
              ))}
              {!all.length && <tr><td colSpan={6} className="py-6 text-center text-navy-400">Abhi koi payment nahi.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "lookup" && (
        <div className="rounded-xl border border-navy-100 bg-white p-5">
          <p className="mb-3 text-sm text-navy-600">Student ne jo Receipt No. diya hai use yahan daalein.</p>
          <form onSubmit={lookup} className="flex gap-2">
            <input value={receipt} onChange={(e) => setReceipt(e.target.value.toUpperCase())} placeholder="LMA-261104-1234" className="flex-1 rounded-lg border border-navy-100 px-3 py-2 text-sm" />
            <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Check</button>
          </form>
          {found === false && <p className="mt-3 text-sm text-red-600">Ye receipt nahi mili (ya ye aapki class ki nahi hai).</p>}
          {found && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-bold">{found.studentName} · {found.className} · Roll {found.rollNumber ?? "-"}</p>
              <p>{inr(found.amount)} · {found.mode.toUpperCase()}{found.receivedBy ? ` · Cash: ${found.receivedBy}` : ""} · {found.months.map(monthLabel).join(", ")}</p>
              <p className="mt-1">Status: <b className="capitalize">{found.status}</b>{found.status === "pending" && " — admin approve karega tab fees jama hogi."}</p>
              {admin && found.status !== "approved" && <button onClick={() => { decide(found._id, "approved"); setFound(null); }} className="mt-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-bold text-white">Approve</button>}
            </div>
          )}
        </div>
      )}

      {tab === "setup" && admin && (
        <div className="rounded-xl border border-navy-100 bg-white p-5">
          <p className="mb-3 text-sm text-navy-600">Har class ki monthly fees. (Kisi student ki alag fees ho to Teacher → Students me set kar sakte hain.)</p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CLASSES.map((c) => (
              <label key={c} className="text-sm"><span className="text-navy-400">{c}</span>
                <input type="number" min="0" value={classFees[c] ?? ""} onChange={(e) => setClassFees({ ...classFees, [c]: e.target.value })} placeholder="₹ / month"
                  className="mt-0.5 w-full rounded-lg border border-navy-100 px-3 py-2" /></label>
            ))}
          </div>
          <button onClick={saveClassFees} className="mt-4 rounded-lg bg-brass px-5 py-2 font-bold text-navy">Save</button>
        </div>
      )}
    </div>
  );
}
