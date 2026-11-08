"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Check, Copy, ExternalLink, Eye, Share2, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Experience, type Screen } from "@/components/experience/Experience";
import {
  DEFAULT_TAUNTS, EFFECTS, PALETTES, TEMPLATES, getPalette, getTemplate,
  type Content, type Effect, type ExperienceData, type Lang,
} from "@/lib/templates";
import { LIMITS, checkSlug, normalizeSlug } from "@/lib/limits";
import { newOwnerKey, resultsPath, saveOwnedLink } from "@/lib/ownedLinks";
import { Section, Segmented, TextField, Toggle } from "./fields";
import { YourLinks } from "./YourLinks";
import { useHydrated } from "@/lib/useHydrated";

interface Draft {
  templateId: string;
  lang: Lang;
  recipientName: string;
  senderName: string;
  content: Required<Omit<Content, "noBtnOptions">>;
  taunts: string;
  paletteId: string;
  effect: Effect;
  enableDatePicker: boolean;
  slug: string;
}

const DRAFT_KEY = "wouldu:draft";

function fromTemplate(templateId: string, lang: Lang, keep?: Partial<Draft>): Draft {
  const tpl = getTemplate(templateId);
  const c = tpl.content[lang];
  return {
    templateId: tpl.id,
    lang,
    recipientName: keep?.recipientName ?? "",
    senderName: keep?.senderName ?? "",
    content: {
      headline: c.headline,
      subtext: c.subtext ?? "",
      yesBtnText: c.yesBtnText,
      noBtnText: c.noBtnText,
      postYesHeadline: c.postYesHeadline,
      postYesSubtext: c.postYesSubtext ?? "",
      handwrittenMessage: c.handwrittenMessage ?? "",
    },
    taunts: DEFAULT_TAUNTS[lang].join("\n"),
    paletteId: tpl.paletteId,
    effect: tpl.effect,
    enableDatePicker: keep?.enableDatePicker ?? true,
    slug: keep?.slug ?? "",
  };
}

function isUntouched(d: Draft) {
  const fresh = fromTemplate(d.templateId, d.lang);
  return JSON.stringify(fresh.content) === JSON.stringify(d.content) && fresh.taunts === d.taunts;
}

function toExperience(d: Draft): ExperienceData {
  return {
    slug: "preview",
    templateId: d.templateId,
    recipientName: d.recipientName.trim() || undefined,
    senderName: d.senderName.trim() || undefined,
    colors: getPalette(d.paletteId).colors,
    content: {
      ...d.content,
      noBtnOptions: d.taunts.split("\n").map((t) => t.trim()).filter(Boolean),
    },
    visualPersonality: d.effect,
    enableDatePicker: d.enableDatePicker,
    isRtl: d.lang === "ar",
  };
}

const SLUG_PROBLEMS = {
  short: `At least ${LIMITS.slugMin} characters.`,
  long: `At most ${LIMITS.slugMax} characters.`,
  format: "Letters, numbers and dashes only.",
  reserved: "That name is reserved. Try another.",
} as const;

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

type EditorProps = { initialTemplate?: string; initialLang?: Lang };

/** Restores an unfinished draft, unless the visitor came here from a specific example. */
function initialDraft({ initialTemplate, initialLang }: EditorProps): Draft {
  if (!initialTemplate) {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      if (saved && typeof saved === "object" && saved.content) {
        return { ...fromTemplate(saved.templateId, saved.lang === "ar" ? "ar" : "en"), ...saved };
      }
    } catch {}
  }
  return fromTemplate(initialTemplate ?? TEMPLATES[0].id, initialLang ?? "en");
}

// The form depends on localStorage, so it renders only after hydration.
export function Editor(props: EditorProps) {
  const hydrated = useHydrated();
  if (!hydrated) return <p className="py-24 text-center text-sm text-muted" role="status">Loading…</p>;
  return <EditorForm {...props} />;
}

function EditorForm(props: EditorProps) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft(props));
  const [screen, setScreen] = useState<Screen>("question");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<{ slug: string; ownerKey: string } | null>(null);
  const [linksVersion, setLinksVersion] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = window.location.origin;

  const create = useMutation(api.experiences.create);

  useEffect(() => {
    if (made) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, made]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setContent = (key: keyof Draft["content"], value: string) => setDraft((d) => ({ ...d, content: { ...d.content, [key]: value } }));

  const chooseTemplate = (id: string) => {
    if (id === draft.templateId) return;
    if (!isUntouched(draft) && !window.confirm("Replace your text and colours with this example?")) return;
    setDraft((d) => fromTemplate(id, d.lang, d));
    setScreen("question");
  };

  const chooseLang = (lang: Lang) => {
    if (lang === draft.lang) return;
    setDraft((d) => (isUntouched(d) ? fromTemplate(d.templateId, lang, d) : { ...d, lang }));
  };

  const slug = normalizeSlug(draft.slug);
  const slugProblem = slug ? checkSlug(slug) : null;
  const debouncedSlug = useDebounced(slug, 350);
  const available = useQuery(api.experiences.isSlugAvailable, debouncedSlug && !checkSlug(debouncedSlug) ? { slug: debouncedSlug } : "skip");
  const slugStatus = !slug ? null : slugProblem ? SLUG_PROBLEMS[slugProblem] : debouncedSlug !== slug || available === undefined ? "Checking…" : available ? "Available" : "Taken. Try another.";

  const preview = useMemo(() => toExperience(draft), [draft]);
  const dir = draft.lang === "ar" ? "rtl" : "ltr";
  const missing = !draft.content.headline.trim() || !draft.content.yesBtnText.trim() || !draft.content.noBtnText.trim() || !draft.content.postYesHeadline.trim();

  const submit = async () => {
    if (missing) {
      setError("Fill in the question, both buttons and the after-yes headline.");
      return;
    }
    if (slug && (slugProblem || available === false)) {
      setError("Pick a different link name, or leave it empty.");
      return;
    }
    setBusy(true);
    setError(null);
    const ownerKey = newOwnerKey();
    const data = toExperience(draft);
    try {
      const res = await create({
        templateId: data.templateId,
        slug: slug || undefined,
        ownerKey,
        recipientName: data.recipientName,
        senderName: data.senderName,
        colors: data.colors,
        content: data.content,
        visualPersonality: data.visualPersonality,
        enableDatePicker: data.enableDatePicker,
        isRtl: data.isRtl,
      });
      saveOwnedLink({ slug: res.slug, ownerKey, headline: data.content.headline, recipientName: data.recipientName, createdAt: Date.now() });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setMade({ slug: res.slug, ownerKey });
      setLinksVersion((v) => v + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof ConvexError ? String(err.data) : "Couldn't make the link. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      window.prompt("Copy this:", text);
    }
  };

  const startOver = () => {
    setMade(null);
    setDraft((d) => fromTemplate(d.templateId, d.lang));
    setScreen("question");
  };

  const screens: { id: Screen; label: string }[] = [
    { id: "question", label: "Question" },
    ...(draft.enableDatePicker ? [{ id: "details" as Screen, label: "Pick a day" }] : []),
    { id: "done", label: "After yes" },
  ];
  const activeScreen = screens.some((s) => s.id === screen) ? screen : "question";

  const previewPane = (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Segmented label="Preview screen" value={activeScreen} options={screens} onChange={setScreen} />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[16px] border border-line-strong">
        <Experience data={preview} mode="preview" embedded screen={activeScreen} />
      </div>
    </div>
  );

  const shareUrl = made ? `${origin}/ask/${made.slug}` : "";
  const privateUrl = made ? `${origin}${resultsPath(made.slug, made.ownerKey)}` : "";

  return (
    <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-12">
      <div className="min-w-0">
        {made ? (
          <div className="space-y-8">
            <div>
              <p className="eyebrow">Done</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Your link is ready</h1>
              <p className="prose-soft mt-2">Send it to them however you like.</p>
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-semibold">Their link</p>
              <div className="card flex items-center gap-2 p-2 ps-4">
                <span className="min-w-0 flex-1 truncate font-mono text-sm" dir="ltr">{shareUrl.replace(/^https?:\/\//, "")}</span>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => copy("share", shareUrl)}>
                  {copied === "share" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  {copied === "share" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {"share" in navigator && (
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => navigator.share({ url: shareUrl }).catch(() => {})}>
                    <Share2 className="size-4" aria-hidden /> Share
                  </button>
                )}
                <a href={`/ask/${made.slug}`} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                  <ExternalLink className="size-4" aria-hidden /> Open it
                </a>
              </div>
            </div>

            <div className="rounded-[14px] border border-line bg-accent-soft p-4">
              <p className="text-sm font-semibold">Your private results link</p>
              <p className="mt-1 text-sm text-soft">
                This is the only way to see their answer. It&apos;s saved in this browser under Your links, but copy it somewhere safe too. Don&apos;t send it to them.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => copy("private", privateUrl)}>
                  {copied === "private" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  {copied === "private" ? "Copied" : "Copy results link"}
                </button>
                <Link href={resultsPath(made.slug, made.ownerKey)} className="btn btn--ghost btn--sm">Open results</Link>
              </div>
            </div>

            <button type="button" className="btn btn--secondary" onClick={startOver}>Make another</button>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.03em]">Make a link</h1>
              <p className="prose-soft mt-2 text-[15px]">Everything is optional except the question and the buttons. Your draft is saved in this browser as you type.</p>
            </div>

            <Section title="Start from">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Example">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={draft.templateId === t.id}
                    onClick={() => chooseTemplate(t.id)}
                    className="btn btn--sm border-line-strong bg-card aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg"
                  >
                    {t.name[draft.lang]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">Language</span>
                <Segmented
                  label="Language"
                  value={draft.lang}
                  onChange={chooseLang}
                  options={[{ id: "en", label: "English" }, { id: "ar", label: "العربية", lang: "ar" }]}
                />
              </div>
              <p className="field-hint -mt-2">Arabic links read right to left, and their buttons and labels are in Arabic too.</p>
            </Section>

            <Section title="Who it's for" hint="Shown at the top of their page. Leave empty to skip.">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Their name" value={draft.recipientName} onChange={(v) => set("recipientName", v)} max={LIMITS.name} dir={dir} />
                <TextField label="Your name" value={draft.senderName} onChange={(v) => set("senderName", v)} max={LIMITS.name} dir={dir} />
              </div>
            </Section>

            <Section title="The question">
              <TextField label="Question" value={draft.content.headline} onChange={(v) => setContent("headline", v)} max={LIMITS.headline} dir={dir} required />
              <TextField label="A line under it" value={draft.content.subtext} onChange={(v) => setContent("subtext", v)} max={LIMITS.subtext} multiline rows={2} dir={dir} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Yes button" value={draft.content.yesBtnText} onChange={(v) => setContent("yesBtnText", v)} max={LIMITS.button} dir={dir} required />
                <TextField label="No button" value={draft.content.noBtnText} onChange={(v) => setContent("noBtnText", v)} max={LIMITS.button} dir={dir} required />
              </div>
              <TextField
                label="What No says as it runs"
                hint={`One per line, up to ${LIMITS.taunts}.`}
                value={draft.taunts}
                onChange={(v) => set("taunts", v.split("\n").slice(0, LIMITS.taunts).map((l) => l.slice(0, LIMITS.taunt)).join("\n"))}
                max={LIMITS.taunts * (LIMITS.taunt + 1)}
                multiline
                rows={4}
                dir={dir}
              />
            </Section>

            <Section title="After they say yes">
              <Toggle
                label="Ask them to pick a day"
                hint="They choose a day and time, and can leave you a note."
                checked={draft.enableDatePicker}
                onChange={(v) => set("enableDatePicker", v)}
              />
              <TextField label="Headline" value={draft.content.postYesHeadline} onChange={(v) => setContent("postYesHeadline", v)} max={LIMITS.postHeadline} dir={dir} required />
              <TextField label="Message" value={draft.content.postYesSubtext} onChange={(v) => setContent("postYesSubtext", v)} max={LIMITS.postSubtext} multiline rows={2} dir={dir} />
              <TextField label="Handwritten note" hint="Shown on a little card, signed with your name." value={draft.content.handwrittenMessage} onChange={(v) => setContent("handwrittenMessage", v)} max={LIMITS.note} dir={dir} />
            </Section>

            <Section title="Look">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Colours">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={draft.paletteId === p.id}
                    onClick={() => set("paletteId", p.id)}
                    className="flex min-h-11 items-center gap-2 rounded-[10px] border border-line-strong bg-card px-3 text-sm aria-pressed:border-text aria-pressed:ring-1 aria-pressed:ring-text"
                  >
                    <span className="flex -space-x-1" aria-hidden>
                      {[p.colors.background, p.colors.primary, p.colors.secondary].map((c, i) => (
                        <span key={i} className="size-4 rounded-full border border-black/10" style={{ background: c }} />
                      ))}
                    </span>
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">Background</span>
                <Segmented
                  label="Background"
                  value={draft.effect === "roses" || draft.effect === "none" ? draft.effect : "stars"}
                  options={EFFECTS}
                  onChange={(v) => set("effect", v)}
                />
              </div>
            </Section>

            <Section title="Link name" hint="Optional. Leave empty and we'll make one up.">
              <div className="field">
                <label htmlFor="slug" className="sr-only">Link name</label>
                <div className="flex items-center rounded-[10px] border border-line-strong bg-card focus-within:border-accent" dir="ltr">
                  <span className="ps-3 text-sm text-muted">/ask/</span>
                  <input
                    id="slug"
                    className="min-h-11 w-full min-w-0 bg-transparent py-2 pe-3 text-[15px] outline-none"
                    value={draft.slug}
                    maxLength={LIMITS.slugMax + 10}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="dinner-friday"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-describedby="slug-status"
                  />
                </div>
                <p id="slug-status" className={`field-hint ${slugStatus === "Available" ? "text-ok" : ""}`} aria-live="polite">
                  {slug && slug !== draft.slug.trim() ? `Will be /ask/${slug}. ` : ""}
                  {slugStatus}
                </p>
              </div>
            </Section>

            {error && <p className="rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">{error}</p>}

            <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
              <button type="button" className="btn btn--secondary lg:hidden" onClick={() => setMobilePreview(true)}>
                <Eye className="size-4" aria-hidden /> Preview
              </button>
              <button type="submit" className="btn btn--accent flex-1 lg:flex-none lg:px-8" disabled={busy}>
                {busy ? "Making your link…" : "Make the link"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-12">
          <YourLinks refreshKey={linksVersion} />
        </div>
      </div>

      <aside className="hidden lg:block" aria-label="Preview">
        <div className="sticky top-[72px] h-[calc(100dvh-96px)] min-h-[560px]">{previewPane}</div>
      </aside>

      {mobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg p-3 lg:hidden" role="dialog" aria-modal="true" aria-label="Preview">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Preview</p>
            <button type="button" className="btn btn--ghost btn--icon" onClick={() => setMobilePreview(false)} aria-label="Close preview">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1">{previewPane}</div>
        </div>
      )}
    </div>
  );
}
