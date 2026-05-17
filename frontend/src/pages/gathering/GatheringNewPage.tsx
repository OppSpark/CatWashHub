import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGathering } from '@/api/gatheringApi'
import type { GatheringRequest } from '@/types/gathering'
import PageLayout from '@/layouts/PageLayout'
import { useToast } from '@/hooks/useToast'
import DatePicker from '@/components/DatePicker'
import TimePicker from '@/components/TimePicker'
import PlateVisibilityPicker from '@/components/PlateVisibilityPicker'
import { CalendarDays, Clock } from 'lucide-react'

const GatheringNewPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('09:00')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [location, setLocation] = useState('')
  const [locationDetail, setLocationDetail] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [showPlate, setShowPlate] = useState(false)
  const [plateDigits, setPlateDigits] = useState(2)
  const [showCarInfo, setShowCarInfo] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !date || !time || !location.trim()) {
      toast.error('제목, 날짜, 시간, 장소는 필수예요')
      return
    }
    setIsSubmitting(true)
    try {
      const req: GatheringRequest = {
        title: title.trim(),
        description: description.trim() || null,
        gatheringAt: `${date}T${time}:00`,
        location: location.trim(),
        locationDetail: locationDetail.trim() || null,
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        showPlate,
        plateDigits,
        showCarInfo,
      }
      const res = await createGathering(req)
      navigate(`/gathering/${res.id}`, { replace: true })
    } catch {
      toast.error('벙 개설에 실패했어요')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout title="벙 열기" onBack hasFixedButton>
      <div className="flex flex-col gap-3 pb-32">

        <div className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[12px] text-[#ADB5C0] mb-1.5">제목 *</p>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: 이번 주말 셀프세차 같이 해요"
              maxLength={50}
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          </div>

          <div>
            <p className="text-[12px] text-[#ADB5C0] mb-1.5">설명</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="벙에 대한 추가 설명을 적어주세요"
              rows={3}
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6] resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[12px] text-[#ADB5C0] mb-1.5">날짜 *</p>
              <button
                onClick={() => setShowDatePicker(true)}
                className="w-full flex items-center gap-2 border border-[#E5E8EB] rounded-xl px-3 py-2.5 active:border-[#3182F6]"
              >
                <CalendarDays size={15} className="text-[#3182F6] shrink-0" />
                <span className="text-[13px] text-[#191F28]">
                  {(() => { const d = new Date(date); return `${d.getMonth()+1}/${d.getDate()}` })()}
                </span>
              </button>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-[#ADB5C0] mb-1.5">시간 *</p>
              <button
                onClick={() => setShowTimePicker(true)}
                className="w-full flex items-center gap-2 border border-[#E5E8EB] rounded-xl px-3 py-2.5 active:border-[#3182F6]"
              >
                <Clock size={15} className="text-[#3182F6] shrink-0" />
                <span className="text-[13px] text-[#191F28]">
                  {(() => { const [h, m] = time.split(':').map(Number); const ampm = h < 12 ? '오전' : '오후'; return `${ampm} ${h % 12 || 12}:${String(m).padStart(2,'0')}` })()}
                </span>
              </button>
            </div>
          </div>

          <DatePicker open={showDatePicker} value={date} onClose={() => setShowDatePicker(false)} onConfirm={setDate} />
          <TimePicker open={showTimePicker} value={time} onClose={() => setShowTimePicker(false)} onConfirm={setTime} />

          <div>
            <p className="text-[12px] text-[#ADB5C0] mb-1.5">세차장 *</p>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="예: 강남구 셀프세차장"
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          </div>

          <div>
            <p className="text-[12px] text-[#ADB5C0] mb-1.5">상세 주소</p>
            <input
              value={locationDetail}
              onChange={e => setLocationDetail(e.target.value)}
              placeholder="예: 서울시 강남구 테헤란로 123"
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          </div>

          <div>
            <p className="text-[12px] text-[#ADB5C0] mb-1.5">최대 인원</p>
            <input
              type="number"
              value={maxParticipants}
              onChange={e => setMaxParticipants(e.target.value)}
              placeholder="제한 없으면 비워두세요"
              min={2}
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          </div>
        </div>

        {/* 차량 공개 설정 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[14px] font-semibold text-[#191F28] mb-1">차량 공개 설정</p>
          <p className="text-[12px] text-[#ADB5C0] mb-4">마이페이지에서 차량 정보를 먼저 등록해야 표시돼요</p>
          <PlateVisibilityPicker
            showPlate={showPlate}
            plateDigits={plateDigits}
            showCarInfo={showCarInfo}
            onChangeShowPlate={setShowPlate}
            onChangePlateDigits={setPlateDigits}
            onChangeShowCarInfo={setShowCarInfo}
          />
        </div>

      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-50"
        >
          {isSubmitting ? '개설 중...' : '벙 열기'}
        </button>
      </div>
    </PageLayout>
  )
}

export default GatheringNewPage
