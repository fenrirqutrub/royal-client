import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Exam } from "../../types/McqExam";
import {
  CLASSES,
  CLASS_NUMBER_MAP,
  normalizeStudentClass,
} from "../../utility/constants/class";
import DatePicker from "../../components/common/Datepicker";
import { formatDisplay } from "../../utility/Formatters";
import AnimatedFilterPills, {
  type FilterPillItem,
} from "../../components/common/AnimatedFilterPills";

type ViewType = "today" | "upcoming" | "completed";

interface Filters {
  view: ViewType;
  class: string;
  teacher: string;
  date: Date | null;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  exams: Exam[];
  isStaff: boolean;
}

interface TeacherInfo {
  id: string;
  name: string;
}

export const MCQFilterBar = ({
  filters,
  onChange,
  exams,
  isStaff,
}: FilterBarProps) => {
  const viewFilteredExams = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    return exams.filter((exam) => {
      const examDate = new Date(exam.examDate);
      if (filters.view === "today") {
        return examDate >= todayStart && examDate <= todayEnd;
      } else if (filters.view === "upcoming") {
        return examDate > todayEnd;
      } else {
        return examDate < todayStart;
      }
    });
  }, [exams, filters.view]);

  const availableClasses = useMemo(() => {
    const classesWithData = [
      ...new Set(viewFilteredExams.map((e) => e.studentClass)),
    ].filter((c): c is (typeof CLASSES)[number] =>
      CLASSES.includes(c as (typeof CLASSES)[number]),
    );

    // CLASS_NUMBER_MAP এর key order অনুযায়ী sort
    const classOrder = Object.keys(CLASS_NUMBER_MAP);

    return classesWithData.sort((a, b) => {
      const indexA = classOrder.indexOf(normalizeStudentClass(a));
      const indexB = classOrder.indexOf(normalizeStudentClass(b));
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [viewFilteredExams]);

  const availableTeachers = useMemo<TeacherInfo[]>(() => {
    if (!isStaff) return [];

    const teachersWithData = viewFilteredExams
      .map((e) => ({
        id: (e.postedBy?._id ||
          e.postedBy?.userId ||
          e.postedBy?.name ||
          "") as string,
        name: (e.postedBy?.name || "") as string,
      }))
      .filter((t): t is TeacherInfo => !!t.id && !!t.name);

    const seen = new Set<string>();
    return teachersWithData.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [viewFilteredExams, isStaff]);

  const getViewLabel = (): string => {
    if (filters.view === "today") return "আজকের";
    if (filters.view === "upcoming") return "আসন্ন";
    return "সম্পন্ন";
  };

  // ─── Pill items ────────────────────────────

  const classPillItems = useMemo<FilterPillItem[]>(
    () =>
      availableClasses.map((className) => ({
        id: className,
        label: className,
        title: className,
      })),
    [availableClasses],
  );

  const teacherPillItems = useMemo<FilterPillItem[]>(
    () =>
      availableTeachers.map((teacher) => ({
        id: teacher.id,
        label: teacher.name,
        title: teacher.name,
      })),
    [availableTeachers],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 space-y-4"
    >
      {/* ── Class Filter ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {availableClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="bangla px-1 text-xs font-semibold tracking-wide text-[var(--color-gray)] uppercase">
              শ্রেণি ({getViewLabel()})
            </h3>

            <AnimatedFilterPills
              items={classPillItems}
              activeId={filters.class}
              onChange={(id) => onChange({ ...filters, class: id })}
              showAll
              allId="all"
              allLabel="সকল"
              layoutId="mcq-class-filter"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Teacher Filter ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isStaff && availableTeachers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="bangla px-1 text-xs font-semibold tracking-wide text-[var(--color-gray)] uppercase">
              শিক্ষক
            </h3>

            <AnimatedFilterPills
              items={teacherPillItems}
              activeId={filters.teacher}
              onChange={(id) => onChange({ ...filters, teacher: id })}
              showAll
              allId="all"
              allLabel="সকল"
              layoutId="mcq-teacher-filter"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Date Filter ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {filters.view === "completed" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="bangla text-xs font-semibold tracking-wide text-[var(--color-gray)] uppercase">
                তারিখ
              </h3>

              {filters.date && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onChange({ ...filters, date: null })}
                  className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <X size={10} />
                  <span className="bangla">সরান</span>
                </motion.button>
              )}
            </div>

            <DatePicker
              label=""
              value={filters.date ? formatDisplay(filters.date) : ""}
              onChange={() => {}}
              onDateChange={(d: Date | null) =>
                onChange({ ...filters, date: d })
              }
              selectedDate={filters.date}
              placeholder="তারিখ বেছে নিন"
              maxDate={new Date()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
