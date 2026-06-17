// src/components/common/ImageUploadWithEditor.tsx
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Pencil,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Images,
  CheckCheck,
  Loader2,
} from "lucide-react";
import ImageEditor from "./ImageEditor";
import { lockScroll, unlockScroll } from "../../utility/scrollLock";
import { convertToModernFormats } from "../../hooks/useCloudinaryUpload";

// ── Types ───────────────────────────
export interface EditedImage {
  blob: Blob;
  previewUrl: string;
  originalName: string;
}

interface ImageUploadWithEditorProps {
  images: EditedImage[];
  onChange: (images: EditedImage[]) => void;
  maxImages?: number;
  allowSkipEdit?: boolean;
}

// ── Pending item (in review flow) ───────────
interface PendingItem {
  id: string;
  file: File;
  previewUrl: string;
  edited: EditedImage | null;
  skipped: boolean;
}

// ── Helpers ───────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Review Modal ────────────────────────
interface ReviewModalProps {
  items: PendingItem[];
  activeIdx: number;
  onNavigate: (idx: number) => void;
  onEdit: (idx: number) => void;
  onSkip: (idx: number) => void;
  onRemove: (idx: number) => void;
  onConfirmAll: () => Promise<void>;
  onCancel: () => void;
}

const ReviewModal = ({
  items,
  activeIdx,
  onNavigate,
  onEdit,
  onSkip,
  onRemove,
  onConfirmAll,
  onCancel,
}: ReviewModalProps) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const active = items[activeIdx];
  const displayUrl = active.edited?.previewUrl ?? active.previewUrl;
  const editedCount = items.filter((i) => i.edited && !i.skipped).length;
  const skippedCount = items.filter((i) => i.skipped).length;

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumb = strip.children[activeIdx] as HTMLElement;
    if (!thumb) return;
    thumb.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIdx]);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  const handleSelectAll = async () => {
    setIsProcessingAll(true);
    try {
      await onConfirmAll();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingAll(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99990] bg-black flex flex-col"
      style={{ touchAction: "none" }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/8 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessingAll}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-white text-sm font-semibold">
            {activeIdx + 1} / {items.length}
          </span>
          <span className="text-white/40 text-[10px]">
            {editedCount} edited · {skippedCount} as-is
          </span>
        </div>

        <button
          type="button"
          onClick={handleSelectAll}
          disabled={isProcessingAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-500 disabled:opacity-50"
        >
          {isProcessingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCheck className="w-4 h-4" />
              <span>Select All ({items.length})</span>
            </>
          )}
        </button>
      </div>

      {/* ── Main preview ── */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-[#080808]">
        <AnimatePresence mode="wait">
          <motion.img
            key={displayUrl}
            src={displayUrl}
            alt="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: "calc(100vh - 220px)" }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Status badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          {active.edited && !active.skipped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Edited
            </motion.div>
          )}
          {active.skipped && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-medium">
              As-is
            </div>
          )}
          {!active.edited && !active.skipped && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/50 text-xs">
              Pending
            </div>
          )}
        </div>

        {/* Filename */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/50 text-[10px] max-w-[140px] truncate">
            {active.file.name}
          </div>
        </div>

        {/* Prev / Next nav */}
        {items.length > 1 && (
          <>
            {activeIdx > 0 && (
              <button
                type="button"
                onClick={() => onNavigate(activeIdx - 1)}
                disabled={isProcessingAll}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeIdx < items.length - 1 && (
              <button
                type="button"
                onClick={() => onNavigate(activeIdx + 1)}
                disabled={isProcessingAll}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Bottom ── */}
      <div className="bg-black/90 border-t border-white/8 shrink-0">
        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div
            ref={stripRef}
            className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((item, i) => {
              const url = item.edited?.previewUrl ?? item.previewUrl;
              const isActive = i === activeIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(i)}
                  disabled={isProcessingAll}
                  className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all active:scale-95 disabled:opacity-50 ${
                    isActive
                      ? "ring-2 ring-violet-500 ring-offset-1 ring-offset-black"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {item.edited && !item.skipped && (
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {item.skipped && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white/80 text-[9px] font-bold">
                        AS-IS
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => onRemove(activeIdx)}
            disabled={isProcessingAll}
            className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500/25 transition-all active:scale-90 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSkip(activeIdx)}
            disabled={isProcessingAll}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
              active.skipped
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-white/8 border-white/15 text-white/60 hover:bg-white/12"
            }`}
          >
            {active.skipped ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Marked As-is
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Add as-is
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onEdit(activeIdx)}
            disabled={isProcessingAll}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/90 border border-violet-500/50 text-white text-sm font-semibold hover:bg-violet-600 transition-all active:scale-95 shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  item.edited && !item.skipped
                    ? "bg-emerald-500"
                    : item.skipped
                      ? "bg-amber-500"
                      : i === activeIdx
                        ? "bg-violet-500"
                        : "bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
};

// ═══════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════
const ImageUploadWithEditor = ({
  images,
  onChange,
  maxImages = 50,
}: ImageUploadWithEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<PendingItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const [reEditIndex, setReEditIndex] = useState<number | null>(null);
  const [reEditFile, setReEditFile] = useState<File | null>(null);

  const isReviewing =
    pending.length > 0 && editingIdx === null && reEditIndex === null;
  const isEditing = editingIdx !== null || reEditIndex !== null;

  // ── File select ────────────────────────────────────────
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = maxImages - images.length;
    const allowed = files.slice(0, remaining);
    if (!allowed.length) return;

    const items: PendingItem[] = allowed.map((file) => ({
      id: uid(),
      file,
      previewUrl: URL.createObjectURL(file),
      edited: null,
      skipped: false,
    }));

    setPending(items);
    setActiveIdx(0);
  };

  useEffect(() => {
    return () => {
      pending.forEach((p) => {
        URL.revokeObjectURL(p.previewUrl);
        if (p.edited) URL.revokeObjectURL(p.edited.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigate = useCallback((idx: number) => {
    setActiveIdx(idx);
  }, []);

  const handleSkip = useCallback((idx: number) => {
    setPending((prev) => {
      const next = [...prev];
      const item = next[idx];
      if (item.skipped) {
        next[idx] = { ...item, skipped: false, edited: null };
        return next;
      }
      next[idx] = { ...item, skipped: true, edited: null };
      return next;
    });

    setPending((prev) => {
      const nextUnprocessed = prev.findIndex(
        (p, i) => i > idx && !p.edited && !p.skipped,
      );
      if (nextUnprocessed !== -1) setActiveIdx(nextUnprocessed);
      return prev;
    });
  }, []);

  const handleRemove = useCallback((idx: number) => {
    setPending((prev) => {
      const next = [...prev];
      const item = next[idx];
      URL.revokeObjectURL(item.previewUrl);
      if (item.edited) URL.revokeObjectURL(item.edited.previewUrl);
      next.splice(idx, 1);
      if (next.length === 0) return [];
      setActiveIdx(Math.min(idx, next.length - 1));
      return next;
    });
  }, []);

  const handleEditFromReview = useCallback((idx: number) => {
    setEditingIdx(idx);
  }, []);

  const handleEditorConfirm = useCallback(
    (blob: Blob, previewUrl: string) => {
      if (reEditIndex !== null && reEditFile !== null) {
        const updated = [...images];
        URL.revokeObjectURL(updated[reEditIndex].previewUrl);
        updated[reEditIndex] = {
          blob,
          previewUrl,
          originalName: updated[reEditIndex].originalName,
        };
        onChange(updated);
        setReEditIndex(null);
        setReEditFile(null);
        return;
      }

      if (editingIdx === null) return;

      setPending((prev) => {
        const next = [...prev];
        const item = next[editingIdx];
        if (item.edited) URL.revokeObjectURL(item.edited.previewUrl);
        next[editingIdx] = {
          ...item,
          skipped: false,
          edited: {
            blob,
            previewUrl,
            originalName: item.file.name,
          },
        };
        return next;
      });

      setEditingIdx(null);

      setPending((prev) => {
        const nextUnprocessed = prev.findIndex(
          (p, i) => i > editingIdx && !p.edited && !p.skipped,
        );
        if (nextUnprocessed !== -1) setActiveIdx(nextUnprocessed);
        return prev;
      });
    },
    [editingIdx, reEditIndex, reEditFile, images, onChange],
  );

  const handleEditorCancel = useCallback(() => {
    setEditingIdx(null);
    setReEditIndex(null);
    setReEditFile(null);
  }, []);

  const handleConfirmAll = useCallback(async () => {
    const results: EditedImage[] = [];

    for (const item of pending) {
      if (item.edited && !item.skipped) {
        results.push(item.edited);
      } else {
        try {
          const converted = await convertToModernFormats(item.file);
          const blob = converted.preferredBlob;
          const url = URL.createObjectURL(blob);
          results.push({ blob, previewUrl: url, originalName: item.file.name });
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          const url = URL.createObjectURL(item.file);
          results.push({
            blob: item.file,
            previewUrl: url,
            originalName: item.file.name,
          });
        }
      }
    }

    onChange([...images, ...results]);
    setPending([]);
    setActiveIdx(0);
  }, [pending, images, onChange]);

  const handleCancelReview = useCallback(() => {
    pending.forEach((p) => {
      URL.revokeObjectURL(p.previewUrl);
      if (p.edited) URL.revokeObjectURL(p.edited.previewUrl);
    });
    setPending([]);
    setActiveIdx(0);
  }, [pending]);

  const handleReEdit = useCallback(
    (index: number) => {
      const img = images[index];
      const file = new File([img.blob], img.originalName, {
        type: img.blob.type || "image/webp",
      });
      setReEditIndex(index);
      setReEditFile(file);
    },
    [images],
  );

  const handleRemoveConfirmed = useCallback(
    (index: number) => {
      URL.revokeObjectURL(images[index].previewUrl);
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  const isFull = images.length >= maxImages;

  const editorFile =
    reEditFile ??
    (editingIdx !== null ? (pending[editingIdx]?.file ?? null) : null);

  return (
    <div>
      {/* Upload zone */}
      <motion.div
        whileTap={{ scale: isFull ? 1 : 0.98 }}
        onClick={() => !isFull && fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6
          flex flex-col items-center gap-2 transition-all duration-200 overflow-hidden
          ${
            isFull
              ? "border-white/10 opacity-40 cursor-not-allowed"
              : "border-[var(--color-active-border)] hover:border-violet-400 hover:bg-violet-500/5"
          }`}
      >
        <Images className="w-8 h-8 text-[var(--color-gray)]" />
        <p className="text-sm text-[var(--color-gray)] font-medium text-center">
          Click to add images
        </p>
        <p className="text-xs text-[var(--color-gray)]/60 text-center">
          Review & edit before adding
        </p>
        {isFull && (
          <p className="text-xs text-amber-500 mt-1">
            Max {maxImages} images reached
          </p>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Confirmed images grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4"
          >
            {images.map((img, i) => (
              <motion.div
                key={img.previewUrl}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-active-border)] hover:border-violet-400 transition-colors shadow-sm"
              >
                <img
                  src={img.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <motion.button
                  type="button"
                  onClick={() => handleRemoveConfirmed(i)}
                  whileTap={{ scale: 0.85 }}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-rose-600/90 hover:bg-rose-600 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-white transition-all z-10"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleReEdit(i)}
                  whileTap={{ scale: 0.85 }}
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-violet-600/90 hover:bg-violet-600 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-white transition-all z-10"
                  title="Edit image"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </motion.button>

                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-md flex items-center justify-center text-white text-[11px] font-bold border border-white/10 pointer-events-none">
                  {i + 1}
                </div>

                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white/80 text-[10px] border border-white/10 pointer-events-none font-mono">
                  {(img.blob.size / 1024).toFixed(0)}KB
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <p className="text-xs text-[var(--color-gray)] mt-3 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          {images.length} image{images.length !== 1 ? "s" : ""} selected
        </p>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {isReviewing && (
          <ReviewModal
            items={pending}
            activeIdx={activeIdx}
            onNavigate={handleNavigate}
            onEdit={handleEditFromReview}
            onSkip={handleSkip}
            onRemove={handleRemove}
            onConfirmAll={handleConfirmAll}
            onCancel={handleCancelReview}
          />
        )}
      </AnimatePresence>

      {/* ImageEditor */}
      {isEditing && editorFile && (
        <ImageEditor
          key={editorFile.name + editorFile.size + String(reEditIndex)}
          file={editorFile}
          onConfirm={handleEditorConfirm}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
};

export default ImageUploadWithEditor;
