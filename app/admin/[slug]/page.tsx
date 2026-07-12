"use client";

import React, { use } from "react";
import { ExperienceAdminClient } from "../../../components/ExperienceAdminClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AdminPage({ params }: PageProps) {
  const { slug } = use(params);
  return <ExperienceAdminClient slug={slug} />;
}
