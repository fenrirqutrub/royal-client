// src/utility/constants/degree.ts

import type { SelectOption } from "../../types/types";

export const DEGREES = [
  {
    value: "এইচএসসি",
    label: "এইচএসসি / সমমান",
    icon: "📘",
  },

  {
    value: "স্নাতক",
    label: "স্নাতক (সম্মান)",
    icon: "🎓",
  },

  {
    value: "স্নাতকোত্তর",
    label: "স্নাতকোত্তর",
    icon: "🏅",
  },
] as const;

export type Degree = (typeof DEGREES)[number]["value"] | "";

export const DEGREE_LABEL: Record<string, string> = Object.fromEntries(
  DEGREES.map((d) => [d.value, d.label]),
);

export const DEGREE_SELECT_OPTIONS: SelectOption[] = DEGREES.map((d) => ({
  value: d.value,
  label: d.label,
  icon: d.icon,
}));

export const YEARS: SelectOption[] = [
  { value: "১ম", label: "১ম বর্ষ" },
  { value: "২য়", label: "২য় বর্ষ" },
  { value: "৩য়", label: "৩য় বর্ষ" },
  { value: "৪র্থ", label: "৪র্থ বর্ষ" },
  { value: "এমবিএ", label: "এমবিএ" },
  { value: "এমবিবিএস", label: "এমবিবিএস" },
  { value: "এমএ", label: "এমএ" },
];
