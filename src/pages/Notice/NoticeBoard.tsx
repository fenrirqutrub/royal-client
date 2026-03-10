// NoticeBoard.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axiosPublic from "../../hooks/axiosPublic";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface NoticeItem {
  _id: string;
  noticeSlug: string;
  notice: string;
  expiresAt: string;
  createdAt: string;
}

const isExpired = (iso: string) => new Date(iso) < new Date();

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ── PDF Modal ─────────────────────────────────────────────────────────────────
const NoticeModal = ({
  notice,
  onClose,
}: {
  notice: NoticeItem;
  onClose: () => void;
}) => {
  const pdfUrl = `${API_URL}/api/notices/${notice.noticeSlug}/pdf`;
  const expired = isExpired(notice.expiresAt);

  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#161616] border border-zinc-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl shadow-black/70 overflow-hidden"
        style={{ height: "88vh" }}
      >
        {/* ── modal top bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 shrink-0 bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            {/* left gold accent */}
            <div className="w-1 h-8 bg-[#f5c542] rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest text-[#f5c542] font-mono">
                  {notice.noticeSlug}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full border tracking-widest font-bold ${
                    expired
                      ? "bg-zinc-800 text-zinc-500 border-zinc-700"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {expired ? "EXPIRED" : "ACTIVE"}
                </span>
              </div>
              <div className="flex gap-3 mt-0.5">
                <span className="text-[10px] text-zinc-600 font-mono">
                  Issued: {fmt(notice.createdAt)}
                </span>
                <span className="text-zinc-700">·</span>
                <span
                  className={`text-[10px] font-mono ${
                    expired ? "text-zinc-600" : "text-amber-500/70"
                  }`}
                >
                  Expires: {fmt(notice.expiresAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* download */}
            <a
              href={pdfUrl}
              download={`${notice.noticeSlug}.pdf`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-[#f5c542] hover:bg-[#ffd966] text-black text-xs font-bold px-3 py-2 rounded-xl transition-colors tracking-wider"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              Download
            </a>
            {/* close */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── notice text preview ── */}
        <div className="px-5 py-3 border-b border-zinc-800/50 shrink-0 bg-[#0f0f0f]">
          <p className="text-[13px] text-zinc-400 leading-relaxed line-clamp-3">
            {notice.notice}
          </p>
        </div>

        {/* ── PDF iframe ── */}
        <div className="flex-1 min-h-0 flex flex-col bg-zinc-950">
          {/* bar above iframe */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/60 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#f5c542]" />
            <span className="text-[10px] text-zinc-600 tracking-widest uppercase">
              PDF Preview
            </span>
            <div className="flex-1" />
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors tracking-wider"
            >
              Open in new tab ↗
            </a>
          </div>

          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="flex-1 w-full border-0"
            title={`PDF — ${notice.noticeSlug}`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const NoticeBoard = () => {
  const [selected, setSelected] = useState<NoticeItem | null>(null);

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

  const activeCount =
    notices?.filter((n) => !isExpired(n.expiresAt)).length ?? 0;
  const expiredCount =
    notices?.filter((n) => isExpired(n.expiresAt)).length ?? 0;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-mono px-4 py-10">
      {/* ── header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[#f5c542] text-[10px] tracking-[0.35em] uppercase">
            Royal Academy
          </span>
          <div className="flex-1 h-px bg-[#f5c542]/20" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
            <p className="text-zinc-600 text-sm mt-1">
              Click any row to preview the official PDF notice.
            </p>
          </div>
          {/* summary pills */}
          {notices && notices.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                {activeCount} active
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700 px-3 py-1 rounded-full">
                {expiredCount} expired
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── table ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-4xl mx-auto bg-[#161616] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/50"
      >
        {/* table head */}
        <div className="grid grid-cols-[52px_1fr_116px_116px_68px] border-b border-zinc-700/60 bg-[#1c1c1c]">
          {["#", "Notice", "Issued", "Expires", "Status"].map((h) => (
            <div
              key={h}
              className="px-4 py-3 text-[9px] tracking-[0.2em] text-zinc-500 uppercase font-bold"
            >
              {h}
            </div>
          ))}
        </div>

        {/* states */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-[#f5c542]/30 border-t-[#f5c542] rounded-full"
            />
          </div>
        ) : isError ? (
          <p className="text-center text-red-400/70 text-sm py-14">
            Failed to load notices.
          </p>
        ) : !notices?.length ? (
          <div className="text-center py-14">
            <p className="text-zinc-700 text-sm">No notices published yet.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notices.map((item, i) => {
              const expired = isExpired(item.expiresAt);
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.035 }}
                  onClick={() => setSelected(item)}
                  className={`grid grid-cols-[52px_1fr_116px_116px_68px] border-b border-zinc-800/50 last:border-0 cursor-pointer group transition-all duration-150 ${
                    expired
                      ? "opacity-40 hover:opacity-55 hover:bg-zinc-900/30"
                      : "hover:bg-[#1e1e1e]"
                  }`}
                >
                  {/* # */}
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-xs text-zinc-700 tabular-nums group-hover:text-zinc-500 transition-colors">
                      {i + 1}
                    </span>
                  </div>

                  {/* notice */}
                  <div className="px-4 py-4 flex items-center gap-3 min-w-0">
                    <div
                      className={`w-[3px] h-9 rounded-full shrink-0 transition-colors ${
                        expired
                          ? "bg-zinc-700"
                          : "bg-[#f5c542]/40 group-hover:bg-[#f5c542]/70"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#f5c542]/55 tracking-widest mb-0.5 group-hover:text-[#f5c542]/80 transition-colors">
                        {item.noticeSlug}
                      </p>
                      <p className="text-[13px] text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">
                        {item.notice}
                      </p>
                    </div>
                  </div>

                  {/* issued */}
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-xs text-zinc-600">
                      {fmt(item.createdAt)}
                    </span>
                  </div>

                  {/* expires */}
                  <div className="px-4 py-4 flex items-center">
                    <span
                      className={`text-xs ${
                        expired ? "text-zinc-700" : "text-amber-500/60"
                      }`}
                    >
                      {fmt(item.expiresAt)}
                    </span>
                  </div>

                  {/* status */}
                  <div className="px-3 py-4 flex items-center justify-center">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border tracking-widest font-bold ${
                        expired
                          ? "bg-zinc-800/60 text-zinc-600 border-zinc-700/60"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      }`}
                    >
                      {expired ? "EXP" : "ON"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* table footer */}
        {notices && notices.length > 0 && (
          <div className="px-5 py-2.5 bg-[#191919] border-t border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-zinc-700">
              {activeCount} active · {expiredCount} expired
            </span>
            <span className="text-[10px] text-zinc-800">
              Total: {notices.length}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── modal ── */}
      <AnimatePresence>
        {selected && (
          <NoticeModal notice={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoticeBoard;
