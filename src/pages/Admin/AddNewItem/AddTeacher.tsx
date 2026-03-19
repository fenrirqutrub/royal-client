// src/pages/Admin/AddTeacher.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosPublic from "../../../hooks/axiosPublic";
import { useAuth } from "../../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "teacher" | "principal" | "admin";

interface StaffMember {
  _id: string;
  name: string;
  phone: string;
  role: Role;
  slug?: string;
  isHardcoded?: boolean;
  onboardingComplete?: boolean;
}

interface StaffForm {
  name: string;
  phone: string;
  role: Role;
}

// ─── Role config ──────────────────────────────────────────────────────────────
const ALL_ROLES: { value: Role; label: string; color: string }[] = [
  { value: "teacher", label: "শিক্ষক", color: "#3b82f6" },
  { value: "principal", label: "অধ্যক্ষ", color: "#8b5cf6" },
  { value: "admin", label: "প্রশাসক", color: "#ef4444" },
];

const ROLE_PERMISSIONS: Record<string, Role[]> = {
  owner: ["admin", "principal", "teacher"],
  admin: ["admin", "principal", "teacher"],
  principal: ["principal", "teacher"],
  teacher: [],
};

const roleColor = (role: Role) =>
  ALL_ROLES.find((r) => r.value === role)?.color ?? "#6b7280";

// ─── RoleSelector ─────────────────────────────────────────────────────────────
const RoleSelector = ({
  options,
  value,
  onChange,
}: {
  options: typeof ALL_ROLES;
  value: Role;
  onChange: (role: Role) => void;
}) => (
  <div>
    <label
      className="block text-sm font-medium mb-1.5 bangla"
      style={{ color: "var(--color-text)" }}
    >
      ভূমিকা
    </label>
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all bangla"
          style={{
            borderColor: opt.color,
            backgroundColor: value === opt.value ? opt.color : "transparent",
            color: value === opt.value ? "#fff" : opt.color,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// ─── AddTeacher ───────────────────────────────────────────────────────────────
const AddTeacher = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const callerRole = user?.isHardcoded ? "owner" : (user?.role ?? "teacher");
  const allowedRoles = ROLE_PERMISSIONS[callerRole] ?? [];
  const canAdd = allowedRoles.length > 0;
  const defaultRole = (allowedRoles[0] ?? "teacher") as Role;
  const visibleRoles = ALL_ROLES.filter((r) => allowedRoles.includes(r.value));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffForm>({ defaultValues: { role: defaultRole } });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!allowedRoles.includes(selectedRole)) setValue("role", defaultRole);
  }, [allowedRoles, selectedRole, defaultRole, setValue]);

  // ── GET ────────────────────────────────────────────────────────────────
  const { data: members = [], isLoading } = useQuery<StaffMember[]>({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const res = await axiosPublic.get<StaffMember[]>(
        "/api/users?role=teacher&role=principal&role=admin",
      );
      return res.data;
    },
  });

  // ── ADD ────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (data: StaffForm) => {
      const res = await axiosPublic.post("/api/users", {
        ...data,
        callerRole,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("সদস্য যোগ করা হয়েছে!");
      reset({ role: defaultRole });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message ?? "যোগ করতে ব্যর্থ"),
  });

  // ── UPDATE ─────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StaffForm }) => {
      const res = await axiosPublic.patch(`/api/users/${id}`, {
        ...data,
        callerRole,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("আপডেট হয়েছে!");
      setEditingId(null);
      reset({ role: defaultRole });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message ?? "আপডেট ব্যর্থ"),
  });

  // ── DELETE ─────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosPublic.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      toast.success("মুছে ফেলা হয়েছে!");
    },
    onError: () => toast.error("মুছতে ব্যর্থ"),
  });

  const onSubmit = (data: StaffForm) => {
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else addMutation.mutate(data);
  };

  const startEdit = (m: StaffMember) => {
    setEditingId(m._id);
    setValue("name", m.name);
    setValue("phone", m.phone);
    setValue("role", allowedRoles.includes(m.role) ? m.role : defaultRole);
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ role: defaultRole });
  };
  const isPending = addMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-6 bangla"
          style={{ color: "var(--color-text)" }}
        >
          {editingId ? "সদস্য সম্পাদনা" : "সদস্য যোগ করুন"}
        </h1>

        {/* ── Form ── */}
        {canAdd ? (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: "var(--color-active-bg)",
              border: "1px solid var(--color-active-border)",
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 bangla"
                  style={{ color: "var(--color-text)" }}
                >
                  পূর্ণ নাম
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--color-gray)" }}
                  />
                  <input
                    {...register("name", { required: "নাম আবশ্যক" })}
                    placeholder="পূর্ণ নাম"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm bangla"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      border: `1px solid ${errors.name ? "#ef4444" : "var(--color-active-border)"}`,
                    }}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 bangla">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 bangla"
                  style={{ color: "var(--color-text)" }}
                >
                  ফোন নম্বর
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--color-gray)" }}
                  />
                  <input
                    {...register("phone", {
                      required: "ফোন নম্বর আবশ্যক",
                      pattern: {
                        value: /^01[3-9]\d{8}$/,
                        message: "সঠিক বাংলাদেশী নম্বর দিন",
                      },
                    })}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      border: `1px solid ${errors.phone ? "#ef4444" : "var(--color-active-border)"}`,
                    }}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 bangla">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <RoleSelector
                options={visibleRoles}
                value={selectedRole}
                onChange={(role) =>
                  setValue("role", role, { shouldValidate: true })
                }
              />
              <input type="hidden" {...register("role", { required: true })} />

              {/* Info note */}
              <p
                className="text-xs bangla"
                style={{ color: "var(--color-gray)" }}
              >
                💡 এই ফোন নম্বরটি সদস্যকে জানান — তিনি signup-এ এই নম্বর দিয়ে
                অ্যাকাউন্ট সক্রিয় করবেন।
              </p>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 cursor-pointer bangla"
                  style={{
                    backgroundColor: "var(--color-active-text)",
                    color: "var(--color-bg)",
                  }}
                >
                  {editingId ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isPending
                    ? "সংরক্ষণ হচ্ছে..."
                    : editingId
                      ? "আপডেট করুন"
                      : "যোগ করুন"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer bangla"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-gray)",
                      border: "1px solid var(--color-active-border)",
                    }}
                  >
                    <X className="w-4 h-4" /> বাতিল
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: "var(--color-active-bg)",
              border: "1px solid var(--color-active-border)",
            }}
          >
            <Lock
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "var(--color-gray)" }}
            />
            <p
              className="text-sm bangla"
              style={{ color: "var(--color-gray)" }}
            >
              সদস্য যোগ বা সম্পাদনার অনুমতি নেই।
            </p>
          </div>
        )}

        {/* ── Member list ── */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--color-active-text)" }}
              />
            </div>
          ) : members.length === 0 ? (
            <p
              className="text-center py-8 text-sm bangla"
              style={{ color: "var(--color-gray)" }}
            >
              কোনো সদস্য নেই।
            </p>
          ) : (
            members.map((m) => (
              <div
                key={m._id}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  border: "1px solid var(--color-active-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: roleColor(m.role) + "22" }}
                >
                  {m.role === "admin" ? (
                    <ShieldCheck
                      className="w-5 h-5"
                      style={{ color: roleColor(m.role) }}
                    />
                  ) : (
                    <User
                      className="w-5 h-5"
                      style={{ color: roleColor(m.role) }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="text-sm font-semibold truncate bangla"
                      style={{ color: "var(--color-text)" }}
                    >
                      {m.name}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 bangla"
                      style={{
                        backgroundColor: roleColor(m.role) + "22",
                        color: roleColor(m.role),
                      }}
                    >
                      {ALL_ROLES.find((r) => r.value === m.role)?.label ??
                        m.role}
                    </span>
                    {/* activation status */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 bangla"
                      style={
                        m.onboardingComplete
                          ? {
                              backgroundColor: "rgba(34,197,94,0.1)",
                              color: "#22c55e",
                            }
                          : {
                              backgroundColor: "rgba(245,158,11,0.1)",
                              color: "#f59e0b",
                            }
                      }
                    >
                      {m.onboardingComplete ? "✅ সক্রিয়" : "⏳ অপেক্ষমাণ"}
                    </span>
                    {m.isHardcoded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-yellow-100 text-yellow-700 flex-shrink-0">
                        preset
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {m.phone ?? "—"}
                  </p>
                </div>

                {canAdd && !m.isHardcoded && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(m)}
                      className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
                      style={{ color: "var(--color-active-text)" }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(m._id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;
