import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'
import { getAbsoluteImageUrl } from '@/lib/utils'

export const runtime = 'nodejs'

export const alt = 'Local Listing - Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const categoryConfig: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  COMMUNITY: { label: 'Community', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', emoji: '👥' },
  SERVICES: { label: 'Services', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', emoji: '🔧' },
  DISCUSSION: { label: 'Discussion', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', emoji: '💬' },
  COWORKING_HOUSING: { label: 'Housing', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', emoji: '🏠' },
  FOR_SALE: { label: 'For Sale', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', emoji: '🛍️' },
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const listing = await prisma.localListing.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      category: true,
      city: true,
      state: true,
      priceInCents: true,
      user: {
        select: {
          name: true,
          displayName: true,
          image: true,
        },
      },
    },
  })

  if (!listing) {
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
          Listing Not Found
        </div>
      ),
      { ...size }
    )
  }

  const category = categoryConfig[listing.category] || categoryConfig.COMMUNITY
  const displayName = listing.user.displayName || listing.user.name || 'Builder'
  const location = listing.city && listing.state ? `${listing.city}, ${listing.state}` : null

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
        {/* Emerald glow - top right */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Orange glow - bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
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
          {/* Top: Brand + Category */}
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
                Builders Local
              </span>
            </div>

            {/* Category badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '999px',
                backgroundColor: category.bg,
                border: `1px solid ${category.color}40`,
              }}
            >
              <span style={{ fontSize: '20px' }}>{category.emoji}</span>
              <span style={{ color: category.color, fontSize: '18px', fontWeight: 600 }}>
                {category.label}
              </span>
            </div>
          </div>

          {/* Listing Title */}
          <div
            style={{
              fontSize: '52px',
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
            {listing.title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
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
            {listing.description}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom: User + Location + Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* User */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {listing.user.image ? (
                <img
                  src={getAbsoluteImageUrl(listing.user.image)!}
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
                  {displayName}
                </span>
                {location && (
                  <span style={{ color: '#71717a', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {location}
                  </span>
                )}
              </div>
            </div>

            {/* Price (if applicable) */}
            {listing.priceInCents && listing.category === 'SERVICES' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <span style={{ color: '#10b981', fontSize: '28px', fontWeight: 700 }}>
                  ${(listing.priceInCents / 100).toLocaleString()}
                </span>
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
            background: 'linear-gradient(90deg, #10b981, #f97316, #8b5cf6, #10b981)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
