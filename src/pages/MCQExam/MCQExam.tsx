// MCQExam.tsx
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  FileQuestionMark,
  Sun,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import axiosPublic from "../../hooks/axiosPublic";
import type { Exam } from "../../types/McqExam";
import { MCQExamDetailModal } from "./MCQExamDetailModal";
import { MCQExamEditModal } from "./MCQExamEditModal";
import { STAFF_DASHBOARD_ROLES } from "../../utility/constants/role";
import { CLASSES } from "../../utility/constants/class";
import { toBn } from "../../utility/Formatters";
import toast from "react-hot-toast";
import { MCQExamCard } from "./MCQExamCard";
import AnimatedFilterPills from "../../components/common/AnimatedFilterPills";
import ErrorState from "../../components/common/ErrorState";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/Emptystate";
import DatePicker from "../../components/common/Datepicker";

// ─── View type ───────────────────────────────────────────────────────────────
// "today"     → আজকের (রাত ১২:০০ AM – দুপুর ১২:০০ PM)
// "tomorrow"  → আগামীকাল (সবসময় দেখা যায়)
// "upcoming"  → ২+ দিন পরের exams
// "completed" → গতকাল বা আগের exams
type ViewType = "today" | "tomorrow" | "upcoming" | "completed";

interface Filters {
  view: ViewType;
  class: string;
  teacher: string;
  date: Date | null;
  dateDisplay: string;
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** রাত ১২:০০ AM – দুপুর ১২:০০ PM এর মধ্যে আছে কিনা */
const isInTodayWindow = (): boolean => {
  const h = new Date().getHours();
  return h >= 0 && h < 12;
};

/** Default view: সকালে "today", দুপুরের পর "tomorrow" */
const defaultView = (): ViewType => (isInTodayWindow() ? "today" : "tomorrow");

const MCQExam = () => {
  const { user } = useAuth();

  // ─── Real-time time window tracking ────────────────────────────────────────
  const [showTodayTab, setShowTodayTab] = useState<boolean>(isInTodayWindow);

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [filters, setFilters] = useState<Filters>({
    view: defaultView(),
    class: "all",
    teacher: "all",
    date: null,
    dateDisplay: "",
  });

  const isStaff = !!user && STAFF_DASHBOARD_ROLES.includes(user.role);

  // ─── Real-time interval: প্রতি মিনিটে চেক ──────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const nowInWindow = isInTodayWindow();

      setShowTodayTab(nowInWindow);

      // দুপুর ১২টায় user "today" তে থাকলে "tomorrow" তে shift করো
      setFilters((prev) => {
        if (!nowInWindow && prev.view === "today") {
          return {
            ...prev,
            view: "tomorrow",
            class: "all",
            teacher: "all",
            date: null,
            dateDisplay: "",
          };
        }
        return prev;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosPublic.get("/api/mcq-exams");
        setExams(res.data?.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("ডেটা লোড করতে সমস্যা হয়েছে");
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // ─── Date boundary helpers ─────────────────────────────────────────────────
  const dateBounds = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    return { todayStart, todayEnd, tomorrowStart, tomorrowEnd };
  }, []);

  // ─── Categorize ────────────────────────────────────────────────────────────
  const categorizedExams = useMemo(() => {
    const { todayStart, todayEnd, tomorrowStart, tomorrowEnd } = dateBounds;

    const result: Record<ViewType, Exam[]> = {
      today: [],
      tomorrow: [],
      upcoming: [],
      completed: [],
    };

    exams.forEach((exam) => {
      const d = new Date(exam.examDate);
      if (d >= todayStart && d <= todayEnd) {
        result.today.push(exam);
      } else if (d >= tomorrowStart && d <= tomorrowEnd) {
        result.tomorrow.push(exam);
      } else if (d > tomorrowEnd) {
        result.upcoming.push(exam);
      } else {
        result.completed.push(exam);
      }
    });

    (Object.values(result) as Exam[][]).forEach((list) =>
      list.sort(
        (a, b) =>
          new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
      ),
    );

    return result;
  }, [exams, dateBounds]);

  // ─── Derived filter options ────────────────────────────────────────────────
  const uniqueClasses = useMemo(() => {
    const viewExams = categorizedExams[filters.view];
    const seen = new Set(viewExams.map((e) => e.studentClass).filter(Boolean));
    return CLASSES.filter((c) => seen.has(c));
  }, [categorizedExams, filters.view]);

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filteredExams = useMemo(() => {
    let result = categorizedExams[filters.view];
    if (filters.class !== "all") {
      result = result.filter((exam) => exam.studentClass === filters.class);
    }
    if (isStaff && filters.teacher !== "all") {
      result = result.filter((exam) => {
        const teacherId = exam.postedBy?._id || exam.postedBy?.userId;
        return teacherId === filters.teacher;
      });
    }
    if (filters.date && filters.view === "completed") {
      result = result.filter((exam) => {
        const examDate = new Date(exam.examDate);
        return examDate.toDateString() === filters.date!.toDateString();
      });
    }
    return result;
  }, [categorizedExams, filters, isStaff]);

  // ─── Group by class ────────────────────────────────────────────────────────
  const groupedByClass = useMemo(() => {
    const groups: Record<string, Exam[]> = {};
    filteredExams.forEach((exam) => {
      const key = exam.studentClass || "অন্যান্য";
      if (!groups[key]) groups[key] = [];
      groups[key].push(exam);
    });
    const classList = CLASSES as readonly string[];
    return Object.entries(groups).sort(([a], [b]) => {
      const iA = classList.indexOf(a),
        iB = classList.indexOf(b);
      if (iA === -1 && iB === -1) return a.localeCompare(b);
      if (iA === -1) return 1;
      if (iB === -1) return -1;
      return iA - iB;
    });
  }, [filteredExams]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = async (exam: Exam) => {
    try {
      await axiosPublic.delete(`/api/mcq-exams/${exam._id}`);
      setExams((prev) => prev.filter((e) => e._id !== exam._id));
      toast.success("পরীক্ষা মুছে ফেলা হয়েছে");
    } catch {
      toast.error("মুছতে সমস্যা হয়েছে");
    }
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(null);
    setEditingExam(exam);
  };

  const handleUpdate = async (updatedExam: Partial<Exam> & { _id: string }) => {
    const res = await axiosPublic.put(
      `/api/mcq-exams/${updatedExam._id}`,
      updatedExam,
    );
    const fresh = res.data?.data || res.data;
    setExams((prev) =>
      prev.map((e) => (e._id === updatedExam._id ? { ...e, ...fresh } : e)),
    );
    toast.success("পরীক্ষা আপডেট হয়েছে");
  };

  const handleRetry = () => window.location.reload();

  const handleViewChange = (id: string) => {
    setFilters({
      view: id as ViewType,
      class: "all",
      teacher: "all",
      date: null,
      dateDisplay: "",
    });
  };

  // ─── View pill items (time-aware) ──────────────────────────────────────────
  const viewPillItems = useMemo(() => {
    const items: { id: string; label: React.ReactNode }[] = [];

    // রাত ১২:০০ AM – দুপুর ১২:০০ PM → "আজকের" দেখাবে
    if (showTodayTab) {
      items.push({
        id: "today",
        label: (
          <span className="flex items-center gap-1.5">
            <Sun size={14} /> আজকের ({toBn(categorizedExams.today.length)})
          </span>
        ),
      });
    }

    // "আগামীকাল" সবসময় দেখাবে
    items.push({
      id: "tomorrow",
      label: (
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> আগামীকাল (
          {toBn(categorizedExams.tomorrow.length)})
        </span>
      ),
    });

    items.push({
      id: "upcoming",
      label: (
        <span className="flex items-center gap-1.5">
          <Clock size={14} /> upcoming ({toBn(categorizedExams.upcoming.length)}
          )
        </span>
      ),
    });

    items.push({
      id: "completed",
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircle size={14} /> completed (
          {toBn(categorizedExams.completed.length)})
        </span>
      ),
    });

    return items;
  }, [categorizedExams, showTodayTab]);

  const classPillItems = useMemo(
    () => uniqueClasses.map((c) => ({ id: c, label: c })),
    [uniqueClasses],
  );

  const emptyStateMap: Record<
    ViewType,
    { title: string; icon: React.ReactNode }
  > = {
    today: {
      title: "আজ কোনো পরীক্ষা নেই",
      icon: <Sun size={40} className="text-[var(--color-gray)]" />,
    },
    tomorrow: {
      title: "আগামীকাল কোনো পরীক্ষা নেই",
      icon: <Calendar size={40} className="text-[var(--color-gray)]" />,
    },
    upcoming: {
      title: "কোনো আসন্ন পরীক্ষা নেই",
      icon: <Clock size={40} className="text-[var(--color-gray)]" />,
    },
    completed: {
      title: "কোনো সম্পন্ন পরীক্ষা নেই",
      icon: <CheckCircle size={40} className="text-[var(--color-gray)]" />,
    },
  };

  // ──────────────────── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[var(--color-text)]">
              <FileQuestionMark size={28} className="text-[var(--color-bg)]" />
            </div>
            <div>
              <h1 className="bangla text-xl font-bold text-[var(--color-text)]">
                MCQ পরীক্ষা
              </h1>
              <p className="bangla text-sm text-[var(--color-gray)]">
                সকল পরীক্ষার তথ্য
              </p>
            </div>
          </div>
          {isStaff && (
            <Link to="/dashboard/add-mcq-exam">
              <button className="flex items-center gap-2 rounded-lg bg-[var(--color-text)] px-4 py-2 text-sm font-bold text-[var(--color-bg)]">
                <Plus size={16} />
                <span className="bangla hidden sm:inline">নতুন পরীক্ষা</span>
              </button>
            </Link>
          )}
        </div>

        {/* Filters */}
        {!loading && !error && (
          <div className="mb-6 space-y-3">
            <section className="flex flex-col lg:flex-row justify-center lg:justify-between flex-wrap gap-3">
              <AnimatedFilterPills
                items={viewPillItems}
                activeId={filters.view}
                onChange={handleViewChange}
                showAll={false}
                layoutId="view-filter"
              />
              {uniqueClasses.length > 0 && (
                <AnimatedFilterPills
                  items={classPillItems}
                  activeId={filters.class}
                  onChange={(id) =>
                    setFilters((prev) => ({ ...prev, class: id }))
                  }
                  showAll
                  allId="all"
                  allLabel="সকল শ্রেণি"
                  layoutId="class-filter"
                />
              )}
            </section>

            <AnimatePresence>
              {filters.view === "completed" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <DatePicker
                    value={filters.dateDisplay}
                    onChange={(display) =>
                      setFilters((prev) => ({ ...prev, dateDisplay: display }))
                    }
                    onDateChange={(date) =>
                      setFilters((prev) => ({ ...prev, date }))
                    }
                    selectedDate={filters.date}
                    placeholder="তারিখ দিয়ে ফিল্টার করুন"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Skeleton variant="daily-lesson" />
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20"
            >
              <ErrorState message={error} />
              <div className="flex justify-center pb-6">
                <button
                  onClick={handleRetry}
                  className="rounded-lg bg-[var(--color-text)] px-5 py-2 text-sm font-bold text-[var(--color-bg)] transition-transform hover:scale-105"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            </motion.div>
          )}

          {!loading && !error && filteredExams.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                title={emptyStateMap[filters.view].title}
                icon={emptyStateMap[filters.view].icon}
              />
            </motion.div>
          )}

          {!loading && !error && filteredExams.length > 0 && (
            <motion.div
              key="grouped-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {groupedByClass.map(([className, classExams], groupIndex) => (
                <ClassGroupSection
                  key={className}
                  className={className}
                  exams={classExams}
                  index={groupIndex}
                  onExamClick={setSelectedExam}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Detail Modal ═══ */}
      <AnimatePresence>
        {selectedExam && (
          <MCQExamDetailModal
            exam={selectedExam}
            onClose={() => setSelectedExam(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            userRole={user?.role}
          />
        )}
      </AnimatePresence>

      {/* ═══ Edit Modal ═══ */}
      <AnimatePresence>
        {editingExam && (
          <MCQExamEditModal
            exam={editingExam}
            onClose={() => setEditingExam(null)}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ClassGroupSection ────────────────────────────────────────────────────────
const ClassGroupSection = ({
  className,
  exams,
  index,
  onExamClick,
}: {
  className: string;
  exams: Exam[];
  index: number;
  onExamClick: (exam: Exam) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="space-y-3"
  >
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] shadow-sm"
    >
      <div className="flex items-center justify-center gap-4 px-4 py-3">
        <h2 className="bangla text-lg font-bold text-[var(--color-text)]">
          {className}
        </h2>
        <span className="text-[var(--color-gray)]">|</span>
        <span className="bangla text-sm font-medium text-[var(--color-gray)]">
          {toBn(exams.length)}টি পরীক্ষা
        </span>
      </div>
    </motion.div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam, i) => (
        <MCQExamCard
          key={exam._id}
          exam={exam}
          index={i}
          onClick={() => onExamClick(exam)}
        />
      ))}
    </div>
  </motion.div>
);

export default MCQExam;
