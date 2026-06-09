// src/utility/constants/subject.ts

import { MdOutlineCurrencyExchange, MdOutlineScience } from "react-icons/md";
import { TbLanguage, TbMath, TbMathIntegrals } from "react-icons/tb";
import { GiDna1, GiEarthAsiaOceania } from "react-icons/gi";
import { FaBookOpen, FaFlask } from "react-icons/fa";
import { SUBJECT_REQUIRED_CLASSES } from "./class";
import type { SelectOption } from "../../types/types";

// ─────────────────────────────────────────────
// SHARED ICONS
// ─────────────────────────────────────────────

const ICON_EARTH = <GiEarthAsiaOceania />;
const ICON_MONEY = <MdOutlineCurrencyExchange />;

// ─────────────────────────────────────────────
// BASE SUBJECTS
// ─────────────────────────────────────────────

export const BASE_SUBJECTS: SelectOption[] = [
  { value: "বাংলা ১ম", label: "বাংলা ১ম", icon: <TbLanguage /> },
  { value: "বাংলা ২য়", label: "বাংলা ২য়", icon: <TbLanguage /> },
  { value: "সহপাঠ", label: "সহপাঠ", icon: <TbLanguage /> },

  { value: "ইংরেজি ১ম", label: "ইংরেজি ১ম", icon: <FaBookOpen /> },
  { value: "ইংরেজি ২য়", label: "ইংরেজি ২য়", icon: <FaBookOpen /> },

  { value: "গণিত", label: "গণিত", icon: <TbMath /> },

  { value: "বিজ্ঞান", label: "বিজ্ঞান", icon: <FaFlask /> },

  {
    value: "বাংলাদেশ ও বিশ্বপরিচয়",
    label: "বাংলাদেশ ও বিশ্বপরিচয়",
    icon: ICON_EARTH,
  },

  {
    value: "ইসলাম শিক্ষা",
    label: "ইসলাম শিক্ষা",
    icon: ICON_EARTH,
  },

  {
    value: "হিন্দু ধর্ম",
    label: "হিন্দু ধর্ম",
    icon: ICON_EARTH,
  },

  {
    value: "কৃষি শিক্ষা",
    label: "কৃষি শিক্ষা",
    icon: ICON_EARTH,
  },

  {
    value: "তথ্য ও যোগাযোগ প্রযুক্তি",
    label: "তথ্য ও যোগাযোগ প্রযুক্তি",
    icon: ICON_EARTH,
  },
];

// ─────────────────────────────────────────────
// ADVANCED SUBJECTS
// ─────────────────────────────────────────────

export const ADVANCED_SUBJECTS: SelectOption[] = [
  {
    value: "পদার্থ বিজ্ঞান",
    label: "পদার্থ বিজ্ঞান",
    icon: <MdOutlineScience />,
  },

  { value: "রসায়ন", label: "রসায়ন", icon: <FaFlask /> },

  {
    value: "জীব বিজ্ঞান",
    label: "জীব বিজ্ঞান",
    icon: <GiDna1 />,
  },

  {
    value: "উচ্চতর গণিত",
    label: "উচ্চতর গণিত",
    icon: <TbMathIntegrals />,
  },

  { value: "অর্থনীতি", label: "অর্থনীতি", icon: ICON_MONEY },

  {
    value: "ভূগোল ও পরিবেশ",
    label: "ভূগোল ও পরিবেশ",
    icon: ICON_MONEY,
  },

  {
    value: "পৌরনীতি ও নাগরিকতা",
    label: "পৌরনীতি ও নাগরিকতা",
    icon: ICON_MONEY,
  },

  {
    value: "ইতিহাস ও বিশ্ব সভ্যতা",
    label: "ইতিহাস ও বিশ্ব সভ্যতা",
    icon: ICON_MONEY,
  },

  {
    value: "হিসাববিজ্ঞান",
    label: "হিসাববিজ্ঞান",
    icon: ICON_MONEY,
  },

  {
    value: "ফিন্যান্স ও ব্যাংকিং",
    label: "ফিন্যান্স ও ব্যাংকিং",
    icon: ICON_MONEY,
  },

  {
    value: "ব্যবসায় উদ্যোগ",
    label: "ব্যবসায় উদ্যোগ",
    icon: ICON_MONEY,
  },
  {
    value: "ইসলামের ইতিহাস",
    label: "ইসলামের ইতিহাস",
    icon: ICON_MONEY,
  },
  {
    value: "আকাইদ ও ফিকহ",
    label: "আকাইদ ও ফিকহ",
    icon: ICON_MONEY,
  },
  {
    value: "হাদিস শরিফ",
    label: "হাদিস শরিফ",
    icon: ICON_MONEY,
  },
];

// ─────────────────────────────────────────────
// GROUPS
// ─────────────────────────────────────────────

export const SUBJECT_GROUPS: SelectOption[] = [
  { value: "বিজ্ঞান", label: "বিজ্ঞান", icon: "🔬" },
  { value: "মানবিক", label: "মানবিক", icon: "📖" },
  { value: "বাণিজ্য", label: "বাণিজ্য", icon: "💼" },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const ADVANCED_CLASSES: readonly string[] = SUBJECT_REQUIRED_CLASSES;

export const getSubjects = (cls: string): SelectOption[] =>
  ADVANCED_CLASSES.includes(cls)
    ? [...BASE_SUBJECTS, ...ADVANCED_SUBJECTS]
    : BASE_SUBJECTS;
