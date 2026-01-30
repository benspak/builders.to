import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  User,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RsvpButton } from "./rsvp-button";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true, description: true, city: true, country: true },
  });

  if (!event) {
    return { title: "Event Not Found | Builders" };
  }

  const location = [event.city, event.country].filter(Boolean).join(", ");

  return {
    title: `${event.title} | Builders`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          slug: true,
        },
      },
      attendees: {
        where: { status: "GOING" },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          attendees: { where: { status: "GOING" } },
          comments: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Get current user's RSVP status
  let userRsvpStatus: string | null = null;
  if (session?.user?.id) {
    const rsvp = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id,
        },
      },
      select: { status: true },
    });
    userRsvpStatus = rsvp?.status || null;
  }

  const startDate = new Date(event.startsAt);
  const endDate = event.endsAt ? new Date(event.endsAt) : null;
  const isPast = startDate < new Date();

  const organizerName =
    event.organizer.firstName && event.organizer.lastName
      ? `${event.organizer.firstName} ${event.organizer.lastName}`
      : event.organizer.name || "Anonymous";

  const location = event.isVirtual
    ? "Virtual Event"
    : [event.venue, event.address, event.city, event.state, event.country]
        .filter(Boolean)
        .join(", ");

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const isOrganizer = session?.user?.id === event.organizerId;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        {/* Event Header */}
        <div className="card overflow-hidden">
          {/* Cover Image */}
          {event.imageUrl && (
            <div className="relative h-64 w-full">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
              {event.isVirtual && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-violet-500/90 px-3 py-1.5 text-sm font-medium text-white">
                  <Video className="h-4 w-4" />
                  Virtual Event
                </div>
              )}
              {isPast && (
                <div className="absolute top-4 left-4 rounded-full bg-zinc-900/90 px-3 py-1.5 text-sm font-medium text-zinc-400">
                  Past Event
                </div>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Date/Time */}
            <div className="flex flex-wrap items-center gap-4 text-orange-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">{formatEventDate(startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4" />
                <span>{formatEventTime(startDate)}</span>
                {endDate && (
                  <>
                    <span>-</span>
                    <span>{formatEventTime(endDate)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {event.title}
            </h1>

            {/* Location */}
            <div className="flex items-start gap-2 text-zinc-400 mb-6">
              {event.isVirtual ? (
                <Video className="h-5 w-5 text-violet-400 mt-0.5" />
              ) : (
                <MapPin className="h-5 w-5 mt-0.5" />
              )}
              <div>
                <span>{location}</span>
                {event.isVirtual && event.virtualUrl && (
                  <a
                    href={event.virtualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-orange-400 hover:text-orange-300"
                  >
                    Join Meeting
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
              <Link
                href={event.organizer.slug ? `/${event.organizer.slug}` : "#"}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {event.organizer.image ? (
                  <Image
                    src={event.organizer.image}
                    alt={organizerName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                )}
                <div>
                  <div className="text-sm text-zinc-500">Organized by</div>
                  <div className="font-medium text-white">{organizerName}</div>
                </div>
              </Link>
            </div>

            {/* RSVP Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users className="h-5 w-5" />
                  <span className="font-medium text-white">
                    {event._count.attendees}
                  </span>
                  <span>going</span>
                  {event.maxAttendees && (
                    <span className="text-zinc-600">
                      / {event.maxAttendees} max
                    </span>
                  )}
                </div>
              </div>

              {!isPast && session?.user && !isOrganizer && (
                <RsvpButton
                  eventId={event.id}
                  initialStatus={userRsvpStatus}
                />
              )}

              {isOrganizer && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="flex items-center gap-2 text-sm text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full hover:bg-orange-500/20 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Event
                  </Link>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-white mb-4">About this event</h2>
              <div className="text-zinc-300 whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {/* Attendees Preview */}
            {event.attendees.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Who&apos;s going
                </h2>
                <div className="flex flex-wrap gap-3">
                  {event.attendees.map((attendee) => {
                    const attendeeName =
                      attendee.user.firstName && attendee.user.lastName
                        ? `${attendee.user.firstName} ${attendee.user.lastName}`
                        : attendee.user.name || "Anonymous";

                    return (
                      <Link
                        key={attendee.id}
                        href={attendee.user.slug ? `/${attendee.user.slug}` : "#"}
                        className="flex items-center gap-2 rounded-full bg-zinc-800/50 px-3 py-1.5 hover:bg-zinc-800 transition-colors"
                      >
                        {attendee.user.image ? (
                          <Image
                            src={attendee.user.image}
                            alt={attendeeName}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700">
                            <User className="h-3 w-3 text-zinc-400" />
                          </div>
                        )}
                        <span className="text-sm text-zinc-300">{attendeeName}</span>
                      </Link>
                    );
                  })}
                  {event._count.attendees > event.attendees.length && (
                    <span className="flex items-center text-sm text-zinc-500 px-3 py-1.5">
                      +{event._count.attendees - event.attendees.length} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
