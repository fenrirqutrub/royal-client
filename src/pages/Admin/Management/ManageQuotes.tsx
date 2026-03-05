import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoTrashOutline,
  IoGridOutline,
  IoListOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { RiDoubleQuotesL } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { axiosPublic } from "../../../hooks/axiosPublic";
import { SearchBar } from "../../../components/common/Searchbar";
import { EmptyState } from "../../../components/common/Emptystate";
import { Pagination } from "../../../components/common/Pagination";

// ───────────────── TYPES ─────────────────

interface Quote {
  _id: string;
  text?: string;
  content?: string;
  author: string;
  createdAt: string;
}

interface ApiError {
  response?: { data?: { message?: string } };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "most-viewed" | "least-viewed";

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "least-viewed", label: "Least Viewed" },
];

// ───────────────── helpers ─────────────────

// FIX 3: Swal light/dark mode color – read computed CSS variable at call time
const getSwalConfig = () => {
  const style = getComputedStyle(document.documentElement);
  const isDark = document.documentElement.classList.contains("dark");
  return {
    background:
      style.getPropertyValue("--admin-card-bg").trim() ||
      (isDark ? "#0f1828" : "#f8fafc"),
    color:
      style.getPropertyValue("--admin-text").trim() ||
      (isDark ? "#e9ebed" : "#0c0d12"),
    iconColor: "#818cf8",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: isDark ? "#1c293d" : "#e2e8f0",
    cancelButtonText: "Cancel",
  };
};

// ───────────────── API ─────────────────

const fetchQuotes = async (): Promise<Quote[]> => {
  const res = await axiosPublic.get("/api/quotes?limit=1000");
  return res.data.data || res.data || [];
};
const deleteQuote = async (id: string) =>
  axiosPublic.delete(`/api/quotes/${id}`);
const deleteBatchQuotes = async (ids: string[]) => {
  try {
    await axiosPublic.post("/api/quotes/batch/delete", { ids });
  } catch {
    await Promise.all(ids.map((id) => axiosPublic.delete(`/api/quotes/${id}`)));
  }
};

// ───────────────── COMPONENT ─────────────────

export default function ManageQuotes() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Queries ──
  const {
    data: quotes = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quotes-admin"],
    queryFn: fetchQuotes,
    staleTime: 1000 * 60 * 5,
  });

  const getToastStyle = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      background: style.getPropertyValue("--admin-card-bg").trim(),
      color: style.getPropertyValue("--admin-text").trim(),
      border: `1px solid ${style.getPropertyValue("--admin-border").trim()}`,
    };
  };

  const deleteMut = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      toast.success("Quote deleted", { icon: "✨", style: getToastStyle() });
      qc.invalidateQueries({ queryKey: ["quotes-admin"] });
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (e: ApiError) =>
      toast.error(e?.response?.data?.message || "Failed to delete", {
        style: { ...getToastStyle(), border: "1px solid #ef4444" },
      }),
  });

  const batchDeleteMut = useMutation({
    mutationFn: deleteBatchQuotes,
    onSuccess: () => {
      toast.success(`${selectedQuotes.size} quotes deleted`, {
        icon: "🎉",
        style: getToastStyle(),
      });
      setSelectedQuotes(new Set());
      setIsSelectionMode(false);
      qc.invalidateQueries({ queryKey: ["quotes-admin"] });
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (e: ApiError) =>
      toast.error(e?.response?.data?.message || "Failed", {
        style: { ...getToastStyle(), border: "1px solid #ef4444" },
      }),
  });

  // ── Processed data ──
  const processedQuotes = useMemo(() => {
    let f = [...quotes];
    if (searchQuery)
      f = f.filter(
        (q) =>
          (q.text || q.content || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          q.author.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    f.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return 0;
    });
    return f;
  }, [quotes, searchQuery, sortBy]);

  const totalPages = Math.ceil(processedQuotes.length / ITEMS_PER_PAGE);
  const paginatedQuotes = useMemo(() => {
    const s = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedQuotes.slice(s, s + ITEMS_PER_PAGE);
  }, [processedQuotes, currentPage]);

  // ── Handlers ──
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  const toggleSel = (id: string) => {
    setSelectedQuotes((prev) => {
      const s = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () =>
    setSelectedQuotes(new Set(paginatedQuotes.map((q) => q._id)));
  const clearSelection = () => setSelectedQuotes(new Set());

  // FIX 1: ESLint no-unused-expressions – use void or proper statement
  const confirmDelete = (id: string) => {
    void Swal.fire({
      ...getSwalConfig(),
      title: "Delete Quote?",
      text: "This cannot be undone",
      icon: "warning",
      confirmButtonText: "Delete",
    }).then((r) => {
      if (r.isConfirmed) deleteMut.mutate(id);
    });
  };

  const confirmBatchDelete = () => {
    void Swal.fire({
      ...getSwalConfig(),
      title: `Delete ${selectedQuotes.size} Quotes?`,
      text: "This cannot be undone",
      icon: "warning",
      confirmButtonText: `Delete ${selectedQuotes.size}`,
    }).then((r) => {
      if (r.isConfirmed) batchDeleteMut.mutate(Array.from(selectedQuotes));
    });
  };

  const fmtDate = (d: string) => {
    const diff = Math.ceil(
      Math.abs(Date.now() - new Date(d).getTime()) / 86400000,
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ── Loading ──
  if (isPending)
    return (
      <div className="min-h-screen bg-adminBg flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-adminCard" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-adminText font-bold text-xl">Loading Quotes</p>
            <p className="text-adminMuted text-sm mt-1">Fetching wisdom...</p>
          </div>
        </motion.div>
      </div>
    );

  // ── Error ──
  if (isError)
    return (
      <div className="min-h-screen bg-adminBg flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Failed to Load Quotes
          </h2>
          <p className="text-adminMuted mb-6">
            There was an error loading your quotes.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );

  // ──────────────────────────────── MAIN UI ────────────────────────────────
  return (
    <div className="min-h-screen bg-adminBg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-adminText mb-2 tracking-tight"
            >
              Quotes
              <span className="ml-3 text-indigo-400">Collection</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-adminMuted text-sm sm:text-base"
            >
              {quotes.length} quotes in your collection
            </motion.p>
          </div>

          {/* ── Controls bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-adminCard border border-adminBorder rounded-2xl p-5"
          >
            {/* Row 1: Search + View mode + Select toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search quotes or author..."
                  value={searchQuery}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* View Mode */}
                <div className="flex items-center gap-1 bg-adminBg p-1 rounded-xl border border-adminBorder">
                  {(["grid", "list"] as ViewMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setViewMode(m)}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === m
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "text-adminMuted hover:text-adminText"
                      }`}
                    >
                      {m === "grid" ? (
                        <IoGridOutline size={18} />
                      ) : (
                        <IoListOutline size={18} />
                      )}
                    </button>
                  ))}
                </div>
                {/* Select Mode toggle */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) clearSelection();
                  }}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                    isSelectionMode
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                      : "bg-adminBg text-adminMuted border border-adminBorder hover:text-adminText hover:border-indigo-500/40"
                  }`}
                >
                  {isSelectionMode ? "Exit Select" : "Select"}
                </motion.button>
              </div>
            </div>

            {/* Row 2: Sort pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-adminMuted text-xs font-semibold mr-1 opacity-60">
                Sort:
              </span>
              {SORT_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    sortBy === opt.value
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "bg-adminBg text-adminMuted border border-adminBorder hover:text-adminText hover:border-indigo-500/30"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>

            {/* Row 3: Batch action bar (conditional) */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-adminBorder flex flex-wrap gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={selectAll}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-indigo-500/20"
                  >
                    Select All ({paginatedQuotes.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearSelection}
                    disabled={selectedQuotes.size === 0}
                    className="px-4 py-2 bg-adminBg text-adminMuted border border-adminBorder rounded-xl text-xs font-semibold hover:text-adminText transition-colors disabled:opacity-40"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmBatchDelete}
                    disabled={
                      selectedQuotes.size === 0 || batchDeleteMut.isPending
                    }
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <IoTrashOutline size={13} />
                    Delete Selected ({selectedQuotes.size})
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ── Empty state ── */}
        {processedQuotes.length === 0 ? (
          <EmptyState
            query={searchQuery}
            icon={
              <RiDoubleQuotesL className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />
            }
            title={searchQuery ? "No Quotes Found" : "No Quotes Yet"}
            message={
              searchQuery
                ? `No quotes matching "${searchQuery}"`
                : "Start building your collection by adding quotes"
            }
          />
        ) : viewMode === "grid" ? (
          /* ═══════════════ GRID VIEW ═══════════════ */
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence>
                {paginatedQuotes.map((quote, i) => (
                  <motion.div
                    key={quote._id}
                    initial={{ opacity: 0, scale: 0.93, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93 }}
                    transition={{
                      delay: i * 0.04,
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ y: -5 }}
                    className={`group relative flex flex-col bg-adminCard border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                      selectedQuotes.has(quote._id)
                        ? "border-indigo-500 ring-4 ring-indigo-500/20"
                        : "border-adminBorder hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-xl"
                    }`}
                  >
                    <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {isSelectionMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 left-4 z-10 cursor-pointer"
                        onClick={() => toggleSel(quote._id)}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedQuotes.has(quote._id)
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-adminBg/80 border-adminBorder group-hover:border-indigo-400"
                          }`}
                        >
                          {selectedQuotes.has(quote._id) && (
                            <IoCheckmarkCircle
                              className="text-white"
                              size={20}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}

                    <div className="flex flex-col flex-1 p-6">
                      <RiDoubleQuotesL
                        className="text-indigo-500/20 mb-3 shrink-0"
                        size={30}
                      />
                      <p className="text-adminText text-base font-medium leading-relaxed flex-1 line-clamp-4 mb-4">
                        {quote.content}
                      </p>
                      <p className="text-indigo-400 text-sm font-semibold mb-4">
                        — {quote.author || "Unknown"}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-adminBorder mb-4">
                        <div className="flex items-center gap-1.5 text-adminMuted">
                          <IoCalendarOutline size={13} />
                          <span className="text-xs">
                            {fmtDate(quote.createdAt)}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => confirmDelete(quote._id)}
                        disabled={deleteMut.isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                      >
                        <IoTrashOutline size={15} />
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          /* ═══════════════ LIST VIEW — FIX 4: Combined responsive (no lg:hidden / hidden lg:block) ═══════════════ */
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-adminCard border border-adminBorder rounded-2xl overflow-hidden shadow-xl shadow-black/10"
            >
              <AnimatePresence>
                {paginatedQuotes.map((quote, i) => (
                  <motion.div
                    key={quote._id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-start gap-3 p-4 sm:p-5 border-b border-adminBorder last:border-b-0 transition-colors ${
                      selectedQuotes.has(quote._id)
                        ? "bg-indigo-600/10"
                        : "hover:bg-adminBg/60"
                    }`}
                  >
                    {/* Checkbox */}
                    {isSelectionMode && (
                      <div className="flex items-start pt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedQuotes.has(quote._id)}
                          onChange={() => toggleSel(quote._id)}
                          className="w-4 h-4 rounded accent-indigo-500"
                        />
                      </div>
                    )}

                    {/* Quote icon */}
                    <RiDoubleQuotesL
                      className="text-indigo-500/30 mt-1 shrink-0 hidden sm:block"
                      size={18}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-adminText text-sm leading-relaxed line-clamp-2 opacity-90 mb-1">
                        {quote.content}
                      </p>
                      <p className="text-indigo-400 text-xs font-semibold mb-2">
                        — {quote.author || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5 text-adminMuted text-xs">
                        <IoCalendarOutline size={11} />
                        <span>{fmtDate(quote.createdAt)}</span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <motion.button
                      onClick={() => confirmDelete(quote._id)}
                      disabled={deleteMut.isPending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-40"
                    >
                      <IoTrashOutline size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
