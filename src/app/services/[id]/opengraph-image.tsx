import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export const alt = 'Service on Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  MVP_BUILD: { label: 'MVP Build', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  DESIGN: { label: 'Design', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  MARKETING: { label: 'Marketing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  AI_INTEGRATION: { label: 'AI Integration', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  DEVOPS: { label: 'DevOps', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  AUDIT: { label: 'Audit', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  OTHER: { label: 'Other', color: '#71717a', bg: 'rgba(113, 113, 122, 0.15)' },
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const service = await prisma.serviceListing.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    select: {
      title: true,
      description: true,
      category: true,
      priceInCents: true,
      deliveryDays: true,
      user: {
        select: {
          name: true,
          displayName: true,
          firstName: true,
          lastName: true,
          image: true,
          _count: {
            select: {
              projects: { where: { status: 'LAUNCHED' } },
            },
          },
        },
      },
      _count: {
        select: {
          orders: { where: { status: 'COMPLETED' } },
        },
      },
    },
  })

  if (!service) {
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
          Service Not Found
        </div>
      ),
      { ...size }
    )
  }

  const category = categoryConfig[service.category] || categoryConfig.OTHER
  const displayName =
    service.user.displayName ||
    (service.user.firstName && service.user.lastName
      ? `${service.user.firstName} ${service.user.lastName}`
      : null) ||
    service.user.name ||
    'Builder'

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100)
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
        {/* Amber glow - top right */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
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

          {/* Service Title */}
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
            {service.title}
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
            {service.description}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom: Seller + Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Seller */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {service.user.image ? (
                <img
                  src={service.user.image}
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
                <span style={{ color: '#71717a', fontSize: '14px' }}>
                  🚀 {service.user._count.projects} shipped
                  {service._count.orders > 0 && ` • ${service._count.orders} orders completed`}
                </span>
              </div>
            </div>

            {/* Price & Delivery */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
              }}
            >
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
                  {formatPrice(service.priceInCents)}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(113, 113, 122, 0.1)',
                  border: '1px solid rgba(113, 113, 122, 0.2)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ color: '#a1a1aa', fontSize: '18px', fontWeight: 600 }}>
                  {service.deliveryDays} day{service.deliveryDays !== 1 ? 's' : ''}
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
            background: 'linear-gradient(90deg, #f59e0b, #f97316, #10b981, #f59e0b)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
