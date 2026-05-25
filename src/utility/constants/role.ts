// src/utility/constants/role.ts

import type { ElementType } from "react";
import { Crown, GraduationCap, ShieldCheck, Star } from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type UserRole = "owner" | "admin" | "principal" | "teacher" | "student";

export type StaffRole = "teacher" | "principal" | "admin";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    color: string;
    bg: string;
    Icon: ElementType;
    desc: string;
    handle: string;
  }
> = {
  owner: {
    label: "মালিক",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    Icon: Star,
    desc: "সিস্টেম মালিক",
    handle: "মালিক",
  },

  admin: {
    label: "প্রশাসক",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    Icon: ShieldCheck,
    desc: "প্রশাসনিক কর্মকর্তা",
    handle: "প্রশাসক",
  },

  principal: {
    label: "অধ্যক্ষ",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    Icon: Crown,
    desc: "প্রধান শিক্ষক",
    handle: "পরিচালক",
  },

  teacher: {
    label: "শিক্ষক",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    Icon: GraduationCap,
    desc: "শিক্ষক",
    handle: "শিক্ষক",
  },

  student: {
    label: "ছাত্র/ছাত্রী",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    Icon: GraduationCap,
    desc: "শিক্ষার্থী",
    handle: "ছাত্র",
  },
};

// ─────────────────────────────────────────────
// ARRAYS
// ─────────────────────────────────────────────

export const MANAGER_ROLES: UserRole[] = ["owner", "admin", "principal"];

export const STAFF_ROLES: UserRole[] = [
  "teacher",
  "principal",
  "admin",
  "owner",
];

export const STAFF_ROLE_LIST: StaffRole[] = ["teacher", "principal", "admin"];

export const PRIVILEGED_ROLES: UserRole[] = ["owner", "admin", "principal"];

export const STAFF_DASHBOARD_ROLES: UserRole[] = [
  "owner",
  "admin",
  "principal",
  "teacher",
];

// ─────────────────────────────────────────────
// PERMISSIONS
// ─────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, StaffRole[]> = {
  owner: ["admin", "principal", "teacher"],
  admin: ["admin", "principal", "teacher"],
  principal: ["principal", "teacher"],
  teacher: [],
  student: [],
};

// ─────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  teacher: "শিক্ষক",
  principal: "অধ্যক্ষ",
  admin: "প্রশাসক",
};

// ─────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────

export const ROLE_BADGE_CLASS: Partial<Record<UserRole, string>> = {
  owner: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",

  admin: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",

  principal:
    "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",

  teacher: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export const isPrivilegedRole = (role: UserRole) =>
  PRIVILEGED_ROLES.includes(role);
