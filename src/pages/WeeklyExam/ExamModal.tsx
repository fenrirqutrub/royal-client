// src/components/WeeklyExam/ExamModal.tsx
import { useEffect, useCallback, useState, useRef } from "react";
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pause,
  Play,
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
import type {
  ExamModalProps,
  ZoomableImageProps,
} from "../../types/WeeklyExamTypes";

const ZoomableImage = ({ src, alt, onSingleTap }: ZoomableImageProps) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const lastTapTime = useRef(0);
  const lastTapPos = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const clampOffset = (
    ox: number,
    oy: number,
    z: number,
    el: HTMLDivElement,
  ) => {
    const rect = el.getBoundingClientRect();
    const maxX = (rect.width * (z - 1)) / 2;
    const maxY = (rect.height * (z - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  };

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // ── Mouse (desktop) ─────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoomRef.current <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || zoomRef.current <= 1) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const raw = {
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    };
    setOffset(clampOffset(raw.x, raw.y, zoomRef.current, el));
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  // ── Wheel / Touch — registered with non-passive listeners ───────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = Math.min(5, Math.max(1, zoomRef.current - e.deltaY * 0.004));
      if (next <= 1) setOffset({ x: 0, y: 0 });
      setZoom(next);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist.current = Math.hypot(dx, dy);
        return;
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];
        const now = Date.now();
        const dx = t.clientX - lastTapPos.current.x;
        const dy = t.clientY - lastTapPos.current.y;

        if (now - lastTapTime.current < 300 && Math.hypot(dx, dy) < 30) {
          // double tap
          e.preventDefault();
          const z = zoomRef.current;
          if (z > 1) {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          } else {
            setZoom(2.5);
          }
          lastTapTime.current = 0;
          return;
        }

        lastTapTime.current = now;
        lastTapPos.current = { x: t.clientX, y: t.clientY };

        if (zoomRef.current > 1) {
          isDragging.current = true;
          dragStart.current = {
            x: t.clientX,
            y: t.clientY,
            ox: offsetRef.current.x,
            oy: offsetRef.current.y,
          };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDist.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / lastPinchDist.current;
        lastPinchDist.current = dist;
        const next = Math.min(5, Math.max(1, zoomRef.current * scale));
        if (next <= 1) setOffset({ x: 0, y: 0 });
        setZoom(next);
      } else if (
        e.touches.length === 1 &&
        isDragging.current &&
        zoomRef.current > 1
      ) {
        e.preventDefault();
        const elInner = containerRef.current;
        if (!elInner) return;
        const t = e.touches[0];
        const raw = {
          x: dragStart.current.ox + (t.clientX - dragStart.current.x),
          y: dragStart.current.oy + (t.clientY - dragStart.current.y),
        };
        setOffset(clampOffset(raw.x, raw.y, zoomRef.current, elInner));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) lastPinchDist.current = null;
      if (e.touches.length === 0) {
        isDragging.current = false;
        // single tap → pause (only when not zoomed, handled via lastTapTime check)
        const timeSinceLast = Date.now() - lastTapTime.current;
        if (timeSinceLast > 50 && timeSinceLast < 250 && zoomRef.current <= 1) {
          // This fires after double-tap guard, safe to call
          setTimeout(() => {
            const elapsed = Date.now() - lastTapTime.current;
            if (elapsed >= 280) onSingleTap();
          }, 300);
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSingleTap]);

  // desktop single click pause
  const handleClick = (e: React.MouseEvent) => {
    if (zoomRef.current > 1) return;
    e.stopPropagation();
    onSingleTap();
  };

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden relative"
      style={{
        cursor: zoom > 1 ? "grab" : "pointer",
        touchAction: "none",
      }}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto block"
        style={{
          maxHeight: "90dvh",
          objectFit: "contain",
          transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
          transition: isDragging.current ? "none" : "transform 0.12s ease",
          userSelect: "none",
          pointerEvents: "none",
          willChange: "transform",
        }}
        loading="eager"
        draggable={false}
      />

      {/* Zoom buttons */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          {zoom > 1 && (
            <motion.button
              key="reset"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white text-[11px] font-bold backdrop-blur-sm"
            >
              <RotateCcw className="w-3 h-3" />
              {Math.round(zoom * 100)}%
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {zoom > 1 && (
            <motion.button
              key="zout"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => {
                e.stopPropagation();
                const next = Math.max(1, zoom - 0.5);
                if (next <= 1) setOffset({ x: 0, y: 0 });
                setZoom(next);
              }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(5, z + 0.5));
          }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
      </div>

      {/* hint */}
      <div className="absolute bottom-3 left-3 text-white/40 text-[10px] pointer-events-none leading-tight select-none">
        {zoom === 1
          ? "double-tap · pinch · scroll to zoom"
          : "drag to pan · tap % to reset"}
      </div>
    </div>
  );
};

// ─── ExamModal ───────────────────────────────────────────────────────────────
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
  const [isPaused, setIsPaused] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const images = Array.isArray(exam.images) ? exam.images : [];
  const hasImages = images.length > 0;
  const multipleImages = images.length > 1;

  const numberInfo = getNumberInfo(exam);
  const isPageType = exam.numberType === "pageNumber";
  const isStudent = user?.role === "student";
  const canSeeQuestion = !isStudent && !!exam.question;

  const getImageUrl = (img: unknown): string => {
    if (typeof img === "string") return img;
    if (img && typeof img === "object") {
      const o = img as Record<string, string>;
      return o.url ?? o.imageUrl ?? "";
    }
    return "";
  };

  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      if (p) swiperRef.current?.autoplay?.start();
      else swiperRef.current?.autoplay?.stop();
      return !p;
    });
  }, []);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
          className="bangla absolute inset-0 w-screen h-dvh overflow-y-auto bg-[var(--color-bg)] shadow-2xl flex flex-col"
        >
          {/* Close */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-[100] p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
          >
            <X size={18} strokeWidth={2.5} />
          </motion.button>

          {/* Images */}
          {hasImages && (
            <div className="relative w-full bg-black">
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation, Pagination, Autoplay]}
                loop={multipleImages}
                autoplay={
                  multipleImages
                    ? { delay: 3200, disableOnInteraction: false }
                    : false
                }
                pagination={{ clickable: true }}
                navigation={multipleImages}
                className="w-full"
              >
                {images.map((img, i) => {
                  const imgUrl = getImageUrl(img);
                  const urls = getCloudinaryOptimizedUrls(imgUrl);
                  return (
                    <SwiperSlide key={i}>
                      <ZoomableImage
                        src={urls.auto}
                        alt={exam.subject}
                        onSingleTap={togglePause}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none z-10" />

              <AnimatePresence>
                {isPaused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                      bg-black/55 backdrop-blur-sm rounded-full px-4 py-2.5
                      text-white text-xs font-bold flex items-center gap-2 pointer-events-none"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Paused
                  </motion.div>
                )}
              </AnimatePresence>

              {canSeeQuestion && (
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5
                    rounded-full bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-semibold shadow-lg pointer-events-none"
                >
                  <HelpCircle className="w-4 h-4" />
                  প্রশ্ন সংযুক্ত আছে
                </motion.div>
              )}

              {/* Top-right: pause + download */}
              <div
                className="absolute top-4 right-16 z-20 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {multipleImages && (
                  <motion.button
                    onClick={togglePause}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-black/60  text-white backdrop-blur-sm"
                  >
                    {isPaused ? (
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
                  Download ({images.length && images.length})
                </motion.button>
              </div>
            </div>
          )}

          {/* Content */}
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--color-active-bg)] text-[var(--color-gray)] text-sm font-medium"
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
              <div className="text-[16px] leading-relaxed text-[var(--color-active-text)] whitespace-pre-line border border-[var(--color-active-border)] p-4 sm:p-5 rounded-xl text-left">
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
                <div className="text-[16px] leading-relaxed whitespace-pre-line p-4 sm:p-5 rounded-2xl text-left bg-[var(--color-active-bg)]">
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
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded text-xs font-bold shrink-0 bg-red-800 text-[var(--color-bg)]"
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
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded text-xs font-bold shrink-0 bg-amber-400 text-[var(--color-bg)]"
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
                    "flex shrink-0 items-center gap-2 rounded px-4 py-2.5 text-sm font-black transition-all duration-200 border border-green-800",
                    copied
                      ? "bg-green-800 text-[var(--color-bg)]"
                      : "bg-green-700 text-[var(--color-bg)] shadow-md",
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
