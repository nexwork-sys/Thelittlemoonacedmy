"use client";

import { useEffect, useState, useCallback } from "react";

const CLASSES = ["Nursery","LKG","UKG","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9"];
const input = "w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-brass";
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");

// Admin: pick students -> exam name, date, description -> admit cards appear in their ERP.
export default function AdmitCardManager() {
  const [className, setClassName] = useState(CLASSES[3]);
  const [students, setStudents] = useState([]);
  const [picked, setPicked] = useState([]);
  const [form, setForm] = useState({ examName: "", date: "", time: "", venue: "", description: "" });
  const [cards, setCards] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadCards = useCallback(() => fetch("/api/admit-cards").then((r) => r.json()).then((d) => setCards(d.cards || [])), []);
  useEffect(() => { loadCards(); }, [loadCards]);
  useEffect(() => {
    setPicked([]);
    fetch(`/api/students?className=${encodeURIComponent(className)}`).then((r) => r.json()).then((d) => setStudents(d.students || []));
  }, [className]);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const allOn = students.length > 0 && picked.length === students.length;

  async function generate(e) {
    e.preventDefault(); setMsg(""); setError("");
    const res = await fetch("/api/admit-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, studentIds: picked }) });
    const d = await res.json();
    if (!res.ok) return setError(d.error || "Failed");
    setMsg(`${d.created} student(s) ke ERP me admit card aa gaya.`); setPicked([]); loadCards();
  }
  async function remove(id) {
    await fetch(`/api/admit-cards/${id}`, { method: "DELETE" }); loadCards();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={generate} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy">Admit Card Generate Karein</h2>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="rounded-lg border border-navy-100 px-3 py-2 text-sm">
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={allOn} onChange={() => setPicked(allOn ? [] : students.map((s) => s._id))} /> Sab select ({picked.length}/{students.length})
            </label>
          </div>
          <div className="grid max-h-56 gap-1 overflow-auto rounded-lg border border-navy-100 p-2 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s) => (
              <label key={s._id} className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm ${picked.includes(s._id) ? "bg-amber-50" : ""}`}>
                <input type="checkbox" checked={picked.includes(s._id)} onChange={() => toggle(s._id)} />
                <span>{s.rollNumber ? `${s.rollNumber}. ` : ""}{s.name}</span><span className="ml-auto text-xs text-navy-400">{s.studentId}</span>
              </label>
            ))}
            {!students.length && <p className="p-3 text-sm text-navy-400">Is class me koi student nahi.</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="text-xs text-navy-400">Kaun sa exam *</label><input required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} placeholder="Half Yearly Exam 2026" className={input} /></div>
          <div><label className="text-xs text-navy-400">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={input} /></div>
          <div><label className="text-xs text-navy-400">Time</label><input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="9:00 AM – 12:00 PM" className={input} /></div>
          <div><label className="text-xs text-navy-400">Venue (optional)</label><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={input} /></div>
        </div>
        <div><label className="text-xs text-navy-400">Description / Instructions</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Exam hall me pen, pencil aur ye admit card saath layein…" className={input} /></div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}
        <button disabled={!picked.length} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy disabled:opacity-50">Generate ({picked.length} student)</button>
        <p className="text-xs text-navy-400">Jinki fees pending hogi unko download tab milega jab aap Fees section se approve karenge.</p>
      </form>

      <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
        <table className="w-full min-w-[620px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="px-4 py-3">Student</th><th>Class</th><th>Exam</th><th>Date</th><th /></tr></thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c._id} className="border-b border-navy-50 last:border-0">
                <td className="px-4 py-2.5"><b>{c.student?.name || "—"}</b> <span className="text-xs text-navy-400">{c.student?.studentId}</span></td>
                <td>{c.className}</td><td>{c.examName}</td><td>{fmt(c.date)}</td>
                <td className="pr-4 text-right"><button onClick={() => remove(c._id)} className="text-red-600 underline">Delete</button></td>
              </tr>
            ))}
            {!cards.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-navy-400">Abhi koi admit card nahi banaya.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
