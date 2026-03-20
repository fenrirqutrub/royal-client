// src/components/common/PersonModal.tsx
//
// Modal shell + modal-specific primitives (InfoRow, Section, formatDOB).
// Teacher আর Student নিজের content inject করে।
//
// Usage:
//   import PersonModal, { InfoRow, Section, formatDOB } from "../../components/common/PersonModal";
//
//   <PersonModal onClose={onClose} accentColor={color} header={<.../>}>
//     <Section title="মূল তথ্য" color="var(--color-active-bg)" borderColor="var(--color-active-border)">
//       <InfoRow label="ফোন" value={phone} />
//     </Section>
//   </PersonModal>

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
// value না থাকলে render করে না
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-2xl overflow-hidden shadow-2xl relative"
          style={{
            maxWidth: 420,
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-active-border)",
          }}
        >
          {/* accent strip */}
          <div
            className="h-1.5"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)`,
            }}
          />

          {/* close button */}
          <div className="flex justify-end px-4 pt-3">
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
          <div
            className="px-5 pb-5 overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            <div className="flex items-center gap-4 mb-5">{header}</div>
            <div className="space-y-3">{children}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );

export default PersonModal;
