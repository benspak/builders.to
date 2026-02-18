"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Loader2, Shield, ShieldCheck, Crown, LogOut, UserMinus } from "lucide-react";
import { PresenceIndicator } from "./presence-indicator";

interface MemberData {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
    headline: string | null;
    chatPresence: { status: string; lastSeenAt: string; customStatus: string | null } | null;
  };
}

interface MemberListProps {
  channelId: string;
  currentUserId: string;
  memberRole: string | null;
}

const roleIcons: Record<string, typeof Crown> = {
  OWNER: Crown,
  ADMIN: ShieldCheck,
  MODERATOR: Shield,
};

export function MemberList({ channelId, currentUserId, memberRole }: MemberListProps) {
  const router = useRouter();
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/chat/channels/${channelId}/members`);
        const data = await res.json();
        setMembers(data.members || []);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, [channelId]);

  const canManageMembers = memberRole && ["OWNER", "ADMIN", "MODERATOR"].includes(memberRole);

  const handleLeave = async () => {
    if (!confirm("Leave this channel?")) return;
    try {
      await fetch(`/api/chat/channels/${channelId}/members`, { method: "DELETE" });
      router.push("/messages");
      router.refresh();
    } catch (error) {
      console.error("Failed to leave channel:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this member from the channel?")) return;
    setRemovingId(userId);
    try {
      await fetch(`/api/chat/channels/${channelId}/members?userId=${userId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
      </div>
    );
  }

  const online = members.filter((m) => m.user.chatPresence?.status === "ONLINE" || m.user.chatPresence?.status === "AWAY");
  const offline = members.filter((m) => !m.user.chatPresence || m.user.chatPresence.status === "OFFLINE" || m.user.chatPresence.status === "DND");

  return (
    <div className="space-y-4">
      {/* Leave channel button */}
      <button
        onClick={handleLeave}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Leave Channel
      </button>

      {online.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-1">
            Online — {online.length}
          </p>
          {online.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              currentUserId={currentUserId}
              canRemove={!!canManageMembers}
              isRemoving={removingId === m.user.id}
              onRemove={() => handleRemoveMember(m.user.id)}
            />
          ))}
        </div>
      )}
      {offline.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-1">
            Offline — {offline.length}
          </p>
          {offline.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              currentUserId={currentUserId}
              canRemove={!!canManageMembers}
              isRemoving={removingId === m.user.id}
              onRemove={() => handleRemoveMember(m.user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberRow({
  member,
  currentUserId,
  canRemove,
  isRemoving,
  onRemove,
}: {
  member: MemberData;
  currentUserId: string;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  const name = member.user.firstName && member.user.lastName
    ? `${member.user.firstName} ${member.user.lastName}`
    : member.user.name || "User";
  const RoleIcon = roleIcons[member.role];
  const isOwnRow = member.user.id === currentUserId;
  const showRemove = canRemove && !isOwnRow && member.role === "MEMBER";

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors">
      <Link href={member.user.slug ? `/${member.user.slug}` : "#"} className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          {member.user.image ? (
            <Image src={member.user.image} alt={name} width={28} height={28} className="h-7 w-7 rounded-full" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-zinc-700 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          )}
          <PresenceIndicator
            status={member.user.chatPresence?.status || "OFFLINE"}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-300 truncate">{name}</span>
            {RoleIcon && <RoleIcon className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
          </div>
          {member.user.chatPresence?.customStatus && (
            <p className="text-[10px] text-zinc-500 truncate">{member.user.chatPresence.customStatus}</p>
          )}
        </div>
      </Link>
      {showRemove && (
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="hidden group-hover:flex p-1 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Remove member"
        >
          {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserMinus className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}
