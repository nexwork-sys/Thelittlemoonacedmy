"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Toppers", href: "/#toppers" },
  { label: "Activities", href: "/#activities" },
  { label: "Contact", href: "/#contact" },
];

function ErpMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); };
  }, []);

  const item = "flex items-center gap-3 rounded-2xl p-3 transition hover:bg-navy-50";
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-700">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" /></svg>
        <span>ERP Login</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-3 w-[min(19rem,calc(100vw-2rem))] rounded-3xl border border-navy-100 bg-white p-2 shadow-2xl">
          <Link href="/login?type=student" role="menuitem" onClick={() => setOpen(false)} className={item}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/30 text-lg" aria-hidden>🎓</span>
            <span><span className="block text-sm font-bold text-navy">Student Login</span><span className="block text-xs text-navy-400">Fees, attendance, results, admit card</span></span>
          </Link>
          <Link href="/login?type=staff" role="menuitem" onClick={() => setOpen(false)} className={item}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky/40 text-lg" aria-hidden>🛠️</span>
            <span><span className="block text-sm font-bold text-navy">Admin / Teacher Login</span><span className="block text-xs text-navy-400">Sirf 5-digit PIN se login</span></span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="bg-navy-900 px-4 py-2 text-center text-xs text-white/80 sm:text-sm">
        <span className="font-semibold text-brass">Admissions open</span> for session 2026–27 · Nursery to Class VIII
      </div>
      <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image src="/logo.png" alt="The Little Moon Academy logo" width={44} height={44} priority className="h-11 w-11 shrink-0 rounded-full" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-base font-bold text-navy sm:text-xl">The Little Moon Academy</span>
              <span className="hidden text-[11px] text-navy-400 sm:block">An ideal school for your kids</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium text-navy-600 lg:flex">
            {NAV_LINKS.map((l) => <a key={l.href} href={l.href} className="rounded-full px-3.5 py-2 transition hover:bg-navy-50 hover:text-navy">{l.label}</a>)}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ErpMenu />
            <button className="grid h-10 w-10 place-items-center rounded-full border border-navy-100 text-navy lg:hidden" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{menu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            </button>
          </div>
        </div>
        {menu && (
          <nav className="border-t border-navy-100 bg-white px-4 pb-3 pt-1 lg:hidden">
            {NAV_LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="block rounded-xl px-3 py-3 text-sm font-medium text-navy-600 active:bg-navy-50">{l.label}</a>)}
          </nav>
        )}
      </header>
    </>
  );
}
