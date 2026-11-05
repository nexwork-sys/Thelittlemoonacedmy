"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const HOME = { superadmin: "/admin/dashboard", admin: "/admin/dashboard", teacher: "/teacher/dashboard", student: "/student/dashboard" };

export default function LoginForm({ initialType = "staff" }) {
  const router = useRouter();
  const [type, setType] = useState(initialType === "student" ? "student" : "staff");
  const [pin, setPin] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "staff" ? { pin } : { studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(HOME[data.user.role]);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tab = (v, label, icon) => (
    <button type="button" onClick={() => { setType(v); setError(""); }} aria-pressed={type === v}
      className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition ${type === v ? "bg-navy text-white shadow" : "text-navy-600 hover:bg-white"}`}>
      <span aria-hidden>{icon}</span>{label}
    </button>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-4 py-10">
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brass/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky/20 blur-3xl" />
      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
        <Link href="/" className="flex flex-col items-center">
          <Image src="/logo.png" alt="The Little Moon Academy" width={76} height={76} className="h-[76px] w-[76px] rounded-full" priority />
          <h1 className="mt-3 text-center font-display text-2xl font-semibold text-navy">The Little Moon Academy</h1>
          <p className="text-sm text-navy-400">ERP login</p>
        </Link>

        <div className="mt-6 flex gap-1 rounded-full bg-navy-50 p-1">
          {tab("staff", "Admin / Teacher", "👤")}
          {tab("student", "Student", "🎓")}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {type === "staff" ? (
            <div>
              <label htmlFor="pin" className="mb-1.5 block text-sm font-medium text-navy-600">5-digit PIN</label>
              <input id="pin" type="password" inputMode="numeric" pattern="\d{5}" maxLength={5} required autoFocus
                autoComplete="off" placeholder="• • • • •" value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-2xl border border-navy-100 bg-navy-50/50 px-4 py-3.5 text-center text-2xl tracking-[0.5em]" />
              <p className="mt-2 text-xs text-navy-400">Admin aur teacher dono isi PIN se login karte hain.</p>
            </div>
          ) : (
            <div>
              <label htmlFor="sid" className="mb-1.5 block text-sm font-medium text-navy-600">Student ID</label>
              <input id="sid" required autoFocus autoComplete="off" placeholder="e.g. LMA26-0001" value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-navy-100 bg-navy-50/50 px-4 py-3.5 text-center text-lg font-semibold tracking-widest" />
              <p className="mt-2 text-xs text-navy-400">Student ID class teacher se milegi.</p>
            </div>
          )}
          {error && <p role="alert" className="rounded-2xl bg-maroon/10 px-4 py-2.5 text-sm text-maroon">{error}</p>}
          <button disabled={loading || (type === "staff" ? pin.length !== 5 : !studentId)}
            className="w-full rounded-full bg-brass px-4 py-3.5 font-bold text-navy transition hover:bg-brass-400 disabled:opacity-50">
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-navy-400">Designed &amp; Developed by <span className="font-semibold text-navy-600">Nexwork Tech</span></p>
      </div>
    </div>
  );
}
