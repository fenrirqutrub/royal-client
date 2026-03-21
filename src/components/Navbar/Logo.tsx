// Logo.tsx
import type { FC } from "react";

interface LogoProps {
  onClick?: () => void;
  altText?: string;
  className?: string;
}

const Logo: FC<LogoProps> = ({
  onClick,
  altText = "রয়েল একাডেমি",
  className,
}) => {
  const content = (
    <span
      className={`font-bold text-2xl text-[var(--color-text)] bangla ${className ?? ""}`}
    >
      {altText}
    </span>
  );

  if (!onClick) return content;

  return (
    <button
      onClick={onClick}
      className="cursor-pointer flex-shrink-0 outline-none px-3 py-1.5 rounded-lg transition-colors duration-200 hover:bg-[var(--color-active-bg)] active:opacity-70"
      aria-label={altText}
    >
      {content}
    </button>
  );
};

export default Logo;
