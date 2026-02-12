"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  Search,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CollegeSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export default function CollegeSearchInput({
  value,
  onChange,
  required = false,
  label = "College/University/School Name",
  placeholder = "Search or type your college name...",
}: CollegeSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click and commit typed value
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        // If user typed something but didn't select from dropdown, use what they typed
        if (query.trim() && !value) {
          onChange(query.trim());
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, value, onChange]);

  // Debounced search
  useEffect(() => {
    if (!isOpen && !query) return;

    const timer = setTimeout(async () => {
      if (query.length < 2) {
        // Fetch default list
        try {
          setLoading(true);
          const res = await fetch("/api/colleges");
          const data = await res.json();
          setResults(data.colleges || []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/colleges?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.colleges || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = useCallback(
    (collegeName: string) => {
      onChange(collegeName);
      setQuery("");
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = () => {
    onChange("");
    setQuery("");
  };

  return (
    <div className="space-y-1 relative z-[100]" ref={containerRef}>
      <label className="text-white text-sm font-medium">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>

      {/* Selected Value Display */}
      {value ? (
        <div className="flex items-center gap-2 w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-cyan-500/50 rounded-lg text-white text-sm relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <span className="flex-1 truncate">{value}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* Search input - user can type freely */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Short delay to allow dropdown clicks to register
              setTimeout(() => {
                if (query.trim() && !value) {
                  onChange(query.trim());
                }
              }, 200);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-8 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
          />
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-[9999] w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl shadow-black/50 flex flex-col"
              >
                {/* Scrollable results */}
                <div className="max-h-40 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2
                        size={18}
                        className="text-cyan-400 animate-spin"
                      />
                    </div>
                  ) : results.length > 0 ? (
                    results.map((college) => (
                      <button
                        type="button"
                        key={college}
                        onClick={() => handleSelect(college)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors border-b border-gray-700/50 last:border-0"
                      >
                        {college}
                      </button>
                    ))
                  ) : query.length >= 2 ? (
                    <div className="py-3 px-4">
                      <p className="text-gray-500 text-sm">
                        No match found — your typed name will be used
                      </p>
                    </div>
                  ) : (
                    <div className="py-3 px-4">
                      <p className="text-gray-500 text-sm">
                        Type to search or enter your college name...
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
