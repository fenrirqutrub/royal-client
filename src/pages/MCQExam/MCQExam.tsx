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
  CheckCircle2,
  AlertCircle,
  FileQuestionMark,
} from "lucide-react";
import axiosPublic from "../../hooks/axiosPublic";
import { Pagination } from "../../components/common/Pagination";
import AnimatedFilterPills from "../../components/common/AnimatedFilterPills";
import SelectInput from "../../components/common/SelectInput";
import { toBn } from "../../utility/Formatters";
import { CLASSES, getStudentClassNumber } from "../../utility/constants/class";
import { useGuestPreview } from "../../hooks/useGuestPreview";
import LoginPromptOverlay from "../Admin/Auth/LoginPromptOverlay";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface ExamPoster {
  _id?: string;
  name: string;
  role: string;
  avatar?: string | null;
  userId?: string;
}

interface Exam {
  _id: string;
  studentClass: string;
  subject: string;
  description?: string;
  examDate: string;
  postedBy?: ExamPoster | null;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
}

type ExamStatus = "today" | "upcoming" | "past";
type StatusFilter = "upcoming" | "finished";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
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

const PAST_PER_PAGE = 10;

const getAvatarUrl = (
  avatar: string | { url?: string } | null | undefined,
): string => {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  if (typeof avatar === "object" && avatar?.url) return avatar.url;
  return "";
};

/* ═══════════════════════════════════════════
   Reusable UI
   ═══════════════════════════════════════════ */
const SkeletonCard = ({ height = "h-16" }: { height?: string }) => (
  <div
    className={`${height} animate-pulse rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]`}
  />
);

const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-6 py-16 text-center"
  >
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-bg)]">
      <Icon size={24} className="text-[var(--color-gray)]" />
    </div>
    <p className="bangla text-sm font-semibold text-[var(--color-text)]">
      {title}
    </p>
    {subtitle && (
      <p className="bangla mt-1 text-xs text-[var(--color-gray)]">{subtitle}</p>
    )}
  </motion.div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  count,
  pulse,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  pulse?: boolean;
}) => (
  <div className="mb-3 flex items-center gap-2">
    {pulse ? (
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
    ) : (
      <Icon size={13} className="text-[var(--color-gray)]" />
    )}

    <h2 className="bangla text-xs font-bold uppercase tracking-wide text-[var(--color-text)]">
      {title}
    </h2>

    {typeof count === "number" && count > 0 && (
      <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-gray)]">
        {toBn(count)}টি
      </span>
    )}
  </div>
);

/* ═══════════════════════════════════════════
   Cards
   ═══════════════════════════════════════════ */
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
    whileTap={{ scale: 0.985 }}
    onClick={() => onSelect(exam)}
    className="group mb-3 w-full overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] text-left shadow-sm transition-all hover:shadow-md"
  >
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div className="flex h-16 min-w-[56px] shrink-0 items-center justify-center rounded bg-[var(--color-text)] px-2 shadow-sm">
          <span className="whitespace-nowrap text-sm font-bold leading-none text-[var(--color-bg)] lg:text-lg">
            {getStudentClassNumber(exam.studentClass)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="bangla text-lg font-bold leading-snug text-[var(--color-text)]">
            {exam.subject}
          </p>

          <p className="bangla mt-0.5 text-[11px] font-medium text-[var(--color-gray)]">
            {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
          </p>

          {exam.description?.trim() && (
            <p className="bangla mt-1 line-clamp-1 text-[11px] text-[var(--color-gray)]">
              {exam.description.trim()}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <div className="flex items-center justify-center gap-1.5 rounded-full border border-green-500 bg-[var(--color-active-bg)] px-5 py-0.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="bangla text-xs font-bold text-[var(--color-text)]">
            আজ
          </span>
        </div>
      </div>
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
      className="group flex w-full items-center gap-3.5 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-bg)] p-3.5 text-left transition-all hover:border-[var(--color-text)]/20 hover:bg-[var(--color-active-bg)] hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
        <CalendarDays size={16} className="text-[var(--color-text)]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="bangla text-sm lg:text-lg font-bold text-[var(--color-text)]">
          {exam.subject}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="bangla text-[11px] text-[var(--color-gray)]">
            {formatBnDate(exam.examDate)}
          </span>
          <span className="text-[var(--color-active-border)]">·</span>
          <span className="bangla text-[11px] text-[var(--color-gray)]">
            {formatBnWeekday(exam.examDate)}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-5 py-1 text-xs font-bold text-[var(--color-text)]">
          {days === 1 ? "আগামীকাল" : ` আর মাত্র ${toBn(days)} দিন`}
        </span>
      </div>
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
    className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[var(--color-bg)]"
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)]">
      <CheckCircle2 size={15} className="text-[var(--color-gray)]" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="bangla text-[13px] font-medium text-[var(--color-text)]">
        {exam.subject}
      </p>
      <p className="bangla text-[11px] text-[var(--color-gray)]">
        {formatBnDate(exam.examDate)} • {formatBnWeekday(exam.examDate)}
      </p>
    </div>

    <ChevronRight
      size={14}
      className="shrink-0 text-[var(--color-gray)] transition-transform duration-200 group-hover:translate-x-0.5"
    />
  </motion.button>
);

/* ═══════════════════════════════════════════
   Modal
   ═══════════════════════════════════════════ */
const ExamDetailModal = ({
  exam,
  onClose,
}: {
  exam: Exam;
  onClose: () => void;
}) => {
  const status = getExamStatus(exam.examDate);
  const daysUntil = getDaysUntil(exam.examDate);

  const statusConfig = {
    today: {
      text: "আজকের পরীক্ষা",
      dotColor: "bg-green-500",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/5",
    },
    upcoming: {
      text: daysUntil === 1 ? "আগামীকাল" : `${toBn(daysUntil)} দিন বাকি`,
      dotColor: "bg-blue-500",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/5",
    },
    past: {
      text: "সম্পন্ন",
      dotColor: "bg-[var(--color-gray)]",
      borderColor: "border-[var(--color-active-border)]",
      bgColor: "bg-[var(--color-active-bg)]",
    },
  };

  const sc = statusConfig[status];
  const poster = exam.postedBy;
  const avatarUrl = getAvatarUrl(poster?.avatar);
  const posterName = poster?.name || "অজানা";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="fixed left-1/2 top-1/2 z-[1000] max-h-[90vh] w-[92%] lg:w-[60%] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[var(--color-active-border)] bg-[var(--color-bg)] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-text)] via-[var(--color-text)]/50 to-transparent" />

        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-red-500 bg-red-600 text-[var(--color-gray)] transition-all hover:scale-105 hover:text-[var(--color-text)]"
          >
            <X size={16} />
          </button>

          <div className="mb-4 flex justify-center">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={posterName}
                  className="h-24 w-24 rounded-full border-4 border-[var(--color-active-border)] object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--color-active-border)] bg-[var(--color-active-bg)] shadow-lg">
                  <User size={36} className="text-[var(--color-gray)]" />
                </div>
              )}

              <div
                className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg)] ${sc.bgColor}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${sc.dotColor}`} />
              </div>
            </div>
          </div>

          <div className="mb-5 text-center">
            <p className="bangla text-lg font-bold text-[var(--color-text)]">
              {posterName}
            </p>
            <p className="bangla mt-1 text-[11px] text-[var(--color-gray)]">
              পরীক্ষা পোস্ট করেছেন
              {exam.createdAt && (
                <div>
                  {" "}
                  • {formatBnDate(exam.createdAt)} •{" "}
                  {formatTime(exam.createdAt)}
                </div>
              )}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-5 py-1 text-sm font-bold text-[var(--color-text)]">
              {exam.studentClass}
            </span>
            <ChevronRight size={15} className="text-[var(--color-gray)]" />
            <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-5 py-1 text-sm font-bold text-[var(--color-text)]">
              {exam.subject}
            </span>
          </div>

          <div
            className={`mb-4 flex items-center justify-between rounded-2xl border ${sc.borderColor} ${sc.bgColor} px-4 py-3`}
          >
            <div className="min-w-0 flex items-center gap-2 bangla text-xs lg:text-sm font-bold text-[var(--color-gray)]">
              <p className="">পরিক্ষার তারিখঃ {formatBnDate(exam.examDate)}</p>
              <p className="">রোজঃ {formatBnWeekday(exam.examDate)}</p>
            </div>

            <div className="ml-3 flex shrink-0 items-center gap-1.5 px-2.5 py-1">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse`}
              />
              <span className="bangla text-[10px] font-bold text-[var(--color-text)]">
                {sc.text}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="bangla mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-gray)]">
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
            className="bangla w-full rounded-2xl bg-[var(--color-text)] py-3 text-sm font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90"
          >
            বন্ধ করুন
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Class Section
   ═══════════════════════════════════════════ */
const ClassSection = ({
  exams,
  onSelect,
  statusFilter,
}: {
  exams: Exam[];
  onSelect: (e: Exam) => void;
  statusFilter: StatusFilter;
}) => {
  const [pastPage, setPastPage] = useState(1);

  useEffect(() => {
    setPastPage(1);
  }, [exams]);

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

    today.sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    );

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

  if (exams.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={
          statusFilter === "upcoming"
            ? "কোনো আসন্ন পরীক্ষা নেই"
            : "কোনো সম্পন্ন পরীক্ষা নেই"
        }
        subtitle="পরবর্তীতে পরীক্ষা যোগ হলে এখানে দেখা যাবে"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Today */}
      {todayExams.length > 0 && (
        <section>
          {todayExams.map((exam) => (
            <TodayExamCard key={exam._id} exam={exam} onSelect={onSelect} />
          ))}
        </section>
      )}

      {/* Upcoming */}
      {upcomingExams.length > 0 && (
        <section>
          <div className="grid gap-2">
            {upcomingExams.map((exam, idx) => (
              <UpcomingExamCard
                key={exam._id}
                exam={exam}
                idx={idx}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* No active */}
      {!hasActive && statusFilter === "upcoming" && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4">
          <Clock size={18} className="text-[var(--color-gray)]" />
          <p className="bangla text-sm text-[var(--color-gray)]">
            বর্তমানে কোনো আসন্ন পরীক্ষা নেই
          </p>
        </div>
      )}

      {/* Past / Finished */}
      {pastExams.length > 0 && (
        <section>
          <SectionHeader
            icon={CheckCircle2}
            title="সম্পন্ন পরীক্ষা"
            count={pastExams.length}
          />

          <div className="rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-1.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={pastPage}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="divide-y divide-[var(--color-active-border)]"
              >
                {visiblePast.map((exam) => (
                  <PastExamRow key={exam._id} exam={exam} onSelect={onSelect} />
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
    </div>
  );
};

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */
const MCQExam = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeClass, setActiveClass] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");
  const { isGuest } = useGuestPreview();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ── Guest select handler ──
  const handleSelect = (exam: Exam) => {
    if (isGuest) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedExam(exam);
  };

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

  // ✅ এখন — শুধু today + upcoming count করবে
  const examCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    CLASSES.forEach((cls) => {
      map[cls] = 0;
    });
    exams.forEach((exam) => {
      const s = getExamStatus(exam.examDate);
      if (s === "today" || s === "upcoming") {
        map[exam.studentClass] = (map[exam.studentClass] || 0) + 1;
      }
    });
    return map;
  }, [exams]);

  // ✅ এখন — শুধু data আছে এমন class দেখাবে
  const classFilterItems = useMemo(
    () =>
      CLASSES.filter((cls) => (examCountMap[cls] || 0) > 0).map((cls) => ({
        id: cls,
        title: cls,
        className: "",
        label: <span>{cls}</span>,
      })),
    [examCountMap],
  );

  const filteredExams = useMemo(() => {
    let result =
      activeClass === "all"
        ? exams
        : exams.filter((e) => e.studentClass === activeClass);

    if (statusFilter === "upcoming") {
      result = result.filter((e) => {
        const s = getExamStatus(e.examDate);
        return s === "today" || s === "upcoming";
      });
    } else if (statusFilter === "finished") {
      result = result.filter((e) => getExamStatus(e.examDate) === "past");
    }

    return result;
  }, [exams, activeClass, statusFilter]);

  const selectedStats = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let past = 0;
    filteredExams.forEach((e) => {
      const s = getExamStatus(e.examDate);
      if (s === "today") today++;
      else if (s === "upcoming") upcoming++;
      else past++;
    });
    return { today, upcoming, past, total: filteredExams.length };
  }, [filteredExams]);

  const totalStats = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let past = 0;
    exams.forEach((e) => {
      const s = getExamStatus(e.examDate);
      if (s === "today") today++;
      else if (s === "upcoming") upcoming++;
      else past++;
    });
    return { today, upcoming, past, total: exams.length };
  }, [exams]);

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "upcoming",
        label: `আসন্ন পরীক্ষা (${toBn(totalStats.today + totalStats.upcoming)})`,
        icon: <Clock size={14} />,
      },
      {
        value: "finished",
        label: `সম্পন্ন পরীক্ষা (${toBn(totalStats.past)})`,
        icon: <CheckCircle2 size={14} />,
      },
    ],
    [totalStats.today, totalStats.upcoming, totalStats.past],
  );

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
      <div className="mx-auto w-full">
        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileQuestionMark size={30} className="text-[var(--color-text)]" />
            <div>
              <h1 className="bangla text-xl lg:text-3xl font-bold text-[var(--color-text)]">
                আজকের MCQ পরীক্ষা
              </h1>
            </div>
          </div>

          <div className="relative mb-6 flex items-start justify-between">
            {!loading && exams.length > 0 && totalStats.today > 0 && (
              <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none">
                <span className="bangla text-5xl lg:text-7xl font-bold leading-none text-[var(--color-gray)] opacity-10">
                  {toBn(totalStats.today)}/{toBn(totalStats.total)}
                </span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard height="h-12" />
            <div className="grid gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} height="h-[72px]" />
              ))}
            </div>
          </div>
        ) : exams.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="কোনো পরীক্ষা পাওয়া যায়নি"
            subtitle="পরবর্তীতে পরীক্ষা যোগ হলে এখানে দেখা যাবে"
          />
        ) : (
          <>
            {/* ── Status Filter ── */}
            <div className="mb-4 relative">
              <SelectInput
                label="পরীক্ষার ধরন"
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as StatusFilter)}
                placeholder="ফিল্টার নির্বাচন করুন"
              />
              {isGuest && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={() => setShowLoginPrompt(true)}
                />
              )}
            </div>

            {/* ── Class Filter ── */}
            <div className="mb-5 relative overflow-hidden rounded border border-[var(--color-active-border)] p-2">
              <AnimatedFilterPills
                items={classFilterItems}
                activeId={activeClass}
                onChange={setActiveClass}
                showAll
                allId="all"
                allLabel={<span>সকল</span>}
                layoutId="mcq-class-filter"
              />
              {isGuest && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={() => setShowLoginPrompt(true)}
                />
              )}
            </div>

            {/* ── Selected class label ── */}
            <div className="mb-5 flex justify-center items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeClass}-${statusFilter}`}
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="flex shrink-0 justify-center items-center gap-2 rounded border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-2 w-full bangla text-sm lg:text-lg font-bold text-[var(--color-gray)]"
                >
                  <span>
                    {activeClass === "all" ? "সকল ক্লাস" : activeClass}
                  </span>
                  <span>
                    • {statusFilter === "upcoming" ? "আসন্ন" : "সম্পন্ন"}{" "}
                    {toBn(selectedStats.total)}টি
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeClass}-${statusFilter}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <ClassSection
                  exams={filteredExams}
                  onSelect={handleSelect}
                  statusFilter={statusFilter}
                />
              </motion.div>
            </AnimatePresence>
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

      <LoginPromptOverlay
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default MCQExam;
