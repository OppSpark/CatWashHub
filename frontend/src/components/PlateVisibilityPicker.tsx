import { getMyCar } from '@/api/gatheringApi'
import { useEffect, useState } from 'react'

interface PlateVisibilityPickerProps {
  showPlate: boolean
  plateDigits: number // 공개할 뒷자리 수 (2~4)
  showCarInfo: boolean
  onChangeShowPlate: (v: boolean) => void
  onChangePlateDigits: (v: number) => void
  onChangeShowCarInfo: (v: boolean) => void
}

// 번호판 마스킹 미리보기 (프론트용)
const previewPlate = (plate: string, digits: number): string => {
  if (!plate) { return '' }
  const parts = plate.trim().split(' ')
  return parts.map((part, i) => {
    // 한글 포함 파트: 숫자만 마스킹
    if (part.match(/[가-힣]/)) {
      return part.replace(/[0-9]/g, '*')
    }
    // 마지막 파트(뒷번호): digits만큼 공개
    if (i === parts.length - 1) {
      if (part.length <= digits) { return part }
      return '*'.repeat(part.length - digits) + part.slice(part.length - digits)
    }
    // 앞 숫자 파트: 전체 마스킹
    return '*'.repeat(part.length)
  }).join(' ')
}

const PlateVisibilityPicker = ({
  showPlate,
  plateDigits,
  showCarInfo,
  onChangeShowPlate,
  onChangePlateDigits,
  onChangeShowCarInfo,
}: PlateVisibilityPickerProps) => {
  const [plateNumber, setPlateNumber] = useState<string | null>(null)

  useEffect(() => {
    getMyCar().then(car => setPlateNumber(car?.plateNumber ?? null)).catch(() => {})
  }, [])

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange(!value) }}
      className={`w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-[#3182F6]' : 'bg-[#E5E8EB]'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* 번호판 공개 */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] text-[#191F28]">번호판 공개</p>
            <p className="text-[12px] text-[#ADB5C0]">뒷자리 일부를 공개해요</p>
          </div>
          <Toggle value={showPlate} onChange={onChangeShowPlate} />
        </div>

        {showPlate && (
          <div className="mt-3">
            {/* 자릿수 선택 */}
            <p className="text-[12px] text-[#6B7684] mb-2">공개할 뒷자리 수</p>
            <div className="flex gap-2">
              {[2, 3, 4].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={e => { e.stopPropagation(); onChangePlateDigits(d) }}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
                    plateDigits === d
                      ? 'bg-[#3182F6] text-white border-[#3182F6]'
                      : 'bg-white text-[#6B7684] border-[#E5E8EB]'
                  }`}
                >
                  뒤 {d}자리
                </button>
              ))}
            </div>

            {/* 미리보기 */}
            {plateNumber ? (
              <div className="mt-2.5 bg-[#F2F4F6] rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-[12px] text-[#ADB5C0]">미리보기</span>
                <span className="text-[14px] font-bold text-[#191F28] tracking-wider">
                  {previewPlate(plateNumber, plateDigits)}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-[12px] text-[#ADB5C0]">마이페이지에서 번호판을 먼저 등록해주세요</p>
            )}
          </div>
        )}
      </div>

      {/* 차종 · 색상 공개 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] text-[#191F28]">차종 · 색상 공개</p>
          <p className="text-[12px] text-[#ADB5C0]">완전 비공개 가능</p>
        </div>
        <Toggle value={showCarInfo} onChange={onChangeShowCarInfo} />
      </div>
    </div>
  )
}

export default PlateVisibilityPicker
