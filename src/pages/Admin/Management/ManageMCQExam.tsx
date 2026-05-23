import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Trash2,
  Calendar,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import axiosPublic from "../../../hooks/axiosPublic";

// ─────────────────────────────────────────────────────────────

interface MCQExam {
  _id: string;
  slug: string;
  description: string;
  examDate: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────

const ManageMCQExam = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Fetch all exams ──
  const {
    data: exams = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<MCQExam[]>({
    queryKey: ["mcq-exams"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/mcq-exams");
      return res.data.data;
    },
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosPublic.delete(`/api/mcq-exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcq-exams"] });
      setDeleteId(null);
    },
  });

  // ── Filter ──
  const filtered = exams.filter(
    (e) =>
      e.slug.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Format date ──
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[var(--color-brand)]" />
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-sm text-[var(--color-gray)] bangla">
          ডাটা লোড করতে সমস্যা হয়েছে
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-xs font-medium text-white bangla"
        >
          <RefreshCw size={14} />
          আবার চেষ্টা করুন
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10">
            <FileText size={20} className="text-[var(--color-brand)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] bangla">
              MCQ পরীক্ষা পরিচালনা
            </h1>
            <p className="text-xs text-[var(--color-gray)] bangla">
              মোট {exams.length} টি পরীক্ষা
            </p>
          </div>
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5"
        >
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="স্লাগ বা বিবরণ দিয়ে খুঁজুন..."
              className="w-full rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] transition-colors placeholder:text-[var(--color-gray)]/60 hover:border-[var(--color-gray)]/50 focus:border-[var(--color-gray)] focus:outline-none bangla"
            />
          </div>
        </motion.div>

        {/* ── Empty ── */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-[var(--color-active-border)] bg-[var(--color-card)] py-16 text-center"
          >
            <FileText
              size={36}
              className="mx-auto mb-3 text-[var(--color-gray)]/40"
            />
            <p className="text-sm text-[var(--color-gray)] bangla">
              {search ? "কোনো ফলাফল পাওয়া যায়নি" : "এখনো কোনো পরীক্ষা নেই"}
            </p>
          </motion.div>
        )}

        {/* ── Exam List ── */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((exam, idx) => (
              <motion.div
                key={exam._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: idx * 0.03 },
                }}
                exit={{ opacity: 0, x: -80 }}
                className="rounded-xl border border-[var(--color-active-border)] bg-[var(--color-card)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* info */}
                  <div className="min-w-0 flex-1">
                    {/* slug */}
                    <p className="mb-2 truncate text-xs text-[var(--color-gray)]">
                      {exam.slug}
                    </p>

                    {/* description */}
                    {exam.description && (
                      <p className="mb-2 text-sm text-[var(--color-text)]/80 bangla">
                        {exam.description}
                      </p>
                    )}

                    {/* dates */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-[var(--color-gray)] bangla">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        পরীক্ষা: {formatDate(exam.examDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        তৈরি: {formatDate(exam.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteId(exam._id)}
                    className="shrink-0 rounded-lg p-2 text-[var(--color-gray)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteId(null)}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border border-[var(--color-active-border)] bg-[var(--color-card)] p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 size={22} className="text-red-500" />
              </div>

              <h3 className="mb-1 text-lg font-bold text-[var(--color-text)] bangla">
                পরীক্ষা মুছে ফেলবেন?
              </h3>
              <p className="mb-5 text-sm text-[var(--color-gray)] bangla">
                এই পরীক্ষা স্থায়ীভাবে মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো যাবে
                না।
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 rounded-lg border border-[var(--color-active-border)] py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-active-bg)] bangla"
                >
                  বাতিল
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => deleteMutation.mutate(deleteId)}
                  disabled={deleteMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 bangla"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  মুছে ফেলুন
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageMCQExam;
