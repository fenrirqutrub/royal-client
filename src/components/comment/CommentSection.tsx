import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { useComments } from "../../hooks/Usecomments";
import { MAX_COMMENT_LENGTH } from "../../utility/constants";

// ────────────────────── COMMENT SECTION COMPONENT ──────────────────────

interface CommentSectionProps {
  articleId: string | undefined;
}

export const CommentSection = ({ articleId }: CommentSectionProps) => {
  const {
    comments,
    loadingComments,
    commentText,
    setCommentText,
    addComment,
    handleKeyDown,
    commentInputRef,
    isPosting,
  } = useComments(articleId);

  return (
    <section>
      <h2
        className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6"
        style={{ color: "var(--color-text)" }}
      >
        Comments ({comments.length})
      </h2>

      {/* Add Comment Form */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Textarea */}
          <textarea
            ref={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts... (Press Ctrl+Enter to post)"
            className="w-full p-3 sm:p-4 rounded-xl resize-none outline-none transition-colors text-sm sm:text-base"
            style={{
              backgroundColor: "var(--color-active-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-active-border)",
              caretColor: "var(--color-text)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-gray)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-active-border)")
            }
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={isPosting}
          />

          <div className="flex items-center justify-between gap-3">
            <span
              className="text-xs sm:text-sm"
              style={{ color: "var(--color-gray)" }}
            >
              {commentText.length}/{MAX_COMMENT_LENGTH}
            </span>

            <button
              onClick={addComment}
              disabled={isPosting || !commentText.trim()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-opacity duration-300 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-text)",
                color: "var(--color-bg)",
              }}
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Posting...</span>
                </>
              ) : (
                <>
                  <span>Post</span>
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comment List */}
      {loadingComments ? (
        <LoadingComments />
      ) : (
        <AnimatePresence mode="popLayout">
          {comments.length === 0 ? (
            <EmptyComments />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {comments.map((comment, idx) => (
                <CommentItem key={comment._id} comment={comment} index={idx} />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
};

// ────────────────────── SUB-COMPONENTS ──────────────────────

const LoadingComments = () => (
  <div className="flex items-center justify-center py-8 sm:py-12">
    <div className="text-center">
      <Loader2
        className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-2"
        style={{ color: "var(--color-gray)" }}
      />
      <p
        className="text-sm sm:text-base"
        style={{ color: "var(--color-gray)" }}
      >
        Loading comments...
      </p>
    </div>
  </div>
);

const EmptyComments = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="text-center py-8 sm:py-12 rounded-xl"
    style={{
      backgroundColor: "var(--color-active-bg)",
      border: "1px solid var(--color-active-border)",
    }}
  >
    <MessageCircle
      className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3"
      style={{ color: "var(--color-gray)" }}
    />
    <p
      className="text-sm sm:text-base px-4"
      style={{ color: "var(--color-gray)" }}
    >
      No comments yet. Be the first to share your thoughts!
    </p>
  </motion.div>
);
