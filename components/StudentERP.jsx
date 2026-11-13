"use client";

import { Component, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { monthLabel } from "@/lib/fees";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");
const BADGE = {
  paid: "bg-emerald-100 text-emerald-700", approved: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700", pending: "bg-amber-100 text-amber-700",
  unpaid: "bg-red-100 text-red-700", rejected: "bg-red-100 text-red-700",
  present: "bg-emerald-100 text-emerald-700", absent: "bg-red-100 text-red-700",
};
const Badge = ({ s, children }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${BADGE[s] || "bg-navy-50 text-navy-600"}`}>{children || s}</span>
);
const Card = ({ title, children, className = "" }) => (
  <div className={`rounded-xl border border-navy-100 bg-white p-5 shadow-sm ${className}`}>
    {title && <h3 className="mb-3 font-display text-lg font-bold text-navy">{title}</h3>}
    {children}
  </div>
);

const arr = (v) => (Array.isArray(v) ? v : []);
function normalize(d) {
  const f = d.fees || {};
  return {
    ...d,
    student: d.student || {},
    school: d.school || {},
    admitCards: arr(d.admitCards),
    allMonths: arr(d.allMonths),
    fees: {
      monthlyFee: 0, due: 0, paid: 0, awaiting: 0, balance: 0, pendingMonths: 0,
      ...f,
      months: arr(f.months),
      payments: arr(f.payments).map((p) => ({ ...p, months: arr(p.months) })),
    },
    attendance: { percent: null, totalDays: 0, present: 0, absent: 0, ...(d.attendance || {}), log: arr(d.attendance?.log) },
    exams: arr(d.exams).map((e) => ({ ...e, subjects: arr(e.subjects) })),
  };
}

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-10 text-center text-red-700">
          <p className="font-bold">Dashboard load nahi ho paya</p>
          <p className="mt-2 text-sm">{String(this.state.error?.message || this.state.error)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StudentERP() {
  return <ErrorBoundary><StudentERPInner /></ErrorBoundary>;
}

const TABS = [
  ["home", "🏠", "Home"], ["fees", "💰", "Fees"], ["attendance", "📅", "Attendance"],
  ["exams", "📝", "Exam & Admit Card"], ["results", "🏆", "Results"],
];

function StudentERPInner() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("home");
  const [doc, setDoc] = useState(null); // { kind: "admit" | "receipt", ... }

  function load() {
    fetch("/api/student/me").then(async (r) => {
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Could not load");
      else setData(normalize(d));
    });
  }
  useEffect(load, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (err) return <p className="p-10 text-center text-maroon">{err}</p>;
  if (!data) return <p className="p-10 text-center text-navy-400">Loading your ERP…</p>;
  const { student: s, fees, attendance, exams, school, locked, requested, admitCards } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <header className="bg-navy text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="" width={44} height={44} className="rounded-full bg-white" />
              <div className="leading-tight">
                <p className="font-bold">{s.name}</p>
                <p className="text-xs text-brass-200">{s.studentId} · {s.className} · Roll {s.rollNumber ?? "-"}</p>
              </div>
            </div>
            <button onClick={logout} className="rounded-lg border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10">Logout</button>
          </div>
          <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2">
            {TABS.map(([k, ic, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  tab === k ? "bg-brass text-navy" : "text-white/80 hover:bg-white/10"}`}>
                <span aria-hidden>{ic}</span>{label}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
          {tab === "home" && <Home {...{ s, fees, attendance, exams, admitCards, setTab }} />}
          {tab === "fees" && <Fees {...{ s, fees, school, data, reload: load, setDoc }} />}
          {tab === "attendance" && <Attendance a={attendance} />}
          {tab === "exams" && <Exams {...{ exams, admitCards, locked, requested, reload: load }} />}
          {tab === "results" && <Results {...{ exams, locked, requested, reload: load }} />}
        </main>
      </div>

      {doc && <DocView {...{ doc, s, school, onClose: () => setDoc(null) }} />}
    </div>
  );
}

function Stat({ label, value, sub, tone = "navy", onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-navy-100 bg-white p-4 text-left shadow-sm transition hover:border-brass">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-navy"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-navy-400">{sub}</p>}
    </button>
  );
}

function Home({ s, fees, attendance, exams, admitCards = [], setTab }) {
  const next = exams.find((e) => e.subjects.some((x) => x.date && new Date(x.date) >= new Date()));
  return (
    <>
      {fees.balance > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            <b>Fee Reminder:</b> {fees.pendingMonths} month ki fees baaki hai — <b>{inr(fees.balance)}</b> pending.
            {s.lastReminderAt && <span className="text-amber-700"> (School reminder: {fmtDate(s.lastReminderAt)})</span>}
          </p>
          <button onClick={() => setTab("fees")} className="rounded-lg bg-brass px-4 py-2 text-sm font-bold text-navy">Pay Now</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Attendance" value={attendance.percent == null ? "–" : `${attendance.percent}%`}
          sub={`${attendance.present} / ${attendance.totalDays} days`} tone={attendance.percent != null && attendance.percent < 75 ? "red" : "green"} onClick={() => setTab("attendance")} />
        <Stat label="Fees Paid" value={inr(fees.paid)} tone="green" onClick={() => setTab("fees")} />
        <Stat label="Fees Pending" value={inr(fees.balance)} tone={fees.balance ? "red" : "green"} sub={fees.awaiting ? `${inr(fees.awaiting)} approval pending` : undefined} onClick={() => setTab("fees")} />
        <Stat label="Next Exam" value={next ? next.name : "–"} sub={admitCards.length ? `${admitCards.length} admit card` : undefined} onClick={() => setTab("exams")} />
      </div>
      <Card title="My Details">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {[["Student ID", s.studentId], ["Class", `${s.className} (${s.section})`], ["Roll No", s.rollNumber ?? "-"], ["Father", s.fatherName || "-"],
            ["Mother", s.motherName || "-"], ["Mobile", s.guardianMobile || "-"], ["Session", s.academicYear]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-navy-50 py-1"><dt className="text-navy-400">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>
          ))}
        </dl>
      </Card>
    </>
  );
}

function Fees({ s, fees, school, data, reload, setDoc }) {
  const due = fees.months.filter((m) => m.status !== "paid").map((m) => m.month);
  const [months, setMonths] = useState(due.slice(0, 1));
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("upi");
  const [receivedBy, setReceivedBy] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const suggested = useMemo(() => months.length * fees.monthlyFee, [months, fees.monthlyFee]);
  useEffect(() => setAmount(String(suggested || "")), [suggested]);

  const toggle = (m) => setMonths((x) => (x.includes(m) ? x.filter((y) => y !== m) : [...x, m]));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/student/pay", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ months, amount: Number(amount), mode, receivedBy, upiRef }),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setError(d.error || "Failed");
    setDone(d.payment);
    reload();
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Monthly Fee" value={inr(fees.monthlyFee)} />
        <Stat label="Total Due (till now)" value={inr(fees.due)} />
        <Stat label="Paid (approved)" value={inr(fees.paid)} tone="green" />
        <Stat label="Pending" value={inr(fees.balance)} tone={fees.balance ? "red" : "green"} sub={fees.awaiting ? `+ ${inr(fees.awaiting)} awaiting approval` : undefined} />
      </div>

      <Card title="Month-wise status">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {fees.months.map((m) => (
            <div key={m.month} className="rounded-lg border border-navy-100 p-2 text-center">
              <p className="text-xs font-semibold text-navy">{m.label}</p>
              <Badge s={m.status} />
            </div>
          ))}
        </div>
      </Card>

      {done ? (
        <Card className="border-emerald-300 bg-emerald-50 text-center">
          <p className="text-sm text-emerald-800">Fee request submit ho gayi. Status: <b>Pending</b> — admin approve karega tab fees jama hogi.</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-emerald-700">Receipt No.</p>
          <p className="font-display text-3xl font-bold tracking-wider text-navy">{done.receiptNo}</p>
          {done.mode === "cash" && <p className="mt-2 text-sm text-navy-600">Ye Receipt No. aur cash <b>{done.receivedBy}</b> ko dein.</p>}
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setDoc({ kind: "receipt", p: done })} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">View / Print Receipt</button>
            <button onClick={() => setDone(null)} className="rounded-lg border border-navy-100 px-4 py-2 text-sm">Done</button>
          </div>
        </Card>
      ) : (
        <Card title="Pay Fees">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[["Name", s.name], ["Student ID", s.studentId], ["Class", s.className], ["Roll No", s.rollNumber ?? "-"]].map(([k, v]) => (
                <div key={k}><label className="text-xs text-navy-400">{k}</label>
                  <input readOnly value={v} className="mt-0.5 w-full rounded-lg border border-navy-100 bg-gray-50 px-3 py-2 text-sm font-semibold" /></div>
              ))}
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-navy-600">Month select karein</p>
              <div className="flex flex-wrap gap-2">
                {data.allMonths.map((m) => {
                  const on = months.includes(m);
                  return (
                    <button type="button" key={m} onClick={() => toggle(m)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${on ? "border-brass bg-brass text-navy font-bold" : "border-navy-100 text-navy-600"}`}>
                      {monthLabel(m)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-navy-600">Amount (₹)</label>
                <input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-navy-100 px-3 py-2 text-lg font-bold" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-600">Payment Mode</label>
                <div className="mt-0.5 flex gap-2">
                  {[["upi", "📱 UPI (QR)"], ["cash", "💵 Cash"]].map(([v, l]) => (
                    <button type="button" key={v} onClick={() => setMode(v)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold ${mode === v ? "border-navy bg-navy text-white" : "border-navy-100 text-navy-600"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            {mode === "upi" ? (
              <div className="rounded-xl border border-dashed border-brass bg-brass-50 p-4 text-center">
                {school.upiQrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={school.upiQrUrl} alt="School UPI QR" className="mx-auto h-56 w-56 rounded-lg bg-white object-contain p-2" />
                ) : <p className="text-sm text-navy-400">School ka QR abhi set nahi hai. Admin se contact karein.</p>}
                {school.upiId && <p className="mt-2 text-sm">UPI ID: <b>{school.upiId}</b></p>}
                <p className="mt-1 text-xs text-navy-600">Scan karke <b>{inr(amount)}</b> pay karein, phir neeche Submit karein.</p>
                <input placeholder="UPI Transaction / UTR no. (optional)" value={upiRef} onChange={(e) => setUpiRef(e.target.value)}
                  className="mx-auto mt-3 block w-full max-w-xs rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm" />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-navy-600">Cash kis teacher ko diya? (Teacher ka naam)</label>
                <input required value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Teacher name"
                  className="mt-0.5 w-full rounded-lg border border-navy-100 px-3 py-2 text-sm" />
              </div>
            )}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={busy || !months.length} className="w-full rounded-lg bg-brass px-4 py-3 font-bold text-navy hover:bg-brass-400 disabled:opacity-50">
              {busy ? "Submitting…" : "Submit Fee"}
            </button>
            <p className="text-center text-xs text-navy-400">Submit ke baad Receipt No. milega. Admin approve karne tak status <b>Pending</b> rahega.</p>
          </form>
        </Card>
      )}

      <Card title="Payment History">
        {!fees.payments.length ? <p className="text-sm text-navy-400">Abhi koi payment nahi.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="py-2">Receipt</th><th>Date</th><th>Months</th><th>Mode</th><th className="text-right">Amount</th><th className="pl-3">Status</th></tr></thead>
              <tbody>
                {fees.payments.map((p) => (
                  <tr key={p._id} className="border-b border-navy-50">
                    <td className="py-2"><button onClick={() => setDoc({ kind: "receipt", p })} className="font-semibold text-navy underline">{p.receiptNo}</button></td>
                    <td>{fmtDate(p.createdAt)}</td>
                    <td className="text-xs">{p.months.map(monthLabel).join(", ")}</td>
                    <td className="uppercase">{p.mode}</td>
                    <td className="text-right font-semibold">{inr(p.amount)}</td>
                    <td className="pl-3"><Badge s={p.status} />{p.adminNote && <p className="text-xs text-navy-400">{p.adminNote}</p>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function Attendance({ a }) {
  const pct = a.percent ?? 0;
  const tone = pct >= 75 ? "#059669" : "#dc2626";
  // days needed to reach 75% if currently below
  const need = a.percent != null && pct < 75 ? Math.ceil((0.75 * a.totalDays - a.present) / 0.25) : 0;
  return (
    <>
      <Card title="Attendance">
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(${tone} ${pct * 3.6}deg, #e5e7eb 0)` }}>
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white font-display text-2xl font-bold text-navy">{a.percent == null ? "–" : `${pct}%`}</div>
          </div>
          <dl className="grid grid-cols-3 gap-6 text-center">
            <div><dt className="text-xs text-navy-400">Total Days</dt><dd className="text-2xl font-bold">{a.totalDays}</dd></div>
            <div><dt className="text-xs text-navy-400">Present</dt><dd className="text-2xl font-bold text-emerald-600">{a.present}</dd></div>
            <div><dt className="text-xs text-navy-400">Absent</dt><dd className="text-2xl font-bold text-red-600">{a.absent}</dd></div>
          </dl>
        </div>
        {need > 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Attendance 75% se kam hai. Lagataar ~{need} din present rehkar 75% tak pahunch sakte hain.</p>}
      </Card>
      <Card title="Recent days">
        {!a.log.length ? <p className="text-sm text-navy-400">Abhi attendance mark nahi hui.</p> : (
          <div className="flex flex-wrap gap-2">
            {a.log.map((l) => (
              <div key={l.date} className="rounded-lg border border-navy-100 px-3 py-1.5 text-center">
                <p className="text-xs text-navy-400">{fmtDate(l.date)}</p><Badge s={l.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function LockNotice({ requested, reload }) {
  async function ask() {
    await fetch("/api/student/doc-request", { method: "POST" });
    reload();
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p>🔒 Fees pending hai, isliye download band hai. Admin ki approval ke baad download hoga.</p>
      {requested ? <span className="font-semibold">Request bhej di ✔</span>
        : <button onClick={ask} className="rounded-lg bg-brass px-4 py-2 font-bold text-navy">Admin se approval maangein</button>}
    </div>
  );
}
const DownloadBtn = ({ type, id, locked, children }) => (
  locked
    ? <span className="cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500">🔒 {children}</span>
    : <a href={`/api/student/pdf?type=${type}&id=${id}`} className="inline-block rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">⬇ {children}</a>
);

function Exams({ exams, admitCards, locked, requested, reload }) {
  return (
    <>
      <Card title="Admit Cards">
        {locked && <div className="mb-3"><LockNotice {...{ requested, reload }} /></div>}
        {!admitCards.length ? <p className="text-sm text-navy-400">Abhi koi admit card jaari nahi hua.</p> : (
          <div className="space-y-3">
            {admitCards.map((a) => (
              <div key={a._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy-100 p-3">
                <div className="text-sm">
                  <p className="font-bold text-navy">🎫 {a.examName}</p>
                  <p className="text-navy-600">{fmtDate(a.date)}{a.time ? ` · ${a.time}` : ""}{a.venue ? ` · ${a.venue}` : ""}</p>
                  {a.description && <p className="mt-0.5 text-xs text-navy-400">{a.description}</p>}
                </div>
                <DownloadBtn type="admit" id={a._id} locked={locked}>Download Admit Card (PDF)</DownloadBtn>
              </div>
            ))}
          </div>
        )}
      </Card>
      {exams.map((e) => (
        <Card key={e._id} title={`Time Table — ${e.name}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="py-2">Date</th><th>Subject</th><th>Time</th><th className="text-right">Max</th></tr></thead>
              <tbody>
                {[...e.subjects].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)).map((x) => (
                  <tr key={x.name} className="border-b border-navy-50">
                    <td className="py-2">{fmtDate(x.date)}</td><td className="font-semibold">{x.name}</td>
                    <td>{x.startTime ? `${x.startTime}${x.endTime ? ` – ${x.endTime}` : ""}` : "-"}</td><td className="text-right">{x.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </>
  );
}

function Results({ exams, locked, requested, reload }) {
  const list = exams.filter((e) => e.resultPublished);
  if (!list.length) return <Card><p className="text-sm text-navy-400">Abhi koi result publish nahi hua hai.</p></Card>;
  return (
    <>
      {locked && <LockNotice {...{ requested, reload }} />}
      {list.map((e) => (
        <Card key={e._id} title={e.name}>
          {!e.result ? <p className="text-sm text-navy-400">Aapke marks abhi enter nahi hue.</p> : (
            <>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="py-2">Subject</th><th className="text-right">Obtained</th><th className="text-right">Max</th></tr></thead>
                <tbody>{e.result.marks.map((m) => (
                  <tr key={m.subject} className="border-b border-navy-50"><td className="py-2 font-semibold">{m.subject}</td><td className="text-right">{m.obtained ?? "-"}</td><td className="text-right text-navy-400">{m.max}</td></tr>
                ))}</tbody>
              </table>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <DownloadBtn type="result" id={e._id} locked={locked}>Download Result (PDF)</DownloadBtn>
                <p className="font-display text-xl font-bold text-navy">Total {e.result.total}/{e.result.max} · {e.result.percent}%</p>
              </div>
            </>
          )}
        </Card>
      ))}
    </>
  );
}

// Printable Admit Card / Fee Receipt (everything else on the page hides while printing)
function DocView({ doc, s, school, onClose }) {
  const schoolName = school.name || "The Little Moon Academy";
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/60 p-4 print:static print:bg-white print:p-0">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 print:max-w-none print:p-0">
        <div className="mb-4 flex justify-end gap-2 print:hidden">
          <button onClick={() => window.print()} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Print / Save PDF</button>
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Close</button>
        </div>
        <div className="border-2 border-navy p-5">
          <div className="flex items-center gap-4 border-b-2 border-navy pb-3">
            <Image src="/logo.png" alt="" width={70} height={70} />
            <div>
              <h2 className="font-display text-2xl font-bold uppercase text-navy">{schoolName}</h2>
              <p className="text-xs text-navy-600">Basani Bazar, Babatpur, Varanasi</p>
            </div>
          </div>
          {(
            <>
              <h3 className="my-3 text-center text-lg font-bold uppercase tracking-widest">Fee Receipt</h3>
              <dl className="space-y-1 text-sm">
                {[["Receipt No", doc.p.receiptNo], ["Date", fmtDate(doc.p.createdAt)], ["Student", `${s.name} (${s.studentId})`], ["Class / Roll", `${s.className} / ${s.rollNumber ?? "-"}`],
                  ["Months", doc.p.months.map(monthLabel).join(", ")], ["Mode", doc.p.mode.toUpperCase() + (doc.p.receivedBy ? ` — given to ${doc.p.receivedBy}` : "")],
                  ["Amount", inr(doc.p.amount)], ["Status", doc.p.status.toUpperCase()]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-navy-50 py-1"><dt className="text-navy-400">{k}</dt><dd className="font-bold">{v}</dd></div>
                ))}
              </dl>
              {doc.p.status !== "approved" && <p className="mt-3 text-xs text-amber-700">Ye receipt tab tak valid nahi hai jab tak admin approve na kare.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}