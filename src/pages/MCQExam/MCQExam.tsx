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
import { toBn, formatDisplay } from "../../utility/Formatters";
import { CLASSES } from "../../utility/constants/class";
import { useGuestPreview } from "../../hooks/useGuestPreview";
import LoginPromptOverlay from "../Admin/Auth/LoginPromptOverlay";
import { Link, useNavigate } from "react-router";
import type { Exam, ExamStatus } from "../../types/McqExam";
import { useAuth } from "../../context/AuthContext";
import { ExamDetailModal } from "./ExamDetailModal";
import { ClassSection } from "./ClassSection";
import EmptyState from "../../components/common/Emptystate";
import { STAFF_DASHBOARD_ROLES } from "../../utility/constants/role";
import DatePicker from "../../components/common/Datepicker";

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
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  // ✅ Past exam filters
  const [selectedPastDate, setSelectedPastDate] = useState<Date | null>(null);

  // ✅ Toggle between Upcoming & Completed
  const [viewMode, setViewMode] = useState<"upcoming" | "completed">(
    "upcoming",
  );

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

  // ── 1. Data fetch ──
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

  // ── 2. Auto-select teacher for staff ──
  useEffect(() => {
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

  // ── Reset date filter when view mode changes ──
  useEffect(() => {
    if (viewMode === "upcoming") {
      setSelectedPastDate(null);
    }
  }, [viewMode]);

  /* ── Teacher options ── */
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

  /* ── Separate Active (Today + Upcoming) and Past exams ── */
  const { activeExams, pastExams } = useMemo(() => {
    const active: Exam[] = [];
    const past: Exam[] = [];

    teacherFilteredExams.forEach((exam) => {
      const status = getExamStatus(exam.examDate);
      if (status === "today" || status === "upcoming") {
        active.push(exam);
      } else {
        past.push(exam);
      }
    });

    // Sort active by date (earliest first)
    active.sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    );

    // Sort past by date (latest first)
    past.sort(
      (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
    );

    return { activeExams: active, pastExams: past };
  }, [teacherFilteredExams]);

  /* ── Filter active exams by class ── */
  const filteredActiveExams = useMemo(() => {
    if (activeClass === "all") return activeExams;
    return activeExams.filter((e) => e.studentClass === activeClass);
  }, [activeExams, activeClass]);

  /* ── Filter past exams by class + date ─ */
  const filteredPastExams = useMemo(() => {
    let result = pastExams;

    // Class filter
    if (activeClass !== "all") {
      result = result.filter((e) => e.studentClass === activeClass);
    }

    // Date filter
    if (selectedPastDate) {
      result = result.filter((e) => {
        const examDate = new Date(e.examDate);
        return (
          examDate.getDate() === selectedPastDate.getDate() &&
          examDate.getMonth() === selectedPastDate.getMonth() &&
          examDate.getFullYear() === selectedPastDate.getFullYear()
        );
      });
    }

    return result;
  }, [pastExams, activeClass, selectedPastDate]);

  /* ── Class filter items (based on current view) ── */
  const examCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    CLASSES.forEach((cls) => {
      map[cls] = 0;
    });
    const sourceExams = viewMode === "upcoming" ? activeExams : pastExams;
    sourceExams.forEach((exam) => {
      map[exam.studentClass] = (map[exam.studentClass] || 0) + 1;
    });
    return map;
  }, [activeExams, pastExams, viewMode]);

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

  const classesWithExams = useMemo(() => {
    const sourceExams =
      viewMode === "upcoming" ? filteredActiveExams : filteredPastExams;
    return CLASSES.filter((cls) =>
      sourceExams.some((e) => e.studentClass === cls),
    );
  }, [filteredActiveExams, filteredPastExams, viewMode]);

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

  // Current view exams
  const currentExams =
    viewMode === "upcoming" ? filteredActiveExams : filteredPastExams;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full">
        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileQuestionMark size={30} className="text-[var(--color-text)]" />
            <div>
              <h1 className="bangla text-xl lg:text-3xl font-bold text-[var(--color-text)]">
                MCQ পরীক্ষা
              </h1>
            </div>
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
            {/* ── ✅ Flexible Row Layout ── */}
            <div className="mb-4">
              {/* Desktop: One Row | Mobile: Stacked */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
                {/* Toggle Buttons - Centered on mobile, left on desktop */}
                <div className="flex items-center justify-center lg:justify-start gap-2 lg:flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode("upcoming")}
                    className={`bangla flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all flex-shrink-0 ${
                      viewMode === "upcoming"
                        ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-md"
                        : "border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] hover:border-[var(--color-text)]/30"
                    }`}
                  >
                    <Clock size={16} />
                    আসন্ন পরীক্ষা
                    <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      {toBn(activeExams.length)}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode("completed")}
                    className={`bangla flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all flex-shrink-0 ${
                      viewMode === "completed"
                        ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-md"
                        : "border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] hover:border-[var(--color-text)]/30"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    সম্পন্ন পরীক্ষা
                    <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      {toBn(pastExams.length)}
                    </span>
                  </motion.button>
                </div>

                {/* Filters - Full width on mobile, flexible on desktop */}
                <div
                  className={`flex-1 grid gap-3 lg:gap-4 ${isStaff ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
                >
                  {/* Teacher filter — শুধু staff দেখবে */}
                  {isStaff && (
                    <div className="relative min-w-0">
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

                  {/* ✅ DatePicker — শুধু Completed view এ দেখাবে */}
                  {viewMode === "completed" && (
                    <div className="relative min-w-0">
                      <DatePicker
                        label="তারিখ নির্বাচন করুন"
                        value={
                          selectedPastDate
                            ? formatDisplay(selectedPastDate)
                            : ""
                        }
                        onChange={() => {}}
                        onDateChange={(date) => setSelectedPastDate(date)}
                        selectedDate={selectedPastDate}
                        placeholder="যে দিনের পরীক্ষা দেখতে চান"
                        maxDate={new Date()}
                      />
                      {isGuest && (
                        <div
                          className="absolute inset-0 z-10 cursor-pointer"
                          onClick={() => setShowLoginPrompt(true)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─ Class Filter ── */}
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
                  key={`${activeClass}-${selectedTeacher}-${selectedPastDate?.toDateString()}-${viewMode}`}
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="flex shrink-0 justify-center items-center gap-2 rounded border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-2 w-full bangla text-sm lg:text-lg font-bold text-[var(--color-gray)]"
                >
                  <span>
                    {activeClass === "all" ? "সকল ক্লাস" : activeClass}
                  </span>

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

                  {viewMode === "completed" && selectedPastDate && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} className="opacity-60" />
                        {formatDisplay(selectedPastDate)}
                      </span>
                    </>
                  )}

                  <span className="opacity-40">•</span>
                  <span>
                    {viewMode === "upcoming" ? "আসন্ন" : "সম্পন্ন"}{" "}
                    {toBn(currentExams.length)}টি
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── EXAMS CONTENT ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${activeClass}-${selectedTeacher}-${selectedPastDate?.toDateString()}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                {currentExams.length > 0 ? (
                  activeClass === "all" ? (
                    classesWithExams.length === 0 ? (
                      <EmptyState
                        icon={
                          viewMode === "upcoming" ? (
                            <Clock className="w-10 h-10 text-[var(--color-gray)]" />
                          ) : (
                            <CheckCircle2 className="w-10 h-10 text-[var(--color-gray)]" />
                          )
                        }
                        title={
                          viewMode === "upcoming"
                            ? "কোনো আসন্ন পরীক্ষা নেই"
                            : selectedPastDate
                              ? "এই তারিখে কোনো পরীক্ষা নেই"
                              : "কোনো সম্পন্ন পরীক্ষা নেই"
                        }
                        message={
                          selectedPastDate
                            ? "অন্য তারিখ বেছে নিন অথবা ক্লিয়ার বাটন চাপুন"
                            : "পরবর্তীতে পরীক্ষা যোগ হলে এখানে দেখা যাবে"
                        }
                      />
                    ) : (
                      <div className="space-y-8">
                        {classesWithExams.map((cls) => {
                          const classExams = currentExams.filter(
                            (e) => e.studentClass === cls,
                          );
                          return (
                            <div key={cls}>
                              <div className="mb-3 items-center gap-3 flex shrink-0 justify-center rounded border border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-2 w-full bangla text-sm lg:text-lg font-bold text-[var(--color-gray)]">
                                <span className="bangla font-bold text-base lg:text-xl text-[var(--color-text)]">
                                  {cls}
                                </span>
                                <span className="bangla text-xs text-[var(--color-gray)] border border-[var(--color-active-border)] bg-[var(--color-active-bg)] rounded-full px-3 py-1">
                                  {toBn(classExams.length)}টি
                                </span>
                              </div>

                              <ClassSection
                                exams={classExams}
                                onSelect={handleSelect}
                                type={viewMode}
                                selectedDate={
                                  viewMode === "completed"
                                    ? selectedPastDate
                                    : null
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    <ClassSection
                      exams={currentExams}
                      onSelect={handleSelect}
                      type={viewMode}
                      selectedDate={
                        viewMode === "completed" ? selectedPastDate : null
                      }
                    />
                  )
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-8"
                  >
                    {viewMode === "upcoming" ? (
                      <>
                        <Clock size={24} className="text-[var(--color-gray)]" />
                        <div>
                          <p className="bangla text-base font-bold text-[var(--color-text)]">
                            কোনো আসন্ন পরীক্ষা নেই
                          </p>
                          <p className="bangla text-sm text-[var(--color-gray)] mt-1">
                            সম্পন্ন পরীক্ষা দেখতে উপরের বাটন চাপুন
                          </p>
                        </div>
                      </>
                    ) : selectedPastDate ? (
                      <>
                        <CalendarDays
                          size={24}
                          className="text-[var(--color-gray)]"
                        />
                        <div>
                          <p className="bangla text-base font-bold text-[var(--color-text)]">
                            {formatDisplay(selectedPastDate)} তারিখে কোনো
                            পরীক্ষা নেই
                          </p>
                          <p className="bangla text-sm text-[var(--color-gray)] mt-1">
                            অন্য তারিখ বেছে নিন অথবা ক্লিয়ার বাটন চাপুন
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={24}
                          className="text-[var(--color-gray)]"
                        />
                        <div>
                          <p className="bangla text-base font-bold text-[var(--color-text)]">
                            কোনো সম্পন্ন পরীক্ষা নেই
                          </p>
                          <p className="bangla text-sm text-[var(--color-gray)] mt-1">
                            আসন্ন পরীক্ষা দেখতে উপরের বাটন চাপুন
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
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
