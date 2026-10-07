"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { HairlineFigure, type TourPoint } from "@/components/hairline-figure";

interface FigureCardProps {
  /** The figure's file in public/hairline, without the extension. */
  figure: string;
  /** What the drawing shows, for screen readers. */
  label: string;
  /** Where the stand-in pointer goes while the card is hovered. */
  tour: readonly TourPoint[];
  /** The layer the card lies in: it sets the card's colours and the figure's palette. */
  layer: "gress" | "jord" | "fjell";
  photo?: { src: string; alt: string };
  children: ReactNode;
}

const layers = {
  gress: { card: "border-gress-600 bg-gress-900 hover:border-gress-300", line: "border-gress-500", figure: "hairline-gress text-gress-300" },
  jord: { card: "border-jord-600 bg-jord-800 hover:border-jord-300", line: "border-jord-600", figure: "hairline-jord text-jord-300" },
  fjell: { card: "border-fjell-600 bg-fjell-800 hover:border-stein-400", line: "border-fjell-600", figure: "hairline-fjell text-stein-300" },
} as const;

/** A service as a card: its drawing on a ground line, its text, and a photo. Hovering the card plays the drawing. */
export function FigureCard({ figure, label, tour, layer, photo, children }: FigureCardProps) {
  const [playing, setPlaying] = useState(false);
  const look = layers[layer];

  return (
    <article
      onPointerEnter={() => setPlaying(true)}
      onPointerLeave={() => setPlaying(false)}
      className={`flex h-full flex-col border transition-colors duration-300 ${look.card}`}
    >
      <div className={`border-b-2 px-4 pt-4 ${look.line}`}>
        <HairlineFigure
          name={figure}
          label={label}
          tour={tour}
          playing={playing}
          className={`mx-auto max-w-96 ${look.figure}`}
        />
      </div>
      <div className="flex-1 p-6">{children}</div>
      {photo && (
        <div className="relative aspect-[16/10]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </article>
  );
}
