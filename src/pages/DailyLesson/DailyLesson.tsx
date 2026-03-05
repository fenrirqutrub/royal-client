import ClassTabs from "../../components/common/ClassTabs";
import DailyLessonCard from "./DailyLessonCard";

const DailyLesson = () => {
  return (
    <main className="">
      <header>
        <h2 className="font-bold text-center uppercase py-3 text-4xl">
          DailyLesson Page
        </h2>
        <ClassTabs />
      </header>
      <section className="mt-10">
        <DailyLessonCard />
      </section>
    </main>
  );
};

export default DailyLesson;
