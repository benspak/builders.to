"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyRoleCard } from "./company-role-card";
import { CompanyRoleForm } from "./company-role-form";
import { Briefcase, Plus, Trash2, Pencil, MoreHorizontal, Loader2, Power } from "lucide-react";

interface CompanyRole {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  category: string;
  location?: string | null;
  isRemote: boolean;
  timezone?: string | null;
  compensationType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  equityMin?: number | null;
  equityMax?: number | null;
  skills: string[];
  experienceMin?: number | null;
  experienceMax?: number | null;
  isActive: boolean;
  applicationUrl?: string | null;
  applicationEmail?: string | null;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
}

interface CompanyRoleListProps {
  roles: CompanyRole[];
  companyId: string;
  isOwner?: boolean;
  showForm?: boolean;
  emptyMessage?: string;
}

export function CompanyRoleList({
  roles,
  companyId,
  isOwner,
  showForm = false,
  emptyMessage = "No open positions",
}: CompanyRoleListProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(showForm);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    setLoadingId(roleId);
    try {
      const response = await fetch(`/api/company-roles/${roleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting role:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleActive = async (role: CompanyRole) => {
    setLoadingId(role.id);
    try {
      const response = await fetch(`/api/company-roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !role.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling role:", error);
    } finally {
      setLoadingId(null);
    }
  };

  if (showCreateForm || editingRoleId) {
    const editingRole = editingRoleId
      ? roles.find((r) => r.id === editingRoleId)
      : undefined;

    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editingRole ? "Edit Role" : "Post a New Role"}
        </h3>
        <CompanyRoleForm
          companyId={companyId}
          initialData={editingRole}
          onSuccess={() => {
            setShowCreateForm(false);
            setEditingRoleId(null);
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingRoleId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary text-sm"
          >
            <Plus className="h-4 w-4" />
            Post Role
          </button>
        </div>
      )}

      {roles.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
          <Briefcase className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">{emptyMessage}</p>
          {isOwner && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 btn-secondary text-sm"
            >
              <Plus className="h-4 w-4" />
              Post your first role
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="relative">
              <CompanyRoleCard role={role} />

              {isOwner && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === role.id ? null : role.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {menuOpenId === role.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl bg-zinc-900 border border-white/10 shadow-xl overflow-hidden">
                        <button
                          onClick={() => {
                            setEditingRoleId(role.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleToggleActive(role);
                            setMenuOpenId(null);
                          }}
                          disabled={loadingId === role.id}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                        >
                          {loadingId === role.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                          {role.isActive ? "Close" : "Reopen"}
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(role.id);
                            setMenuOpenId(null);
                          }}
                          disabled={loadingId === role.id}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          {loadingId === role.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
