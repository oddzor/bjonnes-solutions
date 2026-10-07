import Image from "next/image";
import { FigureCard } from "@/components/figure-card";
import type { TourPoint } from "@/components/hairline-figure";
import { blasting, digging, surface } from "@/lib/site";

// Each drawing by its file in public/hairline: what it shows, for screen readers, and where the
// stand-in pointer goes while its card is hovered, as points of the figure's 400 × 320 drawing.
const figures = {
  felling: {
    label: "Strektegning av tre graner på en rydning. Treet du peker på felles.",
    tour: [[191, 96], [154, 131], [158, 212]],
  },
  hytte: {
    label: "Strektegning av ei hytte med gran ved siden av. Døra og lukene åpner seg når du peker på dem.",
    tour: [[186, 190], [251, 197], [270, 188]],
  },
  hekk: {
    label: "Strektegning av et hus med hekk langs to sider. Hekken klippes ned der du peker.",
    tour: [[274, 189], [204, 225], [138, 192]],
  },
  utleie: {
    label: "Strektegning av en vibroplate, en dumper og en minigraver på rekke. Maskinen du peker på kjører fram.",
    tour: [[271, 165], [217, 138], [163, 111]],
  },
  graver: {
    label: "Strektegning av en minigraver. Armen følger pekeren og setter skuffa der du peker.",
    tour: [[310, 218], [200, 248], [90, 218], [200, 248]],
  },
  grofta: {
    label: "Strektegning av ei grøft i snitt: rør, omfylling, masser og matjord. Laget du peker på trekkes ut.",
    tour: [[230, 197], [230, 185], [230, 170], [230, 153]],
  },
  salve: {
    label:
      "Strektegning av en pall i fjellet som sprenges: hull for hull brytes fjellet og kastes fram. Hullet du peker på går av med en gang.",
    tour: [[155, 126], [191, 141], [236, 214]],
  },
} satisfies Record<string, { label: string; tour: TourPoint[] }>;

const caption = "display text-xl";

/** The ground itself. Each service sits at the depth where the work happens. */
export function Services() {
  return (
    <>
      {/* The top border is the ground line: grass where the surface meets the sky. */}
      <section id="pa-bakken" className="border-t-4 border-gress-500 bg-gress-800">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="font-semibold text-gress-300">På bakken</p>
          <h2 className="display mt-3 text-[2rem] leading-none sm:text-5xl">Skog, hytte og eiendom</h2>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-gress-300">
            Alt som skjer over bakken. Vi feller, rydder og holder ved like, og
            leier ut maskinene når du vil gjøre jobben selv.
          </p>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {surface.map((service) => (
              <li key={service.name}>
                <FigureCard figure={service.art} layer="gress" photo={service.photo} {...figures[service.art]}>
                  <h3 className="display text-2xl">{service.name}</h3>
                  <p className="mt-3 leading-relaxed text-gress-300">{service.text}</p>
                </FigureCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="i-jorda" className="grain bg-jord-800">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-12">
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
            <div className="relative aspect-[4/3] bg-jord-900 lg:col-span-5 lg:col-start-8">
              <Image
                src="/images/grofta.jpg"
                alt="Minigraver som graver ei grøft langs en betongkant på en byggeplass"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <ul className="mt-16 grid gap-5 sm:grid-cols-2">
            <li>
              <FigureCard figure="graver" layer="jord" {...figures.graver}>
                <h3 className={caption}>Graving</h3>
                <p className="mt-2 text-jord-300">Maskinen når dit du trenger det, også der det er trangt.</p>
              </FigureCard>
            </li>
            <li>
              <FigureCard figure="grofta" layer="jord" {...figures.grofta}>
                <h3 className={caption}>Grøfta i snitt</h3>
                <p className="mt-2 text-jord-300">Rør nederst, så omfylling, masser og matjord på topp.</p>
              </FigureCard>
            </li>
          </ul>
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
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6">
                <p className="font-semibold text-stein-400">I fjellet</p>
                <h2 className="display mt-3 text-[2rem] leading-none sm:text-5xl lg:text-7xl">Sprengning</h2>
                <p className="mt-7 max-w-lg text-lg leading-relaxed text-stein-300">
                  Vi borer, lader og sprenger fjellet som står i veien. Hullene går
                  av ett og ett, så fjellet legger seg der det skal.
                </p>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <FigureCard figure="salve" layer="fjell" {...figures.salve}>
                  <h3 className={caption}>Salva</h3>
                  <p className="mt-2 text-stein-400">Hull for hull, med noen millisekunder mellom hvert.</p>
                </FigureCard>
              </div>
            </div>
            <ul className="mt-14 grid gap-10 sm:grid-cols-3">
              {blasting.map((job) => (
                <li key={job.name} className="border-t-2 border-signal-500 pt-5">
                  <h3 className="display text-xl">{job.name}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-stein-400">{job.text}</p>
                </li>
              ))}
            </ul>
            <div className="relative mt-16 aspect-[16/9] bg-fjell-900 sm:aspect-[21/9]">
              <Image
                src="/images/fjell.jpg"
                alt="Hjullaster foran en høy, sprengt fjellvegg i et steinbrudd"
                fill
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
