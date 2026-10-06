"use client";

import { ArrowDown, Phone } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { site } from "@/lib/site";

const lines = ["Fra tretopp", "til fjellgrunn."];

/** The sky. The headline names the whole span of the work; the ground starts in the next section. */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="bg-linear-to-b from-natt-950 to-natt-900">
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
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
          className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12"
        >
          <p className="max-w-xl text-xl leading-relaxed text-stein-300 lg:col-span-6 lg:col-start-7 lg:row-start-1">
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
