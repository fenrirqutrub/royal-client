// src/components/common/DatePicker.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoChevronBack,
  IoChevronForward,
  IoCalendarOutline,
} from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

// ─── Bengali helpers ──────────────────────────────────────────────────────────
const BN_DAYS_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
const BN_DAYS_FULL = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const formatDisplay = (date: Date) =>
  `${BN_DAYS_FULL[date.getDay()]}, ${toBn(date.getDate())} ${BN_MONTHS[date.getMonth()]} ${toBn(date.getFullYear())}`;

const MIN_YEAR = 1950;

// ─── Props ────────────────────────────────────────────────────────────────────
interface DatePickerProps {
  value?: string;
  onChange: (display: string) => void;
  onDateChange?: (date: Date) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

type Mode = "day" | "month" | "year";

// ─── Component ────────────────────────────────────────────────────────────────
const DatePicker = ({
  value,
  onChange,
  onDateChange,
  label,
  required,
  placeholder = "তারিখ বেছে নিন",
  error,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const today = new Date();
  const MAX_YEAR = today.getFullYear();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("day");
  const [viewYear, setViewYear] = useState(MAX_YEAR - 20);
  const [viewMonth, setViewMonth] = useState(0);
  const [selected, setSelected] = useState<Date | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  // close on outside click + reposition on scroll/resize
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const reposition = () => {
      if (!open || !triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const calW = Math.max(r.width, 288);
      // Use a smaller estimate — actual cal can be shorter
      const calH = 320;
      const spaceBelow = window.innerHeight - r.bottom - 8;
      const spaceAbove = r.top - 8;
      let top: number;
      if (spaceBelow >= calH) {
        // Preferred: open below trigger
        top = r.bottom + 6;
      } else if (spaceAbove >= calH) {
        // Fallback: open above trigger
        top = r.top - calH - 6;
      } else {
        // Neither fits — center vertically on screen
        top = Math.max(8, (window.innerHeight - calH) / 2);
      }
      const rawLeft = r.left;
      const maxLeft = window.innerWidth - calW - 8;
      const left = Math.max(8, Math.min(rawLeft, maxLeft));
      setDropPos({ top, left, width: r.width });
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  // scroll year into view when year picker opens
  useEffect(() => {
    if (mode === "year" && yearListRef.current) {
      const el = yearListRef.current.querySelector(
        `[data-yr="${viewYear}"]`,
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [mode, viewYear]);

  // ── Month navigation ──────────────────────────────────────────────────────
  const prevMonth = () => {
    setDirection(-1);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => Math.max(MIN_YEAR, y - 1));
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setDirection(1);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => Math.min(MAX_YEAR, y + 1));
    } else setViewMonth((m) => m + 1);
  };

  const canPrev = !(viewYear === MIN_YEAR && viewMonth === 0);
  const canNext = !(viewYear === MAX_YEAR && viewMonth >= today.getMonth());

  // ── Day grid ──────────────────────────────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isFriSat = (day: number) =>
    new Date(viewYear, viewMonth, day).getDay() >= 5;
  const isToday_ = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;
  const isSel = (day: number) =>
    selected?.getDate() === day &&
    selected?.getMonth() === viewMonth &&
    selected?.getFullYear() === viewYear;
  const isDis = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate) {
      const mn = new Date(minDate);
      mn.setHours(0, 0, 0, 0);
      if (d < mn) return true;
    }
    if (maxDate) {
      const mx = new Date(maxDate);
      mx.setHours(23, 59, 59, 999);
      if (d > mx) return true;
    }
    return false;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const pickDay = (day: number) => {
    if (isDis(day)) return;
    const date = new Date(viewYear, viewMonth, day);
    setSelected(date);
    const display = formatDisplay(date);
    onChange(display);
    onDateChange?.(date);
    setOpen(false);
  };

  const pickMonth = (m: number) => {
    setViewMonth(m);
    setMode("day");
  };

  const pickYear = (y: number) => {
    setViewYear(y);
    setMode("month");
  };

  const pickToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    pickDay(today.getDate());
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange("");
  };

  const allYears = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, i) => MAX_YEAR - i,
  );
  const monthKey = `${viewYear}-${viewMonth}`;

  return (
    <div ref={wrapRef} className="w-full relative">
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5 bangla">
          {label}
          {required && (
            <span className="text-rose-500 ml-1 normal-case">*</span>
          )}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        ref={triggerRef}
        onClick={() => {
          if (!open && triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            const calW = Math.max(r.width, 288);
            // Use a smaller estimate — actual cal can be shorter
            const calH = 320;
            const spaceBelow = window.innerHeight - r.bottom - 8;
            const spaceAbove = r.top - 8;
            let top: number;
            if (spaceBelow >= calH) {
              // Preferred: open below trigger
              top = r.bottom + 6;
            } else if (spaceAbove >= calH) {
              // Fallback: open above trigger
              top = r.top - calH - 6;
            } else {
              // Neither fits — center vertically on screen
              top = Math.max(8, (window.innerHeight - calH) / 2);
            }
            const rawLeft = r.left;
            const maxLeft = window.innerWidth - calW - 8;
            const left = Math.max(8, Math.min(rawLeft, maxLeft));
            setDropPos({ top, left, width: r.width });
          }
          setOpen((v) => !v);
          setMode("day");
        }}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between gap-2
          bg-white dark:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed bangla
          ${
            error
              ? "border-rose-400 focus:ring-rose-400/30"
              : open
                ? "border-violet-500 ring-2 ring-violet-500/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 focus:ring-violet-500/30"
          }`}
      >
        <span
          className={`flex items-center gap-2 min-w-0 ${value ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}
        >
          <IoCalendarOutline className="text-base shrink-0 text-gray-400" />
          <span className="truncate">{value || placeholder}</span>
        </span>
        {value ? (
          <RxCross2
            onClick={clear}
            className="shrink-0 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
          />
        ) : (
          <IoChevronBack
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "-rotate-90" : "rotate-180"}`}
          />
        )}
      </button>

      {error && <p className="text-rose-500 text-xs mt-1 bangla">{error}</p>}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            style={{
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.28)",
              top: dropPos.top,
              left: dropPos.left,
              width: Math.max(dropPos.width, 288),
            }}
          >
            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 gap-1">
              <button
                type="button"
                onClick={prevMonth}
                disabled={!canPrev || mode !== "day"}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors text-gray-500 disabled:opacity-20 disabled:cursor-default shrink-0"
              >
                <IoChevronBack className="text-sm" />
              </button>

              <div className="flex items-center gap-1 flex-1 justify-center">
                {/* Month button */}
                <button
                  type="button"
                  onClick={() => setMode(mode === "month" ? "day" : "month")}
                  className={`px-2.5 py-1.5 rounded-lg text-sm font-bold bangla transition-all
                    ${
                      mode === "month"
                        ? "bg-violet-600 text-white"
                        : "text-gray-800 dark:text-gray-100 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                    }`}
                >
                  {BN_MONTHS[viewMonth]}
                </button>

                {/* Year button */}
                <button
                  type="button"
                  onClick={() => setMode(mode === "year" ? "day" : "year")}
                  className={`px-2.5 py-1.5 rounded-lg text-sm font-bold bangla transition-all
                    ${
                      mode === "year"
                        ? "bg-violet-600 text-white"
                        : "text-gray-800 dark:text-gray-100 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                    }`}
                >
                  {toBn(viewYear)}
                </button>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                disabled={!canNext || mode !== "day"}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors text-gray-500 disabled:opacity-20 disabled:cursor-default shrink-0"
              >
                <IoChevronForward className="text-sm" />
              </button>
            </div>

            {/* ── YEAR GRID ── */}
            {mode === "year" && (
              <div
                ref={yearListRef}
                className="h-52 overflow-y-auto px-3 pb-3 grid grid-cols-4 gap-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {allYears.map((y) => (
                  <button
                    key={y}
                    type="button"
                    data-yr={y}
                    onClick={() => pickYear(y)}
                    className={`py-1.5 rounded-lg text-xs font-semibold bangla transition-all
                      ${
                        viewYear === y
                          ? "bg-violet-600 text-white shadow"
                          : "hover:bg-violet-50 dark:hover:bg-violet-900/30 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {toBn(y)}
                  </button>
                ))}
              </div>
            )}

            {/* ── MONTH GRID ── */}
            {mode === "month" && (
              <div className="grid grid-cols-3 gap-1.5 px-3 pb-4">
                {BN_MONTHS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => pickMonth(i)}
                    className={`py-2 rounded-lg text-xs font-semibold bangla transition-all
                      ${
                        viewMonth === i
                          ? "bg-violet-600 text-white shadow"
                          : "hover:bg-violet-50 dark:hover:bg-violet-900/30 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* ── DAY GRID ── */}
            {mode === "day" && (
              <>
                {/* Week headers */}
                <div className="grid grid-cols-7 px-3 pb-1">
                  {BN_DAYS_SHORT.map((d) => (
                    <div
                      key={d}
                      className={`text-center text-[10px] font-semibold py-1 select-none bangla
                        ${d === "শুক্র" || d === "শনি" ? "text-rose-400" : "text-gray-400 dark:text-gray-500"}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={monthKey}
                    initial={{ opacity: 0, x: direction * 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -20 }}
                    transition={{ duration: 0.16 }}
                    className="grid grid-cols-7 gap-y-0.5 px-3 pb-3"
                  >
                    {cells.map((day, i) => {
                      if (!day) return <div key={`e-${i}`} />;
                      const dis = isDis(day);
                      const sel = isSel(day);
                      const tod = isToday_(day);
                      const fri = isFriSat(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={dis}
                          onClick={() => pickDay(day)}
                          className={`relative h-8 w-full flex items-center justify-center rounded-lg
                            text-xs font-medium select-none transition-all duration-150 bangla
                            ${dis ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}
                            ${
                              sel
                                ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40"
                                : tod
                                  ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-bold ring-1 ring-violet-300 dark:ring-violet-700"
                                  : fri
                                    ? "text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                          {toBn(day)}
                          {tod && !sel && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Today shortcut */}
                <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <button
                    type="button"
                    onClick={pickToday}
                    className="w-full text-xs text-center text-violet-600 dark:text-violet-400 font-semibold hover:underline bangla"
                  >
                    আজকের তারিখ নির্বাচন করুন
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
