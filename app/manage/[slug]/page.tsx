import type { Metadata } from "next";
import { Results } from "@/components/manage/Results";

export const metadata: Metadata = {
  title: "Results",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ManagePage({ params }: PageProps<"/manage/[slug]">) {
  const { slug } = await params;
  return <Results slug={slug} />;
}
