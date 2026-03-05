import { useQuery } from "@tanstack/react-query";

import WeeklyExamCard from "./WeeklyExamCard";
import axiosPublic from "../../hooks/axiosPublic";

interface WeeklyExamData {
  _id: string;
  slug: string;
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  date: string;
  ExamNumber: string;
  topics: string;
  images: { imageUrl: string; publicId: string }[];
  createdAt: string;
}

const WeeklyExam = () => {
  const { data, isLoading, isError } = useQuery<WeeklyExamData[]>({
    queryKey: ["weekly-exams"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/weekly-exams");
      return res.data.data;
    },
  });

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
      <header className="text-center bangla">
        <h1 className="text-xl md:text-5xl font-bold text-[var(--color-text)]">
          পরীক্ষার ধারণা
        </h1>
      </header>
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 px-3 md:px-0">
        {data && data.length > 0 ? (
          data.map((exam, i) => (
            <WeeklyExamCard key={exam._id} exam={exam} index={i} />
          ))
        ) : (
          <p className="text-slate-400 text-center py-10">
            কোনো পরীক্ষার তথ্য পাওয়া যায়নি।
          </p>
        )}
      </section>
    </div>
  );
};

export default WeeklyExam;
