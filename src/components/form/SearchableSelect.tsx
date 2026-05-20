import { useEffect, useRef, useState } from "react";

interface SearchableSelectOption {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  nullLabel?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccione...",
  nullLabel,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync search input when value changes or options load
  useEffect(() => {
    const selectedOption = options.find((o) => o.value === value);
    setSearchTerm(selectedOption ? selectedOption.label : "");
  }, [value, options]);

  // Click outside listener to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset the search query to show the selected label
        const selectedOption = options.find((o) => o.value === value);
        setSearchTerm(selectedOption ? selectedOption.label : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value, options]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {nullLabel && (
            <div
              className="cursor-pointer rounded-md px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
              onClick={() => {
                onChange(null);
                setSearchTerm("");
                setIsOpen(false);
              }}
            >
              <em>{nullLabel}</em>
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 italic">
              No se encontraron resultados
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer rounded-md px-4 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-white/5 ${
                  option.value === value
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-medium"
                    : "text-gray-800 dark:text-gray-200"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
