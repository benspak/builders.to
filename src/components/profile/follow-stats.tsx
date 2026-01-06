"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, X, Loader2 } from "lucide-react";

interface UserPreview {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

interface FollowStatsProps {
  userId: string;
  followersCount: number;
  followingCount: number;
}

export function FollowStats({
  userId,
  followersCount,
  followingCount,
}: FollowStatsProps) {
  const [showModal, setShowModal] = useState<"followers" | "following" | null>(null);
  const [users, setUsers] = useState<UserPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async (type: "followers" | "following") => {
    setIsLoading(true);
    setShowModal(type);
    try {
      const response = await fetch(`/api/follows?userId=${userId}&type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setUsers([]);
  };

  const getDisplayName = (user: UserPreview) => {
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name || "Builder";
  };

  return (
    <>
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => fetchUsers("followers")}
          className="hover:text-orange-400 transition-colors"
        >
          <span className="font-semibold text-white">{followersCount}</span>{" "}
          <span className="text-zinc-400">Followers</span>
        </button>
        <button
          onClick={() => fetchUsers("following")}
          className="hover:text-orange-400 transition-colors"
        >
          <span className="font-semibold text-white">{followingCount}</span>{" "}
          <span className="text-zinc-400">Following</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white capitalize">
                {showModal}
              </h3>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Users List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                </div>
              ) : users.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={user.slug ? `/${user.slug}` : "#"}
                      onClick={closeModal}
                      className="flex items-center gap-3 p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={getDisplayName(user)}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {getDisplayName(user)}
                        </p>
                        {user.headline && (
                          <p className="text-sm text-zinc-500 truncate">
                            {user.headline}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500">
                  {showModal === "followers"
                    ? "No followers yet"
                    : "Not following anyone yet"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
