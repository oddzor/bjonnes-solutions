import { faq } from "@/lib/site";

/** Four short answers, all visible. Nothing here is long enough to hide behind a click. */
export function Faq() {
  return (
    <section className="bg-fjell-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="display text-[2rem] leading-[1.02] sm:text-5xl">Greit å vite før du ringer</h2>
        <dl className="mt-14 grid gap-x-16 gap-y-12 sm:grid-cols-2">
          {faq.map((item) => (
            <div key={item.question} className="border-t border-fjell-600 pt-6">
              <dt className="text-xl font-bold">{item.question}</dt>
              <dd className="mt-3 max-w-md text-lg leading-relaxed text-stein-400">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
