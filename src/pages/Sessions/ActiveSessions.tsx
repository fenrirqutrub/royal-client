// src/pages/Admin/Sessions/ActiveSessions.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  MapPin,
  Clock,
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Battery,
  Signal,
} from "lucide-react";
import {
  useSessions,
  type SessionEntry,
  type SessionSummaryEntry,
} from "../../hooks/useSessions";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  student: "ছাত্র",
  teacher: "শিক্ষক",
  admin: "অ্যাডমিন",
  principal: "প্রিন্সিপাল",
  owner: "মালিক",
};

const ROLE_COLORS: Record<string, string> = {
  student: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  teacher: "bg-green-500/10 text-green-400 border-green-500/20",
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  principal: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  owner: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}সে`;
  if (diff < 3600) return `${Math.floor(diff / 60)}মি`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ঘ`;
  return `${Math.floor(diff / 86400)}দিন`;
}

function formatDuration(mins: number): string {
  if (!mins || mins < 1) return "<১মি";
  if (mins < 60) return `${mins}মি`;
  return `${Math.floor(mins / 60)}ঘ ${mins % 60}মি`;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function DeviceIcon({ type }: { type: string | null }) {
  const cls = "w-4 h-4";
  if (type === "mobile") return <Smartphone className={cls} />;
  if (type === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 border border-[var(--color-active-border)] bg-[var(--color-active-bg)]"
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${accent}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)] bangla">
        {value}
      </p>
      <p className="text-xs text-[var(--color-gray)] mt-0.5 bangla">{label}</p>
    </motion.div>
  );
}

// ─── Session Row ──────────────────────────────────────────────────────────────

function SessionRow({ s, index }: { s: SessionEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const roleColor =
    ROLE_COLORS[s.role ?? ""] ??
    "bg-gray-500/10 text-gray-400 border-gray-500/20";
  const roleLabel = ROLE_LABELS[s.role ?? ""] ?? s.role ?? "—";
  const location = s.location?.city
    ? `${s.location.city}${s.location.country ? ", " + s.location.country : ""}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-bg)] overflow-hidden"
    >
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--color-active-bg)] transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-[var(--color-active-bg)] border border-[var(--color-active-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text)] flex-shrink-0">
          {getInitials(s.name)}
        </div>

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate bangla">
            {s.name ?? "—"}
          </p>
          <p className="text-xs text-[var(--color-gray)] truncate">
            {s.slug ?? ""}
          </p>
        </div>

        {/* Online dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {s.isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium bangla hidden sm:block">
                অনলাইন
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--color-gray)]" />
              <span className="text-xs text-[var(--color-gray)] bangla hidden sm:block">
                অফলাইন
              </span>
            </>
          )}
        </div>

        {/* Role badge */}
        <span
          className={`text-xs px-2 py-0.5 rounded-lg border font-medium bangla flex-shrink-0 ${roleColor}`}
        >
          {roleLabel}
        </span>

        {/* Device */}
        <div className="text-[var(--color-gray)] flex-shrink-0 hidden md:flex items-center gap-1 text-xs">
          <DeviceIcon type={s.device?.type} />
          <span className="hidden lg:block">{s.browser?.name ?? ""}</span>
        </div>

        {/* Duration */}
        <div className="text-xs text-[var(--color-gray)] flex-shrink-0 text-right hidden sm:block bangla">
          <div>{timeAgo(s.lastActiveAt)} আগে</div>
          <div>{formatDuration(s.durationMinutes)}</div>
        </div>

        {/* Expand chevron */}
        <div className="text-[var(--color-gray)] flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-[var(--color-active-border)] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {location && (
                <Detail icon={MapPin} label="অবস্থান" value={location} />
              )}
              <Detail
                icon={Monitor}
                label="ডিভাইস"
                value={`${s.device?.type ?? "desktop"} — ${s.os?.name ?? "?"}`}
              />
              <Detail
                icon={Signal}
                label="নেটওয়ার্ক"
                value={s.network?.effectiveType ?? "—"}
              />
              {s.battery?.level != null && (
                <Detail
                  icon={Battery}
                  label="ব্যাটারি"
                  value={`${Math.round(s.battery.level * 100)}% ${s.battery.charging ? "⚡" : ""}`}
                />
              )}
              <Detail
                icon={Clock}
                label="লগইন"
                value={new Date(s.loginAt).toLocaleString("bn-BD")}
              />
              <Detail
                icon={Clock}
                label="সক্রিয় সময়"
                value={formatDuration(s.activeMinutes)}
              />
              {s.ip && <Detail icon={Wifi} label="IP" value={s.ip} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-[var(--color-gray)] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-[var(--color-gray)] bangla">{label}</p>
        <p className="text-xs font-medium text-[var(--color-text)] bangla break-all">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryRow({ s, index }: { s: SessionSummaryEntry; index: number }) {
  const roleColor =
    ROLE_COLORS[s.role ?? ""] ??
    "bg-gray-500/10 text-gray-400 border-gray-500/20";
  const roleLabel = ROLE_LABELS[s.role ?? ""] ?? s.role ?? "—";
  const location = s.lastLocation?.city
    ? `${s.lastLocation.city}${s.lastLocation.country ? ", " + s.lastLocation.country : ""}`
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-bg)]"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--color-active-bg)] border border-[var(--color-active-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text)] flex-shrink-0">
        {getInitials(s.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate bangla">
          {s.name ?? "—"}
        </p>
        <p className="text-xs text-[var(--color-gray)] truncate">
          {s.slug ?? ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {s.isOnline ? (
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-[var(--color-gray)]" />
        )}
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-lg border font-medium bangla flex-shrink-0 ${roleColor}`}
      >
        {roleLabel}
      </span>
      <div className="text-xs text-[var(--color-gray)] flex-shrink-0 text-right hidden sm:block bangla">
        <div>মোট লগইন: {s.totalLogins}</div>
        <div>সক্রিয়: {s.totalActiveMinutes}মি</div>
      </div>
      <div className="text-xs text-[var(--color-gray)] hidden md:block bangla flex-shrink-0">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {location}
        </div>
        <div>{timeAgo(s.lastActiveAt)} আগে</div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = "live" | "summary";
type FilterRole = "" | "student" | "teacher" | "admin" | "principal" | "owner";
type FilterStatus = "all" | "online" | "offline";

const ActiveSessions = () => {
  const [tab, setTab] = useState<TabType>("live");
  const [filterRole, setFilterRole] = useState<FilterRole>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const { sessions, summary, stats, loading, error, refresh, lastRefreshed } =
    useSessions({ autoRefreshMs: 30_000 });

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterRole && s.role !== filterRole) return false;
      if (filterStatus === "online" && !s.isOnline) return false;
      if (filterStatus === "offline" && s.isOnline) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          s.ip?.includes(q) ||
          false
        );
      }
      return true;
    });
  }, [sessions, filterRole, filterStatus, search]);

  const filteredSummary = useMemo(() => {
    return summary.filter((s) => {
      if (filterRole && s.role !== filterRole) return false;
      if (filterStatus === "online" && !s.isOnline) return false;
      if (filterStatus === "offline" && s.isOnline) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          false
        );
      }
      return true;
    });
  }, [summary, filterRole, filterStatus, search]);

  const tabBtnCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-xl transition-all bangla ${
      active
        ? "bg-[var(--color-text)] text-[var(--color-bg)]"
        : "text-[var(--color-gray)] hover:text-[var(--color-text)]"
    }`;

  const filterBtnCls = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-lg border transition-all bangla ${
      active
        ? "border-[var(--color-text)] text-[var(--color-text)] bg-[var(--color-active-bg)]"
        : "border-[var(--color-active-border)] text-[var(--color-gray)] hover:border-[var(--color-text)]/40"
    }`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] bangla">
              সেশন মনিটর
            </h1>
            <p className="text-sm text-[var(--color-gray)] mt-0.5 bangla">
              {lastRefreshed
                ? `শেষ আপডেট: ${lastRefreshed.toLocaleTimeString("bn-BD")}`
                : "লোড হচ্ছে..."}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bangla border border-[var(--color-active-border)] text-[var(--color-gray)] hover:text-[var(--color-text)] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="এখন অনলাইন"
            value={stats.totalOnline}
            icon={Wifi}
            accent="bg-green-500/10 text-green-400"
          />
          <StatCard
            label="আজকের লগইন"
            value={stats.todayLogins}
            icon={Users}
            accent="bg-blue-500/10 text-blue-400"
          />
          <StatCard
            label="ছাত্র অনলাইন"
            value={stats.studentsOnline}
            icon={GraduationCap}
            accent="bg-purple-500/10 text-purple-400"
          />
          <StatCard
            label="স্টাফ অনলাইন"
            value={stats.staffOnline}
            icon={ShieldCheck}
            accent="bg-amber-500/10 text-amber-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--color-active-bg)] border border-[var(--color-active-border)] w-fit">
          <button
            className={tabBtnCls(tab === "live")}
            onClick={() => setTab("live")}
          >
            লাইভ সেশন
          </button>
          <button
            className={tabBtnCls(tab === "summary")}
            onClick={() => setTab("summary")}
          >
            ইউজার সারসংক্ষেপ
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা স্লাগ খুঁজুন..."
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-active-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-gray)] outline-none focus:border-[var(--color-text)]/50 bangla w-44"
          />
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "online", "offline"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                className={filterBtnCls(filterStatus === s)}
                onClick={() => setFilterStatus(s)}
              >
                {s === "all" ? "সব" : s === "online" ? "অনলাইন" : "অফলাইন"}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(
              [
                "",
                "student",
                "teacher",
                "admin",
                "principal",
                "owner",
              ] as FilterRole[]
            ).map((r) => (
              <button
                key={r}
                className={filterBtnCls(filterRole === r)}
                onClick={() => setFilterRole(r)}
              >
                {r === "" ? "সব রোল" : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm bangla flex items-center gap-2">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Content */}
        {loading && !sessions.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-6 h-6 text-[var(--color-gray)] animate-spin" />
            <p className="text-sm text-[var(--color-gray)] bangla">
              লোড হচ্ছে...
            </p>
          </div>
        ) : tab === "live" ? (
          <AnimatePresence mode="popLayout">
            {filteredSessions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-2"
              >
                <BookOpen className="w-8 h-8 text-[var(--color-gray)]" />
                <p className="text-sm text-[var(--color-gray)] bangla">
                  কোনো সেশন নেই
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((s, i) => (
                  <SessionRow key={s._id} s={s} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSummary.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-2"
              >
                <Users className="w-8 h-8 text-[var(--color-gray)]" />
                <p className="text-sm text-[var(--color-gray)] bangla">
                  কোনো ডেটা নেই
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {filteredSummary.map((s, i) => (
                  <SummaryRow key={String(s._id)} s={s} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Count */}
        {!loading && (
          <p className="text-xs text-[var(--color-gray)] text-center bangla pb-4">
            {tab === "live"
              ? `${filteredSessions.length}টি সেশন দেখাচ্ছে`
              : `${filteredSummary.length}জন ইউজার`}
            {" · "}প্রতি ৩০ সেকেন্ডে অটো-রিফ্রেশ
          </p>
        )}
      </div>
    </div>
  );
};

export default ActiveSessions;
