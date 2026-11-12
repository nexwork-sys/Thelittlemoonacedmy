"use client";

import { useEffect, useState } from "react";

const empty = { name: "", fatherName: "", guardianMobile: "", rollNumber: "", section: "A", monthlyFee: "" };

// Class teacher adds students. Each student gets an auto Student ID that opens the Student ERP.
export default function CTStudentManager({ classTeacherOf }) {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => fetch(`/api/students?className=${encodeURIComponent(classTeacherOf)}`).then((r) => r.json()).then((d) => setStudents(d.students || []));
  useEffect(() => { load(); }, [classTeacherOf]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setError(""); setCreated(null);
    const res = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, className: classTeacherOf }) });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) return setError(d.error || "Save nahi hua");
    setCreated(d.student); setForm(empty); load();
  }
  async function remove(s) {
    if (!confirm(`${s.name} ko hataayein?`)) return;
    await fetch(`/api/students/${s._id}`, { method: "DELETE" }); load();
  }
  async function setFee(s) {
    const v = prompt(`${s.name} ki monthly fees (₹). 0 = class ki default fees`, s.monthlyFee || 0);
    if (v == null) return;
    await fetch(`/api/students/${s._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ monthlyFee: Number(v) || 0 }) });
    load();
  }

  const input = "w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-brass";
  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-navy">Naya Student — {classTeacherOf}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="text-xs text-navy-400">Student ka naam *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></div>
          <div><label className="text-xs text-navy-400">Roll No</label><input type="number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className={input} /></div>
          <div><label className="text-xs text-navy-400">Father ka naam</label><input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} className={input} /></div>
          <div><label className="text-xs text-navy-400">Guardian Mobile</label><input inputMode="numeric" maxLength={10} value={form.guardianMobile} onChange={(e) => setForm({ ...form, guardianMobile: e.target.value.replace(/\D/g, "") })} className={input} /></div>
          <div><label className="text-xs text-navy-400">Monthly Fee ₹ (khali = class default)</label><input type="number" min="0" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} className={input} /></div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {created && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm">
            <b>{created.name}</b> add ho gaya. Student ERP login ID: <span className="font-display text-xl font-bold tracking-wider text-navy">{created.studentId}</span>
            <p className="text-xs text-emerald-700">Ye ID student/parent ko dein.</p>
          </div>
        )}
        <button disabled={saving} className="rounded-lg bg-brass px-5 py-2 font-bold text-navy disabled:opacity-50">{saving ? "Saving…" : "Add Student"}</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
        <table className="w-full min-w-[620px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-navy-400"><th className="px-4 py-3">Roll</th><th>Student ID</th><th>Name</th><th>Mobile</th><th>Fee/month</th><th /></tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-navy-50 last:border-0">
                <td className="px-4 py-3">{s.rollNumber ?? "-"}</td><td className="font-semibold">{s.studentId}</td><td>{s.name}</td><td>{s.guardianMobile || "-"}</td>
                <td><button onClick={() => setFee(s)} className="underline">{s.monthlyFee ? `₹${s.monthlyFee}` : "default"}</button></td>
                <td className="pr-4 text-right"><button onClick={() => remove(s)} className="text-red-600 underline">Remove</button></td>
              </tr>
            ))}
            {!students.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-navy-400">Abhi koi student nahi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
