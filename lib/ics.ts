import { toLocalDate } from "./format";

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
}

/** Downloads a one-event .ics file. Without a time it becomes an all-day event. */
export function downloadIcs({ title, date, time, url }: { title: string; date: string; time?: string; url?: string }) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wouldu//EN", "BEGIN:VEVENT", `UID:${date}-${Date.now()}@wouldu`, `DTSTAMP:${stamp(new Date())}`];
  if (time) {
    const start = toLocalDate(date, time);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push(`DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`);
  } else {
    const next = toLocalDate(date);
    next.setDate(next.getDate() + 1);
    const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    lines.push(`DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${ymd(next)}`);
  }
  lines.push(`SUMMARY:${escape(title)}`);
  if (url) lines.push(`URL:${url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "date.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
