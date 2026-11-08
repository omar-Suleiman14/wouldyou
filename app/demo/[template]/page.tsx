import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES, templateExperience } from "@/lib/templates";
import { Experience } from "@/components/experience/Experience";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ template: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/demo/[template]">): Promise<Metadata> {
  const { template } = await params;
  const tpl = TEMPLATES.find((t) => t.id === template);
  return tpl ? { title: `${tpl.name.en} example` } : {};
}

export default async function DemoPage({ params, searchParams }: PageProps<"/demo/[template]">) {
  const { template } = await params;
  const { lang } = await searchParams;
  const tpl = TEMPLATES.find((t) => t.id === template);
  if (!tpl) notFound();
  const ar = lang === "ar";

  return (
    <div className="relative">
      <Experience data={templateExperience(tpl, ar ? "ar" : "en")} mode="preview" />
      <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-lg items-center justify-between gap-2 rounded-2xl border border-line bg-card/95 p-2 ps-4 text-sm shadow-lg backdrop-blur">
        <span className="min-w-0 truncate text-soft">Example: {tpl.name.en}</span>
        <div className="flex shrink-0 items-center gap-1">
          <Link href={ar ? `/demo/${tpl.id}` : `/demo/${tpl.id}?lang=ar`} className="btn btn--ghost btn--sm" lang={ar ? "en" : "ar"}>
            {ar ? "English" : "العربية"}
          </Link>
          <Link href={`/create?template=${tpl.id}${ar ? "&lang=ar" : ""}`} className="btn btn--primary btn--sm">Use this</Link>
        </div>
      </div>
    </div>
  );
}
