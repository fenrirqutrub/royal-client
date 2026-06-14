import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, User } from "lucide-react";
import type { Exam } from "../../types/McqExam";
import { CLASSES } from "../../utility/constants/class";
import SelectInput from "../../components/common/SelectInput";
import DatePicker from "../../components/common/Datepicker";
import { formatDisplay } from "../../utility/Formatters";

interface FilterBarProps {
  filters: {
    view: "upcoming" | "past";
    class: string;
    teacher: string;
    date: Date | null;
  };
  onChange: (filters: any) => void;
  exams: Exam[];
  isStaff: boolean;
}

export const MCQFilterBar = ({
  filters,
  onChange,
  exams,
  isStaff,
}: FilterBarProps) => {
  // Get unique classes from exams
  const classOptions = useMemo(() => {
    const uniqueClasses = [...new Set(exams.map((e) => e.studentClass))].filter(
      (c) => CLASSES.includes(c),
    );
    return [
      { value: "all", label: "সকল শ্রেণি" },
      ...uniqueClasses.map((c) => ({ value: c, label: c })),
    ];
  }, [exams]);

  // Get unique teachers from exams
  const teacherOptions = useMemo(() => {
    if (!isStaff) return [];
    const uniqueTeachers = [
      ...new Set(
        exams
          .map((e) => ({
            id: e.postedBy?._id || e.postedBy?.userId || e.postedBy?.name,
            name: e.postedBy?.name,
          }))
          .filter((t) => t.id && t.name),
      ),
    ];

    // Remove duplicates by id
    const seen = new Set();
    const filtered = uniqueTeachers.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    return [
      { value: "all", label: "সকল শিক্ষক" },
      ...filtered.map((t) => ({
        value: t.id as string,
        label: t.name as string,
      })),
    ];
  }, [exams, isStaff]);

  return (
    <div className="mb-6 space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <FilterButton
          active={filters.view === "upcoming"}
          onClick={() => onChange({ ...filters, view: "upcoming", date: null })}
          icon={Clock}
          label="আসন্ন"
        />
        <FilterButton
          active={filters.view === "past"}
          onClick={() => onChange({ ...filters, view: "past" })}
          icon={CheckCircle}
          label="সম্পন্ন"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Class Filter */}
        <SelectInput
          label="শ্রেণি"
          options={classOptions}
          value={filters.class}
          onChange={(v) => onChange({ ...filters, class: v })}
          placeholder="শ্রেণি বেছে নিন"
        />

        {/* Teacher Filter (Staff only) */}
        {isStaff && teacherOptions.length > 1 && (
          <SelectInput
            label="শিক্ষক"
            options={teacherOptions}
            value={filters.teacher}
            onChange={(v) => onChange({ ...filters, teacher: v })}
            placeholder="শিক্ষক বেছে নিন"
            icon={<User size={14} />}
          />
        )}

        {/* Date Filter (Past exams only) */}
        {filters.view === "past" && (
          <DatePicker
            label="তারিখ"
            value={filters.date ? formatDisplay(filters.date) : ""}
            onChange={() => {}}
            onDateChange={(d) => onChange({ ...filters, date: d })}
            selectedDate={filters.date}
            placeholder="তারিখ বেছে নিন"
            maxDate={new Date()}
          />
        )}
      </div>
    </div>
  );
};

// Filter Button Component
const FilterButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
      active
        ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-lg"
        : "border border-[var(--color-active-border)] bg-[var(--color-active-bg)] text-[var(--color-text)] hover:border-[var(--color-text)]/30"
    }`}
  >
    <Icon size={16} />
    <span className="bangla">{label}</span>
  </motion.button>
);
