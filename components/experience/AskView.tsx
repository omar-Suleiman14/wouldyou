"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { ExperienceData } from "@/lib/templates";
import { Experience } from "./Experience";

export function AskView({ slug, initial }: { slug: string; initial: ExperienceData | null | undefined }) {
  const live = useQuery(api.experiences.get, { slug });
  const data = live === undefined ? initial : live;

  if (data === undefined) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted" role="status">Loading…</div>;
  }

  if (data === null) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">This link doesn&apos;t exist</h1>
        <p className="prose-soft">Check the address, or ask whoever sent it. It may have been deleted.</p>
        <Link href="/" className="btn btn--primary mt-2">Make your own</Link>
      </main>
    );
  }

  return <Experience data={data} mode="live" />;
}
