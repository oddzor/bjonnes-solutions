import { site } from "@/lib/site";

export function Footer() {
  return (
    // Extra room at the bottom on phones, where the call button sits over the page.
    <footer className="bg-fjell-950 pt-8 pb-24 text-sm text-stein-400 sm:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 sm:flex-row sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <a href={site.facebook} className="underline underline-offset-4 hover:text-stein-50">
          Følg oss på Facebook
        </a>
      </div>
    </footer>
  );
}
