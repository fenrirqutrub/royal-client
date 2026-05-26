import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import axiosPublic from "../../hooks/axiosPublic";
import axiosSecure from "../../hooks/axiosSecure";
import { Download, Loader2, Printer, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { getRoutinePageViewUrl } from "../../utility/cloudinaryRoutine";
import { PRIVILEGED_ROLES, type UserRole } from "../../utility/constants/role";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RoutineData {
  _id: string;
  slug: string;
  publicId: string;
  secureUrl: string;
  format: string;
  totalPages: number;
  isActive: boolean;
  createdAt: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const Routine = () => {
  const { user } = useAuth();
  const currentUserRole = user?.role as UserRole | undefined;

  const canDelete = Boolean(
    currentUserRole && PRIVILEGED_ROLES.includes(currentUserRole),
  );

  const [downloadingPages, setDownloadingPages] = useState<Set<number>>(
    new Set(),
  );
  const [printingPages, setPrintingPages] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  // ── Fetch active routine ────────────────────────────────────────────────────
  const {
    data: routine,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["active-routine"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/routines/active");
      return res.data.data as RoutineData;
    },
  });

  // ── Delete mutation ─────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await axiosSecure.delete(`/api/routines/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-routine"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      Swal.fire({
        icon: "success",
        title: "সফল!",
        text: "রুটিন সফলভাবে মুছে ফেলা হয়েছে",
        confirmButtonColor: "#000",
        timer: 2000,
        timerProgressBar: true,
      });
    },
    onError: (err: ApiError) => {
      Swal.fire({
        icon: "error",
        title: "ব্যর্থ!",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "মুছে ফেলা সম্ভব হয়নি। আবার চেষ্টা করুন।",
        confirmButtonColor: "#000",
      });
    },
  });

  const handleDelete = async () => {
    if (!routine) return;

    const slug = routine.slug || routine._id;

    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই রুটিনটি স্থায়ীভাবে মুছে যাবে!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
      cancelButtonText: "না, রাখুন",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(slug);
    }
  };

  // ── Generate pages array from totalPages ────────────────────────────────────
  const pages = routine
    ? Array.from({ length: routine.totalPages }, (_, i) => i + 1)
    : [];

  // ── Download single page ───────────────────────────────────────────────────
  const handleDownloadPage = async (pageNumber: number) => {
    if (!routine || downloadingPages.has(pageNumber)) return;

    setDownloadingPages((prev) => new Set(prev).add(pageNumber));

    try {
      const imageUrl = getRoutinePageViewUrl({
        publicId: routine.publicId,
        format: routine.format,
        page: pageNumber,
        width: 1400,
      });

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${routine.slug}-page-${pageNumber}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to download page ${pageNumber}:`, err);
    } finally {
      setDownloadingPages((prev) => {
        const next = new Set(prev);
        next.delete(pageNumber);
        return next;
      });
    }
  };

  // ── Print single page ──────────────────────────────────────────────────────
  const handlePrintPage = (pageNumber: number) => {
    if (!routine || printingPages.has(pageNumber)) return;

    setPrintingPages((prev) => new Set(prev).add(pageNumber));

    const imageUrl = getRoutinePageViewUrl({
      publicId: routine.publicId,
      format: routine.format,
      page: pageNumber,
      width: 1400,
    });

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setPrintingPages((prev) => {
        const next = new Set(prev);
        next.delete(pageNumber);
        return next;
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>রুটিন — পৃষ্ঠা ${pageNumber}</title>
          <style>
            @page { margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; }
            img { width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="রুটিন পৃষ্ঠা ${pageNumber}" />
        </body>
      </html>
    `);
    printWindow.document.close();

    const cleanup = () => {
      setPrintingPages((prev) => {
        const next = new Set(prev);
        next.delete(pageNumber);
        return next;
      });
    };

    printWindow.onload = () => {
      const img = printWindow.document.querySelector("img");

      if (!img) {
        printWindow.print();
        printWindow.close();
        cleanup();
        return;
      }

      const doPrint = () => {
        printWindow.print();
        printWindow.close();
        cleanup();
      };

      if (img.complete) {
        doPrint();
      } else {
        img.addEventListener("load", doPrint);
        img.addEventListener("error", doPrint);
      }
    };
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full mt-4 space-y-3">
        <div className="h-8 w-48 rounded-lg bg-[var(--color-active-bg)] animate-pulse" />
        <div className="h-[520px] rounded-2xl bg-[var(--color-active-bg)] animate-pulse" />
      </div>
    );
  }

  // ── Error / empty state ─────────────────────────────────────────────────────
  if (isError || !routine) {
    return (
      <div className="w-full h-80 mt-6 flex flex-col items-center gap-2 text-[var(--color-gray)] bangla">
        <span className="text-4xl">📭</span>
        <p className="text-lg">কোনো রুটিন পাওয়া যায়নি</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="bangla text-lg font-semibold text-[var(--color-text)] opacity-70">
          {new Date(routine.createdAt).toLocaleDateString("bn-BD", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {canDelete && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
              bg-red-600 text-white hover:bg-red-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed bangla"
            title="রুটিন মুছে ফেলুন"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleteMutation.isPending ? "মুছছে..." : "মুছুন"}
          </motion.button>
        )}
      </div>

      {/* Routine pages — Cloudinary page-wise WebP */}
      {pages.map((pageNumber, i) => {
        const isDownloading = downloadingPages.has(pageNumber);
        const isPrinting = printingPages.has(pageNumber);

        const viewUrl = getRoutinePageViewUrl({
          publicId: routine.publicId,
          format: routine.format,
          page: pageNumber,
          width: 1400,
        });

        return (
          <motion.div
            key={pageNumber}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="relative w-full rounded-2xl overflow-hidden border border-[var(--color-active-border)] group"
          >
            <img
              src={viewUrl}
              alt={`রুটিন পৃষ্ঠা ${pageNumber}`}
              className="w-full h-auto object-contain"
              loading="lazy"
            />

            {/* Download — bottom left */}
            <div className="absolute bottom-3 left-3 transition-opacity duration-200">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleDownloadPage(pageNumber)}
                disabled={isDownloading}
                title={`পৃষ্ঠা ${pageNumber} ডাউনলোড করুন`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium backdrop-blur-sm text-white shadow-lg
                  bg-black transition-colors bangla"
              >
                {isDownloading ? (
                  <Loader2 className="w-[14px] h-[14px] animate-spin" />
                ) : (
                  <Download className="w-[14px] h-[14px]" />
                )}
                {isDownloading ? "..." : `পৃষ্ঠা ${pageNumber}`}
              </motion.button>
            </div>

            {/* Print — bottom right */}
            <div className="absolute bottom-3 right-3  transition-opacity duration-200">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handlePrintPage(pageNumber)}
                disabled={isPrinting}
                title={`পৃষ্ঠা ${pageNumber} প্রিন্ট করুন`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-black backdrop-blur-sm text-white shadow-lg transition-colors bangla"
              >
                {isPrinting ? (
                  <Loader2 className="w-[14px] h-[14px] animate-spin" />
                ) : (
                  <Printer className="w-[14px] h-[14px]" />
                )}
                {isPrinting ? "..." : "প্রিন্ট"}
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Routine;
