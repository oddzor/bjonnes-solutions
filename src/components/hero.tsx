"use client";

import { ArrowDown, Phone } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

const lines = ["Fra tretopp", "til fjellgrunn."];

/** The sky. The headline names the whole span of the work, over film of it; the ground starts in the next section. */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const film = useRef<HTMLVideoElement>(null);
  const ease = [0.22, 1, 0.36, 1] as const;

  // With reduced motion the film stands still on its poster.
  useEffect(() => {
    if (reduceMotion) film.current?.pause();
  }, [reduceMotion]);

  return (
    <section className="relative isolate flex min-h-[min(calc(100svh-6rem),54rem)] flex-col justify-end overflow-hidden bg-natt-950">
      <video
        ref={film}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/hero-poster.jpg"
        aria-hidden
        className="absolute inset-0 -z-20 size-full object-cover"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>
      {/* Night falls over the film from the top and the bottom, so the text stays readable. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-natt-950/80 via-natt-950/45 to-natt-950/90" />
      <div className="mx-auto w-full max-w-7xl px-5 pt-24 pb-16 sm:px-8 sm:pb-24">
        <h1 className="display text-[clamp(1.9rem,8.2vw,6.75rem)] leading-[0.98]">
          {/* Each line rises out from behind its own baseline, once, on load. */}
          {lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12"
        >
          <p className="max-w-xl text-xl leading-relaxed text-stein-50 lg:col-span-6 lg:col-start-7 lg:row-start-1">
            {site.name} feller trærne, graver tomta og sprenger fjellet under.
            Én entreprenør på {site.city} for hele jobben, over og under bakken.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-6 lg:row-start-1 lg:self-end">
            <a
              href={site.phoneHref}
              className="inline-flex h-16 items-center gap-3 bg-signal-500 px-7 text-xl font-bold text-fjell-950 hover:bg-signal-400"
            >
              <Phone aria-hidden className="size-5" strokeWidth={2.5} />
              Ring {site.phoneDisplay}
            </a>
            <a
              href="#pa-bakken"
              className="inline-flex h-11 items-center gap-2 text-lg font-semibold underline-offset-8 hover:underline"
            >
              Følg snittet nedover
              <ArrowDown aria-hidden className="size-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
