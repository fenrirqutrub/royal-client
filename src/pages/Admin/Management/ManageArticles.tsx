import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Search,
  X,
  ChevronDown,
  LayoutGrid,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import type { BaseArticle } from "../../../types/Article.types";
import axiosPublic from "../../../hooks/axiosPublic";
import { useCategories } from "../../../hooks/useCategories";
import Loader from "../../../components/ui/Loader";
import { Pagination } from "../../../components/common/Pagination";

// ───────────────── TYPES ─────────────────

interface ArticleResponse {
  success: boolean;
  data: BaseArticle[];
  totalPages?: number;
  currentPage?: number;
  total?: number;
}

interface FetchArticlesParams {
  page: number;
  search: string;
  categoryId: string;
}

interface Category {
  _id: string;
  name: string;
}

const ITEMS_PER_PAGE = 12;

// ───────────────── API ─────────────────

const fetchFilteredArticles = async ({
  page,
  search,
  categoryId,
}: FetchArticlesParams): Promise<ArticleResponse> => {
  const params: Record<string, string | number> = {
    page,
    limit: ITEMS_PER_PAGE,
  };
  if (search.trim()) params.search = search.trim();
  if (categoryId) params.category = categoryId;

  const response = await axiosPublic.get<ArticleResponse>("/api/articles", {
    params,
  });

  if (!response.data || !Array.isArray(response.data.data)) {
    throw new Error("Invalid response from server");
  }
  return response.data;
};

const deleteArticle = async (id: string) => {
  const response = await axiosPublic.delete(`/api/articles/${id}`);
  return response.data;
};

// ───────────────── CATEGORY DROPDOWN ─────────────────

interface CategoryDropdownProps {
  categories: Category[];
  selected: string;
  onChange: (value: string) => void;
}

const CategoryDropdown = ({
  categories,
  selected,
  onChange,
}: CategoryDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    categories.find((c) => c._id === selected)?.name ?? "All Categories";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`
          group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium
          border transition-all duration-200 select-none whitespace-nowrap
          ${
            selected
              ? "bg-blue-500/10 border-blue-500/40 text-blue-500"
              : "bg-adminBg border-adminBorder text-adminText hover:border-blue-500/30 hover:text-blue-500"
          }
        `}
      >
        <Tag size={14} className="shrink-0" />
        <span className="max-w-[140px] truncate">{selectedLabel}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-200 text-adminMuted ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="
            absolute top-full left-0 mt-2 z-50 min-w-[190px]
            bg-adminCard border border-adminBorder
            rounded-xl shadow-2xl shadow-black/20 overflow-hidden
          "
          style={{ animation: "dropIn 0.15s ease" }}
        >
          {/* All option */}
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`
              w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
              ${!selected ? "bg-blue-500/10 text-blue-500" : "text-adminText hover:bg-adminBg"}
            `}
          >
            <LayoutGrid size={13} />
            All Categories
          </button>

          <div className="h-px bg-adminBorder mx-3" />

          <div className="max-h-52 overflow-y-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  onChange(cat._id);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
                  ${selected === cat._id ? "bg-blue-500/10 text-blue-500" : "text-adminText hover:bg-adminBg"}
                `}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    selected === cat._id ? "bg-blue-500" : "bg-adminMuted"
                  }`}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ───────────────── SEARCH INPUT ─────────────────

interface SearchInputProps {
  value: string;
  onSearch: (q: string) => void;
  placeholder?: string;
}

const SearchInput = ({
  value,
  onSearch,
  placeholder = "Search…",
}: SearchInputProps) => {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handle = (val: string) => {
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(val), 350);
  };

  return (
    <div className="relative group flex-1 min-w-[200px] max-w-sm">
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adminMuted group-focus-within:text-blue-500 transition-colors duration-200 pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-9 py-2.5 text-sm rounded-xl
          bg-adminBg border border-adminBorder
          text-adminText placeholder:text-adminMuted
          focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10
          transition-all duration-200
        "
      />
      {local && (
        <button
          onClick={() => handle("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-adminMuted hover:text-adminText transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

// ───────────────── FILTER BAR ─────────────────

interface FilterBarProps {
  searchQuery: string;
  onSearch: (q: string) => void;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalArticles: number;
}

const FilterBar = ({
  searchQuery,
  onSearch,
  categories,
  selectedCategory,
  onCategoryChange,
  hasActiveFilters,
  onClearFilters,
  totalArticles,
}: FilterBarProps) => {
  return (
    <div className="space-y-3">
      {/* Main filter row */}
      <div
        className="
          relative flex flex-wrap items-center gap-3
          bg-adminCard border border-adminBorder
          rounded-2xl px-5 py-3.5
        "
      >
        {/* Left accent */}
        <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b from-blue-500/0 via-blue-500/60 to-blue-500/0 rounded-full" />

        {/* Label */}
        <div className="flex items-center gap-2 pl-2 shrink-0">
          <SlidersHorizontal size={14} className="text-adminMuted" />
          <span className="text-xs font-semibold uppercase tracking-widest text-adminMuted hidden sm:block">
            Filter
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-adminBorder hidden sm:block shrink-0" />

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onSearch={onSearch}
          placeholder="Search by title…"
        />

        {/* Category dropdown */}
        <CategoryDropdown
          categories={categories}
          selected={selectedCategory}
          onChange={onCategoryChange}
        />

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="
              flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm shrink-0
              bg-adminBg border border-adminBorder text-adminMuted
              hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5
              transition-all duration-200
            "
          >
            <X size={13} />
            <span className="hidden sm:inline font-medium">Clear</span>
          </button>
        )}

        {/* Count badge */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span
            className={`
              px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums transition-colors
              ${
                hasActiveFilters
                  ? "bg-blue-500/15 text-blue-500"
                  : "bg-adminBg text-adminMuted border border-adminBorder"
              }
            `}
          >
            {totalArticles}
          </span>
          <span className="text-xs text-adminMuted hidden md:inline">
            results
          </span>
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 px-1">
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
              <Search size={10} />
              &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => onSearch("")}
                className="ml-0.5 hover:text-blue-300 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
              <Tag size={10} />
              {categories.find((c) => c._id === selectedCategory)?.name}
              <button
                onClick={() => onCategoryChange("")}
                className="ml-0.5 hover:text-blue-300 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ───────────────── MAIN COMPONENT ─────────────────

export const ManageArticles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const queryClient = useQueryClient();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const {
    data: articlesData,
    isLoading: articlesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["filtered-articles", currentPage, searchQuery, selectedCategory],
    queryFn: () =>
      fetchFilteredArticles({
        page: currentPage,
        search: searchQuery,
        categoryId: selectedCategory,
      }),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success("Article deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["filtered-articles"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete article";
      toast.error(message);
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const confirmDelete = (id: string) => {
    Swal.fire({
      title: "Delete Article?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) handleDelete(id);
    });
  };

  const articles = articlesData?.data ?? [];
  const totalPages = articlesData?.totalPages ?? 1;
  const totalArticles = articlesData?.total ?? articles.length;
  const hasActiveFilters = Boolean(searchQuery || selectedCategory);

  if (categoriesLoading) return <Loader />;

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500 text-sm">
          {error instanceof Error ? error.message : "Failed to load articles"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-adminBg text-adminText px-4 py-8 md:px-8">
      {/* inline keyframe for dropdown */}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-adminText">
          Manage Articles
        </h1>
        <p className="mt-1 text-sm text-adminMuted">
          Search, filter, and manage all published content
        </p>
      </div>

      {/* FILTER BAR */}
      <FilterBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        totalArticles={totalArticles}
      />

      {/* TABLE */}
      <div className="mt-6 rounded-xl border border-adminBorder bg-adminCard overflow-hidden shadow-sm">
        {articlesLoading ? (
          <div className="py-16 flex justify-center">
            <Loader />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-adminMuted text-sm">
            {hasActiveFilters
              ? "No articles match your search or filter."
              : "No articles found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-adminBorder bg-adminBg">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-adminMuted w-12">
                    #
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-adminMuted">
                    Title
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-adminMuted">
                    Photo
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-adminMuted pr-6">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adminBorder">
                {articles.map((article, index) => (
                  <tr
                    key={article._id}
                    className="hover:bg-adminBg/50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4 text-adminMuted tabular-nums">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-5 py-4 font-medium text-adminText max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="px-5 py-4">
                      <img
                        src={article.imgUrl}
                        alt={article.title}
                        className="w-16 h-11 object-cover rounded-md border border-adminBorder"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => confirmDelete(article._id)}
                        className="
                          inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                          bg-red-500/10 text-red-500 border border-red-500/20
                          rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500
                          transition-all duration-150
                        "
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ManageArticles;
