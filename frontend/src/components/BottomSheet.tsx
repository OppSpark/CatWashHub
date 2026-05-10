import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  bottomOffset?: number  // BottomNav 등 하단 고정 요소 높이 (px)
}

// snap 단계: 'half' = 50dvh, 'full' = 92dvh
type SnapPoint = 'half' | 'full'

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  half: '65dvh',
  full: '92dvh',
}

const DRAG_CLOSE_THRESHOLD = 100   // px — half에서 이 이상 내리면 닫힘
const DRAG_EXPAND_THRESHOLD = 80   // px — half에서 이 이상 올리면 full로
const DRAG_SHRINK_THRESHOLD = 80   // px — full에서 이 이상 내리면 half로
const VELOCITY_THRESHOLD = 0.4     // px/ms

const BottomSheet = ({ open, onClose, title, children, footer, bottomOffset = 0 }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const dragStartTime = useRef(0)
  const dragDelta = useRef(0)
  const [snap, setSnap] = useState<SnapPoint>('half')
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // 열릴 때 half로 시작
  useEffect(() => {
    if (open) {
      setSnap('half')
      setTranslateY(600)
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTranslateY(0))
      })
    } else {
      setTranslateY(600)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setSnap('half')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // 배경 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // visualViewport로 키보드 높이 감지
  useEffect(() => {
    if (!open) { return }
    const vv = window.visualViewport
    if (!vv) { return }

    const handleResize = () => {
      const keyboardH = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardHeight(Math.max(0, keyboardH))
    }

    vv.addEventListener('resize', handleResize)
    vv.addEventListener('scroll', handleResize)
    handleResize()

    return () => {
      vv.removeEventListener('resize', handleResize)
      vv.removeEventListener('scroll', handleResize)
      setKeyboardHeight(0)
    }
  }, [open])

  // ==================== 드래그 핸들러 ====================

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    // full 상태에서 콘텐츠 스크롤 영역은 드래그 무시
    if (snap === 'full' && target.closest('[data-scroll]')) { return }
    dragStartY.current = e.touches[0].clientY
    dragStartTime.current = Date.now()
    dragDelta.current = 0
    setIsDragging(true)
  }, [snap])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) { return }
    const delta = e.touches[0].clientY - dragStartY.current
    dragDelta.current = delta
    // 범위 제한: 위로는 40px까지만 당겨지는 느낌
    const clamped = delta < 0 ? Math.max(delta, -40) : delta
    setTranslateY(clamped)
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) { return }
    setIsDragging(false)

    const elapsed = Date.now() - dragStartTime.current
    const velocity = dragDelta.current / Math.max(elapsed, 1)
    const delta = dragDelta.current

    if (snap === 'half') {
      if (delta > DRAG_CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        // 닫기
        onClose()
      } else if (delta < -DRAG_EXPAND_THRESHOLD || velocity < -VELOCITY_THRESHOLD) {
        // full로 확장
        setSnap('full')
        setTranslateY(0)
      } else {
        setTranslateY(0)
      }
    } else {
      // full 상태
      if (delta > DRAG_SHRINK_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        if (delta > DRAG_SHRINK_THRESHOLD * 2.5 || velocity > VELOCITY_THRESHOLD * 2) {
          // 많이 내리면 바로 닫기
          onClose()
        } else {
          // half로 축소
          setSnap('half')
          setTranslateY(0)
        }
      } else {
        setTranslateY(0)
      }
    }

    dragDelta.current = 0
  }, [isDragging, snap, onClose])

  if (!isVisible) { return null }

  const portal = document.getElementById('modal-root') ?? document.body

  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none">
      {/* 딤드 배경 */}
      <div
        className="absolute inset-0 pointer-events-auto transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* 시트 본체 */}
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-3xl flex flex-col pointer-events-auto"
        style={{
          height: SNAP_HEIGHTS[snap],
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), height 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : bottomOffset > 0 ? `${bottomOffset}px` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 touch-none">
          <div className="w-10 h-1 bg-[#E5E8EB] rounded-full" />
        </div>

        {/* 헤더 */}
        {title !== undefined && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
            <p className="text-[17px] font-bold text-[#191F28]">{title}</p>
            <button onClick={onClose} className="text-[14px] text-[#ADB5C0] px-1 py-1">닫기</button>
          </div>
        )}

        {/* 콘텐츠 */}
        <div data-scroll className="flex-1 overflow-y-auto px-5 pb-2 overscroll-contain">
          {children}
        </div>

        {/* 하단 버튼 */}
        {footer !== undefined && (
          <div className="px-5 pt-3 pb-5 shrink-0 border-t border-[#F2F4F6]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    portal,
  )
}

export default BottomSheet
