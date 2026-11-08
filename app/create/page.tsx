import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteChrome";
import { Editor } from "@/components/editor/Editor";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Make a link",
  description: "Write your question, pick the colours, and get a link to send.",
};

export default async function CreatePage({ searchParams }: PageProps<"/create">) {
  const { template, lang } = await searchParams;
  const initialTemplate = typeof template === "string" && TEMPLATES.some((t) => t.id === template) ? template : undefined;
  return (
    <>
      <SiteHeader cta={false} />
      <main id="main">
        <Editor initialTemplate={initialTemplate} initialLang={lang === "ar" ? "ar" : "en"} />
      </main>
    </>
  );
}
