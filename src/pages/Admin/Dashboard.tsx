import type React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { axiosPublic } from "../../hooks/axiosPublic";
import {
  FileText,
  FolderOpen,
  TrendingUp,
  Eye,
  Share2,
  MessageSquare,
} from "lucide-react";
import Loader from "../../components/ui/Loader";

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleRes {
  _id: string;
  title: string;
  description: string;
  img: { url: string; publicId: string };
  category: { _id: string; name: string; slug: string };
  views: number;
  shares: number;
  createdAt: string;
  timeAgo: string;
  comments: number;
}

interface DashboardStats {
  totalArticles: number;
  totalCategories: number;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  recentArticles: number;
  popularCategory: string;
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const Dashboard = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["dashboard-categories"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/categories");
      return data;
    },
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["dashboard-articles"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/api/articles?limit=1000");
      return data;
    },
  });

  // Calculate statistics
  const calculateStats = (): DashboardStats => {
    const articles: ArticleRes[] = articlesData?.data || [];
    const categories: Category[] = categoriesData?.data || [];

    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalShares = articles.reduce((sum, a) => sum + (a.shares || 0), 0);
    const totalComments = articles.reduce(
      (sum, a) => sum + (a.comments || 0),
      0,
    );

    // Recent articles (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentArticles = articles.filter(
      (a) => new Date(a.createdAt) > sevenDaysAgo,
    ).length;

    // Most popular category by article count
    const categoryCount: Record<string, number> = {};
    articles.forEach((a) => {
      const slug = a.category?.slug || "";
      categoryCount[slug] = (categoryCount[slug] || 0) + 1;
    });

    let popularCategory = "N/A";
    if (Object.keys(categoryCount).length > 0) {
      const popularSlug = Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b,
      );
      const cat = categories.find((c) => c.slug === popularSlug);
      popularCategory = cat?.name || popularSlug;
    }

    return {
      totalArticles: articles.length,
      totalCategories: categories.length,
      totalViews,
      totalShares,
      totalComments,
      recentArticles,
      popularCategory,
    };
  };

  const stats = calculateStats();
  const isLoading = articlesLoading || categoriesLoading;

  const statCards: StatCard[] = [
    {
      title: "Total Articles",
      value: stats.totalArticles,
      icon: FileText,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Total Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Total Shares",
      value: stats.totalShares.toLocaleString(),
      icon: Share2,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Total Comments",
      value: stats.totalComments.toLocaleString(),
      icon: MessageSquare,
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Recent Articles",
      value: stats.recentArticles,
      subtitle: "Last 7 days",
      icon: TrendingUp,
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      borderColor: "border-cyan-500/20",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-800">
      <main className="flex-1  overflow-auto">
        <div className="container mx-auto">
          <motion.div
            className="mb-8 mt-12 lg:mt-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening today.
            </p>
          </motion.div>

          {isLoading && <Loader />}

          {!isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={`bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border ${stat.borderColor} hover:shadow-lg transition-all duration-300 flex justify-between items-center`}
                    >
                      <div className="">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}
                          >
                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {stat.title}
                        </h3>
                        {stat.subtitle && (
                          <p className="text-xs text-gray-500">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>
                      <p
                        className={`text-7xl font-bold ${stat.iconColor} mb-1 opacity-20`}
                      >
                        {stat.value}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Most Popular Category
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <FolderOpen className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.popularCategory}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Category with most articles
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Engagement Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Avg. Views per Article
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.totalArticles > 0
                          ? Math.round(stats.totalViews / stats.totalArticles)
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Avg. Shares per Article
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.totalArticles > 0
                          ? Math.round(stats.totalShares / stats.totalArticles)
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Articles per Category
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.totalCategories > 0
                          ? Math.round(
                              stats.totalArticles / stats.totalCategories,
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Content Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalArticles}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total Articles
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total Views
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalShares.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total Shares
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.totalComments.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total Comments
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
