// ManageWeeklyExam.tsx
import { useState, useRef, useMemo } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  BookOpen,
  User,
  Award,
  ChevronDown,
  ImagePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  MdOutlineClass,
  MdOutlineScience,
  MdOutlineHistoryEdu,
} from "react-icons/md";
import { TbMath, TbLanguage } from "react-icons/tb";
import { GiEarthAsiaOceania } from "react-icons/gi";
import { FaBookOpen, FaFlask } from "react-icons/fa";
import axiosPublic from "../../../hooks/axiosPublic";
import SelectInput from "../../../components/common/SelectInput";
import type { SelectOption } from "../../../components/common/SelectInput";
import { useAuth } from "../../../context/AuthContext";
import ExamPagination from "../../../components/common/ExamPagination";

// ─── Types ────────────────────────────────────────────────
interface ExamImage {
  imageUrl: string;
  publicId: string;
}

interface WeeklyExam {
  _id: string;
  slug: string;
  subject: string;
  teacher: string;
  teacherSlug?: string;
  class: string;
  mark: number;
  ExamNumber: string;
  topics: string;
  // images can be plain URL strings (legacy) OR objects from the model
  images?: (string | ExamImage)[];
  createdAt: string;
}

interface EditFormData {
  subject: string;
  class: string;
  ExamNumber: string;
  topics: string;
}

// ─── Helper: resolve image src regardless of shape ────────
const imgSrc = (img: string | ExamImage): string =>
  typeof img === "string" ? img : img.imageUrl;

// ─── Static Data ──────────────────────────────────────────
const CLASSES = ["৬ষ্ঠ", "৭ম", "৮ম", "৯ম", "১০ম"] as const;

const CLASS_OPTIONS: SelectOption[] = CLASSES.map((c) => ({
  value: `${c} শ্রেণি`,
  label: `${c} শ্রেণি`,
  icon: <MdOutlineClass />,
}));

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

const getSubjects = (cls: string) =>
  cls.startsWith("৯ম") || cls.startsWith("১০ম")
    ? [...BASE_SUBJECTS, ...ADVANCED_SUBJECTS]
    : BASE_SUBJECTS;

// ─── Styles ───────────────────────────────────────────────
const inputCls = (err: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent
  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400
  ${err ? "border-rose-400 focus:ring-rose-400" : "border-gray-200 dark:border-gray-700 focus:ring-violet-500"}`;

const labelCls =
  "block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-1.5";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

const overlayV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalV: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.2 } },
};

// ─── Sub-components ───────────────────────────────────────
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

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
  >
    {label}
  </span>
);

// ─── Delete Confirm Modal ─────────────────────────────────
const DeleteModal = ({
  exam,
  onConfirm,
  onCancel,
  isPending,
}: {
  exam: WeeklyExam;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) => (
  <motion.div
    variants={overlayV}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    onClick={onCancel}
  >
    <motion.div
      variants={modalV}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            পরীক্ষা মুছে ফেলুন
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না
          </p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5 text-sm">
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {exam.subject} — {exam.class}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          পরীক্ষা #{exam.ExamNumber}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50"
        >
          বাতিল
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          মুছে ফেলুন
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Edit Modal ───────────────────────────────────────────
const EditModal = ({
  exam,
  onClose,
}: {
  exam: WeeklyExam;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Normalise existing images to { url, publicId } shape for internal use
  const initialExisting = (exam.images ?? []).map((img) =>
    typeof img === "string" ? { imageUrl: img, publicId: "" } : img,
  );
  const [existingImages, setExistingImages] =
    useState<{ imageUrl: string; publicId: string }[]>(initialExisting);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const allPreviews = [
    ...existingImages.map((i) => i.imageUrl),
    ...newPreviews,
  ];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<EditFormData>({
    mode: "onChange",
    defaultValues: {
      subject: exam.subject,
      class: exam.class,
      ExamNumber: exam.ExamNumber,
      topics: exam.topics,
    },
  });

  const selectedClass = watch("class");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles((p) => [...p, ...files]);
    setNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    const existingCount = existingImages.length;
    if (i < existingCount) {
      setExistingImages((p) => p.filter((_, j) => j !== i));
    } else {
      const newIdx = i - existingCount;
      URL.revokeObjectURL(newPreviews[newIdx]);
      setNewPreviews((p) => p.filter((_, j) => j !== newIdx));
      setImageFiles((p) => p.filter((_, j) => j !== newIdx));
    }
  };

  const mutation = useMutation({
    mutationFn: (data: EditFormData) => {
      const fd = new FormData();
      fd.append("subject", data.subject);
      fd.append("class", data.class);
      fd.append("ExamNumber", data.ExamNumber);
      fd.append("topics", data.topics);
      fd.append("teacher", exam.teacher);
      if (exam.teacherSlug) fd.append("teacherSlug", exam.teacherSlug);
      existingImages.forEach((img) =>
        fd.append("existingImages", img.imageUrl),
      );
      imageFiles.forEach((f) => fd.append("images", f));
      return axiosPublic.put(`/api/weekly-exams/${exam._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("সফলভাবে আপডেট হয়েছে!");
      qc.invalidateQueries({ queryKey: ["weekly-exams"] });
      onClose();
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) =>
      toast.error(
        err?.response?.data?.message || err?.message || "আপডেট ব্যর্থ হয়েছে",
      ),
  });

  const onSubmit: SubmitHandler<EditFormData> = (data) => mutation.mutate(data);

  return (
    <motion.div
      variants={overlayV}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        variants={modalV}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full  my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              পরীক্ষা সম্পাদনা
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Class + Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  }}
                  error={errors.class?.message}
                />
              )}
            />
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
          </div>

          {/* ExamNumber */}
          <div>
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
              {...register("ExamNumber", { required: "পরীক্ষা নম্বর আবশ্যিক" })}
              className={inputCls(!!errors.ExamNumber)}
            />
            <ErrorMsg msg={errors.ExamNumber?.message} />
          </div>

          {/* Topics */}
          <div>
            <label className={labelCls}>
              বিষয়বস্তু / নির্দেশনা{" "}
              <span className="text-rose-500 normal-case tracking-normal">
                *
              </span>
            </label>
            <textarea
              rows={4}
              placeholder="পরীক্ষার বিষয়বস্তু লিখুন..."
              {...register("topics", {
                required: "বিষয়বস্তু আবশ্যিক",
                minLength: { value: 20, message: "কমপক্ষে ২০ অক্ষর লিখুন" },
              })}
              className={`${inputCls(!!errors.topics)} resize-none leading-relaxed`}
            />
            <ErrorMsg msg={errors.topics?.message} />
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelCls}>ছবি (ঐচ্ছিক)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl p-4 flex items-center gap-3 transition-colors group"
            >
              <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors" />
              <p className="text-sm text-gray-500 group-hover:text-violet-500 transition-colors">
                ক্লিক করুন বা ছবি টেনে আনুন
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
              {allPreviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3"
                >
                  {allPreviews.map((src, i) => (
                    <motion.div
                      key={src}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={src}
                        alt=""
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
            {allPreviews.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {allPreviews.length}টি ছবি
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="sm:w-28 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={!isValid || !isDirty || mutation.isPending}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                isValid && isDirty && !mutation.isPending
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> আপডেট হচ্ছে…
                </>
              ) : (
                "আপডেট করুন"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Exam Card ────────────────────────────────────────────
const ExamCard = ({
  exam,
  index,
  onEdit,
  onDelete,
}: {
  exam: WeeklyExam;
  index: number;
  onEdit: (exam: WeeklyExam) => void;
  onDelete: (exam: WeeklyExam) => void;
}) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="bg-[var(--color-bg)] rounded-2xl border border-[var(--color-gray)] p-5 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 group"
  >
    {/* Top row */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge
            label={exam.class}
            color="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
          />
          <Badge
            label={`পরীক্ষা #${exam.ExamNumber}`}
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          />
        </div>
        <h3 className="font-semibold text-[var(--color-text)] truncate bangla text-xl md:text-2xl">
          {exam.subject}
        </h3>
      </div>
      {/* Action buttons */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(exam)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-600 dark:text-violet-400 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(exam)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 dark:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Topics preview */}
    <p className="text-xs text-[var(--color-gray)] line-clamp-2 leading-relaxed border-t border-[var(--color-active-border)] pt-3 mb-3">
      {exam.topics}
    </p>

    {/* ── Images strip — FIXED: unwrap imageUrl from object ── */}
    {exam.images && exam.images.length > 0 && (
      <div className="flex gap-2 flex-wrap">
        {exam.images.slice(0, 4).map((img, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 shrink-0"
          >
            <img
              src={imgSrc(img)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {exam.images.length > 4 && (
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
            +{exam.images.length - 4}
          </div>
        )}
      </div>
    )}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────
const ManageWeeklyExam = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  // ── NEW: selected ExamNumber for pagination (empty = show all) ──
  const [selectedExamNumber, setSelectedExamNumber] = useState<string>("");
  const [editTarget, setEditTarget] = useState<WeeklyExam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WeeklyExam | null>(null);
  const qc = useQueryClient();

  const isAdmin = user?.role === "admin";
  const isRestricted = user?.role === "teacher" || user?.role === "principal";

  const queryKey = isAdmin
    ? ["weekly-exams"]
    : ["weekly-exams", user?.slug ?? ""];
  const queryUrl = isAdmin
    ? "/api/weekly-exams"
    : `/api/weekly-exams?teacherSlug=${user?.slug ?? ""}`;

  const {
    data: exams = [],
    isLoading,
    isError,
  } = useQuery<WeeklyExam[]>({
    queryKey,
    queryFn: async () => {
      const res = await axiosPublic.get(queryUrl);
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.exams)) return payload.exams;
      return [];
    },
    enabled: !!user && (isAdmin || !!user.slug),
  });

  // ── Sorted unique exam numbers for pagination ──────────
  const sortedExamNumbers = useMemo(() => {
    const unique = [...new Set(exams.map((e) => e.ExamNumber))];
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [exams]);

  // Auto-select the latest exam number on first load
  const effectiveExamNumber =
    selectedExamNumber || sortedExamNumbers[sortedExamNumbers.length - 1] || "";

  const handleExamNumberSelect = (num: string) => {
    setSelectedExamNumber(num);
    // Clear text search when switching exam numbers
    setSearch("");
  };

  const filtered = exams.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.subject.toLowerCase().includes(q) ||
      e.topics.toLowerCase().includes(q) ||
      e.ExamNumber.includes(q);
    const matchClass = !filterClass || e.class === filterClass;
    // ── NEW: filter by selected exam number ──
    const matchExamNumber =
      !effectiveExamNumber || e.ExamNumber === effectiveExamNumber;
    return matchSearch && matchClass && matchExamNumber;
  });

  const stats = [
    {
      label: "মোট পরীক্ষা",
      value: exams.length,
      icon: <BookOpen className="w-4 h-4" />,
      color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
    },
    {
      label: "মোট শ্রেণি",
      value: new Set(exams.map((e) => e.class)).size,
      icon: <Award className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    isAdmin
      ? {
          label: "মোট শিক্ষক",
          value: new Set(exams.map((e) => e.teacher)).size,
          icon: <User className="w-4 h-4" />,
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        }
      : {
          label: "শিক্ষক",
          value: user?.name ?? "—",
          icon: <User className="w-4 h-4" />,
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        },
  ];

  const scopeLabel = isAdmin
    ? "সকল পরীক্ষা দেখুন, সম্পাদনা করুন বা মুছে ফেলুন"
    : `${user?.name} — আপনার যোগ করা পরীক্ষাগুলো দেখুন ও পরিচালনা করুন`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            সাপ্তাহিক পরীক্ষা পরিচালনা
          </h1>
        </div>
        <div className="ml-4 pl-3 flex items-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {scopeLabel}
          </p>
          {isRestricted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 uppercase tracking-wide">
              {user?.role}
            </span>
          )}
          {isAdmin && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              admin
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.38 }}
        className="grid grid-cols-3 gap-4 mb-6"
      >
        {stats.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
            >
              {icon}
            </div>
            <div>
              <p
                className={`font-bold text-gray-900 dark:text-gray-100 leading-none ${typeof value === "number" ? "text-xl" : "text-sm"}`}
              >
                {value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {label}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.38 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="বিষয় বা বিষয়বস্তু খুঁজুন…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative sm:w-52">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          >
            <option value="">সকল শ্রেণি</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-rose-500 text-sm">
          ডেটা লোড করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {search || filterClass
              ? "কোনো ফলাফল পাওয়া যায়নি"
              : "এখনো কোনো পরীক্ষা যোগ করা হয়নি"}
          </p>
        </motion.div>
      ) : (
        <>
          <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
            {filtered.length}টি পরীক্ষা দেখাচ্ছে
            {(search || filterClass) && ` (মোট ${exams.length}টির মধ্যে)`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filtered.map((exam, i) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                index={i}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </>
      )}

      {/* ── ExamPagination — shown below the grid ── */}
      {!isLoading && !isError && sortedExamNumbers.length > 1 && (
        <ExamPagination
          examNumbers={sortedExamNumbers}
          selected={effectiveExamNumber}
          onSelect={handleExamNumberSelect}
          hint={`পরীক্ষা নং বেছে নিন • মোট ${sortedExamNumbers.length}টি`}
          windowSize={7}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {editTarget && (
          <EditModal
            key="edit"
            exam={editTarget}
            onClose={() => setEditTarget(null)}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete"
            exam={deleteTarget}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
            isPending={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageWeeklyExam;
