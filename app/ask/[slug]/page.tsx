import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CONVEX_URL } from "@/lib/config";
import { AskView } from "@/components/experience/AskView";

async function load(slug: string) {
  try {
    return await fetchQuery(api.experiences.get, { slug }, { url: CONVEX_URL });
  } catch {
    return undefined; // Backend unreachable: let the client try.
  }
}

// Link previews never give the question away, only who it's from.
export async function generateMetadata({ params }: PageProps<"/ask/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const exp = await load(slug);
  const ar = exp?.isRtl;
  const title = exp?.senderName
    ? ar ? `سؤال ليك من ${exp.senderName}` : `${exp.senderName} has a question for you`
    : ar ? "عندك سؤال" : "You have a question";
  const description = ar ? "افتح الرابط عشان تجاوب." : "Open it to answer.";
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description },
  };
}

export default async function AskPage({ params }: PageProps<"/ask/[slug]">) {
  const { slug } = await params;
  return <AskView slug={slug} initial={await load(slug)} />;
}
