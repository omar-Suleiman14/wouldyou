"use client";

import React, { use } from "react";
import { ExperiencePageClient } from "../../components/ExperiencePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ExperienceDirectPage({ params }: PageProps) {
  const { slug } = use(params);
  return <ExperiencePageClient slug={`/${slug}`} />;
}
