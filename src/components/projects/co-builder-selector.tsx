"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { User, X, Search, Users, Loader2 } from "lucide-react";

export interface CoBuilder {
  id: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image: string | null;
  slug: string | null;
  headline?: string | null;
}

interface CoBuilderSelectorProps {
  selectedCoBuilders: CoBuilder[];
  onChange: (coBuilders: CoBuilder[]) => void;
  maxCoBuilders?: number;
}

export function CoBuilderSelector({
  selectedCoBuilders,
  onChange,
  maxCoBuilders = 5,
}: CoBuilderSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CoBuilder[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await response.json();

        // Filter out already selected users
        const selectedIds = new Set(selectedCoBuilders.map(u => u.id));
        const filteredResults = (data.users || []).filter(
          (user: CoBuilder) => !selectedIds.has(user.id)
        );

        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCoBuilders]);

  const addCoBuilder = (user: CoBuilder) => {
    if (selectedCoBuilders.length >= maxCoBuilders) return;

    onChange([...selectedCoBuilders, user]);
    setSearchQuery("");
    setSearchResults([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const removeCoBuilder = (userId: string) => {
    onChange(selectedCoBuilders.filter(u => u.id !== userId));
  };

  const getDisplayName = (user: CoBuilder) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || "Unknown User";
  };

  return (
    <div className="space-y-3">
      {/* Selected Co-Builders */}
      {selectedCoBuilders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCoBuilders.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1.5"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={getDisplayName(user)}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-3 w-3 text-zinc-400" />
                </div>
              )}
              <span className="text-sm text-orange-300">{getDisplayName(user)}</span>
              <button
                type="button"
                onClick={() => removeCoBuilder(user.id)}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      {selectedCoBuilders.length < maxCoBuilders && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search users to add as co-builders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="input pl-11 pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 animate-spin" />
            )}
          </div>

          {/* Dropdown Results */}
          {isDropdownOpen && (searchResults.length > 0 || (searchQuery.length >= 2 && !isSearching)) && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-xl overflow-hidden">
              {searchResults.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto py-2">
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => addCoBuilder(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
                      >
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={getDisplayName(user)}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                            <User className="h-4 w-4 text-zinc-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {getDisplayName(user)}
                          </div>
                          {user.slug && (
                            <div className="text-xs text-zinc-500 truncate">
                              @{user.slug}
                            </div>
                          )}
                          {user.headline && (
                            <div className="text-xs text-zinc-500 truncate mt-0.5">
                              {user.headline}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="px-4 py-6 text-center text-sm text-zinc-500">
                  No users found matching &quot;{searchQuery}&quot;
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-zinc-500 flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" />
        {selectedCoBuilders.length}/{maxCoBuilders} co-builders selected
      </p>
    </div>
  );
}
