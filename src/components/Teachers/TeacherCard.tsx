// src/components/Teachers/TeacherCard.tsx
import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  GraduationCap,
  ShieldCheck,
  User,
  BadgeCheck,
  MoreHorizontal,
} from "lucide-react";

export interface TeacherData {
  _id: string;
  name: string;
  email: string;
  role: string;
  slug: string;
  phone?: string;
  address?: string;
  qualification?: string | null;
  avatar?: { url: string | null; publicId: string | null };
}

const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    Icon: React.ElementType;
    desc: string;
    handle: string;
  }
> = {
  principal: {
    label: "অধ্যক্ষ",
    color: "#8b5cf6",
    Icon: Crown,
    desc: "প্রধান শিক্ষক",
    handle: "principal",
  },
  admin: {
    label: "প্রশাসক",
    color: "#ef4444",
    Icon: ShieldCheck,
    desc: "প্রশাসনিক কর্মকর্তা",
    handle: "admin",
  },
  teacher: {
    label: "শিক্ষক",
    color: "#3b82f6",
    Icon: GraduationCap,
    desc: "শিক্ষক",
    handle: "teacher",
  },
};

const TeacherCard = ({ teacher }: { teacher: TeacherData }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const { color, handle } = ROLE_CONFIG[teacher.role] ?? ROLE_CONFIG.teacher;

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer px-4 pt-3 pb-3 mx-3 w-80 bg-[var(--color-active-bg)] border border-[var(--color-active-border)] rounded hover:bg-[var(--color-active-bg)] "
      transition={{ duration: 0.15 }}
    >
      {/* Main content row */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            width: 42,
            height: 42,
            background: `linear-gradient(135deg, ${color}33, ${color}55)`,
            border: `1.5px solid ${color}55`,
          }}
        >
          {teacher.avatar?.url ? (
            <img
              src={teacher.avatar.url}
              alt={teacher.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" style={{ color }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex  flex-col items-start gap-x-1 min-w-0">
              {/* Name */}
              <div className="flex iems-center gap-x-3 ">
                <span
                  className="font-bold text-[15px] leading-tight truncate max-w-[160px] text-[var(--color-text)]"
                  title={teacher.name}
                >
                  {teacher.name}
                </span>

                {/* Verified tick */}
                <BadgeCheck className="w-4 h-4  " style={{ color }} />
              </div>

              {/* Dot + "শিক্ষক" label */}
              <span className="text-sm text-[var(--color-gray)]">
                @{handle}
              </span>
            </div>

            {/* More button */}
            <button
              className="rounded-full p-1 shrink-0 text-[var(--color-gray)] hover:text-[var(--color-text)] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-[17px] h-[17px] pointer-events-none" />
            </button>
          </div>

          {/* Post body — qualification as tweet text */}
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-gray)]">
            Qualification: {teacher.qualification?.trim() || "Honours Studying"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherCard;
