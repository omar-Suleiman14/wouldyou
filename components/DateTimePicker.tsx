"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";

interface DateTimePickerProps {
  primaryColor: string;
  onConfirm: (date: string, time: string) => void;
  onSkip?: () => void;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const AMPM = ["AM", "PM"];

function DrumRoll({
  items,
  selected,
  onSelect,
  width = "w-14",
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  width?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 32;

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (containerRef.current && idx >= 0) {
      containerRef.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    }
  }, [selected, items]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (items[clamped] !== selected) onSelect(items[clamped]);
  };

  return (
    <div className={`relative ${width} h-[96px] overflow-hidden rounded-xl bg-black/[0.04]`}>
      {/* gradient masks */}
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/95 to-transparent z-10 pointer-events-none" />
      {/* selection indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-black/10 z-10 pointer-events-none" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-none snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory", msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {/* padding top/bottom to center items */}
        <div style={{ height: ITEM_H }} />
        {items.map((item) => (
          <div
            key={item}
            onClick={() => onSelect(item)}
            style={{ height: ITEM_H }}
            className={`snap-center flex items-center justify-center cursor-pointer text-xs font-bold transition-colors ${
              item === selected ? "text-zinc-950 scale-105 font-black" : "text-zinc-400"
            }`}
          >
            {item}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

export function DateTimePicker({ primaryColor, onConfirm, onSkip }: DateTimePickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("PM");

  const firstDayOfMonth = useMemo(() => new Date(viewYear, viewMonth, 1).getDay(), [viewYear, viewMonth]);
  const daysInMonth = useMemo(() => new Date(viewYear, viewMonth + 1, 0).getDate(), [viewYear, viewMonth]);

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = Array(firstDayOfMonth).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [firstDayOfMonth, daysInMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (d: number) => {
    return d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };
  const isPast = (d: number) => {
    const cell = new Date(viewYear, viewMonth, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cell < todayStart;
  };
  const isSelected = (d: number) => {
    return !!selectedDate &&
      d === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear();
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    const isoDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    const hourNum = (parseInt(hour) % 12) + (ampm === "PM" ? 12 : 0);
    const isoTime = `${String(hourNum).padStart(2, "0")}:${minute}`;
    onConfirm(isoDate, isoTime);
  };

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto"
      suppressHydrationWarning
    >
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-black/[0.08] overflow-hidden p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Month Nav + Calendar Grid */}
          <div className="flex flex-col sm:border-r sm:border-black/[0.06] sm:pr-5">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={prevMonth} className="p-1 rounded-xl hover:bg-black/[0.05] transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-zinc-600" />
              </button>
              <span className="text-xs font-extrabold text-zinc-900">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button type="button" onClick={nextMonth} className="p-1 rounded-xl hover:bg-black/[0.05] transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[9px] font-extrabold text-zinc-400 uppercase py-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((day, idx) => {
                if (!day) return <div key={idx} className="h-7 sm:h-8" />;
                const past = isPast(day);
                const sel = isSelected(day);
                const tod = isToday(day);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={past}
                    onClick={() => !past && setSelectedDate(new Date(viewYear, viewMonth, day))}
                    className={`h-7 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer relative ${
                      sel
                        ? "text-white shadow-md scale-105"
                        : past
                        ? "text-zinc-300 cursor-not-allowed"
                        : tod
                        ? "text-zinc-950 font-black"
                        : "text-zinc-700 hover:bg-black/[0.05]"
                    }`}
                    style={sel ? { backgroundColor: primaryColor } : undefined}
                  >
                    {day}
                    {tod && !sel && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Time Picker + Summary + Action Buttons */}
          <div className="flex flex-col justify-between max-sm:border-t max-sm:border-black/[0.06] max-sm:pt-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[11px] font-extrabold text-zinc-600 uppercase tracking-wider">Pick Time</span>
                </div>
                {selectedDate && (
                  <span className="text-[11px] font-bold text-pink-600 font-mono">
                    {formatDisplayDate(selectedDate)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 my-2">
                <DrumRoll items={HOURS} selected={hour} onSelect={setHour} width="w-12 sm:w-14" />
                <span className="text-base font-black text-zinc-400">:</span>
                <DrumRoll items={MINUTES} selected={minute} onSelect={setMinute} width="w-12 sm:w-14" />
                <DrumRoll items={AMPM} selected={ampm} onSelect={setAmpm} width="w-11 sm:w-12" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-4 pt-3 border-t border-black/[0.06]">
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-4 py-2.5 rounded-xl bg-black/[0.04] text-zinc-600 font-bold text-xs hover:bg-black/[0.08] transition-colors cursor-pointer"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedDate}
                style={{ backgroundColor: selectedDate ? primaryColor : undefined }}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs text-white flex items-center justify-center gap-1.5 transition-all ${
                  selectedDate ? "opacity-100 cursor-pointer hover:opacity-95 shadow-md" : "opacity-40 cursor-not-allowed bg-zinc-300"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Confirm date!
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
