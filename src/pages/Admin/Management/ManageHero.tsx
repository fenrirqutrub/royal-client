// src/pages/Admin/Management/ManageHero.tsx

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoTrashOutline,
  IoGridOutline,
  IoListOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoImageOutline,
} from "react-icons/io5";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { axiosPublic } from "../../../hooks/axiosPublic";
import { SearchBar } from "../../../components/common/Searchbar";
import { EmptyState } from "../../../components/common/Emptystate";
import { Pagination } from "../../../components/common/Pagination";

interface Hero {
  _id: string;
  title: string;
  uniqueID: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
  updatedAt: string;
}

interface HeroesResponse {
  success: boolean;
  count: number;
  data: Hero[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

const ITEMS_PER_PAGE = 12;

const fetchHeroes = async (): Promise<Hero[]> => {
  const response = await axiosPublic.get<HeroesResponse>("/api/heroes");
  return response.data.data;
};

const deleteHero = async (id: string) => {
  await axiosPublic.delete(`/api/heroes/${id}`);
};

const deleteBatchHeroes = async (ids: string[]) => {
  await Promise.all(ids.map((id) => axiosPublic.delete(`/api/heroes/${id}`)));
};

export default function ManageHero() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedHeroes, setSelectedHeroes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: heroes = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["heroes-admin"],
    queryFn: fetchHeroes,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const deleteMut = useMutation({
    mutationFn: deleteHero,
    onSuccess: () => {
      toast.success("Hero deleted successfully", {
        icon: "✨",
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #2D2E37",
        },
      });
      qc.invalidateQueries({ queryKey: ["heroes-admin"] });
      qc.invalidateQueries({ queryKey: ["heroes"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || "Failed to delete hero", {
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #EF4444",
        },
      });
    },
  });

  const batchDeleteMut = useMutation({
    mutationFn: deleteBatchHeroes,
    onSuccess: () => {
      toast.success(`${selectedHeroes.size} heroes deleted successfully`, {
        icon: "🎉",
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #2D2E37",
        },
      });
      setSelectedHeroes(new Set());
      setIsSelectionMode(false);
      qc.invalidateQueries({ queryKey: ["heroes-admin"] });
      qc.invalidateQueries({ queryKey: ["heroes"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || "Failed to delete heroes", {
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #EF4444",
        },
      });
    },
  });

  // Filter and sort heroes
  const processedHeroes = useMemo(() => {
    let filtered = [...heroes];

    if (searchQuery) {
      filtered = filtered.filter(
        (hero) =>
          hero.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hero.uniqueID.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hero._id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [heroes, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedHeroes.length / ITEMS_PER_PAGE);
  const paginatedHeroes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return processedHeroes.slice(start, end);
  }, [processedHeroes, currentPage]);

  // Reset to page 1 when search or sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const confirmDelete = (id: string) => {
    Swal.fire({
      title: "Delete Hero?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#52525B",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#0C0D12",
      color: "#FFFFFF",
      iconColor: "#F59E0B",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMut.mutate(id);
      }
    });
  };

  const confirmBatchDelete = () => {
    Swal.fire({
      title: `Delete ${selectedHeroes.size} Heroes?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#52525B",
      confirmButtonText: `Delete ${selectedHeroes.size} Heroes`,
      cancelButtonText: "Cancel",
      background: "#0C0D12",
      color: "#FFFFFF",
      iconColor: "#F59E0B",
    }).then((result) => {
      if (result.isConfirmed) {
        batchDeleteMut.mutate(Array.from(selectedHeroes));
      }
    });
  };

  const toggleHeroSelection = (id: string) => {
    const newSelection = new Set(selectedHeroes);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedHeroes(newSelection);
  };

  const selectAll = () => {
    setSelectedHeroes(new Set(paginatedHeroes.map((h) => h._id)));
  };

  const clearSelection = () => {
    setSelectedHeroes(new Set());
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#E9EBED] dark:bg-[#0C0D12] flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-zinc-300 dark:border-zinc-800 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-[#0C0D12] dark:border-[#FFFFFF] border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-center">
            <p className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold text-xl mb-1">
              Loading Heroes
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Fetching hero images...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#E9EBED] dark:bg-[#0C0D12] flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Failed to Load Heroes
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            There was an error loading hero images. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-[#0C0D12] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0C0D12] font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9EBED] dark:bg-[#0C0D12] transition-colors duration-300">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Title */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0C0D12] dark:text-[#FFFFFF] mb-3 tracking-tight"
            >
              Hero Images
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg"
            >
              Manage your hero slider images • Total: {heroes.length}
            </motion.p>
          </div>

          {/* Controls Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1A1B23] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search heroes by title, ID or uniqueID..."
                value={searchQuery}
              />

              <div className="flex flex-row justify-between items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-3 bg-zinc-100 dark:bg-[#0C0D12] border border-zinc-200 dark:border-zinc-800 rounded-xl text-[#0C0D12] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all cursor-pointer font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-[#0C0D12] p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all font-medium ${
                      viewMode === "grid"
                        ? "bg-[#0C0D12] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0C0D12] shadow-md"
                        : "text-zinc-500 hover:text-[#0C0D12] dark:hover:text-[#FFFFFF]"
                    }`}
                  >
                    <IoGridOutline size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all font-medium ${
                      viewMode === "list"
                        ? "bg-[#0C0D12] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0C0D12] shadow-md"
                        : "text-zinc-500 hover:text-[#0C0D12] dark:hover:text-[#FFFFFF]"
                    }`}
                  >
                    <IoListOutline size={20} />
                  </button>
                </div>
              </div>

              {/* Selection Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) clearSelection();
                }}
                className={`px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap shadow-sm ${
                  isSelectionMode
                    ? "bg-purple-600 text-white hover:bg-purple-500"
                    : "bg-zinc-100 dark:bg-[#0C0D12] text-[#0C0D12] dark:text-[#FFFFFF] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                {isSelectionMode ? "Exit Select" : "Select Mode"}
              </motion.button>
            </div>

            {/* Selection Actions */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={selectAll}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    Select All ({paginatedHeroes.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearSelection}
                    disabled={selectedHeroes.size === 0}
                    className="px-5 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Clear Selection
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmBatchDelete}
                    disabled={
                      selectedHeroes.size === 0 || batchDeleteMut.isPending
                    }
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    <IoTrashOutline size={16} />
                    Delete Selected ({selectedHeroes.size})
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Heroes Display */}
        {processedHeroes.length === 0 ? (
          <EmptyState
            query={searchQuery}
            icon={
              <IoImageOutline className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400" />
            }
            title={searchQuery ? "No Heroes Found" : "No Heroes Yet"}
            message={
              searchQuery
                ? `We couldn't find any heroes matching "${searchQuery}"`
                : "Start by uploading hero images for your slider"
            }
          />
        ) : viewMode === "grid" ? (
          // Grid View
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence>
                {paginatedHeroes.map((hero, index) => (
                  <motion.div
                    key={hero._id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    whileHover={{ y: -8 }}
                    className={`group relative bg-white dark:bg-[#1A1B23] border rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${
                      selectedHeroes.has(hero._id)
                        ? "border-indigo-500 ring-4 ring-indigo-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600"
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 left-3 z-10 cursor-pointer"
                        onClick={() => toggleHeroSelection(hero._id)}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all backdrop-blur-sm ${
                            selectedHeroes.has(hero._id)
                              ? "bg-indigo-600 border-indigo-600 scale-110"
                              : "bg-white/90 dark:bg-zinc-900/90 border-zinc-400 dark:border-zinc-600 group-hover:border-indigo-500"
                          }`}
                        >
                          {selectedHeroes.has(hero._id) && (
                            <IoCheckmarkCircle
                              className="text-white"
                              size={20}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                      {hero.uniqueID}
                    </div>

                    {/* Image */}
                    <div
                      className="relative aspect-video overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleHeroSelection(hero._id);
                        }
                      }}
                    >
                      <motion.img
                        src={hero.imageUrl}
                        alt={hero.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold mb-3 text-base line-clamp-2">
                        {hero.title}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-4">
                        <IoCalendarOutline size={16} />
                        <span className="text-xs font-medium">
                          {formatDate(hero.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => confirmDelete(hero._id)}
                          disabled={deleteMut.isPending}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <IoTrashOutline size={18} />
                          <span>Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          // List View
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-[#1A1B23] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-md"
            >
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-100 dark:bg-[#0C0D12] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      {isSelectionMode && (
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedHeroes.size === paginatedHeroes.length &&
                              paginatedHeroes.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                selectAll();
                              } else {
                                clearSelection();
                              }
                            }}
                            className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Image
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Title
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Unique ID
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Uploaded
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <AnimatePresence>
                      {paginatedHeroes.map((hero, index) => (
                        <motion.tr
                          key={hero._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                            selectedHeroes.has(hero._id)
                              ? "bg-indigo-50 dark:bg-indigo-500/5"
                              : ""
                          }`}
                        >
                          {isSelectionMode && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedHeroes.has(hero._id)}
                                onChange={() => toggleHeroSelection(hero._id)}
                                className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              src={hero.imageUrl}
                              alt={hero.title}
                              className="w-24 h-16 object-cover rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700"
                              loading="lazy"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-[#0C0D12] dark:text-[#FFFFFF] font-semibold text-sm line-clamp-2">
                                {hero.title}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold">
                              {hero.uniqueID}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                              {formatDate(hero.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              onClick={() => confirmDelete(hero._id)}
                              disabled={deleteMut.isPending}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                              <IoTrashOutline size={16} />
                              Delete
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="lg:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                <AnimatePresence>
                  {paginatedHeroes.map((hero, index) => (
                    <motion.div
                      key={hero._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        selectedHeroes.has(hero._id)
                          ? "bg-indigo-50 dark:bg-indigo-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {isSelectionMode && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedHeroes.has(hero._id)}
                              onChange={() => toggleHeroSelection(hero._id)}
                              className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>
                        )}
                        <img
                          src={hero.imageUrl}
                          alt={hero.title}
                          className="w-24 h-16 object-cover rounded-xl flex-shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-md"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold text-sm mb-1 line-clamp-2">
                            {hero.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                              {hero.uniqueID}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                            <span className="font-medium">
                              {formatDate(hero.createdAt)}
                            </span>
                          </div>
                          <motion.button
                            onClick={() => confirmDelete(hero._id)}
                            disabled={deleteMut.isPending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
                          >
                            <IoTrashOutline size={14} />
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Pagination */}
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
