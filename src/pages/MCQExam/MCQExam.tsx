// src/components/mcq/MCQExam.tsx

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  X,
  FileText,
  ChevronRight,
  Clock,
  User,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import axiosPublic from "../../hooks/axiosPublic";
import { Pagination } from "../../components/common/Pagination";

/* ───────── types ───────── */
interface ExamPoster {
  _id: string;
  name: string;
  role: string;
  avatar?: { url: string | null } | null;
}

interface Exam {
  _id: string;
  description?: string;
  examDate: string;
  postedBy?: ExamPoster;
  createdAt?: string;
}

type ExamStatus = "today" | "upcoming" | "past";

/* ───────── helpers ───────── */
const formatBnDate = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatBnWeekday = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", { weekday: "long" });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getExamStatus = (examDate: string): ExamStatus => {
  const now = new Date();
  const date = new Date(examDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (examDay.getTime() === todayStart.getTime()) return "today";
  if (examDay > todayStart) return "upcoming";
  return "past";
};

const getDaysUntil = (examDate: string): number => {
  const now = new Date();
  const date = new Date(examDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.ceil(
    (examDay.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const toBn = (n: number): string =>
  n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const PAST_PER_PAGE = 5;

/* ───────── Sub Components ───────── */

const TodayExamCard = ({
  exam,
  onSelect,
}: {
  exam: Exam;
  onSelect: (e: Exam) => void;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.985 }}
    onClick={() => onSelect(exam)}
    className="group relative mb-3 w-full overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-[var(--color-bg)] text-left shadow-lg shadow-emerald-500/5 transition-shadow hover:shadow-emerald-500/10"
  >
    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

    <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="bangla text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
        আজ
      </span>
    </div>

    <div className="flex items-center gap-3 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
        <Sparkles size={20} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="bangla text-sm font-bold text-[var(--color-text)]">
          {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
        </p>
        {exam.description?.trim() && (
          <p className="bangla mt-0.5 line-clamp-1 text-xs text-[var(--color-gray)]">
            {exam.description.trim()}
          </p>
        )}
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-emerald-500 transition-transform group-hover:translate-x-1"
      />
    </div>
  </motion.button>
);

const UpcomingExamCard = ({
  exam,
  idx,
  onSelect,
}: {
  exam: Exam;
  idx: number;
  onSelect: (e: Exam) => void;
}) => {
  const days = getDaysUntil(exam.examDate);
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.04 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(exam)}
      className="group flex w-full items-center gap-3 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] p-3 text-left transition-colors hover:border-blue-400/30 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <CalendarDays size={16} className="text-blue-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="bangla text-sm font-semibold text-[var(--color-text)]">
          {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
        </p>
        <p className="bangla mt-0.5 text-[11px] text-[var(--color-gray)]">
          {days === 1 ? "আগামীকাল" : `${toBn(days)} দিন বাকি`}
        </p>
      </div>
      <ChevronRight
        size={14}
        className="shrink-0 text-[var(--color-gray)] transition-transform group-hover:translate-x-0.5"
      />
    </motion.button>
  );
};

const PastExamRow = ({
  exam,
  onSelect,
}: {
  exam: Exam;
  onSelect: (e: Exam) => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(exam)}
    className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--color-bg)]"
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg)] border border-[var(--color-active-border)]">
      <CheckCircle2 size={14} className="text-[var(--color-gray)]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="bangla text-sm font-medium text-[var(--color-text)]">
        {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
      </p>
    </div>
    <ChevronRight
      size={14}
      className="shrink-0 text-[var(--color-gray)] transition-transform group-hover:translate-x-0.5"
    />
  </motion.button>
);

/* ───────── Modal ───────── */
const ExamDetailModal = ({
  exam,
  onClose,
}: {
  exam: Exam;
  onClose: () => void;
}) => {
  const status = getExamStatus(exam.examDate);
  const daysUntil = getDaysUntil(exam.examDate);

  const statusText =
    status === "today"
      ? "আজকের পরীক্ষা"
      : status === "upcoming"
        ? daysUntil === 1
          ? "আগামীকাল"
          : `${toBn(daysUntil)} দিন বাকি`
        : "সম্পন্ন";

  const poster = exam.postedBy;
  const avatarUrl = poster?.avatar?.url || null;
  const posterName = poster?.name || "অজানা";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-1/2 z-[1000] w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-[var(--color-bg)] shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[var(--color-gray)] transition-all hover:bg-black/10 hover:text-[var(--color-text)] dark:bg-white/10 dark:hover:bg-white/20"
        >
          <X size={16} />
        </button>

        <div className="px-6 pb-6 pt-8">
          {/* Avatar — big, centered */}
          <div className="mb-4 flex justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={posterName}
                className="h-28 w-28 rounded-full border-4 border-[var(--color-active-border)] object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--color-active-border)] bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                <User size={44} className="text-white" />
              </div>
            )}
          </div>

          {/* Name + posted info */}
          <div className="mb-5 text-center">
            <p className="bangla text-lg font-bold text-[var(--color-text)]">
              {posterName}
            </p>
            <p className="bangla mt-0.5 text-[11px] text-[var(--color-gray)]">
              পরীক্ষা পোস্ট করেছেন
              {exam.createdAt && (
                <>
                  {" "}
                  • {formatBnDate(exam.createdAt)} {formatTime(exam.createdAt)}
                </>
              )}
            </p>
          </div>

          {/* Date + Status — compact */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-3">
            <div>
              <p className="bangla text-sm font-bold text-[var(--color-text)]">
                {formatBnDate(exam.examDate)}
              </p>
              <p className="bangla text-xs text-[var(--color-gray)]">
                {formatBnWeekday(exam.examDate)}
              </p>
            </div>
            <div
              className={`rounded-full px-2.5 py-1 ${
                status === "today"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : status === "upcoming"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-gray-500/10 text-[var(--color-gray)]"
              }`}
            >
              <span className="bangla text-[10px] font-bold">{statusText}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <h4 className="bangla mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gray)]">
              <FileText size={11} />
              বিবরণ
            </h4>
            <div className="rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4">
              <p className="bangla whitespace-pre-line text-sm leading-7 text-[var(--color-text)]">
                {exam.description?.trim() || "কোনো বিবরণ দেওয়া হয়নি"}
              </p>
            </div>
          </div>

          {/* Close btn */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="bangla w-full rounded-2xl bg-[var(--color-text)] py-2.5 text-sm font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90"
          >
            বন্ধ করুন
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

/* ───────── Main ───────── */
const MCQExam = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [pastPage, setPastPage] = useState(1);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axiosPublic.get("/api/mcq-exams");
        setExams(res.data?.data || []);
      } catch (error) {
        console.error("MCQ fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const { todayExams, upcomingExams, pastExams } = useMemo(() => {
    const today: Exam[] = [];
    const upcoming: Exam[] = [];
    const past: Exam[] = [];

    exams.forEach((exam) => {
      const s = getExamStatus(exam.examDate);
      if (s === "today") today.push(exam);
      else if (s === "upcoming") upcoming.push(exam);
      else past.push(exam);
    });

    upcoming.sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    );
    past.sort(
      (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
    );

    return { todayExams: today, upcomingExams: upcoming, pastExams: past };
  }, [exams]);

  const hasActive = todayExams.length > 0 || upcomingExams.length > 0;

  const pastTotalPages = Math.ceil(pastExams.length / PAST_PER_PAGE) || 1;
  const visiblePast = pastExams.slice(
    (pastPage - 1) * PAST_PER_PAGE,
    pastPage * PAST_PER_PAGE,
  );

  useEffect(() => {
    if (!selectedExam) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedExam(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedExam]);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-text)]">
            <BookOpen size={18} className="text-[var(--color-bg)]" />
          </div>
          <div>
            <h1 className="bangla text-xl font-bold text-[var(--color-text)]">
              MCQ পরীক্ষা
            </h1>
            <p className="bangla text-[11px] text-[var(--color-gray)]">
              কার্ডে ক্লিক করে বিস্তারিত দেখুন
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
              />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-6 py-16 text-center">
            <CalendarDays size={36} className="text-[var(--color-gray)]" />
            <p className="bangla mt-3 text-sm font-semibold text-[var(--color-text)]">
              কোনো পরীক্ষা পাওয়া যায়নি
            </p>
          </div>
        ) : (
          <>
            {/* TODAY */}
            {todayExams.length > 0 && (
              <section className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <h2 className="bangla text-xs font-bold text-[var(--color-text)]">
                    আজকের পরীক্ষা
                  </h2>
                </div>
                {todayExams.map((exam) => (
                  <TodayExamCard
                    key={exam._id}
                    exam={exam}
                    onSelect={setSelectedExam}
                  />
                ))}
              </section>
            )}

            {/* UPCOMING */}
            {upcomingExams.length > 0 && (
              <section className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Clock size={12} className="text-blue-500" />
                  <h2 className="bangla text-xs font-bold text-[var(--color-text)]">
                    আসন্ন পরীক্ষা
                  </h2>
                  <span className="bangla rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    {toBn(upcomingExams.length)}টি
                  </span>
                </div>
                <div className="grid gap-1.5">
                  {upcomingExams.map((exam, idx) => (
                    <UpcomingExamCard
                      key={exam._id}
                      exam={exam}
                      idx={idx}
                      onSelect={setSelectedExam}
                    />
                  ))}
                </div>
              </section>
            )}

            {!hasActive && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4">
                <Clock size={18} className="text-[var(--color-gray)]" />
                <p className="bangla text-sm text-[var(--color-gray)]">
                  বর্তমানে কোনো আসন্ন পরীক্ষা নেই
                </p>
              </div>
            )}

            {/* PAST — with Pagination */}
            {pastExams.length > 0 && (
              <section>
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2
                    size={12}
                    className="text-[var(--color-gray)]"
                  />
                  <h2 className="bangla text-xs font-bold text-[var(--color-text)]">
                    সম্পন্ন পরীক্ষা
                  </h2>
                  <span className="bangla rounded-full bg-[var(--color-active-bg)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-gray)]">
                    {toBn(pastExams.length)}টি
                  </span>
                </div>

                <div className="rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-1.5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pastPage}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18 }}
                    >
                      {visiblePast.map((exam) => (
                        <PastExamRow
                          key={exam._id}
                          exam={exam}
                          onSelect={setSelectedExam}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {pastTotalPages > 1 && (
                  <Pagination
                    currentPage={pastPage}
                    totalPages={pastTotalPages}
                    onPageChange={(p) => setPastPage(p)}
                  />
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedExam && (
          <ExamDetailModal
            exam={selectedExam}
            onClose={() => setSelectedExam(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCQExam;
