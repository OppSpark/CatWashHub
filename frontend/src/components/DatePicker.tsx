import { useState, useEffect } from 'react'
import BottomSheet from '@/components/BottomSheet'
import DrumRollColumn from '@/components/DrumRollPicker'

interface DatePickerProps {
  open: boolean
  value: string // 'YYYY-MM-DD'
  onClose: () => void
  onConfirm: (value: string) => void
  minDate?: string
  maxDate?: string
}

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i)

const DatePicker = ({ open, value, onClose, onConfirm, minDate, maxDate }: DatePickerProps) => {
  const today = new Date()
  const minYear = minDate ? new Date(minDate).getFullYear() : 2020
  const maxYear = maxDate ? new Date(maxDate).getFullYear() : today.getFullYear() + 2

  const years = range(minYear, maxYear)
  const months = range(1, 12)

  const parseValue = (v: string) => {
    if (!v) { return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() } }
    const [y, m, d] = v.split('-').map(Number)
    return { year: y, month: m, day: d }
  }

  const [year, setYear] = useState(parseValue(value).year)
  const [month, setMonth] = useState(parseValue(value).month)
  const [day, setDay] = useState(parseValue(value).day)

  useEffect(() => {
    if (open) {
      const parsed = parseValue(value)
      setYear(parsed.year)
      setMonth(parsed.month)
      setDay(parsed.day)
    }
  }, [open, value])

  const daysInMonth = new Date(year, month, 0).getDate()
  const days = range(1, daysInMonth)

  // 날 범위 벗어나면 보정
  useEffect(() => {
    if (day > daysInMonth) { setDay(daysInMonth) }
  }, [year, month, daysInMonth])

  const handleConfirm = () => {
    const m = String(month).padStart(2, '0')
    const d = String(Math.min(day, daysInMonth)).padStart(2, '0')
    onConfirm(`${year}-${m}-${d}`)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="날짜 선택"
      footer={
        <button
          onClick={handleConfirm}
          className="w-full bg-[#3182F6] text-white rounded-xl py-3.5 text-[15px] font-semibold"
        >
          확인
        </button>
      }
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <DrumRollColumn
          items={years.map(y => `${y}년`)}
          selectedIndex={years.indexOf(year)}
          onSelect={i => setYear(years[i])}
          width="flex-1"
        />
        <DrumRollColumn
          items={months.map(m => `${m}월`)}
          selectedIndex={months.indexOf(month)}
          onSelect={i => setMonth(months[i])}
          width="w-20"
        />
        <DrumRollColumn
          items={days.map(d => `${d}일`)}
          selectedIndex={days.indexOf(Math.min(day, daysInMonth))}
          onSelect={i => setDay(days[i])}
          width="w-20"
        />
      </div>
    </BottomSheet>
  )
}

export default DatePicker
