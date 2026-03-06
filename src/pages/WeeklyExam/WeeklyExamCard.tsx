import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Eye, Copy, Check, Folder, Calendar } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

import ExamModal from "./ExamModal";
import {
  COLORS,
  type Exam,
  AnimatedSlide,
  SlideDots,
  SlideProgress,
  toBn,
} from "../../utility/shared";

interface WeeklyExamCardProps {
  exam: Exam;
  index: number;
}

const WeeklyExamCard = ({ exam, index }: WeeklyExamCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const swiperRef = useRef<SwiperType | null>(null);
  const color = COLORS[index % COLORS.length];

  const hasImages = (exam.images?.length ?? 0) > 0;
  const multipleImages = hasImages && (exam.images?.length ?? 0) > 1;

  const handleCopy = () => {
    const text = `পরিক্ষা নং = ${exam.ExamNumber}\n${exam.class} = ${exam.subject} - ${exam.mark} নম্বর\n\n${exam.topics}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.07,
          duration: 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`
          group overflow-hidden rounded-2xl bg-[var(--color-bg)] 
          text-[var(--color-text)] shadow-md shadow-slate-200/50 
          dark:shadow-black/40 border border-[var(--color-active-border)]/60
          hover:shadow-xl hover:border-[var(--color-active-border)]/90
          transition-all duration-300
        `}
        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        {/* Image Section */}
        {hasImages ? (
          <figure className="relative aspect-video overflow-hidden">
            {/* Subtle gradient overlay for better text/icon contrast if needed later */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent/70" />

            {multipleImages && (
              <SlideProgress key={progressKey} color={color} />
            )}

            <Swiper
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => {
                setActiveSlide(s.realIndex);
                setProgressKey((prev) => prev + 1);
              }}
              modules={[Pagination, Autoplay]}
              autoplay={
                multipleImages
                  ? {
                      delay: 3800,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              loop={multipleImages}
              className="h-full w-full"
            >
              {exam.images!.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="relative h-full w-full">
                    <AnimatedSlide
                      img={img}
                      isActive={i === activeSlide}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {multipleImages && (
              <SlideDots
                count={exam.images!.length}
                active={activeSlide}
                color={color}
              />
            )}
          </figure>
        ) : (
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
            }}
          />
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <h3 className="text-xl md:text-2xl font-bold leading-tight bangla tracking-tight text-[var(--color-text)]">
                {exam.subject}
              </h3>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[var(--color-gray)]">
                <div className="flex items-center gap-1.5">
                  <Folder className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="truncate max-w-[160px]">
                    {exam.teacher || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{exam.date}</span>
                </div>
              </div>
            </div>

            {/* Copy button with better feedback */}
            <button
              onClick={handleCopy}
              aria-label={copied ? "কপি সম্পন্ন" : "কপি করুন"}
              className={`
                p-2.5 rounded-xl transition-all duration-200
                ${
                  copied
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "text-slate-500 hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/8"
                }
              `}
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Topics */}
          <p className="text-[0.94rem] leading-relaxed text-[var(--color-gray)] line-clamp-3 bangla">
            {exam.topics}
          </p>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span
                className="text-xs font-medium px-3.5 py-1 rounded-full border bangla"
                style={{
                  color: color.text,
                  borderColor: `${color.from}50`,
                  backgroundColor: `${color.from}10`,
                }}
              >
                {exam.class}
              </span>
              <span
                className="text-xs font-medium px-3.5 py-1 rounded-full border bangla"
                style={{
                  color: color.text,
                  borderColor: `${color.from}50`,
                  backgroundColor: `${color.from}10`,
                }}
              >
                প্রশ্নমান: {toBn(exam.mark)}
              </span>
            </div>

            {/* Details button */}
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bangla
                transition-all duration-200
                bg-[var(--color-text)]
                text-[var(--color-bg)]
                
              `}
            >
              <Eye className="h-4.5 w-4.5" />
              বিস্তারিত
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <ExamModal
          exam={exam}
          color={color}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default WeeklyExamCard;
