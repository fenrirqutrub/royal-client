// AddWeeklyExam.tsx
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Loader2, ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MdOutlineClass,
  MdOutlineScience,
  MdOutlineHistoryEdu,
} from "react-icons/md";
import { TbMath, TbLanguage } from "react-icons/tb";
import { GiEarthAsiaOceania } from "react-icons/gi";
import { FaBookOpen, FaFlask } from "react-icons/fa";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import type { SelectOption } from "../../../components/common/SelectInput";
import axiosPublic from "../../../hooks/axiosPublic";

import SelectInput from "../../../components/common/SelectInput";
import { useAuth } from "../../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────
interface WeeklyExamFormData {
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  ExamNumber: string;
  topics: string;
  slug?: string;
}

// ─── Static Data ──────────────────────────────────────────
const CLASSES = ["৬ষ্ঠ", "৭ম", "৮ম", "৯ম", "১০ম"] as const;

const CLASS_OPTIONS: SelectOption[] = CLASSES.map((c) => ({
  value: `${c} শ্রেণি`,
  label: `${c} শ্রেণি`,
  icon: <MdOutlineClass />,
}));

const MARK_OPTIONS: SelectOption[] = [5, 10, 15, 20, 25, 30, 35, 40].map(
  (n) => ({
    value: String(n),
    label: String(n),
  }),
);

const BASE_SUBJECTS: SelectOption[] = [
  { value: "বাংলা ১ম ও ২য়", label: "বাংলা ১ম ও ২য়", icon: <TbLanguage /> },
  { value: "ইংরেজি ১ম ও ২য়", label: "ইংরেজি ১ম ও ২য়", icon: <FaBookOpen /> },
  { value: "গণিত", label: "গণিত", icon: <TbMath /> },
  { value: "বিজ্ঞান", label: "বিজ্ঞান", icon: <MdOutlineScience /> },
  {
    value: "বাংলাদেশ ও বিশ্বপরিচয়",
    label: "বাংলাদেশ ও বিশ্বপরিচয়",
    icon: <MdOutlineScience />,
  },
  {
    value: "তথ্য যোগাযোগ ও প্রযুক্তি",
    label: "তথ্য যোগাযোগ ও প্রযুক্তি",
    icon: <MdOutlineScience />,
  },
  { value: "ইসলাম শিক্ষা", label: "ইসলাম শিক্ষা", icon: <MdOutlineScience /> },
  {
    value: "হিন্দুধর্ম শিক্ষা",
    label: "হিন্দুধর্ম শিক্ষা",
    icon: <MdOutlineScience />,
  },
];

const ADVANCED_SUBJECTS: SelectOption[] = [
  { value: "পদার্থবিজ্ঞান", label: "পদার্থবিজ্ঞান", icon: <FaFlask /> },
  { value: "রসায়ন", label: "রসায়ন", icon: <FaFlask /> },
  { value: "জীববিজ্ঞান", label: "জীববিজ্ঞান", icon: <MdOutlineScience /> },
  { value: "উচ্চতর গণিত", label: "উচ্চতর গণিত", icon: <MdOutlineScience /> },
  { value: "ভূগোল", label: "ভূগোল", icon: <GiEarthAsiaOceania /> },
  { value: "ইতিহাস", label: "ইতিহাস", icon: <MdOutlineHistoryEdu /> },
  { value: "অর্থনীতি", label: "অর্থনীতি", icon: <MdOutlineHistoryEdu /> },
  { value: "পৌরনীতি", label: "পৌরনীতি", icon: <MdOutlineHistoryEdu /> },
  {
    value: "হিসাব বিজ্ঞান",
    label: "হিসাব বিজ্ঞান",
    icon: <MdOutlineHistoryEdu />,
  },
  {
    value: "ব্যবসায় উদ্যোগ",
    label: "ব্যবসায় উদ্যোগ",
    icon: <MdOutlineHistoryEdu />,
  },
  {
    value: "ফিন্যান্স ও ব্যাংকিং",
    label: "ফিন্যান্স ও ব্যাংকিং",
    icon: <MdOutlineHistoryEdu />,
  },
];

// All classes share same teachers; 9th & 10th get extra subjects
const getSubjects = (cls: string) =>
  cls.startsWith("৯ম") || cls.startsWith("১০ম")
    ? [...BASE_SUBJECTS, ...ADVANCED_SUBJECTS]
    : BASE_SUBJECTS;

// ─── Styles ───────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: "easeOut" },
  }),
};

const inputCls = (err: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent
  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400
  ${err ? "border-rose-400 focus:ring-rose-400" : "border-gray-200 dark:border-gray-700 focus:ring-violet-500"}`;

const labelCls =
  "block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-1.5";

const ErrorMsg = ({ msg }: { msg?: string }) => (
  <AnimatePresence>
    {msg && (
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="text-rose-500 text-xs mt-1"
      >
        {msg}
      </motion.p>
    )}
  </AnimatePresence>
);

// ─── Component ────────────────────────────────────────────
const AddWeeklyExam = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [submitted, setSubmitted] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  // ── Fetch all teachers (admin only) ───────────────────
  const { data: teacherList = [] } = useQuery<{ name: string; slug: string }[]>(
    {
      queryKey: ["teachers-list"],
      queryFn: async () => {
        const res = await axiosPublic.get("/api/teachers");
        const payload = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        return payload.filter((t: { role: string }) => t.role !== "admin");
      },
      enabled: isAdmin,
      staleTime: 5 * 60 * 1000,
    },
  );

  const teacherOptions: SelectOption[] = teacherList.map((t) => ({
    value: t.name,
    label: t.name,
    icon: <PiChalkboardTeacherFill />,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<WeeklyExamFormData>({
    mode: "onChange",
    defaultValues: {
      subject: "",
      teacher: "",
      class: "",
      mark: 0,
      ExamNumber: "",
      topics: "",
    },
  });

  const selectedClass = watch("class");

  // non-admin: auto-set teacher to their own name
  useEffect(() => {
    if (!isAdmin && user?.name) {
      setValue("teacher", user.name, { shouldValidate: true });
    }
  }, [isAdmin, user?.name, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles((p) => [...p, ...files]);
    setPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setImageFiles((p) => p.filter((_, j) => j !== i));
    setPreviews((p) => p.filter((_, j) => j !== i));
  };

  const mutation = useMutation({
    mutationFn: (fd: FormData) =>
      axiosPublic.post("/api/weekly-exams", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("পরীক্ষা সফলভাবে যোগ হয়েছে!");
      qc.invalidateQueries({ queryKey: ["weekly-exams"] });
      reset();
      setImageFiles([]);
      setPreviews([]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) =>
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create exam",
      ),
  });

  const onSubmit: SubmitHandler<WeeklyExamFormData> = (data) => {
    const fd = new FormData();
    (Object.keys(data) as (keyof WeeklyExamFormData)[]).forEach((k) => {
      if (data[k] !== undefined) fd.append(k, String(data[k]));
    });

    // ← guarantee teacher name is always sent
    if (!isAdmin && user?.name) fd.set("teacher", user.name);

    if (user?.slug) fd.append("teacherSlug", user.slug);
    imageFiles.forEach((f) => fd.append("images", f));
    mutation.mutate(fd);
  };

  const handleReset = () => {
    reset();
    setImageFiles([]);
    setPreviews([]);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-start justify-center py-10">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              সাপ্তাহিক পরীক্ষা যোগ করুন
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-4 pl-3">
            নিচের ফর্মটি পূরণ করুন। সকল <span className="text-rose-500">*</span>{" "}
            চিহ্নিত ঘর আবশ্যিক।
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Row 1: Class + Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Controller
                  name="class"
                  control={control}
                  rules={{ required: "শ্রেণি আবশ্যিক" }}
                  render={({ field }) => (
                    <SelectInput
                      label="শ্রেণি"
                      required
                      placeholder="শ্রেণি বেছে নিন"
                      options={CLASS_OPTIONS}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("subject", "");
                        setValue("teacher", "");
                        if (isAdmin) setValue("teacher", "");
                      }}
                      error={errors.class?.message}
                    />
                  )}
                />
              </motion.div>
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Controller
                  name="subject"
                  control={control}
                  rules={{ required: "বিষয় আবশ্যিক" }}
                  render={({ field }) => (
                    <SelectInput
                      label="বিষয়"
                      required
                      placeholder={
                        selectedClass ? "বিষয় বেছে নিন" : "আগে শ্রেণি বেছে নিন"
                      }
                      options={getSubjects(selectedClass)}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedClass}
                      error={errors.subject?.message}
                    />
                  )}
                />
              </motion.div>
            </div>

            {/* Row 2: Teacher */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {isAdmin ? (
                // Admin: dynamic dropdown from API
                <Controller
                  name="teacher"
                  control={control}
                  rules={{ required: "শিক্ষকের নাম আবশ্যিক" }}
                  render={({ field }) => (
                    <SelectInput
                      label="শিক্ষকের নাম"
                      required
                      placeholder="শিক্ষক বেছে নিন"
                      options={teacherOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.teacher?.message}
                    />
                  )}
                />
              ) : (
                // Teacher/Principal: read-only, auto-filled from session
                <div>
                  <label className={labelCls}>
                    শিক্ষকের নাম{" "}
                    <span className="text-rose-500 normal-case tracking-normal">
                      *
                    </span>
                  </label>
                  <div
                    className={`${inputCls(false)} flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 cursor-not-allowed`}
                  >
                    <PiChalkboardTeacherFill className="w-4 h-4 text-violet-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">
                      {user?.name ?? "..."}
                    </span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-medium uppercase tracking-wide">
                      {user?.role}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Row 3: ExamNumber + Mark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <label className={labelCls}>
                  পরীক্ষা নম্বর{" "}
                  <span className="text-rose-500 normal-case tracking-normal">
                    *
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="যেমন: 1"
                  {...register("ExamNumber", {
                    required: "পরীক্ষা নম্বর আবশ্যিক",
                  })}
                  className={inputCls(!!errors.ExamNumber)}
                />
                <ErrorMsg msg={errors.ExamNumber?.message} />
              </motion.div>

              <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Controller
                  name="mark"
                  control={control}
                  rules={{
                    required: "পূর্ণমান আবশ্যিক",
                    validate: (v) => v > 0 || "পূর্ণমান আবশ্যিক",
                  }}
                  render={({ field }) => (
                    <SelectInput
                      label="পূর্ণমান"
                      required
                      placeholder="পূর্ণমান বেছে নিন"
                      options={MARK_OPTIONS}
                      value={field.value ? String(field.value) : ""}
                      onChange={(val) => field.onChange(Number(val))}
                      error={errors.mark?.message}
                    />
                  )}
                />
              </motion.div>
            </div>

            {/* Row 4: Topics */}
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <label className={labelCls}>
                বিষয়বস্তু / নির্দেশনা{" "}
                <span className="text-rose-500 normal-case tracking-normal">
                  *
                </span>
              </label>
              <textarea
                rows={5}
                placeholder="পরীক্ষার বিষয়বস্তু লিখুন..."
                {...register("topics", {
                  required: "বিষয়বস্তু আবশ্যিক",
                  minLength: { value: 20, message: "কমপক্ষে ২০ অক্ষর লিখুন" },
                })}
                className={`${inputCls(!!errors.topics)} resize-none leading-relaxed`}
              />
              <ErrorMsg msg={errors.topics?.message} />
            </motion.div>

            {/* Row 5: Image Upload */}
            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <label className={labelCls}>ছবি সংযুক্ত করুন (ঐচ্ছিক)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl p-6 flex flex-col items-center gap-2 transition-colors group"
              >
                <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-violet-500 transition-colors" />
                <p className="text-sm text-gray-500 group-hover:text-violet-500 transition-colors">
                  ক্লিক করুন বা ছবি টেনে আনুন
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WEBP • একাধিক ছবি বেছে নেওয়া যাবে
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <AnimatePresence>
                {previews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4"
                  >
                    {previews.map((src, i) => (
                      <motion.div
                        key={src}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {previews.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {previews.length}টি ছবি নির্বাচিত
                </p>
              )}
            </motion.div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-2" />

            {/* Buttons */}
            <motion.div
              custom={7}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                type="submit"
                disabled={!isValid || mutation.isPending}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isValid && !mutation.isPending
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                <AnimatePresence mode="wait">
                  {mutation.isPending ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ
                      হচ্ছে…
                    </motion.span>
                  ) : submitted ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      ✓ সফলভাবে যোগ হয়েছে
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      পরীক্ষা যোগ করুন
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={mutation.isPending}
                className="sm:w-32 py-3 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50"
              >
                রিসেট
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddWeeklyExam;
