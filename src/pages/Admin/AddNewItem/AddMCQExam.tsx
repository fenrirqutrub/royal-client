// src/components/mcq/AddMCQExam.tsx
// src/components/mcq/AddMCQExam.tsx

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Save,
  Loader2,
  User,
  Maximize2,
  CalendarDays,
  Check,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosSecure from "../../../hooks/axiosSecure";
import DatePicker from "../../../components/common/Datepicker";
import SelectInput from "../../../components/common/SelectInput";
import { BN_MONTHS, toBn } from "../../../utility/Formatters";
import { toast } from "react-hot-toast";
import type { AxiosError } from "axios";
import { getSubjects } from "../../../utility/constants/subject";
import { CLASS_OPTIONS } from "../../../utility/constants/class";

interface UserPayload {
  id: string;
  name: string;
  role: string;
  avatar?: { url: string | null } | null;
}

interface FullscreenTextareaProps {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "মালিক",
  admin: "প্রশাসক",
  principal: "অধ্যক্ষ",
  teacher: "শিক্ষক",
};

const FullscreenTextarea = ({
  value,
  onChange,
  onClose,
}: FullscreenTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    const len = textarea.value.length;
    textarea.setSelectionRange(len, len);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col bg-[var(--color-bg)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-active-border)] px-5 py-4 sm:px-8">
        <span className="bangla text-sm font-semibold text-[var(--color-text)] lg:text-lg">
          বিবরণ লিখুন
        </span>

        <div className="flex items-center gap-3">
          {value.length > 0 && (
            <span className="bangla rounded-md bg-[var(--color-active-bg)] px-2 py-0.5 text-xs tabular-nums text-[var(--color-gray)]">
              {toBn(value.length)} অক্ষর
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--color-text)] px-3.5 py-2 text-xs font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90 active:scale-95"
          >
            <Check size={13} />
            Confirm
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="পরীক্ষার বিস্তারিত বিবরণ এখানে লিখুন..."
        className="block h-full w-full flex-1 resize-none bg-[var(--color-active-bg)] px-6 py-6 text-base leading-[1.9] tracking-widest text-[var(--color-text)] outline-none sm:px-12 bangla"
      />

      <div className="bangla border-t border-[var(--color-active-border)] px-6 py-3 text-xs text-[var(--color-gray)] sm:px-8">
        <kbd className="rounded border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-gray)]">
          Esc
        </kbd>{" "}
        চাপুন বা বাটনে ক্লিক করলে বন্ধ হবে
      </div>
    </motion.div>
  );
};

const AddMCQExam = () => {
  const createdAtRef = useRef(new Date());

  const [examDate, setExamDate] = useState<Date | null>(new Date());
  const [examDateDisplay, setExamDateDisplay] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [studentClass, setStudentClass] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [touched, setTouched] = useState({
    examDate: false,
    studentClass: false,
    subject: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: meData } = useQuery<{ user: UserPayload }>({
    queryKey: ["auth-me"],
    queryFn: () => axiosSecure.get("/api/auth/me").then((r) => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = meData?.user ?? null;
  const avatarUrl = user?.avatar?.url ?? null;

  // Subject options depend on selected class
  const subjectOptions = useMemo(
    () => (studentClass ? getSubjects(studentClass) : []),
    [studentClass],
  );

  // Reset subject when class changes
  const handleClassChange = useCallback((val: string) => {
    setStudentClass(val);
    setSubject("");
  }, []);

  const examDateError =
    touched.examDate && !examDate ? "পরীক্ষার তারিখ দিন" : "";
  const classError =
    touched.studentClass && !studentClass ? "শ্রেণি বেছে নিন" : "";
  const subjectError = touched.subject && !subject ? "বিষয় বেছে নিন" : "";

  const isValid = !!examDate && !!studentClass && !!subject;

  const resetForm = useCallback(() => {
    const now = new Date();
    setDescription("");
    setExamDate(now);
    setExamDateDisplay(now.toLocaleDateString("en-CA"));
    setStudentClass("");
    setSubject("");
    setTouched({ examDate: false, studentClass: false, subject: false });
  }, []);

  const handleSubmit = useCallback(async () => {
    setTouched({ examDate: true, studentClass: true, subject: true });

    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await axiosSecure.post("/api/mcq-exams", {
        examDate: examDate!.toISOString(),
        studentClass,
        subject,
        description: description.trim(),
      });

      if (res.data?.success) {
        toast.success("সফলভাবে পরীক্ষা তৈরি হয়েছে!", { duration: 4000 });
        resetForm();
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || "পরীক্ষা তৈরি করা যায়নি";
      toast.error(message, { duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    description,
    examDate,
    studentClass,
    subject,
    isSubmitting,
    isValid,
    resetForm,
  ]);

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void handleSubmit();
    },
    [handleSubmit],
  );

  const createdAt = createdAtRef.current;
  const createdAtLabel = `${toBn(createdAt.getDate())} ${
    BN_MONTHS[createdAt.getMonth()]
  } ${toBn(createdAt.getFullYear())}`;

  return (
    <>
      <AnimatePresence>
        {fullscreen && (
          <FullscreenTextarea
            value={description}
            onChange={setDescription}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen px-4 py-10 sm:px-6">
        <div className="mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-text)]">
                <FileText size={18} className="text-[var(--color-bg)]" />
              </div>
              <h1 className="bangla text-2xl font-bold text-[var(--color-text)]">
                MCQ পরীক্ষা
              </h1>
            </div>
            <p className="bangla pl-12 text-sm text-[var(--color-gray)]">
              নতুন বহুনির্বাচনী পরীক্ষা তৈরি করুন
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden rounded-3xl border border-[var(--color-active-border)] bg-[var(--color-bg)]"
          >
            {/* Poster info */}
            {user && (
              <div className="flex items-center gap-3 border-b border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-5 py-4">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-text)]">
                      <User size={16} className="text-[var(--color-bg)]" />
                    </div>
                  )}
                  <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-text)]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="bangla truncate text-[13px] font-semibold text-[var(--color-text)]">
                    {user.name}
                  </p>
                  <p className="bangla text-[11px] text-[var(--color-gray)]">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </p>
                </div>

                <span className="bangla shrink-0 rounded-full bg-[var(--color-text)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-bg)]">
                  পোস্টকারী
                </span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5 p-5 sm:p-6">
              {/* Date row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 bangla text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray)]">
                    তৈরির তারিখ
                  </p>
                  <div className="bangla flex select-none items-center gap-2.5 rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-3.5 py-2.5 text-sm text-[var(--color-gray)]">
                    <CalendarDays
                      size={14}
                      className="shrink-0 text-[var(--color-gray)]"
                    />
                    {createdAtLabel}
                  </div>
                </div>

                <div>
                  <p className="mb-2 bangla text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray)]">
                    পরীক্ষার তারিখ{" "}
                    <span className="normal-case text-[var(--color-text)]">
                      *
                    </span>
                  </p>
                  <DatePicker
                    value={toBn(examDateDisplay)}
                    onChange={setExamDateDisplay}
                    onDateChange={(date) => {
                      setExamDate(date);
                      setTouched((prev) => ({ ...prev, examDate: true }));
                    }}
                    selectedDate={examDate}
                    placeholder="তারিখ বেছে নিন"
                    required
                    error={examDateError}
                  />
                </div>
              </div>

              {/* Class + Subject row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput
                  label="শ্রেণি"
                  required
                  options={CLASS_OPTIONS}
                  value={studentClass}
                  onChange={handleClassChange}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, studentClass: true }))
                  }
                  isTouched={touched.studentClass}
                  placeholder="শ্রেণি বেছে নিন"
                  error={classError}
                />

                <SelectInput
                  label="বিষয়"
                  required
                  options={subjectOptions}
                  value={subject}
                  onChange={setSubject}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, subject: true }))
                  }
                  isTouched={touched.subject}
                  placeholder={
                    studentClass ? "বিষয় বেছে নিন" : "আগে শ্রেণি বেছে নিন"
                  }
                  disabled={!studentClass}
                  error={subjectError}
                />
              </div>

              {/* Description */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="bangla text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray)]">
                    বিবরণ
                  </p>
                  <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    className="bangla flex items-center gap-1 text-[10px] font-bold text-[var(--color-gray)] transition-colors hover:text-[var(--color-text)]"
                  >
                    <Maximize2 size={10} />
                    Full Screen
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setFullscreen(true)}
                  aria-label="বিবরণ সম্পাদনা করুন"
                  className="relative block w-full overflow-hidden rounded-xl border border-[var(--color-active-border)] text-left transition-opacity hover:opacity-95 focus:outline-none"
                >
                  <div
                    className={`min-h-[88px] w-full bg-[var(--color-active-bg)] px-4 py-3 text-sm leading-[1.7] whitespace-pre-wrap break-words bangla ${
                      description
                        ? "text-[var(--color-text)]"
                        : "text-[var(--color-gray)]"
                    }`}
                  >
                    {description || "পরীক্ষার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)..."}
                  </div>
                  <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] text-[var(--color-gray)] bangla">
                    <Maximize2 size={9} />
                    Click
                  </div>
                </button>

                {description.length > 0 && (
                  <p className="bangla mt-1 text-right text-[10px] tabular-nums text-[var(--color-gray)]">
                    {toBn(description.length)} অক্ষর
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: !isSubmitting ? 1.015 : 1 }}
                whileTap={{ scale: !isSubmitting ? 0.97 : 1 }}
                disabled={isSubmitting}
                className="bangla flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-text)] py-3.5 text-md font-bold text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    পরীক্ষা তৈরি করুন
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AddMCQExam;
