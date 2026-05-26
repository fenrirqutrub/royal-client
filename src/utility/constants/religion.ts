// src/utility/constants/religion.ts

import type { SelectOption } from "../../types/types";

export const RELIGIONS = [
  { value: "ইসলাম", icon: "☪️" },
  { value: "হিন্দু", icon: "🕉️" },
  { value: "বৌদ্ধ", icon: "☸️" },
  { value: "খ্রিষ্টান", icon: "✝️" },
] as const;

export type Religion = (typeof RELIGIONS)[number]["value"] | null;

export const RELIGION_SELECT_OPTIONS: SelectOption[] = RELIGIONS.map((r) => ({
  value: r.value,
  label: r.value,
  icon: r.icon,
}));
