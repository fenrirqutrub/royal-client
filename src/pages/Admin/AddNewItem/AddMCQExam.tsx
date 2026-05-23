import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Save, Loader2 } from "lucide-react";
import { toLocalIso } from "../../../utility/Constants";
import axiosSecure from "../../../hooks/axiosSecure";

const AddMCQExam = () => {
  const [examDate, setExamDate] = useState(toLocalIso(new Date()));
  const [description, setDescription] = useState("");

  const [touched, setTouched] = useState({ examDate: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const createdAt = new Date().toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const touch = (f: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [f]: true }));

  const errors = {
    examDate: !examDate ? "পরীক্ষার তারিখ দিন" : "",
  };

  const isValid = !errors.examDate;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await axiosSecure.post("/api/mcq-exams", {
        examDate,
        description,
      });

      if (res.data?.success) {
        setSubmitSuccess(true);
        setDescription("");
        setExamDate(toLocalIso(new Date()));
        setTouched({ examDate: false });
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message || "পরীক্ষা তৈরি করা যায়নি",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-3 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        {/* header */}
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
              MCQ পরীক্ষা যোগ করুন
            </h1>
            <p className="text-xs text-[var(--color-gray)] bangla">
              নতুন বহুনির্বাচনী পরীক্ষা তৈরি করুন
            </p>
          </div>
        </motion.div>

        {/* success */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-600 bangla"
            >
              ✅ সফলভাবে তৈরি হয়েছে!
            </motion.div>
          )}
        </AnimatePresence>

        {/* error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 bangla"
            >
              ❌ {submitError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-[var(--color-active-border)] bg-[var(--color-card)] p-5 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* created at */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gray)] bangla">
                তৈরির তারিখ
              </label>
              <div className="relative">
                <Calendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)]"
                />
                <input
                  readOnly
                  value={createdAt}
                  className="w-full cursor-default rounded border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-2 pl-9 pr-3 text-sm text-[var(--color-gray)] bangla focus:outline-none"
                />
              </div>
            </div>

            {/* exam date */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gray)] bangla">
                পরীক্ষার তারিখ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)]"
                />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  onBlur={() => touch("examDate")}
                  className={`w-full rounded border bg-[var(--color-bg)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] transition-colors focus:outline-none bangla ${
                    touched.examDate && errors.examDate
                      ? "border-red-400"
                      : "border-[var(--color-active-border)] hover:border-[var(--color-gray)]/50 focus:border-[var(--color-gray)]"
                  }`}
                />
              </div>
              <AnimatePresence>
                {touched.examDate && errors.examDate && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-1 text-xs text-red-500 bangla"
                  >
                    {errors.examDate}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* description */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gray)] bangla">
                বিবরণ
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="পরীক্ষার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)..."
                rows={3}
                className="w-full resize-none rounded border border-[var(--color-active-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] transition-colors placeholder:text-[var(--color-gray)]/60 hover:border-[var(--color-gray)]/50 focus:border-[var(--color-gray)] focus:outline-none bangla"
              />
            </div>
          </div>

          {/* submit */}
          <motion.button
            whileHover={{ scale: isValid ? 1.01 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand)]/90 disabled:cursor-not-allowed disabled:opacity-50 bangla"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                তৈরি হচ্ছে...
              </>
            ) : (
              <>
                <Save size={16} />
                পরীক্ষা তৈরি করুন
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default AddMCQExam;
