import { Outlet } from "react-router";
import Navbar from "../components/Navbar/Navbar";
import Contact from "../components/Contact/Contact";

const Root = () => {
  return (
    <div className="bg-bgPrimary text-textPrimary">
      <div className="container mx-auto">
        <Navbar />
        <div className="mt-20">
          <Outlet />
        </div>
        <Contact />
      </div>
    </div>
  );
};

export default Root;
