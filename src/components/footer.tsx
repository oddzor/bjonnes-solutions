import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    // Extra room at the bottom on phones, where the call button sits over the page.
    <footer className="bg-fjell-950 pt-8 pb-24 text-sm text-stein-400 sm:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo accent="var(--color-stal-500)" className="h-8 w-auto self-start text-stein-50 sm:self-auto" />
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
