// src/pages/dashboard/MonthlyReport.tsx
import { motion, type Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import axiosPublic from "../../../hooks/axiosPublic";
import { useAuth } from "../../../context/AuthContext";

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
interface WeeklyExamDoc {
  _id: string;
  teacherSlug: string;
  teacher: string;
  createdAt: string;
  ExamNumber: string;
  class: string;
  subject: string;
}

interface DailyLessonDoc {
  _id: string;
  teacherSlug: string;
  teacher: string;
  createdAt: string;
  class: string;
  subject: string;
}

interface TeacherDoc {
  slug: string;
  name: string;
}

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */

// Get all weeks (Sun→Fri) for a given month/year
const getWeeksOfMonth = (year: number, month: number) => {
  const weeks: { start: Date; end: Date; label: string }[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let current = new Date(firstDay);
  // Move to first Sunday on or before firstDay
  current.setDate(current.getDate() - current.getDay());

  let weekNum = 1;
  while (current <= lastDay) {
    const sun = new Date(current);
    const fri = new Date(current);
    fri.setDate(fri.getDate() + 5);

    // Only include weeks that overlap with the month
    if (fri >= firstDay && sun <= lastDay) {
      const sunStr = sun.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "short",
      });
      const friStr = fri.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "short",
      });
      weeks.push({
        start: sun,
        end: new Date(fri.setHours(23, 59, 59, 999)),
        label: `সপ্তাহ ${weekNum} (${sunStr} – ${friStr})`,
      });
      weekNum++;
    }
    current.setDate(current.getDate() + 7);
  }
  return weeks;
};

const isInRange = (dateStr: string, start: Date, end: Date) => {
  const d = new Date(dateStr);
  return d >= start && d <= end;
};

const BANGLA_MONTHS = [
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

/* ══════════════════════════════════════════════════
   VARIANTS
══════════════════════════════════════════════════ */
const rowVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
  }),
};

/* ══════════════════════════════════════════════════
   WEEK STATUS CELL
══════════════════════════════════════════════════ */
const WeekCell = ({ done }: { done: boolean }) => (
  <motion.div
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3, ease: "backOut" }}
    className="flex items-center justify-center"
  >
    {done ? (
      <CheckCircle2
        className="w-5 h-5"
        style={{ color: "var(--color-text)" }}
      />
    ) : (
      <XCircle
        className="w-5 h-5"
        style={{ color: "var(--color-gray)", opacity: 0.4 }}
      />
    )}
  </motion.div>
);

/* ══════════════════════════════════════════════════
   TEACHER OWN REPORT
══════════════════════════════════════════════════ */
const TeacherOwnReport = ({
  slug,
  year,
  month,
  weeks,
}: {
  slug: string;
  year: number;
  month: number;
  weeks: { start: Date; end: Date; label: string }[];
}) => {
  const { data: exams } = useQuery({
    queryKey: ["report-my-exams", slug],
    queryFn: async () => {
      const { data } = await axiosPublic.get(
        `/api/weekly-exams?teacherSlug=${slug}`,
      );
      return data as WeeklyExamDoc[];
    },
    enabled: !!slug,
  });

  const { data: lessons } = useQuery({
    queryKey: ["report-my-lessons", slug],
    queryFn: async () => {
      const { data } = await axiosPublic.get(
        `/api/daily-lessons?teacherSlug=${slug}`,
      );
      return (data?.data ?? data) as DailyLessonDoc[];
    },
    enabled: !!slug,
  });

  const totalExamsSubmitted = weeks.filter((w) =>
    (exams ?? []).some((e) => isInRange(e.createdAt, w.start, w.end)),
  ).length;

  const totalLessonsThisMonth = (lessons ?? []).filter((l) => {
    const d = new Date(l.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "মোট সপ্তাহ", value: weeks.length, icon: ClipboardList },
          { label: "Exam জমা", value: totalExamsSubmitted, icon: CheckCircle2 },
          {
            label: "এই মাসে পড়া",
            value: totalLessonsThisMonth,
            icon: BookOpen,
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2 + i * 0.07,
                duration: 0.35,
                ease: "backOut",
              }}
              className="rounded-2xl p-4 text-center"
              style={{
                backgroundColor: "var(--color-active-bg)",
                border: "1px solid var(--color-active-border)",
              }}
            >
              <Icon
                className="w-5 h-5 mx-auto mb-2"
                style={{ color: "var(--color-gray)" }}
              />
              <p
                className="text-3xl font-black tabular-nums"
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
          );
        })}
      </div>

      {/* Weekly exam table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-active-border)" }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-3 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider bangla"
          style={{
            backgroundColor: "var(--color-active-bg)",
            borderBottom: "1px solid var(--color-active-border)",
            color: "var(--color-gray)",
          }}
        >
          <span>সপ্তাহ</span>
          <span className="text-center">Weekly Exam</span>
          <span className="text-center">Daily Lesson</span>
        </div>

        {weeks.map((w, i) => {
          const examDone = (exams ?? []).some((e) =>
            isInRange(e.createdAt, w.start, w.end),
          );
          const lessonCount = (lessons ?? []).filter((l) =>
            isInRange(l.createdAt, w.start, w.end),
          ).length;

          return (
            <motion.div
              key={i}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 gap-2 items-center px-4 py-3"
              style={{
                borderBottom:
                  i < weeks.length - 1
                    ? "1px solid var(--color-active-border)"
                    : "none",
              }}
            >
              <p
                className="text-xs bangla"
                style={{ color: "var(--color-text)" }}
              >
                {w.label}
              </p>
              <WeekCell done={examDone} />
              <div className="flex items-center justify-center gap-1">
                {lessonCount > 0 ? (
                  <>
                    <CheckCircle2
                      className="w-5 h-5"
                      style={{ color: "var(--color-text)" }}
                    />
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: "var(--color-gray)" }}
                    >
                      ×{lessonCount}
                    </span>
                  </>
                ) : (
                  <XCircle
                    className="w-5 h-5"
                    style={{ color: "var(--color-gray)", opacity: 0.4 }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MANAGER ALL TEACHERS REPORT
══════════════════════════════════════════════════ */
const ManagerReport = ({
  year,
  month,
  weeks,
}: {
  year: number;
  month: number;
  weeks: { start: Date; end: Date; label: string }[];
}) => {
  const { data: teachers } = useQuery({
    queryKey: ["report-teachers"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/users?role=teacher");
      return data as TeacherDoc[];
    },
  });

  const { data: exams } = useQuery({
    queryKey: ["report-all-exams"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/weekly-exams");
      return data as WeeklyExamDoc[];
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["report-all-lessons"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/daily-lessons");
      return (data?.data ?? data) as DailyLessonDoc[];
    },
  });

  if (!teachers?.length)
    return (
      <p
        className="text-center py-10 bangla"
        style={{ color: "var(--color-gray)" }}
      >
        কোনো শিক্ষক পাওয়া যায়নি
      </p>
    );

  // Filter to this month
  const monthExams = (exams ?? []).filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthLessons = (lessons ?? []).filter((l) => {
    const d = new Date(l.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "মোট শিক্ষক", value: teachers.length, icon: Users },
          {
            label: "Exam জমা দিয়েছেন",
            value: new Set(monthExams.map((e) => e.teacherSlug)).size,
            icon: ClipboardList,
          },
          {
            label: "পড়া জমা দিয়েছেন",
            value: new Set(monthLessons.map((l) => l.teacherSlug)).size,
            icon: BookOpen,
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2 + i * 0.07,
                duration: 0.35,
                ease: "backOut",
              }}
              className="rounded-2xl p-4 text-center"
              style={{
                backgroundColor: "var(--color-active-bg)",
                border: "1px solid var(--color-active-border)",
              }}
            >
              <Icon
                className="w-5 h-5 mx-auto mb-2"
                style={{ color: "var(--color-gray)" }}
              />
              <p
                className="text-3xl font-black tabular-nums"
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
          );
        })}
      </div>

      {/* Per-teacher weekly table */}
      <div className="space-y-4">
        {teachers.map((teacher, ti) => {
          const teacherExams = monthExams.filter(
            (e) => e.teacherSlug === teacher.slug,
          );
          const teacherLessons = monthLessons.filter(
            (l) => l.teacherSlug === teacher.slug,
          );
          const submittedWeeks = weeks.filter((w) =>
            teacherExams.some((e) => isInRange(e.createdAt, w.start, w.end)),
          ).length;

          return (
            <motion.div
              key={teacher.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15 + ti * 0.06,
                duration: 0.4,
                ease: "easeOut",
              }}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--color-active-border)" }}
            >
              {/* Teacher header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  borderBottom: "1px solid var(--color-active-border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-active-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    {teacher.name.charAt(0)}
                  </div>
                  <span
                    className="text-sm font-semibold bangla"
                    style={{ color: "var(--color-text)" }}
                  >
                    {teacher.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs bangla"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {submittedWeeks}/{weeks.length} সপ্তাহ
                  </span>
                  <span
                    className="text-xs bangla"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {teacherLessons.length} পড়া
                  </span>
                  {/* Mini progress */}
                  <div className="hidden sm:flex items-center gap-1">
                    {weeks.map((w, wi) => {
                      const done = teacherExams.some((e) =>
                        isInRange(e.createdAt, w.start, w.end),
                      );
                      return (
                        <div
                          key={wi}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: done
                              ? "var(--color-text)"
                              : "var(--color-active-border)",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Weekly rows */}
              <div
                className="divide-y"
                style={{ borderColor: "var(--color-active-border)" }}
              >
                {weeks.map((w, wi) => {
                  const examDone = teacherExams.some((e) =>
                    isInRange(e.createdAt, w.start, w.end),
                  );
                  const lessonCount = teacherLessons.filter((l) =>
                    isInRange(l.createdAt, w.start, w.end),
                  ).length;

                  return (
                    <motion.div
                      key={wi}
                      custom={wi}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-3 gap-2 items-center px-4 py-2.5"
                    >
                      <p
                        className="text-xs bangla"
                        style={{ color: "var(--color-gray)" }}
                      >
                        {w.label}
                      </p>
                      <div className="flex justify-center">
                        {examDone ? (
                          <CheckCircle2
                            className="w-4 h-4"
                            style={{ color: "var(--color-text)" }}
                          />
                        ) : (
                          <XCircle
                            className="w-4 h-4"
                            style={{
                              color: "var(--color-gray)",
                              opacity: 0.35,
                            }}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        {lessonCount > 0 ? (
                          <>
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: "var(--color-text)" }}
                            />
                            <span
                              className="text-xs font-bold"
                              style={{ color: "var(--color-gray)" }}
                            >
                              ×{lessonCount}
                            </span>
                          </>
                        ) : (
                          <XCircle
                            className="w-4 h-4"
                            style={{
                              color: "var(--color-gray)",
                              opacity: 0.35,
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN MONTHLY REPORT PAGE
══════════════════════════════════════════════════ */
const MonthlyReport = () => {
  const { user } = useAuth();
  const role = user?.role ?? "teacher";
  const slug = user?.slug ?? "";
  const isManager = ["principal", "admin", "owner"].includes(role);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const weeks = getWeeksOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mt-10 lg:mt-0 mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-sm bangla transition-colors"
              style={{ color: "var(--color-gray)" }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ড্যাশবোর্ড</span>
            </Link>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bangla"
                style={{ color: "var(--color-text)" }}
              >
                মাসিক রিপোর্ট
              </h1>
              <p
                className="mt-1 text-sm bangla"
                style={{ color: "var(--color-gray)" }}
              >
                {isManager ? "সকল শিক্ষকের জমা ও মিস" : "আপনার জমা ও মিস"}
              </p>
            </div>

            {/* Month navigator */}
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2 shrink-0"
              style={{
                backgroundColor: "var(--color-active-bg)",
                border: "1px solid var(--color-active-border)",
              }}
            >
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg transition-colors"
                style={{ color: "var(--color-gray)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span
                className="text-sm font-semibold bangla min-w-[8rem] text-center"
                style={{ color: "var(--color-text)" }}
              >
                {BANGLA_MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className="p-1 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "var(--color-gray)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table header legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 mb-5 text-xs bangla"
          style={{ color: "var(--color-gray)" }}
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {BANGLA_MONTHS[month]} {year} — {weeks.length}টি সপ্তাহ
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-text)" }}
            />
            <span>জমা দিয়েছেন</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" style={{ opacity: 0.4 }} />
            <span>জমা দেননি</span>
          </div>
        </motion.div>

        {/* Report content */}
        {isManager ? (
          <ManagerReport year={year} month={month} weeks={weeks} />
        ) : (
          <TeacherOwnReport
            slug={slug}
            year={year}
            month={month}
            weeks={weeks}
          />
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
