import { useEffect } from "react";
import Hero from "../Hero/Hero";
import UpDown from "../ui/UpDown";
import Notice from "../../pages/Notice/Notice";
import Principal from "../Intro/Principal";
import NoticeBoard from "../../pages/Notice/NoticeBoard";
import VicePrincipal from "../Intro/VicePrincipal";
import AmaderKotha from "../Intro/AmaderKotha";
import Teacher from "../Teachers/Teacher";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="">
      <Hero />
      <Notice />
      <NoticeBoard />
      <AmaderKotha />
      <Principal />
      <VicePrincipal />
      <Teacher />

      <div className="fixed bottom-5 right-5 z-50">
        <UpDown />
      </div>
    </div>
  );
};

export default Home;
