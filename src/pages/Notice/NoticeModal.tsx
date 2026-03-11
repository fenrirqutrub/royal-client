// NoticeModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Download, Printer, X } from "lucide-react";
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
  notice: NoticeItem | null;
  onClose: () => void;
}

const NoticeModal = ({ notice, onClose }: NoticeModalProps) => {
  if (!notice) return null;

  const pdfUrl = `${API_URL}/api/notices/${notice.noticeSlug}/pdf`;
  const expired = isExpired(notice.expiresAt);

  // Print — open PDF in new tab
  const handlePrint = () => {
    window.open(pdfUrl, "_blank");
  };

  // Download — fetch blob via axiosPublic and trigger save
  const handleDownload = async () => {
    try {
      const res = await axiosPublic.get(
        `/api/notices/${notice.noticeSlug}/pdf`,
        {
          responseType: "blob",
        },
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${notice.noticeSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-bg) 80%, transparent)",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full flex flex-col overflow-y-auto hide-scrollbar"
          style={{
            maxHeight: "92vh",
            borderRadius: "20px 20px 0 0",
            border: "1px solid var(--color-active-border)",
            backgroundColor: "var(--color-bg)",
            boxShadow: "0 -8px 60px var(--color-shadow)",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {/* ── Drag handle (mobile) ── */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: "var(--color-active-border)" }}
            />
          </div>

          {/* ── Header ── */}
          <div
            className="shrink-0 px-5 pt-3 pb-4 sm:pt-5 space-y-3"
            style={{ borderBottom: "1px solid var(--color-active-border)" }}
          >
            {/* Row 1: slug + status + close */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: expired ? "var(--color-gray)" : "#22c55e",
                    boxShadow: expired ? "none" : "0 0 6px #22c55e99",
                  }}
                />
                <span
                  className="text-xs font-mono truncate"
                  style={{ color: "var(--color-gray)" }}
                >
                  {notice.noticeSlug}
                </span>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0"
                  style={{
                    color: expired ? "var(--color-gray)" : "#22c55e",
                    borderColor: expired
                      ? "var(--color-active-border)"
                      : "#22c55e44",
                    backgroundColor: expired ? "transparent" : "#22c55e11",
                  }}
                >
                  {expired ? "EXPIRED" : "ACTIVE"}
                </span>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-active-border)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--color-active-border)")
                }
              >
                <X size={13} />
              </button>
            </div>

            {/* Row 2: notice text */}
            <p
              className="text-sm sm:text-[15px] leading-relaxed font-medium line-clamp-2"
              style={{ color: "var(--color-text)" }}
            >
              {notice.notice}
            </p>

            {/* Row 3: dates + action buttons */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--color-gray)" }}
              >
                {fmt(notice.createdAt)} → {fmt(notice.expiresAt)}
              </span>

              <div className="flex items-center gap-2">
                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: "var(--color-active-bg)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-active-border)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-text)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--color-active-border)")
                  }
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--color-text)",
                    color: "var(--color-bg)",
                  }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── PDF Preview ── */}
          <div className="flex flex-col">
            <div
              className="shrink-0 flex items-center gap-2 px-5 py-2"
              style={{ borderBottom: "1px solid var(--color-active-border)" }}
            >
              <span
                className="text-[9px] font-mono uppercase tracking-[0.2em]"
                style={{ color: "var(--color-gray)" }}
              >
                PDF Preview
              </span>
            </div>
            <iframe
              id="notice-pdf-iframe"
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full border-0"
              style={{ height: "200vh", flexShrink: 0 }}
              title={`PDF — ${notice.noticeSlug}`}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoticeModal;
