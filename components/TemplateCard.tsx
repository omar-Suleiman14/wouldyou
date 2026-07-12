"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExperienceTemplate } from "../lib/templates";
import { triggerHaptic } from "../lib/haptics";
import { soundEngine } from "../lib/audio";
import { Heart, Sparkles, Flame, Zap, Trophy, Play, Edit3, Eye, CheckCircle2 } from "lucide-react";

interface TemplateCardProps {
  template: ExperienceTemplate;
  isSelected: boolean;
  onSelect: (template: ExperienceTemplate) => void;
  onPreviewLive?: (template: ExperienceTemplate) => void;
}

export function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreviewLive,
}: TemplateCardProps) {
  const { title, colors, content, visualPersonality, views, yesCount } = template;

  const getPersonalityIcon = () => {
    switch (visualPersonality) {
      case "roses":
        return <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />;
      case "stars":
        return <Sparkles className="w-3.5 h-3.5 text-cyan-500" />;
      case "golden":
        return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
      case "glitch":
        return <Zap className="w-3.5 h-3.5 text-emerald-500" />;
      case "chaos":
        return <Flame className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  const handleSelect = () => {
    triggerHaptic("impactMedium");
    soundEngine.playClickSound(950);
    onSelect(template);
  };

  return (
    <motion.div
      suppressHydrationWarning
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      onClick={handleSelect}
      style={{
        borderColor: isSelected ? colors.primary : "rgba(0, 0, 0, 0.06)",
      }}
      className={`group relative rounded-2xl p-4 sm:p-5 border cursor-pointer overflow-hidden transition-all duration-200 apple-glass ${
        isSelected
          ? "shadow-lg ring-2 ring-pink-500/20"
          : "hover:shadow-md hover:border-black/15"
      }`}
    >
      {/* Subtle top color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-90 transition-opacity"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Top Bar: Personality Pill & Color Palette Swatches */}
      <div className="flex items-center justify-between gap-2.5 mb-3.5 relative z-10 pt-0.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/[0.04] text-zinc-800 border border-black/5">
          {getPersonalityIcon()}
          <span>{title}</span>
        </div>

        {/* Color Palette Dots */}
        <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-black/[0.03] border border-black/5">
          <div
            className="w-3 h-3 rounded-full shadow-2xs"
            style={{ backgroundColor: colors.primary }}
            title="Primary"
          />
          <div
            className="w-3 h-3 rounded-full shadow-2xs"
            style={{ backgroundColor: colors.secondary }}
            title="Secondary"
          />
          <div
            className="w-3 h-3 rounded-full shadow-2xs"
            style={{ backgroundColor: colors.accent }}
            title="Accent"
          />
        </div>
      </div>

      {/* Main Copy Preview */}
      <div className="relative z-10 mb-4">
        <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 line-clamp-2 mb-1 leading-snug">
          {content.headline}
        </h3>
        <p className="text-xs text-zinc-600 line-clamp-2 font-normal leading-relaxed">
          {content.subtext}
        </p>
      </div>

      {/* Interactive Button Preview Mini-Row */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div
          className="flex-1 py-2 px-2.5 rounded-xl text-center text-[11px] font-extrabold text-white shadow-sm truncate"
          style={{ backgroundColor: colors.primary }}
        >
          {content.yesBtnText}
        </div>
        <div className="flex-1 py-2 px-2.5 rounded-xl text-center text-[11px] font-bold text-zinc-700 bg-black/[0.05] border border-black/5 truncate">
          {content.noBtnText}
        </div>
      </div>

      {/* Footer / Stats and Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] text-xs text-zinc-500 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            {views || 100}+
          </span>
          {yesCount !== undefined && (
            <span className="flex items-center gap-1 text-pink-600 font-bold">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              {yesCount} yes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onPreviewLive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic("tick");
                soundEngine.playClickSound(1050);
                onPreviewLive(template);
              }}
              className="px-3 py-1.5 rounded-xl bg-black/[0.06] hover:bg-black/10 text-zinc-900 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Test Live Experience"
            >
              <Play className="w-3 h-3 fill-zinc-900" />
              <span>Test</span>
            </button>
          )}

          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
              isSelected
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-black/[0.03] text-zinc-600 group-hover:bg-black/[0.08] group-hover:text-zinc-900"
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
