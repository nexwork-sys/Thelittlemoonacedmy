"use client";

import { useEffect, useState, useCallback } from "react";

const CLASSES = ["Nursery","LKG","UKG","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8"];
const blankSub = () => ({ name: "", date: "", startTime: "09:00", endTime: "12:00", maxMarks: 100 });
const input = "rounded-lg border border-navy-100 px-2.5 py-1.5 text-sm";

// Admin: create exam timetable, publish results, enter marks.
// Teacher (role="teacher"): only enters marks for their own class.
export default function ExamManager({ role = "admin" }) {
  const admin = role === "admin";
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: "", className: CLASSES[3], venue: "", subjects: [blankSub()] });
  const [marksFor, setMarksFor] = useState(null); // exam being edited
  const [students, setStudents] = useState([]);
  const [grid, setGrid] = useState({});
  const [msg, setMsg] = useState("");

  const load = useCallback(() => fetch("/api/exams").then((r) => r.json()).then((d) => setExams(d.exams || [])), []);
  useEffect(() => { load(); }, [load]);

  const setSub = (i, k, v) => setForm((f) => ({ ...f, subjects: f.subjects.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));

  async function create(e) {
    e.preventDefault(); setMsg("");
    const res = await fetch("/api/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error || "Failed");
    setForm({ ...form, name: "", subjects: [blankSub()] }); setMsg("Exam timetable ban gaya."); load();
  }
  async function patch(id, body) {
    await fetch(`/api/exams/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); load();
  }
  async function del(id) {
    if (!confirm("Exam delete karein?")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" }); load();
  }
  async function openMarks(exam) {
    const d = await fetch(`/api/students?className=${encodeURIComponent(exam.className)}`).then((r) => r.json());
    const g = {};
    (exam.results || []).forEach((r) => { g[r.student] = Object.fromEntries(r.marks.map((m) => [m.subject, m.obtained])); });
    setStudents(d.students || []); setGrid(g); setMarksFor(exam);
  }
  async function saveMarks() {
    const results = students.map((s) => ({ student: s._id, marks: marksFor.subjects.map((sub) => ({ subject: sub.name, obtained: grid[s._id]?.[sub.name] ?? "" })) }));
    const res = await fetch(`/api/exams/${marksFor._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ results }) });
    if (res.ok) { setMsg("Marks save ho gaye."); setMarksFor(null); load(); } else setMsg((await res.json()).error || "Failed");
  }

  return (
    <div className="space-y-8">
      {admin && (
        <form onSubmit={create} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-navy">Naya Exam / Time Table</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <input required placeholder="Exam naam (Half Yearly 2026)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className={input}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select>
            <input placeholder="Exam centre / venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={input} />
          </div>
          <div className="space-y-2">
            {form.subjects.map((s, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input placeholder="Subject" value={s.name} onChange={(e) => setSub(i, "name", e.target.value)} className={`${input} w-36`} />
                <input type="date" value={s.date} onChange={(e) => setSub(i, "date", e.target.value)} className={input} />
                <input type="time" value={s.startTime} onChange={(e) => setSub(i, "startTime", e.target.value)} className={input} />
                <input type="time" value={s.endTime} onChange={(e) => setSub(i, "endTime", e.target.value)} className={input} />
                <input type="number" title="Max marks" value={s.maxMarks} onChange={(e) => setSub(i, "maxMarks", e.target.value)} className={`${input} w-20`} />
                {form.subjects.length > 1 && <button type="button" onClick={() => setForm({ ...form, subjects: form.subjects.filter((_, j) => j !== i) })} className="text-red-600">✕</button>}
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, subjects: [...form.subjects, blankSub()] })} className="text-sm text-navy underline">+ Subject jodein</button>
          </div>
          <button className="rounded-lg bg-brass px-5 py-2 font-bold text-navy">Create</button>
        </form>
      )}
      {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</p>}

      <div className="space-y-4">
        {exams.map((x) => (
          <div key={x._id} className="rounded-xl border border-navy-100 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-navy">{x.name} <span className="text-sm font-normal text-navy-400">· {x.className}</span></h3>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {admin && (
                  <>
                    <label className="flex items-center gap-1.5"><input type="checkbox" checked={x.resultPublished} onChange={(e) => patch(x._id, { resultPublished: e.target.checked })} /> Result publish</label>
                  </>
                )}
                <button onClick={() => openMarks(x)} className="rounded-lg bg-navy px-3 py-1.5 font-semibold text-white">Marks Enter</button>
                {admin && <button onClick={() => del(x._id)} className="text-red-600 underline">Delete</button>}
              </div>
            </div>
            <p className="mt-2 text-xs text-navy-400">{x.subjects.map((s) => `${s.name}${s.date ? ` (${new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })})` : ""}`).join(" · ")}</p>
          </div>
        ))}
        {!exams.length && <p className="text-sm text-navy-400">Abhi koi exam nahi.</p>}
      </div>

      {marksFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-5">
            <h3 className="font-display text-xl font-bold text-navy">{marksFor.name} — {marksFor.className} marks</h3>
            <table className="mt-3 w-full text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="py-2">Roll</th><th>Student</th>{marksFor.subjects.map((s) => <th key={s.name}>{s.name} /{s.maxMarks}</th>)}</tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-navy-50">
                    <td className="py-1.5">{s.rollNumber ?? "-"}</td><td>{s.name}</td>
                    {marksFor.subjects.map((sub) => (
                      <td key={sub.name}><input type="number" min="0" max={sub.maxMarks} value={grid[s._id]?.[sub.name] ?? ""}
                        onChange={(e) => setGrid({ ...grid, [s._id]: { ...grid[s._id], [sub.name]: e.target.value } })} className={`${input} w-20`} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex gap-2">
              <button onClick={saveMarks} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy">Save Marks</button>
              <button onClick={() => setMarksFor(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
