import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSession, deleteSession } from '@/api/washApi'
import type { WashSession } from '@/types/wash'
import { useToast } from '@/hooks/useToast'
import { WASH_MSGS } from '@/constants/messages'

const WEATHER_LABEL: Record<string, string> = {
  SUNNY: '☀️ 맑음',
  CLOUDY: '☁️ 흐림',
  RAINY: '🌧️ 비',
  SNOWY: '❄️ 눈',
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const StarRating = ({ rating }: { rating: number | null }) => {
  if (!rating) { return null }
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={`text-[20px] ${star <= rating ? 'text-[#FFB800]' : 'text-[#E5E8EB]'}`}>
          ★
        </span>
      ))}
    </div>
  )
}

const WashDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [session, setSession] = useState<WashSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) { return }
    getSession(Number(id))
      .then(setSession)
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!id || !window.confirm(WASH_MSGS.CONFIRM_DELETE)) { return }
    setIsDeleting(true)
    try {
      await deleteSession(Number(id))
      showToast(WASH_MSGS.SESSION_DELETED)
      navigate('/records', { replace: true })
    } catch {
      showToast(WASH_MSGS.SESSION_DELETE_ERROR)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F2F4F6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-dvh bg-[#F2F4F6] flex flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-[#6B7684]">기록을 찾을 수 없어요</p>
        <button onClick={() => navigate(-1)} className="text-[#3182F6] text-[14px]">돌아가기</button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F6] pb-24">

      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[#191F28]">←</button>
        <h1 className="text-[18px] font-bold text-[#191F28]">세차 기록</h1>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-[14px] text-[#FF4D4F] disabled:opacity-50"
        >
          삭제
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* 날짜 / 장소 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[22px] font-bold text-[#191F28]">
            {session.location ?? '장소 미입력'}
          </p>
          <p className="text-[14px] text-[#6B7684] mt-1">{formatDate(session.washedAt)}</p>
          <div className="mt-3">
            <StarRating rating={session.rating} />
          </div>
        </div>

        {/* 세부 정보 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="grid grid-cols-3 gap-3">
            {session.weather && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[12px] text-[#ADB5C0]">날씨</p>
                <p className="text-[14px] font-medium text-[#191F28]">{WEATHER_LABEL[session.weather]}</p>
              </div>
            )}
            {session.durationMinutes != null && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[12px] text-[#ADB5C0]">소요 시간</p>
                <p className="text-[14px] font-medium text-[#191F28]">{session.durationMinutes}분</p>
              </div>
            )}
            {session.cost != null && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[12px] text-[#ADB5C0]">비용</p>
                <p className="text-[14px] font-medium text-[#191F28]">{session.cost.toLocaleString()}원</p>
              </div>
            )}
          </div>
        </div>

        {/* 사용 용품 */}
        {session.products.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[14px] font-semibold text-[#191F28] mb-3">
              사용 용품 ({session.products.length}개)
            </p>
            <div className="flex flex-col gap-2">
              {session.products.map(product => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#191F28]">{product.productName}</p>
                    {product.category && (
                      <p className="text-[11px] text-[#ADB5C0]">{product.category}</p>
                    )}
                  </div>
                  {product.memo && (
                    <p className="text-[12px] text-[#6B7684]">{product.memo}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 메모 */}
        {session.memo && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] text-[#6B7684] mb-1.5">메모</p>
            <p className="text-[14px] text-[#191F28] whitespace-pre-wrap">{session.memo}</p>
          </div>
        )}

        {/* 사진 */}
        {session.photos.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[14px] font-semibold text-[#191F28] mb-3">
              사진 ({session.photos.length}장)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {session.photos.map(photo => (
                <img
                  key={photo.id}
                  src={photo.photoUrl}
                  alt={photo.photoType}
                  className="w-full aspect-square object-cover rounded-xl"
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default WashDetailPage
