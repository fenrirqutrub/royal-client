// src/components/Teachers/TeacherCard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  GraduationCap,
  ShieldCheck,
  User,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
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
    handle: string;
    Icon: React.ElementType;
    desc: string;
  }
> = {
  principal: {
    label: "অধ্যক্ষ",
    color: "#8b5cf6",
    handle: "principal",
    Icon: Crown,
    desc: "প্রধান শিক্ষক",
  },
  admin: {
    label: "প্রশাসক",
    color: "#ef4444",
    handle: "admin",
    Icon: ShieldCheck,
    desc: "প্রশাসনিক কর্মকর্তা",
  },
  teacher: {
    label: "শিক্ষক",
    color: "#1d9bf0",
    handle: "teacher",
    Icon: GraduationCap,
    desc: "শিক্ষক",
  },
};

const TeacherCard = ({ teacher }: { teacher: TeacherData }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 120) + 12,
  );

  const { color, Icon, desc, handle } =
    ROLE_CONFIG[teacher.role] ?? ROLE_CONFIG.teacher;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((p) => !p);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{
        width: "clamp(300px, 32vw, 600px)",
        minWidth: "300px",
        backgroundColor: "#000000",
        border: "1px solid #2f3336",
        borderRadius: "0px",
        fontFamily:
          "'TwitterChirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      whileHover={{ backgroundColor: "#080808" }}
      transition={{ duration: 0.15 }}
    >
      {/* Main content row */}
      <div className="flex gap-3 px-4 pt-3 pb-1">
        {/* Left: Avatar column */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className="rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              background: `linear-gradient(135deg, ${color}33, ${color}66)`,
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
          {/* Thread line (decorative) */}
          <div
            className="w-0.5 flex-1 mt-1 mb-1 opacity-20"
            style={{ background: "#536471", minHeight: 20 }}
          />
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              <span
                className="font-bold text-[15px] leading-tight truncate max-w-[140px]"
                style={{ color: "#e7e9ea" }}
                title={teacher.name}
              >
                {teacher.name}
              </span>
              {/* Verified badge tinted by role color */}
              <BadgeCheck
                className="w-[18px] h-[18px] shrink-0"
                style={{ color }}
              />
              <span
                className="text-[15px] leading-tight truncate"
                style={{ color: "#536471" }}
              >
                @{teacher.slug || handle}
              </span>
              <span style={{ color: "#536471", fontSize: 13 }}>·</span>
              <span style={{ color: "#536471", fontSize: 13 }}>শিক্ষক</span>
            </div>
            <button
              className="rounded-full p-1.5 flex items-center justify-center shrink-0"
              style={{ color: "#536471" }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Post body — qualification as "post text" */}
          <div className="mt-1">
            <p
              className="text-[15px] leading-relaxed bangla"
              style={{ color: "#e7e9ea" }}
            >
              {teacher.qualification?.trim() || "Honours Studying"}
            </p>
          </div>

          {/* Role badge pill */}
          <div className="mt-2 mb-2 flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bangla"
              style={{
                background: `${color}18`,
                color,
                border: `1px solid ${color}33`,
              }}
            >
              <Icon className="w-3 h-3" />
              {desc}
            </span>
          </div>

          {/* Action bar */}
          <div
            className="flex items-center justify-between mt-1 mb-2"
            style={{ maxWidth: 320, color: "#536471" }}
          >
            {/* Reply */}
            <button
              className="group flex items-center gap-1.5 text-[13px] rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="group-hover:bg-[#1d9bf022] rounded-full p-1.5 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </span>
              <span className="group-hover:text-[#1d9bf0] transition-colors">
                {Math.floor(Math.random() * 40) + 2}
              </span>
            </button>

            {/* Repost */}
            <button
              className="group flex items-center gap-1.5 text-[13px]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="group-hover:bg-[#00ba7c22] rounded-full p-1.5 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </span>
              <span className="group-hover:text-[#00ba7c] transition-colors">
                {Math.floor(Math.random() * 30) + 1}
              </span>
            </button>

            {/* Like */}
            <motion.button
              className="group flex items-center gap-1.5 text-[13px]"
              onClick={handleLike}
              whileTap={{ scale: 1.3 }}
            >
              <span className="group-hover:bg-[#f9197322] rounded-full p-1.5 transition-colors">
                <Heart
                  className="w-[18px] h-[18px] transition-colors"
                  style={{ color: liked ? "#f91880" : undefined }}
                  fill={liked ? "#f91880" : "none"}
                />
              </span>
              <span
                className="transition-colors"
                style={{ color: liked ? "#f91880" : undefined }}
              >
                {likeCount}
              </span>
            </motion.button>

            {/* Bookmark */}
            <motion.button
              className="group flex items-center gap-1.5"
              onClick={handleBookmark}
              whileTap={{ scale: 1.25 }}
            >
              <span className="group-hover:bg-[#1d9bf022] rounded-full p-1.5 transition-colors">
                <Bookmark
                  className="w-[18px] h-[18px] transition-colors"
                  style={{ color: bookmarked ? "#1d9bf0" : undefined }}
                  fill={bookmarked ? "#1d9bf0" : "none"}
                />
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div style={{ borderTop: "1px solid #2f3336" }} />
    </motion.div>
  );
};

export default TeacherCard;
