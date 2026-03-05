import { useMemo } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { PaginationProps } from "../../types/Article.types";

// ────────────────────── REUSABLE PAGINATION COMPONENT ──────────────────────

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pageNumbers = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (currentPage <= 3) return i + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
      return currentPage - 2 + i;
    });
  }, [currentPage, totalPages]);

  const linkBase =
    "inline-flex h-10 items-center justify-center rounded stroke-slate-700 px-4 text-sm font-medium text-slate-700 transition duration-300 hover:bg-emerald-50 hover:stroke-emerald-500 hover:text-emerald-500 focus:bg-emerald-50 focus:stroke-emerald-600 focus:text-emerald-600 focus-visible:outline-none dark:stroke-slate-300 dark:text-slate-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 dark:focus:bg-emerald-900/30 dark:focus:text-emerald-400";

  const activeLink =
    "inline-flex h-10 items-center justify-center whitespace-nowrap rounded bg-emerald-500 px-4 text-sm font-medium text-white ring-offset-2 transition duration-300 hover:bg-emerald-600 focus:bg-emerald-700 focus-visible:outline-none";

  const arrowBase =
    "inline-flex h-10 items-center justify-center gap-4 rounded stroke-slate-700 px-4 text-sm font-medium text-slate-700 transition duration-300 hover:bg-emerald-50 hover:stroke-emerald-500 hover:text-emerald-500 focus:bg-emerald-50 focus:stroke-emerald-600 focus:text-emerald-600 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 dark:stroke-slate-300 dark:text-slate-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400";

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="mt-8 sm:mt-12"
    >
      <ul className="flex list-none items-center justify-center text-sm text-slate-700 md:gap-1">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className={arrowBase}
          >
            <span className="order-2 md:sr-only">Prev</span>
            <IoChevronBack className="-mx-1 h-4 w-4" />
          </button>
        </li>

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              aria-label={
                page === currentPage
                  ? `Current Page, Page ${page}`
                  : `Go to page ${page}`
              }
              aria-current={page === currentPage ? "page" : undefined}
              className={`hidden md:inline-flex ${page === currentPage ? activeLink : linkBase}`}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className={arrowBase}
          >
            <span className="md:sr-only">Next</span>
            <IoChevronForward className="-mx-1 h-4 w-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
