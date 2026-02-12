"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    label?: string;
    placeholder?: string;
    icon?: LucideIcon;
}

export default function SearchableSelect({
    value,
    onChange,
    options,
    required = false,
    label = "Select",
    placeholder = "Search or type...",
    icon: Icon,
}: SearchableSelectProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click and commit typed value
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                if (query.trim() && !value) {
                    onChange(query.trim());
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [query, value, onChange]);

    const filteredOptions = query.length > 0
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(query.toLowerCase())
        )
        : options;

    const handleSelect = useCallback(
        (val: string) => {
            onChange(val);
            setQuery("");
            setIsOpen(false);
        },
        [onChange]
    );

    const selectedLabel = options.find((o) => o.value === value)?.label || value;

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
                    {Icon ? (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    ) : (
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    )}
                    <span className="flex-1 truncate">{selectedLabel}</span>
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
                    {Icon ? (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    ) : (
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => {
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
                                <div className="max-h-40 overflow-y-auto">
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map((opt) => (
                                            <button
                                                type="button"
                                                key={opt.value}
                                                onClick={() => handleSelect(opt.value)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors border-b border-gray-700/50 last:border-0"
                                            >
                                                {opt.label}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-3 px-4">
                                            <p className="text-gray-500 text-sm">
                                                No match — your typed value will be used
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
