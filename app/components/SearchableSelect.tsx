"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown, Plus, Loader2 } from "lucide-react";
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
    allowOther?: boolean;
    otherLabel?: string;
}

export default function SearchableSelect({
    value,
    onChange,
    options,
    required = false,
    label = "Select",
    placeholder = "Search...",
    icon: Icon,
    allowOther = true,
    otherLabel = "Other option not listed",
}: SearchableSelectProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherValue, setOtherValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            setShowOtherInput(false);
        },
        [onChange]
    );

    const selectedLabel = options.find((o) => o.value === value)?.label || value;

    const handleClear = () => {
        onChange("");
        setQuery("");
        setShowOtherInput(false);
        setOtherValue("");
    };

    const handleOtherSubmit = () => {
        const trimmed = otherValue.trim();
        if (!trimmed) return;
        handleSelect(trimmed);
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
                <div className="flex items-center gap-2 w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border border-cyan-500/50 rounded-lg text-white text-sm relative">
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
            ) : showOtherInput ? (
                <div className="space-y-2">
                    <div className="relative">
                        {Icon ? (
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        ) : (
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        )}
                        <input
                            type="text"
                            value={otherValue}
                            onChange={(e) => setOtherValue(e.target.value)}
                            placeholder="Type your option..."
                            className="w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleOtherSubmit();
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleOtherSubmit}
                            disabled={!otherValue.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                        >
                            <Plus size={14} />
                            Confirm
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowOtherInput(false);
                                setOtherValue("");
                            }}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* Search input */
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
                        placeholder={placeholder}
                        className="w-full pl-10 pr-8 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
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
                                                No options found
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {allowOther && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOtherInput(true);
                                            setIsOpen(false);
                                            setOtherValue("");
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2 border-t border-gray-600 shrink-0"
                                    >
                                        <Plus size={14} />
                                        {otherLabel}
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
