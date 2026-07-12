"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ExperienceTemplate, PREBUILT_TEMPLATES } from "../lib/templates";
import { soundEngine } from "../lib/audio";
import { triggerHaptic } from "../lib/haptics";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { DateTimePicker } from "./DateTimePicker";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Heart, Sparkles, ArrowLeft, Check, Calendar,
  Eye, X, BarChart3,
} from "lucide-react";
import Link from "next/link";

type Step = "question" | "calendar" | "celebration";

interface ExperienceViewProps {
  template: ExperienceTemplate;
  isPreview?: boolean;
  onExitPreview?: () => void;
  previewStep?: Step;
}

const NO_TAUNTS = [
  "Nice try! 🏃‍♂️",
  "Too slow! 💨",
  "Nope 🛑",
  "Catch me if you can! 👻",
  "Just YES! 💖",
  "Reflexes check! 👀",
  "Not happening 🧘",
  "Destiny says YES 🔥",
  "You can't! 🤭",
  "Almost... not 😂",
];

// ─── HIDDEN STATS DRAWER (Triggered by clicking the title pill) ───
function StatsDrawer({ slug, open, onClose }: { slug: string; open: boolean; onClose: () => void }) {
  const stats = useQuery(api.experiences.getResponseStats, { slug });
  const responses = useQuery(api.experiences.getResponses, { slug });

  const drawerContent = (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-zinc-600" />
          <span className="text-sm font-extrabold text-zinc-900">Experience History &amp; Stats</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-black/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Views", value: stats?.views || 0, icon: <Eye className="w-4 h-4" />, color: "text-zinc-600" },
          { label: "Said Yes", value: stats?.yes || 0, icon: <Heart className="w-4 h-4" />, color: "text-pink-600" },
          { label: "Said No", value: stats?.no || 0, icon: <X className="w-4 h-4" />, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-zinc-50 border border-zinc-100 p-3 sm:p-4 text-center">
            <div className={`flex justify-center mb-1.5 ${s.color}`}>{s.icon}</div>
            <div className="text-lg sm:text-xl font-black text-zinc-950">{s.value}</div>
            <div className="text-[11px] font-bold text-zinc-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Yes rate bar */}
      {(stats?.total || 0) > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-xs font-bold text-zinc-500 mb-1.5">
            <span>Yes Rate</span>
            <span className="text-pink-600">
              {Math.round(((stats?.yes || 0) / (stats?.total || 1)) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(((stats?.yes || 0) / (stats?.total || 1)) * 100)}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
            />
          </div>
        </div>
      )}

      {/* Recent History List */}
      <div className="border-t border-zinc-100 pt-4 mb-4 flex-1 overflow-y-auto">
        <div className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-3">Recent Response History</div>
        {!responses || responses.length === 0 ? (
          <p className="text-xs text-zinc-400 italic py-2 text-center">No responses yet. Share the link to start collecting history!</p>
        ) : (
          <div className="space-y-2 max-h-56 sm:max-h-80 overflow-y-auto pr-1">
            {responses.slice(0, 15).map((r) => {
              const dateStr = r.pickedDate ? new Date(r.pickedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
              const timeStr = r.pickedTime ? (() => {
                const [h, m] = r.pickedTime.split(":");
                const hr = parseInt(h);
                const ampm = hr >= 12 ? "PM" : "AM";
                const dh = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
                return `${dh}:${m} ${ampm}`;
              })() : "";
              return (
                <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.answeredYes ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
                    <span className="font-extrabold text-zinc-900 truncate">{r.respondentName || "Partner"}</span>
                    <span className={`font-bold ${r.answeredYes ? "text-pink-600" : "text-zinc-400"}`}>
                      {r.answeredYes ? "Said YES! 🎉" : "Said No 🛑"}
                    </span>
                  </div>
                  {(dateStr || timeStr) && (
                    <span className="text-[11px] font-mono font-extrabold text-pink-600 shrink-0 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100 shadow-2xs">
                      📅 {dateStr} {timeStr ? `at ${timeStr}` : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-zinc-100 text-center shrink-0">
        <Link
          href={`/admin${slug}`}
          target="_blank"
          className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Full dashboard →
        </Link>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />

          {/* Side Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[420px] max-w-full h-screen overflow-y-auto p-8 border-l flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(28px)",
              borderColor: "rgba(0,0,0,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.15)",
            }}
          >
            {drawerContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ExperienceView({ template, isPreview = false, onExitPreview, previewStep }: ExperienceViewProps) {
  const safeTemplate = template || PREBUILT_TEMPLATES[0] || {};
  const slug = safeTemplate.slug || "";
  const title = safeTemplate.title || "Will you go out with me? 🌹";
  const recipientName = safeTemplate.recipientName || "";
  const senderName = safeTemplate.senderName || "";
  const colors = safeTemplate.colors || PREBUILT_TEMPLATES[0].colors;
  const content = safeTemplate.content || PREBUILT_TEMPLATES[0].content;
  const visualPersonality = safeTemplate.visualPersonality || "roses";

  const displayHeadline = content?.headline || title || "Will you go on a date with me? 🌹";
  const displaySubtext = content?.subtext || "I promise it'll be worth it. What do you say?";
  const activeNoTaunts = (content?.noBtnOptions && content.noBtnOptions.filter(Boolean).length > 0)
    ? content.noBtnOptions.filter(Boolean)
    : NO_TAUNTS;

  const [step, setStep] = useState<Step>(previewStep || "question");

  useEffect(() => {
    if (previewStep) setStep(previewStep);
  }, [previewStep]);

  const [noTauntIdx, setNoTauntIdx] = useState(0);
  const [escapeCount, setEscapeCount] = useState(0);
  const [statsOpen, setStatsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<{ date: string; time: string } | null>(null);

  // The No button is positioned RELATIVE inside the card — bounded to card size
  const cardRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);
  const isTauntingRef = useRef(false);
  const currentPosRef = useRef({ x: 0, y: 0 });
  const lastMoveCheckRef = useRef<number>(0);

  const recordYesMutation = useMutation(api.experiences.recordYes);
  const recordViewMutation = useMutation(api.experiences.recordView);
  const submitResponseMutation = useMutation(api.experiences.submitResponse);

  useEffect(() => {
    if (!isPreview && slug && slug.startsWith("/")) {
      recordViewMutation({ slug }).catch(() => { });
    }
  }, [slug, isPreview, recordViewMutation]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  /**
   * Punchy, elastic, zero-lag runaway — spring physics with 100% isolated layout flow
   */
  const triggerRunaway = useCallback((e?: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    soundEngine.unlock();
    if (!cardRef.current || !noBtnRef.current || isTauntingRef.current) return;
    isTauntingRef.current = true;

    soundEngine.playEscapeSound();
    triggerHaptic("panicRun");

    const cardRect = cardRef.current.getBoundingClientRect();
    const btnRect = noBtnRef.current.getBoundingClientRect();

    const cx = currentPosRef.current.x;
    const cy = currentPosRef.current.y;

    // Calculate resting screen coordinates of the No button (when tx=0, ty=0)
    const restLeft = btnRect.left - cx;
    const restTop = btnRect.top - cy;
    const btnW = btnRect.width || 170;
    const btnH = btnRect.height || 60;

    // Exact local translation bounds so the button stays >=28px inside all 4 edges of cardRect
    const pad = 28;
    const minTx = cardRect.left + pad - restLeft;
    const maxTx = cardRect.right - pad - (restLeft + btnW);
    const minTy = cardRect.top + pad - restTop;
    const maxTy = cardRect.bottom - pad - (restTop + btnH);

    const centerTx = (minTx + maxTx) / 2;
    const centerTy = (minTy + maxTy) / 2;

    let tx = 0;
    let ty = 0;

    // First evasion moves directly into the center with a snappy animation; subsequent escapes leap far across the card
    if (cx === 0 && cy === 0) {
      tx = centerTx;
      ty = centerTy;
    } else {
      let found = false;
      const mouseX = (e && ("clientX" in e ? (e as React.MouseEvent).clientX : "touches" in e && (e as React.TouchEvent).touches[0] ? (e as React.TouchEvent).touches[0].clientX : cx)) ?? cx;
      const mouseY = (e && ("clientY" in e ? (e as React.MouseEvent).clientY : "touches" in e && (e as React.TouchEvent).touches[0] ? (e as React.TouchEvent).touches[0].clientY : cy)) ?? cy;

      for (let i = 0; i < 12; i++) {
        const randX = minTx + Math.random() * (maxTx - minTx);
        const randY = minTy + Math.random() * (maxTy - minTy);
        const distFromCurrent = Math.hypot(randX - cx, randY - cy);
        const distFromMouse = Math.hypot((cardRect.left + pad + randX) - mouseX, (cardRect.top + pad + randY) - mouseY);
        if (distFromCurrent > 170 && distFromMouse > 140) {
          tx = randX;
          ty = randY;
          found = true;
          break;
        }
      }
      if (!found) {
        tx = cx < centerTx ? Math.min(maxTx, cx + 240) : Math.max(minTx, cx - 240);
        ty = cy < centerTy ? Math.min(maxTy, cy + 180) : Math.max(minTy, cy - 180);
      }
    }

    // Strictly clamp inside exact local bounds
    tx = Math.max(minTx, Math.min(maxTx, tx));
    ty = Math.max(minTy, Math.min(maxTy, ty));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Fast, snappy, buttery 220ms transition across the card
    if (noBtnRef.current) {
      noBtnRef.current.style.transition = "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)";
      noBtnRef.current.style.transform = `translate3d(${tx}px,${ty}px,0)`;
    }
    currentPosRef.current = { x: tx, y: ty };
    setEscapeCount((p) => p + 1);

    // Unlock proximity check after 110ms so rapid mouse pursuit triggers immediate successive escapes
    setTimeout(() => {
      isTauntingRef.current = false;
    }, 110);

    setTimeout(() => {
      setNoTauntIdx((p) => p + 1);
    }, 220);
  }, []);

  // Proximity detection throttled for 120Hz/240Hz Mac ProMotion monitors with generous 140px escape radius
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (step !== "question" || isTauntingRef.current || !noBtnRef.current || !cardRef.current) return;
    const now = performance.now();
    if (now - lastMoveCheckRef.current < 16) return; // Throttled to 60fps layout check
    lastMoveCheckRef.current = now;

    soundEngine.unlock();
    const btnRect = noBtnRef.current.getBoundingClientRect();
    const cx = btnRect.left + btnRect.width / 2;
    const cy = btnRect.top + btnRect.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < 140) triggerRunaway(e);
  }, [step, triggerRunaway]);

  const handleYesClick = async () => {
    soundEngine.playYesFanfare();
    triggerHaptic("celebrationBoom");
    confetti({ particleCount: 130, spread: 90, origin: { y: 0.65 }, colors: [colors.primary, colors.secondary, colors.accent, "#fff"] });
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 75, origin: { x: 0 }, colors: [colors.primary, colors.accent] });
      confetti({ particleCount: 80, angle: 120, spread: 75, origin: { x: 1 }, colors: [colors.secondary, "#fff"] });
    }, 220);

    if (template.enableDatePicker === false) {
      if (!isPreview && slug?.startsWith("/")) {
        await submitResponseMutation({ experienceSlug: slug, answeredYes: true }).catch(() => { });
        await recordYesMutation({ slug }).catch(() => { });
      }
      setStep("celebration");
    } else {
      setStep("calendar");
    }
  };

  const handleDateConfirm = async (date: string, time: string) => {
    setConfirmedDate({ date, time });
    triggerHaptic("celebrationBoom");
    if (!isPreview && slug?.startsWith("/")) {
      await submitResponseMutation({ experienceSlug: slug, answeredYes: true, pickedDate: date, pickedTime: time }).catch(() => { });
      await recordYesMutation({ slug }).catch(() => { });
    }
    setTimeout(() => confetti({ particleCount: 160, spread: 160, origin: { y: 0.3 }, scalar: 1.2 }), 80);
    setStep("celebration");
  };

  const handleSkipDate = async () => {
    if (!isPreview && slug?.startsWith("/")) {
      await submitResponseMutation({ experienceSlug: slug, answeredYes: true }).catch(() => { });
      await recordYesMutation({ slug }).catch(() => { });
    }
    setStep("celebration");
  };

  const shareUrl = () => {
    triggerHaptic("impactMedium");
    soundEngine.playClickSound();
    navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatDate = (date: string, time: string) => {
    const d = new Date(date + "T12:00:00");
    const ds = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const [h, m] = time.split(":");
    const hr = parseInt(h);
    const ampm = hr >= 12 ? "PM" : "AM";
    const dh = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${ds} at ${dh}:${m} ${ampm}`;
  };

  const isRtlActive =
    Boolean(template.isRtl) ||
    /[\u0590-\u08FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(
      `${title || ""} ${content.headline || ""} ${content.subtext || ""} ${content.yesBtnText || ""} ${content.noBtnText || ""} ${content.postYesHeadline || ""} ${content.postYesSubtext || ""}`
    );

  return (
    <div
      suppressHydrationWarning
      dir={isRtlActive ? "rtl" : "ltr"}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: colors.background || "#FAFAFA" }}
    >
      <BackgroundOrbs colors={colors} personality={visualPersonality} />

      {/* Top bar */}
      <div suppressHydrationWarning className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto max-w-3xl mx-auto">
        {isPreview && onExitPreview ? (
          <button
            type="button"
            onClick={() => { triggerHaptic("tick"); soundEngine.playClickSound(); onExitPreview(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-zinc-800 font-bold text-xs shadow-md border border-black/[0.08] backdrop-blur-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit Preview
          </button>
        ) : (
          <Link
            href="/"
            onClick={() => { triggerHaptic("tick"); soundEngine.playClickSound(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-zinc-800 font-bold text-xs shadow-md border border-black/[0.08] backdrop-blur-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Create Yours
          </Link>
        )}

        {!isPreview && slug && slug.startsWith("/") ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic("tick");
              soundEngine.playClickSound();
              setStatsOpen(true);
            }}
            suppressHydrationWarning
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl border border-black/[0.08] text-xs font-extrabold text-zinc-800 shadow-md transition-all cursor-pointer select-none active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{title}</span>
          </button>
        ) : (
          <div suppressHydrationWarning className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-xl border border-black/[0.08] text-xs font-extrabold text-zinc-800 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{title}</span>
          </div>
        )}
      </div>

      {/* ── STEP CONTENT (85% Screen Height & Width Master Container) ── */}
      <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8">
        <motion.div
          suppressHydrationWarning
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onPointerDown={() => soundEngine.unlock()}
          dir={isRtlActive ? "rtl" : "ltr"}
          style={{ backgroundColor: colors?.cardBg || "#FFFFFF", border: "1px solid rgba(0,0,0,0.12)" }}
          className={`relative w-[85vw] h-[85vh] max-w-[1300px] max-h-[900px] rounded-[3.5rem] shadow-[0_32px_100px_rgba(0,0,0,0.18)] p-6 sm:p-16 flex flex-col items-center justify-center ${step === "question" ? "overflow-hidden" : "overflow-y-auto"} backdrop-blur-2xl text-center`}
        >
          <AnimatePresence mode="wait">

            {/* Step 1: Question */}
            {step === "question" && (
              <motion.div
                key="q"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center"
              >
                {(recipientName || senderName) && (
                  <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.04] border border-black/[0.06] text-xs sm:text-sm font-bold text-zinc-700">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {recipientName ? `To: ${recipientName}` : ""}
                    {senderName ? ` from ${senderName}` : ""}
                  </div>
                )}

                <h1
                  className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.08] max-w-4xl"
                  style={{ color: colors?.text || "#111318" }}
                >
                  {displayHeadline}
                </h1>
                {displaySubtext?.trim() ? (
                  <p className="text-base sm:text-xl text-zinc-500 max-w-xl mx-auto font-normal leading-relaxed mb-12">
                    {displaySubtext}
                  </p>
                ) : (
                  <div className="mb-8" />
                )}

                {/* Buttons — Yes button stays 100% fixed dimensions, No button floats isolated in absolute box */}
                <div suppressHydrationWarning className="relative flex flex-col sm:flex-row items-center justify-center gap-6 mt-4 w-full" style={{ minHeight: 64 }}>
                  {/* YES — Fixed exact width & height (`w-[260px] sm:w-[280px] h-[60px] sm:h-[64px]`) so it never resizes or shifts */}
                  <motion.button
                    suppressHydrationWarning
                    type="button"
                    animate={{
                      x: escapeCount > 0 ? (typeof window !== "undefined" && window.innerWidth < 640 ? 0 : isRtlActive ? -97 : 97) : 0,
                    }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleYesClick}
                    style={{ backgroundColor: colors.primary }}
                    className="shrink-0 w-[260px] sm:w-[280px] h-[60px] sm:h-[64px] px-6 rounded-2xl font-black text-lg sm:text-xl text-white shadow-xl flex items-center justify-center gap-3 cursor-pointer z-30 relative select-none"
                  >
                    <span suppressHydrationWarning className="truncate">{content.yesBtnText}</span>
                    <Heart className="w-5 h-5 fill-white shrink-0 animate-bounce" />
                  </motion.button>

                  {/* NO — placeholder slot with exact fixed dimensions (`w-[160px] sm:w-[170px] h-[60px] sm:h-[64px]`) and absolute child */}
                  <div suppressHydrationWarning className="shrink-0 w-[160px] sm:w-[170px] h-[60px] sm:h-[64px] relative">
                    <button
                      suppressHydrationWarning
                      type="button"
                      ref={noBtnRef}
                      onPointerEnter={() => soundEngine.unlock()}
                      onPointerDown={triggerRunaway}
                      onTouchStart={(e) => { e.preventDefault(); triggerRunaway(); }}
                      className="absolute left-0 top-0 w-[160px] sm:w-[170px] h-[60px] sm:h-[64px] px-3 rounded-2xl font-bold text-sm sm:text-base text-zinc-700 bg-zinc-200/70 hover:bg-zinc-200/90 backdrop-blur-md border border-black/[0.10] flex items-center justify-center gap-1.5 cursor-pointer z-40 select-none shadow-sm truncate"
                      style={{ willChange: "transform", backfaceVisibility: "hidden" }}
                    >
                      <span suppressHydrationWarning className="truncate">{escapeCount > 0 ? activeNoTaunts[noTauntIdx % activeNoTaunts.length] : content.noBtnText}</span>
                    </button>
                  </div>
                </div>

                {escapeCount > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 text-xs font-bold text-zinc-400 uppercase tracking-wider"
                  >
                    Escaped {escapeCount}× — destiny always wins!
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Step 2: Calendar */}
            {step === "calendar" && (
              <motion.div
                key="cal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -12 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-black/[0.08] text-base font-extrabold text-emerald-600 shadow-md">
                    <Check className="w-5 h-5" />
                    🎉 Pick your date &amp; time:
                  </div>
                </div>
                <div className="w-full max-w-lg mx-auto">
                  <DateTimePicker
                    primaryColor={colors.primary}
                    onConfirm={handleDateConfirm}
                    onSkip={handleSkipDate}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Celebration */}
            {step === "celebration" && (
              <motion.div
                key="cel"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-8"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                >
                  <Heart className="w-12 h-12 text-white fill-white animate-pulse" />
                </motion.div>

                <h2
                  className="text-4xl sm:text-6xl font-black tracking-tight mb-5 leading-tight"
                  style={{ color: colors.text || "#111318" }}
                >
                  {content.postYesHeadline}
                </h2>
                {content.postYesSubtext?.trim() ? (
                  <p className="text-lg sm:text-xl text-zinc-500 font-normal leading-relaxed max-w-md mx-auto mb-8">
                    {content.postYesSubtext}
                  </p>
                ) : (
                  <div className="mb-6" />
                )}

                {confirmedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 px-6 py-4 rounded-3xl bg-black/[0.04] border border-black/[0.08] inline-flex items-center gap-3 shadow-sm"
                  >
                    <Calendar className="w-5 h-5 shrink-0" style={{ color: colors.primary }} />
                    <span className="text-base sm:text-lg font-extrabold text-zinc-900">
                      {formatDate(confirmedDate.date, confirmedDate.time)}
                    </span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 12, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: -1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 py-6 px-8 rounded-3xl bg-gradient-to-br from-pink-500/[0.06] via-amber-500/[0.06] to-rose-500/[0.06] border border-pink-500/15 max-w-md mx-auto shadow-inner"
                >
                  <p
                    className="text-2xl sm:text-4xl font-serif italic tracking-wide font-medium leading-relaxed"
                    style={{
                      color: colors.primary || "#E02478",
                      fontFamily: "'Caveat', 'Sacramento', 'Dancing Script', 'Bradley Hand', 'Brush Script MT', cursive, font-serif",
                    }}
                  >
                    &ldquo;{content?.handwrittenMessage || "It's a date! Can't wait to see you then 💕"}&rdquo;
                  </p>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Hidden stats drawer (Triggered by clicking title) ── */}
      {!isPreview && slug && slug.startsWith("/") && (
        <StatsDrawer slug={slug} open={statsOpen} onClose={() => setStatsOpen(false)} />
      )}
    </div>
  );
}
