// MCQExamEditModal.tsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Loader2,
  BookOpen,
  FileText,
  GraduationCap,
} from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { formatBnDate } from "../../utility/Formatters";
import { CLASSES } from "../../utility/constants/class";
import DatePicker from "../../components/common/Datepicker";
import SelectInput from "../../components/common/SelectInput";

interface MCQExamEditModalProps {
  exam: Exam;
  onClose: () => void;
  onUpdate: (updatedExam: Partial<Exam> & { _id: string }) => Promise<void>;
}

export const MCQExamEditModal = ({
  exam,
  onClose,
  onUpdate,
}: MCQExamEditModalProps) => {
  /* ─── Derive initial date ─── */
  const initialDate = useMemo(() => {
    if (!exam.examDate) return null;
    const d = new Date(exam.examDate);
    return isNaN(d.getTime()) ? null : d;
  }, [exam.examDate]);

  /* ─── Form state ─── */
  const [subject, setSubject] = useState(exam.subject || "");
  const [studentClass, setStudentClass] = useState(exam.studentClass || "");
  const [examDate, setExamDate] = useState<Date | null>(initialDate);
  const [examDateDisplay, setExamDateDisplay] = useState(
    initialDate ? formatBnDate(exam.examDate) : "",
  );
  const [description, setDescription] = useState(exam.description || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ─── Prevent background scroll ─── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  /* ─── Class options for SelectInput ─── */
  const classOptions = useMemo(
    () =>
      CLASSES.map((c) => ({
        value: c,
        label: c,
      })),
    [],
  );

  /* ─── Validate ─── */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subject.trim()) newErrors.subject = "বিষয় আবশ্যক";
    if (!studentClass.trim()) newErrors.studentClass = "শ্রেণি আবশ্যক";
    if (!examDate) newErrors.examDate = "তারিখ আবশ্যক";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    // Mark all as touched
    setTouched({ subject: true, studentClass: true, examDate: true });

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onUpdate({
        _id: exam._id,
        subject: subject.trim(),
        studentClass: studentClass.trim(),
        examDate: examDate!.toISOString(),
        description: description.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Field change helpers that clear errors ─── */
  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setTouched((p) => ({ ...p, subject: true }));
    if (errors.subject) setErrors((p) => ({ ...p, subject: "" }));
  };

  const handleClassChange = (val: string) => {
    setStudentClass(val);
    setTouched((p) => ({ ...p, studentClass: true }));
    if (errors.studentClass) setErrors((p) => ({ ...p, studentClass: "" }));
  };

  const handleDateChange = (date: Date | null) => {
    setExamDate(date);
    setTouched((p) => ({ ...p, examDate: true }));
    if (errors.examDate) setErrors((p) => ({ ...p, examDate: "" }));
  };

  const handleDateDisplayChange = (display: string) => {
    setExamDateDisplay(display);
  };

  /* ══════════════════════ Render ══════════════════════ */
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-lg"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[201] flex flex-col overflow-hidden bg-[var(--color-bg)] border border-[var(--color-active-border)]/50 shadow-2xl"
      >
        {/* ─── Close Button ─── */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 z-10 rounded-full bg-[var(--color-bg)] p-2 text-[var(--color-gray)] shadow-lg ring-2 ring-[var(--color-active-border)] transition-colors hover:bg-red-500/10 hover:text-red-500 hover:ring-red-500/30"
        >
          <X size={20} />
        </motion.button>

        {/* ─── Header ─── */}
        <div className="shrink-0 border-b border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-5">
          <div className="mx-auto max-w-xl">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bangla text-xl font-bold text-[var(--color-text)]"
            >
              পরীক্ষা সম্পাদনা করুন
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bangla mt-1 text-sm text-[var(--color-gray)]"
            >
              তথ্য পরিবর্তন করে আপডেট করুন
            </motion.p>
          </div>
        </div>

        {/* ─── Form Body ─── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.edit-form::-webkit-scrollbar { display: none; }`}</style>

          <div className="edit-form mx-auto max-w-xl space-y-5">
            {/* ═══ Subject ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="bangla mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-gray)]">
                <BookOpen size={14} className="text-[var(--color-text)]" />
                বিষয় <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="বিষয় লিখুন..."
                disabled={isSubmitting}
                className={`bangla w-full rounded-xl border bg-[var(--color-active-bg)] px-4 py-3 text-sm font-bold text-[var(--color-text)] placeholder:text-[var(--color-gray)]/50 transition-all focus:outline-none focus:ring-2 ${
                  errors.subject && touched.subject
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-[var(--color-active-border)] focus:border-[var(--color-text)]/30 focus:ring-[var(--color-text)]/10"
                }`}
              />
              <AnimatePresence>
                {errors.subject && touched.subject && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bangla mt-1.5 text-xs text-red-500"
                  >
                    {errors.subject}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ═══ Class (SelectInput) ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SelectInput
                options={classOptions}
                value={studentClass}
                onChange={handleClassChange}
                onBlur={() => setTouched((p) => ({ ...p, studentClass: true }))}
                placeholder="শ্রেণি নির্বাচন করুন"
                label="শ্রেণি"
                required
                disabled={isSubmitting}
                error={
                  errors.studentClass && touched.studentClass
                    ? errors.studentClass
                    : undefined
                }
                isTouched={touched.studentClass}
                icon={<GraduationCap size={14} />}
              />
            </motion.div>

            {/* ═══ Exam Date (DatePicker) ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <DatePicker
                value={examDateDisplay}
                onChange={handleDateDisplayChange}
                onDateChange={handleDateChange}
                selectedDate={examDate}
                label="পরীক্ষার তারিখ"
                required
                placeholder="তারিখ বেছে নিন"
                disabled={isSubmitting}
                error={
                  errors.examDate && touched.examDate
                    ? errors.examDate
                    : undefined
                }
              />
            </motion.div>

            {/* ═══ Description ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="bangla mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-gray)]">
                <FileText size={14} className="text-[var(--color-text)]" />
                বিবরণ
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="বিবরণ লিখুন (ঐচ্ছিক)..."
                rows={4}
                disabled={isSubmitting}
                className="bangla w-full resize-none rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-gray)]/50 transition-all focus:border-[var(--color-text)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-text)]/10"
              />
            </motion.div>
          </div>
        </div>

        {/* ─── Footer Buttons ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="shrink-0 border-t border-[var(--color-active-border)] bg-gradient-to-b from-transparent to-[var(--color-active-bg)] p-4"
        >
          <div className="mx-auto flex max-w-xl gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-3 text-sm font-bold text-[var(--color-text)] transition-all hover:border-[var(--color-text)]/30 disabled:opacity-50"
            >
              <span className="bangla">বাতিল</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-text)] py-3 text-sm font-bold text-[var(--color-bg)] shadow-lg transition-all hover:shadow-xl disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="bangla">আপডেট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span className="bangla">আপডেট করুন</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
