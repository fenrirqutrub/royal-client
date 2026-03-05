// src/pages/Photography/Photography.tsx
import { useEffect, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IoEyeOutline, IoCloseOutline } from "react-icons/io5";
import { axiosPublic } from "../../hooks/axiosPublic";
import Loader from "../../components/ui/Loader";

interface Photo {
  _id: string;
  imageUrl: string;
  publicId: string;
  title?: string;
  description?: string;
  views: number;
  width?: number;
  height?: number;
  createdAt: string;
}

interface PageData {
  data: Photo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

const fetchPhotos = async ({ pageParam = 1 }): Promise<PageData> => {
  const response = await axiosPublic.get(
    `/api/photography?page=${pageParam}&limit=20`,
  );
  return response.data;
};

const incrementView = async (id: string) => {
  await axiosPublic.post(`/api/photography/${id}/view`);
};

// Helper function to calculate time ago
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const viewMutation = useMutation({
    mutationFn: incrementView,
  });

  const photos = data?.pages.flatMap((page) => page.data) ?? [];

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    viewMutation.mutate(photo._id);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-2xl text-red-500 mb-4">
            ❌ Failed to load gallery
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  refetch();

  return (
    <>
      <div className="min-h-screen py-8 px-4 pt-24 ">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 ">
              Photo Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {photos.length} beautiful moment{photos.length !== 1 ? "s" : ""}{" "}
              captured
            </p>
          </motion.div>

          {photos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="text-8xl mb-6">📸</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Photos Yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                Start building your gallery by uploading photos!
              </p>
            </motion.div>
          ) : (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {photos.map((photo, index) => {
                  return (
                    <motion.div
                      key={photo._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="relative w-full">
                        <motion.img
                          src={photo.imageUrl}
                          alt={photo.title || `Photo ${index + 1}`}
                          className="w-full h-auto object-cover rounded-xl"
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.3 }}
                          loading="lazy"
                        />

                        {/* Overlay with info */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 rounded-xl"
                        >
                          {photo.title && (
                            <p className="text-white font-semibold mb-2 truncate">
                              {photo.title}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-white text-sm">
                            <div className="flex items-center gap-2">
                              <IoEyeOutline size={18} />
                              <span className="font-semibold">
                                {photo.views ? photo.views : 0} views
                              </span>
                            </div>
                            <span className="text-xs opacity-70">
                              {getTimeAgo(photo.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {data && data.pages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center items-center gap-2 mt-12 flex-wrap"
                >
                  {/* Previous Button */}
                  <motion.button
                    onClick={() => {
                      if (data.pages.length > 1) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    disabled={data.pages.length === 1 || isFetchingNextPage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Previous
                  </motion.button>

                  {/* Page Numbers */}
                  {data.pages.map((_, index) => {
                    const pageNum = index + 1;
                    const totalPages =
                      data.pages[data.pages.length - 1].pagination.pages;
                    const currentPage = data.pages.length;

                    // Show first page, last page, current page, and adjacent pages
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1;

                    const showEllipsisBefore =
                      pageNum === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      pageNum === currentPage + 2 &&
                      currentPage < totalPages - 2;

                    return (
                      <div key={pageNum} className="flex items-center gap-2">
                        {showEllipsisBefore && (
                          <span className="px-2 text-gray-400 dark:text-gray-600">
                            ...
                          </span>
                        )}

                        {showPage && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                              pageNum === currentPage
                                ? "bg-[#0C0D12] dark:bg-[#E9EBED] text-[#E9EBED] dark:text-[#0C0D12]"
                                : "bg-[#0C0D12] dark:bg-[#E9EBED] text-[#E9EBED] dark:text-[#0C0D12]"
                            }`}
                            disabled={isFetchingNextPage}
                          >
                            {pageNum}
                          </motion.button>
                        )}

                        {showEllipsisAfter && (
                          <span className="px-2 text-gray-400 dark:text-gray-600">
                            ...
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Show ellipsis and last page if more pages exist */}
                  {hasNextPage && (
                    <>
                      <span className="px-2 text-gray-400 dark:text-gray-600">
                        ...
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-lg font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:shadow-lg transition-all"
                        disabled
                      >
                        {data.pages[data.pages.length - 1].pagination.pages}
                      </motion.button>
                    </>
                  )}

                  {/* Next Button */}
                  <motion.button
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-[#0C0D12] dark:bg-[#E9EBED] text-[#E9EBED] dark:text-[#0C0D12] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      "Next"
                    )}
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal with Glassmorphic Backdrop */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Glassmorphic Background Layer */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl border border-white/20"
            >
              <IoCloseOutline size={28} />
            </motion.button>

            {/* Image Container with Glass Effect */}
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-7xl max-h-[90vh] mx-auto z-10"
            >
              {/* Glass border container */}
              <div className="relative p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title || "Photo"}
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                />

                {/* Photo Info Overlay */}
                {(selectedPhoto.title || selectedPhoto.description) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md rounded-b-xl"
                  >
                    {selectedPhoto.title && (
                      <h3 className="text-white text-xl font-bold mb-2">
                        {selectedPhoto.title}
                      </h3>
                    )}
                    {selectedPhoto.description && (
                      <p className="text-white/90 text-sm">
                        {selectedPhoto.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-white/70 text-sm">
                      <div className="flex items-center gap-2">
                        <IoEyeOutline size={18} />
                        <span>
                          {selectedPhoto.views ? selectedPhoto.views : 0} views
                        </span>
                      </div>
                      <span>•</span>
                      <span>{getTimeAgo(selectedPhoto.createdAt)}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
