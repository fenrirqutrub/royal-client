// StudentsFiles.Ui.tsx — শুধু design/components

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, BookOpen, User, Search, X, Eye } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Student {
  _id: string;
  name: string;
  fatherName?: string | null;
  phone?: string | null;
  slug?: string;
  gender?: string | null;
  gramNam?: string | null;
  dakghor?: string | null;
  thana?: string | null;
  jela?: string | null;
  landmark?: string | null;
  permanentSameAsPresent?: boolean;
  permanentGramNam?: string | null;
  permanentDakghor?: string | null;
  permanentThana?: string | null;
  permanentJela?: string | null;
  studentClass?: string | null;
  avatar?: { url: string | null };
  role?: string;
  isHardcoded?: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-[var(--color-gray)] w-12 shrink-0 bangla">
        {label}
      </span>
      <span className="text-sm text-gray-400">:</span>
      <span className="text-sm text-[var(--color-gray)] bangla">{value}</span>
    </div>
  ) : null;

// ── Avatar ────────────────────────────────────────────────────────────────────
export const StudentAvatar = ({
  student,
  size = 64,
  radius = "rounded-2xl",
}: {
  student: Student;
  size?: number;
  radius?: string;
}) => {
  const [err, setErr] = useState(false);
  const isFemale = student.gender === "মেয়ে" || student.gender === "নারী";
  const bg = isFemale
    ? "linear-gradient(135deg,#f472b6,#ec4899)"
    : "linear-gradient(135deg,#60a5fa,#3b82f6)";

  return student.avatar?.url && !err ? (
    <img
      src={student.avatar.url}
      alt={student.name}
      onError={() => setErr(true)}
      className={`${radius} object-cover shrink-0`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`${radius} flex items-center justify-center text-white font-bold shrink-0`}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.36,
      }}
    >
      {student.name[0].toUpperCase()}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const StudentModal = ({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) => {
  const isFemale = student.gender === "মেয়ে" || student.gender === "নারী";
  const accent = isFemale ? "#ec4899" : "#3b82f6";

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[var(--color-bg)] rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Accent header */}
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg,${accent},${accent}60)`,
            }}
          />

          {/* Close */}
          <div className="flex justify-end px-4 pt-3">
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full
                bg-gray-100 dark:bg-gray-800 text-gray-400
                hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              <StudentAvatar student={student} size={72} radius="rounded-2xl" />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white bangla leading-snug">
                  {student.name}
                </p>
                {student.fatherName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 bangla mt-0.5">
                    পিতা: {student.fatherName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {student.slug && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400">
                      #{student.slug}
                    </span>
                  )}
                  {student.gender && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold bangla"
                      style={{ backgroundColor: accent + "18", color: accent }}
                    >
                      {student.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {/* Basic info */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  মূল তথ্য
                </p>
                <InfoRow label="ফোন" value={student.phone} />
                <InfoRow label="শ্রেণি" value={student.studentClass} />
              </div>

              {/* Present address */}
              {(student.gramNam || student.thana || student.jela) && (
                <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-900/10 space-y-2 border border-rose-100 dark:border-rose-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> বর্তমান ঠিকানা
                  </p>
                  <InfoRow label="গ্রাম" value={student.gramNam} />
                  <InfoRow label="ডাকঘর" value={student.dakghor} />
                  <InfoRow label="থানা" value={student.thana} />
                  <InfoRow label="জেলা" value={student.jela} />
                  <InfoRow label="চিহ্ন" value={student.landmark} />
                </div>
              )}

              {/* Permanent address */}
              {(student.permanentGramNam ||
                student.permanentThana ||
                student.permanentJela) && (
                <div className=" flex flex-col md:flex-row p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 space-y-2 border border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> স্থায়ী ঠিকানা
                    </p>
                    {student.permanentSameAsPresent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-semibold bangla">
                        বর্তমানের মতো
                      </span>
                    )}
                  </div>
                  {!student.permanentSameAsPresent && (
                    <div>
                      <InfoRow label="গ্রাম" value={student.permanentGramNam} />
                      <InfoRow label="ডাকঘর" value={student.permanentDakghor} />
                      <InfoRow label="থানা" value={student.permanentThana} />
                      <InfoRow label="জেলা" value={student.permanentJela} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

// ── StudentCard ───────────────────────────────────────────────────────────────
export const StudentCard = ({
  student,
  index,
}: {
  student: Student;
  index: number;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isFemale = student.gender === "মেয়ে" || student.gender === "নারী";
  const accent = isFemale ? "#ec4899" : "#3b82f6";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.04,
          type: "spring",
          stiffness: 260,
          damping: 22,
        }}
        className="bg-[var(--color-bg)]  rounded-2xl border border-gray-100
          dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
      >
        {/* Accent strip */}
        <div
          className="h-1.5"
          style={{ background: `linear-gradient(90deg,${accent},${accent}40)` }}
        />

        <div className="p-5 flex flex-col flex-1">
          {/* Avatar + name */}
          <div className="flex items-start gap-4 mb-4">
            <StudentAvatar student={student} size={56} radius="rounded-xl" />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-base font-bold text-gray-900 dark:text-white bangla leading-snug">
                {student.name}
              </p>
              {student.fatherName && (
                <p className="text-sm text-[var(--color-gray)]  bangla mt-0.5">
                  পিতা: {student.fatherName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {student.slug && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--color-gray)]  text-gray-400">
                    #{student.slug}
                  </span>
                )}
                {student.gender && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-md font-bold bangla"
                    style={{ backgroundColor: accent + "18", color: accent }}
                  >
                    {student.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800 flex-1">
            {student.phone && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-900/20">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {student.phone}
                </span>
              </div>
            )}
            {student.studentClass && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-900/20">
                  <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 bangla">
                  {student.studentClass}
                </span>
              </div>
            )}

            {/* Present address — card এ শুধু thana + গ্রাম */}
            {(student.thana || student.gramNam) && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-900/20 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="space-y-0.5">
                  <InfoRow label="গ্রাম" value={student.gramNam} />
                  <InfoRow label="থানা" value={student.thana} />
                </div>
              </div>
            )}
          </div>

          {/* View details button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-sm font-semibold bangla cursor-pointer transition-all
              border border-gray-200 dark:border-gray-700
              text-gray-500 dark:text-gray-400
              hover:border-blue-300 hover:text-blue-500 dark:hover:border-blue-700 dark:hover:text-blue-400
              hover:bg-blue-50 dark:hover:bg-blue-900/10"
          >
            <Eye className="w-4 h-4" />
            বিস্তারিত দেখুন
          </button>
        </div>
      </motion.div>

      {/* Modal */}
      {modalOpen && (
        <StudentModal student={student} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div className="h-1.5 bg-gray-100 dark:bg-gray-800" />
    <div className="p-5">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        <div className="flex-1 pt-1 space-y-2.5">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/3" />
        </div>
      </div>
      <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
      </div>
      <div className="mt-4 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    </div>
  </div>
);

// ── SearchBar ─────────────────────────────────────────────────────────────────
export const StudentSearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative w-full sm:w-72">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
      className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border
        border-gray-200 dark:border-gray-700
        bg-white dark:bg-[#161b22]
        text-gray-900 dark:text-gray-100
        placeholder-gray-400 outline-none
        focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15
        transition-all bangla"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center
          justify-center rounded-full bg-gray-100 dark:bg-gray-700
          text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = () => (
  <div className="text-center py-24">
    <User className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
    <p className="text-gray-400 bangla">কোনো ছাত্রছাত্রী পাওয়া যায়নি</p>
  </div>
);

// ── PageShell ─────────────────────────────────────────────────────────────────
export const StudentsPageShell = ({
  totalCount,
  search,
  onSearch,
  children,
}: {
  totalCount: number;
  search: string;
  onSearch: (v: string) => void;
  children: React.ReactNode;
}) => (
  <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] px-4 sm:px-6 py-8">
    <div className="max-w-6xl mx-auto">
      <div className="mb-7 mt-10 lg:mt-0 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white bangla">
            ছাত্রছাত্রী তালিকা
          </h1>
          <p className="text-sm text-gray-400 bangla mt-1">
            মোট{" "}
            <span className="font-semibold text-blue-500">{totalCount}</span> জন
            নিবন্ধিত
          </p>
        </div>
        <StudentSearchBar value={search} onChange={onSearch} />
      </div>
      {children}
    </div>
  </div>
);
