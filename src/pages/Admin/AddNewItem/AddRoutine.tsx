import { useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import axiosSecure from "../../../hooks/axiosSecure";

type SignUploadResponse = {
  success: boolean;
  data: {
    slug: string;
    timestamp: number;
    signature: string;
    publicId: string;
    apiKey: string;
    cloudName: string;
    overwrite: boolean;
    uploadUrl: string;
  };
};

// Custom error type for the mutation
type UploadError = AxiosError<{ message?: string }> | Error;

const AddRoutine = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("PDF file is required");

      // 1) get signed upload info from backend
      const signRes = await axiosSecure.post<SignUploadResponse>(
        "/api/routines/sign-upload",
      );

      const signData = signRes.data.data;

      // 2) direct upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("public_id", signData.publicId);
      formData.append("overwrite", String(signData.overwrite));

      const cloudinaryRes = await axios.post(signData.uploadUrl, formData, {
        timeout: 300000,
        onUploadProgress: (e) => {
          if (!e.total) return;
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      const uploaded = cloudinaryRes.data;

      // 3) save metadata to backend
      const saveRes = await axiosSecure.post(
        "/api/routines",
        {
          slug: signData.slug,
          publicId: uploaded.public_id,
          secureUrl: uploaded.secure_url,
          format: uploaded.format || "pdf",
          totalPages: uploaded.pages || 1,
          originalFilename: file.name,
          bytes: uploaded.bytes || file.size,
        },
        { timeout: 30000 },
      );

      return saveRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-routine"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setFile(null);
      setError("");
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err: UploadError) => {
      let message = "আপলোড ব্যর্থ হয়েছে";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      setError(message);
      setProgress(0);
    },
  });

  const handleSubmit = () => {
    if (!file) return setError("PDF ফাইল সিলেক্ট করুন");
    mutate();
  };

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setError("শুধুমাত্র PDF ফাইল গ্রহণযোগ্য");
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      setError("ফাইলের সাইজ সর্বোচ্চ ২০MB হতে হবে");
      return;
    }

    setError("");
    setFile(f);
  };

  return (
    <div className="max-w-xl mx-auto pt-6 px-4 bangla">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        রুটিন যোগ করুন
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => fileRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed cursor-pointer
          transition-colors p-8 flex flex-col items-center gap-3 text-center
          ${
            dragOver
              ? "border-[var(--color-text)] bg-[var(--color-active-bg)]"
              : "border-[var(--color-active-border)] hover:border-[var(--color-text)] hover:bg-[var(--color-active-bg)]"
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-4xl">📄</span>
              <p className="text-sm font-medium text-[var(--color-text)]">
                {file.name}
              </p>
              <p className="text-xs opacity-50">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setProgress(0);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-xs opacity-50 hover:opacity-100 underline transition-opacity"
              >
                পরিবর্তন করুন
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 opacity-50"
            >
              <span className="text-4xl">📁</span>
              <p className="text-sm text-[var(--color-text)]">
                PDF ড্র্যাগ করুন অথবা ক্লিক করুন
              </p>
              <p className="text-xs text-[var(--color-text)]">সর্বোচ্চ ২০MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isPending && progress > 0 && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-[var(--color-text)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs opacity-60 text-center">
            আপলোড হচ্ছে... {progress}%
          </p>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-green-500"
          >
            ✓ রুটিন সফলভাবে যোগ হয়েছে
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleSubmit}
        disabled={isPending}
        whileTap={{ scale: 0.97 }}
        className="mt-5 w-full py-3 rounded-xl font-semibold text-sm
          bg-[var(--color-text)] text-[var(--color-bg)]
          disabled:opacity-40 transition-opacity"
      >
        {isPending ? "আপলোড হচ্ছে..." : "আপলোড করুন"}
      </motion.button>

      <p className="mt-3 text-xs opacity-40 text-center">
        PDF সরাসরি Cloudinary তে আপলোড হবে, পরে page-wise WebP হিসেবে দেখানো
        যাবে
      </p>
    </div>
  );
};

export default AddRoutine;
