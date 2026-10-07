"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

const cell = "bg-fjell-900 p-5 sm:p-7";
const link = `${cell} transition-colors hover:bg-fjell-800`;
const label = "block font-semibold text-stein-400";
const ease = [0.32, 0.72, 0, 1] as const;
const OPEN = "inset(0px 0px 0px 0px)";

/**
 * Contact details set as the title block of a drawing: one ruled box, one fact per cell.
 * The e-mail cell opens into a form. The details and the form lie on top of each other in one
 * grid cell that is always as tall as the taller of the two, so opening the form moves nothing
 * on the page: the form is only uncovered, starting from the e-mail cell.
 */
export function Contact() {
  const [writing, setWriting] = useState(false);
  const [visit, setVisit] = useState(0);
  // The form's clip while it is shut: the e-mail cell's own box inside the stack.
  const [shut, setShut] = useState("inset(100% 0px 0px 50%)");
  const stack = useRef<HTMLDivElement>(null);
  const emailCell = useRef<HTMLButtonElement>(null);
  const still = useReducedMotion();
  const time = (seconds: number) => (still ? 0 : seconds);

  function open() {
    const outer = stack.current?.getBoundingClientRect();
    const inner = emailCell.current?.getBoundingClientRect();
    if (outer && inner) {
      const px = (n: number) => `${Math.max(0, Math.round(n))}px`;
      setShut(
        `inset(${px(inner.top - outer.top)} ${px(outer.right - inner.right)} ${px(outer.bottom - inner.bottom)} ${px(inner.left - outer.left)})`,
      );
    }
    setVisit((n) => n + 1);
    setWriting(true);
  }

  // When the form closes, focus goes back to the cell that opened it, once that cell can take it again.
  const wasWriting = useRef(false);
  useEffect(() => {
    if (wasWriting.current && !writing) emailCell.current?.focus({ preventScroll: true });
    wasWriting.current = writing;
  }, [writing]);

  return (
    <section id="kontakt" className="border-t border-fjell-800 bg-fjell-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="display max-w-3xl text-[1.75rem] leading-[1.05] text-balance sm:text-4xl">
          Fortell hva som skal gjøres, så tar vi det derfra.
        </h2>
        {/* The gaps between cells show the box's lighter background, which draws the ruling. */}
        <div className="mt-10 grid max-w-3xl gap-px border border-fjell-600 bg-fjell-600">
          <div ref={stack} className="grid bg-fjell-900">
            <motion.div
              inert={writing}
              initial={false}
              animate={{ opacity: writing ? 0 : 1 }}
              transition={{ duration: time(0.25), delay: time(writing ? 0 : 0.3) }}
              className="col-start-1 row-start-1 grid grid-rows-[1fr_auto] gap-px bg-fjell-600 sm:grid-cols-2"
            >
              <a href={site.phoneHref} className={`${link} flex flex-col justify-center sm:col-span-2`}>
                <span className={label}>Ring {site.owner}</span>
                <span className="display mt-2 block text-[clamp(2rem,5.5vw,3.75rem)] leading-none whitespace-nowrap text-signal-500">
                  {site.phoneDisplay}
                </span>
              </a>
              <a href={site.smsHref} className={link}>
                <span className={label}>SMS</span>
                <span className="mt-2 block text-xl font-bold">Send en melding</span>
              </a>
              <button
                ref={emailCell}
                type="button"
                onClick={open}
                aria-expanded={writing}
                aria-controls="kontakt-skjema"
                className={`${link} cursor-pointer text-left`}
              >
                <span className={label}>E-post</span>
                <span className="mt-2 block text-xl font-bold break-all">{site.email}</span>
              </button>
            </motion.div>
            <motion.div
              id="kontakt-skjema"
              inert={!writing}
              initial={false}
              animate={{ clipPath: writing ? OPEN : shut, opacity: writing ? 1 : 0 }}
              transition={{
                clipPath: { duration: time(0.6), ease },
                opacity: { duration: time(writing ? 0.12 : 0.25), delay: time(writing ? 0 : 0.35) },
              }}
              className={`${cell} col-start-1 row-start-1`}
            >
              <motion.div
                initial={false}
                animate={{ opacity: writing ? 1 : 0, y: writing ? 0 : 12 }}
                transition={{ duration: time(writing ? 0.45 : 0.15), delay: time(writing ? 0.18 : 0), ease }}
                className="h-full"
              >
                <ContactForm key={visit} active={writing} onClose={() => setWriting(false)} />
              </motion.div>
            </motion.div>
          </div>
          <address className={`${cell} flex flex-col gap-1 text-stein-300 not-italic sm:flex-row sm:justify-between`}>
            <span className="font-bold text-stein-50">{site.name}</span>
            <span>
              {site.street}, {site.postalCode} {site.city}
            </span>
          </address>
        </div>
      </div>
    </section>
  );
}
