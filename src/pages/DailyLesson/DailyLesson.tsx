import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import axiosPublic from "../../hooks/axiosPublic";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/Emptystate";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useGuestPreview } from "../../hooks/useGuestPreview";
import LoginPromptOverlay from "../Admin/Auth/LoginPromptOverlay";
import { BN_DAYS_FULL, BN_MONTHS, toBn } from "../../utility/Formatters";
import {
  DeleteModal,
  EditModal,
  resolveTeacherSlug,
  type DailyLessonData,
} from "./DailyLessonUpdateModals";
import DailyLessonCard from "./DailyLessonCard";
import { useNavigate } from "react-router";
import DailyLessonHeader from "./DailyLessonHeader";
import { Helmet } from "react-helmet-async";
import {
  CLASS_ORDER,
  normalizeStudentClass,
} from "../../utility/constants/class";
import {
  PRIVILEGED_ROLES,
  STAFF_DASHBOARD_ROLES,
  type UserRole,
} from "../../utility/constants/role";

const GUEST_PREVIEW_CLASS = "ষষ্ঠ শ্রেণি";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatLessonDate = (iso: string): string => {
  const d = new Date(iso);
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${BN_DAYS_FULL[d.getDay()]}`;
};

const getTeacherDefault = (role?: UserRole, slug?: string) =>
  STAFF_DASHBOARD_ROLES.includes(role as UserRole) && slug ? slug : "all";

const toLocalDate = (value: string | Date) => {
  if (value instanceof Date)
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match)
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const isSameLocalDay = (a: string | Date, b: string | Date) => {
  const d1 = toLocalDate(a);
  const d2 = toLocalDate(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const toDateParam = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// const buildDateKey = (date: Date) =>
//   `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const getLessonSubject = (subject: unknown) => {
  if (typeof subject === "string") return subject.trim();
  if (subject && typeof subject === "object" && "name" in subject) {
    const name = (subject as { name?: string }).name;
    return typeof name === "string" ? name.trim() : "";
  }
  return "";
};

const normalizeClass = (cls?: string) => normalizeStudentClass(cls);
const matchesClass = (lessonClass?: string, selectedClass?: string) => {
  if (!selectedClass || selectedClass === "all") return true;
  return normalizeClass(lessonClass) === normalizeClass(selectedClass);
};

// ─── Animation Variants ───────────────────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.015, delayChildren: 0 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

const groupTitleVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: "easeOut" },
  }),
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

// ─── ClassGroupTitle ──────────────────────────────────────────────────────────
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
    className="relative mb-5 mt-8 overflow-hidden rounded bangla sm:mt-10 border-y border-[var(--color-active-border)]"
  >
    <div className="flex flex-1 flex-col items-center justify-center gap-x-10 bg-[var(--color-active-bg)] px-4 py-3.5 sm:flex-row sm:gap-x-10 sm:px-5 sm:py-4">
      <h2 className="text-lg font-extrabold leading-tight text-[var(--color-text)] sm:text-xl md:text-2xl">
        {className}
      </h2>
      <span className="text-xs font-black text-[var(--color-gray)] sm:text-sm border-x border-[var(--color-active-border)] px-5">
        {toBn(count)}টি পাঠ
      </span>
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DailyLesson = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { isGuest } = useGuestPreview();
  const navigate = useNavigate();

  const userRole = (user?.role ?? "student") as UserRole;
  const userSlug = user?.slug ?? "";
  const isManager = PRIVILEGED_ROLES.includes(userRole);
  const isStaff = STAFF_DASHBOARD_ROLES.includes(userRole);

  const defaultTeacherFilter = useMemo(
    () => getTeacherDefault(userRole, userSlug),
    [userRole, userSlug],
  );

  // ─── State ────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const prevDefaultRef = useRef("all");

  const [editTarget, setEditTarget] = useState<DailyLessonData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyLessonData | null>(
    null,
  );
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ─── Sync teacher default ─────────────────────────────────────────────────
  useEffect(() => {
    const prevDefault = prevDefaultRef.current;
    setSelectedTeacher((prev) =>
      prev === prevDefault ? defaultTeacherFilter : prev,
    );
    prevDefaultRef.current = defaultTeacherFilter;
  }, [defaultTeacherFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ─── Date param ───────────────────────────────────
  const dateParam = useMemo(() => toDateParam(selectedDate), [selectedDate]);

  // DailyLesson.tsx — শুধু query অংশ পরিবর্তন

  const {
    data = [],
    isPending,
    isError,
    isFetching,
  } = useQuery<DailyLessonData[]>({
    queryKey: ["daily-lessons", dateParam],
    queryFn: async () => {
      const params: Record<string, string> = { date: dateParam };
      const res = await axiosPublic.get("/api/daily-lesson", { params });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchInterval: false,

    placeholderData: (prev) => prev ?? [],
  });

  useEffect(() => {
    if (isFetching) {
      console.time("fetch");
    } else {
      console.timeEnd("fetch");
    }
  }, [isFetching]);

  // ─── Active Dates Query — calendar highlight ────────────────
  const activeDatesQuery = useQuery<string[]>({
    queryKey: [
      "daily-lesson-active-dates",
      selectedClass,
      selectedTeacher,
      selectedSubject,
    ],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedClass !== "all") params.class = selectedClass;
      if (selectedTeacher !== "all") params.teacherSlug = selectedTeacher;
      if (selectedSubject !== "all") params.subject = selectedSubject;
      const res = await axiosPublic.get("/api/daily-lesson/active-dates", {
        params,
      });
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const activeDates = useMemo(() => {
    return new Set<string>(activeDatesQuery.data ?? []);
  }, [activeDatesQuery.data]);

  const teacherBaseData = useMemo(() => {
    let result = data;
    if (selectedClass !== "all")
      result = result.filter((l) => matchesClass(l.class, selectedClass));
    if (selectedSubject !== "all")
      result = result.filter(
        (l) =>
          getLessonSubject(
            (l as DailyLessonData & { subject?: unknown }).subject,
          ) === selectedSubject,
      );
    return result;
  }, [data, selectedClass, selectedSubject]);

  const teacherOptions = useMemo(() => {
    const map = new Map<string, string>();
    teacherBaseData.forEach((l) => {
      const name =
        typeof l.teacher === "object" && l.teacher?.name
          ? l.teacher.name
          : typeof l.teacher === "string"
            ? l.teacher
            : "";
      const slug = resolveTeacherSlug(l.teacher, l.teacherSlug);
      if (name && slug) map.set(slug, name);
    });
    if (userRole !== "student" && userSlug && !map.has(userSlug)) {
      map.set(userSlug, user?.name || "আমার পাঠ");
    }
    return [
      { value: "all", label: "সকল শিক্ষক" },
      ...Array.from(map.entries()).map(([slug, name]) => ({
        value: slug,
        label: name,
      })),
    ];
  }, [teacherBaseData, userRole, userSlug, user?.name]);

  const subjectBaseData = useMemo(() => {
    let result = data;
    if (selectedClass !== "all")
      result = result.filter((l) => matchesClass(l.class, selectedClass));
    if (selectedTeacher !== "all")
      result = result.filter(
        (l) => resolveTeacherSlug(l.teacher, l.teacherSlug) === selectedTeacher,
      );
    return result;
  }, [data, selectedClass, selectedTeacher]);

  const subjectOptions = useMemo(() => {
    const subjects = new Map<string, string>();
    subjectBaseData.forEach((lesson) => {
      const subject = getLessonSubject(
        (lesson as DailyLessonData & { subject?: unknown }).subject,
      );
      if (subject) subjects.set(subject, subject);
    });
    if (subjects.size === 0) return [];
    return [
      { value: "all", label: "সকল বিষয়" },
      ...Array.from(subjects.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    ];
  }, [subjectBaseData]);

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedClass !== "all")
      result = result.filter((l) => matchesClass(l.class, selectedClass));
    if (selectedTeacher !== "all")
      result = result.filter(
        (l) => resolveTeacherSlug(l.teacher, l.teacherSlug) === selectedTeacher,
      );
    if (selectedSubject !== "all")
      result = result.filter(
        (l) =>
          getLessonSubject(
            (l as DailyLessonData & { subject?: unknown }).subject,
          ) === selectedSubject,
      );
    return result;
  }, [data, selectedClass, selectedTeacher, selectedSubject]);

  const groupedByClass = useMemo(() => {
    const map = new Map<string, DailyLessonData[]>();
    filteredData.forEach((l) => {
      const nc = normalizeStudentClass(l.class);
      if (!map.has(nc)) map.set(nc, []);
      map.get(nc)!.push(l);
    });
    map.forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    return Array.from(map.entries())
      .sort(([a], [b]) => (CLASS_ORDER[a] ?? 99) - (CLASS_ORDER[b] ?? 99))
      .map(([className, lessons]) => ({ className, lessons }));
  }, [filteredData]);

  const availableClasses = useMemo(() => {
    const classKeys = Object.keys(CLASS_ORDER).filter(
      (key) => typeof key === "string" && key.trim() !== "",
    );
    return [
      { id: "all", label: "সকল শ্রেণি" },
      ...classKeys.map((cls) => ({ id: String(cls), label: String(cls) })),
    ];
  }, []);

  const isToday = useMemo(
    () => isSameLocalDay(selectedDate, new Date()),
    [selectedDate],
  );

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (!isToday) c++;
    if (selectedClass !== "all") c++;
    if (selectedTeacher !== defaultTeacherFilter) c++;
    if (selectedSubject !== "all") c++;
    return c;
  }, [
    isToday,
    selectedClass,
    selectedTeacher,
    selectedSubject,
    defaultTeacherFilter,
  ]);

  // ─── Auto reset invalid filters ─────────────────────
  useEffect(() => {
    if (selectedSubject === "all") return;
    if (!subjectOptions.some((o) => o.value === selectedSubject))
      setSelectedSubject("all");
  }, [subjectOptions, selectedSubject]);

  useEffect(() => {
    if (selectedTeacher === "all") return;
    if (!teacherOptions.some((o) => o.value === selectedTeacher))
      setSelectedTeacher(defaultTeacherFilter);
  }, [teacherOptions, selectedTeacher, defaultTeacherFilter]);

  // ─── Permissions ──────────────────────
  const getLessonPermissions = (lesson: DailyLessonData) => {
    if (isGuest) return { canEdit: false, canDelete: false };
    if (isManager) return { canEdit: true, canDelete: true };
    const slug = resolveTeacherSlug(lesson.teacher, lesson.teacherSlug);
    const isOwn = userRole === "teacher" && slug === userSlug;
    return { canEdit: isOwn, canDelete: isOwn };
  };

  // ─── Handlers ─────────────────────────────
  const handleReset = () => {
    setSelectedDate(new Date());
    setSelectedClass("all");
    setSelectedTeacher(defaultTeacherFilter);
    setSelectedSubject("all");
  };

  const handleDateChange = (date: Date | null) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime()))
      return;
    if (date.getTime() === 0) {
      setSelectedDate(new Date());
      return;
    }
    setSelectedDate(toLocalDate(date));
  };

  const getClassLabel = (classId: string) => {
    if (classId.includes("৬ষ্ঠ")) return "ষষ্ঠ";
    if (classId.includes("৭ম")) return "সপ্তম";
    if (classId.includes("৮ম")) return "অষ্টম";
    if (classId.includes("৯ম")) return "নবম";
    if (classId.includes("১০ম")) return "দশম";
    return classId;
  };

  // ─── Delete Mutation ────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosPublic.delete(`/api/daily-lesson/${id}`),
    onSuccess: () => {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে");
      qc.invalidateQueries({ queryKey: ["daily-lessons"] });
      setDeleteTarget(null);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) =>
      toast.error(
        err?.response?.data?.message || err?.message || "মুছতে ব্যর্থ হয়েছে",
      ),
  });

  // ─── Guest Content ──────────────────────────────
  const buildGuestContent = () => {
    const class6 = groupedByClass.find(
      ({ className }) => className === GUEST_PREVIEW_CLASS,
    );
    if (!class6)
      return (
        <p className="py-8 text-center text-sm text-[var(--color-gray)] bangla">
          আজকের ৬ষ্ঠ শ্রেণির কোনো পাঠ পাওয়া যায়নি।
        </p>
      );
    return (
      <div>
        <ClassGroupTitle
          className={class6.className}
          index={0}
          count={class6.lessons.length}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3"
        >
          {class6.lessons.slice(0, 2).map((lesson, i) => (
            <motion.div key={lesson._id} variants={fadeUp}>
              <DailyLessonCard
                lesson={{ ...lesson, date: formatLessonDate(lesson.date) }}
                index={i}
                canEdit={false}
                canDelete={false}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  };

  // ─── Loading — শুধু প্রথমবার skeleton ─────────────────────────────────────
  if (isPending) return <Skeleton variant="daily-lesson" />;

  // ─── Render ─────────────────────────
  return (
    <div className="relative mx-auto max-w-7xl">
      <Helmet>
        <title>আজকের পড়া — Royal Academy</title>
        <meta
          name="description"
          content="Royal Academy-র দৈনিক পাঠ, শ্রেণিভিত্তিক বিষয় ও শিক্ষকের নির্দেশনা।"
        />
        <meta property="og:title" content="আজকের পড়া — Royal Academy" />
        <meta
          property="og:description"
          content="প্রতিদিনের পাঠ, নির্দেশনা ও বিষয়ভিত্তিক প্রস্তুতি।"
        />
      </Helmet>
      {/* subtle fetching indicator */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-hover)] animate-pulse" />
      )}

      <DailyLessonHeader
        isGuest={isGuest}
        isStaff={isStaff}
        title="আজকের পড়া"
        description="প্রতিদিনের পাঠ, নির্দেশনা ও বিষয়ভিত্তিক প্রস্তুতি"
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        activeDates={activeDates}
        selectedTeacher={selectedTeacher}
        onTeacherChange={setSelectedTeacher}
        teacherOptions={teacherOptions}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        subjectOptions={subjectOptions}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        availableClasses={availableClasses}
        totalLessons={data.length}
        filteredCount={filteredData.length}
        activeFilterCount={activeFilterCount}
        onAddLesson={() => navigate("/dashboard/add-daily-lesson")}
        onReset={handleReset}
        onGuestAction={() => setShowLoginPrompt(true)}
      />

      {isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center bangla sm:py-20"
        >
          <div className="mb-3 text-4xl">⚠️</div>
          <p className="text-sm text-[var(--color-gray)] sm:text-base">
            ডেটা লোড করতে সমস্যা হয়েছে।
          </p>
          <Button
            onClick={() => qc.refetchQueries({ queryKey: ["daily-lessons"] })}
            className="mt-4 bangla"
          >
            পুনরায় চেষ্টা করুন
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${dateParam}-${selectedClass}-${selectedTeacher}-${selectedSubject}`}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-2 sm:px-3 md:px-0"
          >
            {isFetching ? (
              <Skeleton variant="daily-lesson" />
            ) : groupedByClass.length > 0 ? (
              isGuest ? (
                buildGuestContent()
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {groupedByClass.map(({ className, lessons }, groupIndex) => (
                    <motion.div key={className} variants={fadeUp}>
                      <ClassGroupTitle
                        className={className}
                        index={groupIndex}
                        count={lessons.length}
                      />
                      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3">
                        {lessons.map((lesson, i) => {
                          const { canEdit, canDelete } =
                            getLessonPermissions(lesson);
                          return (
                            <motion.div
                              key={lesson._id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                  delay: i * 0.02,
                                  duration: 0.18,
                                  ease: "easeOut",
                                },
                              }}
                            >
                              <DailyLessonCard
                                lesson={{
                                  ...lesson,
                                  date: formatLessonDate(lesson.date),
                                }}
                                index={i}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                onEdit={
                                  canEdit
                                    ? () => setEditTarget(lesson)
                                    : undefined
                                }
                                onDelete={
                                  canDelete
                                    ? () => setDeleteTarget(lesson)
                                    : undefined
                                }
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )
            ) : isGuest ? (
              <EmptyState
                message="এই তারিখে কোনো পাঠ নেই"
                action={
                  <Button onClick={handleReset} className="bangla">
                    আজকের পাঠ দেখুন
                  </Button>
                }
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="py-14 text-center sm:py-20"
              >
                <div className="mb-5 text-5xl sm:text-6xl">📭</div>
                <p className="mb-5 text-sm text-[var(--color-gray)] bangla sm:text-base">
                  {selectedSubject !== "all"
                    ? `${selectedSubject} বিষয়ের কোনো পাঠ পাওয়া যায়নি`
                    : selectedTeacher !== "all"
                      ? "এই শিক্ষকের কোনো পাঠ পাওয়া যায়নি"
                      : selectedClass !== "all"
                        ? `${getClassLabel(selectedClass)} শ্রেণির কোনো পাঠ পাওয়া যায়নি`
                        : "এই তারিখে কোনো পাঠ নেই"}
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {(selectedClass !== "all" ||
                    selectedTeacher !== defaultTeacherFilter ||
                    selectedSubject !== "all" ||
                    !isToday) && (
                    <Button
                      onClick={handleReset}
                      variant="secondary"
                      className="bangla"
                    >
                      সকল ফিল্টার সরান
                    </Button>
                  )}
                  {!isToday && (
                    <Button onClick={handleReset} className="bangla">
                      আজকের পাঠ দেখুন
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {editTarget && !isGuest && (
          <EditModal
            key="edit"
            record={editTarget}
            onClose={() => setEditTarget(null)}
            onSuccess={() =>
              qc.invalidateQueries({ queryKey: ["daily-lessons"] })
            }
          />
        )}
        {deleteTarget && !isGuest && (
          <DeleteModal
            key="delete"
            record={deleteTarget}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
            isPending={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>

      <LoginPromptOverlay
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default DailyLesson;
