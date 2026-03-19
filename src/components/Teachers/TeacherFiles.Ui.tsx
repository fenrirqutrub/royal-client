// src/components/Teachers/TeacherFiles.Ui.tsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MapPin,
  User,
  Search,
  X,
  Eye,
  Mail,
  Crown,
  GraduationCap,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Teacher {
  _id: string;
  name: string;
  fatherName?: string | null;
  motherName?: string | null;
  phone?: string | null;
  email?: string | null;
  slug?: string;
  role?: string;
  gender?: string | null;
  religion?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
  qualification?: string | null;
  degree?: string | null;
  currentYear?: string | null;
  educationComplete?: boolean | null;
  // Present address
  gramNam?: string | null;
  para?: string | null;
  thana?: string | null;
  district?: string | null;
  division?: string | null;
  landmark?: string | null;
  // Permanent address
  permanentSameAsPresent?: boolean;
  permanentGramNam?: string | null;
  permanentPara?: string | null;
  permanentThana?: string | null;
  permanentDistrict?: string | null;
  permanentDivision?: string | null;
  avatar?: { url: string | null };
  isHardcoded?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; Icon: React.ElementType; handle: string }
> = {
  principal: {
    label: "অধ্যক্ষ",
    color: "#8b5cf6",
    Icon: Crown,
    handle: "principal",
  },
  admin: {
    label: "প্রশাসক",
    color: "#ef4444",
    Icon: ShieldCheck,
    handle: "admin",
  },
  teacher: {
    label: "শিক্ষক",
    color: "#3b82f6",
    Icon: GraduationCap,
    handle: "teacher",
  },
};

const DEGREE_LABEL: Record<string, string> = {
  hsc: "এইচএসসি / সমমান",
  hons: "স্নাতক (সম্মান)",
  masters: "স্নাতকোত্তর",
};

const YEAR_LABEL: Record<string, string> = {
  "1st": "প্রথম বর্ষ",
  "2nd": "দ্বিতীয় বর্ষ",
  "3rd": "তৃতীয় বর্ষ",
  "4th": "চতুর্থ বর্ষ",
  mba: "এমবিএ",
  mbbs: "এমবিবিএস",
  ma: "এমএ",
};

const formatDOB = (dob: string) => {
  try {
    return new Date(dob).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dob;
  }
};

// ── InfoRow ───────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex items-start gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide shrink-0 bangla text-[var(--color-gray)] w-14">
        {label}
      </span>
      <span className="text-xs opacity-40 text-[var(--color-gray)]">:</span>
      <span className="text-sm bangla text-[var(--color-text)]">{value}</span>
    </div>
  ) : null;

// ── Section ───────────────────────────────────────────────────────────────────
const Section = ({
  title,
  color,
  borderColor,
  titleColor,
  icon,
  children,
}: {
  title: string;
  color: string;
  borderColor: string;
  titleColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className="p-3.5 rounded-xl space-y-2"
    style={{ backgroundColor: color, border: `1px solid ${borderColor}` }}
  >
    <p
      className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 bangla"
      style={{ color: titleColor ?? "var(--color-gray)" }}
    >
      {icon} {title}
    </p>
    {children}
  </div>
);

// ── TeacherAvatar ─────────────────────────────────────────────────────────────
export const TeacherAvatar = ({
  teacher,
  size = 64,
  radius = "rounded-2xl",
}: {
  teacher: Teacher;
  size?: number;
  radius?: string;
}) => {
  const [err, setErr] = useState(false);
  const { color } =
    ROLE_CONFIG[teacher.role ?? "teacher"] ?? ROLE_CONFIG.teacher;

  return teacher.avatar?.url && !err ? (
    <img
      src={teacher.avatar.url}
      alt={teacher.name}
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
        background: `linear-gradient(135deg, ${color}66, ${color})`,
        fontSize: size * 0.36,
      }}
    >
      {teacher.name[0].toUpperCase()}
    </div>
  );
};

// ── TeacherModal ──────────────────────────────────────────────────────────────
export const TeacherModal = ({
  teacher,
  onClose,
}: {
  teacher: Teacher;
  onClose: () => void;
}) => {
  const cfg = ROLE_CONFIG[teacher.role ?? "teacher"] ?? ROLE_CONFIG.teacher;
  const { color, label, Icon, handle } = cfg;

  const address = [
    teacher.gramNam,
    teacher.para,
    teacher.thana,
    teacher.district,
    teacher.division,
  ]
    .filter(Boolean)
    .join(", ");

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
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            maxWidth: 420,
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-active-border)",
          }}
        >
          {/* Color strip */}
          <div
            className="h-16 relative"
            style={{
              background: `linear-gradient(135deg, ${color}25, ${color}50)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 30%, var(--color-bg))",
              }}
            />
            <div
              className="absolute top-3 left-4 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color + "22" }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--color-active-bg)",
              color: "var(--color-gray)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-active-border)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-active-bg)")
            }
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div
            className="px-5 pb-5 overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 16,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${color}33, ${color}66)`,
                  border: `3px solid var(--color-bg)`,
                  boxShadow: `0 4px 20px ${color}44`,
                }}
              >
                <TeacherAvatar
                  teacher={teacher}
                  size={68}
                  radius="rounded-none"
                />
              </div>
              <div className="min-w-0 pt-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-base font-bold bangla leading-snug text-[var(--color-text)]">
                    {teacher.name}
                  </p>
                  <BadgeCheck
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bangla"
                    style={{ backgroundColor: color + "20", color }}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-gray)]">
                    @{handle}
                  </span>
                  {teacher.slug && (
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: "var(--color-active-bg)",
                        color: "var(--color-gray)",
                      }}
                    >
                      #{teacher.slug}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Basic */}
              <Section
                title="মূল তথ্য"
                color="var(--color-active-bg)"
                borderColor="var(--color-active-border)"
              >
                <InfoRow label="ফোন" value={teacher.phone} />
                <InfoRow label="ইমেইল" value={teacher.email} />
                <InfoRow label="লিঙ্গ" value={teacher.gender} />
                <InfoRow label="ধর্ম" value={teacher.religion} />
                <InfoRow
                  label="জন্ম"
                  value={
                    teacher.dateOfBirth ? formatDOB(teacher.dateOfBirth) : null
                  }
                />
                <InfoRow label="বাবা" value={teacher.fatherName} />
                <InfoRow label="মা" value={teacher.motherName} />
                <InfoRow label="জরুরি" value={teacher.emergencyContact} />
              </Section>

              {/* Education */}
              {(teacher.qualification ||
                teacher.degree ||
                teacher.currentYear ||
                teacher.educationComplete !== null) && (
                <Section
                  title="শিক্ষাগত যোগ্যতা"
                  color="rgba(139,92,246,0.06)"
                  borderColor="rgba(139,92,246,0.2)"
                  titleColor="#8b5cf6"
                  icon={<GraduationCap className="w-3 h-3" />}
                >
                  <InfoRow label="যোগ্যতা" value={teacher.qualification} />
                  <InfoRow
                    label="ডিগ্রি"
                    value={
                      teacher.degree
                        ? (DEGREE_LABEL[teacher.degree] ?? teacher.degree)
                        : null
                    }
                  />
                  <InfoRow
                    label="অধ্যয়ন"
                    value={
                      teacher.educationComplete === true
                        ? "সম্পন্ন"
                        : teacher.educationComplete === false
                          ? "চলমান"
                          : null
                    }
                  />
                  <InfoRow
                    label="বর্ষ"
                    value={
                      teacher.currentYear
                        ? (YEAR_LABEL[teacher.currentYear] ??
                          teacher.currentYear)
                        : null
                    }
                  />
                </Section>
              )}

              {/* Present address */}
              {(teacher.gramNam || teacher.thana || teacher.district) && (
                <Section
                  title="বর্তমান ঠিকানা"
                  color="rgba(239,68,68,0.06)"
                  borderColor="rgba(239,68,68,0.2)"
                  titleColor="#ef4444"
                  icon={<MapPin className="w-3 h-3" />}
                >
                  <InfoRow label="গ্রাম" value={teacher.gramNam} />
                  <InfoRow label="পাড়া" value={teacher.para} />
                  <InfoRow label="থানা" value={teacher.thana} />
                  <InfoRow label="জেলা" value={teacher.district} />
                  <InfoRow label="বিভাগ" value={teacher.division} />
                  <InfoRow label="চিহ্ন" value={teacher.landmark} />
                </Section>
              )}

              {/* Permanent address — always show, fallback to present if same */}
              {(() => {
                const pGram = teacher.permanentSameAsPresent
                  ? teacher.gramNam
                  : teacher.permanentGramNam;
                const pPara = teacher.permanentSameAsPresent
                  ? teacher.para
                  : teacher.permanentPara;
                const pThana = teacher.permanentSameAsPresent
                  ? teacher.thana
                  : teacher.permanentThana;
                const pDistrict = teacher.permanentSameAsPresent
                  ? teacher.district
                  : teacher.permanentDistrict;
                const pDivision = teacher.permanentSameAsPresent
                  ? teacher.division
                  : teacher.permanentDivision;
                if (!pGram && !pThana && !pDistrict) return null;
                return (
                  <Section
                    title="স্থায়ী ঠিকানা"
                    color="rgba(245,158,11,0.06)"
                    borderColor="rgba(245,158,11,0.2)"
                    titleColor="#f59e0b"
                    icon={<MapPin className="w-3 h-3" />}
                  >
                    {teacher.permanentSameAsPresent && (
                      <p
                        className="text-[10px] bangla mb-1 px-1 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(245,158,11,0.12)",
                          color: "#f59e0b",
                        }}
                      >
                        ★ বর্তমান ঠিকানার মতো
                      </p>
                    )}
                    <InfoRow label="গ্রাম" value={pGram} />
                    <InfoRow label="পাড়া" value={pPara} />
                    <InfoRow label="থানা" value={pThana} />
                    <InfoRow label="জেলা" value={pDistrict} />
                    <InfoRow label="বিভাগ" value={pDivision} />
                  </Section>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

// ── TeacherCard ───────────────────────────────────────────────────────────────
export const TeacherCard = ({
  teacher,
  index,
}: {
  teacher: Teacher;
  index: number;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const cfg = ROLE_CONFIG[teacher.role ?? "teacher"] ?? ROLE_CONFIG.teacher;
  const { color, label, Icon, handle } = cfg;

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
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-active-border)",
        }}
      >
        {/* Role color strip */}
        <div
          className="h-1.5"
          style={{ background: `linear-gradient(90deg,${color},${color}40)` }}
        />

        <div className="p-4 flex flex-col flex-1">
          {/* Avatar + name */}
          <div className="flex items-start gap-3 mb-4">
            <TeacherAvatar teacher={teacher} size={52} radius="rounded-xl" />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold bangla leading-snug text-[var(--color-text)] truncate">
                  {teacher.name}
                </p>
                <BadgeCheck
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color }}
                />
              </div>
              <p className="text-xs mt-0.5 font-mono text-[var(--color-gray)]">
                @{handle}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest bangla"
                  style={{ backgroundColor: color + "18", color }}
                >
                  {label}
                </span>
                {teacher.slug && (
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: "var(--color-active-bg)",
                      color: "var(--color-gray)",
                    }}
                  >
                    #{teacher.slug}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div
            className="space-y-2.5 pt-3 flex-1"
            style={{ borderTop: "1px solid var(--color-active-border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: color + "15" }}
              >
                <GraduationCap className="w-3 h-3" style={{ color }} />
              </div>
              <span className="text-sm bangla text-[var(--color-gray)] truncate">
                {teacher.qualification ??
                  (teacher.currentYear
                    ? (YEAR_LABEL[teacher.currentYear] ?? teacher.currentYear)
                    : null) ??
                  (teacher.degree
                    ? (DEGREE_LABEL[teacher.degree] ?? teacher.degree)
                    : null) ??
                  "যোগ্যতা অজানা"}
              </span>
            </div>
            {teacher.phone && (
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(16,185,129,0.1)" }}
                >
                  <Phone className="w-3 h-3" style={{ color: "#10b981" }} />
                </div>
                <span className="text-sm font-mono text-[var(--color-text)]">
                  {teacher.phone}
                </span>
              </div>
            )}
            {teacher.email && (
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(59,130,246,0.1)" }}
                >
                  <Mail className="w-3 h-3" style={{ color: "#3b82f6" }} />
                </div>
                <span className="text-xs text-[var(--color-gray)] truncate">
                  {teacher.email}
                </span>
              </div>
            )}
            {(teacher.thana || teacher.district) && (
              <div className="flex items-start gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)" }}
                >
                  <MapPin className="w-3 h-3" style={{ color: "#ef4444" }} />
                </div>
                <div className="space-y-0.5">
                  {teacher.thana && (
                    <p className="text-xs bangla text-[var(--color-gray)]">
                      {teacher.thana}
                    </p>
                  )}
                  {teacher.district && (
                    <p className="text-xs bangla text-[var(--color-gray)]">
                      {teacher.district}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bangla cursor-pointer transition-all"
            style={{
              border: "1px solid var(--color-active-border)",
              color: "var(--color-gray)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = color + "88";
              e.currentTarget.style.color = color;
              e.currentTarget.style.backgroundColor = color + "0a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-active-border)";
              e.currentTarget.style.color = "var(--color-gray)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            বিস্তারিত দেখুন
          </button>
        </div>
      </motion.div>

      {modalOpen && (
        <TeacherModal teacher={teacher} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{
      backgroundColor: "var(--color-bg)",
      border: "1px solid var(--color-active-border)",
    }}
  >
    <div
      className="h-1.5"
      style={{ backgroundColor: "var(--color-active-border)" }}
    />
    <div className="p-4">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="rounded-xl animate-pulse shrink-0"
          style={{
            width: 52,
            height: 52,
            backgroundColor: "var(--color-active-bg)",
          }}
        />
        <div className="flex-1 pt-1 space-y-2">
          <div
            className="h-3.5 rounded animate-pulse w-3/4"
            style={{ backgroundColor: "var(--color-active-bg)" }}
          />
          <div
            className="h-3 rounded animate-pulse w-1/2"
            style={{ backgroundColor: "var(--color-active-bg)" }}
          />
          <div
            className="h-3 rounded animate-pulse w-1/3"
            style={{ backgroundColor: "var(--color-active-bg)" }}
          />
        </div>
      </div>
      <div
        className="space-y-2.5 pt-3"
        style={{ borderTop: "1px solid var(--color-active-border)" }}
      >
        <div
          className="h-3.5 rounded animate-pulse w-2/3"
          style={{ backgroundColor: "var(--color-active-bg)" }}
        />
        <div
          className="h-3.5 rounded animate-pulse w-1/2"
          style={{ backgroundColor: "var(--color-active-bg)" }}
        />
        <div
          className="h-3.5 rounded animate-pulse w-3/4"
          style={{ backgroundColor: "var(--color-active-bg)" }}
        />
      </div>
      <div
        className="mt-4 h-10 rounded-xl animate-pulse"
        style={{ backgroundColor: "var(--color-active-bg)" }}
      />
    </div>
  </div>
);

// ── SearchBar ─────────────────────────────────────────────────────────────────
export const TeacherSearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative w-full sm:w-72">
    <Search
      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
      style={{ color: "var(--color-gray)" }}
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
      className="w-full h-11 pl-10 pr-10 text-sm rounded-xl outline-none transition-all bangla"
      style={{
        backgroundColor: "var(--color-active-bg)",
        border: "1px solid var(--color-active-border)",
        color: "var(--color-text)",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
      onBlur={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-active-border)")
      }
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
        style={{
          backgroundColor: "var(--color-active-bg)",
          color: "var(--color-gray)",
        }}
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = () => (
  <div className="text-center py-24">
    <User
      className="w-12 h-12 mx-auto mb-4"
      style={{ color: "var(--color-active-border)" }}
    />
    <p className="bangla text-[var(--color-gray)]">কোনো শিক্ষক পাওয়া যায়নি</p>
  </div>
);

// ── PageShell ─────────────────────────────────────────────────────────────────
export const TeacherFilesPageShell = ({
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
  <div
    className="min-h-screen px-4 sm:px-6 py-8"
    style={{ backgroundColor: "var(--color-bg)" }}
  >
    <div className="mb-7 mt-10 lg:mt-0 flex items-end justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold bangla text-[var(--color-text)]">
          শিক্ষক তালিকা
        </h1>
        <p className="text-sm bangla mt-1 text-[var(--color-gray)]">
          মোট{" "}
          <span className="font-semibold" style={{ color: "#3b82f6" }}>
            {totalCount}
          </span>{" "}
          জন নিবন্ধিত
        </p>
      </div>
      <TeacherSearchBar value={search} onChange={onSearch} />
    </div>
    {children}
  </div>
);
