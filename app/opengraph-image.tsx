import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#FAFAFA',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          background: '#FF4D4D',
          width: 100,
          height: 100,
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 60,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
        >
          V
        </span>
      </div>

      {/* Wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#111',
            fontFamily: 'sans-serif',
            letterSpacing: -3,
          }}
        >
          Vibe
        </span>
        <span style={{ fontSize: 72, fontWeight: 800, color: '#FF4D4D', fontFamily: 'sans-serif' }}>
          .
        </span>
      </div>

      {/* Tagline */}
      <span
        style={{
          fontSize: 28,
          color: '#999',
          fontFamily: 'sans-serif',
          letterSpacing: -0.5,
        }}
      >
        Discover by mood, not category
      </span>
    </div>,
    { ...size }
  )
}
