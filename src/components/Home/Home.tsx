import { useEffect } from "react";
import Hero from "../Hero/Hero";
import UpDown from "../ui/UpDown";
import Notice from "../../pages/Notice/Notice";
import NoticeBoard from "../../pages/Notice/NoticeBoard";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <Hero />
      <Notice />
      <NoticeBoard />

      <div className="fixed bottom-5 right-5 z-50">
        <UpDown />
      </div>
    </div>
  );
};

export default Home;
