"use client";

import { useEffect, useRef, useState } from "react";
import { loadFigure } from "@/lib/hairline";

/** A point of the figure's 400 × 320 drawing. */
export type TourPoint = readonly [x: number, y: number];

interface HairlineFigureProps {
  /** The figure's file in public/hairline, without the extension. */
  name: string;
  /** What the drawing shows, for screen readers. */
  label: string;
  /** Sets the palette through the --hairline-* variables, and the size. */
  className?: string;
  /** Where a stand-in pointer goes while `playing`, point after point, round and round. */
  tour?: readonly TourPoint[];
  /** Runs the tour. A real pointer on the drawing takes over from it. */
  playing?: boolean;
}

const TRAVEL_MS = 650;
const DWELL_MS = 950;
const ease = (t: number) => t * t * (3 - 2 * t);

/** The figure hears the pointer through pointer events on its stage, so the tour speaks to it the same way. */
function point(stage: HTMLElement, type: "pointermove" | "pointerleave", at: TourPoint = [0, 0]) {
  const box = stage.getBoundingClientRect();
  stage.dispatchEvent(
    new PointerEvent(type, {
      pointerType: "mouse",
      pointerId: 1,
      clientX: box.left + (at[0] / 400) * box.width,
      clientY: box.top + (at[1] / 320) * box.height,
    }),
  );
}

/** One Hairline figure: an isometric line drawing that answers the pointer. */
export function HairlineFigure({ name, label, className, tour, playing = false }: HairlineFigureProps) {
  const stage = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    let unmount: (() => void) | undefined;
    let cancelled = false;

    loadFigure(name)
      .then(({ kernel, figure }) => {
        if (cancelled) return;
        kernel.inject(document);
        const svg = kernel.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, host) as SVGSVGElement;
        // The figure names what is under the pointer; the page does not show it.
        const read = { textContent: null };
        const handle = figure.mount({ stage: host, svg, read }, figure.range[1]);
        setMounted(true);
        unmount = () => {
          handle.destroy();
          svg.remove();
          setMounted(false);
        };
      })
      .catch(() => {
        // The drawing is decoration: without it the section still says everything in text.
      });

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [name]);

  // The tour: the stand-in pointer travels to each point in turn and rests there a moment.
  useEffect(() => {
    const host = stage.current;
    if (!host || !mounted || !playing || held || !tour?.length) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leg = TRAVEL_MS + DWELL_MS;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const from = tour[Math.floor(elapsed / leg) % tour.length];
      const to = tour[(Math.floor(elapsed / leg) + 1) % tour.length];
      // The first point is taken at once; after that each leg rests, then travels.
      const t = ease(Math.max(0, Math.min(1, ((elapsed % leg) - DWELL_MS) / TRAVEL_MS)));
      point(host, "pointermove", [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
      if (!still) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      point(host, "pointerleave");
    };
  }, [mounted, playing, held, tour]);

  return (
    <div className={className}>
      <div
        ref={stage}
        data-hairline={name}
        role="img"
        aria-label={label}
        // Only a real pointer enters and leaves; the tour's own events are moves.
        onPointerEnter={(event) => event.isTrusted && setHeld(true)}
        onPointerLeave={(event) => event.isTrusted && setHeld(false)}
      />
    </div>
  );
}
