"use client";

import { Phone } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "#pa-bakken", label: "På bakken" },
  { href: "#i-jorda", label: "I jorda" },
  { href: "#i-fjellet", label: "I fjellet" },
  { href: "#kontakt", label: "Kontakt" },
];

/** Top bar. It scrolls away with the sky; the call button below takes over from there. */
export function Header() {
  return (
    <header className="bg-natt-950">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        {/* Typeset like the wordmark in the logo: wide capitals over a spaced second line. */}
        <a href="#" aria-label={site.name} className="leading-none">
          <span aria-hidden className="display block text-2xl uppercase">
            Bjønnes
          </span>
          <span
            aria-hidden
            className="mt-1 block text-xs font-semibold tracking-[0.42em] text-stal-500 uppercase"
          >
            Solutions
          </span>
        </a>
        <nav aria-label="Hovedmeny" className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-11 items-center text-stein-300 underline-offset-8 hover:text-stein-50 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={site.phoneHref}
          className="flex h-11 items-center gap-2.5 font-bold text-signal-500 hover:text-signal-400"
        >
          <Phone aria-hidden className="size-4" strokeWidth={2.5} />
          <span className="sr-only">Ring </span>
          {site.phoneDisplay}
        </a>
      </div>
    </header>
  );
}

/** Call button that stays in reach once the hero, with its own button, has scrolled away. */
export function CallButton() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShown(y > 640));

  return (
    <AnimatePresence>
      {shown && (
        <motion.a
          href={site.phoneHref}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-3 z-40 flex h-14 items-center justify-center gap-3 border-2 border-fjell-950 bg-signal-500 px-6 text-lg font-bold text-fjell-950 shadow-[0_8px_24px_rgb(0_0_0/0.45)] hover:bg-signal-400 sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
          <Phone aria-hidden className="size-5" strokeWidth={2.5} />
          Ring {site.phoneDisplay}
        </motion.a>
      )}
    </AnimatePresence>
  );
}
