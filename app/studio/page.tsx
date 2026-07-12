"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PREBUILT_TEMPLATES, ExperienceTemplate } from "../../lib/templates";
import { Navbar } from "../../components/Navbar";
import { CustomizerStudio } from "../../components/CustomizerStudio";
import { ExperienceView } from "../../components/ExperienceView";
import { triggerHaptic } from "../../lib/haptics";
import { soundEngine } from "../../lib/audio";
import {
  ArrowLeft, ChevronDown, Check, Play, Heart, Sparkles,
} from "lucide-react";

// ─── iOS-STYLE TEMPLATE DROPDOWN ─────────────────────────────────────────────
function TemplateDropdown({
  templates,
  selected,
  onSelect,
}: {
  templates: ExperienceTemplate[];
  selected: ExperienceTemplate;
  onSelect: (t: ExperienceTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const safeSel = selected || PREBUILT_TEMPLATES[0];
  const selColors = safeSel.colors || PREBUILT_TEMPLATES[0].colors;
  const selContent = safeSel.content || PREBUILT_TEMPLATES[0].content;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => { triggerHaptic("tick"); soundEngine.playClickSound(); setOpen((o) => !o); }}
        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-white border border-black/[0.09] shadow-sm hover:shadow-md hover:border-black/20 transition-all cursor-pointer text-left"
      >
        {/* Color swatch */}
        <div
          className="w-8 h-8 rounded-xl shrink-0 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${selColors.primary}, ${selColors.accent})` }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold text-zinc-900">{safeSel.title}</div>
          <div className="text-xs text-zinc-500 truncate">{selContent.headline}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 top-full mt-2 left-0 right-0 rounded-2xl bg-white border border-black/[0.09] shadow-2xl shadow-black/10 overflow-hidden"
          >
            {templates.map((t, i) => {
              const safeT = t || PREBUILT_TEMPLATES[0];
              const tColors = safeT.colors || PREBUILT_TEMPLATES[0].colors;
              const tContent = safeT.content || PREBUILT_TEMPLATES[0].content;
              const isActive = safeT.templateId === safeSel.templateId;
              return (
                <button
                  key={safeT.templateId}
                  suppressHydrationWarning
                  type="button"
                  onClick={() => {
                    triggerHaptic("tick");
                    soundEngine.playClickSound(900 + i * 20);
                    onSelect(safeT);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                    isActive ? "bg-zinc-50" : "hover:bg-zinc-50"
                  } ${i !== 0 ? "border-t border-black/[0.05]" : ""}`}
                >
                  <div
                    className="w-8 h-8 rounded-xl shrink-0"
                    style={{ background: `linear-gradient(135deg, ${tColors.primary}, ${tColors.accent})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-zinc-900">{safeT.title}</div>
                    <div className="text-xs text-zinc-500 truncate">{tContent.headline}</div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-zinc-900 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MINI CARD PREVIEW ────────────────────────────────────────────────────────
function MiniPreview({ template }: { template: ExperienceTemplate }) {
  const safeTemplate = template || PREBUILT_TEMPLATES[0] || {};
  const colors = safeTemplate.colors || PREBUILT_TEMPLATES[0].colors;
  const content = safeTemplate.content || PREBUILT_TEMPLATES[0].content;
  return (
    <motion.div
      key={safeTemplate.templateId || "mini"}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-5 border border-black/[0.07] shadow-sm"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-3">Live Preview</div>
      <h4 className="text-lg font-black mb-1.5 leading-snug" style={{ color: colors.text }}>
        {content.headline}
      </h4>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: colors.text, opacity: 0.55 }}>
        {content.subtext}
      </p>
      <div className="flex gap-2">
        <div className="flex-1 py-2 rounded-xl text-center text-xs font-extrabold text-white" style={{ backgroundColor: colors.primary }}>
          {content.yesBtnText}
        </div>
        <div className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-black/[0.05] border border-black/[0.06]" style={{ color: colors.text }}>
          {content.noBtnText}
        </div>
      </div>
    </motion.div>
  );
}

// ─── STUDIO PAGE ──────────────────────────────────────────────────────────────
export default function StudioPage() {
  const [selected, setSelected] = useState<ExperienceTemplate>(PREBUILT_TEMPLATES[0]);
  const [livePreview, setLivePreview] = useState<ExperienceTemplate | null>(null);

  const dbTemplates = useQuery(api.experiences.getTemplates);
  const templates = (dbTemplates && dbTemplates.length > 0)
    ? (dbTemplates as ExperienceTemplate[])
    : PREBUILT_TEMPLATES;

  const scrollToEditor = () => {
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen w-full text-[#111318] overflow-x-hidden"
      style={{
        // Engineer dot-grid background
        backgroundColor: "#FAFAFA",
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}
    >
      <Navbar />

      {/* ── STUDIO HEADER ── */}
      <section
        suppressHydrationWarning
        className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {/* White haze to soften grid at top */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#FAFAFA] to-transparent pointer-events-none z-0" />

        <div className="relative z-10">
          <Link
            href="/"
            onClick={() => { triggerHaptic("tick"); soundEngine.playClickSound(); }}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-extrabold text-pink-600 uppercase tracking-wide mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Interactive Studio
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-[1.06] mb-3 max-w-xl">
                Build Your Experience
              </h1>
              <p className="text-zinc-500 text-base font-normal max-w-lg">
                Choose a base template, customize every detail, and generate a shareable URL stored in real time via Convex.
              </p>
            </div>

            {/* iOS Template Dropdown + Mini-preview */}
            <div className="w-full lg:w-96 shrink-0 space-y-3">
              <div className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider px-1">
                Select base template
              </div>
              <TemplateDropdown templates={templates} selected={selected} onSelect={(t) => { setSelected(t); scrollToEditor(); }} />
              <AnimatePresence mode="wait">
                <MiniPreview template={selected} />
              </AnimatePresence>
              <div className="flex gap-2">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => { triggerHaptic("impactMedium"); soundEngine.playYesFanfare(); setLivePreview(selected); }}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Full-screen preview
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={scrollToEditor}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-black/[0.09] text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 transition-colors cursor-pointer shadow-sm"
                >
                  Customize ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITOR ── */}
      <section
        suppressHydrationWarning
        id="editor"
        className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 relative z-10"
      >
        {/* White card to lift editor off grid */}
        <div className="rounded-[2.5rem] bg-[#FAFAFA] border border-black/[0.07] shadow-xl overflow-hidden">
          <CustomizerStudio
            key={selected.templateId}
            initialTemplate={selected}
            onExperienceCreated={() => { triggerHaptic("notificationSuccess"); }}
          />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-black/[0.06] bg-[#FAFAFA] text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-pink-500 flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-zinc-700">WouldYou. Studio</span>
          </div>
          <div className="flex gap-5 font-semibold">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <a href="https://convex.dev" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">Convex</a>
          </div>
        </div>
      </footer>

      {/* Full-screen preview */}
      <AnimatePresence>
        {livePreview && (
          <motion.div
            suppressHydrationWarning
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <ExperienceView template={livePreview} isPreview onExitPreview={() => setLivePreview(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
