import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

export const alt = 'Company on Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  SAAS: { label: 'SaaS', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  AGENCY: { label: 'Agency', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  FINTECH: { label: 'Fintech', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  ECOMMERCE: { label: 'E-commerce', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  HEALTHTECH: { label: 'Healthtech', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  EDTECH: { label: 'Edtech', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  AI_ML: { label: 'AI / ML', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  DEVTOOLS: { label: 'Dev Tools', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  MEDIA: { label: 'Media', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' },
  MARKETPLACE: { label: 'Marketplace', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  OTHER: { label: 'Other', color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.15)' },
}

export default async function Image({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      logo: true,
      location: true,
      category: true,
      about: true,
      yearFounded: true,
      size: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
  })

  if (!company) {
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
          Company Not Found
        </div>
      ),
      { ...size }
    )
  }

  const category = categoryConfig[company.category] || categoryConfig.OTHER

  const sizeLabels: Record<string, string> = {
    SIZE_1_10: '1-10',
    SIZE_11_50: '11-50',
    SIZE_51_200: '51-200',
    SIZE_201_500: '201-500',
    SIZE_500_PLUS: '500+',
  }

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

        {/* Cyan glow - top right */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
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
              marginBottom: '40px',
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
              <span style={{ color: category.color, fontSize: '18px', fontWeight: 600 }}>
                {category.label}
              </span>
            </div>
          </div>

          {/* Company section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '32px',
            }}
          >
            {/* Logo */}
            {company.logo ? (
              <img
                src={company.logo}
                alt=""
                width={120}
                height={120}
                style={{
                  borderRadius: '24px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '24px',
                  backgroundColor: '#27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="2"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M12 6h.01" />
                  <path d="M12 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 10h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 10h.01" />
                  <path d="M8 14h.01" />
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
                {company.name}
              </div>

              {company.about && (
                <div
                  style={{
                    fontSize: '22px',
                    color: '#a1a1aa',
                    marginTop: '16px',
                    maxWidth: '700px',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {company.about}
                </div>
              )}

              {/* Meta info */}
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  marginTop: '20px',
                  color: '#71717a',
                  fontSize: '18px',
                }}
              >
                {company.location && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
                    {company.location}
                  </div>
                )}
                {company.yearFounded && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    Founded {company.yearFounded}
                  </div>
                )}
                {company.size && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {sizeLabels[company.size] || ''} employees
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom: Founder + Project count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Founder */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {company.user.image ? (
                <img
                  src={company.user.image}
                  alt=""
                  width={48}
                  height={48}
                  style={{
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
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
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                  {company.user.name || 'Builder'}
                </span>
                <span style={{ color: '#71717a', fontSize: '14px' }}>
                  Founder
                </span>
              </div>
            </div>

            {/* Projects stat */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 28px',
                borderRadius: '16px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <span style={{ fontSize: '28px' }}>🚀</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#06b6d4', fontSize: '28px', fontWeight: 700 }}>
                  {company._count.projects}
                </span>
                <span style={{ color: '#71717a', fontSize: '14px' }}>
                  Project{company._count.projects !== 1 ? 's' : ''}
                </span>
              </div>
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
