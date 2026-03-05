// src/pages/Admin/Management/ManagePhotos.tsx

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoTrashOutline,
  IoEyeOutline,
  IoGridOutline,
  IoListOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoCamera,
} from "react-icons/io5";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { axiosPublic } from "../../../hooks/axiosPublic";
import { SearchBar } from "../../../components/common/Searchbar";
import { EmptyState } from "../../../components/common/Emptystate";
import { Pagination } from "../../../components/common/Pagination";

interface Photo {
  _id: string;
  imageUrl: string;
  publicId: string;
  views: number;
  createdAt: string;
  title?: string;
  width?: number;
  height?: number;
  size?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "most-viewed" | "least-viewed";

const ITEMS_PER_PAGE = 12;

const fetchPhotos = async (): Promise<Photo[]> => {
  const response = await axiosPublic.get("/api/photography?limit=1000");
  return response.data.data;
};

const deletePhoto = async (id: string) => {
  await axiosPublic.delete(`/api/photography/${id}`);
};

const deleteBatchPhotos = async (ids: string[]) => {
  await axiosPublic.post("/api/photography/batch/delete", { ids });
};

export default function ManagePhotos() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: photos = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["photos-admin"],
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const deleteMut = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      toast.success("Photo deleted successfully", {
        icon: "✨",
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #2D2E37",
        },
      });
      qc.invalidateQueries({ queryKey: ["photos-admin"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || "Failed to delete photo", {
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #EF4444",
        },
      });
    },
  });

  const batchDeleteMut = useMutation({
    mutationFn: deleteBatchPhotos,
    onSuccess: () => {
      toast.success(`${selectedPhotos.size} photos deleted successfully`, {
        icon: "🎉",
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #2D2E37",
        },
      });
      setSelectedPhotos(new Set());
      setIsSelectionMode(false);
      qc.invalidateQueries({ queryKey: ["photos-admin"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || "Failed to delete photos", {
        style: {
          background: "#0C0D12",
          color: "#FFFFFF",
          border: "1px solid #EF4444",
        },
      });
    },
  });

  // Filter and sort photos
  const processedPhotos = useMemo(() => {
    let filtered = [...photos];

    if (searchQuery) {
      filtered = filtered.filter(
        (photo) =>
          photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo._id.toLowerCase().includes(searchQuery.toLowerCase()),
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
        case "most-viewed":
          return b.views - a.views;
        case "least-viewed":
          return a.views - b.views;
        default:
          return 0;
      }
    });

    return filtered;
  }, [photos, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedPhotos.length / ITEMS_PER_PAGE);
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return processedPhotos.slice(start, end);
  }, [processedPhotos, currentPage]);

  // Reset to page 1 when search or sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const confirmDelete = (id: string) => {
    Swal.fire({
      title: "Delete Photo?",
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
      title: `Delete ${selectedPhotos.size} Photos?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#52525B",
      confirmButtonText: `Delete ${selectedPhotos.size} Photos`,
      cancelButtonText: "Cancel",
      background: "#0C0D12",
      color: "#FFFFFF",
      iconColor: "#F59E0B",
    }).then((result) => {
      if (result.isConfirmed) {
        batchDeleteMut.mutate(Array.from(selectedPhotos));
      }
    });
  };

  const togglePhotoSelection = (id: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedPhotos(newSelection);
  };

  const selectAll = () => {
    setSelectedPhotos(new Set(paginatedPhotos.map((p) => p._id)));
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)}KB` : `${mb.toFixed(1)}MB`;
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
              Loading Gallery
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Fetching your photos...
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
            Failed to Load Photos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            There was an error loading your gallery. Please try again.
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
              Photo Gallery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg"
            >
              Manage and organize your photography collection
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
                placeholder="Search photos by title or ID..."
                value={searchQuery}
              />

              <div className="flex flex-row justify-between items-center">
                {/* Sort */}
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-3 bg-zinc-100 dark:bg-[#0C0D12] border border-zinc-200 dark:border-zinc-800 rounded-xl text-[#0C0D12] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all cursor-pointer font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-viewed">Most Viewed</option>
                    <option value="least-viewed">Least Viewed</option>
                  </select>
                </div>
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
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    Select All ({paginatedPhotos.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearSelection}
                    disabled={selectedPhotos.size === 0}
                    className="px-5 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Clear Selection
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmBatchDelete}
                    disabled={
                      selectedPhotos.size === 0 || batchDeleteMut.isPending
                    }
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    <IoTrashOutline size={16} />
                    Delete Selected ({selectedPhotos.size})
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Photos Display */}
        {processedPhotos.length === 0 ? (
          <EmptyState
            query={searchQuery}
            icon={
              <IoCamera className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400" />
            }
            title={searchQuery ? "No Photos Found" : "No Photos Yet"}
            message={
              searchQuery
                ? `We couldn't find any photos matching "${searchQuery}"`
                : "Start building your gallery by uploading photos"
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
                {paginatedPhotos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
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
                      selectedPhotos.has(photo._id)
                        ? "border-emerald-500 ring-4 ring-emerald-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600"
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 left-3 z-10 cursor-pointer"
                        onClick={() => togglePhotoSelection(photo._id)}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all backdrop-blur-sm ${
                            selectedPhotos.has(photo._id)
                              ? "bg-emerald-600 border-emerald-600 scale-110"
                              : "bg-white/90 dark:bg-zinc-900/90 border-zinc-400 dark:border-zinc-600 group-hover:border-emerald-500"
                          }`}
                        >
                          {selectedPhotos.has(photo._id) && (
                            <IoCheckmarkCircle
                              className="text-white"
                              size={20}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Image */}
                    <div
                      className="relative aspect-square overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                      onClick={() => {
                        if (isSelectionMode) {
                          togglePhotoSelection(photo._id);
                        }
                      }}
                    >
                      <motion.img
                        src={photo.imageUrl}
                        alt={photo.title || `Photo ${photo._id}`}
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
                      {photo.title && (
                        <h3 className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold mb-3 truncate text-base">
                          {photo.title}
                        </h3>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <IoEyeOutline size={18} />
                          <span className="text-sm font-bold">
                            {photo.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                          <IoCalendarOutline size={16} />
                          <span className="text-xs font-medium">
                            {formatDate(photo.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                        {photo.width && photo.height && (
                          <span className="font-medium">
                            {photo.width} × {photo.height}
                          </span>
                        )}
                        <span className="font-medium">
                          {formatFileSize(photo.size)}
                        </span>
                      </div>

                      {/* Actions */}
                      <motion.button
                        onClick={() => confirmDelete(photo._id)}
                        disabled={deleteMut.isPending}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <IoTrashOutline size={18} />
                        <span>Delete</span>
                      </motion.button>
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
                              selectedPhotos.size === paginatedPhotos.length &&
                              paginatedPhotos.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                selectAll();
                              } else {
                                clearSelection();
                              }
                            }}
                            className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Photo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Title
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Views
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#0C0D12] dark:text-[#FFFFFF]">
                        Size
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
                      {paginatedPhotos.map((photo, index) => (
                        <motion.tr
                          key={photo._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                            selectedPhotos.has(photo._id)
                              ? "bg-emerald-50 dark:bg-emerald-500/5"
                              : ""
                          }`}
                        >
                          {isSelectionMode && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPhotos.has(photo._id)}
                                onChange={() => togglePhotoSelection(photo._id)}
                                className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              src={photo.imageUrl}
                              alt={photo.title || `Photo ${photo._id}`}
                              className="w-16 h-16 object-cover rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700"
                              loading="lazy"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-[#0C0D12] dark:text-[#FFFFFF] font-semibold text-sm truncate">
                                {photo.title || "Untitled"}
                              </p>
                              <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate mt-1">
                                ID: {photo._id.slice(-8)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <IoEyeOutline
                                size={18}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                              <span className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold">
                                {photo.views}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-[#0C0D12] dark:text-[#FFFFFF] text-sm font-medium">
                              {formatFileSize(photo.size)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                              {formatDate(photo.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              onClick={() => confirmDelete(photo._id)}
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
                  {paginatedPhotos.map((photo, index) => (
                    <motion.div
                      key={photo._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        selectedPhotos.has(photo._id)
                          ? "bg-emerald-50 dark:bg-emerald-500/5"
                          : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {isSelectionMode && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedPhotos.has(photo._id)}
                              onChange={() => togglePhotoSelection(photo._id)}
                              className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                        <img
                          src={photo.imageUrl}
                          alt={photo.title || `Photo ${photo._id}`}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-md"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#0C0D12] dark:text-[#FFFFFF] font-bold text-sm mb-2 truncate">
                            {photo.title || "Untitled"}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                            <div className="flex items-center gap-1.5">
                              <IoEyeOutline
                                size={14}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                              <span className="font-semibold">
                                {photo.views}
                              </span>
                            </div>
                            <span>•</span>
                            <span className="font-medium">
                              {formatDate(photo.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => confirmDelete(photo._id)}
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
