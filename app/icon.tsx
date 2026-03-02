import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#FF4D4D',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: 300,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -10,
          fontFamily: 'sans-serif',
        }}
      >
        V
      </span>
    </div>,
    { ...size }
  )
}
