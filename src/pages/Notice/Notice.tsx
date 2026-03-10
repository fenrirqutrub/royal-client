// Notice.tsx
import Marquee from "react-fast-marquee";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";

// ── Default notice shown when no active DB notice exists ──────────────────────
const DEFAULT_NOTICE =
  "রয়্যাল একাডেমিতে আপনাকে স্বাগতম। আমাদের সকল কার্যক্রম যথাসময়ে পরিচালিত হচ্ছে। যেকোনো তথ্যের জন্য অফিসে যোগাযোগ করুন।";

interface NoticeItem {
  _id: string;
  noticeSlug: string;
  notice: string;
  expiresAt: string;
}

const Notice = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["active-notice"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/notices/active");
      return res.data.data as NoticeItem | null;
    },

    refetchInterval: 5 * 60 * 1000,
  });

  // While loading keep marquee running with a subtle placeholder
  const displayText = isLoading ? "..." : data ? data.notice : DEFAULT_NOTICE;

  return (
    <div className="flex items-center bg-gray-100 text-[var(--color-text)] bangla">
      {/* Label */}
      <div className="shrink-0 bg-[var(--color-text)] text-[var(--color-bg)] px-4 py-2 font-bold text-xl md:text-2xl tracking-wide z-10">
        নোটিসঃ
      </div>

      {/* Marquee */}
      <Marquee direction="left" speed={50} gradient={false} pauseOnHover={true}>
        <span className="text-xl md:text-2xl font-medium mx-8">
          {displayText}
        </span>
      </Marquee>
    </div>
  );
};

export default Notice;
