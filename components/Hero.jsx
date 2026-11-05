import AdmissionInquiryModal from "./AdmissionInquiryModal";

const FACTS = [
  ["Classes", "Nursery – VIII"],
  ["Where", "Babatpur, Varanasi"],
  ["Admissions", "Open 2026–27"],
  ["Parent ERP", "Fees · Attendance · Results"],
];

const STARS = [[8, 12, 3], [22, 70, 2], [40, 30, 2.5], [70, 8, 2], [85, 55, 3], [60, 80, 2], [92, 25, 2], [14, 45, 2]];

function Moon() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Crescent moon in a night sky">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFC53D" stopOpacity=".35" /><stop offset="1" stopColor="#FFC53D" stopOpacity="0" /></radialGradient>
        <mask id="crescent"><rect width="400" height="400" fill="#fff" /><circle cx="250" cy="170" r="115" fill="#000" /></mask>
      </defs>
      <circle cx="190" cy="200" r="190" fill="url(#glow)" />
      <circle cx="190" cy="200" r="130" fill="#FFC53D" mask="url(#crescent)" />
      <circle cx="318" cy="285" r="26" fill="#7CC4F0" opacity=".9" />
      <circle cx="328" cy="278" r="26" fill="#0F1B3D" />
    </svg>
  );
}

export default function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,#1f3a8a55,transparent_60%)]" />
        {STARS.map(([x, y, s], i) => (
          <span key={i} aria-hidden className="twinkle absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, animationDelay: `${i * 0.5}s` }} />
        ))}
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-24 pt-12 md:grid-cols-[1.2fr_1fr] md:pb-28 md:pt-20">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              An ideal school<br className="hidden sm:block" /> for your kids.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
              Nursery se Class VIII tak — pyaar bhare maahaul me padhai, anushasan aur sanskaar. Basani Bazar, Babatpur, Varanasi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AdmissionInquiryModal triggerClassName="rounded-full bg-brass px-7 py-3.5 text-sm font-bold text-navy shadow-lg transition hover:bg-brass-400 sm:text-base" />
              <a href="#activities" className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:text-base">See school life</a>
            </div>
          </div>
          <div className="mx-auto hidden aspect-square w-full max-w-sm md:block"><Moon /></div>
        </div>
      </section>

      <section aria-label="Quick facts" className="relative z-10 mx-auto -mt-12 max-w-6xl px-4">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-navy-100 shadow-soft md:grid-cols-4">
          {FACTS.map(([k, v]) => (
            <div key={k} className="bg-white px-4 py-5 text-center sm:py-6">
              <dt className="text-xs font-medium text-navy-400">{k}</dt>
              <dd className="mt-1 font-display text-base font-semibold text-navy sm:text-xl">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <h2 className="font-display text-3xl font-semibold text-navy sm:text-4xl">Ek chhota school, har bachche par poora dhyaan.</h2>
            <p className="mt-4 text-navy-600">The Little Moon Academy bachchon ko Nursery se Class VIII tak ek surakshit aur anushasit maahaul deta hai.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              ["Nursery to Class VIII", "Chhote bachchon ki neev se lekar middle school tak, ek hi campus me."],
              ["Parents ke liye ERP", "Fees, attendance, results aur admit card — sab ek login me."],
              ["Teacher attendance", "Teachers face recognition se punch karte hain, isliye time par aana pakka."],
              ["Results & admit cards", "Exam time table aur marks school se seedha aapke phone par."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-3xl border border-navy-100 bg-white p-5">
                <h3 className="font-display text-lg font-semibold text-navy">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
