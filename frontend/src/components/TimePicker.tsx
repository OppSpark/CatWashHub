import { useState, useEffect } from 'react'
import BottomSheet from '@/components/BottomSheet'
import DrumRollColumn from '@/components/DrumRollPicker'

interface TimePickerProps {
  open: boolean
  value: string // 'HH:mm'
  onClose: () => void
  onConfirm: (value: string) => void
}

const ampmItems = ['오전', '오후']
const hours = Array.from({ length: 12 }, (_, i) => i + 1) // 1~12
const minutes = Array.from({ length: 60 }, (_, i) => i)   // 0~59

const TimePicker = ({ open, value, onClose, onConfirm }: TimePickerProps) => {
  const parseValue = (v: string) => {
    if (!v) { return { ampm: 0, hour: 9, minute: 0 } }
    const [h, m] = v.split(':').map(Number)
    return {
      ampm: h < 12 ? 0 : 1,
      hour: h % 12 || 12,
      minute: m,
    }
  }

  const [ampm, setAmpm] = useState(parseValue(value).ampm)
  const [hour, setHour] = useState(parseValue(value).hour)
  const [minute, setMinute] = useState(parseValue(value).minute)

  useEffect(() => {
    if (open) {
      const parsed = parseValue(value)
      setAmpm(parsed.ampm)
      setHour(parsed.hour)
      setMinute(parsed.minute)
    }
  }, [open, value])

  const handleConfirm = () => {
    let h = hour % 12
    if (ampm === 1) { h += 12 }
    const hStr = String(h).padStart(2, '0')
    const mStr = String(minute).padStart(2, '0')
    onConfirm(`${hStr}:${mStr}`)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="시간 선택"
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
          items={ampmItems}
          selectedIndex={ampm}
          onSelect={setAmpm}
          width="w-20"
        />
        <DrumRollColumn
          items={hours.map(h => `${h}시`)}
          selectedIndex={hours.indexOf(hour)}
          onSelect={i => setHour(hours[i])}
          width="flex-1"
        />
        <DrumRollColumn
          items={minutes.map(m => String(m).padStart(2, '0') + '분')}
          selectedIndex={minute}
          onSelect={i => setMinute(minutes[i])}
          width="flex-1"
        />
      </div>
    </BottomSheet>
  )
}

export default TimePicker
