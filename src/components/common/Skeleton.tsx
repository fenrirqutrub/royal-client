// src/components/common/Skeleton.tsx
//
// CHANGE: "profile" variant যোগ করা হয়েছে
// Profile.tsx-এর exact structure মিলিয়ে:
//   • Hero card (avatar circle + name + role badge)
//   • Missing fields warning bar
//   • Personal info card (৫টা field row)
//   • Contact card (৩টা field row)
//   • Address card (৬টা field row)
//   • Education card (৩টা field row)

import { useMemo } from "react";
import { motion } from "framer-motion";

/* ════════════════════════════════════════════════════════════════
   Skeleton — Universal Loading Placeholder Component
   ════════════════════════════════════════════════════════════════

   IMPORT করার নিয়ম:
   ─────────────────
   import Skeleton from "../../components/common/Skeleton";

   ════════════════════════════════════════════════════════════════
   AVAILABLE VARIANTS & HOW TO USE
   ════════════════════════════════════════════════════════════════

   ① HERO — Hero slider লোডিং এর সময়
   <Skeleton variant="hero" />

   ② CARD — ছবি ছাড়া কার্ড
   <Skeleton variant="card" count={3} />

   ③ CARD-IMAGE — ছবিসহ কার্ড
   <Skeleton variant="card-image" count={4} />

   ④ NOTICE — নোটিশ বোর্ড / টেবিল লাইন
   <Skeleton variant="notice" count={8} />   ← count = row সংখ্যা

   ⑤ PICTURE — ছবির গ্যালারি / গ্রিড
   <Skeleton variant="picture" count={8} height="180px" />

   ⑥ DAILY-LESSON — DailyLesson পুরো পেজ
   <Skeleton variant="daily-lesson" />

   ⑦ TEACHER-CARD — শিক্ষক তালিকা গ্রিড
   <Skeleton variant="teacher-card" count={6} />

   ⑧ STUDENT-CARD — ছাত্রছাত্রী তালিকা গ্রিড
   <Skeleton variant="student-card" count={6} />

   ⑨ RECT — যেকোনো কাস্টম আকারের placeholder
   <Skeleton variant="rect" width="200px" height="40px" />

   ⑩ PROFILE — প্রোফাইল পেজ (Profile.tsx)
   ──────────────────────────────────────────
   <Skeleton variant="profile" />

   Profile.tsx-এর exact structure:
     Hero card (avatar + name + role badges)
     + warning bar + Personal + Contact + Address + Education cards

   যেখানে use করবে (Profile.tsx):
     if (isLoading) return (
       <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
         <Skeleton variant="profile" />
       </div>
     );

   ════════════════════════════════════════════════════════════════
   EXTRA PROPS
   ════════════════════════════════════════════════════════════════
   speed    → shimmer speed (seconds), default: 1.6
   className → wrapper-এ extra Tailwind class
════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════ */
export type SkeletonVariant =
  | "hero"
  | "card"
  | "card-image"
  | "notice"
  | "picture"
  | "daily-lesson"
  | "teacher-card"
  | "student-card"
  | "profile"
  | "rect";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  width?: string;
  height?: string;
  className?: string;
  speed?: number;
  rounded?: string;
}

/* ══════════════════════════════════════════════════
   BONE — atomic shimmer block
══════════════════════════════════════════════════ */
interface BoneProps {
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  onDark?: boolean;
  delay?: number;
}

const Bone = ({
  className = "",
  style,
  speed = 1.6,
  onDark = false,
  delay = 0,
}: BoneProps) => (
  <motion.div
    className={[
      "rounded",
      onDark
        ? "bg-white/10"
        : "bg-[var(--color-active-bg)] border border-[var(--color-active-border)]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    style={style}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ repeat: Infinity, duration: speed, ease: "easeInOut", delay }}
  />
);

/* ══════════════════════════════════════════════════
   STAGGER / ROW helpers
══════════════════════════════════════════════════ */
const Stagger = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.07 } },
    }}
  >
    {children}
  </motion.div>
);

const Row = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 6 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      },
    }}
  >
    {children}
  </motion.div>
);

/* ══════════════════════════════════════════════════
   VARIANT ①  HERO
══════════════════════════════════════════════════ */
const HeroSkeleton = ({ speed }: { speed?: number }) => (
  <section
    aria-hidden="true"
    className="w-full relative overflow-hidden bg-[var(--color-bg)]"
    style={{ height: "clamp(240px, 40vw, 470px)" }}
  >
    <Bone
      className="absolute inset-0 w-full h-full rounded-none"
      onDark
      speed={speed}
    />
    <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
    <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/55 via-transparent to-transparent pointer-events-none" />

    <motion.div
      className="absolute top-4 left-4 md:top-6 md:left-7 z-20"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-6 h-6 md:w-8 md:h-8">
        <span className="absolute top-0 left-0 w-full h-[1.5px] bg-white/20" />
        <span className="absolute top-0 left-0 w-[1.5px] h-full bg-white/20" />
      </div>
    </motion.div>
    <motion.div
      className="absolute bottom-8 right-4 md:bottom-10 md:right-7 z-20"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-6 h-6 md:w-8 md:h-8">
        <span className="absolute bottom-0 right-0 w-full h-[1.5px] bg-white/20" />
        <span className="absolute bottom-0 right-0 w-[1.5px] h-full bg-white/20" />
      </div>
    </motion.div>

    <div className="absolute top-4 right-5 md:top-6 md:right-8 z-20 flex items-baseline gap-1.5">
      <Bone
        className="w-7 h-5 md:w-8 md:h-6"
        onDark
        speed={speed}
        delay={0.1}
      />
      <Bone className="w-4 h-2.5" onDark speed={speed} delay={0.15} />
    </div>

    <Stagger className="absolute inset-x-0 bottom-0 z-20 px-5 md:px-12 pb-6 md:pb-9 flex flex-col gap-3">
      <Row className="flex items-center gap-2">
        <Bone className="w-5 h-px" onDark speed={speed} />
        <Bone className="w-20 h-2" onDark speed={speed} />
      </Row>
      <Row>
        <Bone
          className="w-[55%] rounded-sm"
          onDark
          speed={speed}
          style={{ height: "clamp(22px, 2.8vw, 38px)" }}
        />
      </Row>
      <Row>
        <Bone
          className="w-[38%] rounded-sm"
          onDark
          speed={speed}
          style={{ height: "clamp(16px, 2vw, 28px)" }}
        />
      </Row>
      <Row className="hidden md:flex flex-col gap-1.5">
        <Bone className="w-[480px] max-w-full h-2.5" onDark speed={speed} />
        <Bone className="w-[360px] max-w-full h-2.5" onDark speed={speed} />
      </Row>
      <Row className="flex items-center justify-between mt-0.5">
        <Bone className="w-28 h-8 rounded-none" onDark speed={speed} />
        <div className="flex items-center gap-3">
          <Bone className="w-7 h-7 rounded-none" onDark speed={speed} />
          <div className="flex items-center gap-1.5">
            <Bone
              className="h-1.5 rounded-full"
              onDark
              speed={speed}
              style={{ width: 22 }}
            />
            <Bone
              className="w-1.5 h-1.5 rounded-full"
              onDark
              speed={speed}
              delay={0.05}
            />
            <Bone
              className="w-1.5 h-1.5 rounded-full"
              onDark
              speed={speed}
              delay={0.1}
            />
          </div>
          <Bone className="w-7 h-7 rounded-none" onDark speed={speed} />
        </div>
      </Row>
    </Stagger>
    <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10" />
  </section>
);

/* ══════════════════════════════════════════════════
   VARIANT ②  CARD
══════════════════════════════════════════════════ */
const CardSkeleton = ({ speed }: { speed?: number }) => (
  <Stagger className="flex flex-col gap-3 p-4 md:p-5 rounded-lg border border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
    <Row>
      <Bone className="w-16 h-5 rounded-full" speed={speed} />
    </Row>
    <Row className="flex flex-col gap-2">
      <Bone className="w-full h-4" speed={speed} />
      <Bone className="w-4/5 h-4" speed={speed} />
    </Row>
    <Row className="flex flex-col gap-1.5">
      <Bone className="w-full h-3" speed={speed} />
      <Bone className="w-full h-3" speed={speed} />
      <Bone className="w-3/5 h-3" speed={speed} />
    </Row>
    <Row className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-2">
        <Bone className="w-7 h-7 rounded-full shrink-0" speed={speed} />
        <Bone className="w-20 h-3" speed={speed} />
      </div>
      <Bone className="w-14 h-3" speed={speed} />
    </Row>
    <Row>
      <div className="h-px bg-[var(--color-active-border)]" />
    </Row>
    <Row className="flex items-center justify-between">
      <Bone className="w-24 h-8 rounded" speed={speed} />
      <Bone className="w-6 h-6 rounded-full" speed={speed} />
    </Row>
  </Stagger>
);

/* ══════════════════════════════════════════════════
   VARIANT ③  CARD WITH IMAGE
══════════════════════════════════════════════════ */
const CardImageSkeleton = ({ speed }: { speed?: number }) => (
  <Stagger className="flex flex-col rounded-lg overflow-hidden border border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
    <Row>
      <Bone className="w-full h-44 md:h-52 rounded-none" speed={speed} />
    </Row>
    <div className="flex flex-col gap-3 p-4 md:p-5">
      <Row>
        <Bone className="w-14 h-5 rounded-full" speed={speed} />
      </Row>
      <Row className="flex flex-col gap-2">
        <Bone className="w-full h-4" speed={speed} />
        <Bone className="w-4/5 h-4" speed={speed} />
      </Row>
      <Row className="flex flex-col gap-1.5">
        <Bone className="w-full h-3" speed={speed} />
        <Bone className="w-full h-3" speed={speed} />
        <Bone className="w-2/3 h-3" speed={speed} />
      </Row>
      <Row className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <Bone className="w-7 h-7 rounded-full shrink-0" speed={speed} />
          <div className="flex flex-col gap-1">
            <Bone className="w-20 h-2.5" speed={speed} />
            <Bone className="w-14 h-2" speed={speed} />
          </div>
        </div>
        <Bone className="w-16 h-8 rounded" speed={speed} />
      </Row>
    </div>
  </Stagger>
);

/* ══════════════════════════════════════════════════
   VARIANT ④  NOTICE
══════════════════════════════════════════════════ */
const NoticeRowSkeleton = ({
  speed,
  delay = 0,
}: {
  speed: number;
  delay?: number;
}) => (
  <motion.div
    className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 border-b border-[var(--color-active-border)] last:border-b-0"
    variants={{
      hidden: { opacity: 0, x: -8 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay },
      },
    }}
  >
    <Bone className="hidden sm:block w-8 h-8 rounded shrink-0" speed={speed} />
    <Bone className="w-2 h-2 rounded-full shrink-0" speed={speed} />
    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
      <Bone className="w-full h-3.5" speed={speed} />
      <Bone className="w-3/5 h-2.5" speed={speed} />
    </div>
    <Bone
      className="hidden md:block w-16 h-5 rounded-full shrink-0"
      speed={speed}
    />
    <Bone className="w-14 h-3 shrink-0" speed={speed} />
    <Bone className="w-5 h-5 rounded-full shrink-0" speed={speed} />
  </motion.div>
);

const NoticeSkeleton = ({
  rows = 5,
  speed = 1.6,
}: {
  rows?: number;
  speed?: number;
}) => (
  <div className="rounded-lg overflow-hidden border border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
    <motion.div
      className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 border-b-2 border-[var(--color-active-border)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Bone className="hidden sm:block w-8 h-3 rounded" speed={speed} />
      <Bone className="w-2 h-3 rounded" speed={speed} />
      <Bone className="flex-1 h-3 rounded" speed={speed} />
      <Bone className="hidden md:block w-16 h-3 rounded" speed={speed} />
      <Bone className="w-14 h-3 rounded" speed={speed} />
      <Bone className="w-5 h-3 rounded" speed={speed} />
    </motion.div>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <NoticeRowSkeleton key={i} speed={speed} delay={i * 0.06} />
      ))}
    </motion.div>
    <motion.div
      className="flex items-center justify-between px-3 md:px-4 py-3 border-t border-[var(--color-active-border)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Bone className="w-24 h-3" speed={speed} />
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} className="w-7 h-7 rounded" speed={speed} />
        ))}
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════
   VARIANT ⑤  PICTURE
══════════════════════════════════════════════════ */
const PictureItem = ({
  height = "200px",
  speed = 1.6,
  delay = 0,
}: {
  height?: string;
  speed?: number;
  delay?: number;
}) => (
  <motion.div
    className="flex flex-col gap-2"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
  >
    <Bone className="w-full rounded-md" speed={speed} style={{ height }} />
    <div className="flex flex-col gap-1.5 px-0.5">
      <Bone className="w-3/4 h-3" speed={speed} delay={delay + 0.05} />
      <Bone className="w-1/2 h-2.5" speed={speed} delay={delay + 0.1} />
    </div>
  </motion.div>
);

const PictureSkeleton = ({
  count = 4,
  height = "200px",
  speed = 1.6,
}: {
  count?: number;
  height?: string;
  speed?: number;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <PictureItem key={i} height={height} speed={speed} delay={i * 0.08} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   VARIANT ⑥  DAILY-LESSON
══════════════════════════════════════════════════ */
const DailyLessonCardSkeleton = ({
  speed,
  delay = 0,
}: {
  speed?: number;
  delay?: number;
}) => (
  <motion.div
    className="overflow-hidden rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
  >
    <Bone className="h-1.5 w-full rounded-none" speed={speed} delay={delay} />
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Bone className="h-6 w-2/3" speed={speed} delay={delay + 0.05} />
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <Bone className="h-3.5 w-16" speed={speed} delay={delay + 0.08} />
            <Bone className="h-3.5 w-20" speed={speed} delay={delay + 0.1} />
            <Bone className="h-3.5 w-24" speed={speed} delay={delay + 0.12} />
            <Bone className="h-3.5 w-28" speed={speed} delay={delay + 0.14} />
          </div>
        </div>
        <Bone
          className="w-10 h-10 rounded-xl shrink-0"
          speed={speed}
          delay={delay + 0.06}
        />
      </div>
      <div className="space-y-2">
        <Bone className="h-3.5 w-full" speed={speed} delay={delay + 0.16} />
        <Bone className="h-3.5 w-full" speed={speed} delay={delay + 0.18} />
        <Bone className="h-3.5 w-4/5" speed={speed} delay={delay + 0.2} />
        <Bone className="h-3.5 w-3/5" speed={speed} delay={delay + 0.22} />
      </div>
    </div>
  </motion.div>
);

const ClassGroupTitleSkeleton = ({
  speed,
  delay = 0,
}: {
  speed?: number;
  delay?: number;
}) => (
  <motion.div
    className="relative flex items-center gap-0 mb-5 mt-12 overflow-hidden rounded-lg"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    <Bone
      className="w-1.5 self-stretch rounded-l-2xl rounded-r-none shrink-0"
      speed={speed}
      delay={delay}
    />
    <div className="flex-1 flex items-center justify-between px-5 py-2 border border-l-0 border-[var(--color-active-border)] rounded-r-lg bg-[var(--color-active-bg)]">
      <Bone className="h-7 w-28 md:w-36" speed={speed} delay={delay + 0.05} />
      <Bone
        className="hidden sm:block h-10 w-px mx-4"
        speed={speed}
        delay={delay + 0.05}
      />
      <Bone className="h-7 w-24 md:w-28" speed={speed} delay={delay + 0.08} />
    </div>
  </motion.div>
);

const DailyLessonSkeleton = ({
  groups = 2,
  cardsPerGroup = 4,
  speed = 1.6,
}: {
  groups?: number;
  cardsPerGroup?: number;
  speed?: number;
}) => (
  <div aria-hidden="true" aria-label="Loading…">
    <motion.header
      className="text-center mb-6 space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex justify-center">
        <Bone className="h-8 md:h-12 w-40 md:w-64" speed={speed} />
      </div>
      <div className="flex justify-center">
        <Bone className="h-5 md:h-7 w-56 md:w-80" speed={speed} delay={0.06} />
      </div>
    </motion.header>
    <motion.div
      className="flex flex-wrap items-center gap-3 px-3 md:px-0 mb-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Bone className="h-10 w-28 rounded-xl" speed={speed} delay={0.12} />
      <Bone
        className="hidden sm:block h-8 w-px rounded-full"
        speed={speed}
        delay={0.14}
      />
      <Bone className="h-10 w-64 rounded-xl" speed={speed} delay={0.16} />
      <Bone
        className="hidden sm:block ml-auto h-4 w-32"
        speed={speed}
        delay={0.18}
      />
    </motion.div>
    <div className="mt-4 px-3 md:px-0">
      {Array.from({ length: groups }).map((_, gi) => (
        <div key={gi}>
          <ClassGroupTitleSkeleton speed={speed} delay={gi * 0.1} />
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: cardsPerGroup }).map((_, ci) => (
              <DailyLessonCardSkeleton
                key={ci}
                speed={speed}
                delay={gi * 0.1 + ci * 0.07}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   VARIANT ⑦  TEACHER-CARD
══════════════════════════════════════════════════ */
const TeacherCardBone = ({
  speed,
  delay = 0,
}: {
  speed?: number;
  delay?: number;
}) => (
  <motion.div
    className="rounded-2xl overflow-hidden flex flex-col border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
  >
    <Bone className="h-1.5 w-full rounded-none" speed={speed} delay={delay} />
    <div className="p-4 flex flex-col flex-1">
      <div className="flex items-start gap-3 mb-4">
        <Bone
          className="rounded-xl shrink-0"
          speed={speed}
          delay={delay + 0.04}
          style={{ width: 52, height: 52 }}
        />
        <div className="flex-1 pt-0.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Bone className="h-3.5 w-3/4" speed={speed} delay={delay + 0.06} />
            <Bone
              className="h-3.5 w-3.5 rounded-full shrink-0"
              speed={speed}
              delay={delay + 0.07}
            />
          </div>
          <Bone className="h-3 w-1/2" speed={speed} delay={delay + 0.08} />
          <div className="flex items-center gap-1.5 flex-wrap">
            <Bone
              className="h-4 w-14 rounded-full"
              speed={speed}
              delay={delay + 0.1}
            />
            <Bone
              className="h-4 w-10 rounded"
              speed={speed}
              delay={delay + 0.11}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2.5 pt-3 flex-1 border-t border-[var(--color-active-border)]">
        <div className="flex items-center gap-2.5">
          <Bone
            className="w-6 h-6 rounded-lg shrink-0"
            speed={speed}
            delay={delay + 0.12}
          />
          <Bone className="h-3.5 w-2/3" speed={speed} delay={delay + 0.13} />
        </div>
        <div className="flex items-center gap-2.5">
          <Bone
            className="w-6 h-6 rounded-lg shrink-0"
            speed={speed}
            delay={delay + 0.14}
          />
          <Bone className="h-3.5 w-1/2" speed={speed} delay={delay + 0.15} />
        </div>
        <div className="flex items-start gap-2.5">
          <Bone
            className="w-6 h-6 rounded-lg shrink-0"
            speed={speed}
            delay={delay + 0.16}
          />
          <div className="space-y-1">
            <Bone className="h-3 w-20" speed={speed} delay={delay + 0.17} />
            <Bone className="h-3 w-16" speed={speed} delay={delay + 0.18} />
          </div>
        </div>
      </div>
      <Bone
        className="mt-4 h-10 w-full rounded-xl"
        speed={speed}
        delay={delay + 0.2}
      />
    </div>
  </motion.div>
);

const TeacherCardSkeleton = ({
  count = 6,
  speed = 1.6,
}: {
  count?: number;
  speed?: number;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <TeacherCardBone key={i} speed={speed} delay={i * 0.05} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   VARIANT ⑧  STUDENT-CARD
══════════════════════════════════════════════════ */
const StudentCardBone = ({
  speed,
  delay = 0,
}: {
  speed?: number;
  delay?: number;
}) => (
  <motion.div
    className="rounded-2xl overflow-hidden flex flex-col border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
  >
    <Bone className="h-1.5 w-full rounded-none" speed={speed} delay={delay} />
    <div className="p-4 flex flex-col flex-1">
      <div className="flex items-start gap-3 mb-4">
        <Bone
          className="rounded-xl shrink-0"
          speed={speed}
          delay={delay + 0.04}
          style={{ width: 52, height: 52 }}
        />
        <div className="flex-1 pt-0.5 space-y-1.5">
          <Bone className="h-3.5 w-3/4" speed={speed} delay={delay + 0.06} />
          <Bone className="h-3 w-1/2" speed={speed} delay={delay + 0.08} />
          <div className="flex items-center gap-1.5 flex-wrap">
            <Bone
              className="h-4 w-10 rounded"
              speed={speed}
              delay={delay + 0.09}
            />
            <Bone
              className="h-4 w-10 rounded-full"
              speed={speed}
              delay={delay + 0.1}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2.5 pt-3 flex-1 border-t border-[var(--color-active-border)]">
        <div className="flex items-center gap-2.5">
          <Bone
            className="w-6 h-6 rounded-lg shrink-0"
            speed={speed}
            delay={delay + 0.11}
          />
          <Bone className="h-3.5 w-1/2" speed={speed} delay={delay + 0.12} />
        </div>
        <div className="flex items-center gap-2.5">
          <Bone
            className="w-6 h-6 rounded-lg shrink-0"
            speed={speed}
            delay={delay + 0.13}
          />
          <Bone className="h-3.5 w-2/5" speed={speed} delay={delay + 0.14} />
        </div>
        <div className="flex items-start gap-2.5">
          <Bone
            className="w-6 h-6 rounded-lg shrink-0"
            speed={speed}
            delay={delay + 0.15}
          />
          <div className="space-y-1">
            <Bone className="h-3 w-20" speed={speed} delay={delay + 0.16} />
            <Bone className="h-3 w-16" speed={speed} delay={delay + 0.17} />
          </div>
        </div>
      </div>
      <Bone
        className="mt-4 h-10 w-full rounded-xl"
        speed={speed}
        delay={delay + 0.19}
      />
    </div>
  </motion.div>
);

const StudentCardSkeleton = ({
  count = 6,
  speed = 1.6,
}: {
  count?: number;
  speed?: number;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <StudentCardBone key={i} speed={speed} delay={i * 0.05} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   VARIANT ⑨  RECT
══════════════════════════════════════════════════ */
const RectSkeleton = ({
  width = "100%",
  height = "1rem",
  rounded = "4px",
  speed = 1.6,
}: {
  width?: string;
  height?: string;
  rounded?: string;
  speed?: number;
}) => <Bone style={{ width, height, borderRadius: rounded }} speed={speed} />;

/* ══════════════════════════════════════════════════
   VARIANT ⑩  PROFILE
   Profile.tsx-এর exact structure মিলিয়ে বানানো।

   Layout:
     • PageHeader (title + subtitle)  ← 2 bone lines
     • HeroCard (avatar + name/badge + edit btn)
     • WarningBar
     • SectionCard × 4 (Personal / Contact / Address / Education)
       প্রতিটা card = SectionHeader + N FieldRows
       FieldRow = icon square + label line + value line
══════════════════════════════════════════════════ */

// একটা field row (icon + label + value)
const ProfileFieldRow = ({
  speed = 1.6,
  delay = 0,
  wide = false,
}: {
  speed?: number;
  delay?: number;
  wide?: boolean;
}) => (
  <div
    className="flex items-start gap-3 py-3"
    style={{ borderBottom: "1px solid var(--color-active-border)" }}
  >
    {/* icon box */}
    <Bone
      className="w-7 h-7 rounded-lg shrink-0 mt-0.5"
      speed={speed}
      delay={delay}
    />
    <div className="flex-1 space-y-1.5">
      {/* label */}
      <Bone className="h-2.5 w-20" speed={speed} delay={delay + 0.04} />
      {/* value */}
      <Bone
        className={`h-5 ${wide ? "w-3/4" : "w-2/5"}`}
        speed={speed}
        delay={delay + 0.08}
      />
    </div>
  </div>
);

// Section card: header bar + N field rows
const ProfileSectionCard = ({
  speed = 1.6,
  delay = 0,
  rows = 3,
  wideRows,
}: {
  speed?: number;
  delay?: number;
  rows?: number;
  wideRows?: number[]; // which row indices are "wide value"
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="rounded-2xl overflow-hidden mb-3"
    style={{
      backgroundColor: "var(--color-bg)",
      border: "1px solid var(--color-active-border)",
    }}
  >
    {/* section header bar */}
    <div
      className="flex items-center gap-2.5 px-5 pt-5 pb-3"
      style={{ borderBottom: "1px solid var(--color-active-border)" }}
    >
      <Bone className="w-5 h-5 rounded" speed={speed} delay={delay} />
      <Bone className="h-4 w-28" speed={speed} delay={delay + 0.04} />
    </div>
    {/* field rows */}
    <div className="px-5 pb-2">
      {Array.from({ length: rows }).map((_, i) => (
        <ProfileFieldRow
          key={i}
          speed={speed}
          delay={delay + 0.06 + i * 0.05}
          wide={wideRows?.includes(i) ?? i === 0}
        />
      ))}
    </div>
  </motion.div>
);

const ProfileSkeleton = ({ speed = 1.6 }: { speed?: number }) => (
  <div
    className="w-full py-8 lg:py-10"
    aria-hidden="true"
    aria-label="Loading…"
  >
    {/* Page header */}
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 mt-10 lg:mt-0 space-y-2"
    >
      <Bone className="h-8 md:h-10 w-44 md:w-56" speed={speed} />
      <Bone className="h-5 md:h-6 w-56 md:w-72" speed={speed} delay={0.05} />
    </motion.div>

    {/* Hero card — avatar + name + role badges + edit button */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.04,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="rounded-2xl overflow-hidden mb-3 p-4 sm:p-5"
      style={{
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-active-border)",
      }}
    >
      <div className="flex items-center gap-4">
        {/* avatar circle */}
        <Bone
          className="w-16 h-16 md:w-32 md:h-32 rounded-full shrink-0"
          speed={speed}
        />

        {/* name + badges */}
        <div className="flex-1 min-w-0 space-y-2">
          <Bone
            className="h-6 md:h-7 w-40 md:w-56"
            speed={speed}
            delay={0.06}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Bone
              className="h-5 w-16 rounded-full"
              speed={speed}
              delay={0.09}
            />
            <Bone
              className="h-5 w-24 rounded-full"
              speed={speed}
              delay={0.11}
            />
          </div>
        </div>

        {/* edit button */}
        <Bone
          className="w-20 h-8 rounded-xl shrink-0"
          speed={speed}
          delay={0.08}
        />
      </div>

      {/* missing fields warning bar */}
      <div className="mt-3">
        <Bone className="h-8 w-full rounded-xl" speed={speed} delay={0.14} />
      </div>
    </motion.div>

    {/* Personal info — ৫টা field (নাম, বাবা, মা, DOB, ধর্ম) */}
    <ProfileSectionCard
      speed={speed}
      delay={0.08}
      rows={5}
      wideRows={[0, 1, 2]}
    />

    {/* Contact — ৩টা field */}
    <ProfileSectionCard speed={speed} delay={0.12} rows={3} wideRows={[0]} />

    {/* Present address — ৬টা field */}
    <ProfileSectionCard
      speed={speed}
      delay={0.16}
      rows={6}
      wideRows={[0, 2, 3]}
    />

    {/* Education — ৩টা field */}
    <ProfileSectionCard speed={speed} delay={0.2} rows={3} wideRows={[0, 1]} />
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN — exported Skeleton component
══════════════════════════════════════════════════ */
const Skeleton = ({
  variant = "rect",
  count = 1,
  width,
  height,
  className = "",
  speed = 1.6,
  rounded,
}: SkeletonProps) => {
  const items = useMemo(() => Array.from({ length: count }), [count]);

  const renderOne = (key: number) => {
    switch (variant) {
      case "hero":
        return <HeroSkeleton key={key} speed={speed} />;
      case "card":
        return <CardSkeleton key={key} speed={speed} />;
      case "card-image":
        return <CardImageSkeleton key={key} speed={speed} />;
      case "daily-lesson":
        return <DailyLessonSkeleton key={key} speed={speed} />;
      case "teacher-card":
        return <TeacherCardSkeleton key={key} count={count} speed={speed} />;
      case "student-card":
        return <StudentCardSkeleton key={key} count={count} speed={speed} />;
      case "profile":
        return <ProfileSkeleton key={key} speed={speed} />;

      case "notice":
        return (
          <NoticeSkeleton
            key={key}
            rows={count > 1 ? count : 5}
            speed={speed}
          />
        );

      case "picture":
        return (
          <PictureSkeleton
            key={key}
            count={count}
            height={height}
            speed={speed}
          />
        );

      case "rect":
      default:
        return (
          <RectSkeleton
            key={key}
            width={width}
            height={height}
            rounded={rounded}
            speed={speed}
          />
        );
    }
  };

  // single-render variants (manage count internally)
  if (
    variant === "notice" ||
    variant === "picture" ||
    variant === "daily-lesson" ||
    variant === "teacher-card" ||
    variant === "student-card" ||
    variant === "profile"
  ) {
    return (
      <div className={className} aria-hidden="true" aria-label="Loading…">
        {renderOne(0)}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-4 ${className}`}
      aria-hidden="true"
      aria-label="Loading…"
    >
      {items.map((_, i) => renderOne(i))}
    </div>
  );
};

export default Skeleton;
