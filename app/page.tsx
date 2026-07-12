"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Check,
  GitFork,
  ShieldCheck,
  Zap,
  Code2,
} from "lucide-react";
import { Navbar } from "../components/Navbar";

const TESTIMONIALS = [
  {
    author: "Alex & 3862",
    role: "Valentine's Ask · Valentine's Day theme",
    quote:
      "She laughed for 5 minutes straight trying to click 'No' before finally clicking 'Yes'. Best ask ever made.",
    badge: "Valentine's Day",
    color: "from-pink-50 to-rose-50 text-pink-600 border-pink-200",
  },
  {
    author: "Liam & Jessica",
    role: "Date Night Ask · Date Night theme",
    quote:
      "The analytics drawer in the footer is pure genius. I knew exact date and time immediately without texting.",
    badge: "Date Night",
    color: "from-purple-50 to-indigo-50 text-purple-600 border-purple-200",
  },
  {
    author: "Dev & Maya",
    role: "Anniversary · Anniversary theme",
    quote:
      "Apple-level typography and buttery smooth 240fps animations. Felt like sending a high-end interactive app.",
    badge: "Anniversary",
    color: "from-amber-50 to-yellow-50 text-amber-600 border-amber-200",
  },
  {
    author: "Elena & Marcus",
    role: "Special Ask · Chaos Heart theme",
    quote:
      "No sign-up, no paywalls, zero friction. Created our link in under 45 seconds and sent it right via iMessage.",
    badge: "Special Ask",
    color: "from-emerald-50 to-teal-50 text-emerald-600 border-emerald-200",
  },
];

export default function LandingPage() {
  const [copiedCmd, setCopiedCmd] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("git clone https://github.com/omar-Suleiman14/wouldu.git && cd wouldu && npm i && npm run dev");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div suppressHydrationWarning className="relative min-h-screen w-full bg-[#F8F9FD] text-zinc-950 selection:bg-pink-500 selection:text-white font-sans overflow-x-hidden">
      {/* ── PRISTINE LIGHT-MODE ENGINEERING / RULER GRID BACKGROUND ── */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.14) 1px, transparent 1px)
          `,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Top Architectural Ruler Bar & Coordinate Markers */}
      <div className="pointer-events-none absolute top-20 left-0 right-0 z-10 hidden sm:flex items-center justify-between px-8 py-2 border-b border-black/[0.04] text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
        <div className="flex items-center gap-4">
          <span>+ 01.00</span>
          <span>------------+------------</span>
          <span>SYS.INVITE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>[ 00 : 00 : 240 FPS ]</span>
          <span>------------+------------</span>
          <span>+ 02.00</span>
        </div>
      </div>

      {/* Subtle central radial glow directly behind the massive text */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[850px] h-[550px] bg-gradient-to-tr from-pink-500/15 via-purple-500/10 to-rose-400/10 blur-[130px] rounded-full z-0" />
      <div className="pointer-events-none absolute top-[1100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-t from-amber-500/10 via-rose-500/5 to-transparent blur-[160px] rounded-full z-0" />

      {/* ── TOP NAV ── */}
      <Navbar onNavigateSection={scrollToSection} />

      {/* ── HERO SECTION ── */}
      <section className="relative z-20 min-h-[85vh] flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center max-w-6xl mx-auto">
        {/* Floating sleek light-mode glass tiles (left & right side "stuff") */}
        <motion.div
          initial={{ opacity: 0, x: -40, rotate: -15 }}
          animate={{ opacity: 1, x: 0, rotate: -8 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="hidden lg:flex absolute top-36 left-8 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/95 border border-black/[0.08] backdrop-blur-2xl items-center justify-center shadow-[0_24px_54px_rgba(0,0,0,0.08)] group hover:rotate-0 transition-all duration-300"
        >
          <div className="absolute -top-3 -left-2 px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-[9px] font-bold tracking-widest uppercase opacity-80">
            ICON.01
          </div>
          <span className="text-3xl sm:text-4xl select-none group-hover:scale-110 transition-transform">🌹</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40, rotate: 15 }}
          animate={{ opacity: 1, x: 0, rotate: 8 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="hidden lg:flex absolute top-44 right-10 w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/95 border border-black/[0.08] backdrop-blur-2xl items-center justify-center shadow-[0_24px_54px_rgba(0,0,0,0.08)] group hover:rotate-0 transition-all duration-300"
        >
          <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-[9px] font-bold tracking-widest uppercase opacity-80">
            ICON.02
          </div>
          <span className="text-3xl sm:text-4xl select-none group-hover:scale-110 transition-transform">💖</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 20 }}
          animate={{ opacity: 1, y: 0, rotate: 12 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="hidden lg:flex absolute bottom-24 left-16 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 border border-black/[0.08] backdrop-blur-2xl items-center justify-center shadow-[0_20px_44px_rgba(0,0,0,0.08)] rotate-[12deg]"
        >
          <span className="text-2xl sm:text-3xl select-none">✨</span>
        </motion.div>

        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-black/[0.08] text-xs font-extrabold text-zinc-700 backdrop-blur-md mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <span className="font-mono uppercase tracking-wider text-[11px] text-zinc-800">GPU Accelerated</span>
        </motion.div>

        {/* Massive Bold Heading ("Big text") */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.4rem] font-black tracking-tighter leading-[1.03] max-w-5xl mx-auto mb-8 text-zinc-950 select-none"
        >
          The question they <br className="hidden sm:inline" />
          can&apos;t escape.
        </motion.h1>

        {/* Crisp Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg sm:text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-medium leading-relaxed mb-10"
        >
          Because some questions deserve more than just a text message.
        </motion.p>

        {/* Sleek CTA Button with Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-4 mb-16 w-full max-w-md mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link
              href="/studio"
              className="w-full sm:w-auto px-10 py-4 sm:py-5 rounded-2xl bg-zinc-950 text-white font-black text-base shadow-2xl shadow-black/20 hover:bg-zinc-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
            >
              <span>Launch Studio</span>
              <span className="group-hover:translate-x-1 transition-transform font-mono text-pink-400">&rarr;</span>
            </Link>
            <Link
              href="/date-night"
              className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 font-extrabold text-base border border-black/[0.08] shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>See Live Demo ✨</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>100% Free &amp; Open-Source · No Login Required</span>
          </div>
        </motion.div>
      </section>

      {/* ── HERO BROWSER MOCKUP (Expansive 90% Width Glass Window) ── */}
      <div className="relative z-20 w-[90%] max-w-[1440px] mx-auto mb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative rounded-[2.5rem] border border-black/[0.10] bg-white shadow-[0_48px_120px_rgba(0,0,0,0.12)] overflow-hidden text-left"
        >
          {/* Browser Chrome Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-zinc-100/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-black/[0.08]" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-black/[0.08]" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-black/[0.08]" />
            </div>
            <div className="flex-1 max-w-xl mx-6">
              <div className="w-full flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white border border-black/[0.08] text-xs font-mono text-zinc-600 shadow-sm truncate">
                {/* <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" /> */}
                <span>wouldu.vercel.app/ask/valentine-for-3862</span>
              </div>
            </div>
            <div className="text-xs font-bold text-zinc-600 flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> 
              <span>240FPS · GPU Native</span>
            </div>
          </div>

          {/* Interactive Hero Card Preview Canvas */}
          <div className="p-12 sm:p-24 flex flex-col items-center justify-center min-h-[560px] sm:min-h-[660px] relative overflow-hidden bg-gradient-to-b from-[#F2F5FA] to-[#E5EBF5]">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-radial-gradient from-pink-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg rounded-[2.8rem] bg-white text-zinc-950 p-10 sm:p-14 text-center shadow-[0_36px_90px_rgba(0,0,0,0.14)] border border-black/[0.08]">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-extrabold text-pink-600 mb-6">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                To: 3862 · from Dev
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight text-zinc-950">
                Will you go on a date with me? 🌹
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">
                I promise endless laughter, spontaneous adventures, and zero terrible movie recommendations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 relative min-h-[54px]">
                <Link
                  href="/studio"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                >
                  <span>Count me in! 🍸</span>
                  <Heart className="w-4 h-4 fill-white animate-bounce" />
                </Link>
                <div className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-200/70 backdrop-blur-md text-zinc-600 font-bold text-sm border border-black/[0.10] cursor-not-allowed select-none flex items-center justify-center gap-1.5 shadow-sm">
                  <span>I&apos;m boring 😴</span>
                  <span className="text-[10px] uppercase font-mono text-pink-600 bg-pink-50 px-2 py-0.5 rounded ml-1 border border-pink-100 font-extrabold">Runaway</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── SOCIAL PROOF / TESTIMONIALS (Seamless over Grid Canvas) ── */}
      <section className="relative z-20 py-16 px-6 max-w-7xl mx-auto mb-20 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-950 mb-4 select-none">
          Tolerated &amp; loved by over <span className="text-pink-600">100,000+</span> couples
        </h2>
        <p className="text-base sm:text-lg text-zinc-500 mb-14 max-w-2xl mx-auto font-medium">
          Every invitation is personalized down to the exact hex code, font, and button physics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              suppressHydrationWarning
              className="rounded-[2.2rem] p-7 bg-white/90 backdrop-blur-2xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_32px_76px_rgba(0,0,0,0.11)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div suppressHydrationWarning>
                <div suppressHydrationWarning className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border bg-gradient-to-r mb-5 shadow-sm ${t.color}`}>
                  {t.badge}
                </div>
                <p suppressHydrationWarning className="text-sm sm:text-base text-zinc-700 font-normal leading-relaxed mb-8 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div suppressHydrationWarning className="pt-4 border-t border-black/[0.05]">
                <div suppressHydrationWarning className="font-extrabold text-zinc-950 text-sm sm:text-base">{t.author}</div>
                <div suppressHydrationWarning className="text-xs font-medium text-zinc-500 mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ONE BUTTON / FEATURE SPLIT SECTION ── */}
      <section id="templates" className="py-24 px-6 border-t border-black/[0.06] relative bg-[#F7F8FC]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Analytics & Date Picker Preview Card */}
          <div className="rounded-3xl border border-black/[0.08] bg-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 border border-pink-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-zinc-950">Creator Live Analytics</div>
                  <div className="text-xs text-zinc-500">Real-time response tracking</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl bg-zinc-50 border border-black/[0.06] p-4 text-center">
                <div className="text-2xl font-black text-zinc-950">124</div>
                <div className="text-xs font-bold text-zinc-500 mt-1">Total Views</div>
              </div>
              <div className="rounded-2xl bg-pink-50 border border-pink-200 p-4 text-center">
                <div className="text-2xl font-black text-pink-600">118</div>
                <div className="text-xs font-bold text-pink-600 mt-1">Said Yes!</div>
              </div>
              <div className="rounded-2xl bg-zinc-50 border border-black/[0.06] p-4 text-center">
                <div className="text-2xl font-black text-zinc-600">6</div>
                <div className="text-xs font-bold text-zinc-500 mt-1">Escaped</div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8F9FD] border border-black/[0.06] p-4 text-xs space-y-3">
              <div className="font-extrabold text-zinc-500 uppercase tracking-wider text-[10px]">Recent Confirmed Dates</div>
              <div className="flex items-center justify-between py-1.5 border-b border-black/[0.06] text-zinc-800">
                <span className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> 3862
                </span>
                <span className="text-pink-600 font-mono font-bold">Saturday, Feb 14 · 7:30 PM</span>
              </div>
              <div className="flex items-center justify-between py-1 text-zinc-700">
                <span className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Maya
                </span>
                <span className="text-pink-600 font-mono font-bold">Friday, Aug 22 · 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-200 text-xs font-extrabold text-pink-600">
              <Zap className="w-3.5 h-3.5" />
              <span>One Link To Ask &amp; Celebrate</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12] text-zinc-950">
              One link to ask, delight, and schedule the date.
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Every invitation comes equipped with an integrated date and time picker right after they say Yes. As soon as your partner selects their preferred availability, it synchronizes into your hidden footer drawer instantly.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-zinc-800 font-bold">
                <div className="w-6 h-6 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Zero sign-up required for both you and your recipient.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-800 font-bold">
                <div className="w-6 h-6 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Apple-grade glassmorphic layouts with custom hex colors.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-800 font-bold">
                <div className="w-6 h-6 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>GPU-accelerated runaway button physics that never fail.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE / PHILOSOPHY ("If you don't like something, fork it.") ── */}
      <section className="py-24 px-6 border-t border-black/[0.06] bg-[#F4F6FB]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-zinc-700 shadow-sm">
            <Code2 className="w-3.5 h-3.5 text-pink-600" />
            <span>Open Source Philosophy</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-zinc-950">
            If you don&apos;t like something, <span className="text-pink-600 underline decoration-pink-300 underline-offset-8">fork it</span>.
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Built from the ground up We don&apos;t lock features behind paywalls or subscriptions. You have complete freedom to fork, self-host, or customize every single component.
          </p>

          {/* Code terminal box — pristine Apple pearl light mode styling */}
          <div className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-8 text-left font-mono text-xs sm:text-sm shadow-[0_24px_64px_rgba(0,0,0,0.06)] relative max-w-3xl mx-auto text-zinc-800 overflow-x-auto">
            <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-black/[0.06] text-zinc-500 text-xs font-sans font-bold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                Terminal · zsh
              </span>
              <button
                type="button"
                onClick={copyCommand}
                className="text-pink-600 hover:text-pink-700 transition-colors font-sans font-extrabold text-xs flex items-center gap-1.5 cursor-pointer bg-pink-50 px-3 py-1 rounded-full border border-pink-100"
              >
                {copiedCmd ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</> : <>Copy command</>}
              </button>
            </div>
            <div className="space-y-2.5 font-bold">
              <p className="text-zinc-400 font-normal"># Clone &amp; launch your own interactive studio locally</p>
              <p className="break-all sm:break-normal whitespace-pre-wrap text-zinc-900">
                <span className="text-pink-600 font-black">$</span> git clone https://github.com/omar-Suleiman14/wouldu.git
              </p>
              <p className="break-all sm:break-normal whitespace-pre-wrap text-zinc-900">
                <span className="text-pink-600 font-black">$</span> cd wouldu &amp;&amp; npm install &amp;&amp; npm run dev
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL BOTTOM CTA ── */}
      <section className="py-24 px-6 border-t border-black/[0.06] text-center relative overflow-hidden bg-gradient-to-b from-[#F7F8FC] to-white">
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-zinc-950">
            Your invitations deserve better <br className="hidden sm:inline" />
            than a boring text message.
          </h2>
          <p className="text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Create an experience they will never forget in under 60 seconds. Custom colors, runaway buttons, and immediate date scheduling.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/studio"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-base shadow-xl shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Studio Now</span>
            </Link>
            <Link
              href="/valentine"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-base border border-black/[0.08] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>See Valentine&apos;s Day Theme 🌹</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER (Normal Compact Light Footer with Subtle Background) ── */}
      <footer className="w-full py-8 px-6 border-t border-black/[0.06] bg-[#F0F2F8] text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-700">
            <span>© khomod inc. 2026</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-zinc-600">
            <Link href="/studio" className="hover:text-zinc-950 transition-colors">Studio</Link>
            <Link href="/valentine" className="hover:text-zinc-950 transition-colors">Valentine Demo</Link>
            <a href="https://github.com/omar-Suleiman14/wouldu" target="_blank" rel="noreferrer" className="hover:text-zinc-950 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
