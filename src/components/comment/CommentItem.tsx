import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { formatTimeAgo } from "../../utility/Formatters";
import type { Comment } from "../../types/Article.types"; // ✅ এই line add করুন

// ────────────────────── COMMENT ITEM COMPONENT ──────────────────────
interface CommentItemProps {
  comment: Comment;
  index: number;
}

export const CommentItem = ({ comment, index }: CommentItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    layout
    className="border border-gray-300 dark:border-slate-800 p-4 sm:p-5 rounded-lg bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
        <UserRound className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
            {comment.author}
          </p>
          <span className="text-gray-400">•</span>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {formatTimeAgo(comment.createdAt)}
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700 dark:text-[#abc2d3] break-words">
          {comment.text}
        </p>
      </div>
    </div>
  </motion.div>
);
