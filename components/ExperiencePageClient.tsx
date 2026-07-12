"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { getTemplateBySlugOrId } from "../lib/templates";
import { ExperienceView } from "./ExperienceView";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ExperiencePageClientProps {
  slug: string;
}

export function ExperiencePageClient({ slug }: ExperiencePageClientProps) {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  
  // Query Convex for exact slug or template match
  const convexExperience = useQuery(api.experiences.getExperienceBySlug, {
    slug: normalizedSlug,
  });

  // If loading or not found in DB, check local prebuilt fallback so 0-config/unseeded works immediately!
  const prebuiltFallback = getTemplateBySlugOrId(normalizedSlug) || getTemplateBySlugOrId(slug);

  const activeExperience = convexExperience || prebuiltFallback;

  if (convexExperience === undefined && !prebuiltFallback) {
    // Still loading from Convex and not a standard prebuilt path
    return (
      <div suppressHydrationWarning className="min-h-screen w-full bg-[#F6F7FA] flex flex-col items-center justify-center gap-4 text-zinc-900">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-pink-600 animate-spin" />
        </div>
        <p className="text-zinc-600 font-bold tracking-wide text-sm">Loading special question...</p>
      </div>
    );
  }

  if (!activeExperience) {
    // Neither in Convex nor in prebuilt templates
    return (
      <div suppressHydrationWarning className="min-h-screen w-full bg-[#F6F7FA] flex flex-col items-center justify-center p-6 text-center text-zinc-900">
        <h1 className="text-4xl font-black mb-4">Question Not Found 💔</h1>
        <p className="text-zinc-600 max-w-md mb-8 font-normal">
          We couldn&apos;t find an experience with the URL <span className="text-pink-600 font-mono font-bold">{normalizedSlug}</span>. It might have expired or been moved.
        </p>
        <Link
          suppressHydrationWarning
          href="/"
          className="px-6 py-3.5 rounded-2xl bg-zinc-900 text-white font-bold shadow-lg flex items-center gap-2 hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Create Your Own Question</span>
        </Link>
      </div>
    );
  }

  return <ExperienceView template={activeExperience} />;
}
