// src/components/ui/SelectInput.tsx
import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import type { ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectInputProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const SelectInput = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  label,
  required,
  disabled,
  error,
  className = "",
}: SelectInputProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-1.5">
          {label}{" "}
          {required && (
            <span className="text-rose-500 normal-case tracking-normal">*</span>
          )}
        </label>
      )}

      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between gap-2
            bg-white dark:bg-gray-800
            transition-all duration-200
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-rose-400 focus:ring-rose-400"
                : open
                  ? "border-violet-500 ring-2 ring-violet-500"
                  : "border-gray-200 dark:border-gray-700 focus:ring-violet-500"
            }`}
        >
          <span
            className={`flex items-center gap-2 ${
              selected ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
            }`}
          >
            {selected?.icon && (
              <span className="text-base shrink-0">{selected.icon}</span>
            )}
            {selected ? selected.label : placeholder}
          </span>

          <IoChevronDown
            className={`shrink-0 text-gray-400 transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Dropdown */}
        <div
          className={`absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-800 border rounded-xl overflow-hidden
            transition-all duration-200 origin-top
            ${
              open
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto border-gray-200 dark:border-gray-700"
                : "opacity-0 scale-95 -translate-y-1 pointer-events-none border-transparent"
            }`}
          style={{ boxShadow: "0 15px 60px -10px rgba(0,0,0,0.18)" }}
        >
          {options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">
              No options
            </p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors duration-150
                  ${
                    opt.value === value
                      ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                  }`}
              >
                {opt.icon && (
                  <span className="text-base shrink-0">{opt.icon}</span>
                )}
                {opt.label}
              </button>
            ))
          )}
        </div>
      </div>

      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectInput;
