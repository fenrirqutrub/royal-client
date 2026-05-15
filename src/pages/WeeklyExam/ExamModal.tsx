// src/components/WeeklyExam/ExamModal.tsx
import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Copy,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Hash,
  Folder,
  FileText,
  HelpCircle,
  MessageSquareText,
  Pencil,
  Trash2,
  Download,
  Pause,
  Play,
  ExternalLink,
} from "lucide-react";
import { toBn, getNumberInfo } from "../../utility/Formatters";
import { useAuth } from "../../context/AuthContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getCloudinaryOptimizedUrls } from "../../hooks/useCloudinaryUpload";
import type { ExamModalProps } from "../../types/WeeklyExamTypes";
import ZoomableImage from "./ZoomableImage";

const getImageUrl = (img: unknown): string => {
  if (typeof img === "string") return img;
  if (img && typeof img === "object") {
    const o = img as Record<string, string>;
    return o.imageUrl ?? o.url ?? o.secure_url ?? "";
  }
  return "";
};

const ExamModal = ({
  exam,
  onClose,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: ExamModalProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const userPausedRef = useRef(false);

  const images = useMemo(
    () => (Array.isArray(exam.images) ? exam.images : []),
    [exam.images],
  );

  const hasImages = images.length > 0;
  const multipleImages = images.length > 1;

  const numberInfo = getNumberInfo(exam);
  const isPageType = exam.numberType === "pageNumber";
  const isStudent = user?.role === "student";
  const canSeeQuestion = !isStudent && !!exam.question;

  // ── current backdrop blur URL (low quality for performance) ─────────
  const currentBgUrl = useMemo(() => {
    const img = images[activeIndex];
    if (!img) return "";
    const raw = getImageUrl(img);
    if (!raw) return "";
    const urls = getCloudinaryOptimizedUrls(raw);
    return urls.thumb ?? urls.auto ?? raw;
  }, [images, activeIndex]);

  useEffect(() => {
    const check = () => {
      const mobile =
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleOpenInBrowser = useCallback(() => {
    const currentImg = images[activeIndex];
    if (!currentImg) return;
    const imgUrl = getImageUrl(currentImg);
    if (imgUrl) window.open(imgUrl, "_blank", "noopener,noreferrer");
  }, [images, activeIndex]);

  const togglePause = useCallback(() => {
    if (isImageZoomed) return;
    if (!multipleImages) return;
    const swiper = swiperRef.current;
    if (!swiper) return;

    setIsPaused((prev) => {
      const next = !prev;
      userPausedRef.current = next;
      if (next) {
        swiper.autoplay?.stop();
      } else {
        swiper.autoplay?.start();
      }
      return next;
    });
  }, [isImageZoomed, multipleImages]);

  const handleZoomChange = useCallback(
    (zoomed: boolean) => {
      setIsImageZoomed(zoomed);
      const swiper = swiperRef.current;
      if (!swiper || !multipleImages) return;

      if (zoomed) {
        swiper.autoplay?.stop();
        swiper.allowTouchMove = false;
      } else {
        swiper.allowTouchMove = true;
        if (!userPausedRef.current) {
          swiper.autoplay?.start();
          setIsPaused(false);
        }
      }
    },
    [multipleImages],
  );

  const handleSingleTap = useCallback(() => {
    togglePause();
  }, [togglePause]);

  const handleDownloadAll = useCallback(async () => {
    for (let i = 0; i < images.length; i++) {
      const imgUrl = getImageUrl(images[i]);
      try {
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exam.subject}_exam${exam.ExamNumber}_${i + 1}.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (i < images.length - 1) await new Promise((r) => setTimeout(r, 400));
      } catch (err) {
        console.error("Download failed:", i, err);
      }
    }
  }, [images, exam.subject, exam.ExamNumber]);

  const handleCopy = useCallback(async () => {
    const lines = [
      `পরীক্ষা নং = ${toBn(exam.ExamNumber)}`,
      numberInfo ? `${numberInfo.label} নং = ${numberInfo.value}` : null,
      `${exam.class} = ${exam.subject} - ${toBn(exam.mark)} নম্বর`,
      ``,
      `📝 বিষয়বস্তু:`,
      exam.topics,
      canSeeQuestion ? `\n❓ প্রশ্ন:\n${exam.question}` : null,
    ].filter((l): l is string => l !== null);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [exam, numberInfo, canSeeQuestion]);

  const handleEdit = () => {
    onEdit?.();
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const infoTags = [
    { icon: GraduationCap, label: exam.class },
    { icon: BookOpen, label: `${toBn(exam.mark)} নম্বর` },
    { icon: CalendarDays, label: exam.date },
    ...(numberInfo
      ? [
          {
            icon: isPageType ? FileText : Hash,
            label: `${numberInfo.label} ${numberInfo.value}`,
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="bangla absolute inset-0 w-screen h-dvh overflow-y-auto
            bg-[var(--color-bg)] shadow-2xl flex flex-col"
        >
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-[100] p-2 rounded-full
              bg-red-500 hover:bg-red-600 text-white shadow-lg"
          >
            <X size={18} strokeWidth={2.5} />
          </motion.button>

          {/* ── Images ─────────────────────────────────────────────── */}
          {hasImages && (
            <div className="relative w-full">
              {/* ── Glass backdrop — sits behind swiper, fills same area ── */}
              <div
                className="absolute inset-0 overflow-hidden z-0"
                aria-hidden="true"
              >
                {currentBgUrl && (
                  <img
                    key={currentBgUrl}
                    src={currentBgUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover
                      scale-125 blur-2xl saturate-[1.3] opacity-50"
                    style={{
                      transition: "opacity 0.6s ease",
                    }}
                    loading="eager"
                    draggable={false}
                  />
                )}
                {/* subtle dark tint so main image pops */}
                <div className="absolute inset-0 bg-black/30" />
              </div>

              {/* ── Swiper — relative so it defines the container height ── */}
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                onSlideChange={(s) => {
                  setIsImageZoomed(false);
                  setActiveIndex(s.realIndex);
                }}
                modules={[Navigation, Pagination, Autoplay]}
                loop={multipleImages}
                allowTouchMove={!isImageZoomed}
                simulateTouch={!isImageZoomed}
                autoplay={
                  multipleImages
                    ? { delay: 3200, disableOnInteraction: false }
                    : false
                }
                pagination={{ clickable: true }}
                navigation={multipleImages}
                className="w-full relative z-[1]"
              >
                {images.map((img, i) => {
                  const imgUrl = getImageUrl(img);
                  const urls = getCloudinaryOptimizedUrls(imgUrl);
                  return (
                    <SwiperSlide key={i}>
                      <ZoomableImage
                        src={urls.auto}
                        alt={exam.subject}
                        onSingleTap={handleSingleTap}
                        onZoomChange={handleZoomChange}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />

              {/* question badge */}
              {canSeeQuestion && (
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5
                    rounded-full bg-[var(--color-text)] text-[var(--color-bg)]
                    text-xs font-semibold shadow-lg pointer-events-none"
                >
                  <HelpCircle className="w-4 h-4" />
                  প্রশ্ন সংযুক্ত আছে
                </motion.div>
              )}

              {/* top-right controls */}
              <div
                className="absolute top-4 right-16 z-20 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {!isMobile && (
                  <motion.button
                    onClick={handleOpenInBrowser}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    title="Open image in new tab"
                    className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm
                      hover:bg-white/20 transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                )}

                {multipleImages && (
                  <motion.button
                    onClick={togglePause}
                    whileTap={{ scale: 0.9 }}
                    className={[
                      "p-2 rounded-full backdrop-blur-sm transition-colors duration-200",
                      isPaused || isImageZoomed
                        ? "bg-white/20 text-white/60"
                        : "bg-black/60 text-white",
                    ].join(" ")}
                    title={isPaused ? "Play slideshow" : "Pause slideshow"}
                  >
                    {isPaused || isImageZoomed ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </motion.button>
                )}

                <motion.button
                  onClick={handleDownloadAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full
                    bg-green-800 text-white/80 text-xs font-semibold backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  Download ({images.length})
                </motion.button>
              </div>
            </div>
          )}

          {/* ── Content ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center pr-8"
            >
              <span className="text-md font-semibold tracking-widest text-[var(--color-gray)] uppercase">
                সাপ্তাহিক পরীক্ষা নং-{toBn(exam.ExamNumber)}
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--color-text)] leading-tight">
                {exam.subject}
              </h2>
            </motion.div>

            {exam.teacher && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-center gap-2 text-[var(--color-gray)] text-md"
              >
                <Folder size={15} className="flex-shrink-0" />
                <span>{exam.teacher}</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2.5"
            >
              {infoTags.map(({ icon: Icon, label }, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl
                    bg-[var(--color-active-bg)] text-[var(--color-gray)] text-sm font-medium"
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[var(--color-text)]" />
                <span className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                  <MessageSquareText size={14} />
                  বিষয়বস্তু ও নির্দেশনা
                </span>
              </div>
              <div
                className="text-[16px] leading-relaxed text-[var(--color-active-text)]
                  whitespace-pre-line border border-[var(--color-active-border)]
                  p-4 sm:p-5 rounded-xl text-left"
              >
                {exam.topics}
              </div>
            </motion.div>

            {canSeeQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-[var(--color-active-text)]" />
                  <span className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                    <HelpCircle size={14} />
                    প্রশ্ন
                  </span>
                </div>
                <div
                  className="text-[16px] leading-relaxed whitespace-pre-line
                    p-4 sm:p-5 rounded-2xl text-left bg-[var(--color-active-bg)]"
                >
                  {exam.question}
                </div>
              </motion.div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-[var(--color-gray)] leading-snug">
                পরীক্ষার তথ্য ও বিষয়বস্তু কপি হবে
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {canDelete && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded text-xs font-bold shrink-0 bg-red-600 text-[var(--color-text)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </motion.button>
                )}
                {canEdit && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded text-xs font-bold shrink-0 bg-[var(--color-text)] text-[var(--color-bg)]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </motion.button>
                )}
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded px-4 py-2.5 text-sm font-black transition-all duration-200 border border-[var(--color-active-border)]",
                    copied
                      ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                      : "bg-[var(--color-text)] text-[var(--color-bg)] shadow-md",
                  ].join(" ")}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="copied"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.1,
                            type: "spring",
                            damping: 15,
                          }}
                        >
                          <CheckCircle2 size={16} />
                        </motion.div>
                        <span>কপি হয়েছে</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          whileHover={{
                            y: [-2, 0, -2],
                            transition: {
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }}
                        >
                          <Copy size={16} />
                        </motion.div>
                        <span>কপি করুন</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExamModal;
