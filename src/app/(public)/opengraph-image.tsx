import { ImageResponse } from 'next/og';

export const alt = 'COOLO — Air and cooling solutions across 9 Indian cities';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 76px',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #082f49 0%, #075985 58%, #0f766e 100%)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.16)',
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>COOLO</span>
            <span style={{ fontSize: 14, letterSpacing: 3, color: '#bae6fd' }}>AIR & COOLING SOLUTIONS</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 940 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 62, lineHeight: 1.08, fontWeight: 800 }}>
            <span>Reliable AC care,</span>
            <span>without the guesswork.</span>
          </div>
          <div style={{ fontSize: 26, color: '#e0f2fe' }}>
            Repair · servicing · deep cleaning · installation
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 21, fontWeight: 700 }}>Serving 9 Cities Across India</span>
          <span style={{ fontSize: 18, color: '#bae6fd' }}>coolo.in</span>
        </div>
      </div>
    ),
    size
  );
}
