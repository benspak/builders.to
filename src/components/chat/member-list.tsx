"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Loader2, Shield, ShieldCheck, Crown } from "lucide-react";
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
}

const roleIcons: Record<string, typeof Crown> = {
  OWNER: Crown,
  ADMIN: ShieldCheck,
  MODERATOR: Shield,
};

export function MemberList({ channelId }: MemberListProps) {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      {online.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-1">
            Online — {online.length}
          </p>
          {online.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      )}
      {offline.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-1">
            Offline — {offline.length}
          </p>
          {offline.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberRow({ member }: { member: MemberData }) {
  const name = member.user.firstName && member.user.lastName
    ? `${member.user.firstName} ${member.user.lastName}`
    : member.user.name || "User";
  const RoleIcon = roleIcons[member.role];

  return (
    <Link
      href={member.user.slug ? `/${member.user.slug}` : "#"}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
    >
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
  );
}
