"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import confetti from "canvas-confetti";
import { CalendarPlus, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DEFAULT_TAUNTS, type ExperienceData } from "@/lib/templates";
import { EXPERIENCE_COPY, langOf } from "@/lib/experienceCopy";
import { formatPicked } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";
import { ownsLink } from "@/lib/ownedLinks";
import { useHydrated } from "@/lib/useHydrated";
import { Backdrop } from "./Backdrop";
import { DatePicker } from "./DatePicker";

export type Screen = "question" | "details" | "done";

interface Props {
  data: ExperienceData;
  /** "live" saves the answer; "preview" never writes anything. */
  mode: "live" | "preview";
  /** Fill the parent box instead of the viewport (editor preview, landing demo). */
  embedded?: boolean;
  /** Lets the editor jump between screens. */
  screen?: Screen;
}

const EDGE = 12;

export function Experience({ data, mode, embedded = false, screen: forcedScreen }: Props) {
  const lang = langOf(data.isRtl);
  const t = EXPERIENCE_COPY[lang];
  const { content, colors } = data;
  const taunts = content.noBtnOptions?.filter(Boolean).length ? content.noBtnOptions.filter(Boolean) : DEFAULT_TAUNTS[lang];

  const [screen, setScreen] = useState<Screen>(forcedScreen ?? "question");
  const [dodges, setDodges] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ date: string; time?: string } | null>(null);
  const hydrated = useHydrated();
  const [mutedChoice, setMuted] = useState<boolean | null>(null);
  const muted = mutedChoice ?? (hydrated ? sound.muted : false);

  const stageRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const cooling = useRef(false);
  const viewed = useRef(false);

  const respond = useMutation(api.experiences.respond);
  const recordView = useMutation(api.experiences.recordView);

  // Follow the editor's screen tabs (state adjusted during render, not in an effect).
  const [lastForced, setLastForced] = useState(forcedScreen);
  if (forcedScreen !== lastForced) {
    setLastForced(forcedScreen);
    if (forcedScreen) setScreen(forcedScreen);
  }

  // Count a view once, and not when the creator opens their own link.
  useEffect(() => {
    if (mode !== "live" || viewed.current || ownsLink(data.slug)) return;
    viewed.current = true;
    recordView({ slug: data.slug }).catch(() => {});
  }, [mode, data.slug, recordView]);

  const resetNo = useCallback(() => {
    offset.current = { x: 0, y: 0 };
    if (noRef.current) noRef.current.style.transform = "";
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resetNo);
    return () => window.removeEventListener("resize", resetNo);
  }, [resetNo]);

  /** Moves the No button somewhere inside the stage, away from the pointer and the Yes button. */
  const escape = useCallback((pointer?: { x: number; y: number }) => {
    const stage = stageRef.current?.getBoundingClientRect();
    const btn = noRef.current;
    if (!stage || !btn || cooling.current) return;
    cooling.current = true;
    setTimeout(() => (cooling.current = false), 220);

    const rect = btn.getBoundingClientRect();
    const rest = { left: rect.left - offset.current.x, top: rect.top - offset.current.y };
    const minX = stage.left + EDGE - rest.left;
    const maxX = stage.right - EDGE - rect.width - rest.left;
    const minY = stage.top + EDGE - rest.top;
    const maxY = stage.bottom - EDGE - rect.height - rest.top;
    const from = pointer ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const yes = yesRef.current?.getBoundingClientRect();

    let best = { x: offset.current.x, y: offset.current.y, score: -1 };
    for (let i = 0; i < 24; i++) {
      const x = minX + Math.random() * Math.max(0, maxX - minX);
      const y = minY + Math.random() * Math.max(0, maxY - minY);
      const cx = rest.left + x + rect.width / 2;
      const cy = rest.top + y + rect.height / 2;
      const overlapsYes =
        yes &&
        cx + rect.width / 2 > yes.left - 8 && cx - rect.width / 2 < yes.right + 8 &&
        cy + rect.height / 2 > yes.top - 8 && cy - rect.height / 2 < yes.bottom + 8;
      if (overlapsYes) continue;
      const score = Math.hypot(cx - from.x, cy - from.y);
      if (score > best.score) best = { x, y, score };
      if (score > 220) break;
    }

    offset.current = { x: best.x, y: best.y };
    btn.style.transform = `translate3d(${best.x}px, ${best.y}px, 0)`;
    setDodges((n) => n + 1);
    sound.escape();
    haptic("escape");
  }, []);

  const onStagePointerMove = (e: React.PointerEvent) => {
    if (screen !== "question" || e.pointerType === "touch" || !noRef.current) return;
    const r = noRef.current.getBoundingClientRect();
    const reach = Math.max(70, r.width * 0.7);
    if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < reach) {
      escape({ x: e.clientX, y: e.clientY });
    }
  };

  const celebrate = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const palette = [colors.primary, colors.secondary, colors.accent, "#ffffff"];
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.65 }, colors: palette, disableForReducedMotion: true });
  };

  const submit = async (answer: { date?: string; time?: string; message?: string }) => {
    setError(null);
    if (mode === "live") {
      setBusy(true);
      try {
        await respond({ slug: data.slug, pickedDate: answer.date, pickedTime: answer.time, message: answer.message, dodges });
      } catch (err) {
        setBusy(false);
        setError(err instanceof ConvexError ? String(err.data) : t.sendFailed);
        return;
      }
      setBusy(false);
    }
    setPicked(answer.date ? { date: answer.date, time: answer.time } : null);
    setScreen("done");
    if (answer.date) celebrate();
  };

  const sayYes = () => {
    sound.yes();
    haptic("success");
    celebrate();
    if (data.enableDatePicker) setScreen("details");
    else submit({});
  };

  const restart = () => {
    resetNo();
    setDodges(0);
    setPicked(null);
    setError(null);
    setScreen("question");
  };

  const toggleSound = () => {
    sound.setMuted(!muted);
    setMuted(!muted);
  };

  const names =
    data.recipientName && data.senderName
      ? t.toFrom(data.recipientName, data.senderName)
      : data.recipientName
        ? t.to(data.recipientName)
        : data.senderName
          ? t.from(data.senderName)
          : null;

  const style = {
    "--x-bg": colors.background,
    "--x-card": colors.cardBg,
    "--x-text": colors.text,
    "--x-primary": colors.primary,
    "--x-muted": `color-mix(in srgb, ${colors.text} 62%, ${colors.background})`,
    "--x-line": `color-mix(in srgb, ${colors.text} 12%, transparent)`,
  } as CSSProperties;

  const enter = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <MotionConfig reducedMotion="user">
      <div
        dir={data.isRtl ? "rtl" : "ltr"}
        lang={lang}
        style={style}
        className={`x-root relative isolate flex flex-col overflow-hidden ${embedded ? "h-full" : "min-h-dvh"}`}
      >
        <Backdrop effect={data.visualPersonality} colors={colors} />

        <header className="relative z-20 flex items-center justify-between gap-2 p-3 sm:p-4">
          {mode === "preview" ? (
            <div className="flex items-center gap-2">
              <span className="x-chip">{t.preview}</span>
              {screen !== "question" && (
                <button type="button" className="x-icon-btn" onClick={restart} aria-label={t.restart} title={t.restart}>
                  <RotateCcw className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ) : (
            <Link href="/" className="x-chip hover:opacity-80" lang="en" dir="ltr">
              wouldu · {t.makeYourOwn}
            </Link>
          )}
          <button type="button" className="x-icon-btn" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? t.soundOff : t.soundOn} title={muted ? t.soundOff : t.soundOn}>
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          </button>
        </header>

        <main
          ref={stageRef}
          onPointerMove={onStagePointerMove}
          className={`relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center ${screen === "question" ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {screen === "question" && (
              <motion.section key="question" {...enter} className="flex w-full max-w-2xl flex-col items-center">
                {names && <p className="x-chip mb-6">{names}</p>}
                <h1 className="x-headline">{content.headline}</h1>
                {content.subtext && <p className="x-lead mt-4">{content.subtext}</p>}

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <button ref={yesRef} type="button" className="x-btn x-btn--primary x-btn--lg min-w-40" onClick={sayYes}>
                    {content.yesBtnText}
                  </button>
                  <button
                    ref={noRef}
                    type="button"
                    className="x-btn x-btn--ghost x-btn--lg x-runaway min-w-32"
                    aria-label={t.noLabel}
                    onPointerDown={(e) => {
                      if (e.pointerType === "touch") e.preventDefault();
                      escape({ x: e.clientX, y: e.clientY });
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      escape();
                    }}
                  >
                    {dodges === 0 ? content.noBtnText : taunts[(dodges - 1) % taunts.length]}
                  </button>
                </div>
              </motion.section>
            )}

            {screen === "details" && (
              <motion.section key="details" {...enter} className="flex w-full flex-col items-center py-6">
                <h2 className="x-headline x-headline--sm">{t.pickDay}</h2>
                <p className="x-lead mb-6 mt-2">{t.pickDayHint}</p>
                <DatePicker lang={lang} busy={busy} error={error} onSubmit={submit} />
              </motion.section>
            )}

            {screen === "done" && (
              <motion.section key="done" {...enter} className="flex w-full max-w-xl flex-col items-center py-6">
                <h2 className="x-headline">{content.postYesHeadline}</h2>
                {content.postYesSubtext && <p className="x-lead mt-4">{content.postYesSubtext}</p>}

                {picked && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <p className="x-chip x-chip--strong">{formatPicked(picked.date, picked.time, lang)}</p>
                    <button
                      type="button"
                      className="x-btn x-btn--quiet"
                      onClick={() => downloadIcs({ title: t.calendarTitle(data.senderName), date: picked.date, time: picked.time, url: window.location.href })}
                    >
                      <CalendarPlus className="size-4" aria-hidden /> {t.addToCalendar}
                    </button>
                  </div>
                )}

                {content.handwrittenMessage && (
                  <figure className="x-note mt-10">
                    <blockquote>{content.handwrittenMessage}</blockquote>
                    {data.senderName && <figcaption>— {data.senderName}</figcaption>}
                  </figure>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {error && screen === "question" && <p className="mt-6 text-sm" role="alert">{error}</p>}
        </main>
      </div>
    </MotionConfig>
  );
}
