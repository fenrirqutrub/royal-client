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
  _id?: string;
  name: string;
  role: string;
  avatar?: string | null; // ← Fixed: Now string (matches backend)
  userId?: string;
}

interface Exam {
  _id: string;
  description?: string;
  examDate: string;
  postedBy?: ExamPoster | null;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
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

/* Helper for Avatar (Future-proof) */
const getAvatarUrl = (
  avatar: string | { url?: string } | null | undefined,
): string => {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  if (typeof avatar === "object" && avatar?.url) return avatar.url;
  return "";
};

/* ───────── Sub Components ───────── */

const TodayExamCard = ({
  exam,
  onSelect,
}: {
  exam: Exam;
  onSelect: (e: Exam) => void;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(exam)}
    className="group relative mb-3 w-full overflow-hidden rounded-2xl border border-[var(--color-text)] bg-[var(--color-bg)] text-left shadow-sm transition-all hover:bg-[var(--color-active-bg)]"
  >
    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-2 py-0.5">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-text)]" />
      <span className="bangla text-[9px] font-bold text-[var(--color-text)]">
        আজ
      </span>
    </div>

    <div className="flex items-center gap-3 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-text)]">
        <Sparkles size={18} className="text-[var(--color-bg)]" />
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
        size={17}
        className="shrink-0 text-[var(--color-gray)] transition-transform group-hover:translate-x-1"
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
      className="group flex w-full items-center gap-3 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] p-3 text-left transition-colors hover:bg-[var(--color-active-bg)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
        <CalendarDays size={16} className="text-[var(--color-text)]" />
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
    className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--color-bg)]"
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)]">
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
  const avatarUrl = getAvatarUrl(poster?.avatar);
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
        initial={{ opacity: 0, scale: 0.96, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.22 }}
        className="fixed left-1/2 top-1/2 z-[1000] w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--color-active-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-gray)] transition-colors hover:text-[var(--color-text)]"
        >
          <X size={16} />
        </button>

        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={posterName}
              className="h-28 w-28 rounded-full border-4 border-[var(--color-active-border)] object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
              <User size={42} className="text-[var(--color-gray)]" />
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mb-4 text-center">
          <p className="bangla text-lg font-bold text-[var(--color-text)]">
            {posterName}
          </p>
          <p className="bangla mt-1 text-[11px] text-[var(--color-gray)]">
            পরীক্ষা পোস্ট করেছেন
            {exam.createdAt && (
              <>
                {" "}
                • {formatBnDate(exam.createdAt)} • {formatTime(exam.createdAt)}
              </>
            )}
          </p>
        </div>

        {/* Date Row */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-3">
          <div className="min-w-0">
            <p className="bangla text-sm font-bold text-[var(--color-text)]">
              {formatBnDate(exam.examDate)}
            </p>
            <p className="bangla text-xs text-[var(--color-gray)]">
              {formatBnWeekday(exam.examDate)}
            </p>
          </div>

          <div className="ml-3 shrink-0 rounded-full border border-[var(--color-active-border)] bg-[var(--color-bg)] px-2.5 py-1">
            <span className="bangla text-[10px] font-bold text-[var(--color-text)]">
              {statusText}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h4 className="bangla mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-gray)]">
            <FileText size={11} />
            বিবরণ
          </h4>
          <div className="rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4">
            <p className="bangla whitespace-pre-line text-sm leading-7 text-[var(--color-text)]">
              {exam.description?.trim() || "কোনো বিবরণ দেওয়া হয়নি"}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="bangla w-full rounded-2xl bg-[var(--color-text)] py-2.5 text-sm font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90"
        >
          বন্ধ করুন
        </motion.button>
      </motion.div>
    </>
  );
};

/* ───────── Main Component ───────── */
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
      const status = getExamStatus(exam.examDate);
      if (status === "today") today.push(exam);
      else if (status === "upcoming") upcoming.push(exam);
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

  // Keyboard ESC support
  useEffect(() => {
    if (!selectedExam) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedExam(null);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedExam]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-text)]">
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
            <CalendarDays size={34} className="text-[var(--color-gray)]" />
            <p className="bangla mt-3 text-sm font-semibold text-[var(--color-text)]">
              কোনো পরীক্ষা পাওয়া যায়নি
            </p>
          </div>
        ) : (
          <>
            {/* Today Exams */}
            {todayExams.length > 0 && (
              <section className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-text)]" />
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

            {/* Upcoming Exams */}
            {upcomingExams.length > 0 && (
              <section className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Clock size={12} className="text-[var(--color-gray)]" />
                  <h2 className="bangla text-xs font-bold text-[var(--color-text)]">
                    আসন্ন পরীক্ষা
                  </h2>
                  <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-gray)]">
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

            {/* Past Exams */}
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
                  <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-gray)]">
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
                    onPageChange={setPastPage}
                  />
                )}
              </section>
            )}
          </>
        )}
      </div>

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
