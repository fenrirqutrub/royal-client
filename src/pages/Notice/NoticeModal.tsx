// NoticeModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import axiosPublic from "../../hooks/axiosPublic";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface NoticeItem {
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

interface NoticeModalProps {
  noticeSlug: string | null;
  onClose: () => void;
}

const NoticeModal = ({ noticeSlug, onClose }: NoticeModalProps) => {
  const {
    data: notice,
    isLoading,
    isError,
  } = useQuery<NoticeItem>({
    queryKey: ["notice", noticeSlug],
    queryFn: async () => {
      const res = await axiosPublic.get(`/api/notices/${noticeSlug}`);
      return res.data;
    },
    enabled: !!noticeSlug,
  });

  if (!noticeSlug) return null;

  const pdfUrl = `${API_URL}/api/notices/${noticeSlug}/pdf`;
  const expired = notice ? isExpired(notice.expiresAt) : false;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-bg)_85%,transparent)]"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full flex flex-col rounded-2xl overflow-hidden border border-[var(--color-active-border)] bg-[var(--color-bg)] shadow-[0_25px_60px_var(--color-shadow-md)]"
          style={{ height: "88vh" }}
        >
          {/* ── top bar ── */}
          <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-[var(--color-active-border)] bg-[var(--color-bg)]">
            {isLoading ? (
              <div className="h-8 w-48 rounded animate-pulse bg-[var(--color-active-bg)]" />
            ) : isError ? (
              <span className="text-xs text-[var(--color-gray)]">
                Failed to load notice
              </span>
            ) : notice ? (
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#f5c542] rounded-full" />
                <div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full border tracking-widest font-bold ${
                      expired
                        ? "bg-[var(--color-active-bg)] text-[var(--color-gray)] border-[var(--color-active-border)]"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {expired ? "EXPIRED" : "ACTIVE"}
                  </span>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] font-mono text-[var(--color-gray)]">
                      Issued: {fmt(notice.createdAt)}
                    </span>
                    <span className="text-[var(--color-active-border)]">·</span>
                    <span
                      className={`text-[10px] font-mono ${
                        expired ? "text-[var(--color-gray)]" : "text-amber-400"
                      }`}
                    >
                      Expires: {fmt(notice.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2 shrink-0">
              {/* external PDF download — must stay <a> since it's a file download */}
              <Link
                to={pdfUrl}
                download={`${noticeSlug}.pdf`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-[#f5c542] hover:bg-[#ffd966] text-black text-xs font-bold px-3 py-2 rounded-xl transition-colors tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Link>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-lg leading-none text-[var(--color-gray)] hover:bg-[var(--color-active-bg)] hover:text-[var(--color-text)]"
              >
                ×
              </button>
            </div>
          </div>

          {/* ── notice text ── */}
          {notice && (
            <div className="px-5 py-3 shrink-0 border-b border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
              <p className="text-[13px] leading-relaxed line-clamp-3 text-[var(--color-gray)]">
                {notice.notice}
              </p>
            </div>
          )}

          {/* ── PDF iframe ── */}
          <div className="flex-1 min-h-0 flex flex-col bg-[var(--color-bg)]">
            <div className="flex items-center gap-2 px-4 py-2 shrink-0 border-b border-[var(--color-active-border)]">
              <div className="w-2 h-2 rounded-full bg-[#f5c542]" />
              <span className="text-[10px] tracking-widest uppercase text-[var(--color-gray)]">
                PDF Preview
              </span>
              <div className="flex-1" />
              {/* external URL — use <Link reloadDocument> to trigger full navigation */}
              <Link
                to={pdfUrl}
                reloadDocument
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] transition-colors tracking-wider hover:underline text-[var(--color-gray)]"
              >
                Open in new tab ↗
              </Link>
            </div>
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="flex-1 w-full border-0"
              title={`PDF — ${noticeSlug}`}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoticeModal;
