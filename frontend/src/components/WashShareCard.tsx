import { forwardRef } from 'react'
import type { WashSession } from '@/types/wash'

interface WashShareCardProps {
  session: WashSession
  beforeUrl: string | null
  afterUrl: string | null
}

const WEATHER_LABEL: Record<string, string> = {
  SUNNY: '☀️ 맑음',
  CLOUDY: '☁️ 흐림',
  RAINY: '🌧️ 비',
  SNOWY: '❄️ 눈',
}

const WashShareCard = forwardRef<HTMLDivElement, WashShareCardProps>(
  ({ session, beforeUrl, afterUrl }, ref) => {
    const date = new Date(session.washedAt)
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    const stars = session.rating ? '★'.repeat(session.rating) + '☆'.repeat(5 - session.rating) : null

    return (
      <div
        ref={ref}
        style={{
          width: '400px',
          background: '#F2F4F6',
          borderRadius: '24px',
          padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          position: 'absolute',
          left: '-9999px',
          top: 0,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#191F28' }}>
              {session.location ?? '세차 기록'}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7684', marginTop: '2px' }}>{dateStr}</div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#3182F6', background: '#EFF6FF', padding: '6px 12px', borderRadius: '20px' }}>
            🚗 CatWashHub
          </div>
        </div>

        {/* 전/후 사진 */}
        {beforeUrl && afterUrl && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#6B7684', marginBottom: '4px', fontWeight: 600 }}>세차 전</div>
              <img src={beforeUrl} alt="before" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '14px' }} crossOrigin="anonymous" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#6B7684', marginBottom: '4px', fontWeight: 600 }}>세차 후</div>
              <img src={afterUrl} alt="after" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '14px' }} crossOrigin="anonymous" />
            </div>
          </div>
        )}
        {beforeUrl && !afterUrl && (
          <img src={beforeUrl} alt="before" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '14px', marginBottom: '16px' }} crossOrigin="anonymous" />
        )}
        {!beforeUrl && afterUrl && (
          <img src={afterUrl} alt="after" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '14px', marginBottom: '16px' }} crossOrigin="anonymous" />
        )}

        {/* 세차 정보 */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {stars && (
              <div>
                <div style={{ fontSize: '11px', color: '#ADB5C0', marginBottom: '2px' }}>만족도</div>
                <div style={{ fontSize: '16px', color: '#FFB800' }}>{stars}</div>
              </div>
            )}
            {session.weather && (
              <div>
                <div style={{ fontSize: '11px', color: '#ADB5C0', marginBottom: '2px' }}>날씨</div>
                <div style={{ fontSize: '14px', color: '#191F28', fontWeight: 600 }}>{WEATHER_LABEL[session.weather]}</div>
              </div>
            )}
            {session.durationMinutes && (
              <div>
                <div style={{ fontSize: '11px', color: '#ADB5C0', marginBottom: '2px' }}>소요 시간</div>
                <div style={{ fontSize: '14px', color: '#191F28', fontWeight: 600 }}>{session.durationMinutes}분</div>
              </div>
            )}
            {session.cost && (
              <div>
                <div style={{ fontSize: '11px', color: '#ADB5C0', marginBottom: '2px' }}>비용</div>
                <div style={{ fontSize: '14px', color: '#191F28', fontWeight: 600 }}>{session.cost.toLocaleString()}원</div>
              </div>
            )}
          </div>
        </div>

        {/* 사용 용품 */}
        {session.products.length > 0 && (
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6B7684', fontWeight: 600, marginBottom: '8px' }}>사용 용품</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {session.products.slice(0, 6).map((p, i) => (
                <div key={i} style={{ background: '#F2F4F6', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#191F28' }}>
                  {p.productName}
                </div>
              ))}
              {session.products.length > 6 && (
                <div style={{ background: '#F2F4F6', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#ADB5C0' }}>
                  +{session.products.length - 6}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

WashShareCard.displayName = 'WashShareCard'
export default WashShareCard
