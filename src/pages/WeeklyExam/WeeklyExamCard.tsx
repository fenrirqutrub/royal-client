import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { X, Eye, Copy, Check } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const COLORS = [
  { from: "#6366f1", to: "#8b5cf6", soft: "#ede9fe", text: "#4338ca" },
  { from: "#0ea5e9", to: "#06b6d4", soft: "#e0f2fe", text: "#0369a1" },
  { from: "#f43f5e", to: "#ec4899", soft: "#fce7f3", text: "#be123c" },
];

// ── Shared slider pieces ───────────────────────────────────
const AnimatedSlide = ({ img, isActive }: any) => (
  <div className="relative w-full h-full overflow-hidden">
    <motion.img
      src={img.imageUrl}
      alt="exam"
      className="w-full h-full object-cover"
      animate={{ scale: isActive ? 1 : 1.08 }}
      initial={{ scale: 1.08 }}
      transition={{ duration: 6, ease: "linear" }}
    />
  </div>
);

const SlideDots = ({ count, active, color }: any) => (
  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === active ? 26 : 7,
          background: i === active ? "#fff" : "rgba(255,255,255,0.4)",
          boxShadow: i === active ? `0 0 8px ${color.from}90` : "none",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-[7px] rounded-full"
      />
    ))}
  </div>
);

const SlideProgress = ({ color, duration = 3500 }: any) => (
  <div
    className="absolute top-0 left-0 right-0 z-30 h-[3px]"
    style={{ background: "rgba(255,255,255,0.12)" }}
  >
    <motion.div
      className="h-full"
      style={{
        background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
      }}
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  </div>
);

// ── Copy button ────────────────────────────────────────────
const CopyBtn = ({ exam, color }: any) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(
      `পরিক্ষা নং = ${exam.ExamNumber}\n${exam.class} = ${exam.subject} - ${exam.mark} নম্বর\n\n${exam.topics}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <motion.button
      onClick={handle}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.04 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 border-2"
      style={
        copied
          ? {
              background: `${color.from}18`,
              color: color.from,
              borderColor: `${color.from}55`,
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
          <motion.span
            key="c"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            key="n"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {copied ? "কপি হয়েছে!" : "কপি করুন"}
    </motion.button>
  );
};

// ── MODAL ─────────────────────────────────────────────────
const ExamModal = ({ exam, color, onClose }: any) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const hasImages = exam.images?.length > 0;
  const multipleImages = hasImages && exam.images.length > 1;

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
        className="fixed inset-0 z-[100]"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      />

      <motion.div
        key="sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[101] left-0 right-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:p-6"
        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        {/* The actual card */}
        <div
          className="relative bg-white dark:bg-[#0f1117] rounded-lg w-full  overflow-hidden"
          style={{
            maxHeight: "96dvh",
            boxShadow:
              "0 -8px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Scrollable inner (hidden scrollbar) ── */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "96dvh",
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none",
            }}
          >
            {/* Drag handle (mobile) */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* ── SWIPER SECTION ── */}
            {hasImages ? (
              <div
                className="relative"
                style={{ height: "65vw", maxHeight: 500, minHeight: 220 }}
              >
                {multipleImages && (
                  <SlideProgress key={progressKey} color={color} />
                )}

                {/* Dark gradient over image */}
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
                  {exam.images.map((img: any, i: number) => (
                    <SwiperSlide key={img.publicId ?? i}>
                      <AnimatedSlide img={img} isActive={i === activeSlide} />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {multipleImages && (
                  <SlideDots
                    count={exam.images.length}
                    active={activeSlide}
                    color={color}
                  />
                )}

                {/* ── Exam number badge on swiper ── */}
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

                {/* Close btn */}
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
              /* No image — gradient header */
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
                <p className="text-slate-400 text-sm mt-1">{exam.teacher}</p>
              </div>
            )}

            {/* ── Subject + teacher below swiper ── */}
            {hasImages && (
              <div className="px-5 pt-5 pb-1 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-2xl leading-tight truncate">
                    {exam.subject}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 font-medium">
                    {exam.teacher}
                  </p>
                </div>
                <CopyBtn exam={exam} color={color} />
              </div>
            )}

            {/* ── Body ── */}
            <div className="px-5 pb-8 pt-4 flex flex-col gap-5">
              {/* Meta pills */}
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

              {/* Divider */}
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

              {/* Divider */}
              <div className="h-px rounded-full bg-slate-100 dark:bg-slate-800" />

              {/* Copy button row */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-300 dark:text-slate-600">
                  কপি হবে: পরীক্ষা নং · শ্রেণি · বিষয় · নম্বর · বিষয়বস্তু
                </p>
                {/* Close btn on md (no swiper overlap) */}
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

// ── CARD ──────────────────────────────────────────────────
const WeeklyExamCard = ({ exam, index }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const swiperRef = useRef(null);
  const color = COLORS[index % COLORS.length];
  const hasImages = exam.images?.length > 0;
  const multipleImages = hasImages && exam.images.length > 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative group w-full"
        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
      >
        <motion.div
          className="absolute -inset-2 rounded-[32px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse, ${color.from}20, transparent 70%)`,
            filter: "blur(18px)",
          }}
        />

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="rounded-[20px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden flex flex-col"
          style={{ height: "580px" }}
        >
          {/* Image */}
          {hasImages ? (
            <div
              className="relative overflow-hidden shrink-0"
              style={{ height: "300px" }}
            >
              {multipleImages && (
                <SlideProgress key={progressKey} color={color} />
              )}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 35%, rgba(0,0,0,0.62) 100%)",
                }}
              />
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
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
                {exam.images.map((img: any, i: number) => (
                  <SwiperSlide key={img.publicId ?? i}>
                    <AnimatedSlide img={img} isActive={i === activeSlide} />
                  </SwiperSlide>
                ))}
              </Swiper>
              {multipleImages && (
                <SlideDots
                  count={exam.images.length}
                  active={activeSlide}
                  color={color}
                />
              )}

              {/* Exam number on swiper */}
              <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5">
                <p className="text-white font-black text-xl drop-shadow-lg">
                  পরীক্ষা নং — {toBn(exam.ExamNumber)}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="h-1.5 w-full shrink-0"
              style={{
                background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
              }}
            />
          )}

          {/* Body */}
          <div className="flex-1 flex flex-col p-5 gap-3 min-h-0">
            {/* Badge + subject + teacher */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-black text-lg"
                style={{
                  background: color.soft,
                  color: color.text,
                  border: `1.5px solid ${color.from}30`,
                }}
              >
                {toBn(exam.ExamNumber)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight truncate">
                  {exam.subject}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {exam.teacher}
                </p>
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { emoji: "🏫", value: exam.class },
                { emoji: "📊", value: `${exam.mark} নম্বর` },
                { emoji: "📅", value: exam.date },
              ].map((item) => (
                <span
                  key={item.value}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold border"
                  style={{
                    background: `${color.from}0d`,
                    color: color.text,
                    borderColor: `${color.from}22`,
                  }}
                >
                  <span>{item.emoji}</span>
                  <span>{item.value}</span>
                </span>
              ))}
            </div>

            {/* Divider */}
            <div
              className="h-px rounded-full shrink-0"
              style={{
                background: `linear-gradient(90deg, ${color.from}35, ${color.to}15, transparent)`,
              }}
            />

            {/* Topics preview — 4 lines clamp */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <p
                className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {exam.topics}
              </p>
            </div>

            {/* View button */}
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-base text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                boxShadow: `0 4px 16px ${color.from}45`,
              }}
            >
              <Eye className="w-4 h-4" />
              বিস্তারিত দেখুন
            </motion.button>
          </div>
        </motion.div>
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
