// ExamDetailModal.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  FileText,
  Pencil,
  Trash2,
  BookOpen,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { formatBnDate } from "../../utility/Formatters";

interface ExamDetailModalProps {
  exam: Exam;
  onClose: () => void;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => Promise<void>;
  userRole?: string;
}

export const MCQExamDetailModal = ({
  exam,
  onClose,
  onEdit,
  onDelete,
  userRole,
}: ExamDetailModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isStaff = userRole && userRole !== "student";
  const isToday =
    new Date(exam.examDate).toDateString() === new Date().toDateString();

  // ✅ Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(exam);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Fixed avatar URL getter with proper type checking
  const getAvatarUrl = (): string | null => {
    if (!exam.postedBy?.avatar) return null;

    // If avatar is a string, return it directly
    if (typeof exam.postedBy.avatar === "string") {
      return exam.postedBy.avatar;
    }

    // If avatar is an object, try to get the url property
    if (
      typeof exam.postedBy.avatar === "object" &&
      exam.postedBy.avatar !== null
    ) {
      const avatarObj = exam.postedBy.avatar as any; // Type assertion
      return avatarObj.url || null;
    }

    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[101] flex flex-col overflow-hidden bg-[var(--color-bg)] border border-[var(--color-active-border)]/50 shadow-2xl"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* ✅ Close Button - Fixed Position */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-[var(--color-bg)] p-2 text-[var(--color-gray)] shadow-lg ring-2 ring-[var(--color-active-border)] transition-colors hover:bg-red-500/10 hover:text-red-500 hover:ring-red-500/30"
        >
          <X size={20} />
        </motion.button>

        <div
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>{`
            .modal-content::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="modal-content mx-auto max-w-xl space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -inset-2 rounded-full bg-gradient-to-r from-[var(--color-text)]/20 via-transparent to-[var(--color-text)]/20 blur-xl"
                />

                <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-[var(--color-active-border)] bg-gradient-to-br from-[var(--color-active-bg)] to-[var(--color-bg)] shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={exam.postedBy?.name || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-text)] to-[var(--color-text)]/80">
                      <User size={32} className="text-[var(--color-bg)]" />
                    </div>
                  )}
                </div>

                {isToday && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 shadow-lg"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    <span className="bangla text-xs font-bold text-white">
                      আজ
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Teacher Name */}
            {exam.postedBy?.name && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h3 className="bangla text-lg font-bold text-[var(--color-gray)]">
                  শিক্ষকঃ {exam.postedBy.name}
                </h3>
              </motion.div>
            )}

            {/* Subject & Class */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-center"
            >
              <h2 className="bangla mb-2 text-2xl font-bold text-[var(--color-text)]">
                {exam.subject}
              </h2>

              <div className="flex items-center justify-center gap-2">
                <span className="bangla flex items-center gap-1.5 rounded-full border border-[var(--color-text)] bg-[var(--color-text)]/10 px-3 py-1 text-sm font-bold text-[var(--color-text)]">
                  <BookOpen size={12} />
                  {exam.studentClass}
                </span>
              </div>
            </motion.div>

            {/* Exam Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-gradient-to-br from-[var(--color-active-bg)] to-transparent"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-text)]">
                  <Calendar size={20} className="text-[var(--color-bg)]" />
                </div>
                <div className="flex-1">
                  <p className="bangla text-xs font-bold uppercase tracking-wider text-[var(--color-gray)]">
                    পরীক্ষার তারিখ
                  </p>
                  <p className="bangla text-lg font-bold text-[var(--color-text)]">
                    {formatBnDate(exam.examDate)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            {exam.description?.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
              >
                <div className="border-b border-[var(--color-active-border)] bg-gradient-to-r from-[var(--color-active-bg)] to-transparent px-4 py-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[var(--color-text)]" />
                    <h4 className="bangla text-sm font-bold uppercase tracking-wider text-[var(--color-gray)]">
                      বিবরণ
                    </h4>
                  </div>
                </div>
                <div className="p-4">
                  <p className="bangla whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">
                    {exam.description.trim()}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {isStaff && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="shrink-0 border-t border-[var(--color-active-border)] bg-gradient-to-b from-transparent to-[var(--color-active-bg)] p-4"
          >
            <div className="mx-auto flex max-w-xl gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEdit?.(exam)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-text)] py-3 text-sm font-bold text-[var(--color-bg)] shadow-lg transition-all hover:shadow-xl"
              >
                <Pencil size={16} />
                <span className="bangla">সম্পাদনা</span>
              </motion.button>

              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-red-500/10 px-6 py-3 text-sm font-bold text-red-500 shadow-lg transition-all hover:bg-red-500 hover:text-white hover:shadow-xl"
                >
                  <Trash2 size={16} />
                  <span className="bangla">মুছুন</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <DeleteConfirmOverlay
              examName={exam.subject}
              isDeleting={isDeleting}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

// Delete Confirmation Component
const DeleteConfirmOverlay = ({
  examName,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  examName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/98 p-4 backdrop-blur-xl"
  >
    <motion.div
      initial={{ scale: 0.8, y: 40 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 40 }}
      transition={{ type: "spring", damping: 20 }}
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-b from-[var(--color-active-bg)] to-[var(--color-bg)] shadow-2xl"
    >
      <div className="border-b border-red-500/20 bg-red-500/5 p-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-2 ring-red-500/20"
        >
          <AlertTriangle size={28} className="text-red-500" />
        </motion.div>

        <h3 className="bangla text-xl font-bold text-[var(--color-text)]">
          নিশ্চিত করুন
        </h3>
      </div>

      <div className="p-4">
        <p className="bangla mb-4 text-center text-sm leading-relaxed text-[var(--color-gray)]">
          আপনি কি{" "}
          <span className="font-bold text-[var(--color-text)]">{examName}</span>{" "}
          পরীক্ষাটি মুছে ফেলতে চান?
          <br />
          <span className="text-xs text-red-500">
            এই কাজটি আর ফিরিয়ে আনা যাবে না।
          </span>
        </p>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-3 text-sm font-bold text-[var(--color-text)] transition-all hover:border-[var(--color-text)]/30 disabled:opacity-50"
          >
            <span className="bangla">বাতিল</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="bangla">মুছছে...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span className="bangla">হ্যাঁ, মুছুন</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);
