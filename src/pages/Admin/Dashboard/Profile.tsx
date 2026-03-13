// src/pages/admin/Profile.tsx
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Check,
  Pencil,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosPublic from "../../../hooks/axiosPublic";
import { useAuth } from "../../../context/AuthContext";

/* ─── role config ─────────────────────────────────────────────────────── */
const ROLE_COLOR: Record<string, string> = {
  admin: "#ef4444",
  principal: "#8b5cf6",
  teacher: "#3b82f6",
};

/* ─── field row ───────────────────────────────────────────────────────── */
interface FieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  name: string;
  type?: string;
  placeholder?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  multiline?: boolean;
}

const Field = ({
  icon,
  label,
  value,
  editing,
  name,
  type = "text",
  placeholder,
  onChange,
  multiline,
}: FieldProps) => {
  const missing = !value;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
          {label}
        </p>
        {editing ? (
          multiline ? (
            <textarea
              name={name}
              defaultValue={value ?? ""}
              onChange={onChange}
              placeholder={placeholder}
              rows={2}
              className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none text-gray-900 dark:text-gray-100"
            />
          ) : (
            <input
              name={name}
              type={type}
              defaultValue={value ?? ""}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100"
            />
          )
        ) : (
          <p
            className={`text-sm font-medium flex items-center gap-1.5 ${missing ? "text-amber-500 dark:text-amber-400 italic" : "text-gray-900 dark:text-gray-100"}`}
          >
            {missing && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
            {missing ? `${label} not set` : value}
          </p>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   PROFILE
   ════════════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const slug = user?.slug ?? "";
  const roleColor = ROLE_COLOR[user?.role ?? "teacher"];

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── fetch profile ── */
  const { data: profileRes, isLoading } = useQuery({
    queryKey: ["profile", slug],
    queryFn: async () => {
      const { data } = await axiosPublic.get(`/api/teachers/${slug}/profile`);
      return data;
    },
    enabled: !!slug,
  });

  const profile = profileRes?.data;

  /* ── update profile mutation ── */
  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await axiosPublic.patch(
        `/api/teachers/${slug}/profile`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      toast.success("Profile updated!");
      setEditing(false);
      setFormData({});
    },
    onError: () => toast.error("Failed to update profile"),
  });

  /* ── avatar mutation ── */
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axiosPublic.post(
        `/api/teachers/${slug}/avatar`,
        fd,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      toast.success("Avatar updated!");
    },
    onError: () => toast.error("Failed to upload avatar"),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (Object.keys(formData).length === 0) {
      setEditing(false);
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  /* ── missing count ── */
  const missingFields = [
    profile?.phone,
    profile?.address,
    profile?.qualification,
  ].filter((v) => !v).length;

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-10 lg:mt-0"
        >
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information
          </p>
        </motion.div>

        {/* ── Avatar card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-4 shadow-md"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${roleColor}99, ${roleColor})`,
                }}
              >
                {profile?.avatar?.url ? (
                  <img
                    src={profile.avatar.url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile?.name ?? user?.name ?? "U").charAt(0).toUpperCase()
                )}
              </div>

              {/* Camera button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarMutation.isPending}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:scale-110 transition-transform disabled:opacity-50"
              >
                {avatarMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">
                {profile?.name ?? user?.name ?? "—"}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                  style={{
                    backgroundColor: roleColor + "22",
                    color: roleColor,
                  }}
                >
                  {user?.role}
                </span>
                {slug && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono tracking-widest border"
                    style={{
                      backgroundColor: roleColor + "11",
                      color: roleColor + "cc",
                      borderColor: roleColor + "33",
                    }}
                  >
                    {slug}
                  </span>
                )}
                {user?.role === "admin" && (
                  <ShieldCheck
                    className="w-4 h-4"
                    style={{ color: roleColor }}
                  />
                )}
              </div>
            </div>

            {/* Edit / Save buttons */}
            <div className="flex-shrink-0">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({});
                      }}
                      className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Missing fields warning */}
          {missingFields > 0 && !editing && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            >
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                {missingFields} field{missingFields > 1 ? "s" : ""} missing —
                click <strong>Edit</strong> to complete your profile.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ── Info card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl px-6 shadow-md"
        >
          <Field
            icon={<User className="w-4 h-4 text-gray-500" />}
            label="Full Name"
            value={profile?.name ?? user?.name}
            editing={editing}
            name="name"
            placeholder="Your full name"
            onChange={handleChange}
          />
          <Field
            icon={<Mail className="w-4 h-4 text-gray-500" />}
            label="Email"
            value={profile?.email ?? user?.email}
            editing={false}
            name="email"
            onChange={handleChange}
          />
          <Field
            icon={<Phone className="w-4 h-4 text-gray-500" />}
            label="Phone"
            value={profile?.phone}
            editing={editing}
            name="phone"
            type="tel"
            placeholder="+880 1XXX XXXXXX"
            onChange={handleChange}
          />
          <Field
            icon={<MapPin className="w-4 h-4 text-gray-500" />}
            label="Address"
            value={profile?.address}
            editing={editing}
            name="address"
            placeholder="Your address"
            onChange={handleChange}
            multiline
          />
          <Field
            icon={<GraduationCap className="w-4 h-4 text-gray-500" />}
            label="Qualification"
            value={profile?.qualification}
            editing={editing}
            name="qualification"
            placeholder="e.g. B.Ed, M.Sc in Mathematics"
            onChange={handleChange}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
