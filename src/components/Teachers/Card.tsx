import { motion } from "framer-motion";
import { GiKing } from "react-icons/gi";

const Card = () => {
  return (
    <div className="flex items-center ">
      <div style={{ position: "absolute", zIndex: 2 }}>
        <div
          className="rounded-full overflow-hidden h-[85px] w-[90px]"
          style={{
            clipPath: "inset(0 0 0 0 round 9999px)",
            borderRight: "10px solid rgba(100,100,120,0.18)",
            boxShadow: "10px 0 10px rgba(80,80,100,0.13)",
          }}
        >
          <img
            src="https://res.cloudinary.com/ddsfmccyi/image/upload/v1773575046/avatars/vimt7ioi1jcvjgobwtpo.webp"
            alt="baler pic"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <motion.div className="py-2 ml-10 mx-3 cursor-pointer select-none rounded-[20px_4px_4px_10px] flex flex-row gap-4 w-70 border border-[var(--color-active-border)] bg-white overflow-hidden relative">
        {/* Info */}
        <div className="flex flex-col justify-center gap-1 min-w-0 flex-1 pl-14">
          <h3
            className="font-bold text-base leading-tight truncate bangla"
            style={{ color: "var(--color-text)" }}
          >
            Teacher Name
          </h3>

          <p className="text-sm truncate bangla text-[var(--color-gray)] flex items-center gap-x-1 ">
            <GiKing />
            Teacher
          </p>
          <p className="text-xs truncate bangla text-[var(--color-gray)]">
            "Honours Studying"
          </p>
        </div>

        {/* Slug — top right */}

        <span
          className="absolute top-3 right-3 text-[9px] font-mono tracking-widest opacity-20"
          style={{ color: "var(--color-text)" }}
        >
          T2603
        </span>
      </motion.div>
    </div>
  );
};

export default Card;
