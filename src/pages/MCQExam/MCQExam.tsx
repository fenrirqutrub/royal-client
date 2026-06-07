// src/components/mcq/MCQExam.tsx

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  FileQuestionMark,
  User,
} from "lucide-react";
import axiosPublic from "../../hooks/axiosPublic";
import AnimatedFilterPills from "../../components/common/AnimatedFilterPills";
import SelectInput from "../../components/common/SelectInput";
import { toBn } from "../../utility/Formatters";
import { CLASSES } from "../../utility/constants/class";
import { useGuestPreview } from "../../hooks/useGuestPreview";
import LoginPromptOverlay from "../Admin/Auth/LoginPromptOverlay";
import { Link, useNavigate } from "react-router";
import type { Exam, ExamStatus, StatusFilter } from "../../types/McqExam";
import { useAuth } from "../../context/AuthContext";
import { ExamDetailModal } from "./ExamDetailModal";
import { ClassSection } from "./ClassSection";
import EmptyState from "../../components/common/Emptystate";
import { STAFF_DASHBOARD_ROLES } from "../../utility/constants/role";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

export const getExamStatus = (examDate: string): ExamStatus => {
  const now = new Date();
  const date = new Date(examDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (examDay.getTime() === todayStart.getTime()) return "today";
  if (examDay > todayStart) return "upcoming";
  return "past";
};

export const getAvatarUrl = (
  avatar: string | { url?: string } | null | undefined,
): string => {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  if (typeof avatar === "object" && avatar?.url) return avatar.url;
  return "";
};

/* ═══════════════════════════════════════════
   Reusable UI
   ═══════════════════════════════════════════ */
const SkeletonCard = ({ height = "h-16" }: { height?: string }) => (
  <div
    className={`${height} animate-pulse rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]`}
  />
);

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */
const MCQExam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeClass, setActiveClass] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const { isGuest } = useGuestPreview();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ── Staff check ──
  const isStaff = !!user && STAFF_DASHBOARD_ROLES.includes(user.role);

  // ── Guest select handler ──
  const handleSelect = (exam: Exam) => {
    if (isGuest) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedExam(exam);
  };

  // ── 1. Data fetch (user এর জন্য অপেক্ষা করে না) ──
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axiosPublic.get("/api/mcq-exams");
        const data: Exam[] = res.data?.data || [];
        setExams(data);
      } catch (error) {
        console.error("MCQ fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // ── 2. exams + user দুটোই ready হলে teacher auto-select ──
  useEffect(() => {
    // data নেই বা student/guest হলে skip
    if (!exams.length || !isStaff || !user) return;

    const ownEntry = exams.find((e) => {
      const poster = e.postedBy;
      if (!poster) return false;
      return (
        poster.userId === user.id ||
        poster._id === user.id ||
        poster.name === user.name
      );
    });

    const posterId = ownEntry?.postedBy
      ? (ownEntry.postedBy._id ??
        ownEntry.postedBy.userId ??
        ownEntry.postedBy.name)
      : null;

    if (posterId) {
      setSelectedTeacher(posterId);
    }
  }, [exams, user, isStaff]);

  // ── Reset class filter when teacher changes ──
  useEffect(() => {
    setActiveClass("all");
  }, [selectedTeacher]);

  // ── Reset class filter when status changes ──
  useEffect(() => {
    setActiveClass("all");
  }, [statusFilter]);

  /* ── Teacher options derived from exam posters ── */
  const teacherOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [
      { value: "all", label: "সকল শিক্ষক" },
    ];

    exams.forEach((exam) => {
      const poster = exam.postedBy;
      if (!poster) return;
      const id = poster._id ?? poster.userId ?? poster.name;
      if (!id || seen.has(id)) return;
      seen.add(id);
      options.push({ value: id, label: poster.name });
    });

    return options;
  }, [exams]);

  /* ── Exams filtered by teacher ── */
  const teacherFilteredExams = useMemo(() => {
    if (!isStaff) return exams;
    if (selectedTeacher === "all") return exams;
    return exams.filter((e) => {
      const poster = e.postedBy;
      if (!poster) return false;
      const id = poster._id ?? poster.userId ?? poster.name;
      return id === selectedTeacher;
    });
  }, [exams, selectedTeacher, isStaff]);

  const examCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    CLASSES.forEach((cls) => {
      map[cls] = 0;
    });
    teacherFilteredExams.forEach((exam) => {
      const s = getExamStatus(exam.examDate);
      const isUpcoming = s === "today" || s === "upcoming";
      const isPast = s === "past";
      if (statusFilter === "upcoming" && isUpcoming) {
        map[exam.studentClass] = (map[exam.studentClass] || 0) + 1;
      } else if (statusFilter === "finished" && isPast) {
        map[exam.studentClass] = (map[exam.studentClass] || 0) + 1;
      }
    });
    return map;
  }, [teacherFilteredExams, statusFilter]);

  const classFilterItems = useMemo(
    () =>
      CLASSES.filter((cls) => (examCountMap[cls] || 0) > 0).map((cls) => ({
        id: cls,
        title: cls,
        className: "",
        label: <span>{cls}</span>,
      })),
    [examCountMap],
  );

  const filteredExams = useMemo(() => {
    let result =
      activeClass === "all"
        ? teacherFilteredExams
        : teacherFilteredExams.filter((e) => e.studentClass === activeClass);

    if (statusFilter === "upcoming") {
      result = result.filter((e) => {
        const s = getExamStatus(e.examDate);
        return s === "today" || s === "upcoming";
      });
    } else if (statusFilter === "finished") {
      result = result.filter((e) => getExamStatus(e.examDate) === "past");
    }

    return result;
  }, [teacherFilteredExams, activeClass, statusFilter]);

  const selectedStats = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let past = 0;
    filteredExams.forEach((e) => {
      const s = getExamStatus(e.examDate);
      if (s === "today") today++;
      else if (s === "upcoming") upcoming++;
      else past++;
    });
    return { today, upcoming, past, total: filteredExams.length };
  }, [filteredExams]);

  const totalStats = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let past = 0;
    exams.forEach((e) => {
      const s = getExamStatus(e.examDate);
      if (s === "today") today++;
      else if (s === "upcoming") upcoming++;
      else past++;
    });
    return { today, upcoming, past, total: exams.length };
  }, [exams]);

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "upcoming",
        label: `আসন্ন পরীক্ষা (${toBn(totalStats.today + totalStats.upcoming)})`,
        icon: <Clock size={14} />,
      },
      {
        value: "finished",
        label: `সম্পন্ন পরীক্ষা (${toBn(totalStats.past)})`,
        icon: <CheckCircle2 size={14} />,
      },
    ],
    [totalStats.today, totalStats.upcoming, totalStats.past],
  );

  // ── Classes that have exams (for "all" view) ──
  const classesWithExams = useMemo(
    () =>
      CLASSES.filter((cls) =>
        filteredExams.some((e) => e.studentClass === cls),
      ),
    [filteredExams],
  );

  useEffect(() => {
    if (!selectedExam) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedExam(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedExam]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full">
        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileQuestionMark size={30} className="text-[var(--color-text)]" />
            <div>
              <h1 className="bangla text-xl lg:text-3xl font-bold text-[var(--color-text)]">
                আজকের MCQ পরীক্ষা
              </h1>
            </div>
          </div>

          <div className="relative mb-6 flex items-start justify-between">
            {!loading && exams.length > 0 && totalStats.today > 0 && (
              <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none">
                <span className="bangla text-5xl lg:text-7xl font-bold leading-none text-[var(--color-gray)] opacity-10">
                  {toBn(totalStats.today)}/{toBn(totalStats.total)}
                </span>
              </div>
            )}
          </div>

          <div>
            <Link to="/dashboard/add-mcq-exam">
              <span className="bg-[var(--color-text)] text-[var(--color-bg)] text-2xl px-3 rounded">
                +
              </span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard height="h-12" />
            <SkeletonCard height="h-12" />
            <div className="grid gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} height="h-[72px]" />
              ))}
            </div>
          </div>
        ) : exams.length === 0 ? (
          <EmptyState
            icon={
              <CalendarDays className="w-10 h-10 text-[var(--color-gray)]" />
            }
            title="কোনো পরীক্ষা পাওয়া যায়নি"
            message="পরবর্তীতে পরীক্ষা যোগ হলে এখানে দেখা যাবে"
          />
        ) : (
          <>
            {/* ── Filter row ── */}
            <div
              className={`mb-4 grid gap-3 ${isStaff ? "sm:grid-cols-2" : ""}`}
            >
              {/* Status filter */}
              <div className="relative">
                <SelectInput
                  label="পরীক্ষার ধরন"
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val as StatusFilter)}
                  placeholder="ফিল্টার নির্বাচন করুন"
                />
                {isGuest && (
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() => setShowLoginPrompt(true)}
                  />
                )}
              </div>

              {/* Teacher filter — শুধু staff দেখবে */}
              {isStaff && (
                <div className="relative">
                  <SelectInput
                    label="শিক্ষক"
                    options={teacherOptions}
                    value={selectedTeacher}
                    onChange={setSelectedTeacher}
                    disabled={teacherOptions.length <= 1}
                    placeholder="শিক্ষক নির্বাচন করুন"
                    icon={<User size={13} />}
                  />
                </div>
              )}
            </div>

            {/* ── Class Filter ── */}
            <div className="mb-5 relative overflow-hidden rounded border border-[var(--color-active-border)] p-2">
              <AnimatedFilterPills
                items={classFilterItems}
                activeId={activeClass}
                onChange={setActiveClass}
                showAll
                allId="all"
                allLabel={<span>সকল</span>}
                layoutId="mcq-class-filter"
              />
              {isGuest && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={() => setShowLoginPrompt(true)}
                />
              )}
            </div>

            {/* ── Active filter summary badge ── */}
            <div className="mb-5 flex justify-center items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeClass}-${statusFilter}-${selectedTeacher}`}
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="flex shrink-0 justify-center items-center gap-2 rounded border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-2 w-full bangla text-sm lg:text-lg font-bold text-[var(--color-gray)]"
                >
                  <span>
                    {activeClass === "all" ? "সকল ক্লাস" : activeClass}
                  </span>

                  {/* Staff + নির্দিষ্ট teacher select থাকলে badge এ দেখাবে */}
                  {isStaff && selectedTeacher !== "all" && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="flex items-center gap-1">
                        <User size={13} className="opacity-60" />
                        {
                          teacherOptions.find(
                            (t) => t.value === selectedTeacher,
                          )?.label
                        }
                      </span>
                    </>
                  )}

                  <span className="opacity-40">•</span>
                  <span>
                    {statusFilter === "upcoming" ? "আসন্ন" : "সম্পন্ন"}{" "}
                    {toBn(selectedStats.total)}টি
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeClass}-${statusFilter}-${selectedTeacher}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                {activeClass === "all" ? (
                  // ── Show each class separately ──
                  classesWithExams.length === 0 ? (
                    <EmptyState
                      icon={
                        <CalendarDays className="w-10 h-10 text-[var(--color-gray)]" />
                      }
                      title={
                        statusFilter === "upcoming"
                          ? "কোনো আসন্ন পরীক্ষা নেই"
                          : "কোনো সম্পন্ন পরীক্ষা নেই"
                      }
                      message="পরবর্তীতে পরীক্ষা যোগ হলে এখানে দেখা যাবে"
                    />
                  ) : (
                    <div className="space-y-8">
                      {classesWithExams.map((cls) => {
                        const classExams = filteredExams.filter(
                          (e) => e.studentClass === cls,
                        );
                        return (
                          <div key={cls}>
                            {/* ── Class Header ── */}
                            <div className="mb-3 flex items-center gap-3">
                              <span className="bangla font-bold text-base lg:text-xl text-[var(--color-text)]">
                                {cls}
                              </span>
                              <span className="bangla text-xs text-[var(--color-gray)] border border-[var(--color-active-border)] bg-[var(--color-active-bg)] rounded-full px-3 py-1">
                                {toBn(classExams.length)}টি
                              </span>
                              <div className="flex-1 h-px bg-[var(--color-active-border)]" />
                            </div>

                            {/* ── ClassSection for this class ── */}
                            <ClassSection
                              exams={classExams}
                              onSelect={handleSelect}
                              statusFilter={statusFilter}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  // ── Show single class ──
                  <ClassSection
                    exams={filteredExams}
                    onSelect={handleSelect}
                    statusFilter={statusFilter}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedExam && (
          <ExamDetailModal
            exam={selectedExam}
            onClose={() => setSelectedExam(null)}
            userRole={user?.role}
            onEdit={(exam) => navigate(`/dashboard/edit-mcq-exam/${exam._id}`)}
            onDelete={async (exam) => {
              await axiosPublic.delete(`/api/mcq-exams/${exam._id}`);
              setExams((prev) => prev.filter((e) => e._id !== exam._id));
            }}
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

export default MCQExam;
