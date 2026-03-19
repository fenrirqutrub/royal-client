// src/pages/Admin/Auth/AuthPage.tsx
import { motion, type Variants } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { useNavigate, Link } from "react-router";
import ThemeToggle from "../../../components/Navbar/ThemeToggle";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 2.5 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bangla w-full min-h-screen bg-[var(--color-bg)] flex relative overflow-hidden">
      {/* ── Grid texture ── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      {/* ── Decorative rings ── */}
      <div
        className="pointer-events-none fixed top-[-140px] right-[-140px] w-[420px] h-[420px] rounded-full opacity-[0.05]"
        style={{ border: "52px solid var(--color-text)" }}
      />
      <div
        className="pointer-events-none fixed top-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full opacity-[0.06]"
        style={{ border: "30px solid var(--color-text-hover)" }}
      />
      <div
        className="pointer-events-none fixed bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{ border: "40px solid var(--color-text)" }}
      />

      {/* ════════ LEFT PANEL ════════ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 relative flex-col justify-between p-14"
        style={{ borderRight: "1px solid var(--color-active-border)" }}
      >
        {/* Brand + Home button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              <span className="text-white text-base">🎓</span>
            </div>
            <span className="font-bold text-sm tracking-wide text-[var(--color-text)]">
              Royal Academy
            </span>
          </div>

          {/* Theme Toggle button — desktop left panel */}
          <div className="">
            <ThemeToggle />
          </div>
        </div>

        {/* Center content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--color-text-hover)] mb-5">
              শিক্ষার আলো ছড়িয়ে দিন
            </p>
            <h2 className="text-5xl font-black leading-[1.15] text-[var(--color-text)] mb-6">
              জ্ঞানের পথে আপনাকে স্বাগতম।
            </h2>
            <p className="text-sm text-[var(--color-gray)] leading-relaxed">
              রয়েল একাডেমির ডিজিটাল পোর্টালে প্রবেশ করুন — শিক্ষার্থী, শিক্ষক ও
              কর্মীদের জন্য একটি সমন্বিত প্ল্যাটফর্ম।
            </p>

            {/* Not a member hint */}
            <div
              className="flex items-start gap-3 mt-5 px-4 py-3.5 rounded-xl"
              style={{
                background: "var(--color-active-bg)",
                border: "1px solid var(--color-active-border)",
              }}
            >
              <span className="text-base mt-0.5 shrink-0">👤</span>
              <p className="text-xs text-[var(--color-gray)] leading-relaxed">
                আপনি যদি শিক্ষার্থী, শিক্ষক বা কর্মী না হন, তাহলে{" "}
                <Link
                  to="/"
                  className="font-semibold underline underline-offset-2 text-[var(--color-text-hover)] hover:opacity-80 transition-opacity"
                >
                  হোমপেজে ফিরে যান
                </Link>
                ।
              </p>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex gap-8 mt-10"
          >
            {[
              { num: "১২০০+", label: "শিক্ষার্থী" },
              { num: "৪৮", label: "শিক্ষক" },
              { num: "১৫+", label: "বছরের অভিজ্ঞতা" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-[var(--color-text)]">
                  {s.num}
                </p>
                <p className="text-[11px] text-[var(--color-gray)] mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-[11px] text-[var(--color-gray)]">
          © ২০২৫ রয়েল একাডেমি। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </motion.div>

      {/* ════════ RIGHT PANEL ════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14"
      >
        {/* Mobile top bar — brand + home */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex lg:hidden items-center justify-between w-full mb-8"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              <span className="text-white text-sm">🎓</span>
            </div>
            <span className="font-bold text-sm text-[var(--color-text)]">
              Royal Academy
            </span>
          </div>

          {/* Theme Toggle button — mobile top-right panel */}
          <div className="h-0 w-0 mr-10">
            <ThemeToggle />
          </div>
        </motion.div>

        <div className="w-full">
          {/* Step label */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              ?
            </div>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--color-gray)]">
              একটু জানতে চাই
            </span>
          </motion.div>

          {/* Typewriter heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div className="h-[72px] flex items-start">
              <TypeAnimation
                sequence={[
                  "আপনি কি এই",
                  300,
                  "আপনি কি এই ওয়েবসাইটে",
                  400,
                  "আপনি কি এই ওয়েবসাইটে প্রথমবার আসছেন?",
                  99999,
                ]}
                wrapper="h1"
                speed={72}
                repeat={0}
                cursor
                className="text-[1.75rem] font-black leading-tight text-[var(--color-text)]"
              />
            </div>
            <p className="text-sm text-[var(--color-gray)] mt-2">
              সঠিক বিকল্পটি বেছে নিন — আমরা আপনাকে সঠিক জায়গায় নিয়ে যাব।
            </p>
          </motion.div>

          {/* Choice cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="w-full flex flex-col gap-4"
          >
            {/* YES → /signup */}
            <motion.button
              variants={fadeUp}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate("/signup")}
              className="group w-full relative flex items-center gap-5 px-6 py-5 rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden text-left"
              style={{
                background: "var(--color-active-bg)",
                border: "1.5px solid var(--color-active-border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#3b82f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--color-active-border)")
              }
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: "rgba(59,130,246,0.12)" }}
              >
                👋
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[var(--color-text)] leading-snug">
                  হ্যাঁ, প্রথমবার এসেছি
                </p>
                <p className="text-xs text-[var(--color-gray)] mt-1">
                  নতুন অ্যাকাউন্ট তৈরি করে শুরু করুন
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-blue-500/20"
                style={{ background: "var(--color-bg)" }}
              >
                <span className="text-sm font-bold text-[var(--color-gray)] group-hover:text-[var(--color-text-hover)] transition-colors">
                  →
                </span>
              </div>
            </motion.button>

            {/* NO → /login */}
            <motion.button
              variants={fadeUp}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate("/login")}
              className="group w-full relative flex items-center gap-5 px-6 py-5 rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden text-left"
              style={{
                background: "var(--color-active-bg)",
                border: "1.5px solid var(--color-active-border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#6366f1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--color-active-border)")
              }
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: "rgba(99,102,241,0.12)" }}
              >
                🔑
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[var(--color-text)] leading-snug">
                  না, আগেও এসেছি
                </p>
                <p className="text-xs text-[var(--color-gray)] mt-1">
                  পুরনো অ্যাকাউন্টে লগইন করুন
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-indigo-500/20"
                style={{ background: "var(--color-bg)" }}
              >
                <span className="text-sm font-bold text-[var(--color-gray)] group-hover:text-[var(--color-text-hover)] transition-colors">
                  →
                </span>
              </div>
            </motion.button>
          </motion.div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-center text-[11px] text-[var(--color-gray)] mt-8"
          >
            শুধুমাত্র নিবন্ধিত সদস্যদের জন্য — অননুমোদিত প্রবেশ নিষিদ্ধ
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
