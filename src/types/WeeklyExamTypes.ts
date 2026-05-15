// types/WeeklyExamTypes.ts
import type { ColorConfig } from "../styles/colors";
import type { SelectOption, ViewData } from "./types";

export interface Exam {
  _id: string;
  ExamNumber: number | string;
  subject: string;
  class: string;
  mark: number | string;
  topics: string;
  teacher?: string;
  date: string;
  images?: (string | ExamImage)[];
  numberType?: "pageNumber" | "chapterNumber" | null;
  pageNumber?: string | number | null;
  chapterNumber?: string | number | null;
  question?: string | null;

  viewCount?: number;
  viewedBy?: {
    userId: {
      _id: string;
      name: string;
      role?: string;
      studentClass?: string;
      roll?: string;
      avatar?: { url: string };
    };
    viewedAt: string;
  }[];
}

export interface WeeklyExamCardProps {
  exam: Exam;
  index: number;
  activeExamNumber?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface ExamImage {
  imageUrl?: string;
  url?: string;
  publicId?: string;
}

export interface WeeklyExamData {
  _id: string;
  slug: string;
  subject: string;
  teacher: string;
  teacherSlug?: string;
  class: string;
  mark: number;
  ExamNumber: string;

  numberType?: "pageNumber" | "chapterNumber" | null;
  pageNumber?: string | number | null;
  chapterNumber?: string | number | null;
  numberValue?: string | number | null;

  topics: string;
  question?: string | null;
  images: (string | ExamImage)[];
  viewCount?: number;
  viewedBy?: ViewData["viewedBy"];
  createdAt: string;
  updatedAt?: string;
  id?: string;
}

export interface ExamModalProps {
  exam: Exam;
  color?: ColorConfig;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface ExamMetaResponse {
  examNumbers: string[];
  examMeta: {
    examNumber: string;
    firstCreatedAt: string;
    count: number;
  }[];
}

export interface WeeklyExamFormData {
  subject: string;
  teacher: string;
  class: string;
  mark: number;
  ExamNumber: string;

  numberType?: "pageNumber" | "chapterNumber" | "" | null;
  numberValue?: string;
  pageNumber?: string | number | null;
  chapterNumber?: string | number | null;

  topics: string;
  question?: string;
  slug?: string;
}

export interface WeeklyExamHeaderFiltersProps {
  isGuest: boolean;
  isStaff: boolean;
  activeExamNumber: string | null;

  selectedTeacher: string;
  onTeacherChange: (value: string) => void;
  teacherOptions: SelectOption[];

  selectedClass: string;
  onClassChange: (value: string) => void;
  availableClasses: string[];

  totalExamsInNumber: number;
  filteredCount: number;
  activeFilterCount: number;

  onAddExam: () => void;
  onReset: () => void;
  onGuestAction: () => void;

  badgeText?: string;
  title?: string;
  description?: string;
  teacherLabel?: string;
  addButtonLabel?: string;
  classLabel?: string;
  resetTitle?: string;
}

export interface ExamMarksPage {
  pageNumber: number;
  url: string;
  publicId: string;
}

export interface ExamMarksData {
  _id: string;
  pages: ExamMarksPage[];
  totalPages: number;
  isActive: boolean;
  createdAt: string;
}

export interface ZoomableImageProps {
  src: string;
  alt: string;
  onSingleTap: () => void;
  onZoomChange?: (zoomed: boolean) => void;
}

export interface EditFormValues {
  subject: string;
  class: string;
  ExamNumber: string;
  topics: string;
  teacher: string;
  teacherSlug: string;
  mark: string;
  question?: string;

  numberType?: "" | "chapterNumber" | "pageNumber";
  chapterNumber?: string;
  pageNumber?: string;
}
