import React, { useEffect, useState, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";

type ContentType = "articles" | "categories" | "photos" | "quotes" | "heroes";

interface ContentOption {
  id: ContentType;
  label: string;
}

interface ContentTypeSelectProps {
  selectedType: ContentType;
  onSelectType: (type: ContentType) => void;
}

const ContentTypeSelect: React.FC<ContentTypeSelectProps> = ({
  selectedType,
  onSelectType,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: ContentOption[] = [
    { id: "articles", label: "Manage Articles" },
    { id: "photos", label: "Manage Photos" },
    { id: "categories", label: "Manage Categories" },
    { id: "quotes", label: "Manage Quotes" },
    { id: "heroes", label: "Manage Heros" },
  ];

  const filteredItems = options.filter((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const isSelected = (item: ContentOption): boolean => {
    return selectedType === item.id;
  };

  const toggleItem = (item: ContentOption): void => {
    onSelectType(item.id);
    setSearchValue("");
    setIsOpenDropdown(false);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
        setIsFocused(false);
      }
    };
    if (isOpenDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenDropdown]);

  useEffect(() => {
    if (!isOpenDropdown) setSearchValue("");
  }, [isOpenDropdown]);

  const currentOption = options.find((opt) => opt.id === selectedType);
  const displayValue = currentOption?.label || "Select Content Type";

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger button */}
      <div
        onClick={() => {
          setIsOpenDropdown((prev) => !prev);
          setIsFocused((prev) => !prev);
        }}
        className={`relative flex items-center h-12 px-4 pr-10 rounded-xl border cursor-pointer
          transition-all duration-200 bg-white dark:bg-[#0D0E14]
          ${
            isFocused || isOpenDropdown
              ? "border-emerald-400 dark:border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              : "border-slate-200 dark:border-slate-700 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
          }`}
      >
        {/* Show search input when open, display label when closed */}
        {isOpenDropdown ? (
          <input
            type="text"
            autoFocus
            placeholder="Search content types..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
        ) : (
          <span className="text-sm truncate text-gray-900 dark:text-gray-200 font-medium">
            {displayValue}
          </span>
        )}

        {/* Arrow icon */}
        <IoIosArrowDown
          className={`absolute right-3 text-lg text-gray-400 dark:text-gray-500 pointer-events-none
            transition-transform duration-200 ${isOpenDropdown ? "rotate-180" : "rotate-0"}`}
        />

        {/* Floating label */}
        {(isFocused || isOpenDropdown) && (
          <div
            className="absolute -top-2.5 left-4 px-1.5 text-xs font-medium rounded
            bg-white dark:bg-[#0D0E14] text-emerald-600 dark:text-emerald-400"
          >
            Content Type
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpenDropdown && (
        <div
          className="absolute left-0 w-full mt-1.5 border border-slate-200 dark:border-slate-700
          rounded-xl bg-white dark:bg-[#0D0E14] shadow-xl z-20 max-h-56 overflow-auto
          divide-y divide-slate-100 dark:divide-slate-800"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm
                transition-colors duration-150
                ${
                  isSelected(item)
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              role="option"
              aria-selected={isSelected(item)}
            >
              <IoCheckmark
                className={`text-base text-emerald-500 transition-all duration-200 shrink-0
                  ${isSelected(item) ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
              No content type found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentTypeSelect;
