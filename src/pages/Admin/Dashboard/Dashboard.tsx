import { motion } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Camera,
  Quote,
  Star,
  BookOpen,
  Users,
  Activity,
  ArrowUpRight,
  Layers,
  PieChart as PieIcon,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import axiosPublic from "../../../hooks/axiosPublic";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/common/Loader";

/* ─── helpers ─────────────────────────────────────────────────────────── */
const safe = (d: unknown) => (Array.isArray(d) ? d : []);

/* ─── types ───────────────────────────────────────────────────────────── */
interface Card {
  key: string;
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  textAccent: string;
  trend?: string;
}

/* ─── role → allowed card keys ───────────────────────────────────────── */
const ROLE_KEYS: Record<string, string[]> = {
  teacher: ["exams"],
  principal: ["exams", "teachers", "heroes", "quotes", "photos"],
  admin: ["exams", "photos", "quotes", "heroes", "teachers"],
  owner: ["exams", "photos", "quotes", "heroes", "teachers"],
  student: [], // student এর কোনো stat card নেই
};

/* ─── role config ─────────────────────────────────────────────────────── */
const ROLE_CONFIG: Record<string, { title: string; from: string; to: string }> =
  {
    teacher: {
      title: "Teacher Panel",
      from: "from-sky-600",
      to: "to-blue-700",
    },
    principal: {
      title: "Principal Panel",
      from: "from-violet-600",
      to: "to-purple-700",
    },
    admin: {
      title: "Admin Panel",
      from: "from-emerald-600",
      to: "to-teal-700",
    },
    owner: {
      title: "Owner Panel",
      from: "from-amber-500",
      to: "to-orange-600",
    },
    student: {
      title: "Student Portal",
      from: "from-green-500",
      to: "to-emerald-600",
    },
  };

/* ─── pie colors ──────────────────────────────────────────────────────── */
const PIE_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f43f5e"];

interface PieSlice {
  path: string;
  percentage: number;
  color: string;
  labelX: number;
  labelY: number;
  name: string;
}

/* ─── Donut Pie Chart ─────────────────────────────────────────────────── */
const DashPieChart = ({
  data,
}: {
  data: { name: string; value: number }[];
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const size = windowWidth < 376 ? 220 : 280;
  const radius = size / 3;
  const cx = size / 2,
    cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0)
    return (
      <p className="text-center text-gray-400 text-sm py-8">No data yet</p>
    );

  let startAngle = -Math.PI / 2;
  const slices: PieSlice[] = data.map((item, i) => {
    const pct = (item.value / total) * 100;
    const angle = (pct / 100) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const mid = startAngle + angle / 2;
    const lr = radius * 0.68;
    const slice: PieSlice = {
      path: `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${angle > Math.PI ? 1 : 0},1 ${x2},${y2} Z`,
      percentage: pct,
      color: PIE_COLORS[i % PIE_COLORS.length],
      labelX: cx + lr * Math.cos(mid),
      labelY: cy + lr * Math.sin(mid),
      name: item.name,
    };
    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        className="overflow-visible drop-shadow-lg"
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            stroke="white"
            strokeWidth="1.5"
            className="dark:stroke-[#161b22] transition-opacity duration-200 hover:opacity-75"
          />
        ))}
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.42}
          fill="white"
          className="dark:fill-[#161b22]"
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="currentColor"
          fontSize={10}
          fontWeight={500}
          opacity={0.5}
        >
          Total
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="currentColor"
          fontSize={20}
          fontWeight={800}
        >
          {total}
        </text>
        {slices.map((s, i) =>
          s.percentage >= 8 ? (
            <text
              key={`lbl-${i}`}
              x={s.labelX}
              y={s.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={windowWidth < 376 ? 9 : 11}
              fontWeight={700}
            >
              {`${s.percentage.toFixed(1)}%`}
            </text>
          ) : null,
        )}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {slices.map((s, i) => (
          <div key={`leg-${i}`} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Student Dashboard ───────────────────────────────────────────────── */
const StudentDashboard = ({ name }: { name: string }) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "শুভ সকাল" : hour < 17 ? "শুভ বিকাল" : "শুভ সন্ধ্যা";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 mt-10 lg:mt-0"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1 bangla">
            {greeting}
          </p>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight bangla">
            {name}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm bangla">
            Student Portal — স্বাগতম!
          </p>
        </motion.div>

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 mb-6 shadow-xl"
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-6 w-52 h-52 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-1 bangla">
              আপনার অ্যাকাউন্ট
            </p>
            <p className="text-2xl font-black text-white bangla">
              প্রোফাইল দেখুন ও সম্পাদনা করুন
            </p>
            <p className="text-white/60 text-sm mt-1 bangla">
              আপনার তথ্য আপডেট রাখুন
            </p>
          </div>
        </motion.div>

        {/* Profile card CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            to="/dashboard/profile"
            className="flex items-center justify-between bg-white dark:bg-[#161b22]
              border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-md
              hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <UserCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white bangla">
                  আমার প্রোফাইল
                </p>
                <p className="text-sm text-gray-400 bangla">
                  তথ্য দেখুন ও পরিবর্তন করুন
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const role: string = user?.role ?? "teacher";
  const allowedKeys = ROLE_KEYS[role] ?? [];
  const roleConf = ROLE_CONFIG[role] ?? ROLE_CONFIG.teacher;

  // Student হলে আলাদা সহজ dashboard দেখাও
  if (role === "student") {
    return <StudentDashboard name={user?.name ?? "Student"} />;
  }

  /* ── parallel queries ── */
  const results = useQueries({
    queries: [
      {
        queryKey: ["dash-photography"],
        queryFn: async () => {
          const { data } = await axiosPublic.get("/api/photography");
          return data;
        },
        enabled: allowedKeys.includes("photos"),
      },
      {
        queryKey: ["dash-quotes"],
        queryFn: async () => {
          const { data } = await axiosPublic.get("/api/quotes");
          return data;
        },
        enabled: allowedKeys.includes("quotes"),
      },
      {
        queryKey: ["dash-heroes"],
        queryFn: async () => {
          const { data } = await axiosPublic.get("/api/heroes");
          return data;
        },
        enabled: allowedKeys.includes("heroes"),
      },
      {
        queryKey: [
          "dash-exams",
          role === "admin" || role === "owner" ? "all" : user?.slug,
        ],
        queryFn: async () => {
          const url =
            role === "admin" || role === "owner"
              ? "/api/weekly-exams"
              : `/api/weekly-exams?teacherSlug=${user?.slug ?? ""}`;
          const { data } = await axiosPublic.get(url);
          return data;
        },
        enabled: allowedKeys.includes("exams"),
      },
      {
        queryKey: ["dash-teachers"],
        queryFn: async () => {
          const { data } = await axiosPublic.get("/api/teachers");
          return data;
        },
        enabled: allowedKeys.includes("teachers"),
      },
    ],
  });

  const isLoading = results.some(
    (r) => r.isLoading && r.fetchStatus !== "idle",
  );

  const getCount = (res: (typeof results)[0]) => {
    if (!res.data) return 0;
    const payload = res.data?.data ?? res.data;
    return safe(payload).length;
  };

  const [photoCount, quoteCount, heroCount, examCount, teacherCount] =
    results.map(getCount);

  const ALL_CARDS: Card[] = [
    {
      key: "exams",
      label: "Weekly Exams",
      value: examCount,
      icon: BookOpen,
      accent: "bg-emerald-500/15 border-emerald-500/30",
      glow: "hover:shadow-emerald-500/20",
      textAccent: "text-emerald-500 dark:text-emerald-400",
      trend: "Exams published",
    },
    {
      key: "teachers",
      label: "Teachers",
      value: teacherCount,
      icon: Users,
      accent: "bg-sky-500/15 border-sky-500/30",
      glow: "hover:shadow-sky-500/20",
      textAccent: "text-sky-500 dark:text-sky-400",
      trend: "Staff profiles",
    },
    {
      key: "heroes",
      label: "Heroes",
      value: heroCount,
      icon: Star,
      accent: "bg-violet-500/15 border-violet-500/30",
      glow: "hover:shadow-violet-500/20",
      textAccent: "text-violet-500 dark:text-violet-400",
      trend: "Hero banners",
    },
    {
      key: "quotes",
      label: "Quotes",
      value: quoteCount,
      icon: Quote,
      accent: "bg-amber-500/15 border-amber-500/30",
      glow: "hover:shadow-amber-500/20",
      textAccent: "text-amber-500 dark:text-amber-400",
      trend: "Inspirational quotes",
    },
    {
      key: "photos",
      label: "Photography",
      value: photoCount,
      icon: Camera,
      accent: "bg-rose-500/15 border-rose-500/30",
      glow: "hover:shadow-rose-500/20",
      textAccent: "text-rose-500 dark:text-rose-400",
      trend: "Photos uploaded",
    },
  ];

  const cards = ALL_CARDS.filter((c) => allowedKeys.includes(c.key));
  const total = cards.reduce((s, c) => s + c.value, 0);
  const maxVal = Math.max(...cards.map((c) => c.value), 1);
  const isSingleCard = cards.length === 1;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 mt-10 lg:mt-0"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1">
            {greeting}
          </p>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {user?.name ?? "Dashboard"}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            {roleConf.title} — here's your content snapshot.
          </p>
        </motion.div>

        {isLoading ? (
          <Loader />
        ) : (
          <>
            {/* Total banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${roleConf.from} ${roleConf.to} p-6 mb-8 shadow-xl`}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-10 -left-6 w-52 h-52 rounded-full bg-white/5" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                    Total Content
                  </p>
                  <p className="text-6xl font-black text-white leading-none">
                    {total}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    across {cards.length}{" "}
                    {cards.length === 1 ? "section" : "sections"}
                  </p>
                </div>
                <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <Layers className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Stat cards */}
            <div
              className={`grid gap-4 mb-8 ${
                isSingleCard
                  ? "grid-cols-1 max-w-xs"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`group relative bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl ${card.glow} transition-all duration-300 cursor-default`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl border ${card.accent}`}>
                        <Icon className={`w-5 h-5 ${card.textAccent}`} />
                      </div>
                      <ArrowUpRight
                        className={`w-4 h-4 ${card.textAccent} opacity-0 group-hover:opacity-100 transition-opacity`}
                      />
                    </div>
                    <p
                      className={`text-4xl font-black ${card.textAccent} mb-1`}
                    >
                      {card.value}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {card.label}
                    </p>
                    {card.trend && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {card.trend}
                      </p>
                    )}
                    <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round((card.value / maxVal) * 100)}%`,
                        }}
                        transition={{
                          delay: 0.4 + i * 0.08,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className={`h-full rounded-full ${card.textAccent.replace("text-", "bg-")}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts — hidden for single-card roles */}
            {!isSingleCard && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Content Distribution
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {cards.map((card, i) => {
                      const Icon = card.icon;
                      const pct = Math.round((card.value / maxVal) * 100);
                      return (
                        <motion.div
                          key={card.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.07 }}
                          className="flex items-center gap-4"
                        >
                          <div className="flex items-center gap-2 w-36 shrink-0">
                            <Icon
                              className={`w-4 h-4 ${card.textAccent} shrink-0`}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {card.label}
                            </span>
                          </div>
                          <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                delay: 0.9 + i * 0.07,
                                duration: 0.7,
                                ease: "easeOut",
                              }}
                              className={`h-full rounded-full ${card.textAccent.replace("text-", "bg-")}`}
                            />
                          </div>
                          <span
                            className={`text-sm font-bold ${card.textAccent} w-8 text-right shrink-0`}
                          >
                            {card.value}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <PieIcon className="w-5 h-5 text-violet-500" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Content Breakdown
                    </h3>
                  </div>
                  <DashPieChart
                    data={cards.map((c) => ({ name: c.label, value: c.value }))}
                  />
                </motion.div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
