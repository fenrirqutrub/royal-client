// MCQExam.tsx - Main component with compact spacing
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import axiosPublic from "../../hooks/axiosPublic";
import type { Exam } from "../../types/McqExam";
import { MCQExamDetailModal } from "./ExamDetailModal";
import { STAFF_DASHBOARD_ROLES } from "../../utility/constants/role";
import { toBn } from "../../utility/Formatters";
import toast from "react-hot-toast";
import { MCQFilterBar } from "./MCQFilterBar";
import { MCQExamCard } from "./MCQExamCard";

const MCQExam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [filters, setFilters] = useState({
    view: "upcoming" as "upcoming" | "past",
    class: "all",
    teacher: "all",
    date: null as Date | null,
  });

  const isStaff = user && STAFF_DASHBOARD_ROLES.includes(user.role);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axiosPublic.get("/api/mcq-exams");
        setExams(res.data?.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("ডেটা লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const { today, upcoming, past } = useMemo(() => {
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

    const result = {
      today: [] as Exam[],
      upcoming: [] as Exam[],
      past: [] as Exam[],
    };

    exams.forEach((exam) => {
      const examDate = new Date(exam.examDate);
      if (examDate >= todayStart && examDate <= todayEnd) {
        result.today.push(exam);
      } else if (examDate > todayEnd) {
        result.upcoming.push(exam);
      } else {
        result.past.push(exam);
      }
    });

    return result;
  }, [exams]);

  const filteredExams = useMemo(() => {
    let result = filters.view === "upcoming" ? [...today, ...upcoming] : past;

    if (filters.class !== "all") {
      result = result.filter((e) => e.studentClass === filters.class);
    }

    if (isStaff && filters.teacher !== "all") {
      result = result.filter((e) => {
        const id = e.postedBy?._id || e.postedBy?.userId || e.postedBy?.name;
        return id === filters.teacher;
      });
    }

    if (filters.date && filters.view === "past") {
      result = result.filter((e) => {
        const d = new Date(e.examDate);
        return d.toDateString() === filters.date!.toDateString();
      });
    }

    return result;
  }, [filters, today, upcoming, past, isStaff]);

  const handleDelete = async (exam: Exam) => {
    try {
      await axiosPublic.delete(`/api/mcq-exams/${exam._id}`);
      setExams((prev) => prev.filter((e) => e._id !== exam._id));
      toast.success("পরীক্ষা মুছে ফেলা হয়েছে");
    } catch (error) {
      toast.error("মুছতে সমস্যা হয়েছে");
      throw error;
    }
  };

  const handleEdit = (exam: Exam) => {
    navigate(`/dashboard/edit-mcq-exam/${exam._id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        {/* ✅ Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-text)] to-[var(--color-text)]/80"
            >
              <Sparkles size={20} className="text-[var(--color-bg)]" />
            </motion.div>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-text)] px-4 py-2 text-sm font-bold text-[var(--color-bg)]"
              >
                <Plus size={16} />
                <span className="bangla hidden sm:inline">নতুন পরীক্ষা</span>
              </motion.button>
            </Link>
          )}
        </motion.div>

        {/* ✅ Stats Cards - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 grid gap-3 sm:grid-cols-3"
        >
          <StatCard
            icon={Calendar}
            label="আজকের"
            count={today.length}
            color="bg-green-500"
          />
          <StatCard
            icon={Clock}
            label="আসন্ন"
            count={upcoming.length}
            color="bg-blue-500"
          />
          <StatCard
            icon={CheckCircle}
            label="সম্পন্ন"
            count={past.length}
            color="bg-[var(--color-gray)]"
          />
        </motion.div>

        {/* ✅ Filter Bar */}
        <MCQFilterBar
          filters={filters}
          onChange={setFilters}
          exams={exams}
          isStaff={!!isStaff}
        />

        {/* ✅ Exams List - Compact spacing */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState key="loading" />
          ) : filteredExams.length === 0 ? (
            <EmptyState key="empty" view={filters.view} />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredExams.map((exam, idx) => (
                <MCQExamCard
                  key={exam._id}
                  exam={exam}
                  index={idx}
                  onClick={() => setSelectedExam(exam)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Modal */}
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
    </div>
  );
};

const StatCard = ({ icon: Icon, label, count, color }: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="rounded-xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)] p-3"
  >
    <div className="flex items-center gap-2">
      <div className={`rounded-lg ${color} p-2`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="bangla text-lg font-bold text-[var(--color-text)]">
          {toBn(count)}
        </p>
        <p className="bangla text-xs text-[var(--color-gray)]">{label}</p>
      </div>
    </div>
  </motion.div>
);

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-2"
  >
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-16 animate-pulse rounded-xl bg-[var(--color-active-bg)]"
      />
    ))}
  </motion.div>
);

const EmptyState = ({ view }: { view: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-active-border)] bg-[var(--color-active-bg)] py-12"
  >
    <div className="mb-3 rounded-full bg-[var(--color-bg)] p-4">
      {view === "upcoming" ? (
        <Clock size={24} className="text-[var(--color-gray)]" />
      ) : (
        <CheckCircle size={24} className="text-[var(--color-gray)]" />
      )}
    </div>
    <p className="bangla mb-1 text-lg font-bold text-[var(--color-text)]">
      কোনো পরীক্ষা পাওয়া যায়নি
    </p>
    <p className="bangla text-sm text-[var(--color-gray)]">
      ফিল্টার পরিবর্তন করুন
    </p>
  </motion.div>
);

export default MCQExam;
