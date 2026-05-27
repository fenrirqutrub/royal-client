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

// ─── Helpers ─────────────────────────────────

function getInitials(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function activeDuration(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 5) return "এখনই";
  if (diff < 60) return `${diff}সে`;
  if (diff < 3600) return `${Math.floor(diff / 60)}মি`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return m > 0 ? `${h}ঘ ${m}মি` : `${h}ঘ`;
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
      className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--color-active-border)] bg-[var(--color-bg)] shadow-sm"
    >
      {/* Avatar + active pulse */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-[var(--color-active-bg)] border border-[var(--color-active-border)] flex items-center justify-center text-sm font-bold text-[var(--color-text)]">
          {s.avatar?.url ? (
            <img
              src={s.avatar.url}
              alt={s.name ?? "avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(s.name)
          )}
        </div>

        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-[var(--color-bg)]" />
        </span>
      </div>

      {/* Name / slug / device */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate bangla">
          {s.name ?? "—"}
        </p>
        <p className="text-xs text-[var(--color-gray)] truncate">
          {s.slug ?? ""}
        </p>

        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--color-gray)]">
          <DeviceIcon type={s.device?.type ?? null} />
          <span>{s.browser?.name ?? "Unknown browser"}</span>
          {s.location?.city ? <span>• {s.location.city}</span> : null}
        </div>
      </div>

      {/* Role */}
      <span
        className={`text-xs px-2 py-0.5 rounded-lg border font-medium bangla flex-shrink-0 ${roleColor}`}
      >
        {roleLabel}
      </span>

      {/* Active duration */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-green-400 bangla">
          {activeDuration(s.lastActiveAt || s.loginAt)}
        </p>
        <p className="text-xs text-[var(--color-gray)] bangla">অ্যাক্টিভ</p>
      </div>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────

const ActiveNow = () => {
  const { sessions, loading, refresh } = useSessions({
    onlineOnly: true,
    autoRefreshMs: 10000,
    limit: 500,
  });

  const activeUsers = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.lastActiveAt || b.loginAt).getTime() -
          new Date(a.lastActiveAt || a.loginAt).getTime(),
      ),
    [sessions],
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <h1 className="text-lg font-bold text-[var(--color-text)] bangla">
              এখন অ্যাক্টিভ
            </h1>
            {!loading && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 font-medium bangla">
                {activeUsers.length} জন
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

        {/* List */}
        {loading && !sessions.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-5 h-5 text-[var(--color-gray)] animate-spin" />
            <p className="text-sm text-[var(--color-gray)] bangla">
              লোড হচ্ছে...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeUsers.length === 0 ? (
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
                {activeUsers.map((s, i) => (
                  <UserCard key={s._id} s={s} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Footer */}
        {!loading && activeUsers.length > 0 && (
          <p className="text-xs text-[var(--color-gray)] text-center bangla pb-4">
            প্রতি ১০ সেকেন্ডে অটো-রিফ্রেশ
          </p>
        )}
      </div>
    </div>
  );
};

export default ActiveNow;
