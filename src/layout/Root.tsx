import { Outlet } from "react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import axiosPublic from "../hooks/axiosPublic";

const Root = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["heroes"],
      queryFn: async () => {
        const res = await axiosPublic.get("/api/heroes");
        return res.data;
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)] bangla">
      <div className="container mx-auto">
        <Navbar />
        <div className="pt-2 md:pt-20 px-3 md:px-0">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Root;
