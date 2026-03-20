// src/components/Teachers/TeacherFiles.Ui.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  Mail,
  Eye,
  Crown,
  GraduationCap,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

import Avatar from "../common/Avatar";
import PersonModal, {
  InfoRow,
  Section,
  formatDOB,
} from "../common/PersonModal";

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
  gramNam?: string | null;
  para?: string | null;
  thana?: string | null;
  district?: string | null;
  division?: string | null;
  landmark?: string | null;
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

// ── TeacherModal ──────────────────────────────────────────────────────────────
export const TeacherModal = ({
  teacher,
  onClose,
}: {
  teacher: Teacher;
  onClose: () => void;
}) => {
  const { color, label, handle } =
    ROLE_CONFIG[teacher.role ?? "teacher"] ?? ROLE_CONFIG.teacher;

  const pAddr = teacher.permanentSameAsPresent
    ? {
        gram: teacher.gramNam,
        para: teacher.para,
        thana: teacher.thana,
        district: teacher.district,
        division: teacher.division,
      }
    : {
        gram: teacher.permanentGramNam,
        para: teacher.permanentPara,
        thana: teacher.permanentThana,
        district: teacher.permanentDistrict,
        division: teacher.permanentDivision,
      };

  const hasPresent = teacher.gramNam || teacher.thana || teacher.district;
  const hasPermanent = pAddr.gram || pAddr.thana || pAddr.district;
  const hasEducation =
    teacher.qualification ||
    teacher.degree ||
    teacher.currentYear ||
    teacher.educationComplete !== null;

  return (
    <PersonModal
      onClose={onClose}
      accentColor={color}
      header={
        <>
          <Avatar
            name={teacher.name}
            url={teacher.avatar?.url}
            color={color}
            size={68}
            radius="rounded-2xl"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-base font-bold bangla leading-snug text-[var(--color-text)]">
                {teacher.name}
              </p>
              <BadgeCheck className="w-4 h-4 shrink-0" style={{ color }} />
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
        </>
      }
    >
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
          value={teacher.dateOfBirth ? formatDOB(teacher.dateOfBirth) : null}
        />
        <InfoRow label="বাবা" value={teacher.fatherName} />
        <InfoRow label="মা" value={teacher.motherName} />
        <InfoRow label="জরুরি" value={teacher.emergencyContact} />
      </Section>

      {hasEducation && (
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
                ? (YEAR_LABEL[teacher.currentYear] ?? teacher.currentYear)
                : null
            }
          />
        </Section>
      )}

      {hasPresent && (
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

      {hasPermanent && (
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
          <InfoRow label="গ্রাম" value={pAddr.gram} />
          <InfoRow label="পাড়া" value={pAddr.para} />
          <InfoRow label="থানা" value={pAddr.thana} />
          <InfoRow label="জেলা" value={pAddr.district} />
          <InfoRow label="বিভাগ" value={pAddr.division} />
        </Section>
      )}
    </PersonModal>
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
  const { color, label, handle } =
    ROLE_CONFIG[teacher.role ?? "teacher"] ?? ROLE_CONFIG.teacher;

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
        <div
          className="h-1.5"
          style={{ background: `linear-gradient(90deg,${color},${color}40)` }}
        />

        <div className="p-4 flex flex-col flex-1">
          {/* avatar + name */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar
              name={teacher.name}
              url={teacher.avatar?.url}
              color={color}
              size={52}
              radius="rounded-xl"
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold bangla leading-snug text-[var(--color-text)] truncate">
                  {teacher.name}
                </p>
                <BadgeCheck
                  className="w-3.5 h-3.5 shrink-0"
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

          {/* info rows */}
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
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(16,185,129,0.1)]">
                  <Phone className="w-3 h-3" style={{ color: "#10b981" }} />
                </div>
                <span className="text-sm font-mono text-[var(--color-text)]">
                  {teacher.phone}
                </span>
              </div>
            )}
            {teacher.email && (
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(59,130,246,0.1)]">
                  <Mail className="w-3 h-3" style={{ color: "#3b82f6" }} />
                </div>
                <span className="text-xs text-[var(--color-gray)] truncate">
                  {teacher.email}
                </span>
              </div>
            )}
            {(teacher.thana || teacher.district) && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[rgba(239,68,68,0.08)]">
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

          {/* view button */}
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
