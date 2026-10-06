"use client";

import { BlastScene } from "@/components/blast-scene";
import { blasting, digging, surface } from "@/lib/site";
import { ExcavatorPose } from "@/remotion/Excavator";

const pen = {
  fill: "none",
  stroke: "var(--color-stein-400)",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Outline of a spruce standing on the ground line (y = 200), h tall, centred on cx. */
function spruce(cx: number, h: number) {
  const top = 200 - h;
  const tiers = [0, 1, 2, 3].map((i) => ({ y: top + h * (0.3 + 0.2 * i), w: h * (0.1 + 0.055 * i) }));
  const side = (dir: 1 | -1) =>
    tiers.flatMap((tier, i) => {
      const tip = `${cx + dir * tier.w},${tier.y}`;
      return i < 3 ? [tip, `${cx + dir * tier.w * 0.45},${tier.y - h * 0.04}`] : [tip];
    });
  return `M ${cx},${top} L ${side(-1).join(" L ")} L ${side(1).reverse().join(" L ")} Z M ${cx},${tiers[3].y} V 200`;
}

// Each drawing is 300 × 200 with the ground along the bottom edge.
const art = {
  trefelling: (
    <>
      <path d={spruce(64, 176)} {...pen} />
      <path d={spruce(134, 124)} {...pen} />
      {/* One tree is already down: a stump and its log */}
      <path d="M 190 200 V 184 H 212 V 200" {...pen} />
      <rect x={226} y={183} width={64} height={15} rx={7.5} {...pen} />
      <circle cx={282.5} cy={190.5} r={3} {...pen} strokeWidth={1.5} />
    </>
  ),
  hytte: (
    <>
      <path d={spruce(38, 96)} {...pen} />
      <path d="M 86 200 V 138 H 226 V 200 M 70 142 L 156 86 L 242 142 M 194 111 V 92 H 208 V 120" {...pen} />
      <path d="M 144 200 V 160 H 168 V 200" {...pen} />
      <rect x={104} y={156} width={24} height={22} {...pen} />
      <rect x={186} y={156} width={24} height={22} {...pen} />
    </>
  ),
  eiendom: (
    <>
      <path d="M 34 200 V 118 H 168 V 200 M 22 122 L 101 74 L 180 122" {...pen} />
      <path d="M 88 200 V 158 H 114 V 200" {...pen} />
      <rect x={50} y={136} width={24} height={24} {...pen} />
      <rect x={128} y={136} width={24} height={24} {...pen} />
      <path d="M 168 152 H 246 V 200 M 182 200 V 166 H 232 V 200" {...pen} />
      <path d="M 262 200 V 178 M 276 200 V 178 M 290 200 V 178 M 256 184 H 296" {...pen} />
    </>
  ),
  utleie: (
    <g transform="translate(4 32) scale(0.24)">
      <ExcavatorPose frame={30} fill="var(--color-natt-900)" stroke="var(--color-stein-300)" heap={false} />
    </g>
  ),
};

const lead = { stroke: "var(--color-jord-300)", strokeWidth: 1.5, strokeLinecap: "round" } as const;
const note = { fontFamily: "var(--font-archivo), sans-serif", fontSize: 17, fill: "var(--color-jord-300)" };

/** A trench in section: sloped sides, the pipe at the bottom, the fill above it, the spoil beside it. */
function Trench() {
  return (
    <svg viewBox="0 0 480 360" className="h-auto w-full" aria-hidden>
      <path d="M 0 50 H 150 M 330 50 H 480" {...pen} stroke="var(--color-gress-500)" />
      <path d="M 350 50 Q 402 -4 456 50" {...pen} />
      <path d="M 150 50 L 185 320 H 295 L 330 50" {...pen} />
      <path d="M 0 168 H 150 M 346 168 H 480" {...lead} stroke="var(--color-jord-600)" strokeDasharray="3 9" />
      <path d="M 180 246 H 300" {...lead} strokeDasharray="3 8" />
      <circle cx={240} cy={292} r={22} {...pen} stroke="var(--color-stal-500)" strokeWidth={3} />
      <circle cx={240} cy={292} r={14} {...pen} stroke="var(--color-stal-500)" strokeWidth={1.5} />
      <path d="M 266 292 H 352 M 292 214 H 352" {...lead} />
      <text x={360} y={298} {...note}>
        Rør
      </text>
      <text x={360} y={220} {...note}>
        Omfylling
      </text>
    </svg>
  );
}

/** The ground itself. Each service sits at the depth where the work happens. */
export function Services() {
  return (
    <>
      {/* Surface: on wide screens the sky ends and the topsoil begins exactly at the ground line under the drawings. */}
      <section
        id="pa-bakken"
        className="bg-natt-900 pb-20 lg:bg-[linear-gradient(var(--color-natt-900)_10rem,var(--color-jord-900)_10rem)] lg:pb-24"
      >
        <h2 className="sr-only">På bakken</h2>
        <ul className="mx-auto grid max-w-7xl gap-y-14 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {surface.map((service) => (
            <li key={service.name}>
              <div className="border-b-2 border-gress-500">
                <svg viewBox="0 0 300 200" preserveAspectRatio="xMinYMax meet" className="block h-40 w-full" aria-hidden>
                  {art[service.art]}
                </svg>
              </div>
              <h3 className="display mt-7 text-2xl">{service.name}</h3>
              <p className="mt-3 max-w-64 leading-relaxed text-stein-300 lg:text-jord-300">{service.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="i-jorda" className="grain bg-jord-800">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-semibold text-jord-300">I jorda</p>
            <h2 className="display mt-3 text-[2rem] leading-none sm:text-5xl">Gravetjenester</h2>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-jord-300">
              Fra første spadetak til ferdig underlag. Vi graver ut, legger i
              grøfta og fyller igjen.
            </p>
            <dl className="mt-12 border-t border-jord-600">
              {digging.map((job) => (
                <div key={job.name} className="grid gap-1 border-b border-jord-600 py-5 sm:grid-cols-[11rem_1fr]">
                  <dt className="display text-xl">{job.name}</dt>
                  <dd className="text-jord-300">{job.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Trench />
          </div>
        </div>
      </section>

      <section id="i-fjellet" className="bg-fjell-800">
        {/* Where soil meets rock the boundary is never level. */}
        <svg viewBox="0 0 1600 60" preserveAspectRatio="none" className="block h-10 w-full bg-jord-800" aria-hidden>
          <polygon
            points="0,60 0,28 120,14 260,34 420,8 600,30 760,12 930,36 1100,10 1280,30 1440,6 1600,26 1600,60"
            fill="var(--color-fjell-800)"
          />
        </svg>
        <div className="bedding">
          <div className="mx-auto max-w-7xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-6">
                <p className="font-semibold text-stein-400">I fjellet</p>
                <h2 className="display mt-3 text-[2rem] leading-none sm:text-5xl lg:text-7xl">Sprengning</h2>
              </div>
              <p className="max-w-lg text-lg leading-relaxed text-stein-300 lg:col-span-5 lg:col-start-8">
                Vi borer, lader og sprenger fjellet som står i veien. Hullene går
                av ett og ett, så fjellet legger seg der det skal.
              </p>
            </div>
            <ul className="mt-14 grid gap-10 sm:grid-cols-3">
              {blasting.map((job) => (
                <li key={job.name} className="border-t-2 border-signal-500 pt-5">
                  <h3 className="display text-xl">{job.name}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-stein-400">{job.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <BlastScene />
      </section>
    </>
  );
}
