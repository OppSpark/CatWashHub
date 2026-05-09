import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createSession } from '@/api/washApi'
import type { Weather, WashProductRequest } from '@/types/wash'
import { useToast } from '@/hooks/useToast'
import { WASH_MSGS } from '@/constants/messages'

const WEATHER_OPTIONS: { value: Weather; label: string; emoji: string }[] = [
  { value: 'SUNNY', label: '맑음', emoji: '☀️' },
  { value: 'CLOUDY', label: '흐림', emoji: '☁️' },
  { value: 'RAINY', label: '비', emoji: '🌧️' },
  { value: 'SNOWY', label: '눈', emoji: '❄️' },
]

const WashEditPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const passedProducts: WashProductRequest[] = location.state?.products ?? []

  const [washedAt, setWashedAt] = useState(new Date().toISOString().slice(0, 10))
  const [locationName, setLocationName] = useState('')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [durationMinutes, setDurationMinutes] = useState('')
  const [cost, setCost] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting) { return }
    setIsSubmitting(true)

    try {
      const session = await createSession({
        washedAt,
        location: locationName || null,
        weather,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        cost: cost ? Number(cost) : null,
        rating,
        memo: memo || null,
        products: passedProducts,
      })
      showToast(WASH_MSGS.SESSION_CREATED)
      navigate(`/wash/${session.id}`, { replace: true })
    } catch {
      showToast(WASH_MSGS.SESSION_CREATE_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F6] pb-32">

      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#191F28]">←</button>
        <h1 className="text-[18px] font-bold text-[#191F28]">세차 일지 작성</h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* 날짜 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-1.5">세차 날짜</label>
          <input
            type="date"
            value={washedAt}
            onChange={e => setWashedAt(e.target.value)}
            className="w-full text-[15px] text-[#191F28] outline-none"
          />
        </div>

        {/* 세차장 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-1.5">세차장</label>
          <input
            value={locationName}
            onChange={e => setLocationName(e.target.value)}
            placeholder={WASH_MSGS.PLACEHOLDER_LOCATION}
            className="w-full text-[15px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
          />
        </div>

        {/* 날씨 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-2">날씨</label>
          <div className="flex gap-2">
            {WEATHER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setWeather(prev => prev === opt.value ? null : opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors
                  ${weather === opt.value
                    ? 'border-[#3182F6] bg-[#EBF3FF]'
                    : 'border-[#E5E8EB]'}`}
              >
                <span className="text-[20px]">{opt.emoji}</span>
                <span className="text-[11px] text-[#6B7684]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 소요 시간 / 비용 */}
        <div className="bg-white rounded-2xl px-5 py-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-[13px] text-[#6B7684] mb-1.5">소요 시간</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="0"
                className="w-full text-[15px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
              />
              <span className="text-[13px] text-[#ADB5C0] shrink-0">분</span>
            </div>
          </div>
          <div className="w-px bg-[#F2F4F6]" />
          <div className="flex-1">
            <label className="block text-[13px] text-[#6B7684] mb-1.5">비용</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0"
                className="w-full text-[15px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
              />
              <span className="text-[13px] text-[#ADB5C0] shrink-0">원</span>
            </div>
          </div>
        </div>

        {/* 별점 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-2">만족도</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(prev => prev === star ? null : star)}
                className={`text-[28px] transition-colors ${star <= (rating ?? 0) ? 'text-[#FFB800]' : 'text-[#E5E8EB]'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* 사용 용품 */}
        {passedProducts.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] text-[#6B7684] mb-2">사용 용품 ({passedProducts.length}개)</p>
            <div className="flex flex-wrap gap-1.5">
              {passedProducts.map((p, i) => (
                <span
                  key={i}
                  className="bg-[#F2F4F6] text-[#191F28] text-[12px] rounded-full px-2.5 py-1"
                >
                  {p.customName ?? p.productId?.toString() ?? ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 메모 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-1.5">메모 / 차 상태</label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder={WASH_MSGS.PLACEHOLDER_MEMO}
            rows={4}
            className="w-full text-[14px] text-[#191F28] outline-none resize-none placeholder:text-[#C8D0DA]"
          />
        </div>

      </div>

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '세차 일지 저장'}
        </button>
      </div>
    </div>
  )
}

export default WashEditPage
