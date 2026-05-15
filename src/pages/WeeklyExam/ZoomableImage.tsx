// src/components/WeeklyExam/ZoomableImage.tsx
import { useEffect, useCallback, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export type ZoomableImageProps = {
  src: string;
  alt: string;
  onSingleTap: () => void;
  onZoomChange?: (zoomed: boolean) => void;
};

const ZoomableImage = ({
  src,
  alt,
  onSingleTap,
  onZoomChange,
}: ZoomableImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const wasZoomedRef = useRef(false);

  const isDraggingRef = useRef(false);
  const movedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const lastPinchDistRef = useRef<number | null>(null);
  const lastPinchCenterRef = useRef({ x: 0, y: 0 });

  const lastTapRef = useRef(0);
  const lastTapPosRef = useRef({ x: 0, y: 0 });
  const tapTimerRef = useRef<number | null>(null);

  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const lastMovePosRef = useRef({ x: 0, y: 0 });
  const inertiaRef = useRef(0);

  // debounced display zoom to avoid re-renders during pinch
  const displayZoomTimerRef = useRef<number | null>(null);
  const [displayZoom, setDisplayZoom] = useState(1);

  const MAX_ZOOM = 5;
  const DRAG_THRESHOLD = 5;
  const INERTIA_FRICTION = 0.94;
  const INERTIA_STOP = 0.3;

  // ── notify zoom state changes (debounced to avoid spam) ─────────────
  const notifyZoomChange = useCallback(
    (z: number) => {
      const isZoomed = z > 1;
      if (isZoomed !== wasZoomedRef.current) {
        wasZoomedRef.current = isZoomed;
        onZoomChange?.(isZoomed);
      }
    },
    [onZoomChange],
  );

  // ── update display zoom with debounce during continuous gestures ─────
  const updateDisplayZoom = useCallback(
    (z: number, immediate = false) => {
      notifyZoomChange(z);
      if (immediate) {
        if (displayZoomTimerRef.current)
          cancelAnimationFrame(displayZoomTimerRef.current);
        setDisplayZoom(z);
        return;
      }
      if (displayZoomTimerRef.current) return; // already scheduled
      displayZoomTimerRef.current = requestAnimationFrame(() => {
        setDisplayZoom(zoomRef.current);
        displayZoomTimerRef.current = null;
      });
    },
    [notifyZoomChange],
  );

  // ── apply transform directly to DOM ─────────────────────────────────
  const applyTransform = useCallback((animated = false) => {
    const img = imgRef.current;
    if (!img) return;
    const { x, y } = offsetRef.current;
    const z = zoomRef.current;
    if (animated) {
      img.style.transition =
        "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    } else {
      img.style.transition = "none";
    }
    img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${z})`;
  }, []);

  // ── clamp offset ───────────────────────────────────────────────────
  const clampOffset = useCallback((x: number, y: number, z: number) => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || z <= 1) return { x: 0, y: 0 };

    const baseW = img.offsetWidth;
    const baseH = img.offsetHeight;
    const cW = container.clientWidth;
    const cH = container.clientHeight;

    const maxX = Math.max(0, (baseW * z - cW) / 2);
    const maxY = Math.max(0, (baseH * z - cH) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // ── set zoom toward a focus point ───────────────────────────────────
  const setZoomLevel = useCallback(
    (
      nextZoom: number,
      focus?: { x: number; y: number },
      animated = false,
      immediate = false,
    ) => {
      const container = containerRef.current;
      const prevZ = zoomRef.current;
      const z = Math.max(1, Math.min(MAX_ZOOM, nextZoom));

      let nx = offsetRef.current.x;
      let ny = offsetRef.current.y;

      if (focus && container) {
        const rect = container.getBoundingClientRect();
        const px = focus.x - rect.left - rect.width / 2;
        const py = focus.y - rect.top - rect.height / 2;
        const s = z / prevZ;
        nx = offsetRef.current.x * s + px * (1 - s);
        ny = offsetRef.current.y * s + py * (1 - s);
      }

      const clamped = z <= 1 ? { x: 0, y: 0 } : clampOffset(nx, ny, z);
      zoomRef.current = z;
      offsetRef.current = clamped;
      updateDisplayZoom(z, immediate);
      applyTransform(animated);
    },
    [applyTransform, clampOffset, updateDisplayZoom],
  );

  const resetZoom = useCallback(() => {
    cancelAnimationFrame(inertiaRef.current);
    velocityRef.current = { x: 0, y: 0 };
    setZoomLevel(1, undefined, true, true);
  }, [setZoomLevel]);

  const zoomIn = useCallback(
    () => setZoomLevel(zoomRef.current + 0.5, undefined, true, true),
    [setZoomLevel],
  );

  const zoomOut = useCallback(
    () => setZoomLevel(zoomRef.current - 0.5, undefined, true, true),
    [setZoomLevel],
  );

  // ── inertia after drag release ──────────────────────────────────────
  const startInertia = useCallback(() => {
    cancelAnimationFrame(inertiaRef.current);
    const step = () => {
      const vx = velocityRef.current.x;
      const vy = velocityRef.current.y;
      if (Math.abs(vx) < INERTIA_STOP && Math.abs(vy) < INERTIA_STOP) {
        velocityRef.current = { x: 0, y: 0 };
        return;
      }
      velocityRef.current.x *= INERTIA_FRICTION;
      velocityRef.current.y *= INERTIA_FRICTION;

      const rawX = offsetRef.current.x + velocityRef.current.x;
      const rawY = offsetRef.current.y + velocityRef.current.y;
      const clamped = clampOffset(rawX, rawY, zoomRef.current);
      offsetRef.current = clamped;
      applyTransform(false);

      if (Math.abs(clamped.x - rawX) > 0.5) velocityRef.current.x = 0;
      if (Math.abs(clamped.y - rawY) > 0.5) velocityRef.current.y = 0;

      inertiaRef.current = requestAnimationFrame(step);
    };
    inertiaRef.current = requestAnimationFrame(step);
  }, [clampOffset, applyTransform]);

  // ── touch events ────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      cancelAnimationFrame(inertiaRef.current);
      velocityRef.current = { x: 0, y: 0 };

      if (e.touches.length === 2) {
        e.preventDefault();
        isDraggingRef.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDistRef.current = Math.hypot(dx, dy);
        lastPinchCenterRef.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
        return;
      }

      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const now = Date.now();
      const tapDx = t.clientX - lastTapPosRef.current.x;
      const tapDy = t.clientY - lastTapPosRef.current.y;

      if (now - lastTapRef.current < 300 && Math.hypot(tapDx, tapDy) < 30) {
        e.preventDefault();
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        lastTapRef.current = 0;
        if (zoomRef.current > 1) {
          resetZoom();
        } else {
          setZoomLevel(2.5, { x: t.clientX, y: t.clientY }, true, true);
        }
        return;
      }

      lastTapRef.current = now;
      lastTapPosRef.current = { x: t.clientX, y: t.clientY };

      isDraggingRef.current = true;
      movedRef.current = false;
      dragStartRef.current = {
        x: t.clientX,
        y: t.clientY,
        ox: offsetRef.current.x,
        oy: offsetRef.current.y,
      };
      lastMoveTimeRef.current = now;
      lastMovePosRef.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const pScale = dist / lastPinchDistRef.current;
        lastPinchDistRef.current = dist;

        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const panDx = cx - lastPinchCenterRef.current.x;
        const panDy = cy - lastPinchCenterRef.current.y;
        lastPinchCenterRef.current = { x: cx, y: cy };

        const rect = el.getBoundingClientRect();
        const relX = cx - rect.left - rect.width / 2;
        const relY = cy - rect.top - rect.height / 2;

        const oldZ = zoomRef.current;
        const newZ = Math.max(1, Math.min(MAX_ZOOM, oldZ * pScale));
        const zs = newZ / oldZ;

        const nx = offsetRef.current.x * zs + relX * (1 - zs) + panDx;
        const ny = offsetRef.current.y * zs + relY * (1 - zs) + panDy;

        const clamped = newZ <= 1 ? { x: 0, y: 0 } : clampOffset(nx, ny, newZ);
        zoomRef.current = newZ;
        offsetRef.current = clamped;
        updateDisplayZoom(newZ); // debounced during pinch
        applyTransform(false);
        return;
      }

      if (e.touches.length !== 1 || !isDraggingRef.current) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      if (!movedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      if (zoomRef.current <= 1) {
        isDraggingRef.current = false;
        return;
      }

      e.preventDefault();
      movedRef.current = true;

      const now = Date.now();
      const dt = now - lastMoveTimeRef.current;
      if (dt > 0) {
        const f = 16 / Math.max(dt, 4);
        velocityRef.current = {
          x: (t.clientX - lastMovePosRef.current.x) * f,
          y: (t.clientY - lastMovePosRef.current.y) * f,
        };
      }
      lastMoveTimeRef.current = now;
      lastMovePosRef.current = { x: t.clientX, y: t.clientY };

      const rawX = dragStartRef.current.ox + dx;
      const rawY = dragStartRef.current.oy + dy;
      const clamped = clampOffset(rawX, rawY, zoomRef.current);

      // softer rubber-band
      offsetRef.current = {
        x: clamped.x + (rawX - clamped.x) * 0.15,
        y: clamped.y + (rawY - clamped.y) * 0.15,
      };
      applyTransform(false);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        if (lastPinchDistRef.current !== null) {
          // pinch just ended — update display immediately
          updateDisplayZoom(zoomRef.current, true);
        }
        lastPinchDistRef.current = null;
      }
      if (e.touches.length !== 0) return;

      if (isDraggingRef.current && movedRef.current && zoomRef.current > 1) {
        const clamped = clampOffset(
          offsetRef.current.x,
          offsetRef.current.y,
          zoomRef.current,
        );
        const snapX = Math.abs(clamped.x - offsetRef.current.x) > 1;
        const snapY = Math.abs(clamped.y - offsetRef.current.y) > 1;
        if (snapX || snapY) {
          offsetRef.current = clamped;
          applyTransform(true);
          velocityRef.current = { x: 0, y: 0 };
        } else {
          startInertia();
        }
      }

      if (isDraggingRef.current && !movedRef.current && zoomRef.current <= 1) {
        tapTimerRef.current = window.setTimeout(() => {
          onSingleTap();
          tapTimerRef.current = null;
        }, 300);
      }

      isDraggingRef.current = false;
      movedRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      cancelAnimationFrame(inertiaRef.current);
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      setZoomLevel(
        zoomRef.current + delta,
        { x: e.clientX, y: e.clientY },
        true,
        true,
      );
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(inertiaRef.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (displayZoomTimerRef.current)
        cancelAnimationFrame(displayZoomTimerRef.current);
    };
  }, [
    onSingleTap,
    clampOffset,
    applyTransform,
    setZoomLevel,
    resetZoom,
    startInertia,
    updateDisplayZoom,
  ]);

  // ── mouse drag (desktop) ────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (zoomRef.current <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    cancelAnimationFrame(inertiaRef.current);
    velocityRef.current = { x: 0, y: 0 };
    containerRef.current?.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    movedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
    };
    lastMoveTimeRef.current = Date.now();
    lastMovePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (!isDraggingRef.current || zoomRef.current <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (!movedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    movedRef.current = true;
    e.preventDefault();

    const now = Date.now();
    const dt = now - lastMoveTimeRef.current;
    if (dt > 0) {
      const f = 16 / Math.max(dt, 4);
      velocityRef.current = {
        x: (e.clientX - lastMovePosRef.current.x) * f,
        y: (e.clientY - lastMovePosRef.current.y) * f,
      };
    }
    lastMoveTimeRef.current = now;
    lastMovePosRef.current = { x: e.clientX, y: e.clientY };

    const clamped = clampOffset(
      dragStartRef.current.ox + dx,
      dragStartRef.current.oy + dy,
      zoomRef.current,
    );
    offsetRef.current = clamped;
    applyTransform(false);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (isDraggingRef.current && movedRef.current && zoomRef.current > 1) {
      startInertia();
    }
    isDraggingRef.current = false;
    movedRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (zoomRef.current > 1) return;
    e.stopPropagation();
    onSingleTap();
  };

  const isZoomed = displayZoom > 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden flex items-center justify-center select-none"
      style={{
        maxHeight: "90dvh",
        touchAction: isZoomed ? "none" : "pan-y",
        cursor: isZoomed ? "grab" : "pointer",
      }}
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        isDraggingRef.current = false;
        movedRef.current = false;
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="block max-w-full h-auto"
        style={{
          maxHeight: "90dvh",
          transformOrigin: "center center",
          userSelect: "none",
          pointerEvents: "none",
          willChange: "transform",
        }}
        loading="eager"
        draggable={false}
      />

      {/* zoom controls */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          {isZoomed && (
            <motion.button
              key="reset"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full
                bg-black/70 text-white text-[11px] font-bold backdrop-blur-sm"
            >
              <RotateCcw className="w-3 h-3" />
              {Math.round(displayZoom * 100)}%
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isZoomed && (
            <motion.button
              key="zoomout"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              className="p-2 rounded-full bg-black/70 text-white backdrop-blur-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}
          className="p-2 rounded-full bg-black/70 text-white backdrop-blur-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
      </div>

      {/* hint */}
      <AnimatePresence>
        {!isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-3 text-white/40 text-[10px] pointer-events-none leading-tight select-none"
          >
            double-tap · scroll · button to zoom
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZoomableImage;
