import { useEffect, useRef, useCallback } from 'react'

interface DrumRollColumnProps {
  items: string[]
  selectedIndex: number
  onSelect: (index: number) => void
  width?: string
}

const ITEM_HEIGHT = 48

const DrumRollColumn = ({ items, selectedIndex, onSelect, width = 'flex-1' }: DrumRollColumnProps) => {
  const listRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startScrollTop = useRef(0)

  // 선택 인덱스가 바뀌면 스크롤 동기화
  useEffect(() => {
    const el = listRef.current
    if (!el) { return }
    const target = selectedIndex * ITEM_HEIGHT
    if (Math.abs(el.scrollTop - target) > 2) {
      el.scrollTo({ top: target, behavior: 'smooth' })
    }
  }, [selectedIndex])

  const snapToNearest = useCallback(() => {
    const el = listRef.current
    if (!el) { return }
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(items.length - 1, idx))
    el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' })
    onSelect(clamped)
  }, [items.length, onSelect])

  const onScroll = () => {
    if (isDragging.current) { return }
  }

  const onScrollEnd = useCallback(() => {
    if (!isDragging.current) { snapToNearest() }
  }, [snapToNearest])

  // 터치
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true
    startY.current = e.touches[0].clientY
    startScrollTop.current = listRef.current?.scrollTop ?? 0
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const el = listRef.current
    if (!el) { return }
    const dy = startY.current - e.touches[0].clientY
    el.scrollTop = startScrollTop.current + dy
  }

  const onTouchEnd = () => {
    isDragging.current = false
    snapToNearest()
  }

  // 마우스
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startY.current = e.clientY
    startScrollTop.current = listRef.current?.scrollTop ?? 0
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
    const el = listRef.current
    if (!el || !isDragging.current) { return }
    const dy = startY.current - e.clientY
    el.scrollTop = startScrollTop.current + dy
  }

  const onMouseUp = () => {
    isDragging.current = false
    snapToNearest()
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  return (
    <div className={`relative ${width} overflow-hidden`} style={{ height: `${ITEM_HEIGHT * 3}px` }}>
      {/* 선택 영역 하이라이트 */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10 border-y border-[#3182F6]"
        style={{ top: `${ITEM_HEIGHT * 1}px`, height: `${ITEM_HEIGHT}px` }}
      />

      {/* 상단/하단 그라데이션 */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <div
        ref={listRef}
        onScroll={onScroll}
        onScrollCapture={onScrollEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        className="h-full overflow-y-scroll select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingTop: `${ITEM_HEIGHT * 1}px`,
          paddingBottom: `${ITEM_HEIGHT * 1}px`,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => onSelect(i)}
            className="flex items-center justify-center cursor-pointer transition-all"
            style={{ height: `${ITEM_HEIGHT}px` }}
          >
            <span
              className={`text-[16px] transition-all duration-200 ${
                i === selectedIndex
                  ? 'font-bold text-[#191F28] scale-110'
                  : 'font-normal text-[#ADB5C0]'
              }`}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DrumRollColumn
