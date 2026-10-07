"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { site } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(1, "Skriv navnet ditt."),
  reply: z.string().trim().min(5, "Skriv et telefonnummer eller en e-postadresse."),
  message: z.string().trim().min(1, "Skriv hva som skal gjøres."),
});

type Field = keyof z.infer<typeof schema>;
type Errors = Partial<Record<Field, string>>;

const fields = [
  { name: "name", label: "Navn", autoComplete: "name" },
  { name: "reply", label: "Telefon eller e-post", autoComplete: "tel" },
] as const;

const input =
  "mt-2 block w-full border border-fjell-600 bg-fjell-950 px-4 py-3 text-lg text-stein-50 transition-colors hover:border-stein-400";
const button =
  "inline-flex h-14 items-center gap-2 px-6 text-lg font-bold";

interface ContactFormProps {
  /** Whether the form is the open view. It takes the focus when it becomes so. */
  active: boolean;
  /** Folds the form back into the contact details. */
  onClose: () => void;
}

/** The form the e-mail cell opens into. */
export function ContactForm({ active, onClose }: ContactFormProps) {
  const first = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sentBy, setSentBy] = useState<string | null>(null);

  useEffect(() => {
    if (active) first.current?.focus({ preventScroll: true });
  }, [active]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      const found: Errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field;
        found[field] ??= issue.message;
      }
      setErrors(found);
      return;
    }
    setErrors({});
    // TODO: placeholder. Nothing is sent yet: connect this to an e-mail service before the form goes live.
    setSentBy(result.data.name);
  }

  const sent = sentBy !== null;

  // The thanks lie over the form, which stays in place unseen: the box keeps the form's height.
  return (
    <div className="relative h-full">
      {sent && (
        <div role="status" className="absolute inset-0 flex flex-col items-start justify-center">
          <p className="display text-3xl sm:text-4xl">Takk, {sentBy}.</p>
          <p className="mt-4 max-w-md text-lg text-stein-300">
            {site.owner} tar kontakt så snart han kan. Haster det, ring {site.phoneDisplay}.
          </p>
          <button type="button" onClick={onClose} className={`${button} mt-8 border border-fjell-600 hover:border-stein-400`}>
            <ArrowLeft aria-hidden className="size-5" />
            Tilbake
          </button>
        </div>
      )}
      <form onSubmit={submit} noValidate inert={sent} className={sent ? "invisible" : undefined}>
        <p className="font-semibold text-stein-400">E-post</p>
        <h3 className="display mt-2 text-2xl sm:text-3xl">Skriv til {site.owner}</h3>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {fields.map((field, i) => (
            <label key={field.name} className="block font-semibold text-stein-300">
              {field.label}
              <input
                ref={i === 0 ? first : undefined}
                name={field.name}
                autoComplete={field.autoComplete}
                aria-invalid={errors[field.name] ? true : undefined}
                aria-describedby={errors[field.name] ? `kontakt-${field.name}-feil` : undefined}
                className={input}
              />
              {errors[field.name] && (
                <span id={`kontakt-${field.name}-feil`} className="mt-2 block font-bold text-signal-400">
                  {errors[field.name]}
                </span>
              )}
            </label>
          ))}
          <label className="block font-semibold text-stein-300 sm:col-span-2">
            Hva skal gjøres?
            <textarea
              name="message"
              rows={4}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "kontakt-message-feil" : undefined}
              className={`${input} resize-y`}
            />
            {errors.message && (
              <span id="kontakt-message-feil" className="mt-2 block font-bold text-signal-400">
                {errors.message}
              </span>
            )}
          </label>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="submit" className={`${button} bg-signal-500 text-fjell-950 hover:bg-signal-400`}>
            Send melding
          </button>
          <button type="button" onClick={onClose} className={`${button} px-0 underline-offset-8 hover:underline`}>
            <ArrowLeft aria-hidden className="size-5" />
            Tilbake
          </button>
        </div>
      </form>
    </div>
  );
}
