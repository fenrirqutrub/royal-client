import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
// import Router from "./Router/Router.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeProvider.tsx";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext.tsx";
import ScrollToTopOnReload from "./components/common/ScrollToTopOnReload.tsx";
import { ProfileDrawerProvider } from "./context/ProfileDrawerContext.tsx";
import ProfileDrawer from "./components/Navbar/ProfileDrawer.tsx";
import { ComplainProvider } from "./context/ComplainContext.tsx";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60_000,
      gcTime: 15 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <div className="bangla">
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <ProfileDrawerProvider>
                  <ComplainProvider>
                    <ProfileDrawer />
                    {/* <Router /> */}
                    <div className="flex flex-col items-center justify-center mt-28 w-full">
                      <h2 className="text-xl lg:text-3xl text-red-600">
                        The website is closed by the admin.
                      </h2>
                      <p className="text-lg lg:text-2xl text-gray-400 mt-32">
                        Hotline: 01804558226, 01650033181
                      </p>
                    </div>
                    <ScrollToTopOnReload />
                    <Toaster position="top-center" />
                    <SpeedInsights />
                  </ComplainProvider>
                </ProfileDrawerProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </div>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
);
