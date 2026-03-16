// src/components/Teachers/TeacherCard.tsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, GraduationCap, ShieldCheck, User } from "lucide-react";

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
  { label: string; color: string; Icon: React.ElementType; desc: string }
> = {
  principal: {
    label: "অধ্যক্ষ",
    color: "#8b5cf6",
    Icon: Crown,
    desc: "প্রধান শিক্ষক",
  },
  admin: {
    label: "প্রশাসক",
    color: "#ef4444",
    Icon: ShieldCheck,
    desc: "প্রশাসনিক কর্মকর্তা",
  },
  teacher: {
    label: "শিক্ষক",
    color: "#3b82f6",
    Icon: GraduationCap,
    desc: "শিক্ষক",
  },
};

const TeacherCard = ({ teacher }: { teacher: TeacherData }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / (width / 2);
    const y = (clientY - (top + height / 2)) / (height / 2);
    setPosition({ x: x * 16, y: y * 16 });
  };

  const { color, Icon, desc } =
    ROLE_CONFIG[teacher.role] ?? ROLE_CONFIG.teacher;

  return (
    <motion.div
      ref={cardRef}
      className="relative mx-3 cursor-pointer select-none overflow-hidden rounded-2xl flex flex-row gap-4 px-4 py-2"
      style={{
        width: "clamp(260px, 28vw, 340px)",
        minWidth: "260px",
        backgroundColor: "var(--color-active-bg)",
        border: "1px solid var(--color-active-border)",
        boxShadow: isHovered
          ? `0 12px 40px ${color}22, 0 2px 8px rgba(0,0,0,0.08)`
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.3s ease",
      }}
      animate={{
        x: position.x,
        y: position.y,
        rotateX: position.y * 0.7,
        rotateY: position.x * -0.7,
        scale: isHovered ? 1.04 : 1,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(180deg, ${color}, ${color}66)` }}
      />

      {/* Avatar */}
      <div
        className="shrink-0 rounded-full overflow-hidden flex items-center justify-center h-20 w-20"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          border: `1.5px solid ${color}44`,
        }}
      >
        {teacher.avatar?.url ? (
          <img
            src={teacher.avatar.url}
            alt={teacher.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-8 h-8" style={{ color }} />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
        <h3
          className="font-bold text-base leading-tight truncate bangla"
          style={{ color: "var(--color-text)" }}
          title={teacher.name}
        >
          {teacher.name}
        </h3>

        <p className="text-sm truncate bangla text-[var(--color-gray)] flex items-center gap-x-1 ">
          <Icon className="h-4 w-4" />
          {desc}
        </p>
        <p className="text-xs truncate bangla text-[var(--color-gray)]">
          {teacher.qualification?.trim() || "Honours Studying"}
        </p>
      </div>

      {/* Slug — top right */}
      {teacher.slug && (
        <span
          className="absolute top-3 right-3 text-[9px] font-mono tracking-widest opacity-20"
          style={{ color: "var(--color-text)" }}
        >
          {teacher.slug}
        </span>
      )}
    </motion.div>
  );
};

export default TeacherCard;
