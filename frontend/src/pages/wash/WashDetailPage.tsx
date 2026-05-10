import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSession, deleteSession, updateSession } from '@/api/washApi'
import type { WashSession, WashProductItem, DilutionRatio, Weather, WashUpdateRequest } from '@/types/wash'
import { useToast } from '@/hooks/useToast'
import { WASH_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'

const WEATHER_LABEL: Record<string, string> = {
  SUNNY: '☀️ 맑음',
  CLOUDY: '☁️ 흐림',
  RAINY: '🌧️ 비',
  SNOWY: '❄️ 눈',
}

const WEATHER_OPTIONS: { value: Weather; label: string }[] = [
  { value: 'SUNNY', label: '☀️ 맑음' },
  { value: 'CLOUDY', label: '☁️ 흐림' },
  { value: 'RAINY', label: '🌧️ 비' },
  { value: 'SNOWY', label: '❄️ 눈' },
]

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const StarRating = ({ rating, onSelect }: { rating: number | null; onSelect?: (r: number) => void }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onSelect?.(star)}
          className={`text-[24px] ${star <= (rating ?? 0) ? 'text-[#FFB800]' : 'text-[#E5E8EB]'} ${onSelect ? 'cursor-pointer' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

const ProductRow = ({ product }: { product: WashProductItem }) => {
  const [open, setOpen] = useState(false)
  const hasRatios = product.dilutionRatios.length > 0

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => hasRatios && setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left bg-[#F2F4F6] active:brightness-95"
      >
        <div>
          <p className="text-[13px] font-medium text-[#191F28]">{product.productName}</p>
          {product.category && <p className="text-[11px] text-[#ADB5C0]">{product.category}</p>}
        </div>
        {hasRatios && (
          <span className={`text-[#3182F6] text-[12px] font-medium transition-transform ${open ? 'rotate-180' : ''}`}>
            희석비 ▾
          </span>
        )}
      </button>

      {open && hasRatios && (
        <div className="bg-[#EBF3FF] px-3 py-2 flex flex-col gap-1.5">
          {product.dilutionRatios.map((dr: DilutionRatio) => (
            <div key={dr.id} className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[12px] font-semibold text-[#3182F6]">{dr.label}</span>
                {dr.description && (
                  <p className="text-[11px] text-[#6B7684] mt-0.5">{dr.description}</p>
                )}
              </div>
              <span className="text-[13px] font-bold text-[#191F28] shrink-0">1 : {dr.ratio}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const WashDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const [session, setSession] = useState<WashSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editLocation, setEditLocation] = useState('')
  const [editWeather, setEditWeather] = useState<Weather | null>(null)
  const [editDuration, setEditDuration] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editRating, setEditRating] = useState<number | null>(null)
  const [editMemo, setEditMemo] = useState('')

  useEffect(() => {
    if (!id) { return }
    getSession(Number(id))
      .then(setSession)
      .finally(() => setIsLoading(false))
  }, [id])

  const openEdit = () => {
    if (!session) { return }
    setEditLocation(session.location ?? '')
    setEditWeather(session.weather)
    setEditDuration(session.durationMinutes != null ? String(session.durationMinutes) : '')
    setEditCost(session.cost != null ? String(session.cost) : '')
    setEditRating(session.rating)
    setEditMemo(session.memo ?? '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!id || isSaving) { return }
    setIsSaving(true)
    try {
      const req: WashUpdateRequest = {
        location: editLocation.trim() || null,
        weather: editWeather,
        durationMinutes: editDuration ? Number(editDuration) : null,
        cost: editCost ? Number(editCost) : null,
        rating: editRating,
        memo: editMemo.trim() || null,
      }
      const updated = await updateSession(Number(id), req)
      setSession(updated)
      setIsEditing(false)
      toast.success('수정되었습니다')
    } catch {
      toast.error('수정에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm(WASH_MSGS.CONFIRM_DELETE)) { return }
    setIsDeleting(true)
    try {
      await deleteSession(Number(id))
      toast.success(WASH_MSGS.SESSION_DELETED)
      navigate('/records', { replace: true })
    } catch {
      toast.error(WASH_MSGS.SESSION_DELETE_ERROR)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <PageLayout isLoading />
  }

  if (!session) {
    return (
      <PageLayout onBack={true}>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <p className="text-[15px] text-[#6B7684]">기록을 찾을 수 없어요</p>
        </div>
      </PageLayout>
    )
  }

  const isPreparing = session.status === 'PREPARING'

  return (
    <PageLayout
      title={isPreparing ? '세차 준비 중' : '세차 기록'}
      onBack={true}
      headerRight={
        isPreparing ? (
          <button onClick={handleDelete} disabled={isDeleting} className="text-[14px] text-[#FF4D4F] disabled:opacity-50">
            삭제
          </button>
        ) : isEditing ? (
          <button onClick={() => setIsEditing(false)} className="text-[14px] text-[#6B7684]">
            취소
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={openEdit} className="text-[14px] text-[#3182F6]">수정</button>
            <button onClick={handleDelete} disabled={isDeleting} className="text-[14px] text-[#FF4D4F] disabled:opacity-50">삭제</button>
          </div>
        )
      }
      hasFixedButton={isPreparing || isEditing}
    >
      <div className="flex flex-col gap-3">

        {/* PREPARING 상태 배너 */}
        {isPreparing && (
          <div className="bg-[#FFF4EF] rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] animate-pulse shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-[#FF6B35]">세차 진행 중</p>
              <p className="text-[12px] text-[#ADB5C0] mt-0.5">
                아래 용품의 희석비를 확인하며 세차하세요. 완료 후 후기를 작성해주세요.
              </p>
            </div>
          </div>
        )}

        {/* 수정 폼 */}
        {isEditing ? (
          <>
            <div className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-3">
              <input
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
                placeholder="장소"
                className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
              />
              <div>
                <p className="text-[12px] text-[#ADB5C0] mb-1.5">날씨</p>
                <div className="flex gap-2">
                  {WEATHER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEditWeather(editWeather === opt.value ? null : opt.value)}
                      className={`flex-1 py-2 rounded-xl text-[13px] border transition-colors
                        ${editWeather === opt.value ? 'bg-[#3182F6] text-white border-[#3182F6]' : 'border-[#E5E8EB] text-[#6B7684]'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-[12px] text-[#ADB5C0] mb-1.5">소요 시간 (분)</p>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={e => setEditDuration(e.target.value)}
                    placeholder="60"
                    className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-[#ADB5C0] mb-1.5">비용 (원)</p>
                  <input
                    type="number"
                    value={editCost}
                    onChange={e => setEditCost(e.target.value)}
                    placeholder="0"
                    className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
                  />
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#ADB5C0] mb-1.5">별점</p>
                <StarRating rating={editRating} onSelect={setEditRating} />
              </div>
              <div>
                <p className="text-[12px] text-[#ADB5C0] mb-1.5">메모</p>
                <textarea
                  value={editMemo}
                  onChange={e => setEditMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                  rows={3}
                  className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6] resize-none"
                />
              </div>
            </div>

            {/* 사용 용품 (수정 불가, 읽기 전용) */}
            {session.products.length > 0 && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[14px] font-semibold text-[#191F28] mb-3">사용 용품 ({session.products.length}개)</p>
                <div className="flex flex-col gap-2">
                  {session.products.map(product => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 날짜/장소 */}
            <div className="bg-white rounded-2xl px-5 py-4">
              <p className="text-[22px] font-bold text-[#191F28]">{session.location ?? '장소 미입력'}</p>
              <p className="text-[14px] text-[#6B7684] mt-1">{formatDate(session.washedAt)}</p>
              {!isPreparing && (
                <div className="mt-3">
                  <StarRating rating={session.rating} />
                </div>
              )}
            </div>

            {/* 세부 정보 (DONE만) */}
            {!isPreparing && (
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
            )}

            {/* 사용 용품 + 희석비 */}
            {session.products.length > 0 && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[14px] font-semibold text-[#191F28] mb-3">
                  {isPreparing ? '준비한 용품' : '사용 용품'} ({session.products.length}개)
                </p>
                {isPreparing && (
                  <p className="text-[12px] text-[#ADB5C0] mb-2">용품을 탭하면 희석비를 확인할 수 있어요</p>
                )}
                <div className="flex flex-col gap-2">
                  {session.products.map(product => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* 메모 (DONE만) */}
            {!isPreparing && session.memo && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[13px] text-[#6B7684] mb-1.5">메모</p>
                <p className="text-[14px] text-[#191F28] whitespace-pre-wrap">{session.memo}</p>
              </div>
            )}

            {/* 사진 (DONE만) */}
            {!isPreparing && session.photos.length > 0 && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[14px] font-semibold text-[#191F28] mb-3">
                  사진 ({session.photos.length}장)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {session.photos.map(photo => (
                    <img key={photo.id} src={photo.photoUrl} alt={photo.photoType} className="w-full aspect-square object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      {isPreparing && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
          <button
            onClick={() => navigate(`/wash/${session.id}/review`)}
            className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold"
          >
            세차 완료 · 후기 작성
          </button>
        </div>
      )}

      {isEditing && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </PageLayout>
  )
}

export default WashDetailPage
