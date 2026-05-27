// src/pages/Admin/Sessions/ActiveNow.tsx
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Smartphone, Tablet, RefreshCw, Users } from "lucide-react";
import { useSessions, type SessionEntry } from "../../hooks/useSessions";

// ─── Constants ─────────────────────────────────

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

const ACTIVE_WINDOW_MS = 2 * 60 * 1000; // 2 মিনিটের মধ্যে active থাকলে active now

// ─── Helpers ─────────────────────────────────

function getInitials(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function onlineDuration(loginAt: string): string {
  const diff = Math.floor((Date.now() - new Date(loginAt).getTime()) / 1000);
  if (diff < 60) return `${diff}সে`;
  if (diff < 3600) return `${Math.floor(diff / 60)}মি`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return m > 0 ? `${h}ঘ ${m}মি` : `${h}ঘ`;
}

function lastSeenText(lastActiveAt: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(lastActiveAt).getTime()) / 1000,
  );

  if (diff < 5) return "এখনই";
  if (diff < 60) return `${diff}সে আগে`;
  if (diff < 3600) return `${Math.floor(diff / 60)}মি আগে`;

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return m > 0 ? `${h}ঘ ${m}মি আগে` : `${h}ঘ আগে`;
}

function isActiveNow(s: SessionEntry): boolean {
  const lastSeen = new Date(s.lastActiveAt || s.loginAt).getTime();
  if (!lastSeen) return false;

  return s.isOnline && Date.now() - lastSeen <= ACTIVE_WINDOW_MS;
}

function DeviceIcon({ type }: { type: string | null }) {
  const cls = "w-4 h-4";
  if (type === "mobile") return <Smartphone className={cls} />;
  if (type === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

// ─── User Card ───────────────────────────────

function UserCard({ s, index }: { s: SessionEntry; index: number }) {
  const roleColor =
    ROLE_COLORS[s.role ?? ""] ??
    "bg-gray-500/10 text-gray-400 border-gray-500/20";
  const roleLabel = ROLE_LABELS[s.role ?? ""] ?? s.role ?? "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-bg)]"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--color-active-bg)] border border-[var(--color-active-border)] flex items-center justify-center text-sm font-bold text-[var(--color-text)] flex-shrink-0">
        {getInitials(s.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate bangla">
          {s.name ?? "—"}
        </p>
        <p className="text-xs text-[var(--color-gray)] truncate">
          {s.slug ?? ""}
        </p>
        <p className="text-xs text-[var(--color-gray)] bangla">
          অনলাইনে: {onlineDuration(s.loginAt)}
        </p>
      </div>

      <span
        className={`text-xs px-2 py-0.5 rounded-lg border font-medium bangla flex-shrink-0 ${roleColor}`}
      >
        {roleLabel}
      </span>

      <div className="text-[var(--color-gray)] flex-shrink-0">
        <DeviceIcon type={s.device?.type ?? null} />
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-green-400 bangla">
          {lastSeenText(s.lastActiveAt)}
        </p>
        <p className="text-xs text-[var(--color-gray)] bangla">শেষ সক্রিয়</p>
      </div>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────

const ActiveNow = () => {
  const { sessions, loading, refresh } = useSessions({
    autoRefreshMs: 10_000,
    onlineOnly: true,
    limit: 500,
  });

  const onlineUsers = useMemo(
    () =>
      sessions
        .filter(isActiveNow)
        .sort(
          (a, b) =>
            new Date(b.lastActiveAt).getTime() -
            new Date(a.lastActiveAt).getTime(),
        ),
    [sessions],
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <h1 className="text-lg font-bold text-[var(--color-text)] bangla">
              এখন অ্যাক্টিভ
            </h1>
            {!loading && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 font-medium bangla">
                {onlineUsers.length} জন
              </span>
            )}
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bangla border border-[var(--color-active-border)] text-[var(--color-gray)] hover:text-[var(--color-text)] transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            রিফ্রেশ
          </button>
        </div>

        {loading && !sessions.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-5 h-5 text-[var(--color-gray)] animate-spin" />
            <p className="text-sm text-[var(--color-gray)] bangla">
              লোড হচ্ছে...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {onlineUsers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 gap-2"
              >
                <Users className="w-8 h-8 text-[var(--color-gray)]" />
                <p className="text-sm text-[var(--color-gray)] bangla">
                  কেউ এখন অ্যাক্টিভ নেই
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {onlineUsers.map((s, i) => (
                  <UserCard key={s._id} s={s} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {!loading && onlineUsers.length > 0 && (
          <p className="text-xs text-[var(--color-gray)] text-center bangla pb-4">
            প্রতি ১০ সেকেন্ডে অটো-রিফ্রেশ
          </p>
        )}
      </div>
    </div>
  );
};

export default ActiveNow;
