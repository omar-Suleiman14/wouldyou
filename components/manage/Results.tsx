"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { CalendarPlus, Check, Copy, ExternalLink } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { forgetOwnedLink, readOwnedLinks, resultsPath, saveOwnedLink } from "@/lib/ownedLinks";
import { formatPicked, timeAgo } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import { useHydrated } from "@/lib/useHydrated";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      window.prompt("Copy this:", text);
    }
  };
  return { copied, copy };
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
      <div className="prose-soft mt-3 space-y-3">{children}</div>
      <Link href="/create" className="btn btn--primary mt-8">Make a link</Link>
    </div>
  );
}

export function Results({ slug }: { slug: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { copied, copy } = useCopy();
  const remove = useMutation(api.experiences.remove);

  const hydrated = useHydrated();
  const key: string | null | undefined = hydrated
    ? new URLSearchParams(window.location.hash.slice(1)).get("key") || readOwnedLinks().find((l) => l.slug === slug)?.ownerKey || null
    : undefined;

  const res = useQuery(api.experiences.results, key ? { slug, ownerKey: key } : "skip");

  // Remember links opened from a results URL, so they show up under "Your links" on this device.
  useEffect(() => {
    if (res?.status === "ok" && key && !readOwnedLinks().some((l) => l.slug === slug)) {
      saveOwnedLink({ slug, ownerKey: key, headline: res.experience.content.headline, recipientName: res.experience.recipientName, createdAt: res.createdAt });
    }
    if (res?.status === "not_found") forgetOwnedLink(slug);
  }, [res, key, slug]);

  let body: React.ReactNode;
  if (key === undefined || (key && res === undefined)) {
    body = <p className="py-24 text-center text-sm text-muted" role="status">Loading…</p>;
  } else if (key === null) {
    body = (
      <Notice title="This page needs its private link">
        <p>Results are only shown with the full results link you got when you made this link. It ends with <code className="text-text">#key=…</code>.</p>
        <p>Open it from the browser you made the link in, or find it under Your links on that device.</p>
      </Notice>
    );
  } else if (res!.status === "not_found") {
    body = <Notice title="This link doesn't exist"><p>It may have been deleted.</p></Notice>;
  } else if (res!.status === "legacy") {
    body = (
      <Notice title="No private results for this link">
        <p>This link was made before results became private, so it has no results page. It still works for the person you sent it to.</p>
      </Notice>
    );
  } else if (res!.status === "wrong_key") {
    body = <Notice title="That results link isn't right"><p>The key in the address doesn&apos;t match this link. Check you copied the whole address.</p></Notice>;
  } else {
    const r = res!;
    const shareUrl = `${window.location.origin}/ask/${slug}`;
    const privateUrl = `${window.location.origin}${resultsPath(slug, key)}`;

    body = (
      <div className="mx-auto max-w-[760px] px-4 py-12 sm:px-6">
        <p className="eyebrow">Results</p>
        <h1 className="mt-2 text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em]" dir="auto">
          {r.experience.content.headline}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {r.experience.recipientName ? `For ${r.experience.recipientName} · ` : ""}Made {timeAgo(r.createdAt)}
        </p>

        <div className="card mt-8 flex flex-wrap items-center gap-2 p-2 ps-4">
          <span className="min-w-0 flex-1 truncate font-mono text-sm" dir="ltr">{shareUrl.replace(/^https?:\/\//, "")}</span>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => copy("share", shareUrl)}>
            {copied === "share" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied === "share" ? "Copied" : "Copy link"}
          </button>
          <a href={`/ask/${slug}`} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
            <ExternalLink className="size-4" aria-hidden /> Open
          </a>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line">
          <div className="bg-card p-4">
            <dt className="text-sm text-muted">Opened</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{r.views} {r.views === 1 ? "time" : "times"}</dd>
          </div>
          <div className="bg-card p-4">
            <dt className="text-sm text-muted">Answer</dt>
            <dd className="mt-1 text-2xl font-semibold">{r.responses.length ? "Yes" : "Not yet"}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">Opens from this browser aren&apos;t counted. This page updates on its own.</p>

        <section className="mt-10" aria-labelledby="answers">
          <h2 id="answers" className="text-lg font-semibold">Answers</h2>
          {r.responses.length === 0 ? (
            <div className="card mt-4 p-6 text-soft">
              <p className="font-medium text-text">No answer yet.</p>
              <p className="mt-1 text-sm">When they say yes, it shows up here straight away.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {r.responses.map((a) => (
                <li key={a.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-2 font-semibold text-ok">
                      <Check className="size-4" aria-hidden /> Said yes
                    </p>
                    <p className="text-sm text-muted">{timeAgo(a.createdAt)}</p>
                  </div>
                  {a.pickedDate ? (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold">{formatPicked(a.pickedDate, a.pickedTime)}</p>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => downloadIcs({ title: r.experience.recipientName ? `Date with ${r.experience.recipientName}` : "Date", date: a.pickedDate!, time: a.pickedTime })}
                      >
                        <CalendarPlus className="size-4" aria-hidden /> Add to calendar
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-soft">No date picked.</p>
                  )}
                  {a.message && (
                    <blockquote className="mt-4 border-s-2 border-accent ps-4 text-soft" dir="auto">{a.message}</blockquote>
                  )}
                  <p className="mt-4 text-sm text-muted">
                    {a.dodges === 0 ? "Didn't even try to press No." : `Tried to press No ${a.dodges} ${a.dodges === 1 ? "time" : "times"} first.`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12 border-t border-line pt-8" aria-labelledby="private">
          <h2 id="private" className="font-semibold">Keep this page private</h2>
          <p className="mt-1 text-sm text-soft">
            Anyone with this page&apos;s address can see the answers and delete the link. It&apos;s saved in this browser under Your links.
          </p>
          <button type="button" className="btn btn--secondary btn--sm mt-3" onClick={() => copy("private", privateUrl)}>
            {copied === "private" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied === "private" ? "Copied" : "Copy results link"}
          </button>
        </section>

        <section className="mt-10 border-t border-line pt-8" aria-labelledby="delete">
          <h2 id="delete" className="font-semibold">Delete this link</h2>
          <p className="mt-1 text-sm text-soft">The link stops working and every answer is removed. This can&apos;t be undone.</p>
          {confirming ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn--danger btn--sm"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await remove({ slug, ownerKey: key });
                    forgetOwnedLink(slug);
                    router.push("/create#links");
                  } catch {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Deleting…" : "Delete for good"}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(false)} disabled={deleting}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="btn btn--danger btn--sm mt-3" onClick={() => setConfirming(true)}>Delete link</button>
          )}
        </section>
      </div>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main">{body}</main>
      <SiteFooter />
    </>
  );
}
