// Notice.tsx
import Marquee from "react-fast-marquee";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";
// import { Link } from "react-router";

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

  const isActive = !isLoading && !!data;

  const displayText = isLoading
    ? "..."
    : isActive
      ? `এতদ্বারা সকলের অবগতির জন্য জানানো যাইতেছে যে, ${data!.notice}`
      : DEFAULT_NOTICE;

  return (
    <div
      className="flex items-center bangla"
      style={{
        backgroundColor: "var(--color-active-bg)",
        borderTop: "1px solid var(--color-active-border)",
        borderBottom: "1px solid var(--color-active-border)",
      }}
    >
      {/* Label — left */}
      <div
        className="shrink-0 px-4 py-2 font-bold text-xl md:text-2xl tracking-wide z-10 select-none"
        style={{
          backgroundColor: "var(--color-text)",
          color: "var(--color-bg)",
        }}
      >
        নোটিসঃ
      </div>

      {/* Marquee */}
      <Marquee direction="left" speed={50} gradient={false} pauseOnHover={true}>
        <span
          className="text-xl md:text-2xl font-medium "
          style={{ color: "var(--color-text)" }}
        >
          {displayText}
        </span>
      </Marquee>

      {/* Label — right */}
      {/* <Link to="/notice">
        <div
          className="shrink-0 px-4 py-2 font-bold text-xl md:text-2xl tracking-wide z-10 transition-opacity duration-150 hover:opacity-80"
          style={{
            backgroundColor: "var(--color-text)",
            color: "var(--color-bg)",
          }}
        >
          বিস্তারিত
        </div>
      </Link> */}
    </div>
  );
};

export default Notice;
