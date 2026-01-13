import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export const alt = 'Local Listings - Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const categoryConfig: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  community: { label: 'Community', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', emoji: '👥' },
  services: { label: 'Services', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', emoji: '🔧' },
  discussion: { label: 'Discussion', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', emoji: '💬' },
  coworking_housing: { label: 'Housing', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', emoji: '🏠' },
  for_sale: { label: 'For Sale', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', emoji: '🛍️' },
  jobs: { label: 'Jobs', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', emoji: '💼' },
}

export default async function Image({ params }: { params: Promise<{ locationSlug: string; category: string }> }) {
  const { locationSlug, category } = await params

  // Get location name
  let locationName = locationSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const userWithLocation = await prisma.user.findFirst({
    where: { locationSlug },
    select: { city: true, state: true },
  })

  if (userWithLocation?.city && userWithLocation?.state) {
    locationName = `${userWithLocation.city}, ${userWithLocation.state}`
  } else {
    // Try from local listing
    const listing = await prisma.localListing.findFirst({
      where: { locationSlug },
      select: { city: true, state: true },
    })
    if (listing?.city && listing?.state) {
      locationName = `${listing.city}, ${listing.state}`
    }
  }

  const categoryData = categoryConfig[category.toLowerCase()] || categoryConfig.community

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Category colored glow - center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '700px',
            background: `radial-gradient(circle, ${categoryData.bg} 0%, transparent 60%)`,
            borderRadius: '50%',
          }}
        />

        {/* Orange accent glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '40px',
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                boxShadow: '0 0 50px rgba(249, 115, 22, 0.4)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <span style={{ color: '#71717a', fontSize: '24px', fontWeight: 600 }}>
              Builders Local
            </span>
          </div>

          {/* Category badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 28px',
              borderRadius: '999px',
              backgroundColor: categoryData.bg,
              border: `1px solid ${categoryData.color}40`,
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '28px' }}>{categoryData.emoji}</span>
            <span style={{ color: categoryData.color, fontSize: '24px', fontWeight: 700 }}>
              {categoryData.label}
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              {locationName}
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            {categoryData.label} listings in {locationName}
          </div>

          {/* Additional info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '40px',
              color: '#71717a',
              fontSize: '18px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Connect with your local builder community</span>
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
            background: `linear-gradient(90deg, ${categoryData.color}, #f97316, ${categoryData.color})`,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
