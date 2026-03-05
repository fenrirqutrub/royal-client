import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { axiosPublic } from "../hooks/axiosPublic";
import type { ApiResponse, BaseArticle, Comment } from "../types/Article.types"; // ✅ Comment add করুন
import { MAX_COMMENT_LENGTH, QUERY_KEYS } from "../utility/constants";

// ────────────────────── CUSTOM HOOK: useComments ──────────────────────
interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useComments = (identifier: string | undefined) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments
  const {
    data: comments = [],
    isLoading: loadingComments,
    refetch: refetchComments,
  } = useQuery<Comment[], Error>({
    queryKey: QUERY_KEYS.COMMENTS(identifier || ""),
    queryFn: async () => {
      if (!identifier) return [];
      const res = await axiosPublic.get<ApiResponse<Comment[]>>(
        `/api/articles/${identifier}/comments`,
      );
      return res.data.success ? (res.data.data ?? []) : [];
    },
    enabled: !!identifier,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: "always",
    retry: 1,
  });

  // Add comment mutation
  const addCommentMutation = useMutation<Comment, AxiosErrorResponse, string>({
    mutationFn: async (text: string) => {
      if (!identifier) throw new Error("Invalid article identifier");
      const res = await axiosPublic.post<ApiResponse<Comment>>(
        `/api/articles/${identifier}/comments`,
        { text: text.trim() },
      );
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message ?? "Failed to post comment");
      }
      return res.data.data;
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        QUERY_KEYS.COMMENTS(identifier || ""),
        (old: Comment[] = []) => [newComment, ...old],
      );
      queryClient.setQueryData(
        QUERY_KEYS.ARTICLE(identifier || ""),
        (old: BaseArticle | undefined) =>
          old ? { ...old, comments: (old.comments || 0) + 1 } : old,
      );
      setCommentText("");
      toast.success("Comment posted successfully!");
      refetchComments();
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    },
    onError: (error: AxiosErrorResponse) => {
      const errorMsg =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to post comment";
      toast.error(errorMsg);
    },
  });

  // Add comment handler
  const addComment = useCallback(() => {
    if (!commentText.trim()) {
      toast.error("Please write a comment");
      return;
    }
    if (commentText.trim().length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment must be less than ${MAX_COMMENT_LENGTH} characters`); // ✅ Fix করা
      return;
    }
    addCommentMutation.mutate(commentText);
  }, [commentText, addCommentMutation]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        addComment();
      }
    },
    [addComment],
  );

  return {
    comments,
    loadingComments,
    commentText,
    setCommentText,
    addComment,
    handleKeyDown,
    commentInputRef,
    isPosting: addCommentMutation.isPending,
  };
};
