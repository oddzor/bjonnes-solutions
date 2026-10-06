"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import {
  BLAST_FRAMES,
  BLAST_HEIGHT,
  BLAST_SETTLED_FRAME,
  BLAST_WIDTH,
  Blast,
} from "@/remotion/Blast";
import { FPS, colors } from "@/remotion/theme";

/**
 * The line-drawn bench blast at the bottom of the rock layer. It loops while on screen;
 * with reduced motion it rests on the frame where the round has gone off.
 */
export function BlastScene({ className }: { className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const inView = useInView(frame);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      player.current?.pause();
      player.current?.seekTo(BLAST_SETTLED_FRAME);
    } else if (inView) {
      player.current?.play();
    } else {
      player.current?.pause();
    }
  }, [inView, reduceMotion]);

  return (
    <div ref={frame} aria-hidden className={`flex justify-end overflow-hidden ${className ?? ""}`}>
      {/* Never narrower than 60rem, so on phones the view crops in on the bench instead of shrinking. */}
      <div
        className="w-full min-w-[60rem] shrink-0"
        style={{ aspectRatio: `${BLAST_WIDTH} / ${BLAST_HEIGHT}` }}
      >
        <Player
          ref={player}
          component={Blast}
          inputProps={{ background: colors.fjell800 }}
          durationInFrames={BLAST_FRAMES}
          fps={FPS}
          compositionWidth={BLAST_WIDTH}
          compositionHeight={BLAST_HEIGHT}
          loop
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
