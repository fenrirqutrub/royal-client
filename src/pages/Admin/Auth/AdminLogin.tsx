import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useTheme } from "../../../context/ThemeProvider";

interface LoginForm {
  email: string;
  password: string;
}

const CREDENTIALS = {
  email: ["hello@world.com", "mib@gmail.com"],
  password: ["696969", "696969"],
};

const AUTH_KEY = "admin_auth_token";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const [email, password] = watch(["email", "password"]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);

    if (token) {
      try {
        const decoded = JSON.parse(atob(token));

        if (Date.now() > decoded.expireAt) {
          localStorage.removeItem(AUTH_KEY);
          toast.error("Session expired. Please login again.");
          navigate("/admin-login");
        } else {
          navigate("/dashboard");
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, [navigate]);

  // ✅ Helper: check if given email/password match a valid pair
  const isValidCredential = (email: string, password: string): boolean => {
    const index = CREDENTIALS.email.indexOf(email);
    return index !== -1 && CREDENTIALS.password[index] === password;
  };

  const LogOut_Time = 60 * 60 * 1000;

  const onSubmit = (data: LoginForm) => {
    if (isValidCredential(data.email, data.password)) {
      const payload = {
        email: data.email,
        loginTime: Date.now(),
        expireAt: Date.now() + LogOut_Time,
      };

      localStorage.setItem(AUTH_KEY, btoa(JSON.stringify(payload)));

      toast.success("Welcome, Admin!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const hasInput = !!email && !!password;
  const isValid = hasInput && isValidCredential(email, password);

  const btnClass =
    !hasInput || isSubmitting
      ? "bg-gray-400 cursor-not-allowed"
      : errors.email || errors.password || !isValid
        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
        : theme === "dark"
          ? "bg-white text-black hover:bg-gray-100"
          : "bg-black text-white hover:bg-gray-900";

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
                    ? "bg-red-700 "
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
              Admin Login
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
                  minLength: { value: 6, message: "Min 6 characters" },
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
              disabled={!hasInput || isSubmitting}
              className={`w-full uppercase tracking-[2px] text-sm font-bold py-3.5 rounded-lg transition-all ${btnClass}`}
            >
              {isSubmitting
                ? "Signing In..."
                : hasInput && !isValid && !isSubmitting
                  ? "Invalid Credentials"
                  : "Sign In"}
            </button>
          </form>
        </div>

        <p
          className={`text-center text-sm mt-6 ${
            theme === "dark" ? "text-slate-500" : "text-gray-600"
          }`}
        >
          Secure admin access portal. Go back{" "}
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

export default AdminLogin;
