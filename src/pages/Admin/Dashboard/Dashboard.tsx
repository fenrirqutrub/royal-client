// src/pages/dashboard/home/Dashboard.tsx
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Users,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";
import axiosPublic from "../../../hooks/axiosPublic";
import { useAuth } from "../../../context/AuthContext";

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return { text: "শুভ রাত্রি", emoji: "🌙" };
  if (h < 12) return { text: "শুভ সকাল", emoji: "☀️" };
  if (h < 17) return { text: "শুভ বিকাল", emoji: "🌤️" };
  return { text: "শুভ সন্ধ্যা", emoji: "🌆" };
};

const getBanglaDate = () =>
  new Date().toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// Current week: Sunday → Friday
const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat
  // If Saturday, show next week's range
  const diffToSun = day === 6 ? 1 : -day;
  const sun = new Date(now);
  sun.setDate(now.getDate() + diffToSun);
  sun.setHours(0, 0, 0, 0);
  const fri = new Date(sun);
  fri.setDate(sun.getDate() + 5);
  fri.setHours(23, 59, 59, 999);
  return { start: sun, end: fri };
};

const isTodayInRange = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const isThisWeek = (dateStr: string) => {
  const { start, end } = getCurrentWeekRange();
  const d = new Date(dateStr);
  return d >= start && d <= end;
};

/* ══════════════════════════════════════════════════
   VARIANTS
══════════════════════════════════════════════════ */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/* ══════════════════════════════════════════════════
   PROGRESS RING
══════════════════════════════════════════════════ */
const ProgressRing = ({ done }: { done: boolean }) => {
  const r = 16;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={40} height={40} className="shrink-0">
      <circle
        cx={20}
        cy={20}
        r={r}
        fill="none"
        strokeWidth={2.5}
        stroke="var(--color-active-border)"
      />
      <motion.circle
        cx={20}
        cy={20}
        r={r}
        fill="none"
        strokeWidth={2.5}
        stroke="var(--color-text)"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: done ? 0 : circ * 0.72 }}
        transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
        transform="rotate(-90 20 20)"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fill="var(--color-text)"
      >
        {done ? "✓" : "○"}
      </text>
    </svg>
  );
};

/* ══════════════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════════════ */
const StatusBadge = ({ done }: { done: boolean }) => (
  <motion.span
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.5, duration: 0.3 }}
    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bangla"
    style={{
      backgroundColor: "var(--color-active-bg)",
      border: "1px solid var(--color-active-border)",
      color: done ? "var(--color-text)" : "var(--color-gray)",
    }}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${!done ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: done ? "var(--color-text)" : "var(--color-gray)",
      }}
    />
    {done ? "সম্পন্ন" : "বাকি আছে"}
  </motion.span>
);

/* ══════════════════════════════════════════════════
   ACTION CARD
══════════════════════════════════════════════════ */
interface ActionCardProps {
  submitted: boolean;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  timeLabel: string;
  question: string;
  typeSequence: (string | number)[];
  cta: string;
  to: string;
  doneText: string;
  index: number;
}

const ActionCard = ({
  submitted,
  icon: Icon,
  label,
  timeLabel,
  question,
  typeSequence,
  cta,
  to,
  doneText,
  index,
}: ActionCardProps) => (
  <motion.div
    variants={cardVariants}
    whileHover={!submitted ? { y: -4, transition: { duration: 0.2 } } : {}}
    className="relative rounded-3xl overflow-hidden flex flex-col"
    style={{
      border: "1px solid var(--color-active-border)",
      backgroundColor: "var(--color-bg)",
    }}
  >
    {/* Animated top line */}
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        delay: 0.3 + index * 0.13,
        duration: 0.65,
        ease: "easeOut",
      }}
      className="h-[2px] w-full origin-left"
      style={{ backgroundColor: "var(--color-text)", opacity: 0.4 }}
    />

    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.35 + index * 0.13,
              duration: 0.45,
              ease: "backOut",
            }}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0"
            style={{
              backgroundColor: "var(--color-active-bg)",
              border: "1px solid var(--color-active-border)",
            }}
          >
            <Icon
              className="w-6 h-6 sm:w-7 sm:h-7"
              style={{ color: "var(--color-text)" }}
            />
          </motion.div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest bangla"
              style={{ color: "var(--color-gray)" }}
            >
              {label}
            </p>
            <p
              className="text-xs mt-0.5 bangla"
              style={{ color: "var(--color-gray)" }}
            >
              {timeLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge done={submitted} />
          <ProgressRing done={submitted} />
        </div>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          delay: 0.45 + index * 0.13,
          duration: 0.5,
          ease: "easeOut",
        }}
        className="h-px origin-left"
        style={{ backgroundColor: "var(--color-active-border)" }}
      />

      {/* Question + Typewriter */}
      <div className="space-y-3">
        <p
          className="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug bangla"
          style={{ color: "var(--color-text)" }}
        >
          {question}
        </p>

        {!submitted ? (
          <div
            className="text-base sm:text-lg font-medium bangla min-h-[1.8rem]"
            style={{ color: "var(--color-gray)" }}
          >
            <TypeAnimation
              sequence={typeSequence}
              wrapper="span"
              speed={60}
              repeat={Infinity}
              cursor
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 text-base bangla"
            style={{ color: "var(--color-gray)" }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </motion.div>
            <span>{doneText}</span>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <AnimatePresence>
        {!submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.5 + index * 0.13, duration: 0.38 }}
          >
            <Link
              to={to}
              className="group relative flex items-center justify-between w-full rounded-2xl px-6 py-4 overflow-hidden"
              style={{
                backgroundColor: "var(--color-text)",
                color: "var(--color-bg)",
              }}
            >
              {/* shimmer sweep */}
              <motion.div
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 opacity-10"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-bg), transparent)",
                }}
              />
              <span className="text-base sm:text-lg font-bold bangla relative z-10">
                {cta}
              </span>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════
   STAFF SUMMARY ROW (principal/admin/owner only)
══════════════════════════════════════════════════ */
const StaffSummary = ({ teacherSlug }: { teacherSlug: string }) => {
  const { data: allExams } = useQuery({
    queryKey: ["dash-all-weekly-exams"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/weekly-exams");
      return data as WeeklyExamDoc[];
    },
  });

  const { data: allLessons } = useQuery({
    queryKey: ["dash-all-daily-lessons"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/daily-lessons");
      return (data?.data ?? data) as DailyLessonDoc[];
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["dash-teachers"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/users?role=teacher");
      return data as { slug: string; name: string }[];
    },
  });

  if (!teachers?.length) return null;

  const weeklySubmittedSlugs = new Set(
    (allExams ?? [])
      .filter((e) => isThisWeek(e.createdAt))
      .map((e) => e.teacherSlug)
      .filter(Boolean),
  );

  const todayLessonSlugs = new Set(
    (allLessons ?? [])
      .filter((l) => isTodayInRange(l.createdAt))
      .map((l) => l.teacherSlug)
      .filter(Boolean),
  );

  const submitted = teachers.filter(
    (t) => weeklySubmittedSlugs.has(t.slug) || todayLessonSlugs.has(t.slug),
  ).length;
  const notSubmitted = teachers.length - submitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
      className="rounded-3xl overflow-hidden"
      style={{
        border: "1px solid var(--color-active-border)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.65, duration: 0.65, ease: "easeOut" }}
        className="h-[2px] w-full origin-left"
        style={{ backgroundColor: "var(--color-text)", opacity: 0.4 }}
      />

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{
              backgroundColor: "var(--color-active-bg)",
              border: "1px solid var(--color-active-border)",
            }}
          >
            <Users className="w-5 h-5" style={{ color: "var(--color-text)" }} />
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest bangla"
              style={{ color: "var(--color-gray)" }}
            >
              শিক্ষক সারসংক্ষেপ
            </p>
            <p
              className="text-xs bangla mt-0.5"
              style={{ color: "var(--color-gray)" }}
            >
              এই সপ্তাহ ও আজকের জমা
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "মোট শিক্ষক", value: teachers.length },
            { label: "জমা দিয়েছেন", value: submitted },
            { label: "জমা দেননি", value: notSubmitted },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.7 + i * 0.07,
                duration: 0.35,
                ease: "backOut",
              }}
              className="rounded-2xl p-3 sm:p-4 text-center"
              style={{
                backgroundColor: "var(--color-active-bg)",
                border: "1px solid var(--color-active-border)",
              }}
            >
              <p
                className="text-2xl sm:text-3xl font-black tabular-nums"
                style={{ color: "var(--color-text)" }}
              >
                {s.value}
              </p>
              <p
                className="text-xs mt-1 bangla"
                style={{ color: "var(--color-gray)" }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p
              className="text-xs bangla"
              style={{ color: "var(--color-gray)" }}
            >
              জমা দেওয়ার হার
            </p>
            <p
              className="text-xs font-bold tabular-nums"
              style={{ color: "var(--color-text)" }}
            >
              {teachers.length
                ? Math.round((submitted / teachers.length) * 100)
                : 0}
              %
            </p>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-active-bg)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${teachers.length ? (submitted / teachers.length) * 100 : 0}%`,
              }}
              transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--color-text)" }}
            />
          </div>
        </div>

        {/* Teacher list */}
        <div className="mt-5 space-y-2">
          {teachers.slice(0, 6).map((t, i) => {
            const hasWeekly = weeklySubmittedSlugs.has(t.slug);
            const hasLesson = todayLessonSlugs.has(t.slug);
            const done = hasWeekly || hasLesson;
            return (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05, duration: 0.35 }}
                className="flex items-center justify-between gap-3 py-2"
                style={{ borderBottom: "1px solid var(--color-active-border)" }}
              >
                <p
                  className="text-sm font-medium bangla truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {t.name}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {hasLesson && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full bangla"
                      style={{
                        backgroundColor: "var(--color-active-bg)",
                        border: "1px solid var(--color-active-border)",
                        color: "var(--color-text)",
                      }}
                    >
                      পড়া ✓
                    </span>
                  )}
                  {hasWeekly && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full bangla"
                      style={{
                        backgroundColor: "var(--color-active-bg)",
                        border: "1px solid var(--color-active-border)",
                        color: "var(--color-text)",
                      }}
                    >
                      Exam ✓
                    </span>
                  )}
                  {!done && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full bangla"
                      style={{
                        backgroundColor: "var(--color-active-bg)",
                        border: "1px solid var(--color-active-border)",
                        color: "var(--color-gray)",
                      }}
                    >
                      জমা নেই
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
          {teachers.length > 6 && (
            <p
              className="text-xs text-center pt-2 bangla"
              style={{ color: "var(--color-gray)" }}
            >
              আরও {teachers.length - 6} জন শিক্ষক
            </p>
          )}
        </div>

        {/* Monthly report link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-5"
        >
          <Link
            to="/dashboard/monthly-report"
            className="group flex items-center justify-between w-full rounded-2xl px-5 py-3"
            style={{
              backgroundColor: "var(--color-active-bg)",
              border: "1px solid var(--color-active-border)",
              color: "var(--color-text)",
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--color-gray)" }}
              />
              <span className="text-sm font-semibold bangla">
                মাসিক রিপোর্ট দেখুন
              </span>
            </div>
            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <ArrowRight
                className="w-4 h-4"
                style={{ color: "var(--color-gray)" }}
              />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
interface WeeklyExamDoc {
  _id: string;
  teacherSlug: string;
  createdAt: string;
  ExamNumber: string;
  class: string;
}

interface DailyLessonDoc {
  _id: string;
  teacherSlug: string;
  createdAt: string;
  class: string;
}

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role ?? "teacher";
  const slug = user?.slug ?? "";
  const isManager = ["principal", "admin", "owner"].includes(role);

  const { text: greetingText, emoji } = getGreeting();
  const banglaDate = getBanglaDate();

  /* ── Own weekly exam this week ── */
  const { data: myExams } = useQuery({
    queryKey: ["dash-my-exams", slug],
    queryFn: async () => {
      const { data } = await axiosPublic.get(
        `/api/weekly-exams?teacherSlug=${slug}`,
      );
      return data as WeeklyExamDoc[];
    },
    enabled: !!slug,
  });

  /* ── Own daily lessons today ── */
  const { data: myLessons } = useQuery({
    queryKey: ["dash-my-lessons", slug],
    queryFn: async () => {
      const { data } = await axiosPublic.get(
        `/api/daily-lessons?teacherSlug=${slug}`,
      );
      return (data?.data ?? data) as DailyLessonDoc[];
    },
    enabled: !!slug,
  });

  const hasSubmittedLesson = (myLessons ?? []).some((l) =>
    isTodayInRange(l.createdAt),
  );
  const hasSubmittedExam = (myExams ?? []).some((e) => isThisWeek(e.createdAt));

  const totalDone = [hasSubmittedLesson, hasSubmittedExam].filter(
    Boolean,
  ).length;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        {/* ════ HEADER ════ */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10 lg:mt-0 mb-10 lg:mb-14"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-6">
            <div>
              {/* Greeting pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  border: "1px solid var(--color-active-border)",
                }}
              >
                <span className="text-lg">{emoji}</span>
                <span
                  className="text-sm font-medium bangla"
                  style={{ color: "var(--color-gray)" }}
                >
                  {greetingText}
                </span>
                <span className="relative flex w-2 h-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ backgroundColor: "var(--color-text)" }}
                  />
                  <span
                    className="relative inline-flex rounded-full w-2 h-2"
                    style={{ backgroundColor: "var(--color-text)" }}
                  />
                </span>
              </motion.div>

              {/* Name */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bangla leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                {user?.name ?? "Dashboard"}
              </h1>

              {/* Typewriter */}
              <div
                className="mt-3 text-xl sm:text-2xl lg:text-3xl font-semibold bangla min-h-[2.5rem]"
                style={{ color: "var(--color-gray)" }}
              >
                <TypeAnimation
                  sequence={[
                    "আজকের কাজ সম্পন্ন করুন 📚",
                    2500,
                    "নিয়মিত পড়া জমা দিন ✏️",
                    2500,
                    "এগিয়ে থাকুন, এগিয়ে যান 🚀",
                    2500,
                    "জ্ঞানই শক্তি, পড়াই পথ 💡",
                    2500,
                  ]}
                  wrapper="span"
                  speed={55}
                  repeat={Infinity}
                  cursor
                />
              </div>
            </div>

            {/* Date + progress badges */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0"
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  border: "1px solid var(--color-active-border)",
                }}
              >
                <CalendarDays
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--color-gray)" }}
                />
                <span
                  className="text-xs sm:text-sm font-medium bangla"
                  style={{ color: "var(--color-gray)" }}
                >
                  {banglaDate}
                </span>
              </div>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  border: "1px solid var(--color-active-border)",
                }}
              >
                <Sparkles
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--color-gray)" }}
                />
                <span
                  className="text-xs sm:text-sm font-bold bangla"
                  style={{ color: "var(--color-text)" }}
                >
                  {totalDone}/2 সম্পন্ন
                </span>
              </div>
            </motion.div>
          </div>

          {/* Overall progress bar */}
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-active-bg)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalDone / 2) * 100}%` }}
              transition={{ delay: 0.55, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--color-text)" }}
            />
          </div>
          <p
            className="mt-2 text-xs bangla"
            style={{ color: "var(--color-gray)" }}
          >
            আজকের অগ্রগতি
          </p>
        </motion.div>

        {/* ════ CARDS ════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mb-6"
        >
          <ActionCard
            index={0}
            submitted={hasSubmittedLesson}
            icon={BookOpen}
            label="Daily Lesson"
            timeLabel="প্রতিদিন"
            question="আজকের পড়া জমা দিয়েছেন?"
            typeSequence={[
              "না দিলে এখনই জমা দিন 📖",
              2000,
              "আজকের পড়া বাকি রয়েছে ⏳",
              2000,
              "দেরি না করে এখনই জমা দিন ✍️",
              2000,
            ]}
            cta="Daily Lesson জমা দিন"
            to="/dashboard/daily-lesson/add"
            doneText="আজকের পড়া সফলভাবে জমা দেওয়া হয়েছে ✓"
          />

          <ActionCard
            index={1}
            submitted={hasSubmittedExam}
            icon={ClipboardList}
            label="Weekly Exam"
            timeLabel="রবিবার → শুক্রবার"
            question="এই সপ্তাহের Exam Question জমা দিয়েছেন?"
            typeSequence={[
              "না দিলে এখনই জমা দিন 📝",
              2000,
              "এই সপ্তাহের Exam বাকি আছে ⏳",
              2000,
              "Question এখনই সাবমিট করুন 🎯",
              2000,
            ]}
            cta="Weekly Exam জমা দিন"
            to="/dashboard/weekly-exam/add"
            doneText="এই সপ্তাহের Exam Question সফলভাবে জমা দেওয়া হয়েছে ✓"
          />
        </motion.div>

        {/* ════ STAFF SUMMARY (manager only) ════ */}
        {isManager && (
          <div className="mt-2">
            <StaffSummary teacherSlug={slug} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
