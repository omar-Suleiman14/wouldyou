import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Page not found</h1>
        <p className="prose-soft">The address may be mistyped, or the page has moved.</p>
        <Link href="/" className="btn btn--primary mt-2">Go home</Link>
      </main>
    </>
  );
}
