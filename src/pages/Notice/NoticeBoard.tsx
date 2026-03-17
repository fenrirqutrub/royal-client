// NoticeBoard.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import axiosPublic from "../../hooks/axiosPublic";
import NoticeModal, { type NoticeItem } from "./NoticeModal";
import { EmptyState } from "../../components/common/Emptystate";
import ErrorState from "../../components/ui/Errorstate";
import Loader from "../../components/ui/Loader";
import { Pagination } from "../../components/common/Pagination";
import { toBn } from "../../utility/shared";

const HOME_LIMIT = 5;
const PAGE_LIMIT = 10;

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// Returns true if notice has NOT yet expired
const isStillActive = (expiresAt: string) => new Date(expiresAt) > new Date();

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
  const [hovered, setHovered] = useState(false);
  const active = isStillActive(item.expiresAt);

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.button
        onClick={onClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="w-full text-left relative overflow-hidden"
        style={{ outline: "none", background: "none", border: "none" }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Hover fill */}
        <motion.div
          initial={false}
          animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--color-active-bg)",
            transformOrigin: "left",
            borderRadius: "10px",
          }}
        />

        <div
          className="relative flex items-center gap-5 px-4 py-4 sm:py-5"
          style={{ borderBottom: "1px solid var(--color-active-border)" }}
        >
          {/* Index */}
          <motion.span
            animate={{
              color: hovered ? "var(--color-text)" : "var(--color-gray)",
              scale: hovered ? 1.15 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="shrink-0 w-7 text-sm bangla tabular-nums select-none font-bold"
          >
            {toBn(String(index + 1).padStart(2, "0"))}
          </motion.span>

          {/* Notice text */}
          <motion.p
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-w-0 text-sm sm:text-[15px] leading-snug font-medium truncate"
            style={{ color: "var(--color-text)" }}
          >
            {item.notice}
          </motion.p>

          {/* Active badge + expiry date */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0.55 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 hidden sm:flex items-center gap-2"
          >
            {/* Active / Expired pill */}
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: active
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(239,68,68,0.10)",
                color: active ? "#10b981" : "#f87171",
                border: `1px solid ${active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              {active ? "সক্রিয়" : "মেয়াদ শেষ"}
            </span>

            {/* Expiry date */}
            <span
              className="text-xs font-mono tabular-nums"
              style={{ color: "var(--color-gray)" }}
            >
              {fmt(item.expiresAt)}
            </span>
          </motion.div>

          {/* Arrow */}
          <motion.span
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            →
          </motion.span>
        </div>
      </motion.button>
    </motion.div>
  );
};

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ value }: { value: number }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.5 }}
  >
    {toBn(value)}
  </motion.span>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const NoticeBoard = () => {
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const isNoticePage = location.pathname === "/notice";

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

  // ── Pagination logic (only for /notice) ──────────────────────────────────
  const totalPages = useMemo(
    () => Math.ceil((notices?.length ?? 0) / PAGE_LIMIT),
    [notices],
  );

  const visibleNotices = useMemo(() => {
    if (!notices) return [];
    if (!isNoticePage) return notices.slice(0, HOME_LIMIT);
    const start = (currentPage - 1) * PAGE_LIMIT;
    return notices.slice(start, start + PAGE_LIMIT);
  }, [notices, isNoticePage, currentPage]);

  const hasMore = !isNoticePage && (notices?.length ?? 0) > HOME_LIMIT;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="pt-3"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full mx-auto">
        {/* ── Header ── */}
        {isNoticePage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 rounded-2xl px-6 py-6 sm:px-8 sm:py-7"
            style={{
              backgroundColor: "var(--color-active-bg)",
              border: "1px solid var(--color-active-border)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="text-3xl sm:text-4xl font-bold leading-none text-[var(--color-text)] bangla tracking-wider"
              >
                নোটিশ বোর্ড
              </motion.h1>

              {!isLoading && !isError && notices?.length ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.4,
                    type: "spring",
                    bounce: 0.4,
                  }}
                  className="flex flex-col items-center justify-center rounded-xl px-4 py-3"
                  style={{
                    border: "1px solid var(--color-active-border)",
                    backgroundColor: "var(--color-bg)",
                    minWidth: "56px",
                  }}
                >
                  <span
                    className="text-2xl sm:text-3xl font-bold font-mono tabular-nums leading-none"
                    style={{ color: "var(--color-text)" }}
                  >
                    <Counter value={notices.length} />
                  </span>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        )}

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
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {/* Column header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex items-center gap-5 px-4 py-3 rounded-lg bg-[var(--color-active-bg)] border border-[var(--color-active-border)] mb-4 text-xl bangla"
            >
              <span
                className="w-7 shrink-0 text-lg tracking-widest"
                style={{ color: "var(--color-gray)", opacity: 0.5 }}
              >
                নং
              </span>
              <span
                className="flex-1 text-center tracking-widest"
                style={{ color: "var(--color-gray)", opacity: 0.5 }}
              >
                নোটিশ
              </span>
              <span
                className="hidden sm:block shrink-0 tracking-widest"
                style={{ color: "var(--color-gray)", opacity: 0.5 }}
              >
                অবস্থা / মেয়াদ
              </span>
              <span className="w-5 shrink-0" />
            </motion.div>

            {/* Rows */}
            <AnimatePresence initial={false}>
              {visibleNotices.map((item, i) => (
                <NoticeRow
                  key={item._id}
                  item={item}
                  index={isNoticePage ? (currentPage - 1) * PAGE_LIMIT + i : i}
                  onClick={() => setSelectedNotice(item)}
                />
              ))}
            </AnimatePresence>

            {/* ── Show More (homepage only) ── */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.35 }}
                className="mt-6 flex justify-end"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/notice")}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bangla transition-all bg-[var(--color-active-bg)] text-[var(--color-text)] border border-[var(--color-active-border)]"
                >
                  আরও দেখুন →
                </motion.button>
              </motion.div>
            )}

            {/* ── Pagination (/notice page only) ── */}
            {isNoticePage && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <NoticeModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </div>
  );
};

export default NoticeBoard;
