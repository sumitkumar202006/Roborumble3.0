"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  Search,
  Loader2,
  Plus,
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
  label = "College / University",
  placeholder = "Search your college...",
}: CollegeSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const [otherError, setOtherError] = useState("");
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setShowOtherInput(false);
    },
    [onChange],
  );

  const handleOtherClick = () => {
    setShowOtherInput(true);
    setIsOpen(false);
    setOtherError("");
    setOtherValue("");
  };

  const handleOtherSubmit = async () => {
    const trimmed = otherValue.trim();

    if (trimmed.length < 4) {
      setOtherError("Please enter the full college name");
      return;
    }

    if (trimmed.length < 10 && /^[A-Z]+$/.test(trimmed)) {
      setOtherError("Please enter the full name, not an abbreviation");
      return;
    }

    setSaving(true);
    setOtherError("");

    try {
      const res = await fetch("/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOtherError(data.error || "Failed to add college");
        return;
      }

      // Select the newly added college
      handleSelect(data.name);
      setShowOtherInput(false);
      setOtherValue("");
    } catch {
      setOtherError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setShowOtherInput(false);
    setOtherValue("");
  };

  return (
    <div className="space-y-1 relative z-[100]" ref={containerRef}>
      <label className="text-white text-sm font-medium">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>

      {/* Selected Value Display */}
      {value && !showOtherInput ? (
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
      ) : showOtherInput ? (
        /* "Other" input mode */
        <div className="space-y-2">
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={otherValue}
              onChange={(e) => {
                setOtherValue(e.target.value);
                setOtherError("");
              }}
              placeholder="Enter your full college name..."
              className="w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleOtherSubmit();
                }
              }}
            />
          </div>
          {otherError && <p className="text-red-400 text-xs">{otherError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOtherSubmit}
              disabled={saving || !otherValue.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {saving ? "Adding..." : "Add College"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOtherInput(false);
                setOtherValue("");
                setOtherError("");
              }}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-gray-500 text-xs">
            ⚠️ Please enter the full college name without abbreviations
          </p>
        </div>
      ) : (
        /* Search input */
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
                className="absolute z-[9999] w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl shadow-black/50 flex flex-col"
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
                        No colleges found for &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="py-3 px-4">
                      <p className="text-gray-500 text-sm">
                        Type to search colleges...
                      </p>
                    </div>
                  )}
                </div>
                {/* Always-visible sticky footer */}
                <button
                  type="button"
                  onClick={handleOtherClick}
                  className="w-full text-left px-4 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2 border-t border-gray-600 shrink-0"
                >
                  <Plus size={14} />
                  My college is not listed
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
