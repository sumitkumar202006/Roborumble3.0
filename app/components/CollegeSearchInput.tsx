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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 relative z-[100]" ref={containerRef}>
      <label className="text-white text-sm font-medium">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>

      <div className="relative">
        <GraduationCap className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${value ? 'text-cyan-400' : 'text-gray-500'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query !== "" ? query : value}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (!isOpen) setIsOpen(true);
            // If user clears input, clear the parent value too
            if (val === "") {
              onChange("");
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // If we have a query, commit it as the value when blurring
            if (query !== "") {
              onChange(query.trim());
              setQuery("");
            }
            // Delay closing to allow dropdown clicks
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-2.5 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
            value ? 'border-cyan-500/50' : 'border-gray-700 focus:border-cyan-500'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

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
    </div>
  );
}
