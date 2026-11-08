"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { forgetOwnedLink, readOwnedLinks, resultsPath, type OwnedLink } from "@/lib/ownedLinks";
import { timeAgo } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";

// refreshKey re-renders the list after the parent saves a new link.
export function YourLinks({ refreshKey }: { refreshKey: number }) {
  const hydrated = useHydrated();
  const [, setVersion] = useState(0);
  const links: OwnedLink[] | null = hydrated && refreshKey >= 0 ? readOwnedLinks() : null;
  const [copied, setCopied] = useState<string | null>(null);

  if (!links) return null;

  return (
    <section id="links" className="scroll-mt-20 border-t border-line pt-8">
      <h2 className="text-lg font-semibold">Your links</h2>
      <p className="field-hint mt-1">Saved in this browser only. Clearing your browsing data removes this list, not the links.</p>
      {links.length === 0 ? (
        <p className="mt-4 text-sm text-soft">Links you make will show up here.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-[14px] border border-line bg-card">
          {links.map((l) => (
            <li key={l.slug} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" dir="auto">{l.headline}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {l.recipientName ? `For ${l.recipientName} · ` : ""}{timeAgo(l.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`${window.location.origin}/ask/${l.slug}`);
                      setCopied(l.slug);
                      setTimeout(() => setCopied(null), 2000);
                    } catch {}
                  }}
                >
                  {copied === l.slug ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  <span className="sr-only sm:not-sr-only">{copied === l.slug ? "Copied" : "Copy link"}</span>
                </button>
                <Link href={resultsPath(l.slug, l.ownerKey)} className="btn btn--secondary btn--sm">Results</Link>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm text-muted"
                  onClick={() => {
                    if (!window.confirm("Remove this from the list? The link keeps working, but you'll need its results link to see answers.")) return;
                    forgetOwnedLink(l.slug);
                    setVersion((v) => v + 1);
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
