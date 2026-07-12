"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PREBUILT_TEMPLATES, ExperienceTemplate } from "../../lib/templates";
import { Navbar } from "../../components/Navbar";
import { CustomizerStudio } from "../../components/CustomizerStudio";
import { ExperienceView } from "../../components/ExperienceView";
import { triggerHaptic } from "../../lib/haptics";
import { Sparkles } from "lucide-react";

export default function StudioPage() {
  const [selected] = useState<ExperienceTemplate>(PREBUILT_TEMPLATES[0]);
  const [livePreview, setLivePreview] = useState<ExperienceTemplate | null>(null);

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen w-full text-[#111318] overflow-x-hidden flex flex-col"
      style={{
        backgroundColor: "#FAFAFA",
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}
    >
      <Navbar />

      {/* ── DESKTOP SINGLE-PAGE CONTAINER (NO WINDOW SCROLL) ── */}
      <div className="hidden lg:flex lg:h-screen lg:pt-20 lg:pb-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 overflow-hidden">
        <div className="w-full h-full rounded-[2.5rem] bg-[#FAFAFA] border border-black/[0.07] shadow-xl overflow-hidden flex flex-col">
          <CustomizerStudio
            key={selected.templateId + "-desktop"}
            initialTemplate={selected}
            onExperienceCreated={() => { triggerHaptic("notificationSuccess"); }}
          />
        </div>
      </div>

      {/* ── MOBILE NORMAL SCROLLING CONTAINER ── */}
      <div className="block lg:hidden pt-20 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="mb-6 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-extrabold text-pink-600 uppercase tracking-wide mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
            Build Your Experience
          </h1>
        </div>
        <div className="rounded-[2rem] bg-[#FAFAFA] border border-black/[0.07] shadow-xl overflow-hidden">
          <CustomizerStudio
            key={selected.templateId + "-mobile"}
            initialTemplate={selected}
            onExperienceCreated={() => { triggerHaptic("notificationSuccess"); }}
          />
        </div>
      </div>

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
