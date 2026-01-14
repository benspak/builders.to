"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteAccountProps {
  userId: string;
}

export function DeleteAccount({ userId }: DeleteAccountProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  };

  if (!showConfirm) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Permanently delete your account and all of your data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400">
            Are you absolutely sure?
          </h3>
          <p className="mt-2 text-sm text-zinc-300">
            This will permanently delete your account including:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-400 list-disc list-inside">
            <li>Your profile and all personal information</li>
            <li>All your projects and daily updates</li>
            <li>All your comments, likes, and follows</li>
            <li>Your companies, services, and listings</li>
            <li>Your tokens and referral codes</li>
          </ul>

          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Type <span className="font-mono text-red-400">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
              disabled={isDeleting}
            />
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete My Account
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
                setError("");
              }}
              disabled={isDeleting}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
