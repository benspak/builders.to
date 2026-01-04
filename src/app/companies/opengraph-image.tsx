import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Companies - Builders.to'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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

        {/* Cyan glow - center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 60%)',
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
              Builders.to
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
            <span style={{ fontSize: '72px' }}>🏢</span>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              Companies
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
            }}
          >
            Discover companies built by the community
          </div>

          {/* Category badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '48px',
              maxWidth: '800px',
            }}
          >
            {[
              { label: 'SaaS', color: '#60a5fa' },
              { label: 'AI / ML', color: '#c084fc' },
              { label: 'Dev Tools', color: '#f97316' },
              { label: 'Fintech', color: '#34d399' },
              { label: 'E-commerce', color: '#fbbf24' },
              { label: 'Agency', color: '#a78bfa' },
            ].map((cat) => (
              <div
                key={cat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  backgroundColor: `${cat.color}15`,
                  border: `1px solid ${cat.color}40`,
                }}
              >
                <span style={{ color: cat.color, fontSize: '16px', fontWeight: 600 }}>
                  {cat.label}
                </span>
              </div>
            ))}
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
