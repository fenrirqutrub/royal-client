import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { BookOpen, FileText, GraduationCap, Folder } from "lucide-react";

import { BN_DAYS_FULL, BN_MONTHS, toBn } from "../../utility/Formatters";
import axiosPublic, { getCached, setCache } from "../../hooks/axiosPublic";
import { CLASS_ORDER } from "../../utility/Constants";
import type { DailyLessonData } from "../../pages/DailyLesson/DailyLessonUpdateModals";
import {
  CLASS_COLORS,
  DEFAULT_CLASS_COLOR,
  EXAM_COLORS,
} from "../../styles/colors";

// ─── Types ────────────────────────────────────────────────
interface WeeklyExamRaw {
  _id: string;
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  ExamNumber: string;
  topics: string;
  createdAt: string;
}

// ─── Cache Keys & TTL ─────────────────────────────────────
const CACHE_KEY_LESSONS = "daily-lessons";
const CACHE_KEY_EXAMS = "weekly-exams";
const TTL_LESSONS = 1000 * 60 * 5; // 5 minutes
const TTL_EXAMS = 1000 * 60 * 10; // 10 minutes

// ─── Helpers ──────────────────────────────────────────────
const shouldShowExam = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  if (day === 4 && hour >= 14) return true;
  if (day === 5) return true;
  if (day === 6 && hour < 9) return true;
  return false;
};

const todayBn = () => {
  const d = new Date();
  return `${BN_DAYS_FULL[d.getDay()]}, ${toBn(String(d.getDate()))} ${BN_MONTHS[d.getMonth()]}`;
};

const getCurrentWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

// ─── Fetchers (with in-memory cache layer) ────────────────
const fetchLessons = async (): Promise<DailyLessonData[]> => {
  const cached = getCached<DailyLessonData[]>(CACHE_KEY_LESSONS);
  if (cached) return cached;

  const res = await axiosPublic.get("/api/daily-lesson");
  const data: DailyLessonData[] = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

  setCache(CACHE_KEY_LESSONS, data, TTL_LESSONS);
  return data;
};

const fetchExams = async (): Promise<WeeklyExamRaw[]> => {
  const cached = getCached<WeeklyExamRaw[]>(CACHE_KEY_EXAMS);
  if (cached) return cached;

  const res = await axiosPublic.get("/api/weekly-exams");
  const data: WeeklyExamRaw[] = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

  setCache(CACHE_KEY_EXAMS, data, TTL_EXAMS);
  return data;
};

// ─── Skeleton Card ────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="relative flex-shrink-0 w-[280px] h-[140px] rounded-xl overflow-hidden"
    style={{
      border: "1px solid var(--color-active-border)",
      background: "var(--color-bg)",
    }}
  >
    <div className="h-[3px] w-full bg-[var(--color-active-border)] animate-pulse" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 w-2/3 rounded bg-[var(--color-active-border)] animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-[var(--color-active-border)] animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-[var(--color-active-border)] animate-pulse" />
      <div className="h-3 w-full rounded bg-[var(--color-active-border)] animate-pulse" />
    </div>
  </div>
);

// ─── Skeleton Marquee (shown while loading) ───────────────
const SkeletonMarquee = () => (
  <div className="flex gap-4 px-2 overflow-hidden">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ─── Lesson Card ──────────────────────────────────────────
const LessonCard = ({
  lesson,
  index,
  onClick,
}: {
  lesson: DailyLessonData;
  index: number;
  onClick: () => void;
}) => {
  const color = CLASS_COLORS[lesson.class] ?? DEFAULT_CLASS_COLOR;
  const Icon = lesson.referenceType === "page" ? FileText : BookOpen;
  const refLabel = lesson.referenceType === "page" ? "পৃষ্ঠা" : "অধ্যায়";
  const teacherName =
    typeof lesson.teacher === "string"
      ? lesson.teacher
      : ((lesson.teacher as { name: string }).name ?? "—");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="relative flex-shrink-0 w-[280px] h-[140px] rounded-xl overflow-hidden cursor-pointer bangla"
      style={{
        border: "1px solid var(--color-active-border)",
        background: "var(--color-bg)",
      }}
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
        }}
      />

      <div className="p-4 flex flex-col gap-2 h-[calc(100%-3px)]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-[15px] font-bold text-[var(--color-text)] leading-tight line-clamp-1">
              {lesson.subject}
            </h4>
            <p className="text-[12px] text-[var(--color-gray)] mt-1 flex items-center gap-1.5 truncate">
              <Folder className="w-3.5 h-3.5 shrink-0" />
              {teacherName}
            </p>
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0"
            style={{ background: `${color.from}18`, color: color.from }}
          >
            {lesson.class.replace(" শ্রেণি", "")}
          </span>
        </div>

        <span
          className="inline-flex items-center gap-1.5 self-start text-[12px] font-semibold px-2.5 py-1 rounded-md"
          style={{ background: `${color.from}12`, color: color.from }}
        >
          <Icon className="w-3.5 h-3.5" />
          {refLabel} {toBn(lesson.chapterNumber)}
        </span>

        <p className="text-[12px] leading-relaxed text-[var(--color-gray)] line-clamp-2 whitespace-pre-line flex-1">
          {lesson.topics}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Exam Card ────────────────────────────────────────────
const ExamCard = ({
  exam,
  index,
  onClick,
}: {
  exam: WeeklyExamRaw;
  index: number;
  onClick: () => void;
}) => {
  const color = EXAM_COLORS[index % EXAM_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="relative flex-shrink-0 w-[280px] h-[140px] pb-4 rounded-md overflow-hidden cursor-pointer bg-[var(--color-bg)] border border-[var(--color-active-border)] bangla"
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
        }}
      />

      <div className="px-4 py-1 flex flex-col gap-1 h-[calc(100%-3px)]">
        <div className="flex flex-col items-center justify-center pt-1">
          <h4 className="text-md md:text-lg text-center font-bold text-[var(--color-text)]">
            {exam.subject}
          </h4>
          <div className="flex justify-between items-center w-full">
            <span className="inline-flex items-center gap-2 text-sm font-semibold px-2 py-0.5 rounded-md text-[var(--color-gray)]">
              <GraduationCap className="w-3.5 h-3.5" />
              {exam.class}
            </span>
            <span className="text-sm font-bold rounded-md shrink-0 text-[var(--color-gray)]">
              পূর্ণমান- {toBn(String(exam.mark))}
            </span>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[var(--color-gray)] line-clamp-1 whitespace-pre-line flex-1">
          {exam.topics}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Dot separator ────────────────────────────────────────
const Dot = ({ color }: { color: string }) => (
  <div className="flex items-center px-4 shrink-0">
    <div
      className="w-1.5 h-1.5 rounded-full opacity-40"
      style={{ background: color }}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────
const DailyUpdateDLWE = () => {
  const navigate = useNavigate();
  const showExam = shouldShowExam();

  // ── Lessons query ──
  const { data: lessonData, isLoading: lessonLoading } = useQuery<
    DailyLessonData[]
  >({
    queryKey: [CACHE_KEY_LESSONS],
    queryFn: fetchLessons,
    staleTime: TTL_LESSONS, // don't refetch for 5 min
    gcTime: TTL_LESSONS * 2, // keep in memory for 10 min
    refetchOnMount: false, // use cache on remount
    refetchOnWindowFocus: false, // don't refetch on tab switch
    enabled: !showExam,
  });

  // ── Exams query ──
  const { data: examData, isLoading: examLoading } = useQuery<WeeklyExamRaw[]>({
    queryKey: [CACHE_KEY_EXAMS],
    queryFn: fetchExams,
    staleTime: TTL_EXAMS,
    gcTime: TTL_EXAMS * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: showExam,
  });

  // ── Filter today's lessons ──
  const todayLessons = useMemo(() => {
    if (!lessonData) return [];
    const today = new Date();
    return lessonData.filter((l) => {
      const d = new Date(l.date);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    });
  }, [lessonData]);

  // ── Filter this week's exams ──
  const thisWeekExams = useMemo(() => {
    if (!examData) return [];
    const { monday, sunday } = getCurrentWeekRange();

    const thisWeekNums = new Set(
      examData
        .filter((e) => {
          const d = new Date(e.createdAt);
          return d >= monday && d <= sunday;
        })
        .map((e) => e.ExamNumber),
    );

    const targetNums =
      thisWeekNums.size > 0
        ? thisWeekNums
        : new Set([
            [...examData].sort(
              (a, b) => Number(b.ExamNumber) - Number(a.ExamNumber),
            )[0]?.ExamNumber,
          ]);

    return examData
      .filter((e) => targetNums.has(e.ExamNumber))
      .sort(
        (a, b) => (CLASS_ORDER[a.class] ?? 99) - (CLASS_ORDER[b.class] ?? 99),
      );
  }, [examData]);

  const isLesson = !showExam;
  const isLoading = isLesson ? lessonLoading : examLoading;
  const items = isLesson ? todayLessons : thisWeekExams;
  const accentColor = isLesson ? "#6366f1" : "#f59e0b";
  const currentExamNum = thisWeekExams[0]?.ExamNumber ?? "";

  // Show skeleton while loading
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bangla mt-8"
      >
        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="h-8 w-48 rounded-lg bg-[var(--color-active-border)] animate-pulse" />
          <div className="h-5 w-36 rounded-md bg-[var(--color-active-border)] animate-pulse" />
          <div className="h-4 w-24 rounded-md bg-[var(--color-active-border)] animate-pulse" />
        </div>
        <SkeletonMarquee />
      </motion.div>
    );
  }

  if (items.length === 0) return null;

  const repeated = [...items, ...items, ...items];
  const handleNavigate = () =>
    navigate(isLesson ? "/dailylesson" : "/weekly-exam");

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bangla mt-8"
    >
      {/* ── Header ── */}
      <div
        className="flex flex-col items-center cursor-pointer mb-4"
        onClick={handleNavigate}
        // SEO: semantic heading hierarchy
        role="button"
        aria-label={
          isLesson
            ? "আজকের পড়ার তালিকা দেখুন"
            : "সাপ্তাহিক পরীক্ষার তালিকা দেখুন"
        }
      >
        <h2 className="text-2xl md:text-4xl font-bold text-[var(--color-text)]">
          {isLesson
            ? "আজকের পড়া"
            : `সাপ্তাহিক পরীক্ষার ধারণা নং-${toBn(currentExamNum)}`}
        </h2>

        <time
          className="text-xl md:text-2xl text-[var(--color-text)]"
          dateTime={new Date().toISOString().split("T")[0]}
        >
          {todayBn()}
        </time>

        <p className="text-lg md:text-xl text-[var(--color-gray)]">
          মোট{" "}
          <strong className="font-bold text-[var(--color-text)]">
            {toBn(String(items.length))}
          </strong>
          {isLesson ? "টি পাঠ" : "টি বিষয়"}
        </p>
      </div>

      {/* ── Marquee ── */}
      <section
        aria-label={
          isLesson ? "আজকের পাঠের তালিকা" : "সাপ্তাহিক পরীক্ষার তালিকা"
        }
        className="relative rounded-b-xl py-2 overflow-hidden"
      >
        <Marquee speed={35} gradient={false} direction="left">
          <div className="flex items-stretch gap-0 px-2">
            {repeated.map((item, i) =>
              isLesson ? (
                <div key={`${item._id}-${i}`} className="flex items-center">
                  <LessonCard
                    lesson={item as DailyLessonData}
                    index={i % items.length}
                    onClick={handleNavigate}
                  />
                  <Dot color={accentColor} />
                </div>
              ) : (
                <div key={`${item._id}-${i}`} className="flex items-center">
                  <ExamCard
                    exam={item as WeeklyExamRaw}
                    index={i % items.length}
                    onClick={handleNavigate}
                  />
                  <Dot color={accentColor} />
                </div>
              ),
            )}
          </div>
        </Marquee>
      </section>
    </motion.div>
  );
};

export default DailyUpdateDLWE;
