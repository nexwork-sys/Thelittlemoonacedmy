import Image from "next/image";

const RANK_LABEL = { 1: "1st", 2: "2nd", 3: "3rd" };

export default function ToppersCorner({ toppers = [] }) {
  const list = toppers.length ? toppers : PLACEHOLDER_TOPPERS;
  return (
    <section id="toppers" className="bg-navy text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-brass">Academic year 2025–26</p>
            <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Topper&apos;s Corner</h2>
          </div>
          <p className="max-w-sm text-sm text-white/65">Un students ke liye jinki mehnat unke results me dikhti hai.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {list.map((t, idx) => (
            <div key={t._id || idx} className="relative rounded-3xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:p-5">
              <span className="absolute right-3 top-3 rounded-full bg-brass px-2 py-0.5 text-[11px] font-bold text-navy">{RANK_LABEL[t.rank] || `#${t.rank}`}</span>
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-brass bg-navy-700 sm:h-24 sm:w-24">
                {t.photoUrl ? <Image src={t.photoUrl} alt={t.studentName} fill sizes="96px" className="object-cover" /> :
                  <div className="flex h-full w-full items-center justify-center font-display text-2xl text-brass">{t.studentName?.charAt(0)}</div>}
              </div>
              <p className="mt-3 text-center font-display text-base font-semibold leading-snug">{t.studentName}</p>
              <p className="text-center text-xs text-white/60">{t.className}</p>
              <p className="mt-2 text-center font-display text-2xl font-semibold text-brass">{t.percentage}{t.percentage !== "--" && "%"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PLACEHOLDER_TOPPERS = [1, 2, 3, 4].map((rank) => ({ studentName: "Add your toppers", className: "via Admin Dashboard", rank, percentage: "--" }));
