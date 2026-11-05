"use client";

import { useEffect, useState } from "react";
import AdmissionInquiryModal from "./AdmissionInquiryModal";

const SLIDES = [
  "photo-1541829070764-84a7d30dd3f3", "photo-1509062522246-3755977927d7", "photo-1532094349884-543bc11b234d",
  "photo-1521587760476-6c12a4b040da", "photo-1574629810360-7efbbe195018",
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&q=80`);

const STATS = [
  ["CLASSES", "Nursery – VIII"], ["LOCATION", "Babatpur, Varanasi"], ["ADMISSIONS", "Open 2026–27"], ["STUDENT ERP", "Fees · Attendance · Results"],
];

export default function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const go = (n) => setI((n + SLIDES.length) % SLIDES.length);

  return (
    <>
      <section id="about" className="relative h-[80vh] w-full overflow-hidden bg-gray-900 md:h-[85vh]">
        {SLIDES.map((src, n) => (
          <div key={src} aria-hidden className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${n === i ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `linear-gradient(rgba(11,25,44,.55),rgba(11,25,44,.72)), url('${src}')` }} />
        ))}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <span className="inline-block rounded-full border border-amber-400/40 bg-amber-400/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md md:text-sm">
              Welcome to The Little Moon Academy
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
              An Ideal School For Your Kids
            </h1>
            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-gray-200 md:text-xl">
              Nursery se Class VIII tak — pyaar bhare maahaul me padhai, sanskaar aur har bachche ka poora vikas. Basani Bazar, Babatpur, Varanasi.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <AdmissionInquiryModal triggerClassName="rounded-lg bg-amber-400 px-7 py-3.5 font-bold text-navy shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-500" />
              <a href="#activities" className="rounded-lg border border-white/40 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-md transition hover:bg-white/20">See School Life</a>
            </div>
          </div>
        </div>
        <button onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute left-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/60">‹</button>
        <button onClick={() => go(i + 1)} aria-label="Next slide" className="absolute right-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/60">›</button>
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {SLIDES.map((_, n) => <button key={n} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} className={`h-3 w-3 rounded-full transition ${n === i ? "bg-amber-400" : "bg-white/50 hover:bg-white"}`} />)}
        </div>
      </section>

      <section className="border-y border-amber-200/60 bg-amber-50 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
          {STATS.map(([k, v], n) => (
            <div key={k} className={`p-2 ${n ? "md:border-l md:border-amber-200" : ""}`}>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-500">{k}</span>
              <span className="font-display text-xl font-bold text-navy md:text-2xl">{v}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
