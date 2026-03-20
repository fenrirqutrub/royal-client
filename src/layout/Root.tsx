import { Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import Contact from "../components/Contact/Contact";

const Root = () => {
  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)] ">
      <div className="container mx-auto">
        <Navbar />
        <div className="pt-2 md:pt-20 px-3 md:px-0">
          <Outlet />
        </div>
        <Contact />
      </div>
    </div>
  );
};

export default Root;
