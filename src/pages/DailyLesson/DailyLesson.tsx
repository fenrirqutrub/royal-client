// DailyLesson.tsx
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import axiosPublic from "../../hooks/axiosPublic";
import DailyLessonCard from "./DailyLessonCard";
import DatePicker from "../../components/common/Datepicker";

// ─── Types ────────────────────────────────────────────────
export interface DailyLessonData {
  _id: string;
  slug?: string;
  subject: string;
  teacher: string;
  teacherSlug?: string;
  class: string;
  mark: number;
  chapterNumber: string;
  topics: string;
  images: { url: string; public_id: string }[];
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────
const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const BN_DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];
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

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${BN_DAYS[d.getDay()]}, ${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBn(d.getFullYear())}`;
};

const todayBn = () => {
  const d = new Date();
  return `${BN_DAYS[d.getDay()]}, ${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}`;
};

const isSameDay = (iso: string, reference: Date) => {
  const d = new Date(iso);
  return (
    d.getDate() === reference.getDate() &&
    d.getMonth() === reference.getMonth() &&
    d.getFullYear() === reference.getFullYear()
  );
};

const CLASS_ORDER: Record<string, number> = {
  "৬ষ্ঠ শ্রেণি": 1,
  "৭ম শ্রেণি": 2,
  "৮ম শ্রেণি": 3,
  "৯ম শ্রেণি": 4,
  "১০ম শ্রেণি": 5,
};

const CLASS_COLORS: Record<
  string,
  { from: string; to: string; soft: string; text: string }
> = {
  "৬ষ্ঠ শ্রেণি": {
    from: "#6366f1",
    to: "#818cf8",
    soft: "#eef2ff",
    text: "#4338ca",
  },
  "৭ম শ্রেণি": {
    from: "#0ea5e9",
    to: "#38bdf8",
    soft: "#e0f2fe",
    text: "#0369a1",
  },
  "৮ম শ্রেণি": {
    from: "#10b981",
    to: "#34d399",
    soft: "#d1fae5",
    text: "#065f46",
  },
  "৯ম শ্রেণি": {
    from: "#f59e0b",
    to: "#fbbf24",
    soft: "#fef3c7",
    text: "#92400e",
  },
  "১০ম শ্রেণি": {
    from: "#ec4899",
    to: "#f472b6",
    soft: "#fce7f3",
    text: "#9d174d",
  },
};
const defaultColor = {
  from: "#7c3aed",
  to: "#a855f7",
  soft: "#ede9fe",
  text: "#4c1d95",
};

const ITEMS_PER_PAGE = 8;

// ─── ClassGroupTitle ──────────────────────────────────────
const ClassGroupTitle = ({
  className,
  index,
}: {
  className: string;
  index: number;
}) => {
  const color = CLASS_COLORS[className] ?? defaultColor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex items-center gap-0 mb-5 mt-12 overflow-hidden rounded-lg bangla"
    >
      <div
        className="w-1.5 self-stretch rounded-l-2xl shrink-0"
        style={{
          background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
        }}
      />
      <div
        className="flex-1 flex items-center justify-between px-5 py-2"
        style={{ background: `linear-gradient(105deg, ${color.soft}, white)` }}
      >
        <h2
          className="text-xl md:text-2xl font-extrabold leading-tight"
          style={{ color: color.text }}
        >
          {className}
        </h2>
        <div
          className="hidden sm:block h-10 w-px mx-4 rounded-full opacity-20"
          style={{ background: color.from }}
        />
        <p
          className="text-xl md:text-2xl font-black"
          style={{ color: color.from }}
        >
          আজকের পড়া
        </p>
      </div>
    </motion.div>
  );
};

// ─── Pagination Component ─────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) => {
  const pages = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (currentPage <= 3) return i + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
      return currentPage - 2 + i;
    });
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 mt-8 bangla">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-active-border)]/50 text-[var(--color-gray)] hover:border-violet-400 hover:text-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <IoChevronBack className="h-4 w-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
            page === currentPage
              ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40"
              : "border border-[var(--color-active-border)]/50 text-[var(--color-gray)] hover:border-violet-400 hover:text-violet-500"
          }`}
        >
          {toBn(page)}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-active-border)]/50 text-[var(--color-gray)] hover:border-violet-400 hover:text-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        <IoChevronForward className="h-4 w-4" />
      </button>
    </nav>
  );
};

// ─── Main Component ───────────────────────────────────────
const DailyLesson = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerValue, setDatePickerValue] = useState<string>(todayBn());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset page when date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  const { data, isLoading, isError } = useQuery<DailyLessonData[]>({
    queryKey: ["daily-lessons"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/daily-lesson");
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  // Filter by selected date
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((lesson) => isSameDay(lesson.createdAt, selectedDate));
  }, [data, selectedDate]);

  // Group by class
  const groupedByClass = useMemo(() => {
    const map = new Map<string, DailyLessonData[]>();
    filteredData.forEach((lesson) => {
      if (!map.has(lesson.class)) map.set(lesson.class, []);
      map.get(lesson.class)!.push(lesson);
    });
    map.forEach((lessons) =>
      lessons.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    return Array.from(map.entries())
      .sort(([a], [b]) => (CLASS_ORDER[a] ?? 99) - (CLASS_ORDER[b] ?? 99))
      .map(([className, lessons]) => ({ className, lessons }));
  }, [filteredData]);

  // Flatten all lessons for pagination
  const allLessons = useMemo(
    () => groupedByClass.flatMap((g) => g.lessons),
    [groupedByClass],
  );
  const totalPages = Math.ceil(allLessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return new Set(
      allLessons.slice(start, start + ITEMS_PER_PAGE).map((l) => l._id),
    );
  }, [allLessons, currentPage]);

  // Re-group only paginated lessons
  const paginatedGroups = useMemo(() => {
    return groupedByClass
      .map(({ className, lessons }) => ({
        className,
        lessons: lessons.filter((l) => paginatedLessons.has(l._id)),
      }))
      .filter((g) => g.lessons.length > 0);
  }, [groupedByClass, paginatedLessons]);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleDateChange = (value: string) => {
    setDatePickerValue(value);
    // DatePicker returns Bengali string; we store the Date separately
  };

  return (
    <div>
      {/* Header */}
      <header className="text-center bangla mb-6">
        <h1 className="text-2xl md:text-5xl font-bold text-[var(--color-text)]">
          আজকের পড়া
        </h1>
        <p className="text-base md:text-2xl font-medium text-[var(--color-gray)] mt-2">
          প্রতিদিনের পাঠ্যক্রম ও নির্দেশনা
        </p>
      </header>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 px-3 md:px-0 mb-2 bangla">
        {/* Today Button */}
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setDatePickerValue(todayBn());
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            isToday
              ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200 dark:shadow-violet-900/30"
              : "border-[var(--color-active-border)]/60 text-[var(--color-gray)] hover:border-violet-400 hover:text-violet-500 bg-[var(--color-bg)]"
          }`}
        >
          <IoCalendarOutline className="h-4 w-4" />
          আজকের পাঠ
          {isToday && (
            <span className="ml-1 w-2 h-2 rounded-full bg-white/80 animate-pulse inline-block" />
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-[var(--color-active-border)]/40 hidden sm:block" />

        {/* Date Picker */}
        <div className="w-64 relative">
          <DatePicker
            value={datePickerValue}
            onDateChange={(date) => setSelectedDate(date)}
            onChange={(val) => {
              handleDateChange(val);
            }}
            placeholder="অন্য তারিখ বেছে নিন"
            maxDate={new Date()}
          />
        </div>

        {/* Result count */}
        {filteredData.length > 0 && (
          <motion.span
            key={selectedDate.toDateString()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto text-sm text-[var(--color-gray)] hidden sm:block"
          >
            মোট{" "}
            <span className="font-bold text-[var(--color-text)]">
              {toBn(filteredData.length)}
            </span>
            টি পাঠ পাওয়া গেছে
          </motion.span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-rose-400 text-sm bangla">
          ডেটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toDateString() + currentPage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="mt-4 px-3 md:px-0"
          >
            {paginatedGroups.length > 0 ? (
              <>
                {paginatedGroups.map(({ className, lessons }, groupIndex) => (
                  <div key={className}>
                    <ClassGroupTitle className={className} index={groupIndex} />
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mb-6">
                      {lessons.map((lesson, i) => (
                        <DailyLessonCard
                          key={lesson._id}
                          lesson={{
                            ...lesson,
                            date: formatDate(lesson.createdAt),
                          }}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bangla"
              >
                <p className="text-5xl mb-4">📚</p>
                <p className="text-[var(--color-gray)] text-lg font-medium">
                  এই তারিখে কোনো পাঠ পাওয়া যায়নি
                </p>
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setDatePickerValue(todayBn());
                  }}
                  className="mt-4 text-sm text-violet-500 hover:underline font-semibold"
                >
                  আজকের পাঠ দেখুন →
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default DailyLesson;
