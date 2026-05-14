// WeeklyExam.tsx — final fixed version

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import WeeklyExamCard from "./WeeklyExamCard";
import ExamPagination from "../../components/common/ExamPagination";
import axiosPublic from "../../hooks/axiosPublic";
import Marquee from "react-fast-marquee";
import Skeleton from "../../components/common/Skeleton";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { Fan } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DeleteModal, EditModal } from "./WeeklyExamUpdateModals";
import { useGuestPreview } from "../../hooks/useGuestPreview";
import LoginPromptOverlay from "../Admin/Auth/LoginPromptOverlay";
import { BN_DAYS_FULL, BN_MONTHS, toBn } from "../../utility/Formatters";
import {
  CLASS_ORDER,
  MANAGER_ROLES,
  normalizeStudentClass,
  STAFF_ROLES,
} from "../../utility/Constants";
import type { NormalizedImage, RawImage } from "../../types/types";
import { useNavigate } from "react-router";
import WeeklyExamHeaderFilters from "./WeeklyExamHeaderFilters";
import type {
  ExamMetaResponse,
  WeeklyExamData,
} from "../../types/WeeklyExamTypes";

// ─── Helpers ─────────────────────────────────────────────────
const formatCreatedAt = (iso: string): string => {
  const d = new Date(iso);
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${BN_DAYS_FULL[d.getDay()]}`;
};

const normalizeImages = (images: RawImage[] = []): NormalizedImage[] =>
  images.map((img) => {
    if (typeof img === "string") return { url: img, publicId: "" };
    return {
      url: img.imageUrl ?? img.url ?? "",
      publicId: img.publicId ?? "",
    };
  });

const sortExamNumbers = (nums: string[]): string[] =>
  [...nums]
    .map((n) => String(n).trim())
    .filter(Boolean)
    .sort((a, b) => Number(a) - Number(b));

// ─── Dhaka time ──────────────────────────────────────────────
const getDhakaNow = (): Date =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));

// ─── Animations ──────────────────────────────────────────────
const groupTitleVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18 },
  },
};

// ─── ClassGroupTitle ─────────────────────────────────────────
const ClassGroupTitle = ({
  className,
  index,
  count,
}: {
  className: string;
  index: number;
  count: number;
}) => (
  <motion.div
    custom={index}
    variants={groupTitleVariants}
    initial="hidden"
    animate="visible"
    className="mb-4 mt-8 flex items-center justify-center gap-x-10 rounded border-y border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-4 py-3 bangla sm:mt-10"
  >
    <h2 className="text-lg font-bold text-[var(--color-text)] md:text-2xl">
      {className}
    </h2>
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.07 + 0.3,
        type: "spring",
        stiffness: 500,
      }}
      className="border-x border-[var(--color-active-border)] px-3 py-1 text-xs font-semibold text-[var(--color-gray)] sm:text-sm"
    >
      {toBn(count)}টি ধারণা
    </motion.span>
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────
const WeeklyExam = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { isGuest } = useGuestPreview();
  const navigate = useNavigate();

  const [selectedExamNumber, setSelectedExamNumber] = useState<string | null>(
    null,
  );
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [editTarget, setEditTarget] = useState<WeeklyExamData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WeeklyExamData | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [dhakaNow, setDhakaNow] = useState<Date>(getDhakaNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setDhakaNow(getDhakaNow());
    }, 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const userRole = user?.role ?? "student";
  const userSlug = user?.slug ?? "";
  const isManager = MANAGER_ROLES.includes(userRole);
  const isStaff = STAFF_ROLES.includes(userRole);

  const defaultTeacherFilter = useMemo(
    () => (STAFF_ROLES.includes(userRole) && userSlug ? userSlug : "all"),
    [userRole, userSlug],
  );

  const prevDefaultRef = useRef("all");

  useEffect(() => {
    const prevDefault = prevDefaultRef.current;
    setSelectedTeacher((prev) =>
      prev === prevDefault ? defaultTeacherFilter : prev,
    );
    prevDefaultRef.current = defaultTeacherFilter;
  }, [defaultTeacherFilter]);

  const isAfterSaturdayNoon = useMemo(() => {
    const day = dhakaNow.getDay();
    const hour = dhakaNow.getHours();
    const minute = dhakaNow.getMinutes();
    return day === 6 && (hour > 12 || (hour === 12 && minute >= 0));
  }, [dhakaNow]);

  const { data: metaData, isLoading: isMetaLoading } =
    useQuery<ExamMetaResponse>({
      queryKey: ["weekly-exams-meta"],
      queryFn: async () => {
        const res = await axiosPublic.get("/api/weekly-exams/meta");
        return res.data;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const examNumbers = useMemo(() => {
    if (!metaData?.examNumbers) return [];
    return Array.from(new Set(sortExamNumbers(metaData.examNumbers)));
  }, [metaData]);

  const lastExamNumber = useMemo(
    () => examNumbers[examNumbers.length - 1] ?? null,
    [examNumbers],
  );

  const nextExpectedExamNumber = useMemo(() => {
    if (!lastExamNumber) return "1";
    return String(Number(lastExamNumber) + 1);
  }, [lastExamNumber]);

  const displayExamNumbers = useMemo(() => {
    if (isAfterSaturdayNoon) {
      return Array.from(new Set([...examNumbers, nextExpectedExamNumber]));
    }
    return examNumbers;
  }, [examNumbers, isAfterSaturdayNoon, nextExpectedExamNumber]);

  const activeExamNumber = useMemo(() => {
    if (
      selectedExamNumber &&
      displayExamNumbers.includes(String(selectedExamNumber).trim())
    ) {
      return String(selectedExamNumber).trim();
    }

    if (isAfterSaturdayNoon) {
      return nextExpectedExamNumber;
    }

    return lastExamNumber ?? nextExpectedExamNumber;
  }, [
    selectedExamNumber,
    displayExamNumbers,
    isAfterSaturdayNoon,
    nextExpectedExamNumber,
    lastExamNumber,
  ]);

  // ─────────────────────────────────────────────────────────────
  // ✅ isAwaitingNextExam — next exam এ কেউ data দেয়নি
  // ─────────────────────────────────────────────────────────────
  const isAwaitingNextExam = useMemo(
    () =>
      isAfterSaturdayNoon &&
      activeExamNumber === nextExpectedExamNumber &&
      !examNumbers.includes(nextExpectedExamNumber),
    [
      isAfterSaturdayNoon,
      activeExamNumber,
      nextExpectedExamNumber,
      examNumbers,
    ],
  );

  const handleAddExam = () => {
    const exam = activeExamNumber || nextExpectedExamNumber || "1";
    navigate(`/dashboard/add-weekly-exam?exam=${exam}`);
  };

  // ✅ Query 1 — teacher dropdown এর জন্য (filter ছাড়া)
  const { data: allExamData } = useQuery<WeeklyExamData[]>({
    queryKey: ["weekly-exams-all-teachers", activeExamNumber],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/weekly-exams", {
        params: { examNumber: activeExamNumber },
      });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    enabled: !!activeExamNumber,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ Query 2 — card দেখানোর জন্য (teacher filter সহ)
  const {
    data: filteredExamData,
    isLoading: isExamLoading,
    isError,
  } = useQuery<WeeklyExamData[]>({
    queryKey: ["weekly-exams-filtered", activeExamNumber, selectedTeacher],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeExamNumber) params.examNumber = activeExamNumber;
      if (selectedTeacher !== "all") params.teacherSlug = selectedTeacher;

      const res = await axiosPublic.get("/api/weekly-exams", { params });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    enabled: !!activeExamNumber,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const data = useMemo(() => filteredExamData ?? [], [filteredExamData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>();

    (allExamData ?? []).forEach((e) => {
      if (e.teacherSlug && e.teacher) {
        map.set(e.teacherSlug, e.teacher);
      }
    });

    if (userRole !== "student" && userSlug && !map.has(userSlug)) {
      map.set(userSlug, user?.name || "আমার পরীক্ষা");
    }

    return [
      { value: "all", label: "সকল শিক্ষক" },
      ...Array.from(map.entries()).map(([slug, name]) => ({
        value: slug,
        label: name,
      })),
    ];
  }, [allExamData, userRole, userSlug, user?.name]);

  useEffect(() => {
    const exists = teacherOptions.some((opt) => opt.value === selectedTeacher);
    if (!exists) setSelectedTeacher(defaultTeacherFilter);
  }, [teacherOptions, selectedTeacher, defaultTeacherFilter]);

  // ─── Class filtering ──────────────────────────────────────────
  const availableClasses = useMemo(() => {
    const seen = new Set<string>();
    data.forEach((e) => {
      if (e.class) seen.add(normalizeStudentClass(e.class));
    });
    return Array.from(seen).sort(
      (a, b) => (CLASS_ORDER[a] ?? 99) - (CLASS_ORDER[b] ?? 99),
    );
  }, [data]);

  const groupedByClass = useMemo(() => {
    let filtered = data;

    if (selectedClass !== "all") {
      filtered = filtered.filter(
        (e) =>
          normalizeStudentClass(e.class) ===
          normalizeStudentClass(selectedClass),
      );
    }

    const map = new Map<string, WeeklyExamData[]>();

    filtered.forEach((exam) => {
      const normalized = normalizeStudentClass(exam.class);
      if (!map.has(normalized)) map.set(normalized, []);
      map.get(normalized)!.push(exam);
    });

    map.forEach((exams) =>
      exams.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    );

    return Array.from(map.entries())
      .sort(([a], [b]) => (CLASS_ORDER[a] ?? 99) - (CLASS_ORDER[b] ?? 99))
      .map(([className, exams]) => ({ className, exams }));
  }, [data, selectedClass]);

  const totalExamsInNumber = data.length;

  const filteredCount = useMemo(
    () => groupedByClass.reduce((acc, g) => acc + g.exams.length, 0),
    [groupedByClass],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedClass !== "all") count++;
    if (selectedTeacher !== defaultTeacherFilter) count++;
    return count;
  }, [selectedClass, selectedTeacher, defaultTeacherFilter]);

  const handleReset = () => {
    setSelectedClass("all");
    setSelectedTeacher(defaultTeacherFilter);
  };

  useEffect(() => {
    if (
      selectedClass !== "all" &&
      !availableClasses.includes(normalizeStudentClass(selectedClass))
    ) {
      setSelectedClass("all");
    }
  }, [availableClasses, selectedClass]);

  // ─── Permissions ──────────────────────────────────────────────
  const canEditExam = (exam: WeeklyExamData): boolean => {
    if (isManager) return true;
    if (userRole === "teacher" && exam.teacherSlug === userSlug) return true;
    return false;
  };

  const canDeleteExam = (exam: WeeklyExamData): boolean => {
    if (isManager) return true;
    if (userRole === "teacher" && exam.teacherSlug === userSlug) return true;
    return false;
  };

  // ─── Delete ───────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosPublic.delete(`/api/weekly-exams/${id}`),
    onSuccess: () => {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে");
      qc.invalidateQueries({ queryKey: ["weekly-exams-all-teachers"] });
      qc.invalidateQueries({ queryKey: ["weekly-exams-filtered"] });
      qc.invalidateQueries({ queryKey: ["weekly-exams-meta"] });
      setDeleteTarget(null);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "মুছতে ব্যর্থ হয়েছে",
      );
    },
  });

  // ─── Render helpers ───────────────────────────────────────────
  const renderCard = (exam: WeeklyExamData, i: number) => (
    <WeeklyExamCard
      key={exam._id}
      exam={{
        ...exam,
        date: formatCreatedAt(exam.createdAt),
        images: normalizeImages(exam.images as RawImage[]),
      }}
      index={i}
      activeExamNumber={activeExamNumber}
      canEdit={canEditExam(exam)}
      canDelete={canDeleteExam(exam)}
      onEdit={() => setEditTarget(exam)}
      onDelete={() => setDeleteTarget(exam)}
    />
  );

  const buildGuestContent = () => {
    const previewGroup =
      groupedByClass.find(({ className }) => className.includes("৬ষ্ঠ")) ??
      groupedByClass[0];

    if (!previewGroup) return null;

    const visibleExams = previewGroup.exams.slice(0, 2);

    return (
      <div>
        <ClassGroupTitle
          className={previewGroup.className}
          index={0}
          count={previewGroup.exams.length}
        />
        <div className="relative mb-8 grid cursor-pointer grid-cols-1 gap-3 sm:mb-10 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
          <div
            className="absolute inset-0 z-10"
            onClick={() => setShowLoginPrompt(true)}
          />
          {visibleExams.map((exam, i) => renderCard(exam, i))}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
        </div>
      </div>
    );
  };

  // ─── Loading / Error ──────────────────────────────────────────
  const isLoading = isMetaLoading || isExamLoading;

  if (isLoading) {
    return <Skeleton variant="daily-lesson" />;
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-sm text-rose-400 bangla">
        ডেটা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।
      </div>
    );
  }

  // ─── UI ───────────────────────────────────────────────────────
  return (
    <div className="relative mx-auto max-w-7xl">
      <WeeklyExamHeaderFilters
        isGuest={isGuest}
        isStaff={isStaff}
        activeExamNumber={activeExamNumber}
        selectedTeacher={selectedTeacher}
        onTeacherChange={setSelectedTeacher}
        teacherOptions={teacherOptions}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        availableClasses={availableClasses}
        totalExamsInNumber={totalExamsInNumber}
        filteredCount={filteredCount}
        activeFilterCount={activeFilterCount}
        onAddExam={handleAddExam}
        onReset={handleReset}
        onGuestAction={() => setShowLoginPrompt(true)}
      />

      {/* Marquee */}
      <div className="mx-2 mb-6 overflow-hidden rounded border border-[var(--color-active-border)] bg-[var(--color-bg)] bangla sm:mx-0 sm:mb-8">
        <div className="flex items-stretch">
          <div className="flex shrink-0 items-center justify-center bg-[var(--color-text)] px-4 sm:px-5">
            <span className="text-sm font-black tracking-wide text-[var(--color-bg)] sm:text-base">
              বিজ্ঞপ্তি
            </span>
          </div>
          <div className="flex-1 overflow-hidden bg-[var(--color-active-bg)] py-1">
            <Marquee speed={40} gradient={false} pauseOnHover>
              <span className="flex items-center px-4 text-sm font-medium text-[var(--color-text)] sm:px-6 sm:text-base">
                লিখিত ৭০, বহুনির্বাচনী ৩০; পূর্ণমান ১০০; সময় ৩ ঘণ্টা; পরীক্ষার
                ফি ও অন্যন্য খরচ বাবদ ৩০ টাকা ধার্য করা হয়েছে। নির্ধারিত সময়ের
                মধ্যে উপস্থিত হওয়ার জন্য আদেশ করা হলো{" "}
                <TfiLayoutLineSolid className="h-6 w-12 sm:h-8 sm:w-16" />
              </span>
            </Marquee>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeExamNumber}-${selectedClass}-${selectedTeacher}`}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="px-2 sm:px-3 md:px-0"
        >
          {groupedByClass.length > 0 ? (
            isGuest ? (
              buildGuestContent()
            ) : (
              groupedByClass.map(({ className, exams }, groupIndex) => (
                <div key={className}>
                  <ClassGroupTitle
                    className={className}
                    index={groupIndex}
                    count={exams.length}
                  />
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:mb-10 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
                    {exams.map((exam, i) => renderCard(exam, i))}
                  </div>
                </div>
              ))
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-16 text-center sm:py-20"
            >
              <div className="mb-4">
                {isAwaitingNextExam ? (
                  <Fan className="mx-auto h-10 w-10 animate-spin text-[var(--color-gray)]" />
                ) : (
                  <span className="text-4xl">📭</span>
                )}
              </div>
              <p className="mb-5 text-md text-[var(--color-gray)] bangla md:text-xl">
                {isAwaitingNextExam
                  ? `পরীক্ষা নং ${toBn(activeExamNumber ?? "")} — এখনো কেউ ধারণা দেয়নি`
                  : selectedTeacher !== "all"
                    ? "এই শিক্ষকের কোনো ধারণা পাওয়া যায়নি"
                    : selectedClass !== "all"
                      ? "এই শ্রেণির কোনো পরীক্ষা পাওয়া যায়নি"
                      : "এই পরীক্ষার কোনো তথ্য পাওয়া যায়নি।"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {displayExamNumbers.length > 0 && activeExamNumber && (
        <div className="relative mt-8">
          <ExamPagination
            examNumbers={displayExamNumbers}
            selected={activeExamNumber}
            onSelect={isGuest ? () => {} : setSelectedExamNumber}
          />
          {isGuest && (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() => setShowLoginPrompt(true)}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {editTarget && (
          <EditModal
            key="edit"
            record={editTarget}
            onClose={() => setEditTarget(null)}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ["weekly-exams-all-teachers"] });
              qc.invalidateQueries({ queryKey: ["weekly-exams-filtered"] });
              qc.invalidateQueries({ queryKey: ["weekly-exams-meta"] });
            }}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete"
            record={deleteTarget}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
            isPending={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Guest Login Prompt */}
      <LoginPromptOverlay
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default WeeklyExam;
