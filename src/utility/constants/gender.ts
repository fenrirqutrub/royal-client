// src/utility/constants/gender.ts

export type Gender = "ছেলে" | "মেয়ে" | "পুরুষ" | "নারী" | null;

export const STUDENT_GENDER_OPTIONS = [
  { v: "ছেলে" as Gender, icon: "👦" },
  { v: "মেয়ে" as Gender, icon: "👧" },
];

export const STAFF_GENDER_OPTIONS = [
  { v: "পুরুষ" as Gender, icon: "👨" },
  { v: "নারী" as Gender, icon: "👩" },
];
