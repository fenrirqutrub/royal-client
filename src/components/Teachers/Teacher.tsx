// src/components/Teachers/Teacher.tsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import axiosPublic from "../../hooks/axiosPublic";
import TeacherCard, { type TeacherData } from "./TeacherCard";
import Card from "./Card";

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl mx-3 animate-pulse"
    style={{
      width: "130px",
      backgroundColor: "var(--color-active-bg)",
      border: "1px solid var(--color-active-border)",
    }}
  >
    <div
      className="w-14 h-14 rounded-xl"
      style={{ backgroundColor: "var(--color-active-border)" }}
    />
    <div className="w-full flex flex-col items-center gap-2">
      <div
        className="h-2.5 w-4/5 rounded-full"
        style={{ backgroundColor: "var(--color-active-border)" }}
      />
      <div
        className="h-2 w-1/2 rounded-full"
        style={{ backgroundColor: "var(--color-active-border)" }}
      />
    </div>
  </div>
);

const skeletons = Array.from({ length: 6 });

// ── Main ──────────────────────────────────────────────────────────────────────
const Teacher = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/teachers");
      // handle both { data: [...] } and direct array
      const result: TeacherData[] = res.data?.data ?? res.data ?? [];
      return result;
    },
  });

  const teachers = (data ?? []).filter(
    (t) => t.role !== "super-admin" && t.role !== "owner",
  );

  return (
    <section className="py-12 bg-[var(--color-bg)] ">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 mb-8 text-center"
      >
        <h2
          className="text-3xl sm:text-4xl font-bold bangla tracking-wider"
          style={{ color: "var(--color-text)" }}
        >
          শিক্ষক মন্ডলী
        </h2>
        <p className="text-xl md:text-2xl mt-2 bangla text-[var(--color-gray)] ">
          আমাদের অভিজ্ঞ ও দক্ষ শিক্ষকবৃন্দ
        </p>
      </motion.div>

      {/* Content */}
      {isError ? (
        <p className="text-center text-sm bangla text-[var(--color-gray)] ">
          তথ্য লোড করতে সমস্যা হয়েছে।
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          <Marquee pauseOnHover speed={40} gradient={false}>
            {isLoading
              ? skeletons.map((_, i) => <SkeletonCard key={i} />)
              : teachers.map((t) => <TeacherCard key={t._id} teacher={t} />)}
          </Marquee>
          <div>
            <Card />
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Teacher;
