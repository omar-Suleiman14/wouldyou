import Link from "next/link";
import { Logo } from "./Logo";
import { REPO_URL } from "@/lib/config";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <nav className="mx-auto flex max-w-[1120px] items-center gap-6 px-4 py-2.5 sm:px-6" aria-label="Main">
        <Link href="/" className="shrink-0" aria-label="wouldu home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-5 text-sm text-soft md:flex">
          <Link href="/#how" className="hover:text-accent">How it works</Link>
          <Link href="/#examples" className="hover:text-accent">Examples</Link>
          <Link href="/#faq" className="hover:text-accent">FAQ</Link>
          <a href={REPO_URL} className="hover:text-accent" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        {cta && (
          <Link href="/create" className="btn btn--primary btn--sm ms-auto">
            Make a link
          </Link>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 py-10 text-sm text-soft sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-xs space-y-2">
          <Logo />
          <p>A link that asks the question for you. Free, no sign-up, in English and Arabic.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          <Link href="/create" className="hover:text-accent">Make a link</Link>
          <Link href="/create#links" className="hover:text-accent">Your links</Link>
          <Link href="/demo/date" className="hover:text-accent">Demo</Link>
          <Link href="/#faq" className="hover:text-accent">FAQ</Link>
          <a href={REPO_URL} className="hover:text-accent" target="_blank" rel="noreferrer">Source code</a>
        </nav>
      </div>
      <p className="mx-auto max-w-[1120px] px-4 pb-8 text-xs text-muted sm:px-6">© 2026 khomod</p>
    </footer>
  );
}
