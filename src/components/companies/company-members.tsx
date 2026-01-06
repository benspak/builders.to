"use client";

import { useState } from "react";
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
  Mail,
  ChevronDown,
} from "lucide-react";

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
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const canManageMembers = isOwner || isAdmin;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/companies/${companyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add member");
      }

      setEmail("");
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
                  <Link href={`/profile/${member.user.slug}`}>
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
                        href={`/profile/${member.user.slug}`}
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

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10 py-2 text-sm"
                    required
                  />
                </div>

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
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
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
                    setEmail("");
                    setError("");
                  }}
                  className="btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-zinc-500">
                The user must have an existing account on Builders.to
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
