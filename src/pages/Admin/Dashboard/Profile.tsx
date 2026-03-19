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
import DatePicker from "../../../components/common/Datepicker";
import SelectInput from "../../../components/common/SelectInput";
import { getDivisions, getDistricts, getThanas } from "../../../data/bd-geo";

/* ─── Constants ──────────────────────────────────────────────────────────── */
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
const RELIGION_OPTIONS = [
  { value: "ইসলাম", label: "ইসলাম" },
  { value: "হিন্দু", label: "হিন্দু" },
  { value: "বৌদ্ধ", label: "বৌদ্ধ" },
  { value: "খ্রিষ্টান", label: "খ্রিষ্টান" },
];
const CLASS_OPTIONS = [
  "ষষ্ঠ শ্রেণি",
  "সপ্তম শ্রেণি",
  "অষ্টম শ্রেণি",
  "নবম শ্রেণি",
  "দশম শ্রেণি",
  "একাদশ শ্রেণি",
  "দ্বাদশ শ্রেণি",
].map((v) => ({ value: v, label: v }));
const SUBJECT_OPTIONS = [
  { value: "বিজ্ঞান", label: "বিজ্ঞান" },
  { value: "মানবিক", label: "মানবিক" },
  { value: "বাণিজ্য", label: "বাণিজ্য" },
];
const CLASSES_WITH_SUBJECT = [
  "নবম শ্রেণি",
  "দশম শ্রেণি",
  "একাদশ শ্রেণি",
  "দ্বাদশ শ্রেণি",
];
const DEGREE_LABEL: Record<string, string> = {
  hsc: "এইচএসসি / সমমান",
  hons: "স্নাতক (সম্মান)",
  masters: "স্নাতকোত্তর",
};

/* ─── toLocalIso ─────────────────────────────────────────────────────────── */
const toLocalIso = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/* ─── SectionHeader ──────────────────────────────────────────────────────── */
const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div
    className="flex items-center gap-2.5 px-5 pt-5 pb-3"
    style={{ borderBottom: "1px solid var(--color-active-border)" }}
  >
    <span className="text-[var(--color-gray)]">{icon}</span>
    <p className="text-xs font-black uppercase tracking-widest bangla text-[var(--color-gray)]">
      {title}
    </p>
  </div>
);

/* ─── Card ───────────────────────────────────────────────────────────────── */
const Card = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
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
    {children}
  </motion.div>
);

/* ─── FieldRow: display mode ─────────────────────────────────────────────── */
const FieldDisplay = ({
  icon,
  label,
  value,
  optional,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  optional?: boolean;
}) => {
  const missing = !value;
  return (
    <div
      className="flex items-start gap-3 py-3 last:border-0"
      style={{ borderBottom: "1px solid var(--color-active-border)" }}
    >
      <div
        className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "var(--color-active-bg)" }}
      >
        <span className="text-[var(--color-gray)]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 bangla text-[var(--color-gray)]">
          {label}
          {optional && (
            <span className="ml-1 normal-case tracking-normal opacity-40">
              (ঐচ্ছিক)
            </span>
          )}
        </p>
        <p
          className={`text-sm font-medium bangla truncate flex items-center gap-1.5 ${missing ? "italic" : ""}`}
          style={{ color: missing ? "#f59e0b" : "var(--color-text)" }}
        >
          {missing && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
          {missing ? `${label} সেট করা নেই` : value}
        </p>
      </div>
    </div>
  );
};

/* ─── TextInput ──────────────────────────────────────────────────────────── */
const TextInput = ({
  icon,
  label,
  name,
  value,
  type = "text",
  placeholder,
  optional,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value?: string | null;
  type?: string;
  placeholder?: string;
  optional?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-1.5 mb-3">
    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
      <span>{icon}</span> {label}
      {optional && (
        <span className="normal-case tracking-normal opacity-40">(ঐচ্ছিক)</span>
      )}
    </label>
    <input
      name={name}
      type={type}
      defaultValue={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full text-sm rounded-xl px-3 py-2.5 outline-none bangla transition-all"
      style={{
        backgroundColor: "var(--color-active-bg)",
        border: "1px solid var(--color-active-border)",
        color: "var(--color-text)",
      }}
      onFocus={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-text-hover)")
      }
      onBlur={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-active-border)")
      }
    />
  </div>
);

/* ─── PasswordInput ──────────────────────────────────────────────────────── */
const PasswordInput = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5 mb-3">
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
        <Lock className="w-3 h-3" /> নতুন পাসওয়ার্ড
        <span className="normal-case tracking-normal opacity-40">(ঐচ্ছিক)</span>
      </label>
      <div className="relative">
        <input
          name="password"
          type={show ? "text" : "password"}
          onChange={onChange}
          placeholder="পরিবর্তন না করলে ফাঁকা রাখুন"
          className="w-full text-sm rounded-xl px-3 py-2.5 pr-10 outline-none bangla transition-all"
          style={{
            backgroundColor: "var(--color-active-bg)",
            border: "1px solid var(--color-active-border)",
            color: "var(--color-text)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--color-text-hover)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--color-active-border)")
          }
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-[var(--color-gray)] hover:text-[var(--color-text-hover)]"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   PROFILE PAGE
   ════════════════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const slug = user?.slug ?? "";
  const roleColor = ROLE_COLOR[user?.role ?? "teacher"] ?? "#3b82f6";

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Geo state for editing
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [pDivision, setPDivision] = useState("");
  const [pDistrict, setPDistrict] = useState("");
  const [pThana, setPThana] = useState("");

  // DOB for editing
  const [dobDisplay, setDobDisplay] = useState("");
  const [dobIso, setDobIso] = useState("");

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const startEditing = () => {
    // Pre-fill geo state from profile
    setDivision(profile?.division ?? "");
    setDistrict(profile?.district ?? "");
    setThana(profile?.thana ?? "");
    setPDivision(profile?.permanentDivision ?? "");
    setPDistrict(profile?.permanentDistrict ?? "");
    setPThana(profile?.permanentThana ?? "");
    setDobDisplay("");
    setDobIso(
      profile?.dateOfBirth ? toLocalIso(new Date(profile.dateOfBirth)) : "",
    );
    setEditing(true);
  };

  const handleSave = () => {
    const payload: Record<string, string> = { ...formData };

    // Merge geo fields
    if (division) payload.division = division;
    if (district) payload.district = district;
    if (thana) payload.thana = thana;
    if (pDivision) payload.permanentDivision = pDivision;
    if (pDistrict) payload.permanentDistrict = pDistrict;
    if (pThana) payload.permanentThana = pThana;
    if (dobIso) payload.dateOfBirth = dobIso;

    if (!payload.password) delete payload.password;
    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }
    updateMutation.mutate(payload);
  };

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

  // Geo options
  const divisionOptions = getDivisions().map((v) => ({ value: v, label: v }));
  const districtOptions = division
    ? getDistricts(division).map((v) => ({ value: v, label: v }))
    : [];
  const thanaOptions =
    division && district
      ? getThanas(division, district).map((v) => ({ value: v, label: v }))
      : [];
  const pDistrictOptions = pDivision
    ? getDistricts(pDivision).map((v) => ({ value: v, label: v }))
    : [];
  const pThanaOptions =
    pDivision && pDistrict
      ? getThanas(pDivision, pDistrict).map((v) => ({ value: v, label: v }))
      : [];

  if (isLoading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-gray)]" />
      </div>
    );

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <main className="w-full  py-8 lg:py-10">
        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 mt-10 lg:mt-0"
        >
          <h1 className="text-xl font-black tracking-tight bangla text-[var(--color-text)]">
            আমার প্রোফাইল
          </h1>
          <p className="text-xs mt-0.5 bangla text-[var(--color-gray)]">
            ব্যক্তিগত তথ্য পরিচালনা করুন
          </p>
        </motion.div>

        {/* ── Hero card: avatar + name ── */}
        <Card delay={0.04}>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${roleColor}88, ${roleColor})`,
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
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "2px solid var(--color-active-border)",
                  }}
                >
                  {avatarMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[var(--color-gray)]" />
                  ) : (
                    <Camera className="w-3 h-3 text-[var(--color-gray)]" />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) avatarMutation.mutate(f);
                  }}
                />
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-black truncate bangla text-[var(--color-text)]">
                  {profile?.name ?? user?.name ?? "—"}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bangla"
                    style={{
                      backgroundColor: roleColor + "20",
                      color: roleColor,
                    }}
                  >
                    {ROLE_LABEL[user?.role ?? ""] ?? user?.role}
                  </span>
                  {slug && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono tracking-widest"
                      style={{
                        backgroundColor: roleColor + "10",
                        color: roleColor + "bb",
                        border: `1px solid ${roleColor}30`,
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

              {/* Edit / Save */}
              <div className="flex-shrink-0">
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-1.5"
                    >
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 bangla transition-opacity"
                        style={{ backgroundColor: "#10b981" }}
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">সংরক্ষণ</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({});
                        }}
                        className="p-1.5 rounded-xl transition-colors text-[var(--color-gray)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-bg)]"
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
                      onClick={startEditing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors bangla text-[var(--color-text)] hover:bg-[var(--color-active-bg)]"
                      style={{ border: "1px solid var(--color-active-border)" }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">সম্পাদনা</span>
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
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  backgroundColor: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                <AlertCircle
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#f59e0b" }}
                />
                <p
                  className="text-xs font-medium bangla"
                  style={{ color: "#f59e0b" }}
                >
                  {missingFields}টি তথ্য অসম্পূর্ণ — <strong>সম্পাদনা</strong>{" "}
                  করে পূরণ করুন।
                </p>
              </motion.div>
            )}
          </div>
        </Card>

        {/* ════ DISPLAY MODE ════════════════════════════════════════════════ */}
        {!editing && (
          <>
            {/* Personal */}
            <Card delay={0.08}>
              <SectionHeader
                icon={<User className="w-3.5 h-3.5" />}
                title="ব্যক্তিগত তথ্য"
              />
              <div className="px-5 pb-2">
                <FieldDisplay
                  icon={<User className="w-3.5 h-3.5" />}
                  label="পূর্ণ নাম"
                  value={profile?.name ?? user?.name}
                />
                <FieldDisplay
                  icon={<User className="w-3.5 h-3.5" />}
                  label="বাবার নাম"
                  value={profile?.fatherName}
                />
                <FieldDisplay
                  icon={<User className="w-3.5 h-3.5" />}
                  label="মায়ের নাম"
                  value={profile?.motherName}
                />
                <FieldDisplay
                  icon={<CalendarDays className="w-3.5 h-3.5" />}
                  label="জন্ম তারিখ"
                  value={formatDOB(profile?.dateOfBirth)}
                />
                <FieldDisplay
                  icon={<Heart className="w-3.5 h-3.5" />}
                  label="ধর্ম"
                  value={profile?.religion}
                />
                <FieldDisplay
                  icon={<User className="w-3.5 h-3.5" />}
                  label="লিঙ্গ"
                  value={profile?.gender}
                />
              </div>
            </Card>

            {/* Contact */}
            <Card delay={0.12}>
              <SectionHeader
                icon={<Phone className="w-3.5 h-3.5" />}
                title="যোগাযোগ"
              />
              <div className="px-5 pb-2">
                <FieldDisplay
                  icon={<Phone className="w-3.5 h-3.5" />}
                  label="ফোন নম্বর"
                  value={profile?.phone}
                />
                {!isStudent && (
                  <FieldDisplay
                    icon={<Mail className="w-3.5 h-3.5" />}
                    label="ইমেইল"
                    value={profile?.email ?? user?.email}
                    optional
                  />
                )}
                <FieldDisplay
                  icon={<PhoneCall className="w-3.5 h-3.5" />}
                  label="জরুরি যোগাযোগ"
                  value={profile?.emergencyContact}
                  optional
                />
              </div>
            </Card>

            {/* Present address */}
            <Card delay={0.16}>
              <SectionHeader
                icon={<MapPin className="w-3.5 h-3.5" />}
                title="বর্তমান ঠিকানা"
              />
              <div className="px-5 pb-2">
                <FieldDisplay
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  label="গ্রাম/মহল্লা"
                  value={profile?.gramNam}
                />
                <FieldDisplay
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  label="পাড়া"
                  value={profile?.para}
                  optional
                />
                <FieldDisplay
                  icon={<Building2 className="w-3.5 h-3.5" />}
                  label="থানা/উপজেলা"
                  value={profile?.thana}
                />
                <FieldDisplay
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  label="জেলা"
                  value={profile?.district}
                />
                <FieldDisplay
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  label="বিভাগ"
                  value={profile?.division}
                  optional
                />
                <FieldDisplay
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  label="পরিচিত স্থান"
                  value={profile?.landmark}
                  optional
                />
              </div>
            </Card>

            {/* Permanent address */}
            {!profile?.permanentSameAsPresent && (
              <Card delay={0.18}>
                <SectionHeader
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  title="স্থায়ী ঠিকানা"
                />
                <div className="px-5 pb-2">
                  <FieldDisplay
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="গ্রাম/মহল্লা"
                    value={profile?.permanentGramNam}
                  />
                  <FieldDisplay
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="পাড়া"
                    value={profile?.permanentPara}
                    optional
                  />
                  <FieldDisplay
                    icon={<Building2 className="w-3.5 h-3.5" />}
                    label="থানা/উপজেলা"
                    value={profile?.permanentThana}
                  />
                  <FieldDisplay
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="জেলা"
                    value={profile?.permanentDistrict}
                  />
                  <FieldDisplay
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="বিভাগ"
                    value={profile?.permanentDivision}
                    optional
                  />
                </div>
              </Card>
            )}

            {/* Student info */}
            {isStudent && (
              <Card delay={0.2}>
                <SectionHeader
                  icon={<GraduationCap className="w-3.5 h-3.5" />}
                  title="শিক্ষা তথ্য"
                />
                <div className="px-5 pb-2">
                  <FieldDisplay
                    icon={<GraduationCap className="w-3.5 h-3.5" />}
                    label="শ্রেণি"
                    value={profile?.studentClass}
                  />
                  {CLASSES_WITH_SUBJECT.includes(
                    profile?.studentClass ?? "",
                  ) && (
                    <FieldDisplay
                      icon={<BookOpen className="w-3.5 h-3.5" />}
                      label="বিভাগ"
                      value={profile?.studentSubject}
                      optional
                    />
                  )}
                  <FieldDisplay
                    icon={<Hash className="w-3.5 h-3.5" />}
                    label="রোল নম্বর"
                    value={profile?.roll}
                    optional
                  />
                  <FieldDisplay
                    icon={<School className="w-3.5 h-3.5" />}
                    label="বিদ্যালয়"
                    value={profile?.schoolName}
                    optional
                  />
                </div>
              </Card>
            )}

            {/* Staff education */}
            {!isStudent && (
              <Card delay={0.2}>
                <SectionHeader
                  icon={<GraduationCap className="w-3.5 h-3.5" />}
                  title="শিক্ষাগত যোগ্যতা"
                />
                <div className="px-5 pb-2">
                  <FieldDisplay
                    icon={<GraduationCap className="w-3.5 h-3.5" />}
                    label="যোগ্যতা"
                    value={profile?.qualification}
                    optional
                  />
                  <FieldDisplay
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label="ডিগ্রি"
                    value={
                      profile?.degree ? DEGREE_LABEL[profile.degree] : null
                    }
                  />
                  {profile?.currentYear && (
                    <FieldDisplay
                      icon={<BookOpen className="w-3.5 h-3.5" />}
                      label="বর্তমান বর্ষ"
                      value={profile.currentYear}
                    />
                  )}
                </div>
              </Card>
            )}

            {/* Security */}
            <Card delay={0.22}>
              <SectionHeader
                icon={<Lock className="w-3.5 h-3.5" />}
                title="নিরাপত্তা"
              />
              <div className="px-5 py-4">
                <p className="text-sm bangla italic text-[var(--color-gray)]">
                  পাসওয়ার্ড পরিবর্তনের জন্য সম্পাদনা করুন
                </p>
              </div>
            </Card>
          </>
        )}

        {/* ════ EDIT MODE ════════════════════════════════════════════════════ */}
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Personal */}
            <Card delay={0}>
              <SectionHeader
                icon={<User className="w-3.5 h-3.5" />}
                title="ব্যক্তিগত তথ্য"
              />
              <div className="px-5 pt-4 pb-2">
                <TextInput
                  icon={<User className="w-3 h-3" />}
                  label="পূর্ণ নাম"
                  name="name"
                  value={profile?.name}
                  placeholder="পূর্ণ নাম বাংলায়"
                  onChange={handleChange}
                />
                <TextInput
                  icon={<User className="w-3 h-3" />}
                  label="বাবার নাম"
                  name="fatherName"
                  value={profile?.fatherName}
                  placeholder="বাবার পূর্ণ নাম"
                  onChange={handleChange}
                />
                <TextInput
                  icon={<User className="w-3 h-3" />}
                  label="মায়ের নাম"
                  name="motherName"
                  value={profile?.motherName}
                  placeholder="মায়ের পূর্ণ নাম"
                  onChange={handleChange}
                />

                {/* DOB with DatePicker */}
                <div className="space-y-1.5 mb-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                    <CalendarDays className="w-3 h-3" /> জন্ম তারিখ
                  </label>
                  <DatePicker
                    value={
                      dobDisplay ||
                      (profile?.dateOfBirth
                        ? (formatDOB(profile.dateOfBirth) ?? "")
                        : "")
                    }
                    onChange={setDobDisplay}
                    onDateChange={(date) => {
                      if (!isNaN(date.getTime())) setDobIso(toLocalIso(date));
                    }}
                    placeholder="জন্ম তারিখ বেছে নিন"
                    maxDate={new Date()}
                  />
                </div>

                {/* Religion with SelectInput */}
                <div className="space-y-1.5 mb-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                    <Heart className="w-3 h-3" /> ধর্ম
                  </label>
                  <SelectInput
                    options={RELIGION_OPTIONS}
                    value={formData.religion ?? profile?.religion ?? ""}
                    onChange={(v) => handleSelectChange("religion", v)}
                    placeholder="ধর্ম বেছে নিন"
                  />
                </div>

                {/* Gender — read only */}
                <div className="space-y-1.5 mb-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                    <User className="w-3 h-3" /> লিঙ্গ{" "}
                    <span className="normal-case tracking-normal opacity-40">
                      (পরিবর্তনযোগ্য নয়)
                    </span>
                  </label>
                  <div
                    className="w-full text-sm rounded-xl px-3 py-2.5 bangla opacity-60 cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--color-active-bg)",
                      border: "1px solid var(--color-active-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    {profile?.gender ?? "—"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card delay={0}>
              <SectionHeader
                icon={<Phone className="w-3.5 h-3.5" />}
                title="যোগাযোগ"
              />
              <div className="px-5 pt-4 pb-2">
                <TextInput
                  icon={<Phone className="w-3 h-3" />}
                  label="ফোন নম্বর"
                  name="phone"
                  type="tel"
                  value={profile?.phone}
                  placeholder="01XXXXXXXXX"
                  onChange={handleChange}
                />
                {!isStudent && (
                  <TextInput
                    icon={<Mail className="w-3 h-3" />}
                    label="ইমেইল"
                    name="email"
                    type="email"
                    value={profile?.email}
                    placeholder="example@email.com"
                    optional
                    onChange={handleChange}
                  />
                )}
                <TextInput
                  icon={<PhoneCall className="w-3 h-3" />}
                  label="জরুরি যোগাযোগ"
                  name="emergencyContact"
                  type="tel"
                  value={profile?.emergencyContact}
                  placeholder="অভিভাবকের নম্বর"
                  optional
                  onChange={handleChange}
                />
              </div>
            </Card>

            {/* Present address */}
            <Card delay={0}>
              <SectionHeader
                icon={<MapPin className="w-3.5 h-3.5" />}
                title="বর্তমান ঠিকানা"
              />
              <div className="px-5 pt-4 pb-2">
                <TextInput
                  icon={<MapPin className="w-3 h-3" />}
                  label="গ্রাম/মহল্লা"
                  name="gramNam"
                  value={profile?.gramNam}
                  placeholder="গ্রাম বা মহল্লার নাম"
                  onChange={handleChange}
                />
                <TextInput
                  icon={<MapPin className="w-3 h-3" />}
                  label="পাড়া"
                  name="para"
                  value={profile?.para}
                  placeholder="পাড়ার নাম"
                  optional
                  onChange={handleChange}
                />

                <div className="space-y-1.5 mb-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                    <MapPin className="w-3 h-3" /> বিভাগ
                  </label>
                  <SelectInput
                    options={divisionOptions}
                    value={division}
                    onChange={(v) => {
                      setDivision(v);
                      setDistrict("");
                      setThana("");
                    }}
                    placeholder="বিভাগ নির্বাচন করুন"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                      <MapPin className="w-3 h-3" /> জেলা
                    </label>
                    <SelectInput
                      options={districtOptions}
                      value={district}
                      onChange={(v) => {
                        setDistrict(v);
                        setThana("");
                      }}
                      placeholder={division ? "জেলা বাছুন" : "বিভাগ আগে"}
                      disabled={!division}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                      <Building2 className="w-3 h-3" /> থানা
                    </label>
                    <SelectInput
                      options={thanaOptions}
                      value={thana}
                      onChange={setThana}
                      placeholder={district ? "থানা বাছুন" : "জেলা আগে"}
                      disabled={!district}
                    />
                  </div>
                </div>

                <TextInput
                  icon={<MapPin className="w-3 h-3" />}
                  label="পরিচিত স্থান"
                  name="landmark"
                  value={profile?.landmark}
                  placeholder="মসজিদ / বাজার / স্কুলের কাছে"
                  optional
                  onChange={handleChange}
                />
              </div>
            </Card>

            {/* Permanent address */}
            {!profile?.permanentSameAsPresent && (
              <Card delay={0}>
                <SectionHeader
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  title="স্থায়ী ঠিকানা"
                />
                <div className="px-5 pt-4 pb-2">
                  <TextInput
                    icon={<MapPin className="w-3 h-3" />}
                    label="গ্রাম/মহল্লা"
                    name="permanentGramNam"
                    value={profile?.permanentGramNam}
                    placeholder="গ্রাম বা মহল্লার নাম"
                    onChange={handleChange}
                  />
                  <TextInput
                    icon={<MapPin className="w-3 h-3" />}
                    label="পাড়া"
                    name="permanentPara"
                    value={profile?.permanentPara}
                    placeholder="পাড়ার নাম"
                    optional
                    onChange={handleChange}
                  />

                  <div className="space-y-1.5 mb-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                      <MapPin className="w-3 h-3" /> বিভাগ
                    </label>
                    <SelectInput
                      options={divisionOptions}
                      value={pDivision}
                      onChange={(v) => {
                        setPDivision(v);
                        setPDistrict("");
                        setPThana("");
                      }}
                      placeholder="বিভাগ নির্বাচন করুন"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                        <MapPin className="w-3 h-3" /> জেলা
                      </label>
                      <SelectInput
                        options={pDistrictOptions}
                        value={pDistrict}
                        onChange={(v) => {
                          setPDistrict(v);
                          setPThana("");
                        }}
                        placeholder={pDivision ? "জেলা বাছুন" : "বিভাগ আগে"}
                        disabled={!pDivision}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                        <Building2 className="w-3 h-3" /> থানা
                      </label>
                      <SelectInput
                        options={pThanaOptions}
                        value={pThana}
                        onChange={setPThana}
                        placeholder={pDistrict ? "থানা বাছুন" : "জেলা আগে"}
                        disabled={!pDistrict}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Student fields */}
            {isStudent && (
              <Card delay={0}>
                <SectionHeader
                  icon={<GraduationCap className="w-3.5 h-3.5" />}
                  title="শিক্ষা তথ্য"
                />
                <div className="px-5 pt-4 pb-2">
                  <div className="space-y-1.5 mb-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                      <GraduationCap className="w-3 h-3" /> শ্রেণি
                    </label>
                    <SelectInput
                      options={CLASS_OPTIONS}
                      value={
                        formData.studentClass ?? profile?.studentClass ?? ""
                      }
                      onChange={(v) => handleSelectChange("studentClass", v)}
                      placeholder="শ্রেণি বেছে নিন"
                    />
                  </div>
                  {CLASSES_WITH_SUBJECT.includes(
                    formData.studentClass ?? profile?.studentClass ?? "",
                  ) && (
                    <div className="space-y-1.5 mb-3">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                        <BookOpen className="w-3 h-3" /> বিভাগ
                      </label>
                      <SelectInput
                        options={SUBJECT_OPTIONS}
                        value={
                          formData.studentSubject ??
                          profile?.studentSubject ??
                          ""
                        }
                        onChange={(v) =>
                          handleSelectChange("studentSubject", v)
                        }
                        placeholder="বিভাগ বেছে নিন"
                      />
                    </div>
                  )}
                  <TextInput
                    icon={<Hash className="w-3 h-3" />}
                    label="রোল নম্বর"
                    name="roll"
                    value={profile?.roll}
                    placeholder="রোল নম্বর"
                    optional
                    onChange={handleChange}
                  />
                  <TextInput
                    icon={<School className="w-3 h-3" />}
                    label="বিদ্যালয়ের নাম"
                    name="schoolName"
                    value={profile?.schoolName}
                    placeholder="বিদ্যালয়ের পূর্ণ নাম"
                    optional
                    onChange={handleChange}
                  />
                </div>
              </Card>
            )}

            {/* Staff education */}
            {!isStudent && (
              <Card delay={0}>
                <SectionHeader
                  icon={<GraduationCap className="w-3.5 h-3.5" />}
                  title="শিক্ষাগত যোগ্যতা"
                />
                <div className="px-5 pt-4 pb-2">
                  <TextInput
                    icon={<GraduationCap className="w-3 h-3" />}
                    label="যোগ্যতা"
                    name="qualification"
                    value={profile?.qualification}
                    placeholder="যেমন: বিএড, এমএ"
                    optional
                    onChange={handleChange}
                  />
                  {/* degree/currentYear read-only in profile edit */}
                  <div className="space-y-1.5 mb-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bangla text-[var(--color-gray)]">
                      <BookOpen className="w-3 h-3" /> ডিগ্রি{" "}
                      <span className="normal-case tracking-normal opacity-40">
                        (পরিবর্তনযোগ্য নয়)
                      </span>
                    </label>
                    <div
                      className="w-full text-sm rounded-xl px-3 py-2.5 bangla opacity-60 cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--color-active-bg)",
                        border: "1px solid var(--color-active-border)",
                        color: "var(--color-text)",
                      }}
                    >
                      {profile?.degree ? DEGREE_LABEL[profile.degree] : "—"}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Security */}
            <Card delay={0}>
              <SectionHeader
                icon={<Lock className="w-3.5 h-3.5" />}
                title="নিরাপত্তা"
              />
              <div className="px-5 pt-4 pb-2">
                <PasswordInput onChange={handleChange} />
              </div>
            </Card>

            {/* Save button (bottom) */}
            <div className="flex gap-3 mt-2 pb-6">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bangla disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#10b981" }}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                পরিবর্তন সংরক্ষণ করুন
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({});
                }}
                className="px-5 py-3 rounded-xl text-sm font-bold bangla transition-colors text-[var(--color-text)] hover:bg-[var(--color-active-bg)]"
                style={{ border: "1px solid var(--color-active-border)" }}
              >
                বাতিল
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Profile;
