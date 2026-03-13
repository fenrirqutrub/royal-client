// src/pages/admin/AddTeacher.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
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
type CallerRole = "super-admin" | "admin" | "principal" | "teacher";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: Role;
  slug?: string;
  isHardcoded?: boolean;
}

interface TeacherForm {
  name: string;
  email: string;
  role: Role;
}

// ─── Role config ──────────────────────────────────────────────────────────────
const ALL_ROLES: { value: Role; label: string; color: string }[] = [
  { value: "teacher", label: "Teacher", color: "#3b82f6" },
  { value: "principal", label: "Principal", color: "#8b5cf6" },
  { value: "admin", label: "Admin", color: "#ef4444" },
];

const ROLE_PERMISSIONS: Record<CallerRole, Role[]> = {
  "super-admin": ["admin", "principal", "teacher"],
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
      className="block text-sm font-medium mb-1.5"
      style={{ color: "var(--color-text)" }}
    >
      Role
    </label>
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
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

  // ✅ user comes from auth context — has id, role, isHardcoded
  const { user } = useAuth();

  // Resolve effective caller role
  const callerRole: CallerRole =
    user?.isHardcoded === true
      ? "super-admin"
      : ((user?.role as CallerRole) ?? "teacher");

  const allowedRoles = ROLE_PERMISSIONS[callerRole];
  const canAdd = allowedRoles.length > 0;
  const defaultRole = allowedRoles[0] ?? "teacher";
  const visibleRoles = ALL_ROLES.filter((r) => allowedRoles.includes(r.value));

  // Sent with every mutate call so backend can verify
  const callerMeta = {
    callerId: user?.id ?? "",
    callerRole,
    isHardcoded: user?.isHardcoded ?? false,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeacherForm>({ defaultValues: { role: defaultRole } });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!allowedRoles.includes(selectedRole)) {
      setValue("role", defaultRole);
    }
  }, [allowedRoles, selectedRole, defaultRole, setValue]);

  // ── GET teachers ───────────────────────────────────────────────────────
  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await axiosPublic.get<Teacher[]>("/api/teachers");
      return res.data;
    },
  });

  // ── ADD ────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (data: TeacherForm) => {
      const res = await axiosPublic.post("/api/teachers", {
        ...data,
        ...callerMeta,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Member added!");
      reset({ role: defaultRole });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message ?? "Failed to add member"),
  });

  // ── UPDATE ─────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeacherForm }) => {
      const res = await axiosPublic.patch(`/api/teachers/${id}`, {
        ...data,
        ...callerMeta,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Member updated!");
      setEditingId(null);
      reset({ role: defaultRole });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message ?? "Failed to update member"),
  });

  // ── DELETE ─────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosPublic.delete(`/api/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Member removed!");
    },
    onError: () => toast.error("Failed to delete member"),
  });

  // ── Handlers ───────────────────────────────────────────────────────────
  const onSubmit = (data: TeacherForm) => {
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else addMutation.mutate(data);
  };

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher._id);
    setValue("name", teacher.name);
    setValue("email", teacher.email);
    setValue(
      "role",
      allowedRoles.includes(teacher.role) ? teacher.role : defaultRole,
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ role: defaultRole });
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--color-text)" }}
        >
          {editingId ? "Edit Member" : "Add Member"}
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
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--color-text)" }}
                >
                  Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--color-gray)" }}
                  />
                  <input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      border: `1px solid ${errors.name ? "#ef4444" : "var(--color-active-border)"}`,
                    }}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--color-text)" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--color-gray)" }}
                  />
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email",
                      },
                    })}
                    placeholder="member@email.com"
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      border: `1px solid ${errors.email ? "#ef4444" : "var(--color-active-border)"}`,
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
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

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 cursor-pointer"
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
                    ? "Saving…"
                    : editingId
                      ? "Update Member"
                      : "Add Member"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-gray)",
                      border: "1px solid var(--color-active-border)",
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
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
            <p className="text-sm" style={{ color: "var(--color-gray)" }}>
              You don't have permission to add or edit members.
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
          ) : teachers.length === 0 ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "var(--color-gray)" }}
            >
              No members added yet.
            </p>
          ) : (
            teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  backgroundColor: "var(--color-active-bg)",
                  border: "1px solid var(--color-active-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: roleColor(teacher.role) + "22" }}
                >
                  {teacher.role === "admin" ? (
                    <ShieldCheck
                      className="w-5 h-5"
                      style={{ color: roleColor(teacher.role) }}
                    />
                  ) : (
                    <User
                      className="w-5 h-5"
                      style={{ color: roleColor(teacher.role) }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {teacher.name}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
                      style={{
                        backgroundColor: roleColor(teacher.role) + "22",
                        color: roleColor(teacher.role),
                      }}
                    >
                      {teacher.role}
                    </span>
                    {teacher.isHardcoded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-yellow-100 text-yellow-700 flex-shrink-0">
                        preset
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--color-gray)" }}
                  >
                    {teacher.email}
                  </p>
                </div>

                {canAdd && !teacher.isHardcoded && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(teacher)}
                      className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
                      style={{ color: "var(--color-active-text)" }}
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(teacher._id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                      style={{ color: "#ef4444" }}
                      aria-label="Delete"
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
