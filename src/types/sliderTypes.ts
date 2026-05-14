// types/sliderTypes.ts
import type { ColorConfig } from "../styles/colors";
import type { ExamImage } from "./WeeklyExamTypes";

export interface AnimatedSlideProps {
  img: string | ExamImage;
  isActive: boolean;
  className?: string;
}

export interface SlideDotsProps {
  count: number;
  active: number;
  color: ColorConfig;
}

export interface SlideProgressProps {
  color: ColorConfig;
}
