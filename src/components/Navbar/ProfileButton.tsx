import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogIn,
  LogOut,
  BookOpen,
  ClipboardList,
  User,
  ChevronDown,
  Camera,
  Check,
  X,
  Pencil,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { AUTH_KEY, getAuthToken } from "../../pages/Admin/Auth/AdminLogin";
import axiosPublic from "../../hooks/axiosPublic";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ProfileButtonProps {
  onLogout?: () => void;
  size?: number;
}

interface TeacherProfile {
  nickname: string;
  avatarUrl: string | null;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const POPUP_VARIANTS = {
  hidden: { opacity: 0, scale: 0.92, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: -8 },
} as const;

const POPUP_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.6,
} as const;

const MENU_ITEMS = [
  {
    key: "add-exam",
    label: "Add Weekly Exam",
    icon: ClipboardList,
    path: "/admin/add-exam",
  },
  {
    key: "add-lesson",
    label: "Add Daily Lesson",
    icon: BookOpen,
    path: "/admin/add-lesson",
  },
] as const;

const PROFILE_STORAGE_KEY = "teacher_profile";

function loadProfile(): TeacherProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return { nickname: "Teacher", avatarUrl: null };
}

function saveProfile(profile: TeacherProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

/* ─── Avatar component ───────────────────────────────────────────────────── */
interface AvatarProps {
  size: number;
  avatarUrl: string | null;
  editable?: boolean;
  onImageSelect?: (file: File) => void;
  uploading?: boolean;
}

const Avatar = memo<AvatarProps>(
  ({ size, avatarUrl, editable = false, onImageSelect, uploading = false }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [hover, setHover] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onImageSelect) onImageSelect(file);
      e.target.value = "";
    };

    return (
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden"
        style={{ width: size, height: size }}
        onMouseEnter={() => editable && setHover(true)}
        onMouseLeave={() => editable && setHover(false)}
      >
        {/* Base circle */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: avatarUrl
              ? "transparent"
              : "linear-gradient(135deg, var(--color-active-border), var(--color-active-text))",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <User
              style={{
                width: size * 0.52,
                height: size * 0.52,
                color: "var(--color-bg)",
              }}
            />
          )}
        </div>

        {/* Camera overlay on hover */}
        {editable && (
          <>
            <AnimatePresence>
              {(hover || uploading) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: "rgba(0,0,0,0.52)" }}
                  onClick={() => !uploading && fileRef.current?.click()}
                >
                  {uploading ? (
                    <motion.div
                      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                        ease: "linear",
                      }}
                    />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

/* ─── NicknameRow ────────────────────────────────────────────────────────── */
interface NicknameRowProps {
  nickname: string;
  onSave: (name: string) => void;
}

const NicknameRow = memo<NicknameRowProps>(({ nickname, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(nickname);
  }, [nickname]);

  const startEdit = () => {
    setDraft(nickname);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancel = () => {
    setDraft(nickname);
    setEditing(false);
  };

  const confirm = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") confirm();
    if (e.key === "Escape") cancel();
  };

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {editing ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            maxLength={24}
            className="text-sm font-semibold leading-tight bg-transparent border-b outline-none flex-1 min-w-0"
            style={{
              color: "var(--color-text)",
              borderColor: "var(--color-active-text)",
              width: "100%",
            }}
          />
          <motion.button
            onClick={confirm}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-0.5 rounded outline-none cursor-pointer"
            style={{ color: "var(--color-active-text)" }}
            aria-label="Save nickname"
          >
            <Check className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            onClick={cancel}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-0.5 rounded outline-none cursor-pointer"
            style={{ color: "var(--color-gray)" }}
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </>
      ) : (
        <>
          <p
            className="text-sm font-semibold leading-tight truncate"
            style={{ color: "var(--color-text)" }}
          >
            {nickname}
          </p>
          <motion.button
            onClick={startEdit}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-0.5 rounded outline-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--color-gray)" }}
            aria-label="Edit nickname"
          >
            <Pencil className="w-3 h-3" />
          </motion.button>
        </>
      )}
    </div>
  );
});
NicknameRow.displayName = "NicknameRow";

/* ─── ProfileButton ──────────────────────────────────────────────────────── */
const ProfileButton = memo<ProfileButtonProps>(({ onLogout, size = 35 }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAuthToken());
  const [popupOpen, setPopupOpen] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>(loadProfile);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ── Fetch profile from server ─────────────────────────────────────── */
  const { data: serverProfile } = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: async () => {
      const res = await axiosPublic.get("/api/teacher/profile");
      return res.data as TeacherProfile;
    },
    staleTime: 5 * 60 * 1000,
    enabled: isLoggedIn,
  });

  // Sync server profile → local state + localStorage
  useEffect(() => {
    if (serverProfile) {
      const updated: TeacherProfile = {
        nickname: serverProfile.nickname ?? "Teacher",
        avatarUrl: serverProfile.avatarUrl ?? null,
      };
      saveProfile(updated);
      setProfile(updated);
    }
  }, [serverProfile]);

  /* ── Avatar upload mutation ────────────────────────────────────────── */
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosPublic.post(
        "/api/teacher/upload-avatar",
        formData,
      );
      return res.data as { url: string; public_id: string };
    },
    onSuccess: (data) => {
      const updated: TeacherProfile = { ...loadProfile(), avatarUrl: data.url };
      saveProfile(updated);
      setProfile(updated);
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
    },
    onError: (err, file) => {
      console.error("Avatar upload failed:", err);
      // fallback: show base64 locally
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        const updated: TeacherProfile = { ...loadProfile(), avatarUrl };
        saveProfile(updated);
        setProfile(updated);
      };
      reader.readAsDataURL(file);
    },
  });

  /* ── Nickname update mutation ──────────────────────────────────────── */
  const nicknameMutation = useMutation({
    mutationFn: async (nickname: string) => {
      const res = await axiosPublic.patch("/api/teacher/update-profile", {
        nickname,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
    },
    onError: (err) => console.error("Nickname update failed:", err),
  });

  /* ── Re-check auth ─────────────────────────────────────────────────── */
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!getAuthToken());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  /* ── Close on outside click (ignore file input) ────────────────────── */
  useEffect(() => {
    if (!popupOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // file input click should never close the popup
      if (target.closest('input[type="file"]')) return;
      if (!containerRef.current?.contains(target)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popupOpen]);

  /* ── Handlers ──────────────────────────────────────────────────────── */
  const handleLoginClick = useCallback(
    () => navigate("/admin-login"),
    [navigate],
  );

  const handleProfileClick = useCallback(() => setPopupOpen((p) => !p), []);

  const handleMenuNav = useCallback(
    (path: string) => {
      setPopupOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {}
    setIsLoggedIn(false);
    setPopupOpen(false);
    onLogout?.();
    navigate("/");
  }, [navigate, onLogout]);

  const handleImageSelect = useCallback(
    (file: File) => {
      setPopupOpen(true); // keep popup open during upload
      avatarMutation.mutate(file);
    },
    [avatarMutation],
  );

  const handleNicknameSave = useCallback(
    (nickname: string) => {
      // optimistic update
      const updated: TeacherProfile = { ...loadProfile(), nickname };
      saveProfile(updated);
      setProfile(updated);
      nicknameMutation.mutate(nickname);
    },
    [nicknameMutation],
  );

  const uploading = avatarMutation.isPending;

  /* ── Not logged in ─────────────────────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <motion.button
        onClick={handleLoginClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm outline-none cursor-pointer"
        style={{
          backgroundColor: "var(--color-active-bg)",
          color: "var(--color-active-text)",
          border: "1px solid var(--color-active-border)",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Teacher login"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Login</span>
      </motion.button>
    );
  }

  /* ── Logged in ─────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative">
      {/* Avatar trigger */}
      <motion.button
        onClick={handleProfileClick}
        className="flex items-center gap-1.5 rounded-xl outline-none cursor-pointer px-1.5 py-1"
        style={{
          backgroundColor: popupOpen ? "var(--color-active-bg)" : "transparent",
          border: "1px solid",
          borderColor: popupOpen ? "var(--color-active-border)" : "transparent",
          transition: "background-color 0.2s, border-color 0.2s",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Profile menu"
        aria-expanded={popupOpen}
      >
        <span
          className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            width: size,
            height: size,
            background: profile.avatarUrl
              ? "transparent"
              : "linear-gradient(135deg, var(--color-active-border), var(--color-active-text))",
          }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              draggable={false}
            />
          ) : (
            <User
              style={{
                width: size * 0.52,
                height: size * 0.52,
                color: "var(--color-bg)",
              }}
            />
          )}
        </span>

        <motion.span
          animate={{ rotate: popupOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:flex"
          style={{ color: "var(--color-gray)" }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </motion.button>

      {/* Popup */}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-60 rounded-2xl overflow-hidden shadow-2xl z-[100]"
            variants={POPUP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={POPUP_TRANSITION}
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-active-border)",
              top: "calc(100% + 4px)",
            }}
          >
            {/* Profile header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{ borderBottom: "1px solid var(--color-active-border)" }}
            >
              <Avatar
                size={40}
                avatarUrl={profile.avatarUrl}
                editable
                onImageSelect={handleImageSelect}
                uploading={uploading}
              />

              <div className="min-w-0 flex-1">
                <NicknameRow
                  nickname={profile.nickname}
                  onSave={handleNicknameSave}
                />
                <p
                  className="text-xs leading-tight truncate mt-0.5"
                  style={{ color: "var(--color-gray)" }}
                >
                  {(getAuthToken() as any)?.email ?? "Royal Academy"}
                </p>
              </div>
            </div>

            {/* Theme toggle */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-active-border)" }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Theme
              </span>
              <ThemeToggle size={32} animationSpeed={0.5} />
            </div>

            {/* Menu items */}
            <ul className="py-1.5">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => handleMenuNav(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors outline-none cursor-pointer"
                      style={{ color: "var(--color-text)" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "var(--color-active-bg)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "transparent";
                      }}
                    >
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--color-active-text)" }}
                      />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Logout */}
            <div
              className="py-1.5"
              style={{ borderTop: "1px solid var(--color-active-border)" }}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors outline-none cursor-pointer"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ProfileButton.displayName = "ProfileButton";

export default ProfileButton;
