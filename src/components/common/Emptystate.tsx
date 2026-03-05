import { motion } from "framer-motion";
import { IoSearch } from "react-icons/io5";

// ────────────────────── REUSABLE EMPTY STATE COMPONENT ──────────────────────

interface EmptyStateProps {
  query?: string;
  icon?: React.ReactNode;
  title?: string;
  message?: string;
}

export const EmptyState = ({
  query,
  icon,
  title = "No results found",
  message,
}: EmptyStateProps) => {
  const defaultMessage = query
    ? `We couldn't find any articles matching "${query}"`
    : "No articles available at the moment.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="col-span-full text-center py-12 sm:py-20"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="inline-block"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full flex items-center justify-center">
          {icon || (
            <IoSearch className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
      </motion.div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
        {message || defaultMessage}
      </p>
    </motion.div>
  );
};
