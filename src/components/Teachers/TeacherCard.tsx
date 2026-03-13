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
  avatar?: { url: string | null; publicId: string | null };
}

const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; Icon: React.ElementType }
> = {
  principal: { label: "অধ্যক্ষ", color: "#8b5cf6", Icon: Crown },
  admin: { label: "প্রশাসক", color: "#ef4444", Icon: ShieldCheck },
  teacher: { label: "শিক্ষক", color: "#3b82f6", Icon: GraduationCap },
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
    setPosition({ x: x * 18, y: y * 18 });
  };

  const { label, color, Icon } =
    ROLE_CONFIG[teacher.role] ?? ROLE_CONFIG.teacher;

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer rounded-xl overflow-hidden mx-2 sm:mx-3 select-none bg-[var(--color-active-bg)] border border-[var(--color-active-border)] w-xs "
      animate={{
        x: position.x,
        y: position.y,
        rotateX: position.y * 0.8,
        rotateY: position.x * -0.8,
        scale: isHovered ? 1.06 : 1,
      }}
      transition={{ type: "spring", stiffness: 250, damping: 20, mass: 1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      onMouseEnter={() => setIsHovered(true)}
    >
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{
          height: "clamp(120px, 14vw, 160px)",
          background: `linear-gradient(135deg, ${color}18, ${color}35)`,
          borderBottom: `1px solid ${color}33`,
        }}
      >
        {teacher.avatar?.url ? (
          <img
            src={teacher.avatar.url}
            alt={teacher.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: "clamp(56px, 7vw, 80px)",
              height: "clamp(56px, 7vw, 80px)",
              background: `linear-gradient(135deg, ${color}33, ${color}66)`,
              border: `2px solid ${color}55`,
            }}
          >
            <User
              style={{
                color,
                width: "clamp(26px, 3vw, 36px)",
                height: "clamp(26px, 3vw, 36px)",
              }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-1.5 px-3 py-3 sm:px-4 sm:py-4">
        <p
          className="font-bold leading-tight text-center w-full truncate bangla text-lg md:text-xl text-[var(--color-text)] "
          title={teacher.name}
        >
          {teacher.name}
        </p>

        <span
          className="flex items-center gap-1.5 font-semibold px-3 py-1 rounded-full bangla text-lg"
          style={{
            backgroundColor: `${color}18`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          <Icon className="w-5 h-5" />
          {label}
        </span>

        <p
          className="font-mono opacity-25 tracking-widest"
          style={{
            color: "var(--color-text)",
            fontSize: "clamp(9px, 0.9vw, 11px)",
          }}
        >
          BBA
        </p>
      </div>
    </motion.div>
  );
};

export default TeacherCard;
