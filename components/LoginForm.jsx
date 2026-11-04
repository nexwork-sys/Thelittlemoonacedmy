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
    <button type="button" onClick={() => { setType(v); setError(""); }}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        type === v ? "bg-navy text-white shadow" : "text-navy-600 hover:bg-navy-50"}`}>
      <span aria-hidden>{icon}</span>{label}
    </button>
  );

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-gradient-to-b from-navy-50 to-ivory px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border-t-4 border-brass bg-white p-7 shadow-xl">
        <Link href="/" className="flex flex-col items-center">
          <Image src="/logo.png" alt="The Little Moon Academy" width={84} height={84} className="rounded-full" priority />
          <h1 className="mt-3 text-center font-display text-2xl font-bold text-navy">The Little Moon Academy</h1>
          <p className="text-xs tracking-wider text-navy-400">ERP LOGIN</p>
        </Link>

        <div className="mt-6 flex gap-1 rounded-xl bg-navy-50 p-1">
          {tab("staff", "Admin / Teacher", "👤")}
          {tab("student", "Student", "🎓")}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {type === "staff" ? (
            <div>
              <label htmlFor="pin" className="mb-1 block text-sm font-medium text-navy-600">5-digit PIN</label>
              <input id="pin" type="password" inputMode="numeric" pattern="\d{5}" maxLength={5} required autoFocus
                autoComplete="off" placeholder="• • • • •" value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-navy-100 px-4 py-3 text-center text-2xl tracking-[0.6em] focus:border-brass focus:ring-2 focus:ring-brass/30" />
              <p className="mt-2 text-xs text-navy-400">Admin aur teacher dono isi PIN se login karte hain.</p>
            </div>
          ) : (
            <div>
              <label htmlFor="sid" className="mb-1 block text-sm font-medium text-navy-600">Student ID</label>
              <input id="sid" required autoFocus autoComplete="off" placeholder="e.g. LMA26-0001" value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-navy-100 px-4 py-3 text-center text-lg font-semibold tracking-widest focus:border-brass focus:ring-2 focus:ring-brass/30" />
              <p className="mt-2 text-xs text-navy-400">Student ID class teacher se milegi.</p>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>}
          <button disabled={loading || (type === "staff" ? pin.length !== 5 : !studentId)}
            className="w-full rounded-lg bg-brass px-4 py-3 font-bold text-navy transition hover:bg-brass-400 disabled:opacity-50">
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
