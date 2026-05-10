import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface PageLayoutProps {
  children?: ReactNode

  // 헤더
  title?: string
  headerVariant?: 'default' | 'large'  // default: 18px 타이틀바, large: 22px 대형 타이틀 (홈·계산기 스타일)
  headerSubtitle?: string               // large 전용 서브텍스트
  onBack?: (() => void) | boolean       // 함수: 커스텀 동작, true: navigate(-1), 생략: 버튼 없음
  headerRight?: ReactNode               // 우상단 액션 버튼 영역
  stickyTab?: ReactNode                 // 헤더 바로 아래 고정 탭바

  // 하단 여백
  hasFixedButton?: boolean              // fixed 저장버튼 있는 페이지 → pb 더 크게
  noPadding?: boolean                   // 콘텐츠 영역 px 없음 (검색바 full-width 등)

  // 배경
  bgColor?: string                      // 기본: #F2F4F6

  // 전체 로딩 스피너
  isLoading?: boolean

  // 전체 화면 (헤더/패딩 없음 — 지도, 이미지뷰어 등)
  fullscreen?: boolean

  // 당겨서 새로고침
  onRefresh?: () => Promise<void>
}

const PULL_THRESHOLD = 64

const PageLayout = ({
  children,
  title,
  headerVariant = 'default',
  headerSubtitle,
  onBack,
  headerRight,
  stickyTab,
  hasFixedButton = false,
  noPadding = false,
  bgColor = '#F2F4F6',
  isLoading = false,
  fullscreen = false,
  onRefresh,
}: PageLayoutProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack()
    } else {
      navigate(-1)
    }
  }

  // ── 당겨서 새로고침 ──────────────────────────────────────
  const [pullY, setPullY] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh) { return }
    touchStartY.current = e.touches[0].clientY
  }, [onRefresh])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || isRefreshing) { return }
    const scrollTop = scrollRef.current?.scrollTop ?? 0
    if (scrollTop > 0) { return }
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0) { setPullY(Math.min(delta * 0.4, PULL_THRESHOLD)) }
  }, [onRefresh, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!onRefresh || pullY < PULL_THRESHOLD) {
      setPullY(0)
      return
    }
    setIsRefreshing(true)
    setPullY(0)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, pullY])

  // ── 전체 화면 모드 ────────────────────────────────────────
  if (fullscreen) {
    return (
      <div className="min-h-dvh" style={{ backgroundColor: bgColor }}>
        {children}
      </div>
    )
  }

  // ── 전체 로딩 ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="w-8 h-8 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasHeader = title !== undefined || onBack !== undefined || headerRight !== undefined
  const bottomPadding = hasFixedButton ? 'pb-32' : 'pb-24'

  return (
    <div
      className={`min-h-dvh flex flex-col ${bottomPadding}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* 당겨서 새로고침 인디케이터 */}
      {onRefresh && (pullY > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: isRefreshing ? 48 : pullY }}
        >
          <div className={`w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`} />
        </div>
      )}

      {/* 헤더 — default: 타이틀바 / large: 대형 타이틀 */}
      {hasHeader && (
        headerVariant === 'large' ? (
          <div className="bg-white px-5 pt-3 pb-5 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {headerSubtitle && (
                  <p className="text-[14px] text-[#6B7684] mb-0.5">{headerSubtitle}</p>
                )}
                <h1 className="text-[22px] font-bold text-[#191F28]">{title}</h1>
              </div>
              {headerRight && <div className="shrink-0 pt-1">{headerRight}</div>}
            </div>
          </div>
        ) : (
          <div className="bg-white px-5 pt-3 pb-4 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {onBack !== undefined && (
                <button onClick={handleBack} className="p-1 -ml-1 text-[#191F28] shrink-0">
                  <ChevronLeft size={24} />
                </button>
              )}
              {title && (
                <h1 className="text-[18px] font-bold text-[#191F28] truncate">{title}</h1>
              )}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        )
      )}

      {/* 헤더 아래 고정 탭바 */}
      {stickyTab && (
        <div className="bg-white shrink-0">
          {stickyTab}
        </div>
      )}

      {/* 콘텐츠 */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto ${noPadding ? '' : 'px-4 pt-4'}`}
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', backgroundColor: bgColor } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

export default PageLayout
