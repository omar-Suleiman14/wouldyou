import type { Lang } from "./templates";
import { intlLocale } from "./experienceCopy";

/** "2026-02-14" + "19:30" → a Date in the viewer's local time. */
export function toLocalDate(date: string, time?: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time ?? "12:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function formatPicked(date: string, time: string | undefined, lang: Lang = "en"): string {
  const when = toLocalDate(date, time);
  const day = when.toLocaleDateString(intlLocale(lang), { weekday: "long", month: "long", day: "numeric" });
  if (!time) return day;
  const clock = when.toLocaleTimeString(intlLocale(lang), { hour: "numeric", minute: "2-digit" });
  return lang === "ar" ? `${day}، الساعة ${clock}` : `${day} at ${clock}`;
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export function timeAgo(ts: number, now = Date.now()): string {
  const seconds = Math.round((ts - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}
