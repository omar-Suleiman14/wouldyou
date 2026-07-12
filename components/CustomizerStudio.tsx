"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ExperienceTemplate, PREBUILT_TEMPLATES, VisualPersonality } from "../lib/templates";
import { triggerHaptic } from "../lib/haptics";
import { soundEngine } from "../lib/audio";
import { ExperienceView } from "./ExperienceView";
import {
  Sparkles, Heart, Copy, Check, ArrowRight, ArrowLeft,
  ExternalLink, User, Type, Palette, Link as LinkIcon,
  Eye, X, History as HistoryIcon, Trash2, RotateCcw, Plus,
} from "lucide-react";

interface CustomizerStudioProps {
  initialTemplate?: ExperienceTemplate;
  onExperienceCreated?: (slug: string) => void;
}

export interface StudioHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  slug?: string;
  templateId: string;
  recipientName: string;
  senderName: string;
  colors: ExperienceTemplate["colors"];
  content: ExperienceTemplate["content"];
  visualPersonality: VisualPersonality;
  enableDatePicker: boolean;
  isRtl: boolean;
  customSlugInput: string;
}

const COLOR_PRESETS = [
  { name: "Rose Blush", colors: { primary: "#E02478", secondary: "#FF73B3", accent: "#F6C15B", background: "#F8F4F6", cardBg: "#FFFFFF", text: "#1A1016" } },
  { name: "Starlight Violet", colors: { primary: "#5A44C9", secondary: "#30C8F6", accent: "#FFB82E", background: "#F4F5FB", cardBg: "#FFFFFF", text: "#111422" } },
  { name: "Kyoto Gold", colors: { primary: "#D98818", secondary: "#F4C46B", accent: "#E84E60", background: "#FBF8F3", cardBg: "#FFFFFF", text: "#1F1810" } },
  { name: "Jade Mint", colors: { primary: "#00B87A", secondary: "#33E6AC", accent: "#FF2B5E", background: "#F3FAF7", cardBg: "#FFFFFF", text: "#0C1F18" } },
  { name: "Tokyo Red", colors: { primary: "#E61919", secondary: "#FF7700", accent: "#00E5FF", background: "#FCF4F4", cardBg: "#FFFFFF", text: "#210B0B" } },
];

type StepId = "template" | "names" | "copy" | "celebration" | "colors" | "slug" | "done";

const STEPS: { id: StepId; label: string; icon: React.ReactNode }[] = [
  { id: "template", label: "Template", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "names", label: "Names", icon: <User className="w-3.5 h-3.5" /> },
  { id: "copy", label: "Question", icon: <Type className="w-3.5 h-3.5" /> },
  { id: "celebration", label: "Post-Yes", icon: <Heart className="w-3.5 h-3.5" /> },
  { id: "colors", label: "Colors", icon: <Palette className="w-3.5 h-3.5" /> },
  { id: "slug", label: "Link", icon: <LinkIcon className="w-3.5 h-3.5" /> },
];

function StepProgress({ current, steps }: { current: number; steps: typeof STEPS }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-6 pt-3 pb-3 px-1 -mx-1 overflow-x-auto no-scrollbar w-full">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`w-8 h-8 min-w-[32px] min-h-[32px] aspect-square rounded-full flex items-center justify-center text-xs font-black leading-none select-none shrink-0 transition-all duration-300 ${done
                  ? "bg-emerald-500 text-white shadow-sm"
                  : active
                    ? "bg-zinc-950 text-white shadow-md ring-4 ring-pink-500/10"
                    : "bg-zinc-100 text-zinc-400"
                  }`}
              >
                {done ? <Check className="w-4 h-4 shrink-0" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${active ? "text-zinc-900 font-black" : done ? "text-emerald-600" : "text-zinc-400 hidden sm:block"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-3 sm:w-6 rounded-full transition-colors duration-300 shrink-0 ${done ? "bg-emerald-400" : "bg-zinc-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-xs font-black text-zinc-800 uppercase tracking-wider mb-1.5">
      {children}
      {hint && <span className="ml-2 font-normal text-zinc-400 normal-case">{hint}</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      suppressHydrationWarning
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-black/[0.08] bg-zinc-50/80 hover:bg-white focus:bg-white px-4 py-3 text-sm font-medium text-zinc-900 placeholder-zinc-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all"
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 2,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      suppressHydrationWarning
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-black/[0.08] bg-zinc-50/80 hover:bg-white focus:bg-white px-4 py-3 text-sm font-medium text-zinc-900 placeholder-zinc-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all resize-none"
    />
  );
}

export function CustomizerStudio({ initialTemplate, onExperienceCreated }: CustomizerStudioProps) {
  const [base, setBase] = useState<ExperienceTemplate>(initialTemplate || PREBUILT_TEMPLATES[0]);
  const [stepIdx, setStepIdx] = useState(0);

  const [recipientName, setRecipientName] = useState(base.recipientName || "");
  const [senderName, setSenderName] = useState(base.senderName || "");
  const [colors, setColors] = useState(base.colors);
  const [content, setContent] = useState(base.content);
  const [visualPersonality, setVisualPersonality] = useState<VisualPersonality>(base.visualPersonality);
  const [customSlugInput, setCustomSlugInput] = useState("");
  const [enableDatePicker, setEnableDatePicker] = useState(base.enableDatePicker ?? true);
  const [isRtl, setIsRtl] = useState(base.isRtl ?? false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<StudioHistoryItem[]>([]);

  // Load auto-saved draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("wouldyou_studio_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        const tmpl = PREBUILT_TEMPLATES.find((t) => t.templateId === parsed.templateId) || initialTemplate || PREBUILT_TEMPLATES[0];
        setBase(tmpl);
        if (parsed.recipientName !== undefined) setRecipientName(parsed.recipientName);
        if (parsed.senderName !== undefined) setSenderName(parsed.senderName);
        if (parsed.colors) setColors(parsed.colors);
        if (parsed.content) setContent(parsed.content);
        if (parsed.visualPersonality) setVisualPersonality(parsed.visualPersonality);
        if (parsed.enableDatePicker !== undefined) setEnableDatePicker(parsed.enableDatePicker);
        if (parsed.isRtl !== undefined) setIsRtl(parsed.isRtl);
        if (parsed.customSlugInput !== undefined) setCustomSlugInput(parsed.customSlugInput);
        if (typeof parsed.stepIdx === "number" && parsed.stepIdx < STEPS.length) setStepIdx(parsed.stepIdx);
      }
      const savedHistory = localStorage.getItem("wouldyou_studio_history");
      if (savedHistory) setHistoryList(JSON.parse(savedHistory));
    } catch (e) {}
  }, [initialTemplate]);

  // Auto-save current progress (`wouldyou_studio_draft`) whenever step or fields change
  useEffect(() => {
    try {
      const draft = {
        templateId: base.templateId,
        recipientName,
        senderName,
        colors,
        content,
        visualPersonality,
        enableDatePicker,
        isRtl,
        customSlugInput,
        stepIdx,
      };
      localStorage.setItem("wouldyou_studio_draft", JSON.stringify(draft));
    } catch (e) {}
  }, [base.templateId, recipientName, senderName, colors, content, visualPersonality, enableDatePicker, isRtl, customSlugInput, stepIdx]);

  const saveCurrentToHistory = () => {
    triggerHaptic("notificationSuccess");
    soundEngine.playClickSound(1200);
    try {
      const historyItem: StudioHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        title: content.headline || base.title,
        slug: generatedSlug || (customSlugInput ? `/ask/${customSlugInput}` : undefined),
        templateId: base.templateId,
        recipientName: recipientName.trim(),
        senderName: senderName.trim(),
        colors,
        content,
        visualPersonality,
        enableDatePicker,
        isRtl,
        customSlugInput,
      };
      const existing = JSON.parse(localStorage.getItem("wouldyou_studio_history") || "[]");
      const updated = [historyItem, ...existing].slice(0, 30);
      localStorage.setItem("wouldyou_studio_history", JSON.stringify(updated));
      setHistoryList(updated);
    } catch (e) {}
  };

  const restoreFromHistory = (item: StudioHistoryItem) => {
    triggerHaptic("celebrationBoom");
    soundEngine.playYesFanfare();
    const tmpl = PREBUILT_TEMPLATES.find((t) => t.templateId === item.templateId) || PREBUILT_TEMPLATES[0];
    setBase(tmpl);
    setRecipientName(item.recipientName || "");
    setSenderName(item.senderName || "");
    setColors(item.colors || tmpl.colors);
    setContent(item.content || tmpl.content);
    setVisualPersonality(item.visualPersonality || tmpl.visualPersonality);
    setEnableDatePicker(item.enableDatePicker ?? true);
    setIsRtl(item.isRtl ?? false);
    setCustomSlugInput(item.customSlugInput || "");
    setStepIdx(0);
    setShowHistoryModal(false);
  };

  const deleteHistoryItem = (id: string) => {
    triggerHaptic("impactMedium");
    soundEngine.playClickSound(900);
    try {
      const existing = JSON.parse(localStorage.getItem("wouldyou_studio_history") || "[]");
      const updated = existing.filter((item: any) => item.id !== id);
      localStorage.setItem("wouldyou_studio_history", JSON.stringify(updated));
      setHistoryList(updated);
    } catch (e) {}
  };

  const createMutation = useMutation(api.experiences.createExperience);

  const currentStepId = STEPS[stepIdx]?.id || "done";

  const selectTemplate = (tmpl: ExperienceTemplate) => {
    triggerHaptic("impactMedium");
    soundEngine.playClickSound(1050);
    setBase(tmpl);
    setColors(tmpl.colors);
    setContent(tmpl.content);
    setVisualPersonality(tmpl.visualPersonality);
    setEnableDatePicker(tmpl.enableDatePicker ?? true);
    setIsRtl(tmpl.isRtl ?? false);
  };

  const goNext = () => {
    triggerHaptic("impactMedium");
    soundEngine.playClickSound(1000 + stepIdx * 50);
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const goBack = () => {
    triggerHaptic("tick");
    soundEngine.playClickSound();
    setStepIdx((i) => Math.max(i - 1, 0));
  };

  const handleGenerate = async () => {
    triggerHaptic("impactHeavy");
    soundEngine.playClickSound(1100);
    setIsGenerating(true);
    try {
      const slug = customSlugInput.trim()
        ? customSlugInput.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")
        : "";
      const result = await createMutation({
        templateId: base.templateId,
        title: content.headline || base.title,
        recipientName: recipientName.trim() || undefined,
        senderName: senderName.trim() || undefined,
        colors,
        content,
        visualPersonality,
        enableDatePicker,
        isRtl,
        customSlug: slug || undefined,
      });
      soundEngine.playYesFanfare();
      triggerHaptic("celebrationBoom");
      setGeneratedSlug(result.slug);
      onExperienceCreated?.(result.slug);
      try {
        const historyItem: StudioHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          title: content.headline || base.title,
          slug: result.slug,
          templateId: base.templateId,
          recipientName: recipientName.trim(),
          senderName: senderName.trim(),
          colors,
          content,
          visualPersonality,
          enableDatePicker,
          isRtl,
          customSlugInput: slug || "",
        };
        const existing = JSON.parse(localStorage.getItem("wouldyou_studio_history") || "[]");
        const updated = [historyItem, ...existing.filter((item: any) => item.slug !== result.slug)].slice(0, 30);
        localStorage.setItem("wouldyou_studio_history", JSON.stringify(updated));
        setHistoryList(updated);
      } catch (e) {}
      setStepIdx(STEPS.length); // past the last step = "done" state
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = () => {
    if (!generatedSlug) return;
    triggerHaptic("impactMedium");
    soundEngine.playClickSound();
    navigator.clipboard.writeText(
      typeof window !== "undefined" ? `${window.location.origin}${generatedSlug}` : generatedSlug
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const previewTemplate: ExperienceTemplate = {
    ...base,
    title: content.headline || base.title,
    recipientName: recipientName.trim() || undefined,
    senderName: senderName.trim() || undefined,
    colors,
    content,
    visualPersonality,
    enableDatePicker,
    isRtl,
    slug: generatedSlug || "/preview",
  };

  const slideVariants = {
    enter: { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  return (
    <div suppressHydrationWarning className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* ── FULL SCREEN LIVE PREVIEW MODAL ── */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col"
          >
            <div className="p-4 flex items-center justify-between bg-zinc-950 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-sm font-extrabold tracking-tight">Interactive Live Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullPreview(false)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" /> Close Preview
              </button>
            </div>
            <div className="flex-1 overflow-y-auto relative">
              <ExperienceView
                template={previewTemplate}
                isPreview={true}
                onExitPreview={() => setShowFullPreview(false)}
                previewStep={currentStepId === "celebration" ? "celebration" : "question"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN STUDIO WIZARD CARD (FULL WIDTH) ── */}
      <div className="rounded-[2rem] sm:rounded-[3rem] bg-white/95 border border-black/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.08)] p-4 sm:p-8 lg:p-10 flex flex-col h-full min-h-[580px] lg:min-h-0 w-full min-w-0">
        {/* Top Header & Preview Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-100">
          <div>
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Experience Studio ✨</h2>
            <p className="text-xs text-zinc-500 font-medium">Create your interactive invitation step by step.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("tick");
                soundEngine.playClickSound();
                try {
                  const saved = localStorage.getItem("wouldyou_studio_history");
                  if (saved) setHistoryList(JSON.parse(saved));
                } catch (e) {}
                setShowHistoryModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900/5 hover:bg-zinc-900/10 border border-black/10 text-zinc-800 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
            >
              <HistoryIcon className="w-4 h-4 text-pink-600" />
              <span>History</span>
              {historyList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-black">{historyList.length}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 hover:bg-pink-500/15 border border-pink-500/20 text-pink-600 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Test Live Preview</span>
            </button>
          </div>
        </div>

        {/* ── HISTORY MODAL ── */}
        <AnimatePresence>
          {showHistoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="w-full max-w-xl rounded-3xl bg-white border border-black/10 shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                      <HistoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 leading-none">Saved History & Drafts</h3>
                      <p className="text-xs text-zinc-500 font-medium mt-1">Easily restore past customizations or links.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(false)}
                    className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    onClick={saveCurrentToHistory}
                    className="w-full py-3 px-4 rounded-2xl bg-zinc-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-pink-400" />
                    <span>+ Save Current Work to History</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {historyList.length === 0 ? (
                    <div className="text-center py-10 text-zinc-400">
                      <HistoryIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold text-zinc-600">No saved history yet</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Your generated links and manual saves will appear right here.</p>
                    </div>
                  ) : (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-zinc-50 border border-black/5 hover:border-pink-500/30 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-zinc-900 truncate">
                              {item.recipientName ? `For ${item.recipientName}` : item.title || "Custom Invitation"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-extrabold uppercase tracking-wide">
                              {item.templateId}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            {item.slug && (
                              <a
                                href={item.slug}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 font-bold hover:underline flex items-center gap-1 truncate"
                              >
                                <span>{item.slug}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => restoreFromHistory(item)}
                            className="px-3.5 py-2 rounded-xl bg-pink-500 text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-pink-600 transition-colors shadow-sm cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-2 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {historyList.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("impactMedium");
                        localStorage.removeItem("wouldyou_studio_history");
                        setHistoryList([]);
                      }}
                      className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Clear All History
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Progress Bar */}
        {stepIdx < STEPS.length && <StepProgress current={stepIdx} steps={STEPS} />}

        {/* Done State */}
        {stepIdx >= STEPS.length && generatedSlug ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="my-auto rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-5 sm:p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto w-full min-w-0 overflow-hidden shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 shrink-0">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 mb-2 truncate">Experience Created! 🎉</h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium">Your interactive invitation is live. Share the link below with your partner and watch responses arrive!</p>
            </div>

            <div className="rounded-2xl bg-white border border-black/10 p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 text-left shadow-md w-full min-w-0">
              <span className="text-xs sm:text-sm font-mono font-bold text-zinc-900 truncate flex-1 min-w-0">
                {typeof window !== "undefined" ? `${window.location.origin}${generatedSlug}` : generatedSlug}
              </span>
              <button
                suppressHydrationWarning
                type="button"
                onClick={copyLink}
                className="shrink-0 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                style={{ backgroundColor: copied ? "#22c55e" : "#111318", color: "white" }}
              >
                {copied ? <><Check className="w-4 h-4 shrink-0" /> Copied</> : <><Copy className="w-4 h-4 shrink-0" /> Copy Link</>}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-4 w-full min-w-0">
              <a
                href={generatedSlug}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-4 sm:px-6 rounded-2xl bg-zinc-950 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg min-w-0 truncate"
              >
                <span className="truncate">Open Invitation</span> <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <a
                href={`/admin${generatedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-4 sm:px-6 rounded-2xl bg-white text-zinc-800 font-extrabold text-sm border border-black/10 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm min-w-0 truncate"
              >
                <span className="truncate">Analytics Dashboard</span> 📊
              </a>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepId}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 flex-1 overflow-y-auto pr-1"
              >
                {/* ── STEP 1: Templates ── */}
                {currentStepId === "template" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-zinc-900">Choose a Base Template</h3>
                      <p className="text-xs text-zinc-500 font-medium">Pick a prebuilt theme to get started. You can customize every word and color next.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {PREBUILT_TEMPLATES.map((tmpl) => {
                        const isSelected = base.templateId === tmpl.templateId;
                        return (
                          <div
                            key={tmpl.templateId}
                            onClick={() => selectTemplate(tmpl)}
                            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between min-h-[115px] relative overflow-hidden group ${
                              isSelected
                                ? "border-pink-500 bg-pink-50/60 shadow-md ring-2 ring-pink-500/20"
                                : "border-zinc-200/90 hover:border-zinc-300 bg-white hover:bg-zinc-50/50 shadow-2xs"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="text-sm font-extrabold text-zinc-900 group-hover:text-pink-600 transition-colors leading-tight">
                                  {tmpl.title}
                                </span>
                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full border border-zinc-200 group-hover:border-zinc-300 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-zinc-300 transition-colors" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                                {tmpl.content.headline}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100/90">
                              <div className="flex items-center -space-x-1">
                                <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: tmpl.colors.primary }} />
                                <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: tmpl.colors.secondary }} />
                                <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: tmpl.colors.accent }} />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-400 capitalize tracking-tight">
                                {tmpl.visualPersonality} effect
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Names ── */}
                {currentStepId === "names" && (
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-black text-zinc-900">Personalize Names</h3>
                      <p className="text-xs text-zinc-500 font-medium">Add personal touches so they know it was made just for them (both optional).</p>
                    </div>

                    <div className="space-y-5 rounded-3xl bg-zinc-50 border border-zinc-200/80 p-6 sm:p-8">
                      <div>
                        <FieldLabel hint="Who are you asking?">Recipient&apos;s name</FieldLabel>
                        <TextInput value={recipientName} onChange={setRecipientName} placeholder="e.g. 3862, Alex..." />
                      </div>
                      <div>
                        <FieldLabel hint="Who is it from?">Your name (sender)</FieldLabel>
                        <TextInput value={senderName} onChange={setSenderName} placeholder="e.g. Dev, Secret Admirer..." />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Copy ── */}
                {currentStepId === "copy" && (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-zinc-900">Customize Copy</h3>
                      <p className="text-xs text-zinc-500 font-medium">Every headline and button label can be tailored exactly to inside jokes.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4 rounded-3xl bg-zinc-50 border border-zinc-200/80 p-6">
                        <div className="font-extrabold text-xs text-pink-600 uppercase tracking-wider">Initial Question Card</div>
                        <div>
                          <FieldLabel>Main Headline</FieldLabel>
                          <TextInput value={content.headline} onChange={(v) => setContent({ ...content, headline: v })} />
                        </div>
                        <div>
                          <FieldLabel>Subtext (Optional)</FieldLabel>
                          <Textarea placeholder="Optional description or pitch..." value={content.subtext || ""} onChange={(v) => setContent({ ...content, subtext: v })} rows={3} />
                        </div>
                      </div>

                      <div className="space-y-4 rounded-3xl bg-zinc-50 border border-zinc-200/80 p-6">
                        <div className="font-extrabold text-xs text-pink-600 uppercase tracking-wider">Button Labels &amp; Celebration</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FieldLabel>Yes Button</FieldLabel>
                            <TextInput value={content.yesBtnText} onChange={(v) => setContent({ ...content, yesBtnText: v })} />
                          </div>
                          <div>
                            <FieldLabel>No Button </FieldLabel>
                            <TextInput value={content.noBtnText} onChange={(v) => setContent({ ...content, noBtnText: v })} />
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Runaway Taunt Options (Appears as they chase the No button! 4 options)</FieldLabel>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {[0, 1, 2, 3].map((idx) => {
                              const currentOpts = content.noBtnOptions || ["Nice try! 🏃‍♂️", "Too slow! 💨", "Nope 🛑", "Catch me! 👻"];
                              return (
                                <TextInput
                                  key={idx}
                                  placeholder={`Taunt ${idx + 1}`}
                                  value={currentOpts[idx] || ""}
                                  onChange={(val) => {
                                    const updated = [...(content.noBtnOptions || ["Nice try! 🏃‍♂️", "Too slow! 💨", "Nope 🛑", "Catch me! 👻"])];
                                    updated[idx] = val;
                                    setContent({ ...content, noBtnOptions: updated });
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* iOS Style Toggles for Date Picker & RTL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div
                        onClick={() => {
                          triggerHaptic("tick");
                          soundEngine.playClickSound(1020);
                          setEnableDatePicker(!enableDatePicker);
                        }}
                        className="rounded-3xl bg-zinc-50 border border-zinc-200/80 p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-100/70 transition-all select-none shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                            <span>Calendar / Date Picker</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold">Optional</span>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                            Show interactive date &amp; time picker immediately after they click Yes!
                          </p>
                        </div>
                        <div
                          className={`w-13 h-7 rounded-full transition-colors duration-300 p-1 relative flex items-center shrink-0 ${
                            enableDatePicker ? "bg-emerald-500" : "bg-zinc-300"
                          }`}
                          style={{ width: "52px", height: "30px" }}
                        >
                          <motion.div
                            animate={{ x: enableDatePicker ? 22 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-5.5 h-5.5 rounded-full bg-white shadow-md"
                            style={{ width: "22px", height: "22px" }}
                          />
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          triggerHaptic("tick");
                          soundEngine.playClickSound(1030);
                          setIsRtl(!isRtl);
                        }}
                        className="rounded-3xl bg-zinc-50 border border-zinc-200/80 p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-100/70 transition-all select-none shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                            <span>RTL Text Direction</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold">Arabic / Hebrew</span>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                            Format typography &amp; layout for right-to-left languages across your link.
                          </p>
                        </div>
                        <div
                          className={`w-13 h-7 rounded-full transition-colors duration-300 p-1 relative flex items-center shrink-0 ${
                            isRtl ? "bg-purple-600" : "bg-zinc-300"
                          }`}
                          style={{ width: "52px", height: "30px" }}
                        >
                          <motion.div
                            animate={{ x: isRtl ? 22 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-5.5 h-5.5 rounded-full bg-white shadow-md"
                            style={{ width: "22px", height: "22px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Post-Yes Celebration ── */}
                {currentStepId === "celebration" && (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-black text-zinc-900">Post-Yes Celebration Screen</h3>
                      <p className="text-xs text-zinc-500 font-medium">Configure the celebration screen displayed immediately when they click Yes! 🎉</p>
                    </div>

                    <div className="space-y-5 rounded-3xl bg-zinc-50 border border-zinc-200/80 p-6 w-full">
                      <div className="font-extrabold text-xs text-pink-600 uppercase tracking-wider">Celebration Details</div>
                      <div>
                        <FieldLabel>Post-Yes Headline</FieldLabel>
                        <TextInput value={content.postYesHeadline} onChange={(v) => setContent({ ...content, postYesHeadline: v })} />
                      </div>
                      <div>
                        <FieldLabel>Post-Yes Subtext (Optional)</FieldLabel>
                        <Textarea placeholder="Optional celebration message..." value={content.postYesSubtext || ""} onChange={(v) => setContent({ ...content, postYesSubtext: v })} rows={3} />
                      </div>
                      <div>
                        <FieldLabel>Post-Yes Handwritten Note ✍️</FieldLabel>
                        <TextInput
                          placeholder="It's a date! Can't wait to see you then 💕"
                          value={content.handwrittenMessage || ""}
                          onChange={(v) => setContent({ ...content, handwrittenMessage: v })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: Colors & Effects ── */}
                {currentStepId === "colors" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-zinc-900">Palette &amp; Visual Effects</h3>
                      <p className="text-xs text-zinc-500 font-medium">Select floating particle physics and curated Apple-grade color schemes.</p>
                    </div>

                    <div>
                      <FieldLabel>Particle Visual Personality</FieldLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
                        {[
                          { id: "roses", label: "Roses 🌹", desc: "Floating petals" },
                          { id: "stars", label: "Stars ✨", desc: "Twinkling lights" },
                          { id: "golden", label: "Golden 🍂", desc: "Warm sparkles" },
                          { id: "glitch", label: "Glitch ⚡", desc: "Cyber cyberpunk" },
                          { id: "chaos", label: "Chaos ❤️‍🔥", desc: "Intense energy" },
                        ].map((vp) => (
                          <button
                            key={vp.id}
                            type="button"
                            onClick={() => setVisualPersonality(vp.id as VisualPersonality)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${visualPersonality === vp.id
                              ? "border-pink-500 bg-pink-50/70 text-pink-900 font-extrabold shadow-md"
                              : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-600 font-medium"
                              }`}
                          >
                            <div className="text-sm font-bold">{vp.label}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{vp.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <FieldLabel>Prebuilt Curated Color Palettes</FieldLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
                        {COLOR_PRESETS.map((p) => {
                          const isSelected = colors.primary === p.colors.primary;
                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => setColors(p.colors)}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                                ? "border-pink-500 bg-pink-50/60 shadow-md ring-2 ring-pink-500/20"
                                : "border-zinc-200 hover:border-zinc-300 bg-zinc-50"
                                }`}
                            >
                              <span className="text-xs font-extrabold text-zinc-800 mb-2">{p.name}</span>
                              <div className="flex gap-1">
                                <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: p.colors.primary }} />
                                <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: p.colors.secondary }} />
                                <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: p.colors.accent }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 6: Link ── */}
                {currentStepId === "slug" && (
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-black text-zinc-900">Custom URL Slug</h3>
                      <p className="text-xs text-zinc-500 font-medium">Pick a memorable link name that will be shared with your recipient.</p>
                    </div>

                    <div className="rounded-3xl bg-zinc-50 border border-zinc-200/80 p-6 sm:p-8 space-y-6">
                      <div>
                        <FieldLabel hint="Optional custom URL">Custom Link Path</FieldLabel>
                        <div className="flex items-center rounded-2xl border border-black/[0.08] bg-white focus-within:ring-2 focus-within:ring-pink-500/30 overflow-hidden shadow-inner">
                          <span className="pl-4 pr-1 text-xs text-zinc-400 font-mono whitespace-nowrap">wouldu.vercel.app/ask/</span>
                          <input
                            suppressHydrationWarning
                            type="text"
                            value={customSlugInput}
                            onChange={(e) => setCustomSlugInput(e.target.value)}
                            placeholder="date-with-3862"
                            className="flex-1 py-3 pr-4 text-sm font-mono font-bold text-zinc-900 bg-transparent focus:outline-none placeholder-zinc-400"
                          />
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">Only lowercase letters, numbers, and hyphens. Leave blank for auto-generation.</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-200/60">
                        <div className="text-xs font-black text-zinc-800 uppercase tracking-wider mb-3">Summary Check</div>
                        <ul className="text-xs text-zinc-600 space-y-2 font-medium bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
                          <li>🎨 <b>Theme:</b> {base.title} ({visualPersonality})</li>
                          <li>👤 <b>Recipient:</b> {recipientName || "Anonymous / Anyone"} {senderName ? `(from ${senderName})` : ""}</li>
                          <li>💬 <b>Headline:</b> &ldquo;{content.headline}&rdquo;</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-zinc-100 shrink-0 w-full min-w-0 overflow-visible">
              <button
                suppressHydrationWarning
                type="button"
                onClick={goBack}
                disabled={stepIdx === 0}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0 ${stepIdx === 0 ? "hidden sm:flex opacity-0 pointer-events-none" : "w-full sm:w-auto"}`}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" /> Back
              </button>

              {stepIdx < STEPS.length - 1 ? (
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={goNext}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-zinc-950 text-white font-black text-sm hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-xl transition-all shadow-lg cursor-pointer w-full sm:w-auto shrink-0 ml-auto whitespace-nowrap"
                >
                  Next <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              ) : (
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all cursor-pointer disabled:opacity-60 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 w-full sm:w-auto ml-auto shrink-0 whitespace-nowrap"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isGenerating ? (
                    <><Sparkles className="w-4 h-4 animate-spin shrink-0" /> <span>Generating Link…</span></>
                  ) : (
                    <><Heart className="w-4 h-4 fill-white animate-bounce shrink-0" /> <span>Generate Interactive Invitation</span></>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
