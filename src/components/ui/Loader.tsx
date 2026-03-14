import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader = ({ fullScreen = true }: LoaderProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex justify-center items-center
        ${fullScreen ? "min-h-screen flex " : "py-10"}
      `}
    >
      <LoaderCircle className="text-primary  w-10 h-10 animate-spin" />
    </div>
  );
};

export default Loader;
