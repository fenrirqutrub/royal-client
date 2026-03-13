// WeeklyExam.tsx
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WeeklyExamCard from "./WeeklyExamCard";
import ExamPagination from "../../components/common/ExamPagination";
import axiosPublic from "../../hooks/axiosPublic";
import Marquee from "react-fast-marquee";

interface WeeklyExamData {
  _id: string;
  slug: string;
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  ExamNumber: string;
  topics: string;
  images: { imageUrl: string; publicId: string }[];
  createdAt: string;
}

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const BN_DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];
const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const formatCreatedAt = (iso: string): string => {
  const d = new Date(iso);
  return `${BN_DAYS[d.getDay()]}, ${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBn(d.getFullYear())}`;
};

const normalizeImages = (
  images: { imageUrl: string; publicId: string }[],
): { url: string; publicId: string }[] =>
  images.map(({ imageUrl, publicId }) => ({ url: imageUrl, publicId }));

const CLASS_ORDER: Record<string, number> = {
  "৬ষ্ঠ শ্রেণি": 1,
  "৭ম শ্রেণি": 2,
  "৮ম শ্রেণি": 3,
  "৯ম শ্রেণি": 4,
  "১০ম শ্রেণি": 5,
};
const classOrder = (cls: string) => CLASS_ORDER[cls] ?? 99;
const sortExamNumbers = (nums: string[]): string[] =>
  [...nums].sort((a, b) => Number(a) - Number(b));
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const CLASS_COLORS: Record<
  string,
  { from: string; to: string; soft: string; text: string }
> = {
  "৬ষ্ঠ শ্রেণি": {
    from: "#6366f1",
    to: "#818cf8",
    soft: "#eef2ff",
    text: "#4338ca",
  },
  "৭ম শ্রেণি": {
    from: "#0ea5e9",
    to: "#38bdf8",
    soft: "#e0f2fe",
    text: "#0369a1",
  },
  "৮ম শ্রেণি": {
    from: "#10b981",
    to: "#34d399",
    soft: "#d1fae5",
    text: "#065f46",
  },
  "৯ম শ্রেণি": {
    from: "#f59e0b",
    to: "#fbbf24",
    soft: "#fef3c7",
    text: "#92400e",
  },
  "১০ম শ্রেণি": {
    from: "#ec4899",
    to: "#f472b6",
    soft: "#fce7f3",
    text: "#9d174d",
  },
};
const defaultColor = {
  from: "#7c3aed",
  to: "#a855f7",
  soft: "#ede9fe",
  text: "#4c1d95",
};

interface ClassGroupTitleProps {
  className: string;
  examNumber: string;
  index: number;
}

const ClassGroupTitle = ({
  className,
  examNumber,
  index,
}: ClassGroupTitleProps) => {
  const color = CLASS_COLORS[className] ?? defaultColor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex items-center gap-0 mb-5 mt-20 overflow-hidden rounded-lg bangla"
    >
      <div
        className="w-1.5 self-stretch rounded-l-2xl shrink-0"
        style={{
          background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
        }}
      />
      <div
        className="flex-1 flex items-center justify-between px-5 py-2"
        style={{ background: `linear-gradient(105deg, ${color.soft}, white)` }}
      >
        <h2
          className="text-xl md:text-2xl font-extrabold leading-tight"
          style={{ color: color.text }}
        >
          {className}
        </h2>
        <div
          className="hidden sm:block h-10 w-px mx-4 rounded-full opacity-20"
          style={{ background: color.from }}
        />
        <p
          className="text-xl md:text-2xl font-black tabular-nums leading-tight"
          style={{ color: color.from }}
        >
          পরীক্ষা নং: {toBn(examNumber)}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Marquee items ────────────────────────────────────────
const MARQUEE_ITEMS = [
  "সাপ্তাহিক পরীক্ষা:-",
  "লিখিত: ৭০",
  "বহুনির্বাচনী: ৩০",
  "পূর্ণমান: ১০০",
  "সময়: ৩ ঘন্টা",
  "পরিক্ষার ফি ও আনুসাঙ্গিক খরচ বাবদ ধার্য: ৩০ টাকা মাত্র",
];

// ─── Component ────────────────────────────────────────────
const WeeklyExam = () => {
  const [selectedExamNumber, setSelectedExamNumber] = useState<string | null>(
    null,
  );

  useEffect(() => {
    scrollToTop();
  }, []);

  const { data, isLoading, isError } = useQuery<WeeklyExamData[]>({
    queryKey: ["weekly-exams"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/weekly-exams");
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const examNumbers = useMemo(() => {
    if (!data) return [];
    const unique = new Set(data.map((e) => e.ExamNumber));
    return sortExamNumbers(Array.from(unique));
  }, [data]);

  const activeExamNumber = useMemo(() => {
    if (selectedExamNumber && examNumbers.includes(selectedExamNumber))
      return selectedExamNumber;
    return examNumbers[examNumbers.length - 1] ?? null;
  }, [examNumbers, selectedExamNumber]);

  const groupedByClass = useMemo(() => {
    if (!data || !activeExamNumber) return [];
    const filtered = data.filter((e) => e.ExamNumber === activeExamNumber);
    const map = new Map<string, WeeklyExamData[]>();
    filtered.forEach((exam) => {
      if (!map.has(exam.class)) map.set(exam.class, []);
      map.get(exam.class)!.push(exam);
    });
    map.forEach((exams) =>
      exams.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    );
    return Array.from(map.entries())
      .sort(([a], [b]) => classOrder(a) - classOrder(b))
      .map(([className, exams]) => ({ className, exams }));
  }, [data, activeExamNumber]);

  const handlePageSelect = (examNumber: string) => {
    setSelectedExamNumber(examNumber);
    scrollToTop();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-rose-400 text-sm">
        ডেটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <header className="text-center bangla mb-4">
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-text)]">
          সাপ্তাহিক পরীক্ষার ধারণা
        </h1>
        <p className="text-xl md:text-3xl font-bold text-[var(--color-gray)] my-3">
          সাপ্তাহিক পরীক্ষা নং - {toBn(activeExamNumber ?? "")}
        </p>
      </header>

      {/* ── Marquee banner ── */}
      <div className="flex items-stretch rounded overflow-hidden bangla mt-10">
        {/* Solid "বিজ্ঞপ্তি" badge */}
        <div className="shrink-0 flex items-center justify-center px-5 bg-[var(--color-text)]">
          <span className="text-[var(--color-bg)] font-black text-lg md:text-xl tracking-wide whitespace-nowrap">
            বিজ্ঞপ্তি
          </span>
        </div>

        {/* Soft scrolling area */}
        <div className="flex-1 bg-[var(--color-active-bg)] overflow-hidden">
          <Marquee speed={40} gradient={false} pauseOnHover>
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="inline-block text-[var(--color-text)] text-lg md:text-xl font-medium py-2 mx-10">
                  {item}
                </span>
                <span className="text-2xl font-extrabold  ">•</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* Content grouped by class */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeExamNumber}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="mt-8 px-3 md:px-0"
        >
          {groupedByClass.length > 0 ? (
            groupedByClass.map(({ className, exams }, groupIndex) => (
              <div key={className}>
                <ClassGroupTitle
                  className={className}
                  examNumber={activeExamNumber!}
                  index={groupIndex}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4 mb-10">
                  {exams.map((exam, i) => (
                    <WeeklyExamCard
                      key={exam._id}
                      exam={{
                        ...exam,
                        date: formatCreatedAt(exam.createdAt),
                        images: normalizeImages(exam.images),
                      }}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-16">
              এই পরীক্ষার কোনো তথ্য পাওয়া যায়নি।
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {examNumbers.length > 0 && activeExamNumber && (
        <ExamPagination
          examNumbers={examNumbers}
          selected={activeExamNumber}
          onSelect={handlePageSelect}
        />
      )}
    </div>
  );
};

export default WeeklyExam;
