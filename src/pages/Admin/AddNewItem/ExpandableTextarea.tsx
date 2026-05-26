// components/common/ExpandableTextarea.tsx
import { useEffect, useRef, useCallback, forwardRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────
export interface ExpandableTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  label?: string;
  previewClassName?: string;
  textareaClassName?: string;
  doneLabel?: string;
  hintLabel?: string;
}

// ─── Preview (normal state) ──────────────────────────
export const ExpandableTextareaPreview = forwardRef<
  HTMLDivElement,
  {
    value: string;
    placeholder?: string;
    onClick: () => void;
    className?: string;
  }
>(({ value, placeholder, onClick, className = "" }, ref) => (
  <div
    ref={ref}
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className={className}
  >
    {value ? (
      <span className="bangla text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap text-[var(--color-text)]">
        {value}
      </span>
    ) : (
      <span className="bangla text-sm text-[var(--color-gray)]">
        {placeholder}
      </span>
    )}
  </div>
));
ExpandableTextareaPreview.displayName = "ExpandableTextareaPreview";

// ─── Fullscreen overlay ───────────────────────────────
const FullscreenTextarea = ({
  value,
  onChange,
  onClose,
  placeholder,
  label,
  textareaClassName = "",
  doneLabel = "Confirm",
  hintLabel = "ESC চাপুন",
}: Pick<
  ExpandableTextareaProps,
  | "value"
  | "onChange"
  | "onClose"
  | "placeholder"
  | "label"
  | "textareaClassName"
  | "doneLabel"
  | "hintLabel"
>) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Focus + cursor to end on mount
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true });
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    [onChange],
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-[var(--color-bg)]"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--color-active-border)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
          {label && (
            <span className="text-sm font-semibold text-[var(--color-text)] bangla">
              {label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-gray)] bangla tabular-nums">
            {value.length} · {wordCount} শব্দ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 active:scale-95 transition-all bangla"
          >
            <CheckCircle2 className="w-4 h-4" />
            {doneLabel}
          </button>
        </div>
      </div>

      {/* Textarea — full remaining height */}
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={[
          "flex-1 w-full px-4 sm:px-8 py-6",
          "bg-[var(--color-bg)] text-[var(--color-text)]",
          "placeholder-[var(--color-gray)]",
          "text-base leading-loose bangla",
          "resize-none focus:outline-none",
          "caret-violet-500",
          textareaClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {/* Bottom hint */}
      <div className="px-4 sm:px-6 py-2 border-t border-[var(--color-active-border)] shrink-0 flex justify-end">
        <span className="text-xs text-[var(--color-gray)] bangla">
          {hintLabel}
        </span>
      </div>
    </motion.div>,
    document.body,
  );
};

// ─── Main exported component ─────────────────────────
const ExpandableTextarea = ({
  value,
  onChange,
  onBlur,
  isOpen,
  onOpen,
  onClose,
  placeholder,
  label,
  previewClassName = "",
  textareaClassName = "",
  doneLabel,
  hintLabel,
}: ExpandableTextareaProps) => {
  const handleClose = useCallback(() => {
    onClose();
    onBlur?.();
  }, [onClose, onBlur]);

  return (
    <>
      <ExpandableTextareaPreview
        value={value}
        placeholder={placeholder}
        onClick={onOpen}
        className={previewClassName}
      />

      <AnimatePresence>
        {isOpen && (
          <FullscreenTextarea
            value={value}
            onChange={onChange}
            onClose={handleClose}
            placeholder={placeholder}
            label={label}
            textareaClassName={textareaClassName}
            doneLabel={doneLabel}
            hintLabel={hintLabel}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpandableTextarea;
