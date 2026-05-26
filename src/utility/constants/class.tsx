import { MdOutlineClass } from "react-icons/md";
import type { SelectOption } from "../../types/types";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const CLASS_CONFIG = [
  { label: "ষষ্ঠ শ্রেণি", number: 6, needsSubject: false },
  { label: "সপ্তম শ্রেণি", number: 7, needsSubject: false },
  { label: "অষ্টম শ্রেণি", number: 8, needsSubject: false },
  { label: "নবম শ্রেণি", number: 9, needsSubject: true },
  { label: "দশম শ্রেণি", number: 10, needsSubject: true },
  { label: "একাদশ শ্রেণি", number: 11, needsSubject: true },
  { label: "দ্বাদশ শ্রেণি", number: 12, needsSubject: true },
] as const;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export const CLASSES = CLASS_CONFIG.map((c) => c.label);

export type StudentClass = (typeof CLASSES)[number];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export const normalizeStudentClass = (cls?: string | null): string => {
  const value = cls?.trim() ?? "";

  const CLASS_ALIAS_MAP: Record<string, string> = {
    "৬ষ্ঠ শ্রেণি": "ষষ্ঠ শ্রেণি",
    "৭ম শ্রেণি": "সপ্তম শ্রেণি",
    "৮ম শ্রেণি": "অষ্টম শ্রেণি",
    "৯ম শ্রেণি": "নবম শ্রেণি",
    "১০ম শ্রেণি": "দশম শ্রেণি",
    "১১শ শ্রেণি": "একাদশ শ্রেণি",
    "১২শ শ্রেণি": "দ্বাদশ শ্রেণি",
  };

  return CLASS_ALIAS_MAP[value] ?? value;
};

export const CLASS_NUMBER_MAP: Record<string, string> = {
  "ষষ্ঠ শ্রেণি": "৬",
  "সপ্তম শ্রেণি": "৭",
  "অষ্টম শ্রেণি": "৮",
  "নবম শ্রেণি": "৯",
  "দশম শ্রেণি": "১০",
  "একাদশ শ্রেণি": "১১",
  "দ্বাদশ শ্রেণি": "১২",
};

export const getStudentClassNumber = (cls?: string | null): string => {
  const normalized = normalizeStudentClass(cls);
  return CLASS_NUMBER_MAP[normalized] ?? normalized;
};

// ─────────────────────────────────────────────
// SUBJECT REQUIRED
// ─────────────────────────────────────────────

export const SUBJECT_REQUIRED_CLASSES: string[] = CLASS_CONFIG.filter(
  (c) => c.needsSubject,
).map((c) => c.label);

export const SUBJECT_REQUIRED_CLASS_SET = new Set<string>(
  SUBJECT_REQUIRED_CLASSES,
);

export const classNeedsSubject = (cls?: string | null): boolean =>
  SUBJECT_REQUIRED_CLASS_SET.has(normalizeStudentClass(cls));

// ─────────────────────────────────────────────
// OPTIONS
// ─────────────────────────────────────────────

export const CLASS_OPTIONS: SelectOption[] = CLASSES.map((c) => ({
  value: c,
  label: c,
  icon: <MdOutlineClass />,
}));

export const CLASS_ORDER: Record<string, number> = Object.fromEntries(
  CLASS_CONFIG.map((c) => [c.label, c.number]),
);
