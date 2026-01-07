"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  User,
  UserPlus,
  Crown,
  Shield,
  Users,
  X,
  Loader2,
  Search,
  ChevronDown,
} from "lucide-react";

interface SearchUser {
  id: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image: string | null;
  slug: string | null;
  headline?: string | null;
}

interface CompanyMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email?: string | null;
    image: string | null;
    slug: string | null;
    headline?: string | null;
  };
}

interface CompanyMembersProps {
  companyId: string;
  members: CompanyMember[];
  isOwner: boolean;
  isAdmin: boolean;
  originalOwnerId: string;
}

const roleLabels = {
  OWNER: { label: "Owner", icon: Crown, color: "text-amber-400" },
  ADMIN: { label: "Admin", icon: Shield, color: "text-blue-400" },
  MEMBER: { label: "Member", icon: Users, color: "text-zinc-400" },
};

export function CompanyMembers({
  companyId,
  members,
  isOwner,
  isAdmin,
  originalOwnerId,
}: CompanyMembersProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canManageMembers = isOwner || isAdmin;

  // Get IDs of existing members to filter them out of search results
  const existingMemberIds = useMemo(() => members.map((m) => m.user.id), [members]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          // Filter out existing members
          const filteredUsers = data.users.filter(
            (user: SearchUser) => !existingMemberIds.includes(user.id)
          );
          setSearchResults(filteredUsers);
          setShowDropdown(filteredUsers.length > 0);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, existingMemberIds]);

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/companies/${companyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add member");
      }

      setSelectedUser(null);
      setSearchQuery("");
      setRole("MEMBER");
      setShowAddForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setUpdatingMemberId(memberId);

    try {
      const response = await fetch(`/api/companies/${companyId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      router.refresh();
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    setUpdatingMemberId(memberId);

    try {
      const response = await fetch(
        `/api/companies/${companyId}/members?memberId=${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      router.refresh();
    } catch (err) {
      console.error("Error removing member:", err);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Member list */}
      <div className="space-y-3">
        {members.map((member) => {
          const RoleIcon = roleLabels[member.role].icon;
          const isOriginalOwner = member.user.id === originalOwnerId;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-white/5"
            >
              <div className="flex items-center gap-3">
                {member.user.slug ? (
                  <Link href={`/${member.user.slug}`}>
                    {member.user.image ? (
                      <Image
                        src={member.user.image}
                        alt={member.user.name || "Member"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}
                  </Link>
                ) : member.user.image ? (
                  <Image
                    src={member.user.image}
                    alt={member.user.name || "Member"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    {member.user.slug ? (
                      <Link
                        href={`/${member.user.slug}`}
                        className="font-medium text-white hover:text-orange-400 transition-colors"
                      >
                        {member.user.name || "Unknown"}
                      </Link>
                    ) : (
                      <span className="font-medium text-white">
                        {member.user.name || "Unknown"}
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        roleLabels[member.role].color
                      )}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleLabels[member.role].label}
                    </span>
                  </div>
                  {member.user.headline && (
                    <p className="text-sm text-zinc-500">{member.user.headline}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {canManageMembers && !isOriginalOwner && (
                <div className="flex items-center gap-2">
                  {updatingMemberId === member.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  ) : (
                    <>
                      {/* Role dropdown */}
                      <div className="relative">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="appearance-none bg-zinc-700/50 border border-white/10 rounded-lg px-3 py-1.5 pr-8 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                          <option value="OWNER">Owner</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove member"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add member form */}
      {canManageMembers && (
        <div>
          {showAddForm ? (
            <form onSubmit={handleAddMember} className="space-y-3">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Selected user display */}
              {selectedUser ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-orange-500/30">
                  <div className="flex items-center gap-3">
                    {selectedUser.image ? (
                      <Image
                        src={selectedUser.image}
                        alt={selectedUser.name || "User"}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-4 w-4 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">
                        {selectedUser.name || selectedUser.firstName || "Unknown"}
                      </p>
                      {selectedUser.slug && (
                        <p className="text-xs text-zinc-400">@{selectedUser.slug}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Search input with autocomplete */
                <div ref={searchRef} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    className="input pl-10 py-2 text-sm w-full"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 animate-spin" />
                  )}

                  {/* Search results dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 shadow-xl max-h-60 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                        >
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
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
                            <p className="font-medium text-white text-sm truncate">
                              {user.name || user.firstName || "Unknown"}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">
                              {user.slug ? `@${user.slug}` : ""}
                              {user.headline && user.slug ? " · " : ""}
                              {user.headline || ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showDropdown && searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 shadow-xl p-3 text-sm text-zinc-400 text-center">
                      No builders found
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
                    className="appearance-none bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    {isOwner && <option value="OWNER">Owner</option>}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedUser}
                  className="btn-primary text-sm py-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedUser(null);
                    setSearchQuery("");
                    setError("");
                  }}
                  className="btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-zinc-500">
                Search for builders by their username or name
              </p>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-secondary text-sm"
            >
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </button>
          )}
        </div>
      )}
    </div>
  );
}
