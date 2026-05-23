import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, X } from "lucide-react";
import axiosPublic from "../../hooks/axiosPublic";

interface Exam {
  _id: string;
  description?: string;
  examDate: string;
}

const MCQExam = () => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axiosPublic.get("/api/mcq-exams");
        const exams: Exam[] = res.data?.data || [];
        const now = new Date();

        const activeExam = exams.find((exam) => {
          const examDate = new Date(exam.examDate);

          const showStart = new Date(examDate);
          showStart.setDate(showStart.getDate() - 1);
          showStart.setHours(0, 0, 0, 0);

          const showEnd = new Date(examDate);
          showEnd.setHours(23, 59, 59, 999);

          return now >= showStart && now <= showEnd;
        });

        if (activeExam) {
          setExam(activeExam);
          setOpen(true);
        }
      } catch (error) {
        console.error("MCQ popup fetch failed:", error);
      }
    };

    fetchExam();
  }, []);

  const formattedDate = useMemo(() => {
    if (!exam) return "";
    return new Date(exam.examDate).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [exam]);

  return (
    <AnimatePresence>
      {open && exam && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[1000] w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[var(--color-active-border)] bg-[var(--color-bg)] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="h-1.5 w-full bg-[var(--color-text)]/80" />

            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-gray)] transition-all duration-200 hover:rotate-90 hover:bg-[var(--color-active-border)] hover:text-[var(--color-text)]"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] shadow-inner">
                  <CalendarDays
                    size={30}
                    className="text-[var(--color-text)]"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)] bangla">
                    আজকের MCQ পরীক্ষা
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-gray)] bangla">
                    গুরুত্বপূর্ণ পরীক্ষা বিজ্ঞপ্তি
                  </p>
                </div>
              </div>

              <div className="my-6 border-t border-dashed border-[var(--color-active-border)]" />

              {/* date */}
              <div className="flex items-center justify-center gap-x-2 rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-4 text-lg font-semibold bangla">
                <p className="tracking-[0.15em] text-[var(--color-gray)]">
                  পরিক্ষার তারিখঃ
                </p>
                <h3 className="text-[var(--color-text)]">{formattedDate}</h3>
              </div>

              {/* description */}
              <div className="mt-6">
                <div className="mb-4 border-t border-dashed border-[var(--color-active-border)]" />
                <h4 className="mb-4 text-sm font-bold tracking-wide text-[var(--color-text)] bangla">
                  বিবরণ:
                </h4>
                <div className="rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-5">
                  <p className="text-sm leading-7 text-[var(--color-text)]/90 bangla whitespace-pre-line">
                    {exam.description || "কোনো বিবরণ দেওয়া হয়নি"}
                  </p>
                </div>
                <div className="mt-4 border-t border-dashed border-[var(--color-active-border)]" />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(false)}
                className="mt-6 w-full rounded-2xl bg-[var(--color-text)] py-3 text-sm font-bold text-[var(--color-bg)] transition-opacity duration-200 hover:opacity-90 bangla"
              >
                ঠিক আছে
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MCQExam;
