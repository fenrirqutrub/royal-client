// src/components/mcq/ClassSection.tsx

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { TodayExamCard } from "./TodayExamCard";
import { UpcomingExamCard } from "./UpcomingExamCard";
import { PastExamRow } from "./PastExamRow";
import { toBn, formatDisplay } from "../../utility/Formatters";

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
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] transition-opacity disabled:opacity-30 hover:bg-[var(--color-bg)]"
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
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] transition-opacity disabled:opacity-30 hover:bg-[var(--color-bg)]"
    >
      <ChevronRight size={14} />
    </motion.button>
  </div>
);

/* ── Main ── */
export const ClassSection = ({
  exams,
  onSelect,
  type,
  selectedDate,
}: {
  exams: Exam[];
  onSelect: (e: Exam) => void;
  type: "upcoming" | "completed";
  selectedDate?: Date | null;
}) => {
  const [pastPage, setPastPage] = useState(1);

  useEffect(() => {
    setPastPage(1);
  }, [exams, selectedDate]);

  const { todayExams, upcomingExams, pastExams } = useMemo(() => {
    const today: Exam[] = [];
    const upcoming: Exam[] = [];
    const past: Exam[] = [];

    exams.forEach((exam) => {
      const now = new Date();
      const examDate = new Date(exam.examDate);
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const examDay = new Date(
        examDate.getFullYear(),
        examDate.getMonth(),
        examDate.getDate(),
      );

      if (examDay.getTime() === todayStart.getTime()) {
        today.push(exam);
      } else if (examDay > todayStart) {
        upcoming.push(exam);
      } else {
        past.push(exam);
      }
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

    // Date filter for past exams
    let filteredPast = past;
    if (selectedDate && type === "completed") {
      filteredPast = past.filter((exam) => {
        const examDate = new Date(exam.examDate);
        return (
          examDate.getDate() === selectedDate.getDate() &&
          examDate.getMonth() === selectedDate.getMonth() &&
          examDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    return {
      todayExams: today,
      upcomingExams: upcoming,
      pastExams: filteredPast,
    };
  }, [exams, selectedDate, type]);

  const pastTotalPages = Math.ceil(pastExams.length / PAST_PER_PAGE) || 1;
  const visiblePast = pastExams.slice(
    (pastPage - 1) * PAST_PER_PAGE,
    pastPage * PAST_PER_PAGE,
  );

  if (type === "upcoming") {
    return (
      <div className="space-y-4">
        {/* Today */}
        {todayExams.length > 0 && (
          <div className="space-y-3">
            {todayExams.map((exam) => (
              <TodayExamCard key={exam._id} exam={exam} onSelect={onSelect} />
            ))}
          </div>
        )}

        {/* Upcoming */}
        {upcomingExams.length > 0 && (
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
        )}
      </div>
    );
  }

  // Past/Completed exams
  return (
    <div>
      {pastExams.length > 0 ? (
        <>
          <div className="rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] overflow-hidden">
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
        </>
      ) : (
        selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4"
          >
            <AlertCircle size={18} className="text-[var(--color-gray)]" />
            <p className="bangla text-sm text-[var(--color-gray)]">
              {formatDisplay(selectedDate)} তারিখে কোনো পরীক্ষা নেই
            </p>
          </motion.div>
        )
      )}
    </div>
  );
};
