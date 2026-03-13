import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { X } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import {
  AnimatedSlide,
  SlideDots,
  SlideProgress,
  toBn,
  type Color,
  type Exam,
} from "../../utility/shared";

interface ExamModalProps {
  exam: Exam;
  color: Color;
  onClose: () => void;
}

const ExamModal = ({ exam, color, onClose }: ExamModalProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const hasImages = (exam.images?.length ?? 0) > 0;
  const multipleImages = hasImages && (exam.images?.length ?? 0) > 1;

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] backdrop-blur-2xl"
      />

      {/* Sheet / dialog */}
      <motion.div
        key="sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[101] left-0 right-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6 bangla"
      >
        <div
          className="relative bg-[var(--color-bg)] rounded md:rounded-2xl w-full  overflow-hidden"
          style={{
            maxHeight: "96dvh",
            boxShadow:
              "0 -8px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "96dvh",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* ── Image slider / no-image header ── */}
            {hasImages ? (
              <div
                className="relative"
                style={{ height: "65vw", maxHeight: 500, minHeight: 220 }}
              >
                {multipleImages && (
                  <SlideProgress key={progressKey} color={color} />
                )}
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.72) 100%)",
                  }}
                />
                <Swiper
                  onSlideChange={(s) => {
                    setActiveSlide(s.realIndex);
                    setProgressKey((k) => k + 1);
                  }}
                  modules={[Pagination, Autoplay]}
                  autoplay={
                    multipleImages
                      ? {
                          delay: 3500,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }
                      : false
                  }
                  loop={multipleImages}
                  className="w-full h-full"
                >
                  {exam.images!.map((img, i) => (
                    <SwiperSlide
                      key={typeof img === "string" ? i : (img.publicId ?? i)}
                    >
                      <AnimatedSlide img={img} isActive={i === activeSlide} />
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
                {/* Exam number badge */}
                <div className="absolute top-4 left-4 z-20">
                  <div
                    className="px-3 py-1.5 rounded-xl backdrop-blur-md text-white font-black text-sm"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    পরীক্ষা নং {toBn(exam.ExamNumber)}
                  </div>
                </div>
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full text-white"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* No-image coloured header */
              <div
                className="relative px-6 pt-10 pb-6"
                style={{
                  background: `linear-gradient(135deg, ${color.soft}, white)`,
                }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-all"
                >
                  <X className="w-4 h-4" style={{ color: color.text }} />
                </button>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl mb-3"
                  style={{
                    background: color.soft,
                    color: color.text,
                    border: `2px solid ${color.from}30`,
                  }}
                >
                  {toBn(exam.ExamNumber)}
                </div>
                <p
                  className="font-black text-2xl"
                  style={{ color: color.text }}
                >
                  {exam.subject}
                </p>
                {exam.teacher && (
                  <p className="text-slate-400 text-sm mt-1">{exam.teacher}</p>
                )}
              </div>
            )}

            {/* Subject + copy button (shown only when images exist) */}
            {hasImages && (
              <div className="px-5 pt-5 pb-1 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-2xl leading-tight truncate">
                    {exam.subject}
                  </p>
                  {exam.teacher && (
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 font-medium">
                      {exam.teacher}
                    </p>
                  )}
                </div>
                <CopyBtn exam={exam} color={color} />
              </div>
            )}

            {/* ── Body ── */}
            <div className="px-5 pb-8 pt-4 flex flex-col gap-5">
              {/* Pill badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "🏫", value: exam.class },
                  { emoji: "📊", value: `${exam.mark} নম্বর` },
                  { emoji: "📅", value: exam.date },
                ].map((item) => (
                  <span
                    key={item.value}
                    className="inline-flex items-center gap-2 text-sm md:text-base px-4 py-2 rounded-2xl font-semibold border"
                    style={{
                      background: `${color.from}0e`,
                      color: color.text,
                      borderColor: `${color.from}25`,
                    }}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.value}</span>
                  </span>
                ))}
              </div>

              <div
                className="h-px rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color.from}40, ${color.to}20, transparent)`,
                }}
              />

              {/* Topics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
                    }}
                  />
                  <p
                    className="text-sm font-black uppercase tracking-widest"
                    style={{ color: color.from }}
                  >
                    বিষয়বস্তু
                  </p>
                </div>
                <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-line">
                  {exam.topics}
                </p>
              </div>

              <div className="h-px rounded-full bg-slate-100 dark:bg-slate-800" />

              {/* Footer */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-300 dark:text-slate-600">
                  কপি হবে: পরীক্ষা নং · শ্রেণি · বিষয় · নম্বর · বিষয়বস্তু
                </p>
                <button
                  onClick={onClose}
                  className="hidden md:flex shrink-0 w-9 h-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default ExamModal;
