import { motion } from "framer-motion";
import { FaCalendarAlt, FaBookOpen } from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";

const DailyLessonCard = () => {
  return (
    <main className="flex items-center gap-5 flex-col md:flex-row ">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="relative group w-full  mx-auto"
      >
        {/* gradient glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition"></div>

        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-white/30 dark:border-neutral-700 rounded-2xl shadow-xl p-5 sm:p-7 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 dark:border-neutral-700 pb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FaCalendarAlt className="text-blue-500" />
              <span className="text-sm sm:text-base">05-03-2026</span>
            </div>

            {/* Class */}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Thursday
              </span>
            </div>

            <span className="w-fit text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow">
              Class 9
            </span>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Subject */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                <FaBookOpen className="text-green-600 text-lg" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                Bangla 1st Paper
              </h2>
            </div>

            {/* Topic */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                <HiOutlineAcademicCap className="text-orange-600 text-lg" />
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam
                corporis eos tenetur minus asperiores alias saepe adipisci esse
                ipsam voluptas praesentium rerum tempore soluta dolorum ipsum
                quaerat officia unde temporibus.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="relative group w-full mx-auto"
      >
        {/* gradient glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition"></div>

        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border border-white/30 dark:border-neutral-700 rounded-2xl shadow-xl p-5 sm:p-7 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 dark:border-neutral-700 pb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <FaCalendarAlt className="text-blue-500" />
              <span className="text-sm sm:text-base">05-03-2026</span>
            </div>

            {/* Class */}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Thursday
              </span>
            </div>

            <span className="w-fit text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow">
              Class 9
            </span>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Subject */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                <FaBookOpen className="text-green-600 text-lg" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                Bangla 1st Paper
              </h2>
            </div>

            {/* Topic */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                <HiOutlineAcademicCap className="text-orange-600 text-lg" />
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam
                corporis eos tenetur minus asperiores alias saepe adipisci esse
                ipsam voluptas praesentium rerum tempore soluta dolorum ipsum
                quaerat officia unde temporibus.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default DailyLessonCard;
