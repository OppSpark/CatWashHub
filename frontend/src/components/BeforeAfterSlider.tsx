import { useRef, useState, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeUrl: string
  afterUrl: string
}

const BeforeAfterSlider = ({ beforeUrl, afterUrl }: BeforeAfterSliderProps) => {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) { return }
    const rect = containerRef.current.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setPosition(pct)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updatePosition(e.clientX)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) { return }
    updatePosition(e.clientX)
  }

  const onMouseUp = () => {
    isDragging.current = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-2xl overflow-hidden select-none cursor-col-resize"
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
    >
      {/* AFTER (배경) */}
      <img src={afterUrl} alt="after" className="absolute inset-0 w-full h-full object-cover" />

      {/* BEFORE (클립) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={beforeUrl} alt="before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${10000 / position}%`, maxWidth: 'none' }} />
      </div>

      {/* 구분선 */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <span className="text-[#3182F6] text-[12px] font-bold">↔</span>
        </div>
      </div>

      {/* 라벨 */}
      <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-0.5">
        <span className="text-[10px] text-white font-semibold">전</span>
      </div>
      <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-0.5">
        <span className="text-[10px] text-white font-semibold">후</span>
      </div>
    </div>
  )
}

export default BeforeAfterSlider
