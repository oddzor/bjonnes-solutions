"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { reviews } from "@/lib/site";

const STARS = 5;
const ease = [0.32, 0.72, 0, 1] as const;
const step =
  "flex size-12 cursor-pointer items-center justify-center border border-fjell-600 text-stein-300 transition-colors hover:border-signal-500 hover:text-signal-500";

/** What customers say, one review at a time. The stars count each rating up afresh. */
export function Reviews() {
  const [index, setIndex] = useState(0);
  const still = useReducedMotion();
  const review = reviews[index];
  const go = (by: number) => setIndex((i) => (i + by + reviews.length) % reviews.length);

  return (
    <section id="omtaler" className="border-t border-fjell-800 bg-fjell-950 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-4">
          <p className="font-semibold text-stein-400">Omtaler</p>
          <h2 className="display mt-3 text-[2rem] leading-[1.02] text-balance sm:text-5xl">Hva kundene våre sier</h2>
          <div className="mt-10 flex items-center gap-3 lg:mt-auto lg:pt-10">
            <button type="button" onClick={() => go(-1)} aria-label="Forrige omtale" className={step}>
              <ArrowLeft aria-hidden className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Neste omtale" className={step}>
              <ArrowRight aria-hidden className="size-5" />
            </button>
            <p className="ml-3 font-semibold text-stein-400 tabular-nums">
              <span className="text-stein-50">{String(index + 1).padStart(2, "0")}</span> /{" "}
              {String(reviews.length).padStart(2, "0")}
            </p>
          </div>
        </div>
        <figure className="border border-fjell-600 bg-fjell-900 lg:col-span-7 lg:col-start-6">
          <div
            key={review.name}
            role="img"
            aria-label={`${review.rating} av ${STARS} stjerner`}
            className="flex gap-1.5 border-b border-fjell-600 px-6 py-5 sm:px-9"
          >
            {Array.from({ length: STARS }, (_, i) => {
              const counted = i < review.rating;
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: still ? 1 : 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: still ? 0 : 0.35, delay: still ? 0 : i * 0.06, ease }}
                >
                  <Star
                    aria-hidden
                    className={`size-6 ${counted ? "fill-stal-500 text-stal-500" : "fill-fjell-800 text-fjell-600"}`}
                  />
                </motion.span>
              );
            })}
          </div>
          <div aria-live="polite" className="p-6 sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: still ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: still ? 0 : -6 }}
                transition={{ duration: still ? 0 : 0.3, ease }}
                className="flex min-h-72 flex-col sm:min-h-60"
              >
                <blockquote className="display text-xl leading-[1.25] text-balance sm:text-2xl">
                  «{review.text}»
                </blockquote>
                <figcaption className="mt-auto flex flex-col gap-1 border-t border-fjell-600 pt-5 text-stein-400 sm:flex-row sm:justify-between">
                  <span className="font-bold text-stein-50">{review.name}</span>
                  <span>
                    {review.job}, {review.place}
                  </span>
                </figcaption>
              </motion.div>
            </AnimatePresence>
          </div>
        </figure>
      </div>
    </section>
  );
}
