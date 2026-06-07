// src/components/mcq/ClassSection.tsx

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Exam, StatusFilter } from "../../types/McqExam";
import { getExamStatus } from "./MCQExam";
import { SectionHeader } from "./SectionHeader";
import { TodayExamCard } from "./TodayExamCard";
import { UpcomingExamCard } from "./UpcomingExamCard";
import { PastExamRow } from "./PastExamRow";
import { toBn } from "../../utility/Formatters";
import EmptyState from "../../components/common/Emptystate";

const PAST_PER_PAGE = 10;

/* ── Pagination ── */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="mt-3 flex items-center justify-center gap-2">
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] transition-opacity disabled:opacity-30"
    >
      <ChevronLeft size={14} />
    </motion.button>

    <span className="bangla text-xs text-[var(--color-gray)]">
      {toBn(currentPage)} / {toBn(totalPages)}
    </span>

    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] transition-opacity disabled:opacity-30"
    >
      <ChevronRight size={14} />
    </motion.button>
  </div>
);

/* ── Main ── */
export const ClassSection = ({
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
        icon={<AlertCircle className="w-10 h-10 text-[var(--color-gray)]" />}
        title={
          statusFilter === "upcoming"
            ? "কোনো আসন্ন পরীক্ষা নেই"
            : "কোনো সম্পন্ন পরীক্ষা নেই"
        }
        message="পরবর্তীতে পরীক্ষা যোগ হলে এখানে দেখা যাবে"
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
