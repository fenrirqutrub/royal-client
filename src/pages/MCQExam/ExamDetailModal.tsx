import {
  ChevronRight,
  FileText,
  User,
  X,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
} from "lucide-react";
import type { Exam, ExamStatus } from "../../types/McqExam";
import {
  formatBnDate,
  formatBnWeekday,
  formatTime,
  toBn,
} from "../../utility/Formatters";
import { getAvatarUrl } from "./MCQExam";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* ── helpers ─ */
const getDaysUntil = (examDate: string): number => {
  const now = new Date();
  const date = new Date(examDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.ceil(
    (examDay.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const getExamStatus = (examDate: string): ExamStatus => {
  const now = new Date();
  const date = new Date(examDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (examDay.getTime() === todayStart.getTime()) return "today";
  if (examDay > todayStart) return "upcoming";
  return "past";
};

/* ── Delete Confirm Sheet ── */
const DeleteConfirmSheet = ({
  examSubject,
  onConfirm,
  onCancel,
  loading,
}: {
  examSubject: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-[var(--color-bg)]/95 backdrop-blur-sm p-6"
  >
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="w-full max-w-xs text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <Trash2 size={28} className="text-red-500" />
      </div>
      <h3 className="bangla mb-1 text-lg font-bold text-[var(--color-text)]">
        পরীক্ষা মুছে ফেলবেন?
      </h3>
      <p className="bangla mb-6 text-sm text-[var(--color-gray)]">
        <span className="font-semibold text-[var(--color-text)]">
          {examSubject}
        </span>{" "}
        পরীক্ষাটি স্থায়ীভাবে মুছে যাবে। এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।
      </p>
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          disabled={loading}
          className="bangla flex-1 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-2.5 text-sm font-bold text-[var(--color-text)] transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          বাতিল
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          disabled={loading}
          className="bangla flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "মুছছে…" : "হ্যাঁ, মুছুন"}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Props ── */
interface ExamDetailModalProps {
  exam: Exam;
  onClose: () => void;
  userRole?: string;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => Promise<void>;
}

export const ExamDetailModal = ({
  exam,
  onClose,
  userRole,
  onEdit,
  onDelete,
}: ExamDetailModalProps) => {
  const status = getExamStatus(exam.examDate);
  const daysUntil = getDaysUntil(exam.examDate);
  const isPrivileged = userRole && userRole !== "student";

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleteLoading(true);
    try {
      await onDelete(exam);
      onClose();
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusConfig = {
    today: {
      text: "আজকের পরীক্ষা",
      dotColor: "bg-green-500",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/5",
      badgeBg:
        "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400",
      gradientFrom: "from-green-500/20",
    },
    upcoming: {
      text: daysUntil === 1 ? "আগামীকাল" : `${toBn(daysUntil)} দিন বাকি`,
      dotColor: "bg-blue-500",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/5",
      badgeBg:
        "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
      gradientFrom: "from-blue-500/20",
    },
    past: {
      text: "সম্পন্ন",
      dotColor: "bg-[var(--color-gray)]",
      borderColor: "border-[var(--color-active-border)]",
      bgColor: "bg-[var(--color-active-bg)]",
      badgeBg:
        "bg-[var(--color-active-bg)] border-[var(--color-active-border)] text-[var(--color-gray)]",
      gradientFrom: "from-[var(--color-active-bg)]",
    },
  };

  const sc = statusConfig[status];
  const poster = exam.postedBy;
  const avatarUrl = getAvatarUrl(poster?.avatar);
  const posterName = poster?.name || "অজানা";

  return (
    <div>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="fixed left-1/2 top-1/2 z-[1000] max-h-[92vh] w-[92%] lg:w-[56%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[var(--color-active-border)] bg-[var(--color-bg)] shadow-2xl"
      >
        {/* Inner scroll wrapper */}
        <div className="relative max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Delete confirm overlay */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <DeleteConfirmSheet
                examSubject={exam.subject}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                loading={deleteLoading}
              />
            )}
          </AnimatePresence>

          {/* Top accent bar */}
          <div
            className={`h-1 w-full bg-gradient-to-r ${sc.gradientFrom} via-[var(--color-text)]/40 to-transparent`}
          />

          {/* Header with status badge */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span
              className={`bangla flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${sc.badgeBg}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${sc.dotColor} ${status === "today" ? "animate-pulse" : ""}`}
              />
              {sc.text}
            </span>

            {/* Action buttons (non-student) */}
            <div className="flex items-center gap-2">
              {isPrivileged && onEdit && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onEdit(exam);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)] transition-all hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-500"
                >
                  <Pencil size={12} />
                  <span className="bangla">সম্পাদনা</span>
                </motion.button>
              )}

              {isPrivileged && onDelete && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10"
                >
                  <Trash2 size={12} />
                  <span className="bangla">মুছুন</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-gray)] transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
              >
                <X size={15} />
              </motion.button>
            </div>
          </div>

          <div className="p-5 pt-3">
            {/* ✅ Poster card - Updated Avatar Section */}
            <div className="mb-6 flex flex-col justify-center items-center gap-4 p-4">
              {/* Avatar Container with Ring Effect */}
              <div className="relative">
                {/* Outer Ring Animation */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-text)]/20 to-transparent blur-xl scale-110" />

                {/* Avatar */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={posterName}
                    className="h-40 w-40 shrink-0 rounded-full border-4 border-[var(--color-active-border)] object-cover shadow-lg"
                    style={{ aspectRatio: "1/1" }}
                  />
                ) : (
                  <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-4 border-[var(--color-active-border)] bg-gradient-to-br from-[var(--color-active-bg)] to-[var(--color-bg)] shadow-lg">
                    <User
                      size={48}
                      className="text-[var(--color-gray)] opacity-60"
                    />
                  </div>
                )}

                {/* Status Dot (Optional) */}
                <div
                  className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-[var(--color-bg)] ${sc.dotColor}`}
                />
              </div>

              {/* Name & Info */}
              <div className="text-center">
                <p className="bangla text-lg font-bold text-[var(--color-text)] truncate max-w-[200px]">
                  {posterName}
                </p>
                <p className="bangla text-[12px] text-[var(--color-gray)] mt-1">
                  পরীক্ষা যোগ করেছেন
                </p>
                {exam.createdAt && (
                  <p className="bangla text-[11px] text-[var(--color-gray)]/70 mt-1.5">
                    {formatBnDate(exam.createdAt)} •{" "}
                    {formatTime(exam.createdAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Subject + Class chips */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-1.5 text-sm font-bold text-[var(--color-text)]">
                {exam.studentClass}
              </span>
              <ChevronRight size={14} className="text-[var(--color-gray)]" />
              <span className="bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-1.5 text-sm font-bold text-[var(--color-text)]">
                {exam.subject}
              </span>
            </div>

            {/* Date info card */}
            <div
              className={`mb-5 overflow-hidden rounded-2xl border ${sc.borderColor} ${sc.bgColor}`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)]">
                  <CalendarDays
                    size={16}
                    className="text-[var(--color-text)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="bangla text-xs text-[var(--color-gray)]">
                    পরীক্ষার তারিখ
                  </p>
                  <p className="bangla text-sm font-bold text-[var(--color-text)]">
                    {formatBnDate(exam.examDate)} •{" "}
                    {formatBnWeekday(exam.examDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Clock size={11} className="text-[var(--color-gray)]" />
                  <span
                    className={`bangla text-[11px] font-bold ${status === "today" ? "text-green-500" : "text-[var(--color-gray)]"}`}
                  >
                    {sc.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="bangla mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray)]">
                <FileText size={10} />
                বিবরণ
              </h4>
              <div className="rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4">
                <p className="bangla whitespace-pre-line text-sm leading-7 text-[var(--color-text)]">
                  {exam.description?.trim() || (
                    <span className="italic text-[var(--color-gray)]">
                      কোনো বিবরণ দেওয়া হয়নি
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Bottom actions */}
            {isPrivileged ? (
              <div className="grid grid-cols-2 gap-3">
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onEdit(exam);
                      onClose();
                    }}
                    className="bangla flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-3 text-sm font-bold text-[var(--color-text)] transition-all hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-500"
                  >
                    <Pencil size={14} />
                    সম্পাদনা করুন
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`bangla flex items-center justify-center rounded-2xl bg-[var(--color-text)] py-3 text-sm font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90 ${onEdit ? "" : "col-span-2"}`}
                >
                  বন্ধ করুন
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="bangla w-full rounded-2xl bg-[var(--color-text)] py-3 text-sm font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90"
              >
                বন্ধ করুন
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
