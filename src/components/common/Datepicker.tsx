// src/components/common/DatePicker.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoChevronBack,
  IoChevronForward,
  IoCalendarOutline,
} from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

// ─── Bengali locale helpers ───────────────────────────────
const BN_DAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
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
const BN_WEEK_DAYS_FULL = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const toBengaliDigit = (n: number) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const formatDisplay = (date: Date) =>
  `${BN_WEEK_DAYS_FULL[date.getDay()]}, ${toBengaliDigit(date.getDate())} ${BN_MONTHS[date.getMonth()]}`;

// ─── Types ────────────────────────────────────────────────
interface DatePickerProps {
  value?: string; // stored value — Bengali formatted string
  onChange: (value: string) => void;
  onDateChange?: (date: Date) => void; // ← add this
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// ─── Component ────────────────────────────────────────────
const DatePicker = ({
  value,
  onChange,
  onDateChange, // ← add this
  label,
  required,
  placeholder = "তারিখ বেছে নিন",
  error,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1); // nav animation dir
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync external value back to local state (if value is pre-set)
  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
  }, [value]);

  // ── Navigation ──────────────────────────────────────────
  const prevMonth = () => {
    setDirection(-1);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setDirection(1);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  // ── Grid generation ─────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && d > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
    return false;
  };
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };
  const isSelected = (day: number) =>
    selected?.getDate() === day &&
    selected?.getMonth() === viewMonth &&
    selected?.getFullYear() === viewYear;

  const handleSelect = (day: number) => {
    if (isDisabled(day)) return;
    const date = new Date(viewYear, viewMonth, day);
    setSelected(date);
    onChange(formatDisplay(date));
    onDateChange?.(date);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange("");
  };

  const monthKey = `${viewYear}-${viewMonth}`;

  return (
    <div className="w-full" ref={ref}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-1.5">
          {label}{" "}
          {required && (
            <span className="text-rose-500 normal-case tracking-normal">*</span>
          )}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between gap-2
          bg-white dark:bg-gray-800 transition-all duration-200
          focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? "border-rose-400 focus:ring-rose-400"
              : open
                ? "border-violet-500 ring-2 ring-violet-500"
                : "border-gray-200 dark:border-gray-700 focus:ring-violet-500"
          }`}
      >
        <span
          className={`flex items-center gap-2 ${value ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}
        >
          <IoCalendarOutline className="text-base shrink-0 text-gray-400" />
          {value || placeholder}
        </span>

        {value ? (
          <RxCross2
            onClick={handleClear}
            className="shrink-0 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
          />
        ) : (
          <IoChevronBack
            className={`shrink-0 text-gray-400 transition-transform duration-300 ${open ? "-rotate-90" : "rotate-180"}`}
            style={{ transform: open ? "rotate(-90deg)" : "rotate(0deg)" }}
          />
        )}
      </button>

      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}

      {/* Calendar dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            style={{ boxShadow: "0 20px 60px -10px rgba(0,0,0,0.18)" }}
          >
            {/* ── Month/Year header ── */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <IoChevronBack className="text-sm" />
              </button>

              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={monthKey}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-bold text-gray-800 dark:text-gray-100 select-none"
                >
                  {BN_MONTHS[viewMonth]} {toBengaliDigit(viewYear)}
                </motion.span>
              </AnimatePresence>

              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <IoChevronForward className="text-sm" />
              </button>
            </div>

            {/* ── Day headers ── */}
            <div className="grid grid-cols-7 px-3 pb-1">
              {BN_DAYS.map((d) => (
                <div
                  key={d}
                  className={`text-center text-[10px] font-semibold py-1 select-none
                    ${d === "শুক্র" || d === "শনি" ? "text-rose-400" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* ── Date grid ── */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={monthKey}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7 gap-y-0.5 px-3 pb-4"
              >
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const disabled_ = isDisabled(day);
                  const today_ = isToday(day);
                  const selected_ = isSelected(day);
                  const isFriSat =
                    new Date(viewYear, viewMonth, day).getDay() >= 5;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled_}
                      onClick={() => handleSelect(day)}
                      className={`
                        relative h-8 w-full flex items-center justify-center rounded-lg text-xs font-medium
                        transition-all duration-150 select-none
                        ${disabled_ ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                        ${
                          selected_
                            ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40"
                            : today_ && !selected_
                              ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-bold ring-1 ring-violet-300 dark:ring-violet-700"
                              : isFriSat
                                ? "text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      {toBengaliDigit(day)}
                      {today_ && !selected_ && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* ── Today shortcut ── */}
            <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewMonth(today.getMonth());
                  setViewYear(today.getFullYear());
                  handleSelect(today.getDate());
                }}
                className="w-full text-xs text-center text-violet-600 dark:text-violet-400 font-semibold hover:underline"
              >
                আজকের তারিখ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
