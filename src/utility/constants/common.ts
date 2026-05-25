// src/utility/constants/common.ts

export type Screen = "mobile" | "tablet" | "desktop";

export type FieldState = "idle" | "valid" | "error";

export const toLocalIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};
