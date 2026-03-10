// AddNotice.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPublic from "../../../hooks/axiosPublic";

interface NoticeFormData {
  notice: string;
  durationDays: number;
}

interface NoticeItem {
  _id: string;
  noticeSlug: string;
  notice: string;
  expiresAt: string;
  createdAt: string;
}

const previewSlug = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `RABN-${yy}${mm}${dd}-N?`;
};

const formatExpiry = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (iso: string) => new Date(iso) < new Date();

const AddNotice = () => {
  const queryClient = useQueryClient();
  const [successSlug, setSuccessSlug] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormData>({
    defaultValues: { notice: "", durationDays: 1 },
  });

  const noticeValue = watch("notice");
  const daysValue = watch("durationDays");

  // Compute expiry preview
  const expiryPreview = (() => {
    const d = parseInt(String(daysValue), 10);
    if (!d || d < 1) return null;
    const date = new Date();
    date.setDate(date.getDate() + d);
    return date.toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  })();

  const { data: noticesData, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/notices");
      return res.data.data as NoticeItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: NoticeFormData) =>
      axiosPublic.post("/api/notices", data),
    onSuccess: (res) => {
      setSuccessSlug(res.data.data.noticeSlug);
      reset();
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["active-notice"] });
      setTimeout(() => setSuccessSlug(null), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => axiosPublic.delete(`/api/notices/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["active-notice"] });
    },
  });

  const onSubmit = (data: NoticeFormData) => createMutation.mutate(data);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-mono px-4 py-10">
      {/* ── header ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto mb-10"
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[#f5c542] text-xs tracking-[0.3em] uppercase">
            Royal Academy
          </span>
          <div className="flex-1 h-px bg-[#f5c542]/30" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Only the latest unexpired notice is shown on the marquee. When
          expired, the default notice plays automatically.
        </p>
      </motion.div>

      {/* ── form card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="max-w-2xl mx-auto bg-[#161616] border border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl shadow-black/40"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] tracking-widest text-zinc-600 uppercase">
            Auto ID
          </span>
          <span className="bg-[#f5c542]/10 text-[#f5c542] text-xs font-semibold px-3 py-1 rounded-full border border-[#f5c542]/20 tracking-widest">
            {previewSlug()}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* notice textarea */}
          <div className="mb-5">
            <label className="block text-xs text-zinc-400 mb-2 tracking-widest uppercase">
              Notice Content
            </label>
            <div className="relative">
              <textarea
                {...register("notice", {
                  required: "Notice content is required.",
                  minLength: { value: 10, message: "At least 10 characters." },
                  maxLength: {
                    value: 1000,
                    message: "Maximum 1000 characters.",
                  },
                })}
                rows={5}
                placeholder="Write the official notice here…"
                className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 resize-none outline-none focus:ring-2 transition-all duration-200 ${
                  errors.notice
                    ? "border-red-500/60 focus:ring-red-500/30"
                    : "border-zinc-700 focus:ring-[#f5c542]/30 focus:border-[#f5c542]/50"
                }`}
              />
              <span
                className={`absolute bottom-3 right-3 text-[10px] tabular-nums transition-colors ${(noticeValue?.length ?? 0) > 900 ? "text-red-400" : "text-zinc-600"}`}
              >
                {noticeValue?.length ?? 0}/1000
              </span>
            </div>
            <AnimatePresence>
              {errors.notice && (
                <motion.p
                  key="n-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs mt-2"
                >
                  ⚠ {errors.notice.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* duration input */}
          <div className="mb-6">
            <label className="block text-xs text-zinc-400 mb-2 tracking-widest uppercase">
              Duration (Days)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={365}
                  {...register("durationDays", {
                    required: "Duration is required.",
                    min: { value: 1, message: "Minimum 1 day." },
                    max: { value: 365, message: "Maximum 365 days." },
                    valueAsNumber: true,
                  })}
                  className={`w-full bg-[#0d0d0d] border rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                    errors.durationDays
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : "border-zinc-700 focus:ring-[#f5c542]/30 focus:border-[#f5c542]/50"
                  }`}
                  placeholder="e.g. 7"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600 pointer-events-none">
                  days
                </span>
              </div>

              {/* expiry preview pill */}
              <AnimatePresence mode="wait">
                {expiryPreview && (
                  <motion.div
                    key={expiryPreview}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="shrink-0 flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2"
                  >
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      Expires
                    </span>
                    <span className="text-xs text-[#f5c542] font-semibold">
                      {expiryPreview}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {errors.durationDays && (
                <motion.p
                  key="d-err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs mt-2"
                >
                  ⚠ {errors.durationDays.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="w-full bg-[#f5c542] text-black font-bold text-sm py-3 rounded-xl tracking-widest uppercase transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffd966]"
          >
            {createMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                  className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                />
                Publishing…
              </span>
            ) : (
              "Publish Notice"
            )}
          </motion.button>
        </form>

        {/* success */}
        <AnimatePresence>
          {successSlug && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-start gap-3"
            >
              <span className="text-emerald-400 text-lg leading-none">✓</span>
              <div>
                <p className="text-emerald-400 text-sm font-semibold">
                  Notice published!
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  ID:{" "}
                  <span className="text-[#f5c542] font-mono">
                    {successSlug}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* api error */}
        <AnimatePresence>
          {createMutation.isError && (
            <motion.div
              key="api-err"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
            >
              ✗{" "}
              {(createMutation.error as any)?.response?.data?.message ||
                "Something went wrong."}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── notice list ── */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-zinc-600 uppercase tracking-widest">
            All Notices
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
          {noticesData && (
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">
              {noticesData.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-[#f5c542]/40 border-t-[#f5c542] rounded-full"
            />
          </div>
        ) : noticesData?.length === 0 ? (
          <p className="text-center text-zinc-700 text-sm py-12">
            No notices published yet.
          </p>
        ) : (
          <motion.ul className="space-y-3">
            <AnimatePresence initial={false}>
              {noticesData?.map((item, i) => {
                const expired = isExpired(item.expiresAt);
                return (
                  <motion.li
                    key={item._id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-[#161616] border rounded-xl px-5 py-4 flex items-start gap-4 group transition-colors ${
                      expired
                        ? "border-zinc-800/50 opacity-50"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-0.5 self-stretch rounded-full shrink-0 mt-0.5 ${expired ? "bg-zinc-700" : "bg-[#f5c542]/40"}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold tracking-widest text-[#f5c542]/70">
                          {item.noticeSlug}
                        </span>
                        {expired ? (
                          <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-700 tracking-wider">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                        {item.notice}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-zinc-600">
                          Created:{" "}
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-BD",
                            { dateStyle: "medium" },
                          )}
                        </span>
                        <span className="text-zinc-800">·</span>
                        <span
                          className={`text-[10px] ${expired ? "text-zinc-600" : "text-amber-500/70"}`}
                        >
                          Expires: {formatExpiry(item.expiresAt)}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteMutation.mutate(item.noticeSlug)}
                      disabled={deleteMutation.isPending}
                      className="text-zinc-700 hover:text-red-400 transition-colors text-lg leading-none shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-30"
                      title="Delete notice"
                    >
                      ×
                    </motion.button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  );
};

export default AddNotice;
