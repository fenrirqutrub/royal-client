// WeeklyExamUpdateModals.tsx
import { useState, useRef, useMemo, useEffect } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2, X, Loader2, ImagePlus, Images } from "lucide-react";
import axiosPublic from "../../hooks/axiosPublic";
import SelectInput from "../../components/common/SelectInput";
import { uploadMultipleToCloudinary } from "../../hooks/useCloudinaryUpload";
import type { TeacherOption } from "../../types/types";
import type {
  EditFormValues,
  WeeklyExamData,
} from "../../types/WeeklyExamTypes";
import { CLASS_OPTIONS } from "../../utility/constants/class";
import { getSubjects } from "../../utility/constants/subject";

// ─── Constants ───────────────────────────────────────────
const MARK_OPTIONS = [
  { value: "10", label: "১০" },
  { value: "15", label: "১৫" },
  { value: "20", label: "২০" },
  { value: "25", label: "২৫" },
  { value: "30", label: "৩০" },
  { value: "35", label: "৩৫" },
  { value: "40", label: "৪০" },
  { value: "50", label: "৫০" },
  { value: "60", label: "৬০" },
  { value: "70", label: "৭০" },
  { value: "80", label: "৮০" },
  { value: "100", label: "১০০" },
];

const NUMBER_TYPE_OPTIONS = [
  { value: "", label: "কিছু না" },
  { value: "chapterNumber", label: "অধ্যায় নম্বর" },
  { value: "pageNumber", label: "পৃষ্ঠা নম্বর" },
];

// ─── Style helpers ────────────────────────────────────────
const inputCls = (isError: boolean, isValidTouched = false) =>
  `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200
   focus:outline-none focus:ring-2 focus:border-transparent
   bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-gray)]
   ${
     isError
       ? "border-rose-400 focus:ring-rose-400"
       : isValidTouched
         ? "border-emerald-400 focus:ring-emerald-400"
         : "border-[var(--color-active-border)] focus:ring-violet-500"
   }`;

const labelCls =
  "block text-xs font-semibold tracking-wide uppercase text-[var(--color-gray)] mb-1.5";

// ─── Animation Variants ──────────────────────────────────
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 16,
    transition: { duration: 0.2 },
  },
};

const imagePreviewVariants: Variants = {
  hidden: { opacity: 0, scale: 0.86 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.86 },
};

// ─── Small Components ────────────────────────────────────
const RequiredStar = () => (
  <span className="text-rose-500 normal-case tracking-normal font-normal ml-0.5">
    *
  </span>
);

const ErrMsg = ({ msg }: { msg?: string }) => (
  <AnimatePresence mode="wait">
    {msg && (
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="text-rose-500 text-xs mt-1 bangla"
      >
        {msg}
      </motion.p>
    )}
  </AnimatePresence>
);

// ─── Image Uploader ───────────────────────────────────────────
const ImageUploader = ({
  previews,
  onPickFiles,
  onRemove,
  fileInputRef,
  onFileChange,
}: {
  previews: string[];
  onPickFiles: () => void;
  onRemove: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <div className="flex items-center justify-between gap-3 mb-1.5">
      <label className={labelCls}>ছবি (ঐচ্ছিক)</label>
      {previews.length > 0 && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-active-bg)] border border-[var(--color-active-border)] text-[11px] text-[var(--color-gray)]">
          <Images className="w-3.5 h-3.5" />
          <span className="bangla">{previews.length}টি ছবি</span>
        </div>
      )}
    </div>

    <div
      onClick={onPickFiles}
      className="cursor-pointer border-2 border-dashed border-[var(--color-active-border)] hover:border-violet-400 rounded-2xl p-4 sm:p-5 flex items-center gap-3 transition-colors group bg-[var(--color-active-bg)]/30"
    >
      <ImagePlus className="w-5 h-5 text-[var(--color-gray)] group-hover:text-violet-500 transition-colors shrink-0" />
      <span className="text-sm text-[var(--color-gray)] group-hover:text-violet-500 transition-colors bangla">
        ক্লিক করুন বা ছবি যোগ করুন
      </span>
    </div>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={onFileChange}
    />

    <AnimatePresence mode="popLayout">
      {previews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 mt-3"
        >
          {previews.map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              variants={imagePreviewVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              {/* index badge */}
              <div className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-black/65 text-white text-[10px] font-semibold backdrop-blur-sm">
                {i + 1}
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600/95 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all shadow-sm"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Delete Modal ─────────────────────────────────────────────────────────────
export const DeleteModal = ({
  record,
  onConfirm,
  onCancel,
  isPending,
}: {
  record: WeeklyExamData;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) => (
  <motion.div
    variants={overlayVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    onClick={onCancel}
  >
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-[var(--color-bg)] rounded-2xl shadow-xl border border-[var(--color-active-border)] p-4 sm:p-6 w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5 text-rose-500" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] bangla">
            মুছে ফেলুন
          </h3>
          <p className="text-xs text-[var(--color-gray)] bangla">
            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-active-bg)] rounded-xl p-3 mb-5 text-sm border border-[var(--color-active-border)]">
        <p className="font-medium text-[var(--color-text)] bangla truncate">
          {record.subject} — {record.class}
        </p>
        <p className="text-[var(--color-gray)] text-xs mt-0.5 bangla">
          পরীক্ষা #{record.ExamNumber} • {record.teacher}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-active-bg)] hover:bg-[var(--color-active-border)] text-[var(--color-text)] transition-all disabled:opacity-50 bangla"
        >
          বাতিল
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 bangla"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">মুছে ফেলুন</span>
          <span className="sm:hidden">মুছুন</span>
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Edit Modal ───────────────────────────────────────────────────────────────
export const EditModal = ({
  record,
  onClose,
  onSuccess,
}: {
  record: WeeklyExamData;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // ── Fetch teachers ──────────────────────────────────────────────────
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery<
    TeacherOption[]
  >({
    queryKey: ["teachers-for-select"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/users");
      const list: Record<string, unknown>[] = Array.isArray(res.data)
        ? res.data
        : [];
      return list
        .filter(
          (u) =>
            ["teacher", "principal", "admin", "owner"].includes(
              u.role as string,
            ) && u.slug,
        )
        .map((u) => ({ slug: u.slug as string, name: u.name as string }));
    },
  });

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ value: t.slug, label: t.name })),
    [teachers],
  );

  const currentTeacherSlug = useMemo(() => {
    if (record.teacherSlug) return record.teacherSlug;
    const found = teachers.find((t) => t.name === record.teacher);
    return found?.slug ?? "";
  }, [record, teachers]);

  // ── Existing images ─────────────────────────────────────────────────
  const initialExisting = useMemo(
    () =>
      (record.images ?? []).map((img) => {
        if (typeof img === "string") return { imageUrl: img, publicId: "" };
        const o = img as Record<string, string>;
        return {
          imageUrl: o.imageUrl || o.url || "",
          publicId: o.publicId || "",
        };
      }),
    [record.images],
  );

  const [existingImages, setExistingImages] = useState(initialExisting);

  useEffect(() => {
    setExistingImages(initialExisting);
  }, [initialExisting, record._id]);

  // cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPreviews = [
    ...existingImages.map((i) => i.imageUrl),
    ...newPreviews,
  ];

  // ── Form ────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty, touchedFields },
  } = useForm<EditFormValues>({
    mode: "onTouched",
    defaultValues: {
      subject: record.subject,
      class: record.class,
      ExamNumber: record.ExamNumber,
      topics: record.topics,
      teacher: record.teacher,
      teacherSlug: currentTeacherSlug,
      mark: String(record.mark ?? "100"),
      question: record.question ?? "",
      numberType: record.numberType ?? "",
      chapterNumber: record.chapterNumber ? String(record.chapterNumber) : "",
      pageNumber: record.pageNumber ? String(record.pageNumber) : "",
    },
  });

  const selectedClass = watch("class");
  const selectedNumberType = watch("numberType");

  // ── Image change detection ──────────────────────────────────────────
  const hasExistingImagesChanged = useMemo(() => {
    if (existingImages.length !== initialExisting.length) return true;
    return existingImages.some(
      (img, i) =>
        img.imageUrl !== initialExisting[i]?.imageUrl ||
        img.publicId !== initialExisting[i]?.publicId,
    );
  }, [existingImages, initialExisting]);

  const hasImageChanges =
    hasExistingImagesChanged || imageFiles.length > 0 || newPreviews.length > 0;

  // ── File handlers ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles((p) => [...p, ...files]);
    setNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    if (i < existingImages.length) {
      setExistingImages((p) => p.filter((_, j) => j !== i));
    } else {
      const ni = i - existingImages.length;
      const blobUrl = newPreviews[ni];
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setNewPreviews((p) => p.filter((_, j) => j !== ni));
      setImageFiles((p) => p.filter((_, j) => j !== ni));
    }
  };

  // ── Mutation ────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      let uploadedNewImages: { imageUrl: string; publicId: string }[] = [];

      if (imageFiles.length > 0) {
        const results = await uploadMultipleToCloudinary(imageFiles, {
          folder: "weekly-exams",
        });
        uploadedNewImages = results.map((r) => ({
          imageUrl: r.secure_url,
          publicId: r.public_id,
        }));
      }

      const numberType = data.numberType || null;
      const chapterNumber =
        data.numberType === "chapterNumber" && data.chapterNumber?.trim()
          ? data.chapterNumber.trim()
          : null;
      const pageNumber =
        data.numberType === "pageNumber" && data.pageNumber?.trim()
          ? data.pageNumber.trim()
          : null;

      const payload = {
        subject: data.subject,
        class: data.class,
        ExamNumber: data.ExamNumber,
        topics: data.topics,
        teacher: data.teacher,
        teacherSlug: data.teacherSlug,
        mark: data.mark,
        question: data.question,
        numberType,
        chapterNumber,
        pageNumber,
        images: [...existingImages, ...uploadedNewImages],
      };

      return axiosPublic.put(`/api/weekly-exams/${record._id}`, payload);
    },
    onSuccess: () => {
      toast.success("সফলভাবে আপডেট হয়েছে!");
      onSuccess();
      onClose();
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) =>
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "আপডেট ব্যর্থ হয়েছে",
      ),
  });

  const canSubmit =
    !mutation.isPending && isValid && (isDirty || hasImageChanges);

  const onSubmit: SubmitHandler<EditFormValues> = (data) =>
    mutation.mutate(data);

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm   overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-[var(--color-bg)] rounded shadow-xl border border-[var(--color-active-border)] w-full my-auto mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--color-active-border)] bg-[var(--color-bg)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500 shrink-0" />
            <h2 className="font-bold text-[var(--color-text)] bangla text-sm sm:text-base truncate">
              সম্পাদনা করুন
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form Body ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5">
            {/* Class + Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Controller
                name="class"
                control={control}
                rules={{ required: "শ্রেণি আবশ্যিক" }}
                render={({ field, fieldState }) => (
                  <SelectInput
                    label="শ্রেণি"
                    required
                    placeholder="শ্রেণি বেছে নিন"
                    options={CLASS_OPTIONS}
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      setValue("subject", "", {
                        shouldTouch: false,
                        shouldDirty: true,
                      });
                    }}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    isTouched={fieldState.isTouched}
                  />
                )}
              />

              <Controller
                name="subject"
                control={control}
                rules={{ required: "বিষয় আবশ্যিক" }}
                render={({ field, fieldState }) => (
                  <SelectInput
                    label="বিষয়"
                    required
                    placeholder={
                      selectedClass ? "বিষয় বেছে নিন" : "আগে শ্রেণি বেছে নিন"
                    }
                    options={getSubjects(selectedClass)}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={!selectedClass}
                    error={fieldState.error?.message}
                    isTouched={fieldState.isTouched}
                  />
                )}
              />
            </div>

            {/* Teacher + Exam Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Controller
                name="teacherSlug"
                control={control}
                rules={{ required: "শিক্ষক বাছাই করুন" }}
                render={({ field, fieldState }) => (
                  <SelectInput
                    label="শিক্ষক"
                    required
                    placeholder={
                      isLoadingTeachers ? "লোড হচ্ছে..." : "শিক্ষক বেছে নিন"
                    }
                    options={teacherOptions}
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      const found = teachers.find((t) => t.slug === v);
                      if (found) {
                        setValue("teacher", found.name, { shouldDirty: true });
                      }
                    }}
                    onBlur={field.onBlur}
                    disabled={isLoadingTeachers}
                    error={fieldState.error?.message}
                    isTouched={fieldState.isTouched}
                  />
                )}
              />

              <div>
                <label className={labelCls}>
                  পরীক্ষা নম্বর <RequiredStar />
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="যেমন: ১, ৫, ২.৫"
                  {...register("ExamNumber", {
                    required: "পরীক্ষা নম্বর আবশ্যিক",
                    minLength: { value: 1, message: "সঠিক নম্বর দিন" },
                  })}
                  className={inputCls(
                    !!errors.ExamNumber,
                    !!touchedFields.ExamNumber && !errors.ExamNumber,
                  )}
                />
                <ErrMsg msg={errors.ExamNumber?.message} />
              </div>
            </div>

            {/* Number Type + Chapter / Page (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <Controller
                name="numberType"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectInput
                    label="অতিরিক্ত নম্বর টাইপ"
                    placeholder="ঐচ্ছিক"
                    options={NUMBER_TYPE_OPTIONS}
                    value={field.value ?? ""}
                    onChange={(v) => {
                      field.onChange(v);

                      if (v !== "chapterNumber")
                        setValue("chapterNumber", "", { shouldDirty: true });
                      if (v !== "pageNumber")
                        setValue("pageNumber", "", { shouldDirty: true });
                    }}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    isTouched={fieldState.isTouched}
                  />
                )}
              />

              <div
                className={
                  selectedNumberType === "chapterNumber"
                    ? ""
                    : "opacity-40 pointer-events-none"
                }
              >
                <label className={labelCls}>অধ্যায় নম্বর</label>
                <input
                  type="text"
                  placeholder="ঐচ্ছিক"
                  disabled={selectedNumberType !== "chapterNumber"}
                  {...register("chapterNumber")}
                  className={inputCls(false, !!touchedFields.chapterNumber)}
                />
              </div>

              <div
                className={
                  selectedNumberType === "pageNumber"
                    ? ""
                    : "opacity-40 pointer-events-none"
                }
              >
                <label className={labelCls}>পৃষ্ঠা নম্বর</label>
                <input
                  type="text"
                  placeholder="ঐচ্ছিক"
                  disabled={selectedNumberType !== "pageNumber"}
                  {...register("pageNumber")}
                  className={inputCls(false, !!touchedFields.pageNumber)}
                />
              </div>
            </div>

            {/* Marks */}
            <Controller
              name="mark"
              control={control}
              rules={{ required: "নম্বর বাছাই করুন" }}
              render={({ field, fieldState }) => (
                <SelectInput
                  label="পূর্ণমান"
                  required
                  placeholder="নম্বর বেছে নিন"
                  options={MARK_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  isTouched={fieldState.isTouched}
                />
              )}
            />

            {/* Topics */}
            <div>
              <label className={labelCls}>
                বিষয়বস্তু / সিলেবাস <RequiredStar />
              </label>
              <textarea
                rows={4}
                placeholder="বিষয়বস্তু লিখুন... (যেমন: অধ্যায় ১-৩, পৃষ্ঠা ১-৫০)"
                {...register("topics", {
                  required: "বিষয়বস্তু আবশ্যিক",
                  minLength: { value: 6, message: "কমপক্ষে ৬ অক্ষর লিখুন" },
                })}
                className={`${inputCls(
                  !!errors.topics,
                  !!touchedFields.topics && !errors.topics,
                )} resize-none leading-relaxed bangla`}
              />
              <ErrMsg msg={errors.topics?.message} />
            </div>

            {/* Question */}
            <div>
              <label className={labelCls}>
                প্রশ্নপত্র / নির্দেশনা (ঐচ্ছিক)
              </label>
              <textarea
                rows={4}
                placeholder="প্রশ্ন বা বিশেষ নির্দেশনা লিখুন..."
                {...register("question")}
                className={`${inputCls(
                  false,
                  !!touchedFields.question,
                )} resize-none leading-relaxed bangla`}
              />
              <p className="text-xs text-[var(--color-gray)] mt-1.5 bangla">
                প্রশ্নের ধরন, সংখ্যা বা অন্যান্য নির্দেশনা লিখতে পারেন
              </p>
            </div>

            {/* Images */}
            <ImageUploader
              previews={allPreviews}
              onPickFiles={() => fileInputRef.current?.click()}
              onRemove={removeImage}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />

            {/* hidden teacher name field */}
            <input type="hidden" {...register("teacher")} />
          </div>

          {/* ── Sticky Footer ───────────────────────────────────────── */}
          <div className="sticky bottom-0 border-t border-[var(--color-active-border)] bg-[var(--color-bg)] px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="w-full sm:w-32 py-2.5 rounded-xl text-sm font-medium bg-rose-600 text-[var(--color-text)] transition-all disabled:opacity-50 bangla"
              >
                বাতিল
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 bangla
                  ${
                    canSubmit
                      ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-[var(--color-active-bg)] text-[var(--color-gray)] cursor-not-allowed"
                  }`}
              >
                {mutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">আপডেট হচ্ছে…</span>
                    <span className="sm:hidden">অপেক্ষা করুন</span>
                  </div>
                ) : hasImageChanges && !isDirty ? (
                  "ছবি আপডেট করুন"
                ) : (
                  "আপডেট করুন"
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
