import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { useHeroes } from "../../hooks/useHeroes";
import ErrorState from "../common/ErrorState";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/Emptystate";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroItem {
  _id: string;
  imageUrl: string;
  title: string;
  uniqueID: string;
  imagePublicId: string;
  createdAt: string;
  updatedAt: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  tag?: string;
}

const DELAY = 5000;

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (n: number) =>
  String(n)
    .split("")
    .map((c) => BN_DIGITS[+c] ?? c)
    .join("");

/* ── word-by-word stagger title ─────────────────────────────────────── */
const SlideTitle = ({ text, id }: { text: string; id: number }) => {
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  return (
    <h1
      key={id}
      aria-label={text}
      className="bangla m-0 w-full flex flex-wrap gap-x-[0.22em] gap-y-0.5 text-[1.55rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.06] tracking-[-0.03em] text-white"
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.05 + i * 0.055,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};

/* ── preload all images synchronously before first render ───────────── */
function usePreloadedImages(urls: string[]) {
  const [loaded, setLoaded] = useState(false);
  const countRef = useRef(0);

  useEffect(() => {
    if (!urls.length) return;
    countRef.current = 0;
    let cancelled = false;

    urls.forEach((src) => {
      const img = new Image();
      img.fetchPriority = "high";
      img.decoding = "sync";
      img.onload = img.onerror = () => {
        if (cancelled) return;
        countRef.current += 1;
        if (countRef.current >= urls.length) setLoaded(true);
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [urls]);

  return urls.length === 0 ? true : loaded;
}

/* ── main component ─────────────────────────────────────────────────── */
const Hero = () => {
  const { data, isLoading, isError, error } = useHeroes();

  const heroes = useMemo<HeroItem[]>(
    () => (data?.data ?? []) as HeroItem[],
    [data],
  );
  const total = heroes.length;
  const urls = useMemo(() => heroes.map((h) => h.imageUrl), [heroes]);
  const allLoaded = usePreloadedImages(urls);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progKey, setProgKey] = useState(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    if (total <= 1) return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % total);
      setAnimKey((k) => k + 1);
      setProgKey((k) => k + 1);
    }, DELAY);
  }, [total, stopTimer]);

  useEffect(() => {
    if (total <= 1) return;
    startTimer();
    return stopTimer;
  }, [total, startTimer, stopTimer]);

  const go = useCallback(
    (dir: "prev" | "next") => {
      if (total <= 1) return;
      setActive((p) =>
        dir === "next" ? (p + 1) % total : (p - 1 + total) % total,
      );
      setAnimKey((k) => k + 1);
      setProgKey((k) => k + 1);
      startTimer();
    },
    [total, startTimer],
  );

  const goTo = useCallback(
    (index: number) => {
      if (index === active || total <= 1) return;
      setActive(index);
      setAnimKey((k) => k + 1);
      setProgKey((k) => k + 1);
      startTimer();
    },
    [active, total, startTimer],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (
      dragStartX.current !== null &&
      Math.abs(e.clientX - dragStartX.current) > 8
    )
      isDragging.current = true;
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (isDragging.current && Math.abs(delta) > 50 && total > 1)
      go(delta < 0 ? "next" : "prev");
    isDragging.current = false;
  };

  if (isLoading) return <Skeleton variant="hero" />;
  if (isError)
    return (
      <ErrorState message={(error as Error)?.message ?? "Unexpected error."} />
    );
  if (!total) return <EmptyState />;

  /* show skeleton until all images are decoded & ready */
  if (!allLoaded) return <Skeleton variant="hero" />;

  const current = heroes[active];

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "clamp(220px, 46vw, 480px)",
        cursor: total > 1 ? "grab" : "default",
      }}
      aria-label="Hero slider"
      aria-roledescription="carousel"
      role="region"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragStartX.current = null;
        isDragging.current = false;
      }}
      onPointerLeave={() => {
        dragStartX.current = null;
        isDragging.current = false;
      }}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      {/* ── background images ── */}
      {heroes.map((hero, i) => (
        <div
          key={hero._id}
          className="absolute inset-0"
          aria-hidden={i !== active}
          style={{
            opacity: i === active ? 1 : 0,
            transition: "opacity 0.7s cubic-bezier(.16,1,.3,1)",
            zIndex: i === active ? 1 : 0,
          }}
        >
          <img
            src={hero.imageUrl}
            alt={hero.title}
            className="h-full w-full object-cover object-center"
            style={{
              transform: i === active ? "scale(1.035)" : "scale(1)",
              transition: "transform 6s linear",
            }}
            draggable={false}
          />
        </div>
      ))}

      {/* ── cinematic gradient overlays ── */}
      {/* bottom dark band — where text lives */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.44) 38%, transparent 62%)",
        }}
      />
      {/* subtle left-edge vignette */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.28) 0%, transparent 50%)",
        }}
      />

      {/* ── top bar: tag + counter ── */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`tag-${animKey}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5"
          >
            {/* pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white opacity-80" />
            </span>
            <span className="bangla text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/75 font-medium">
              {current.tag ?? "রয়েল একাডেমি • বেলকুচি"}
            </span>
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <div className="flex items-center gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={`count-${active}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="text-sm font-semibold text-white tabular-nums"
                style={{ fontFamily: "'Noto Serif Bengali', serif" }}
              >
                {toBn(active + 1)}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-white/40 font-light">
              /{toBn(total)}
            </span>
          </div>
        )}
      </div>

      {/* ── bottom content ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-5 lg:px-8 lg:pb-6">
        {/* title — full width */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`title-${animKey}`}
            className="w-full"
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
          >
            <SlideTitle text={current.title} id={animKey} />
          </motion.div>
        </AnimatePresence>

        {/* subtitle — desktop only, compact */}
        <AnimatePresence mode="wait">
          {current.subtitle && (
            <motion.p
              key={`sub-${animKey}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.18, duration: 0.3 }}
              className="bangla mt-1.5 hidden max-w-[64ch] text-[0.78rem] leading-6 text-white/60 md:block"
            >
              {current.subtitle}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA + nav controls */}
        <div className="mt-3 flex items-center justify-between gap-4">
          {/* CTA button */}
          <div className="min-h-[34px]">
            {current.ctaLabel && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`cta-${animKey}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.22, duration: 0.28 }}
                >
                  <Link
                    to={current.ctaHref ?? "#"}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-black text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-white hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <span className="bangla">{current.ctaLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* prev / dots / next */}
          {total > 1 && (
            <div
              className="flex items-center gap-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* prev */}
              <button
                onClick={() => go("prev")}
                aria-label="Previous slide"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* progress dots */}
              <div className="flex items-center gap-1.5 px-0.5">
                {heroes.map((hero, i) => (
                  <motion.button
                    key={hero._id}
                    onClick={() => goTo(i)}
                    aria-label={`স্লাইড ${toBn(i + 1)}`}
                    className="relative h-[3px] overflow-hidden rounded-full"
                    animate={{
                      width: i === active ? 32 : 12,
                      opacity: i === active ? 1 : 0.45,
                    }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="absolute inset-0 bg-white/30" />
                    {i === active && (
                      <motion.span
                        key={`prog-${progKey}-${i}`}
                        className="absolute inset-y-0 left-0 w-full origin-left bg-white"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: DELAY / 1000, ease: "linear" }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* next */}
              <button
                onClick={() => go("next")}
                aria-label="Next slide"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
