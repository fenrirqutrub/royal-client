import { motion } from "framer-motion";
import { toBn } from "../../utility/Formatters";

export const SectionHeader = ({
  icon: Icon,
  title,
  count,
  pulse,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  pulse?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -2 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.18 }}
    className="mb-4 flex items-center gap-2.5"
  >
    {/* Icon or Pulse indicator */}
    {pulse ? (
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-2.5 w-2.5 rounded-full bg-[var(--color-text)] opacity-70"
      />
    ) : (
      <Icon size={14} className="text-[var(--color-text)] opacity-60" />
    )}

    {/* Title */}
    <h2 className="bangla text-xs font-bold uppercase tracking-wider text-[var(--color-text)] opacity-90">
      {title}
    </h2>

    {/* Count Badge */}
    {typeof count === "number" && count > 0 && (
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="ml-auto bangla rounded-full border border-[var(--color-active-border)] bg-[var(--color-active-bg)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-text)]"
      >
        {toBn(count)}টি
      </motion.span>
    )}
  </motion.div>
);
