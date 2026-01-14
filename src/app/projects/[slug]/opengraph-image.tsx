import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'
import { getAbsoluteImageUrl } from '@/lib/utils'

export const runtime = 'nodejs'

export const alt = 'Project on Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const statusConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  IDEA: { emoji: '💡', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  BUILDING: { emoji: '🔨', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  BETA: { emoji: '🧪', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  LAUNCHED: { emoji: '🚀', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  PAUSED: { emoji: '⏸️', color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.15)' },
  ACQUIRED: { emoji: '🏆', color: '#e879f9', bg: 'rgba(232, 121, 249, 0.15)' },
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      title: true,
      tagline: true,
      status: true,
      imageUrl: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          upvotes: true,
          milestones: true,
        },
      },
    },
  })

  if (!project) {
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
          Project Not Found
        </div>
      ),
      { ...size }
    )
  }

  const status = statusConfig[project.status] || statusConfig.IDEA

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

        {/* Orange glow - top */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(249, 115, 22, 0.25) 0%, transparent 70%)',
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
          {/* Top: Brand + Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            {/* Brand */}
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

            {/* Status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '999px',
                backgroundColor: status.bg,
                border: `1px solid ${status.color}40`,
              }}
            >
              <span style={{ fontSize: '20px' }}>{status.emoji}</span>
              <span style={{ color: status.color, fontSize: '18px', fontWeight: 600 }}>
                {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
              </span>
            </div>
          </div>

          {/* Project Title */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '16px',
              maxWidth: '900px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.title}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              lineHeight: 1.4,
              maxWidth: '800px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.tagline}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom: Author + Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Author */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {project.user.image ? (
                <img
                  src={getAbsoluteImageUrl(project.user.image)!}
                  alt=""
                  width={56}
                  height={56}
                  style={{
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontSize: '22px', fontWeight: 600 }}>
                  {project.user.name || 'Builder'}
                </span>
                <span style={{ color: '#71717a', fontSize: '16px' }}>
                  Project Creator
                </span>
              </div>
            </div>

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
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                }}
              >
                <span style={{ fontSize: '24px' }}>👍</span>
                <span style={{ color: '#f97316', fontSize: '20px', fontWeight: 700 }}>
                  {project._count.upvotes}
                </span>
              </div>

              {project._count.milestones > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🏆</span>
                  <span style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 700 }}>
                    {project._count.milestones} milestone{project._count.milestones !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
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
