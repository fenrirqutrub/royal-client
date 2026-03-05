// AddWeeklyExam.tsx
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosPublic } from "../../../hooks/axiosPublic";

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
import SelectInput from "../../../components/common/SelectInput";
import DatePicker from "../../../components/common/Datepicker";

// ─── Types ────────────────────────────────────────────────
interface WeeklyExamFormData {
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  date: string;
  ExamNumber: string;
  topics: string;
  slug?: string;
}

// ─── Static data ──────────────────────────────────────────
const CLASS_OPTIONS: SelectOption[] = [
  { value: "৬ষ্ঠ শ্রেণি", label: "৬ষ্ঠ শ্রেণি", icon: <MdOutlineClass /> },
  { value: "৭ম শ্রেণি", label: "৭ম শ্রেণি", icon: <MdOutlineClass /> },
  { value: "৮ম শ্রেণি", label: "৮ম শ্রেণি", icon: <MdOutlineClass /> },
  { value: "৯ম শ্রেণি", label: "৯ম শ্রেণি", icon: <MdOutlineClass /> },
  { value: "১০ম শ্রেণি", label: "১০ম শ্রেণি", icon: <MdOutlineClass /> },
];

const MARK_OPTIONS: SelectOption[] = [5, 10, 15, 20, 25, 30, 35, 40].map(
  (n) => ({
    value: String(n),
    label: String(n),
  }),
);

const SUBJECT_MAP: Record<string, SelectOption[]> = {
  "৬ষ্ঠ শ্রেণি": [
    { value: "বাংলা ১ম পত্র", label: "বাংলা ১ম পত্র", icon: <TbLanguage /> },
    { value: "বাংলা ২য় পত্র", label: "বাংলা ২য় পত্র", icon: <TbLanguage /> },
    { value: "ইংরেজি ১ম পত্র", label: "ইংরেজি ১ম পত্র", icon: <FaBookOpen /> },
    { value: "গণিত", label: "গণিত", icon: <TbMath /> },
  ],
  "৭ম শ্রেণি": [
    { value: "বাংলা ১ম পত্র", label: "বাংলা ১ম পত্র", icon: <TbLanguage /> },
    { value: "ইংরেজি ১ম পত্র", label: "ইংরেজি ১ম পত্র", icon: <FaBookOpen /> },
    { value: "গণিত", label: "গণিত", icon: <TbMath /> },
    { value: "বিজ্ঞান", label: "বিজ্ঞান", icon: <MdOutlineScience /> },
  ],
  "৮ম শ্রেণি": [
    { value: "বাংলা ১ম পত্র", label: "বাংলা ১ম পত্র", icon: <TbLanguage /> },
    { value: "ইংরেজি ১ম পত্র", label: "ইংরেজি ১ম পত্র", icon: <FaBookOpen /> },
    { value: "গণিত", label: "গণিত", icon: <TbMath /> },
    { value: "বিজ্ঞান", label: "বিজ্ঞান", icon: <MdOutlineScience /> },
    { value: "ইতিহাস", label: "ইতিহাস", icon: <MdOutlineHistoryEdu /> },
  ],
  "৯ম শ্রেণি": [
    { value: "বাংলা ১ম পত্র", label: "বাংলা ১ম পত্র", icon: <TbLanguage /> },
    { value: "বাংলা ২য় পত্র", label: "বাংলা ২য় পত্র", icon: <TbLanguage /> },
    { value: "ইংরেজি ১ম পত্র", label: "ইংরেজি ১ম পত্র", icon: <FaBookOpen /> },
    {
      value: "ইংরেজি ২য় পত্র",
      label: "ইংরেজি ২য় পত্র",
      icon: <FaBookOpen />,
    },
    { value: "গণিত", label: "গণিত", icon: <TbMath /> },
    { value: "পদার্থবিজ্ঞান", label: "পদার্থবিজ্ঞান", icon: <FaFlask /> },
    { value: "রসায়ন", label: "রসায়ন", icon: <FaFlask /> },
    { value: "জীববিজ্ঞান", label: "জীববিজ্ঞান", icon: <MdOutlineScience /> },
    { value: "ভূগোল", label: "ভূগোল", icon: <GiEarthAsiaOceania /> },
    { value: "ইতিহাস", label: "ইতিহাস", icon: <MdOutlineHistoryEdu /> },
  ],
  "১০ম শ্রেণি": [
    { value: "বাংলা ১ম পত্র", label: "বাংলা ১ম পত্র", icon: <TbLanguage /> },
    { value: "বাংলা ২য় পত্র", label: "বাংলা ২য় পত্র", icon: <TbLanguage /> },
    { value: "ইংরেজি ১ম পত্র", label: "ইংরেজি ১ম পত্র", icon: <FaBookOpen /> },
    {
      value: "ইংরেজি ২য় পত্র",
      label: "ইংরেজি ২য় পত্র",
      icon: <FaBookOpen />,
    },
    { value: "গণিত", label: "গণিত", icon: <TbMath /> },
    { value: "পদার্থবিজ্ঞান", label: "পদার্থবিজ্ঞান", icon: <FaFlask /> },
    { value: "রসায়ন", label: "রসায়ন", icon: <FaFlask /> },
    { value: "জীববিজ্ঞান", label: "জীববিজ্ঞান", icon: <MdOutlineScience /> },
    { value: "ভূগোল", label: "ভূগোল", icon: <GiEarthAsiaOceania /> },
    { value: "ইতিহাস", label: "ইতিহাস", icon: <MdOutlineHistoryEdu /> },
  ],
};

const TEACHER_MAP: Record<string, SelectOption[]> = {
  "৬ষ্ঠ শ্রেণি": [
    {
      value: "মোঃ রফিকুল ইসলাম",
      label: "মোঃ রফিকুল ইসলাম",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "নাসরিন আক্তার",
      label: "নাসরিন আক্তার",
      icon: <PiChalkboardTeacherFill />,
    },
  ],
  "৭ম শ্রেণি": [
    {
      value: "মোঃ কামরুল হাসান",
      label: "মোঃ কামরুল হাসান",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "সুমাইয়া বেগম",
      label: "সুমাইয়া বেগম",
      icon: <PiChalkboardTeacherFill />,
    },
  ],
  "৮ম শ্রেণি": [
    {
      value: "মোঃ আবুল কাশেম",
      label: "মোঃ আবুল কাশেম",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "রাহেলা পারভীন",
      label: "রাহেলা পারভীন",
      icon: <PiChalkboardTeacherFill />,
    },
  ],
  "৯ম শ্রেণি": [
    {
      value: "মোঃ রফিকুল ইসলাম",
      label: "মোঃ রফিকুল ইসলাম",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "ড. শামীমা নাসরিন",
      label: "ড. শামীমা নাসরিন",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "মোঃ জাহিদুল ইসলাম",
      label: "মোঃ জাহিদুল ইসলাম",
      icon: <PiChalkboardTeacherFill />,
    },
  ],
  "১০ম শ্রেণি": [
    {
      value: "মোঃ সাইফুল ইসলাম",
      label: "মোঃ সাইফুল ইসলাম",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "ফারহানা ইয়াসমিন",
      label: "ফারহানা ইয়াসমিন",
      icon: <PiChalkboardTeacherFill />,
    },
    {
      value: "মোঃ রেজাউল করিম",
      label: "মোঃ রেজাউল করিম",
      icon: <PiChalkboardTeacherFill />,
    },
  ],
};

// ─── Animation ────────────────────────────────────────────
const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: "easeOut" },
  }),
};

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border ${
    hasError
      ? "border-rose-400 focus:ring-rose-400"
      : "border-gray-200 dark:border-gray-700 focus:ring-violet-500"
  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm`;

const labelClass =
  "block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-1.5";

// ─── Component ────────────────────────────────────────────
const AddWeeklyExam = () => {
  const [submitted, setSubmitted] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

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
      date: "",
      ExamNumber: "",
      topics: "",
    },
  });

  const selectedClass = watch("class");
  const subjectOptions = SUBJECT_MAP[selectedClass] ?? [];
  const teacherOptions = TEACHER_MAP[selectedClass] ?? [];

  // ── Image handlers ────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Mutation ──────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      axiosPublic.post("/api/weekly-exams", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("Weekly exam created!");
      qc.invalidateQueries({ queryKey: ["weekly-exams"] });
      reset();
      setImageFiles([]);
      setPreviews([]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    },
    onError: (err: unknown) => {
      type AxiosErr = {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const e = err as AxiosErr;
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to create exam",
      );
    },
  });

  const onSubmit: SubmitHandler<WeeklyExamFormData> = (data) => {
    const fd = new FormData();
    (Object.keys(data) as (keyof WeeklyExamFormData)[]).forEach((key) => {
      if (data[key] !== undefined) fd.append(key, String(data[key]));
    });
    imageFiles.forEach((file) => fd.append("images", file));
    mutation.mutate(fd);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-start justify-center py-10">
      <div className="w-full">
        {/* ── Header ──────────────────────────────────── */}
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

        {/* ── Card ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* ── Row 1: Class + Subject ───────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fieldVariants}
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
                variants={fieldVariants}
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
                      options={subjectOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedClass}
                      error={errors.subject?.message}
                    />
                  )}
                />
              </motion.div>
            </div>

            {/* ── Row 2: Teacher ───────────────────────── */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <Controller
                name="teacher"
                control={control}
                rules={{ required: "শিক্ষকের নাম আবশ্যিক" }}
                render={({ field }) => (
                  <SelectInput
                    label="শিক্ষকের নাম"
                    required
                    placeholder={
                      selectedClass ? "শিক্ষক বেছে নিন" : "আগে শ্রেণি বেছে নিন"
                    }
                    options={teacherOptions}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!selectedClass}
                    error={errors.teacher?.message}
                  />
                )}
              />
            </motion.div>

            {/* ── Row 3: ExamNumber + Mark ─────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fieldVariants}
              >
                <label className={labelClass}>
                  পরীক্ষা নম্বর{" "}
                  <span className="text-rose-500 normal-case tracking-normal">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ০১"
                  {...register("ExamNumber", {
                    required: "পরীক্ষা নম্বর আবশ্যিক",
                  })}
                  className={inputClass(!!errors.ExamNumber)}
                />
                <AnimatePresence>
                  {errors.ExamNumber && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-rose-500 text-xs mt-1"
                    >
                      {errors.ExamNumber.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fieldVariants}
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

            {/* ── Row 4: Date ──────────────────────────── */}
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <Controller
                name="date"
                control={control}
                rules={{ required: "তারিখ আবশ্যিক" }}
                render={({ field }) => (
                  <DatePicker
                    label="তারিখ"
                    required
                    placeholder="তারিখ বেছে নিন"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.date?.message}
                  />
                )}
              />
            </motion.div>

            {/* ── Row 5: Topics ────────────────────────── */}
            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <label className={labelClass}>
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
                className={`${inputClass(!!errors.topics)} resize-none leading-relaxed`}
              />
              <AnimatePresence>
                {errors.topics && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-rose-500 text-xs mt-1"
                  >
                    {errors.topics.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Row 6: Image upload ──────────────────── */}
            <motion.div
              custom={7}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
            >
              <label className={labelClass}>ছবি সংযুক্ত করুন (ঐচ্ছিক)</label>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors duration-200 group"
              >
                <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-violet-500 transition-colors" />
                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-violet-500 transition-colors">
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

              {/* Previews */}
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
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
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

            {/* ── Divider ──────────────────────────────── */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2" />

            {/* ── Buttons ──────────────────────────────── */}
            <motion.div
              custom={8}
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
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
                disabled={mutation.isPending}
                onClick={() => {
                  reset();
                  setImageFiles([]);
                  setPreviews([]);
                }}
                className="sm:w-32 py-3 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 disabled:opacity-50"
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
