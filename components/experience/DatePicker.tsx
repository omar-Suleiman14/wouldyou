"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EXPERIENCE_COPY, intlLocale } from "@/lib/experienceCopy";
import { toIsoDate } from "@/lib/format";
import { LIMITS } from "@/lib/limits";
import type { Lang } from "@/lib/templates";

interface Props {
  lang: Lang;
  busy: boolean;
  error: string | null;
  onSubmit: (answer: { date?: string; time?: string; message?: string }) => void;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function DatePicker({ lang, busy, error, onSubmit }: Props) {
  const t = EXPERIENCE_COPY[lang];
  const locale = intlLocale(lang);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState("19:00");
  const [message, setMessage] = useState("");

  const weekdays = useMemo(() => {
    const sunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) =>
      new Date(sunday.getFullYear(), 0, 7 + i).toLocaleDateString(locale, { weekday: "narrow" }),
    );
  }, [locale]);

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const list: (Date | null)[] = Array(first).fill(null);
    for (let d = 1; d <= count; d++) list.push(new Date(view.getFullYear(), view.getMonth(), d));
    while (list.length % 7) list.push(null);
    return list;
  }, [view]);

  const canGoBack = view > new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = view.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const shift = (n: number) => setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));

  return (
    <form
      className="x-panel w-full max-w-md text-start"
      onSubmit={(e) => {
        e.preventDefault();
        if (!day) return;
        onSubmit({ date: toIsoDate(day), time: time || undefined, message: message.trim() || undefined });
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <button type="button" className="x-icon-btn" onClick={() => shift(-1)} disabled={!canGoBack} aria-label={t.prevMonth}>
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
        </button>
        <p className="text-sm font-semibold" aria-live="polite">{monthLabel}</p>
        <button type="button" className="x-icon-btn" onClick={() => shift(1)} aria-label={t.nextMonth}>
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-[var(--x-muted)]" aria-hidden>
        {weekdays.map((w, i) => <span key={i} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={t.pickDay}>
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const past = d < today;
          const selected = day?.getTime() === d.getTime();
          const isToday = d.getTime() === today.getTime();
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => setDay(d)}
              aria-pressed={selected}
              aria-label={d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
              className={`x-day ${selected ? "x-day--on" : ""} ${isToday ? "x-day--today" : ""}`}
            >
              {d.toLocaleDateString(locale, { day: "numeric" })}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 border-t border-[var(--x-line)] pt-4">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">{t.time}</span>
          <input type="time" className="x-input" value={time} onChange={(e) => setTime(e.target.value)} step={300} dir="ltr" />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">
            {t.noteLabel} <span className="font-normal text-[var(--x-muted)]">({t.optional})</span>
          </span>
          <textarea
            className="x-input min-h-20 resize-none"
            value={message}
            maxLength={LIMITS.message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.notePlaceholder}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--x-primary)]" role="alert">{error}</p>}

      <div className="mt-4 flex flex-col gap-2">
        <button type="submit" className="x-btn x-btn--primary w-full" disabled={!day || busy}>
          {busy ? t.sending : t.send}
        </button>
        <button
          type="button"
          className="x-btn x-btn--quiet w-full"
          disabled={busy}
          onClick={() => onSubmit({ message: message.trim() || undefined })}
        >
          {t.skip}
        </button>
      </div>
    </form>
  );
}
