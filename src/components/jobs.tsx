import Image from "next/image";
import { photos, quote, site } from "@/lib/site";

/** Their own description of the work, beside photos from the jobs. */
export function Jobs() {
  const [large, ...small] = photos;

  return (
    <section className="bg-fjell-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="display text-[2rem] leading-[1.02] text-balance sm:text-5xl">Siste fra {site.name}</h2>
      </div>
      <div className="mx-auto mt-14 grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <figure className="lg:col-span-5 lg:self-center">
          <blockquote className="display text-2xl leading-[1.18] text-balance sm:text-[2rem]">
            «{quote}»
          </blockquote>
          <figcaption className="mt-7 text-stein-400">
            {site.name} på{" "}
            <a href={site.facebook} className="text-stein-50 underline underline-offset-4 hover:text-signal-500">
              Facebook
            </a>
          </figcaption>
        </figure>
        <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:col-start-7">
          <div className="relative col-span-2 aspect-[3/2] bg-fjell-800">
            <Image
              src={large.src}
              alt={large.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          {small.map((photo) => (
            <div key={photo.src} className="relative aspect-square bg-fjell-800">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
