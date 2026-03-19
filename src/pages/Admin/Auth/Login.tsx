// src/pages/Admin/Auth/Login.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { Lock, Phone, Eye, EyeOff, GraduationCap } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import ForgetPassword from "./ForgetPassword";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginForm {
  phone: string;
  password: string;
}

// ─── Bengali helpers ──────────────────────────────────────────────────────────
const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
const BN_DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const formatDobBn = (date: Date) =>
  `${BN_DAYS[date.getDay()]}, ${toBn(date.getDate())} ${BN_MONTHS[date.getMonth()]} ${toBn(date.getFullYear())}`;

// ─── Animation variants ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};
const slideTrans = { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] as const };

// ─── Login ────────────────────────────────────────────────────────────────────
const Login = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const isDark = theme === "dark";

  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.phone, data.password);
      toast.success("স্বাগতম!");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? "ফোন নম্বর বা পাসওয়ার্ড ভুল");
    }
  };

  const inputCls = (hasError: boolean) =>
    `w-full border-2 rounded-xl pl-11 pr-4 py-3.5 outline-none text-sm transition-all duration-200 ${
      isDark
        ? "bg-[#0C0D12] text-white placeholder:text-slate-600"
        : "bg-gray-50 text-gray-900 placeholder:text-gray-400"
    } ${
      hasError
        ? "border-red-400 focus:border-red-400"
        : isDark
          ? "border-[#2a2b35] focus:border-blue-500"
          : "border-gray-200 focus:border-blue-400"
    }`;

  return (
    <>
      {/* ── Forget password modal ── */}
      <AnimatePresence>
        {showForgot && <ForgetPassword onClose={() => setShowForgot(false)} />}
      </AnimatePresence>

      {/* ── Login form ── */}
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          isDark
            ? "bg-[#0C0D12]"
            : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <div className="w-full max-w-md">
          <div
            className={`p-8 rounded-2xl ${
              isDark
                ? "bg-[#16171D] shadow-2xl border border-[#2a2b35]"
                : "bg-white shadow-2xl"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${
                    isDark
                      ? "bg-blue-600"
                      : "bg-gradient-to-br from-blue-400 to-indigo-500"
                  }`}
                >
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </Link>
              <h2
                className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Royal Academy
              </h2>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                ফোন নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Phone */}
              <div className="relative">
                <Phone
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none ${
                    errors.phone
                      ? "text-red-400"
                      : isDark
                        ? "text-slate-500"
                        : "text-gray-400"
                  }`}
                />
                <input
                  type="tel"
                  autoFocus
                  placeholder="01XXXXXXXXX"
                  className={inputCls(!!errors.phone)}
                  {...register("phone", {
                    required: "ফোন নম্বর আবশ্যক",
                    pattern: {
                      value: /^01[3-9]\d{8}$/,
                      message: "সঠিক বাংলাদেশী নম্বর দিন",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1.5 bangla">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none ${
                    errors.password
                      ? "text-red-400"
                      : isDark
                        ? "text-slate-500"
                        : "text-gray-400"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড"
                  className={inputCls(!!errors.password) + " pr-12"}
                  {...register("password", {
                    required: "পাসওয়ার্ড আবশ্যক",
                    minLength: { value: 4, message: "কমপক্ষে ৪ অক্ষর" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors hover:text-blue-500 ${
                    isDark ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5 bangla">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs bangla transition-colors hover:underline"
                  style={{ color: "#3b82f6" }}
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full uppercase tracking-[2px] text-sm font-bold py-3.5 rounded-lg transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : isDark
                      ? "bg-white text-black hover:bg-gray-100"
                      : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    প্রবেশ হচ্ছে...
                  </span>
                ) : (
                  "প্রবেশ করুন"
                )}
              </button>
            </form>
          </div>

          <p
            className={`text-center text-sm mt-5 ${isDark ? "text-slate-500" : "text-gray-600"}`}
          >
            অ্যাকাউন্ট নেই?{" "}
            <Link
              to="/signup"
              className="text-blue-500 hover:underline font-medium"
            >
              Sign Up করুন
            </Link>
            {" · "}
            <Link to="/" className="text-blue-500 hover:underline">
              হোমে ফিরুন
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
