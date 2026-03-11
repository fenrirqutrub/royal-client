// NoticeBoard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";
import NoticeModal, { type NoticeItem } from "./NoticeModal";
import { EmptyState } from "../../components/common/Emptystate";
import ErrorState from "../../components/ui/Errorstate";
import Loader from "../../components/ui/Loader";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ── Notice Row ────────────────────────────────────────────────────────────────
const NoticeRow = ({
  item,
  index,
  onClick,
}: {
  item: NoticeItem;
  index: number;
  onClick: () => void;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onClick}
      className="w-full text-left group"
    >
      <div
        className="grid items-center gap-4 px-5 py-4 border-b transition-colors duration-150"
        style={{
          borderColor: "var(--color-active-border)",
          gridTemplateColumns: "2rem 1fr auto",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.backgroundColor =
            "var(--color-active-bg)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.backgroundColor =
            "transparent")
        }
      >
        {/* SL */}
        <span
          className="text-xs tabular-nums font-mono text-right select-none"
          style={{ color: "var(--color-active-border)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Notice text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p
              className="text-sm truncate leading-snug transition-colors"
              style={{ color: "var(--color-text)" }}
            >
              {item.notice}
            </p>
            <p
              className="text-[10px] mt-0.5 font-mono tracking-wider"
              style={{ color: "var(--color-gray)" }}
            >
              {item.noticeSlug}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="text-right shrink-0 hidden sm:block">
          <span className="text-[11px] font-mono tabular-nums">
            {fmt(item.expiresAt)}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const NoticeBoard = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const {
    data: notices,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/notices");
      return res.data.data as NoticeItem[];
    },
  });

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="w-full mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {/* Title row */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-none">
              Notice Board
            </h1>
          </div>

          {/* Divider */}
          <div className="mt-4 h-px bg-[var(--color-active-border)] " />
        </motion.div>

        {/* ── Table header ── */}
        {!isLoading && !isError && notices?.length ? (
          <div
            className="grid items-center gap-4 px-5 pb-2 mb-1"
            style={{
              gridTemplateColumns: "2rem 1fr auto",
            }}
          >
            <span className="text-sm tracking-[0.2em] uppercase font-mono text-right text-[var(--color-active-border)] ">
              SL
            </span>
            <span className="text-sm tracking-[0.2em] uppercase font-mono text-center text-[var(--color-active-border)] ">
              Notice
            </span>
            <span className="text-sm tracking-[0.2em] uppercase font-mono hidden sm:block text-right text-[var(--color-active-border)] ">
              Date
            </span>
          </div>
        ) : null}

        {/* ── Content ── */}
        {isLoading ? (
          <Loader fullScreen={false} />
        ) : isError ? (
          <ErrorState
            title="Failed to load"
            message="Could not fetch notices. Please try again later."
            showBackButton={false}
            fullScreen={false}
          />
        ) : !notices?.length ? (
          <EmptyState
            title="No notices yet"
            message="No notices have been published yet. Check back later."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl overflow-hidden border"
            style={{
              borderColor: "var(--color-active-border)",
              backgroundColor: "var(--color-bg)",
              boxShadow: "0 8px 32px var(--color-shadow)",
            }}
          >
            <AnimatePresence initial={false}>
              {notices.map((item, i) => (
                <NoticeRow
                  key={item._id}
                  item={item}
                  index={i}
                  onClick={() => setSelectedSlug(item.noticeSlug)}
                />
              ))}
            </AnimatePresence>

            {/* Footer */}
            <div
              className="px-5 py-2.5 flex items-center justify-between"
              style={{
                backgroundColor: "var(--color-active-bg)",
                borderTop: "1px solid var(--color-active-border)",
              }}
            >
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--color-active-border)" }}
              >
                {notices.length} total
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <NoticeModal
        noticeSlug={selectedSlug}
        onClose={() => setSelectedSlug(null)}
      />
    </div>
  );
};

export default NoticeBoard;
