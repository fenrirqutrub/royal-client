// src/utility/constants/number.ts

import { BookOpen, FileText } from "lucide-react";
import type { SelectOption } from "../../types/types";

export const NUMBER_TYPE_OPTIONS: SelectOption[] = [
  {
    value: "chapterNumber",
    label: "অধ্যায় নম্বর",
    icon: <BookOpen className="w-4 h-4" />,
  },

  {
    value: "pageNumber",
    label: "পৃষ্ঠা নম্বর",
    icon: <FileText className="w-4 h-4" />,
  },
];
