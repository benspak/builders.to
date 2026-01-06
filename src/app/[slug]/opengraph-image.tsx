import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export const alt = 'Builder Profile on Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      headline: true,
      image: true,
      city: true,
      state: true,
      currentStreak: true,
      openToWork: true,
      lookingForCofounder: true,
      availableForContract: true,
      _count: {
        select: {
          projects: true,
          companies: true,
          endorsementsReceived: true,
        },
      },
    },
  })

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            color: 'white',
            fontSize: 48,
          }}
        >
          Builder Not Found
        </div>
      ),
      { ...size }
    )
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || 'Builder'

  const location = user.city && user.state
    ? `${user.city}, ${user.state}`
    : user.city || user.state

  // Intent badges
  const intents = [
    user.openToWork && { label: 'Open to Work', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
    user.lookingForCofounder && { label: 'Looking for Co-founder', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
    user.availableForContract && { label: 'Available for Contract', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  ].filter(Boolean) as Array<{ label: string; color: string; bg: string }>

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090b',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        {/* Gradient banner at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(6, 182, 212, 0.15) 100%)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '48px 64px',
            zIndex: 10,
          }}
        >
          {/* Top: Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                </svg>
              </div>
              <span style={{ color: '#71717a', fontSize: '20px', fontWeight: 600 }}>
                Builders.to
              </span>
            </div>

            {/* Streak badge */}
            {user.currentStreak > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                }}
              >
                <span style={{ fontSize: '20px' }}>🔥</span>
                <span style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 600 }}>
                  {user.currentStreak} day streak
                </span>
              </div>
            )}
          </div>

          {/* Profile section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '32px',
            }}
          >
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt=""
                width={140}
                height={140}
                style={{
                  borderRadius: '20px',
                  border: '4px solid #09090b',
                  boxShadow: '0 0 40px rgba(249, 115, 22, 0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid #09090b',
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
            )}

            {/* Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.1,
                }}
              >
                {displayName}
              </div>

              {user.headline && (
                <div
                  style={{
                    fontSize: '24px',
                    color: '#a1a1aa',
                    marginTop: '12px',
                    maxWidth: '700px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {user.headline}
                </div>
              )}

              {location && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    color: '#71717a',
                    fontSize: '18px',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                </div>
              )}

              {/* Intent badges */}
              {intents.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '20px',
                  }}
                >
                  {intents.slice(0, 2).map((intent, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        backgroundColor: intent.bg,
                        border: `1px solid ${intent.color}40`,
                      }}
                    >
                      <span style={{ color: intent.color, fontSize: '14px', fontWeight: 600 }}>
                        {intent.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.2)',
              }}
            >
              <span style={{ fontSize: '28px' }}>🚀</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#f97316', fontSize: '28px', fontWeight: 700 }}>
                  {user._count.projects}
                </span>
                <span style={{ color: '#71717a', fontSize: '14px' }}>Projects</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <span style={{ fontSize: '28px' }}>🏢</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#06b6d4', fontSize: '28px', fontWeight: 700 }}>
                  {user._count.companies}
                </span>
                <span style={{ color: '#71717a', fontSize: '14px' }}>Companies</span>
              </div>
            </div>

            {user._count.endorsementsReceived > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                }}
              >
                <span style={{ fontSize: '28px' }}>⭐</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#a78bfa', fontSize: '28px', fontWeight: 700 }}>
                    {user._count.endorsementsReceived}
                  </span>
                  <span style={{ color: '#71717a', fontSize: '14px' }}>Endorsements</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #f97316, #06b6d4, #8b5cf6, #f97316)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
