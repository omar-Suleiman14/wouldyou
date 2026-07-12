"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Navbar } from "./Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, ArrowLeft, Eye, Check, X, Calendar, Clock,
  User, Sparkles, BarChart3, TrendingUp,
} from "lucide-react";

interface ExperienceAdminClientProps {
  slug: string;
}

function formatTimestamp(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function formatPickedDate(date?: string, time?: string) {
  if (!date) return null;
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  if (!time) return dateStr;
  const [h, m] = time.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  const displayH = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${dateStr} · ${displayH}:${m} ${ampm}`;
}

export function ExperienceAdminClient({ slug }: ExperienceAdminClientProps) {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;

  const experience = useQuery(api.experiences.getExperienceBySlug, { slug: normalizedSlug });
  const responses = useQuery(api.experiences.getResponses, { slug: normalizedSlug });
  const stats = useQuery(api.experiences.getResponseStats, { slug: normalizedSlug });

  const isLoading = experience === undefined || responses === undefined || stats === undefined;

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#FAFAFA]"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }}
    >
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Sparkles className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
        ) : !experience ? (
          <div className="text-center py-32">
            <h1 className="text-3xl font-black text-zinc-950 mb-3">Experience not found</h1>
            <p className="text-zinc-500 mb-6">No experience exists at <code className="text-pink-600">{normalizedSlug}</code></p>
            <Link href="/studio" className="px-5 py-3 rounded-2xl bg-zinc-900 text-white font-bold text-sm">Create one →</Link>
          </div>
        ) : (
          <>
            {/* Header card */}
            <div className="bg-white rounded-3xl border border-black/[0.07] shadow-sm p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-extrabold text-pink-600 uppercase tracking-wide mb-3">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Creator Dashboard
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mb-1">
                    {experience.title}
                  </h1>
                  <p className="text-sm text-zinc-500 font-mono">{normalizedSlug}</p>
                </div>
                <Link
                  href={normalizedSlug}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
                >
                  View live experience →
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Views", value: stats?.views || 0, icon: <Eye className="w-4 h-4" />, color: "text-zinc-600 bg-zinc-100 border-zinc-200" },
                { label: "Responses", value: stats?.total || 0, icon: <TrendingUp className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-100" },
                { label: "Said Yes 💖", value: stats?.yes || 0, icon: <Heart className="w-4 h-4" />, color: "text-pink-600 bg-pink-50 border-pink-100" },
                { label: "Said No", value: stats?.no || 0, icon: <X className="w-4 h-4" />, color: "text-zinc-500 bg-zinc-50 border-zinc-100" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-sm"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border mb-3 ${s.color}`}>
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black text-zinc-950">{s.value}</div>
                  <div className="text-xs font-bold text-zinc-500 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Response rate bar */}
            {(stats?.total || 0) > 0 && (
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Yes Rate</span>
                  <span className="text-sm font-black text-pink-600">
                    {Math.round(((stats?.yes || 0) / (stats?.total || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(((stats?.yes || 0) / (stats?.total || 1)) * 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
                  />
                </div>
              </div>
            )}

            {/* Responses timeline */}
            <div className="bg-white rounded-3xl border border-black/[0.07] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-zinc-900">Responses</h2>
                <span className="text-xs text-zinc-400 font-medium">Live — updates in real time</span>
              </div>

              {(!responses || responses.length === 0) ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-pink-300" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-700 mb-1">No responses yet</h3>
                  <p className="text-sm text-zinc-400 max-w-xs mx-auto">Share the link and watch responses appear here in real time.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.05]">
                  {responses.map((r, i) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors"
                    >
                      {/* Answer badge */}
                      <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-black ${
                        r.answeredYes ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {r.answeredYes ? "✓" : "✗"}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + answer */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-zinc-900">
                            {r.respondentName || "Anonymous"}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                            r.answeredYes
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-50 text-zinc-600 border border-zinc-200"
                          }`}>
                            {r.answeredYes ? <><Check className="w-3 h-3" /> Said Yes!</> : <><X className="w-3 h-3" /> Said No</>}
                          </span>
                        </div>

                        {/* Date picked */}
                        {r.pickedDate && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-pink-600">
                            <Calendar className="w-3 h-3" />
                            <span>{formatPickedDate(r.pickedDate, r.pickedTime)}</span>
                          </div>
                        )}

                        {/* Message */}
                        {r.message && (
                          <p className="text-xs text-zinc-500 mt-1 italic">&ldquo;{r.message}&rdquo;</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(r.createdAt)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
