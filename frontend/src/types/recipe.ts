export type StepType =
  | 'PRE_RINSE'
  | 'PRE_WASH'
  | 'WHEEL'
  | 'MAIN_WASH'
  | 'IRON_REMOVE'
  | 'CLAY'
  | 'DRY'
  | 'GLASS'
  | 'COATING'
  | 'TIRE_DRESSING'
  | 'INTERIOR'
  | 'OTHER'

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  PRE_RINSE: '헹굼(프리)',
  PRE_WASH: '프리워시',
  WHEEL: '휠/타이어',
  MAIN_WASH: '본세차',
  IRON_REMOVE: '철분제거',
  CLAY: '점토세정',
  DRY: '건조',
  GLASS: '유리세정',
  COATING: '코팅/왁스',
  TIRE_DRESSING: '타이어 드레싱',
  INTERIOR: '실내청소',
  OTHER: '기타',
}

export const STEP_TYPE_COLORS: Record<StepType, string> = {
  PRE_RINSE: '#60A5FA',
  PRE_WASH: '#818CF8',
  WHEEL: '#F59E0B',
  MAIN_WASH: '#3182F6',
  IRON_REMOVE: '#EF4444',
  CLAY: '#8B5CF6',
  DRY: '#6B7684',
  GLASS: '#06B6D4',
  COATING: '#10B981',
  TIRE_DRESSING: '#374151',
  INTERIOR: '#F97316',
  OTHER: '#ADB5C0',
}

export interface RecipeStep {
  id: number
  stepOrder: number
  stepType: StepType
  stepTypeLabel: string
  displayLabel: string
  productId: number | null
  productName: string | null
  ratio: number | null
  memo: string | null
}

export interface Recipe {
  id: number
  authorId: number
  authorNickname: string
  title: string
  description: string | null
  carModel: string | null
  estimatedMinutes: number | null
  visibility: 'PUBLIC' | 'PRIVATE'
  saveCount: number
  isSaved: boolean
  createdAt: string
  steps: RecipeStep[]
}

export interface RecipeStepDraft {
  stepOrder: number
  stepType: StepType
  customLabel: string
  productId: number | null
  productName: string | null
  ratio: number | null
  memo: string
}
