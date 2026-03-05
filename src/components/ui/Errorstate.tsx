import { AlertCircle } from "lucide-react";
import { Link } from "react-router";

interface ErrorStateProps {
  message?: string;
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  fullScreen?: boolean;
}

const ErrorState = ({
  message = "Something went wrong. Please try again later.",
  title = "Oops!",
  showBackButton = false,
  backButtonText = "Go Back",
  backButtonPath = "/",
  fullScreen = false,
}: ErrorStateProps) => {
  return (
    <div
      className={`
        flex items-center justify-center px-4
        ${fullScreen ? "min-h-screen" : "py-12 sm:py-16"}
      `}
    >
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-2 sm:mb-3">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {showBackButton && (
          <Link
            to={backButtonPath}
            className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors duration-300"
          >
            {backButtonText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
