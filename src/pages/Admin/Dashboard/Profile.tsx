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
  Lock,
  Eye,
  EyeOff,
  Heart,
  BookOpen,
  CalendarDays,
  PhoneCall,
  Building2,
  Hash,
  School,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosPublic from "../../../hooks/axiosPublic";
import { useAuth } from "../../../context/AuthContext";

/* ─── Role colors ─────────────────────────────────────────────────────── */
const ROLE_COLOR: Record<string, string> = {
  owner: "#f59e0b",
  admin: "#ef4444",
  principal: "#8b5cf6",
  teacher: "#3b82f6",
  student: "#10b981",
};

const ROLE_LABEL: Record<string, string> = {
  owner: "মালিক",
  admin: "প্রশাসক",
  principal: "অধ্যক্ষ",
  teacher: "শিক্ষক",
  student: "ছাত্র/ছাত্রী",
};

/* ─── Section header ──────────────────────────────────────────────────── */
const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-6 pt-5 pb-2">
    <p
      className="text-[11px] font-black uppercase tracking-widest bangla"
      style={{ color: "var(--section-accent, #94a3b8)" }}
    >
      {title}
    </p>
  </div>
);

/* ─── Field row ───────────────────────────────────────────────────────── */
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
  readOnly?: boolean;
  optional?: boolean;
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
  readOnly,
  optional,
}: FieldProps) => {
  const missing = !value;
  const isEditable = editing && !readOnly;

  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="mt-0.5 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 bangla">
          {label}
          {optional && (
            <span className="ml-1 normal-case tracking-normal text-gray-300 dark:text-gray-600">
              (ঐচ্ছিক)
            </span>
          )}
        </p>
        {isEditable ? (
          <input
            name={name}
            type={type}
            defaultValue={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-gray-900 dark:text-gray-100 bangla transition-all"
          />
        ) : (
          <p
            className={`text-sm font-medium flex items-center gap-1.5 bangla ${
              missing
                ? "text-amber-500 dark:text-amber-400 italic"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {missing && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
            {missing ? `${label} সেট করা নেই` : value}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─── Password field ──────────────────────────────────────────────────── */
const PasswordField = ({
  editing,
  onChange,
}: {
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [show, setShow] = useState(false);
  if (!editing) return null;
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
      <div className="mt-0.5 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Lock className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 bangla">
          নতুন পাসওয়ার্ড{" "}
          <span className="normal-case tracking-normal text-gray-300 dark:text-gray-600">
            (ঐচ্ছিক)
          </span>
        </p>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            onChange={onChange}
            placeholder="পরিবর্তন না করলে ফাঁকা রাখুন"
            className="w-full text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100 bangla transition-all"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Card wrapper ────────────────────────────────────────────────────── */
const Card = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm mb-3 overflow-hidden"
  >
    {children}
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════════════
   PROFILE PAGE
   ════════════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const slug = user?.slug ?? "";
  const roleColor = ROLE_COLOR[user?.role ?? "teacher"] ?? "#3b82f6";

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Fetch profile ── */
  const { data: profileRes, isLoading } = useQuery({
    queryKey: ["profile", slug],
    queryFn: async () => {
      const { data } = await axiosPublic.get(`/api/users/${slug}/profile`);
      return data;
    },
    enabled: !!slug,
  });

  const profile = profileRes?.data;

  /* ── Update mutation ── */
  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await axiosPublic.patch(
        `/api/users/${slug}/profile`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      toast.success("প্রোফাইল আপডেট হয়েছে!");
      setEditing(false);
      setFormData({});
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? "আপডেট ব্যর্থ");
    },
  });

  /* ── Avatar mutation ── */
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await axiosPublic.post(`/api/users/${slug}/avatar`, fd);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      toast.success("ছবি আপডেট হয়েছে!");
    },
    onError: () => toast.error("ছবি আপলোড ব্যর্থ"),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    const payload = { ...formData };
    if (!payload.password) delete payload.password;
    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }
    updateMutation.mutate(payload);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  // Count missing required fields
  const missingFields = [
    profile?.phone,
    profile?.gramNam,
    profile?.thana,
    profile?.district,
    profile?.fatherName,
    profile?.motherName,
    profile?.dateOfBirth,
    profile?.religion,
  ].filter((v) => !v).length;

  // Format date of birth for display
  const formatDOB = (dob: string | null | undefined) => {
    if (!dob) return null;
    try {
      return new Date(dob).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dob;
    }
  };

  const isStudent = user?.role === "student";

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <main className="w-full mx-auto px-4 py-10">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 mt-10 lg:mt-0"
        >
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight bangla">
            আমার প্রোফাইল
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 bangla">
            আপনার ব্যক্তিগত তথ্য পরিচালনা করুন
          </p>
        </motion.div>

        {/* ── Avatar + name card ── */}
        <Card delay={0.05}>
          <div className="p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-18 h-18 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md overflow-hidden"
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
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarMutation.isPending}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {avatarMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                  ) : (
                    <Camera className="w-3 h-3 text-gray-600 dark:text-gray-300" />
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
                <h2 className="text-lg font-black text-gray-900 dark:text-white truncate bangla">
                  {profile?.name ?? user?.name ?? "—"}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bangla"
                    style={{
                      backgroundColor: roleColor + "22",
                      color: roleColor,
                    }}
                  >
                    {ROLE_LABEL[user?.role ?? ""] ?? user?.role}
                  </span>
                  {slug && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono tracking-widest border"
                      style={{
                        backgroundColor: roleColor + "11",
                        color: roleColor + "cc",
                        borderColor: roleColor + "33",
                      }}
                    >
                      {slug}
                    </span>
                  )}
                  {(user?.role === "admin" || user?.role === "owner") && (
                    <ShieldCheck
                      className="w-3.5 h-3.5"
                      style={{ color: roleColor }}
                    />
                  )}
                </div>
              </div>

              {/* Edit / Save toggle */}
              <div className="flex-shrink-0">
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 bangla"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        সংরক্ষণ
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({});
                        }}
                        className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="edit"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bangla"
                    >
                      <Pencil className="w-3.5 h-3.5" /> সম্পাদনা
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Incomplete warning */}
            {missingFields > 0 && !editing && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium bangla">
                  {missingFields}টি তথ্য অসম্পূর্ণ — <strong>সম্পাদনা</strong>{" "}
                  করে পূরণ করুন।
                </p>
              </motion.div>
            )}
          </div>
        </Card>

        {/* ── Personal info ── */}
        <Card delay={0.1}>
          <SectionHeader title="ব্যক্তিগত তথ্য" />
          <div className="px-6 pb-4">
            <Field
              icon={<User className="w-3.5 h-3.5 text-gray-500" />}
              label="পূর্ণ নাম"
              value={profile?.name ?? user?.name}
              editing={editing}
              name="name"
              placeholder="পূর্ণ নাম বাংলায়"
              onChange={handleChange}
            />
            <Field
              icon={<User className="w-3.5 h-3.5 text-gray-500" />}
              label="বাবার নাম"
              value={profile?.fatherName}
              editing={editing}
              name="fatherName"
              placeholder="বাবার পূর্ণ নাম"
              onChange={handleChange}
            />
            <Field
              icon={<User className="w-3.5 h-3.5 text-gray-500" />}
              label="মায়ের নাম"
              value={profile?.motherName}
              editing={editing}
              name="motherName"
              placeholder="মায়ের পূর্ণ নাম"
              onChange={handleChange}
            />
            <Field
              icon={<CalendarDays className="w-3.5 h-3.5 text-gray-500" />}
              label="জন্ম তারিখ"
              value={
                editing
                  ? profile?.dateOfBirth?.toString()?.split("T")[0]
                  : formatDOB(profile?.dateOfBirth)
              }
              editing={editing}
              name="dateOfBirth"
              type="date"
              placeholder="জন্ম তারিখ"
              onChange={handleChange}
            />
            <Field
              icon={<Heart className="w-3.5 h-3.5 text-gray-500" />}
              label="ধর্ম"
              value={profile?.religion}
              editing={editing}
              name="religion"
              placeholder="ধর্ম"
              onChange={handleChange}
            />
            <Field
              icon={<User className="w-3.5 h-3.5 text-gray-500" />}
              label="লিঙ্গ"
              value={profile?.gender}
              editing={false}
              name="gender"
              onChange={handleChange}
              readOnly
            />
          </div>
        </Card>

        {/* ── Contact ── */}
        <Card delay={0.15}>
          <SectionHeader title="যোগাযোগ" />
          <div className="px-6 pb-4">
            <Field
              icon={<Phone className="w-3.5 h-3.5 text-gray-500" />}
              label="ফোন নম্বর"
              value={profile?.phone}
              editing={editing}
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              onChange={handleChange}
            />
            {!isStudent && (
              <Field
                icon={<Mail className="w-3.5 h-3.5 text-gray-500" />}
                label="ইমেইল"
                value={profile?.email ?? user?.email}
                editing={editing}
                name="email"
                type="email"
                placeholder="example@email.com"
                onChange={handleChange}
                optional
              />
            )}
            <Field
              icon={<PhoneCall className="w-3.5 h-3.5 text-gray-500" />}
              label="জরুরি যোগাযোগ"
              value={profile?.emergencyContact}
              editing={editing}
              name="emergencyContact"
              type="tel"
              placeholder="অভিভাবকের নম্বর"
              onChange={handleChange}
              optional
            />
          </div>
        </Card>

        {/* ── Present address ── */}
        <Card delay={0.2}>
          <SectionHeader title="বর্তমান ঠিকানা" />
          <div className="px-6 pb-4">
            <Field
              icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
              label="গ্রাম/মহল্লা"
              value={profile?.gramNam}
              editing={editing}
              name="gramNam"
              placeholder="গ্রাম বা মহল্লার নাম"
              onChange={handleChange}
            />
            <Field
              icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
              label="পাড়া"
              value={profile?.para}
              editing={editing}
              name="para"
              placeholder="পাড়ার নাম"
              onChange={handleChange}
              optional
            />
            <Field
              icon={<Building2 className="w-3.5 h-3.5 text-gray-500" />}
              label="থানা/উপজেলা"
              value={profile?.thana}
              editing={editing}
              name="thana"
              placeholder="থানা বা উপজেলা"
              onChange={handleChange}
            />
            <Field
              icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
              label="জেলা"
              value={profile?.district}
              editing={editing}
              name="district"
              placeholder="জেলার নাম"
              onChange={handleChange}
            />
            <Field
              icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
              label="বিভাগ"
              value={profile?.division}
              editing={editing}
              name="division"
              placeholder="বিভাগ"
              onChange={handleChange}
              optional
            />
            <Field
              icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
              label="পরিচিত স্থান"
              value={profile?.landmark}
              editing={editing}
              name="landmark"
              placeholder="মসজিদ / বাজার / স্কুলের কাছে"
              onChange={handleChange}
              optional
            />
          </div>
        </Card>

        {/* ── Permanent address (if different) ── */}
        {!profile?.permanentSameAsPresent && (
          <Card delay={0.22}>
            <SectionHeader title="স্থায়ী ঠিকানা" />
            <div className="px-6 pb-4">
              <Field
                icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
                label="গ্রাম/মহল্লা"
                value={profile?.permanentGramNam}
                editing={editing}
                name="permanentGramNam"
                placeholder="গ্রাম বা মহল্লার নাম"
                onChange={handleChange}
              />
              <Field
                icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
                label="পাড়া"
                value={profile?.permanentPara}
                editing={editing}
                name="permanentPara"
                placeholder="পাড়ার নাম"
                onChange={handleChange}
                optional
              />
              <Field
                icon={<Building2 className="w-3.5 h-3.5 text-gray-500" />}
                label="থানা/উপজেলা"
                value={profile?.permanentThana}
                editing={editing}
                name="permanentThana"
                placeholder="থানা বা উপজেলা"
                onChange={handleChange}
              />
              <Field
                icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
                label="জেলা"
                value={profile?.permanentDistrict}
                editing={editing}
                name="permanentDistrict"
                placeholder="জেলার নাম"
                onChange={handleChange}
              />
              <Field
                icon={<MapPin className="w-3.5 h-3.5 text-gray-500" />}
                label="বিভাগ"
                value={profile?.permanentDivision}
                editing={editing}
                name="permanentDivision"
                placeholder="বিভাগ"
                onChange={handleChange}
                optional
              />
            </div>
          </Card>
        )}

        {/* ── Student info ── */}
        {isStudent && (
          <Card delay={0.25}>
            <SectionHeader title="শিক্ষা তথ্য (ছাত্র/ছাত্রী)" />
            <div className="px-6 pb-4">
              <Field
                icon={<GraduationCap className="w-3.5 h-3.5 text-gray-500" />}
                label="শ্রেণি"
                value={profile?.studentClass}
                editing={editing}
                name="studentClass"
                placeholder="শ্রেণি"
                onChange={handleChange}
              />
              {[
                "নবম শ্রেণি",
                "দশম শ্রেণি",
                "একাদশ শ্রেণি",
                "দ্বাদশ শ্রেণি",
              ].includes(profile?.studentClass ?? "") && (
                <Field
                  icon={<BookOpen className="w-3.5 h-3.5 text-gray-500" />}
                  label="বিভাগ (বিজ্ঞান/মানবিক/বাণিজ্য)"
                  value={profile?.studentSubject}
                  editing={editing}
                  name="studentSubject"
                  placeholder="বিভাগ"
                  onChange={handleChange}
                  optional
                />
              )}
              <Field
                icon={<Hash className="w-3.5 h-3.5 text-gray-500" />}
                label="রোল নম্বর"
                value={profile?.roll}
                editing={editing}
                name="roll"
                placeholder="রোল নম্বর"
                onChange={handleChange}
                optional
              />
              <Field
                icon={<School className="w-3.5 h-3.5 text-gray-500" />}
                label="বিদ্যালয়ের নাম"
                value={profile?.schoolName}
                editing={editing}
                name="schoolName"
                placeholder="বিদ্যালয়ের পূর্ণ নাম"
                onChange={handleChange}
                optional
              />
            </div>
          </Card>
        )}

        {/* ── Staff education ── */}
        {!isStudent && (
          <Card delay={0.25}>
            <SectionHeader title="শিক্ষাগত যোগ্যতা" />
            <div className="px-6 pb-4">
              <Field
                icon={<GraduationCap className="w-3.5 h-3.5 text-gray-500" />}
                label="যোগ্যতা"
                value={profile?.qualification}
                editing={editing}
                name="qualification"
                placeholder="যেমন: বিএড, এমএ, বিএস"
                onChange={handleChange}
                optional
              />
              <Field
                icon={<BookOpen className="w-3.5 h-3.5 text-gray-500" />}
                label="ডিগ্রি"
                value={
                  profile?.degree === "hsc"
                    ? "এইচএসসি / সমমান"
                    : profile?.degree === "hons"
                      ? "স্নাতক (সম্মান)"
                      : profile?.degree === "masters"
                        ? "স্নাতকোত্তর"
                        : profile?.degree
                }
                editing={false}
                name="degree"
                onChange={handleChange}
                readOnly
              />
              {profile?.currentYear && (
                <Field
                  icon={<BookOpen className="w-3.5 h-3.5 text-gray-500" />}
                  label="বর্তমান বর্ষ"
                  value={profile?.currentYear}
                  editing={false}
                  name="currentYear"
                  onChange={handleChange}
                  readOnly
                />
              )}
            </div>
          </Card>
        )}

        {/* ── Security ── */}
        <Card delay={0.3}>
          <SectionHeader title="নিরাপত্তা" />
          <div className="px-6 pb-4">
            <PasswordField editing={editing} onChange={handleChange} />
            {!editing && (
              <div className="py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 bangla italic">
                  পাসওয়ার্ড পরিবর্তনের জন্য সম্পাদনা করুন
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
