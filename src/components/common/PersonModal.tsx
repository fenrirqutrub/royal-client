// src/components/common/PersonModal.tsx

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ── formatDOB ─────────────────────────────────────────────────────────────────
export const formatDOB = (dob: string): string => {
  try {
    return new Date(dob).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dob;
  }
};

// ── InfoRow ───────────────────────────────────────────────────────────────────
export const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) =>
  value ? (
    <div className="flex items-start gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 bangla text-[var(--color-gray)] w-14">
        {label}
      </span>
      <span className="text-xs opacity-40 text-[var(--color-gray)]">:</span>
      <span className="text-sm bangla text-[var(--color-text)]">{value}</span>
    </div>
  ) : null;

// ── Section ───────────────────────────────────────────────────────────────────
export const Section = ({
  title,
  color,
  borderColor,
  titleColor,
  icon,
  children,
}: {
  title: string;
  color: string;
  borderColor: string;
  titleColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className="p-3.5 rounded-xl space-y-2"
    style={{ backgroundColor: color, border: `1px solid ${borderColor}` }}
  >
    <p
      className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 bangla"
      style={{ color: titleColor ?? "var(--color-gray)" }}
    >
      {icon} {title}
    </p>
    {children}
  </div>
);

// ── PersonModal ───────────────────────────────────────────────────────────────
interface PersonModalProps {
  onClose: () => void;
  accentColor: string;
  header: React.ReactNode;
  children: React.ReactNode;
}

const PersonModal = ({
  onClose,
  accentColor,
  header,
  children,
}: PersonModalProps) =>
  createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.97, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 32 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="
            w-full overflow-hidden shadow-2xl relative flex flex-col
            rounded-t-3xl sm:rounded-3xl
            h-[92dvh] sm:h-[90dvh]
          "
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-active-border)",
          }}
        >
          {/* accent strip */}
          <div
            className="h-[3px] w-full shrink-0"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)`,
            }}
          />

          {/* mobile drag handle */}
          <div className="flex justify-center pt-2 pb-1 sm:hidden shrink-0">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: "var(--color-active-border)" }}
            />
          </div>

          {/* close button */}
          <div className="flex justify-end px-4 pt-2 shrink-0">
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--color-active-bg)",
                color: "var(--color-gray)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-active-border)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-active-bg)")
              }
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
            <div className="flex items-center gap-4 mb-5">{header}</div>
            <div className="space-y-3">{children}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );

export default PersonModal;
