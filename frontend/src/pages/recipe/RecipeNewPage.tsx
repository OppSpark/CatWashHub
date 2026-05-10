import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRecipe } from '@/api/recipeApi'
import type { RecipeStepDraft, StepType } from '@/types/recipe'
import { STEP_TYPE_LABELS, STEP_TYPE_COLORS } from '@/types/recipe'
import { useToast } from '@/hooks/useToast'
import PageLayout from '@/layouts/PageLayout'
import ProductPickerSheet from '@/components/ProductPickerSheet'
import type { Product } from '@/types/calculator'
import { Plus, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

const STEP_TYPES = Object.entries(STEP_TYPE_LABELS) as [StepType, string][]

// ==================== 단계 편집 아이템 ====================
interface StepItemProps {
  step: RecipeStepDraft
  index: number
  onUpdate: (index: number, updated: Partial<RecipeStepDraft>) => void
  onRemove: (index: number) => void
  onPickProduct: (index: number) => void
}

const StepItem = ({ step, index, onUpdate, onRemove, onPickProduct }: StepItemProps) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical size={18} className="text-[#ADB5C0] shrink-0" />
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ backgroundColor: STEP_TYPE_COLORS[step.stepType] }}
        >
          {index + 1}
        </span>
        <p className="flex-1 text-[14px] font-semibold text-[#191F28]">
          {step.stepType === 'OTHER' && step.customLabel ? step.customLabel : STEP_TYPE_LABELS[step.stepType]}
        </p>
        <button onClick={() => setExpanded(v => !v)} className="p-1 text-[#ADB5C0]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={() => onRemove(index)} className="p-1 text-[#ADB5C0]">
          <X size={16} />
        </button>
      </div>

      {/* 상세 입력 */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-[#F2F4F6]">
          {/* 공정 타입 선택 */}
          <div className="mt-3">
            <p className="text-[12px] text-[#6B7684] mb-1.5">공정 단계</p>
            <div className="flex flex-wrap gap-1.5">
              {STEP_TYPES.map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => onUpdate(index, { stepType: type })}
                  className="text-[12px] px-2.5 py-1 rounded-full transition"
                  style={step.stepType === type ? {
                    backgroundColor: STEP_TYPE_COLORS[type],
                    color: '#fff',
                  } : {
                    backgroundColor: '#F2F4F6',
                    color: '#6B7684',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 기타 선택 시 직접입력 */}
          {step.stepType === 'OTHER' && (
            <input
              value={step.customLabel}
              onChange={e => onUpdate(index, { customLabel: e.target.value })}
              placeholder="단계 이름 직접 입력"
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          )}

          {/* 제품 선택 */}
          <div>
            <p className="text-[12px] text-[#6B7684] mb-1.5">사용 제품 (선택)</p>
            {step.productName ? (
              <div className="flex items-center gap-2 bg-[#EFF6FF] rounded-xl px-3 py-2.5">
                <p className="flex-1 text-[13px] font-medium text-[#3182F6]">{step.productName}</p>
                <button
                  onClick={() => onUpdate(index, { productId: null, productName: null, ratio: null })}
                  className="text-[#ADB5C0]"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onPickProduct(index)}
                className="w-full border border-dashed border-[#C8D0DA] rounded-xl px-3 py-2.5 text-[13px] text-[#ADB5C0] flex items-center gap-1.5"
              >
                <Plus size={14} />
                제품 선택
              </button>
            )}
          </div>

          {/* 희석비 */}
          {step.productName && (
            <div>
              <p className="text-[12px] text-[#6B7684] mb-1.5">희석비 (선택)</p>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#6B7684]">1:</span>
                <input
                  type="number"
                  value={step.ratio ?? ''}
                  onChange={e => onUpdate(index, { ratio: e.target.value ? Number(e.target.value) : null })}
                  placeholder="예) 100"
                  className="flex-1 border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
                />
              </div>
            </div>
          )}

          {/* 메모 */}
          <div>
            <p className="text-[12px] text-[#6B7684] mb-1.5">메모 (선택)</p>
            <input
              value={step.memo}
              onChange={e => onUpdate(index, { memo: e.target.value })}
              placeholder="예) 5분 대기 후 헹굼"
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== 메인 ====================
const RecipeNewPage = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [carModel, setCarModel] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [steps, setSteps] = useState<RecipeStepDraft[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showStepSheet, setShowStepSheet] = useState(false)
  const [pickerTargetIndex, setPickerTargetIndex] = useState<number | null>(null)

  const addStep = () => {
    setSteps(prev => [...prev, {
      stepOrder: prev.length + 1,
      stepType: 'MAIN_WASH',
      customLabel: '',
      productId: null,
      productName: null,
      ratio: null,
      memo: '',
    }])
  }

  const updateStep = (index: number, updated: Partial<RecipeStepDraft>) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, ...updated } : s))
  }

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, stepOrder: i + 1 })))
  }

  const handlePickProduct = (index: number) => {
    setPickerTargetIndex(index)
    setShowStepSheet(true)
  }

  const handleProductPicked = (product: Product) => {
    if (pickerTargetIndex === null) { return }
    updateStep(pickerTargetIndex, {
      productId: product.id,
      productName: product.name,
      ratio: product.dilutionRatios[0]?.ratio ?? null,
    })
    setShowStepSheet(false)
    setPickerTargetIndex(null)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('레시피 제목을 입력해주세요')
      return
    }
    if (steps.length === 0) {
      toast.error('최소 1개 이상의 단계를 추가해주세요')
      return
    }
    try {
      setIsSaving(true)
      const recipe = await createRecipe({
        title: title.trim(),
        description: description.trim(),
        carModel: carModel.trim(),
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        visibility,
        steps,
      })
      toast.success('레시피를 저장했어요')
      navigate(`/recipe/${recipe.id}`, { replace: true })
    } catch {
      toast.error('저장에 실패했어요')
      setIsSaving(false)
    }
  }

  return (
    <PageLayout title="레시피 작성" onBack hasFixedButton>
      <div className="flex flex-col gap-3">

        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-3">
          <p className="text-[15px] font-bold text-[#191F28]">기본 정보</p>

          <div>
            <p className="text-[12px] text-[#6B7684] mb-1.5">레시피 이름 *</p>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예) 여름 황사 대응 루틴"
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />
          </div>

          <div>
            <p className="text-[12px] text-[#6B7684] mb-1.5">설명 (선택)</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="레시피에 대한 간단한 설명을 입력해주세요"
              rows={3}
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[12px] text-[#6B7684] mb-1.5">차종 (선택)</p>
              <input
                value={carModel}
                onChange={e => setCarModel(e.target.value)}
                placeholder="예) 아반떼 CN7"
                className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
              />
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-[#6B7684] mb-1.5">소요시간 (분)</p>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(e.target.value)}
                placeholder="예) 45"
                className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
              />
            </div>
          </div>

          {/* 공개 설정 */}
          <div className="flex items-center gap-3">
            {(['PUBLIC', 'PRIVATE'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  visibility === v
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#F2F4F6] text-[#6B7684]'
                }`}
              >
                {v === 'PUBLIC' ? '🌐 전체 공개' : '🔒 나만 보기'}
              </button>
            ))}
          </div>
        </div>

        {/* 공정 단계 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[15px] font-bold text-[#191F28]">
              공정 단계
              {steps.length > 0 && (
                <span className="ml-1.5 text-[13px] text-[#3182F6]">{steps.length}개</span>
              )}
            </p>
          </div>

          {steps.map((step, i) => (
            <StepItem
              key={i}
              step={step}
              index={i}
              onUpdate={updateStep}
              onRemove={removeStep}
              onPickProduct={handlePickProduct}
            />
          ))}

          <button
            onClick={addStep}
            className="w-full py-3.5 border-2 border-dashed border-[#C8D0DA] rounded-2xl flex items-center justify-center gap-2 text-[14px] font-medium text-[#6B7684] active:brightness-95"
          >
            <Plus size={18} />
            단계 추가
          </button>
        </div>
      </div>

      {/* 제품 선택 시트 */}
      <ProductPickerSheet
        open={showStepSheet}
        onClose={() => { setShowStepSheet(false); setPickerTargetIndex(null) }}
        onSelect={handleProductPicked}
      />

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
        >
          {isSaving ? '저장 중...' : '레시피 저장'}
        </button>
      </div>
    </PageLayout>
  )
}

export default RecipeNewPage
