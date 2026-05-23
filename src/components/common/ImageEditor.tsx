// src/components/common/ImageEditor.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Crop as CropIcon,
  Move,
  Maximize2,
} from "lucide-react";
import { lockScroll, unlockScroll } from "../../utility/scrollLock";

// ── Types ──────────────────────────────────────────────────
interface ImageEditorProps {
  file: File;
  onConfirm: (editedBlob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

type AspectOption = {
  labelBn: string;
  value: number | "free";
};

const ASPECT_OPTIONS: AspectOption[] = [
  { labelBn: "মুক্ত", value: "free" },
  { labelBn: "১:১", value: 1 },
  { labelBn: "৪:৩", value: 4 / 3 },
  { labelBn: "১৬:৯", value: 16 / 9 },
  { labelBn: "৩:২", value: 3 / 2 },
  { labelBn: "২:৩", value: 2 / 3 },
];

// ── Canvas export ──────────────────────────────────────────
function getRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

async function exportCrop(
  imgEl: HTMLImageElement,
  pixelCrop: PixelCrop,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
  scale: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;

  const cropW = pixelCrop.width * scaleX;
  const cropH = pixelCrop.height * scaleY;

  const rad = getRadians(rotation);
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bboxW = cropW * cos + cropH * sin;
  const bboxH = cropW * sin + cropH * cos;

  canvas.width = Math.round(bboxW * scale);
  canvas.height = Math.round(bboxH * scale);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.scale(scale, scale);

  ctx.drawImage(
    imgEl,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    cropW,
    cropH,
    -cropW / 2,
    -cropH / 2,
    cropW,
    cropH,
  );
  ctx.restore();

  return new Promise((res, rej) => {
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
      "image/webp",
      0.88,
    );
  });
}

// ── Initial crop helper ────────────────────────────────────
function makeInitialCrop(aspect: number | "free"): Crop {
  if (aspect === "free") {
    return { unit: "%", x: 10, y: 10, width: 80, height: 80 };
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, 100, 100),
    100,
    100,
  );
}

// ═══════════════════════════════════════════════════════════
// ImageEditor
// ═══════════════════════════════════════════════════════════
const ImageEditor = ({ file, onConfirm, onCancel }: ImageEditorProps) => {
  const [imageSrc, setImageSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  const [crop, setCrop] = useState<Crop>(makeInitialCrop("free"));
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspectIdx, setAspectIdx] = useState(0);

  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(1);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"crop" | "transform">("crop");
  const [mounted, setMounted] = useState(false);

  const currentAspect =
    ASPECT_OPTIONS[aspectIdx].value === "free"
      ? undefined
      : (ASPECT_OPTIONS[aspectIdx].value as number);

  // ── Setup ──────────────────────────────────────────────
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  // ── Aspect change ──────────────────────────────────────
  const handleAspectChange = useCallback((idx: number) => {
    setAspectIdx(idx);
    setCrop(makeInitialCrop(ASPECT_OPTIONS[idx].value));
    setCompletedCrop(null);
  }, []);

  // ── Image load ─────────────────────────────────────────
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = ASPECT_OPTIONS[aspectIdx].value;
      const ratio = aspect === "free" ? width / height : (aspect as number);
      const initial = centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, ratio, width, height),
        width,
        height,
      );
      setCrop(initial);
    },
    [aspectIdx],
  );

  // ── Confirm / export ───────────────────────────────────
  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);
    try {
      const blob = await exportCrop(
        imgRef.current,
        completedCrop,
        rotation,
        flipH,
        flipV,
        scale,
      );
      onConfirm(blob, URL.createObjectURL(blob));
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────
  const handleReset = () => {
    setAspectIdx(0);
    setCrop(makeInitialCrop("free"));
    setCompletedCrop(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScale(1);
    setActiveTab("crop");
  };

  // ── Live CSS transform (preview only, doesn't affect crop math) ──
  const liveTransform =
    [
      scale !== 1 ? `scale(${scale})` : "",
      rotation !== 0 ? `rotate(${rotation}deg)` : "",
      flipH ? "scaleX(-1)" : "",
      flipV ? "scaleY(-1)" : "",
    ]
      .filter(Boolean)
      .join(" ") || "none";

  const dimDisplay =
    completedCrop && imgRef.current
      ? {
          w: Math.round(
            completedCrop.width *
              (imgRef.current.naturalWidth / imgRef.current.width),
          ),
          h: Math.round(
            completedCrop.height *
              (imgRef.current.naturalHeight / imgRef.current.height),
          ),
        }
      : null;

  if (!mounted || typeof document === "undefined") return null;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] w-screen h-screen bg-black/95 backdrop-blur-sm flex flex-col"
    >
      {/* ── Top bar ── */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10 shrink-0"
      >
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
          <span className="bangla hidden sm:inline">বাতিল</span>
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <h2 className="text-white font-semibold bangla text-sm sm:text-base flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-violet-400" />
            ছবি সম্পাদনা
          </h2>
          {dimDisplay && (
            <span className="text-white/40 text-[10px] font-mono tabular-nums">
              {dimDisplay.w} × {dimDisplay.h} px
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isProcessing || !completedCrop}
          className="flex items-center gap-2 px-5 py-2 rounded bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-500/30"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span className="bangla hidden sm:inline">
            {isProcessing ? "প্রসেসিং..." : "নিশ্চিত করুন"}
          </span>
        </button>
      </motion.div>

      {/* ── Crop canvas area ── */}
      <div className="relative flex-1 min-h-0 overflow-auto flex items-center justify-center bg-[#0a0a0a]">
        {imageSrc && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={currentAspect}
            minWidth={20}
            minHeight={20}
            keepSelection
            style={{ maxHeight: "100%", maxWidth: "100%" }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="edit"
              onLoad={onImageLoad}
              draggable={false}
              style={{
                // ✅ Pure CSS transform for live preview
                // react-image-crop crop math is based on rendered element size,
                // so CSS transform doesn't affect pixel math here —
                // we manually account for it in exportCrop()
                transform: liveTransform,
                transformOrigin: "center center",
                transition: "transform 0.15s ease",
                maxHeight: "calc(100vh - 220px)",
                maxWidth: "100%",
                display: "block",
              }}
            />
          </ReactCrop>
        )}

        {/* File info */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/70 text-xs bangla z-10 pointer-events-none">
          {file.name} • {(file.size / (1024 * 1024)).toFixed(1)} MB
        </div>

        {/* Transform indicators */}
        <AnimatePresence>
          {(rotation !== 0 || flipH || flipV || scale !== 1) && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-3 right-3 flex flex-col gap-1 z-10 pointer-events-none"
            >
              {rotation !== 0 && (
                <div className="px-2.5 py-1 rounded-lg bg-violet-500/20 backdrop-blur-sm border border-violet-500/30 text-violet-300 text-xs bangla">
                  ঘোরানো {rotation}°
                </div>
              )}
              {scale !== 1 && (
                <div className="px-2.5 py-1 rounded-lg bg-sky-500/20 backdrop-blur-sm border border-sky-500/30 text-sky-300 text-xs font-mono">
                  {scale.toFixed(2)}×
                </div>
              )}
              {flipH && (
                <div className="px-2.5 py-1 rounded-lg bg-fuchsia-500/20 backdrop-blur-sm border border-fuchsia-500/30 text-fuchsia-300 text-xs bangla">
                  H ফ্লিপ
                </div>
              )}
              {flipV && (
                <div className="px-2.5 py-1 rounded-lg bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 text-pink-300 text-xs bangla">
                  V ফ্লিপ
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom controls ── */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-black/90 border-t border-white/10 shrink-0"
      >
        <div className="flex justify-center gap-1 px-4 pt-3">
          {(["crop", "transform"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all bangla ${
                activeTab === tab
                  ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {tab === "crop" ? (
                <span className="flex items-center gap-1.5">
                  <CropIcon className="w-3.5 h-3.5" />
                  ক্রপ
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  ট্রান্সফর্ম
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {/* Crop tab */}
          {activeTab === "crop" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2 bangla">
                  অনুপাত
                </p>
                <div className="flex gap-2 flex-wrap">
                  {ASPECT_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.labelBn}
                      type="button"
                      onClick={() => handleAspectChange(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 bangla flex items-center gap-1 ${
                        aspectIdx === i
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {opt.value === "free" && (
                        <Maximize2 className="w-3 h-3" />
                      )}
                      {opt.labelBn}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-white/30 text-[10px] bangla">
                ছবির উপরে ড্র্যাগ করে ক্রপ এরিয়া নির্বাচন করুন
              </p>
            </motion.div>
          )}

          {/* Transform tab */}
          {activeTab === "transform" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Scale / Zoom */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <ZoomIn className="w-3 h-3" />
                    <span className="bangla">জুম</span>
                  </p>
                  <span className="text-sky-400 text-xs font-mono">
                    {scale.toFixed(2)}×
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setScale((s) => Math.max(0.1, +(s - 0.1).toFixed(2)))
                    }
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-all active:scale-90"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={0.1}
                    max={3}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-sky-500
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setScale((s) => Math.min(3, +(s + 0.1).toFixed(2)))
                    }
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-all active:scale-90"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCw className="w-3 h-3" />
                    <span className="bangla">ঘোরানো</span>
                  </p>
                  <span className="text-violet-400 text-xs font-mono">
                    {rotation}°
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => r - 90)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-all active:scale-90"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-violet-500
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setRotation((r) => r + 90)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-all active:scale-90"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flip + Reset */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 bangla ${
                    flipH
                      ? "bg-violet-600 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  অনুভূমিক
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV((f) => !f)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 bangla ${
                    flipV
                      ? "bg-violet-600 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  উল্লম্ব
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/10 text-white/60 hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-95 bangla ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  রিসেট
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
};

export default ImageEditor;
