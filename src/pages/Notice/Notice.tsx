// Notice.tsx
import Marquee from "react-fast-marquee";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";

const DEFAULT_NOTICE =
  "    রয়েল একাডেমি, বেলকুচি শাখার অফিসিয়াল ওয়েবসাইটে আপনাকে স্বাগতম। আমাদের সকল কার্যক্রম যথাসময়ে পরিচালিত হচ্ছে। যেকোনো তথ্যের জন্য অফিসে যোগাযোগ করুন। —    ";

interface NoticeItem {
  _id: string;
  noticeSlug: string;
  notice: string;
  durationDays: number;
  expiresAt: string;
}

const Notice = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["active-notice"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/notices/active");
      return res.data.data as NoticeItem | null;
    },
    // ✅ 60 সেকেন্ড পর্যন্ত cache থেকে দেখাবে, বারবার fetch হবে না
    staleTime: 60 * 1000,
    // ✅ background-এ প্রতি 60 সেকেন্ডে একবার refetch
    refetchInterval: 60 * 1000,
    // ✅ tab focus হলে refetch করবে না (অতিরিক্ত call বন্ধ)
    refetchOnWindowFocus: false,
  });

  const isActive =
    !isLoading && !!data && new Date(data.expiresAt) > new Date();

  const displayText = isLoading
    ? "..."
    : isActive
      ? data!.notice
      : DEFAULT_NOTICE;

  // ❌ refetch() এখানে ছিল — এটাই infinite loop করছিল, সরানো হয়েছে

  return (
    <div className="flex items-center bangla bg-[var(--color-active-bg)] border-y border-[var(--color-active-border)]">
      {/* Label — left */}
      <div className="shrink-0 px-4 py-2 font-bold text-md md:text-lg tracking-wide z-10 select-none text-[var(--color-bg)] bg-[var(--color-text)] rounded">
        নোটিশ
      </div>

      {/* Marquee */}
      <Marquee direction="left" speed={50} gradient={false} pauseOnHover={true}>
        <span className="text-lg md:text-xl font-medium text-[var(--color-text)]">
          {displayText}
        </span>
      </Marquee>
    </div>
  );
};

export default Notice;
