"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Toppers", href: "/#toppers" },
  { label: "Activities & Events", href: "/#activities" },
  { label: "Contact Us", href: "/#contact" },
];

function ErpMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const item = "flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-white transition hover:bg-slate-700/80";
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 font-bold text-navy shadow-sm ring-2 ring-amber-300 transition hover:bg-amber-500">
        <span aria-hidden>👤</span><span className="tracking-wide">ERP LOGIN</span>
        <span aria-hidden className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-72 rounded-xl border-2 border-amber-400/80 bg-navy-900 p-3 shadow-2xl">
          <p className="mb-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Select Portal Access</p>
          <Link href="/login?type=student" role="menuitem" onClick={() => setOpen(false)} className={`${item} mb-2 hover:border-amber-400/50`}>
            <span className="grid h-9 w-9 place-items-center rounded-md bg-amber-400/20 text-lg">🎓</span>
            <span><span className="block text-sm font-bold">Student Login</span><span className="block text-[11px] text-gray-400">Fees, Attendance, Results & Admit Card</span></span>
          </Link>
          <Link href="/login?type=staff" role="menuitem" onClick={() => setOpen(false)} className={`${item} hover:border-cyan-400/50`}>
            <span className="grid h-9 w-9 place-items-center rounded-md bg-cyan-400/20 text-lg">🛠️</span>
            <span><span className="block text-sm font-bold">Admin / Teacher Login</span><span className="block text-[11px] text-gray-400">Sirf 5-digit PIN se login</span></span>
          </Link>
          <p className="mt-2 border-t border-slate-800 pt-2 text-center text-[10px] text-gray-400">🔒 Secure portal</p>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="bg-navy px-4 py-1.5 text-xs text-gray-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span>📢 Admissions Open for Session 2026-27</span>
          <span className="hidden md:inline">Nursery to Class IX · Basani Bazar, Babatpur, Varanasi</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="The Little Moon Academy logo" width={52} height={52} priority className="rounded-full" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-navy md:text-xl">THE LITTLE MOON ACADEMY</span>
              <span className="block text-[11px] tracking-wider text-gray-500">AN IDEAL SCHOOL FOR YOUR KIDS</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 lg:flex">
            {NAV_LINKS.map((l) => <a key={l.href} href={l.href} className="transition-colors hover:text-brass-600">{l.label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <ErpMenu />
            <button className="rounded-lg border border-navy-100 px-3 py-2 lg:hidden" aria-label="Menu" onClick={() => setMenu((v) => !v)}>☰</button>
          </div>
        </div>
        {menu && (
          <nav className="border-t border-navy-100 bg-white px-4 py-2 lg:hidden">
            {NAV_LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="block py-2 text-sm text-gray-700">{l.label}</a>)}
          </nav>
        )}
      </header>
    </>
  );
}
