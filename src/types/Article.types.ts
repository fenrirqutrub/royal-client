// ────────────────────── SHARED TYPES ──────────────────────
// types/Article.types.ts

export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseArticle {
  _id: string;
  title: string;
  author?: string;
  description: string;
  slug: string;
  uniqueId: string;
  imgUrl: string;
  // ✅ category can be a plain string (id/slug) OR a populated Category object
  category: string | Category;
  createdAt: string;
  updatedAt?: string;
  timeAgo?: string;
  views?: number;
  comments?: number;
}

export interface Comment {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  article?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  totalComments?: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export interface ArticleCardProps {
  article: BaseArticle;
  categoryPath: string;
}
