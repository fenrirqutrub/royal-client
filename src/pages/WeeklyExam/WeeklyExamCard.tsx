import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const COLORS = [
  { from: "#6366f1", to: "#8b5cf6", soft: "#ede9fe", text: "#4338ca" },
  { from: "#0ea5e9", to: "#06b6d4", soft: "#e0f2fe", text: "#0369a1" },
  { from: "#f43f5e", to: "#ec4899", soft: "#fce7f3", text: "#be123c" },
];

// ── Custom animated slide ──────────────────────────────────
const AnimatedSlide = ({ img, isActive }) => (
  <div className="relative w-full h-full overflow-hidden">
    <motion.img
      src={img.imageUrl}
      alt="exam"
      className="w-full h-full object-cover"
      animate={isActive ? { scale: 1 } : { scale: 1.08 }}
      initial={{ scale: 1.08 }}
      transition={{ duration: 6, ease: "linear" }}
    />
  </div>
);

// ── Dot indicator ──────────────────────────────────────────
const SlideDots = ({ count, active, color }) => (
  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === active ? 28 : 7,
          background: i === active ? "#ffffff" : "rgba(255,255,255,0.4)",
          boxShadow: i === active ? `0 0 10px ${color.from}90` : "none",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-[7px] rounded-full"
      />
    ))}
  </div>
);

// ── Image counter ──────────────────────────────────────────
const ImageCounter = ({ current, total, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.12 + 0.4, type: "spring", stiffness: 300 }}
    className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/25 text-white text-xs font-bold"
    style={{ background: "rgba(0,0,0,0.32)" }}
  >
    <motion.span
      key={current}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
    >
      {current + 1}
    </motion.span>
    <span className="opacity-50">/</span>
    <span className="opacity-70">{total}</span>
  </motion.div>
);

// ── Progress bar ───────────────────────────────────────────
const SlideProgress = ({ color, duration = 3500 }) => {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-30 h-[3px]"
      style={{ background: "rgba(255,255,255,0.15)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
        }}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </div>
  );
};

// ── Main card ──────────────────────────────────────────────
const WeeklyExamCard = ({ exam, index }) => {
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const swiperRef = useRef(null);
  const color = COLORS[index % COLORS.length];
  const hasImages = exam.images && exam.images.length > 0;
  const multipleImages = hasImages && exam.images.length > 1;

  const handleCopy = () => {
    const text = `পরিক্ষা নং = ${exam.ExamNumber}\n${exam.class} = ${exam.subject} - ${exam.mark} নম্বর\n\n${exam.topics}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlideChange = (swiper) => {
    setActiveSlide(swiper.realIndex);
    setProgressKey((k) => k + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.12,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative group w-full"
      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
    >
      {/* ambient glow */}
      <motion.div
        className="absolute -inset-2 rounded-[32px] -z-10 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse, ${color.from}25, transparent 70%)`,
          filter: "blur(20px)",
        }}
        transition={{ duration: 0.6 }}
      />

      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/30 overflow-hidden"
      >
        {/* ── Slider ── */}
        {hasImages && (
          <div
            className="relative overflow-hidden"
            style={{ height: "clamp(260px, 38vw, 420px)" }}
          >
            {/* progress bar */}
            {multipleImages && (
              <SlideProgress key={progressKey} color={color} />
            )}

            {/* top fade */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.72) 100%)",
              }}
            />

            {/* swiper */}
            <Swiper
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={handleSlideChange}
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
              {exam.images.map((img, i) => (
                <SwiperSlide key={img.publicId ?? i}>
                  <AnimatedSlide img={img} isActive={i === activeSlide} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* custom dots */}
            {multipleImages && (
              <SlideDots
                count={exam.images.length}
                active={activeSlide}
                color={color}
              />
            )}

            {/* image counter */}
            {multipleImages && (
              <ImageCounter
                current={activeSlide}
                total={exam.images.length}
                color={color}
                index={index}
              />
            )}

            {/* subject + teacher overlay */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 + 0.3, duration: 0.5 }}
              className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-10 sm:pb-12"
            >
              <p className="text-white font-extrabold text-xl sm:text-2xl leading-tight drop-shadow-lg tracking-tight">
                {exam.subject}
              </p>
              <p className="text-white/70 text-sm sm:text-base mt-1 font-medium drop-shadow">
                {exam.teacher}
              </p>
            </motion.div>
          </div>
        )}

        {/* accent bar — no image */}
        {!hasImages && (
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
            }}
          />
        )}

        {/* ── Body ── */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* row 1: badge + info + copy */}
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.12, rotate: -6 }}
              transition={{ type: "spring", stiffness: 350, damping: 14 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-extrabold text-lg sm:text-xl"
              style={{
                background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                boxShadow: `0 6px 18px ${color.from}45`,
              }}
            >
              {exam.ExamNumber}
            </motion.div>

            <div className="flex-1 min-w-0">
              {!hasImages ? (
                <>
                  <p className="font-extrabold text-slate-800 dark:text-white text-lg sm:text-xl leading-snug truncate">
                    {exam.subject}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {exam.teacher}
                  </p>
                </>
              ) : (
                <p className="text-sm sm:text-base font-semibold text-slate-400 dark:text-slate-500">
                  পরীক্ষা নং — {exam.ExamNumber}
                </p>
              )}
            </div>

            {/* copy btn */}
            <motion.button
              onClick={handleCopy}
              whileTap={{ scale: 0.82 }}
              whileHover={{ scale: 1.07 }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-colors duration-200"
              style={
                copied
                  ? {
                      background: `${color.from}15`,
                      color: color.from,
                      borderColor: `${color.from}50`,
                    }
                  : {
                      background: "transparent",
                      color: "#94a3b8",
                      borderColor: "#e2e8f0",
                    }
              }
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0, rotate: -120 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </motion.svg>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={copied ? "y" : "n"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.14 }}
                >
                  {copied ? "কপি!" : "কপি"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* meta pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { emoji: "🏫", value: exam.class },
              { emoji: "📊", value: `${exam.mark} নম্বর` },
              { emoji: "📅", value: exam.date },
            ].map((item, i) => (
              <motion.span
                key={item.value}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.1 + i * 0.07 + 0.25,
                  type: "spring",
                  stiffness: 320,
                }}
                className="inline-flex items-center gap-1.5 text-sm sm:text-base px-3 sm:px-4 py-1.5 rounded-xl font-semibold border"
                style={{
                  background: `${color.from}0d`,
                  color: color.text,
                  borderColor: `${color.from}22`,
                }}
              >
                <span>{item.emoji}</span>
                <span>{item.value}</span>
              </motion.span>
            ))}
          </div>

          {/* divider */}
          <div
            className="h-px rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color.from}35, ${color.to}15, transparent)`,
            }}
          />

          {/* topics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                className="w-1 h-5 rounded-full"
                style={{
                  background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
                }}
                whileHover={{ scaleY: 1.3 }}
              />
              <p
                className="text-xs sm:text-sm font-extrabold uppercase tracking-widest"
                style={{ color: color.from }}
              >
                বিষয়বস্তু
              </p>
            </div>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed sm:leading-loose">
              {exam.topics}
            </p>
          </div>

          {/* hint */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
            <p className="text-[11px] text-slate-300 dark:text-slate-600 shrink-0">
              কপি হবে: পরীক্ষা নং · শ্রেণি · বিষয় · নম্বর · বিষয়বস্তু
            </p>
            <div className="h-px flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WeeklyExamCard;
