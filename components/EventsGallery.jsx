"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Cycles through every media item (images + a video embed) for one event
// card — the "4-6 photos + video, auto-playing in one card" slideshow.
function EventMedia({ heading, category, media = [] }) {
  const items = media.length ? media : null;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!items || items.length < 2) return undefined;
    const current = items[active];
    // Pause auto-advance while a video embed is showing — let it play;
    // only images advance on a timer.
    if (current?.isEmbed) return undefined;
    const timer = setTimeout(() => setActive((i) => (i + 1) % items.length), 3200);
    return () => clearTimeout(timer);
  }, [active, items]);

  if (!items) {
    return (
      <div className="flex h-full w-full items-center justify-center font-display text-sm text-navy-400">
        {category}
      </div>
    );
  }

  const current = items[active];

  return (
    <>
      {current.isEmbed ? (
        <iframe src={current.url} title={heading} className="h-full w-full" allowFullScreen />
      ) : (
        <Image src={current.url} alt={heading} fill sizes="(max-width: 640px) 100vw, 400px" unoptimized={current.url.endsWith(".svg")} className="object-cover" />
      )}
      {items.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show media ${i + 1}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === active ? "bg-brass" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function EventsGallery({ events = [] }) {
  const list = events.length ? events : PLACEHOLDER_EVENTS;

  return (
    <section id="activities" className="bg-ivory">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold text-navy sm:text-4xl">Activities &amp; Events</h2>
        <p className="mt-2 text-navy-600">School ki hali gatividhiyan, ek nazar me.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((ev, idx) => {
            return (
              <article
                key={ev._id || idx}
                className="overflow-hidden rounded-3xl border border-navy-100 bg-white"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-navy-50">
                  <EventMedia heading={ev.heading} category={ev.category} media={ev.media} />
                </div>
                <div className="p-4">
                  {!ev.sample && <p className="text-xs font-semibold text-brass-600">{formatDate(ev.eventDate)}</p>}
                  <h3 className="mt-1 font-display text-lg font-semibold text-navy">{ev.heading}</h3>
                  <p className="mt-1.5 line-clamp-3 text-sm text-navy-600">{ev.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Sample activities shown until real ones are added from Admin > Activities & Events.
const pics = (k, n) => Array.from({ length: n }, (_, i) => ({ type: "image", url: `/activities/${k}-${i + 1}.svg` }));
const PLACEHOLDER_EVENTS = [
  { heading: "Annual Sports Day", description: "Races, relay and drill by our students across all classes, cheered on by parents and teachers.", category: "sports", media: pics("sports", 4), sample: true },
  { heading: "Science Exhibition", description: "Student-made working models and experiments on display for parents, from Class 1 through Class 8.", category: "academic", media: pics("science", 5), sample: true },
  { heading: "Annual Function", description: "A cultural evening of songs, dance and skits by our students.", category: "cultural", media: pics("function", 3), sample: true },
];
