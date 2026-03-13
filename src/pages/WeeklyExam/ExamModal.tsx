// src/components/WeeklyExam/ExamModal.tsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { X, Copy, Check, Folder } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import {
  AnimatedSlide,
  SlideDots,
  SlideProgress,
  toBn,
  type ColorConfig,
  type Exam,
} from "../../utility/shared";

interface ExamModalProps {
  exam: Exam;
  color: ColorConfig;
  onClose: () => void;
}

// ── CopyBtn ───────────────────────────────────────────────────────────────────
const CopyBtn = ({ exam, color }: { exam: Exam; color: ColorConfig }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `পরিক্ষা নং = ${exam.ExamNumber}\n${exam.class} = ${exam.subject} - ${exam.mark} নম্বর\n\n${exam.topics}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "কপি সম্পন্ন" : "কপি করুন"}
      className="shrink-0 p-2.5 rounded-xl transition-all duration-200"
      style={
        copied
          ? { backgroundColor: "#d1fae5", color: "#065f46" }
          : {
              backgroundColor: `${color.from}12`,
              color: color.from,
            }
      }
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
    </button>
  );
};

// ── ExamModal ─────────────────────────────────────────────────────────────────
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
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[101] inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6 bangla"
      >
        <div
          className="relative w-full  bg-[var(--color-bg)] rounded-t-xl  overflow-hidden"
          style={{
            maxHeight: "96dvh",
            boxShadow: "0 -8px 60px rgba(0,0,0,0.25)",
            border: "1px solid var(--color-active-border)",
          }}
        >
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "96dvh", scrollbarWidth: "none" }}
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: "var(--color-active-border)" }}
              />
            </div>

            {/* ── Image or Colored Header ── */}
            {hasImages ? (
              <div
                className="relative"
                style={{ height: "clamp(200px, 55vw, 440px)" }}
              >
                {multipleImages && (
                  <SlideProgress key={progressKey} color={color} />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/20" />

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
                    <SwiperSlide key={i}>
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
                    className="px-3 py-1.5 rounded-xl text-white font-black text-sm backdrop-blur-md"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    পরীক্ষা নং {toBn(exam.ExamNumber)}
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-bg)] bg-red-700 backdrop-blur-md"
                  style={{
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <X className="w-4 h-4 " />
                </button>
              </div>
            ) : (
              /* No-image header */
              <div
                className="relative px-6 pt-10 pb-6"
                style={{
                  background: `linear-gradient(135deg, ${color.from}18, ${color.to}10)`,
                }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor: `${color.from}18`,
                    color: color.text,
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl mb-3"
                  style={{
                    background: `${color.from}20`,
                    color: color.text,
                    border: `2px solid ${color.from}30`,
                  }}
                >
                  {toBn(exam.ExamNumber)}
                </div>
                <p
                  className="font-black text-2xl"
                  style={{ color: "var(--color-text)" }}
                >
                  {exam.subject}
                </p>
                {exam.teacher && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {exam.teacher}
                  </p>
                )}
              </div>
            )}

            {/* Subject row (image mode) */}
            {hasImages && (
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-1">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-black text-2xl leading-tight truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {exam.subject}
                  </p>
                  <div className="flex  items-center justify-between">
                    {exam.teacher && (
                      <p className="text-sm mt-1 flex items-center text-[var(--color-gray)] gap-1.5 ">
                        <span className=" ">
                          <Folder className="w-5 h-5 mt-1.5" />
                        </span>
                        {exam.teacher}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: exam.class },
                        { label: `${toBn(exam.mark)} নম্বর` },
                        { label: exam.date },
                      ].map((item) => (
                        <span
                          key={item.label}
                          className="text-xs sm:text-sm font-semibold px-3.5 py-1 rounded-full  bangla text-[var(--color-gray)] border border-[var(--color-active-border-bg)] bg-[var(--color-bg)] "
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <CopyBtn exam={exam} color={color} />
              </div>
            )}

            {/* ── Body ── */}
            <div className="px-5 pb-8 pt-4 flex flex-col gap-5">
              {/* Pill badges */}

              <div
                className="h-px rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color.from}40, transparent)`,
                }}
              />

              {/* Topics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
                    }}
                  />
                  <p
                    className="text-lg font-black uppercase tracking-widest"
                    style={{ color: color.from }}
                  >
                    বিষয়বস্তু
                  </p>
                </div>
                <p className="text-base sm:text-lg leading-loose whitespace-pre-line bangla text-[var(--color-text)] ">
                  {exam.topics}
                </p>
              </div>

              <div
                className="h-px rounded-full"
                style={{ backgroundColor: "var(--color-active-border)" }}
              />

              {/* Footer */}
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-xs"
                  style={{ color: "var(--color-gray)", opacity: 0.5 }}
                >
                  কপি হবে: পরীক্ষা নং · শ্রেণি · বিষয় · নম্বর · বিষয়বস্তু
                </p>
                {!hasImages && <CopyBtn exam={exam} color={color} />}
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
