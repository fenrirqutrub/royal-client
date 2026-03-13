import { Link } from "react-router";
import { motion, useInView } from "framer-motion";
import { useRef, memo, useState } from "react";
import Social from "./Social";
import { IoLocationSharp } from "react-icons/io5";
import { MdPhoneIphone } from "react-icons/md";

const PHONE_NUMBERS = [
  { display: "০১৬৫০-০৩৩১৮১", tel: "01650033181" },
  { display: "০১৮০৪-৫৫৮২২৬", tel: "01804558226" },
];

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
}

const FadeUp = memo(({ children, delay = 0 }: FadeUpProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
});
FadeUp.displayName = "FadeUp";

interface SectionLabelProps {
  children: React.ReactNode;
}

const SectionLabel = ({ children }: SectionLabelProps) => (
  <p
    className="text-xs tracking-[5px] uppercase font-semibold mb-7"
    style={{ color: "var(--color-gray)" }}
  >
    {children}
  </p>
);

const MapEmbed = () => {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <motion.div
      className="rounded-lg overflow-hidden w-full relative"
      style={{
        height: "320px",
        border: "1px solid var(--color-active-border)",
      }}
      whileHover={{
        borderColor: "rgba(212,175,55,0.5)",
        boxShadow: "0 0 32px rgba(212,175,55,0.1)",
      }}
      transition={{ duration: 0.3 }}
    >
      {!unlocked && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
          onClick={() => setUnlocked(true)}
        >
          <span
            className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
            style={{
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            ম্যাপ সক্রিয় করুন
          </span>
        </div>
      )}
      <iframe
        className="w-full h-full"
        style={{ filter: "grayscale(30%) sepia(6%)" }}
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d114.0!2d89.6959005!3d24.2923009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sbn!2sbd!4v1"
        loading="lazy"
        title="Royal Academy Location"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </motion.div>
  );
};

const Contact = () => (
  <footer
    className="bangla relative overflow-hidden mt-10"
    style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
  >
    <style>{`
      @keyframes breathe {
        0%, 100% { box-shadow: 0 0 4px 2px rgba(34,197,94,0.3); opacity: 0.8; }
        50%       { box-shadow: 0 0 12px 6px rgba(34,197,94,0.7); opacity: 1; }
      }
    `}</style>
    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-yellow-800/5 blur-3xl pointer-events-none" />

    <div className="relative z-10 w-full px-3 md:px-0 mx-auto pt-14 pb-5">
      <FadeUp>
        <div className="mb-12 flex flex-col items-center sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Left: Academy name — center on mobile, left on desktop */}
          <div className="flex flex-col items-center sm:items-start">
            <h2
              className="bangla text-center sm:text-left text-4xl sm:text-5xl font-extrabold leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              রয়েল একাডেমি, বেলকুচি
            </h2>
            <p className="text-lg sm:text-xl mt-1 tracking-wide flex items-center gap-1 text-[var(--color-gray)] text-center sm:text-left">
              <IoLocationSharp className="text-xl flex-shrink-0 mt-2" />
              মুকুন্দগাতী বাজার, বেলকুচি, সিরাজগঞ্জ
            </p>
          </div>

          {/* Right: Contact info — center on mobile, right on desktop */}
          <div className="flex flex-col items-center sm:items-end">
            <p className="bangla text-center sm:text-right text-xl font-bold text-[var(--color-gray)]">
              যোগাযোগ
            </p>

            {/* Phone numbers */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex flex-row flex-wrap justify-center sm:justify-end gap-x-3">
                {PHONE_NUMBERS.map(({ display, tel }, i) => (
                  <motion.a
                    key={tel}
                    href={`tel:+88${tel}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.1 }}
                    whileHover={{ x: -4 }}
                    className="text-xl sm:text-2xl font-medium text-[var(--color-gray)] flex items-center"
                  >
                    {display}
                  </motion.a>
                ))}
              </div>
              <MdPhoneIphone className="text-xl text-[var(--color-gray)] flex-shrink-0 mt-2" />
            </div>

            {/* Social icons */}
            <Social />
          </div>
        </div>
      </FadeUp>

      <div
        className="w-full h-px mb-12"
        style={{ backgroundColor: "var(--color-active-border)" }}
      />

      {/* Map */}
      <div className="">
        <FadeUp delay={0.2}>
          <SectionLabel>আমাদের অবস্থান</SectionLabel>

          <MapEmbed />

          <p
            className="mt-3 text-base flex items-center gap-2"
            style={{ color: "var(--color-gray)" }}
          >
            <span
              className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 animate-pulse"
              style={{
                boxShadow: "0 0 6px 3px rgba(34,197,94,0.5)",
                animation: "breathe 2s ease-in-out infinite",
              }}
            />
            মুকুন্দগাতী বাজার, বেলকুচি, সিরাজগঞ্জ, বাংলাদেশ
          </p>
        </FadeUp>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12  pt-6  border-t border-[var(--color-active-border)] "
      >
        <div className="md:mx-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-base text-[var(--color-gray)]">
            &copy; ২০২৪ সর্বস্বত্ব সংরক্ষিত —{" "}
            <Link to="/admin-login" className="font-semibold transition-colors">
              রয়েল একাডেমি
            </Link>
          </p>
          <p className="text-base text-[var(--color-gray)]">
            Developed by{" "}
            <Link
              to="https://masudibnbelat.vercel.app"
              className="font-extrabold pacifico text-[var(--color-gray)] tracking-[5px] "
            >
              MiB
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  </footer>
);

export default Contact;
