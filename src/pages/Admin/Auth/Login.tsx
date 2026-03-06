// src/pages/Admin/Auth/Login.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "react-router";
import toast from "react-hot-toast";
import { useTheme } from "../../../context/ThemeProvider";
import { useAuth } from "../../../hooks/UseAuth";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { theme } = useTheme();
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  // already logged in → redirect to where they came from or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname ?? "/dashboard";
      window.location.replace(from);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSubmit = async (data: LoginForm) => {
    try {
      // useAuth.login() calls /api/auth/login and sets cookie
      await login(data.email, data.password);
      toast.success("Welcome back!");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Invalid credentials";
      toast.error(msg);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "dark"
          ? "bg-[#0C0D12]"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      <div className="w-full max-w-md">
        <div
          className={`p-8 rounded-2xl ${
            theme === "dark"
              ? "bg-[#16171D] shadow-2xl border border-[#2a2b35]"
              : "bg-white shadow-2xl"
          }`}
        >
          <div className="text-center mb-8">
            <Link to="/">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  theme === "dark"
                    ? "bg-red-700"
                    : "bg-gradient-to-br from-blue-400 to-indigo-500"
                }`}
              >
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </Link>
            <h2
              className={`text-3xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Login
            </h2>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              }`}
            >
              Enter your credentials to access
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${
                  errors.email
                    ? "text-red-500"
                    : theme === "dark"
                      ? "text-slate-500"
                      : "text-gray-400"
                }`}
              />
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                })}
                className={`w-full border-2 rounded-xl pl-12 pr-4 py-3.5 outline-none ${
                  theme === "dark"
                    ? "bg-[#0C0D12] text-white"
                    : "bg-gray-50 text-gray-900"
                } ${
                  errors.email
                    ? "border-red-500"
                    : theme === "dark"
                      ? "border-[#2a2b35] focus:border-blue-500"
                      : "border-gray-200 focus:border-blue-500"
                }`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${
                  errors.password
                    ? "text-red-500"
                    : theme === "dark"
                      ? "text-slate-500"
                      : "text-gray-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 4, message: "Min 4 characters" },
                })}
                className={`w-full border-2 rounded-xl pl-12 pr-12 py-3.5 outline-none ${
                  theme === "dark"
                    ? "bg-[#0C0D12] text-white"
                    : "bg-gray-50 text-gray-900"
                } ${
                  errors.password
                    ? "border-red-500"
                    : theme === "dark"
                      ? "border-[#2a2b35] focus:border-blue-500"
                      : "border-gray-200 focus:border-blue-500"
                }`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 ${
                  theme === "dark" ? "text-slate-500" : "text-gray-400"
                } hover:text-blue-500 transition-colors`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full uppercase tracking-[2px] text-sm font-bold py-3.5 rounded-lg transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : theme === "dark"
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <p
          className={`text-center text-sm mt-6 ${
            theme === "dark" ? "text-slate-500" : "text-gray-600"
          }`}
        >
          Go back{" "}
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
