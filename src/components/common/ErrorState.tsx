/**
 * ErrorState.tsx
 * ─────────────────
 * Usage:
 *   <ErrorState message="Something went wrong" />
 *   <ErrorState message="ডেটা লোড হয়নি" />
 */

interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm text-red-500 dark:text-red-400 font-medium">
        {message}
      </p>
    </div>
  );
};

export default ErrorState;
