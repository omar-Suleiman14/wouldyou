"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { soundEngine } from "../lib/audio";
import { triggerHaptic } from "../lib/haptics";
import { Sparkles, Heart, GitFork } from "lucide-react";

interface NavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

export function Navbar({ onNavigateSection }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isStudio = pathname === "/studio";
  const isHome = pathname === "/";

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          : "bg-white/80 backdrop-blur-lg border-b border-black/[0.05]"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => { triggerHaptic("tick"); soundEngine.playClickSound(900); }}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-[1.08] transition-transform duration-200 ease-out">
            <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-zinc-950">
            wouldu<span className="text-pink-600">.app</span>
          </span>
        </Link>

        {/* Right Nav Items */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="https://github.com/omar-Suleiman14/wouldu"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors bg-black/[0.04] hover:bg-black/[0.07] px-3.5 py-1.5 rounded-full border border-black/[0.06]"
          >
            <GitFork className="w-3.5 h-3.5 text-pink-500" />
            <span>Fork on GitHub</span>
          </a>

          {!isStudio && (
            <Link
              href="/studio"
              onClick={() => { triggerHaptic("tick"); soundEngine.playClickSound(); }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
