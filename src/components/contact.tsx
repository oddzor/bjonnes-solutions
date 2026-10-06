import Image from "next/image";
import { site } from "@/lib/site";

const cell = "bg-signal-500 p-6 sm:p-9";
const link = `${cell} transition-colors hover:bg-signal-400`;

/** Contact details set as the title block of a drawing: one ruled box, one fact per cell. */
export function Contact() {
  return (
    <section id="kontakt" className="bg-signal-500 py-24 text-fjell-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="display max-w-4xl text-[2rem] leading-[1.02] text-balance sm:text-5xl">
          Fortell hva som skal gjøres, så tar vi det derfra.
        </h2>
        {/* The gaps between cells show the box's dark background, which draws the ruling. */}
        <div className="mt-14 grid gap-0.5 border-2 border-fjell-950 bg-fjell-950 lg:grid-cols-3">
          <a href={site.phoneHref} className={`${link} lg:col-span-2`}>
            <span className="block font-semibold">Ring {site.owner}</span>
            <span className="display mt-3 block text-[clamp(2.5rem,8vw,6rem)] leading-none whitespace-nowrap">
              {site.phoneDisplay}
            </span>
          </a>
          <div className="flex items-center justify-center bg-white p-6 lg:row-span-2">
            <Image
              src="/logo/logo.png"
              alt="Logoen til Bjønnes Solutions: en bjørn med hatt over en gravemaskin og en pigghammer foran fjell"
              width={1080}
              height={740}
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="h-auto w-full max-w-sm"
            />
          </div>
          <a href={site.smsHref} className={link}>
            <span className="block font-semibold">SMS</span>
            <span className="mt-2 block text-xl font-bold">Send en melding</span>
          </a>
          <a href={`mailto:${site.email}`} className={link}>
            <span className="block font-semibold">E-post</span>
            <span className="mt-2 block text-xl font-bold break-all">{site.email}</span>
          </a>
          <address className={`${cell} flex flex-col gap-1 not-italic sm:flex-row sm:justify-between lg:col-span-3`}>
            <span className="font-bold">{site.name}</span>
            <span>
              {site.street}, {site.postalCode} {site.city}
            </span>
          </address>
        </div>
      </div>
    </section>
  );
}
