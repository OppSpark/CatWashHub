import { useEffect, useState } from 'react'
import BottomSheet from '@/components/BottomSheet'
import { getProductReviews, createProductReview, deleteProductReview } from '@/api/calculatorApi'
import type { ProductReviewSummary } from '@/types/calculator'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { Trash2 } from 'lucide-react'

interface ProductReviewSheetProps {
  open: boolean
  onClose: () => void
  productId: number
  productName: string
}

const StarSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="text-[28px] leading-none transition-transform active:scale-110"
      >
        <span className={star <= value ? 'text-[#FFB800]' : 'text-[#E5E8EB]'}>★</span>
      </button>
    ))}
  </div>
)

const StarDisplay = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
  const cls = size === 'lg' ? 'text-[18px]' : 'text-[13px]'
  return (
    <span className={cls}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= rating ? 'text-[#FFB800]' : 'text-[#E5E8EB]'}>★</span>
      ))}
    </span>
  )
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) { return '방금' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}분 전` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}시간 전` }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const ProductReviewSheet = ({ open, onClose, productId, productName }: ProductReviewSheetProps) => {
  const toast = useToast()
  const userId = useAuthStore(s => s.userId)
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  const [summary, setSummary] = useState<ProductReviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) { return }
    setIsLoading(true)
    getProductReviews(productId)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [open, productId])

  const myReview = summary?.reviews.find(r => r.userId === userId) ?? null

  const handleSubmit = async () => {
    if (isSubmitting) { return }
    setIsSubmitting(true)
    try {
      await createProductReview(productId, rating, content.trim())
      setContent('')
      setRating(5)
      const updated = await getProductReviews(productId)
      setSummary(updated)
      toast.success('리뷰가 등록됐어요')
    } catch {
      toast.error('리뷰 등록에 실패했어요')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('리뷰를 삭제할까요?')) { return }
    try {
      await deleteProductReview(reviewId)
      const updated = await getProductReviews(productId)
      setSummary(updated)
      toast.success('리뷰가 삭제됐어요')
    } catch {
      toast.error('삭제에 실패했어요')
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={productName}>
      <div className="pb-4 flex flex-col gap-4">

        {/* 평균 별점 요약 */}
        {summary && summary.totalCount > 0 && (
          <div className="flex items-center gap-3 bg-[#F8FAFF] rounded-2xl px-4 py-3">
            <span className="text-[36px] font-bold text-[#191F28] leading-none">
              {summary.avgRating?.toFixed(1)}
            </span>
            <div>
              <StarDisplay rating={Math.round(summary.avgRating ?? 0)} size="lg" />
              <p className="text-[12px] text-[#ADB5C0] mt-0.5">리뷰 {summary.totalCount}개</p>
            </div>
          </div>
        )}

        {/* 리뷰 작성 (로그인 & 미작성 시) */}
        {isLoggedIn && !myReview && (
          <div className="bg-[#F8F9FA] rounded-2xl px-4 py-4 flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-[#191F28]">리뷰 작성</p>
            <StarSelector value={rating} onChange={setRating} />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="사용 후기를 남겨보세요 (선택)"
              rows={2}
              maxLength={200}
              className="w-full bg-white border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6] resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#3182F6] text-white rounded-xl text-[14px] font-semibold disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        )}

        {/* 리뷰 목록 */}
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : summary?.reviews.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-[#ADB5C0]">아직 리뷰가 없어요</p>
        ) : (
          <div className="flex flex-col gap-3">
            {summary?.reviews.map(review => (
              <div key={review.id} className="flex flex-col gap-1.5 pb-3 border-b border-[#F2F4F6] last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-[#3182F6]">{review.nickname[0]}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#191F28]">{review.nickname}</span>
                    <span className="text-[11px] text-[#ADB5C0]">{formatTime(review.createdAt)}</span>
                  </div>
                  {review.userId === userId && (
                    <button onClick={() => handleDelete(review.id)} className="p-1">
                      <Trash2 size={13} className="text-[#ADB5C0]" />
                    </button>
                  )}
                </div>
                <StarDisplay rating={review.rating} />
                {review.content && (
                  <p className="text-[13px] text-[#191F28] whitespace-pre-wrap">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </BottomSheet>
  )
}

export default ProductReviewSheet
