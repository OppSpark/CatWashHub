import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, Clock, Bookmark, BadgeCheck, User, Info } from 'lucide-react'
import { calculate, getHistory } from '@/api/calculatorApi'
import type { Product, DilutionRatio, CalculationResult } from '@/types/calculator'
import PageLayout from '@/layouts/PageLayout'
import ProductPickerSheet from '@/components/ProductPickerSheet'
import BottomSheet from '@/components/BottomSheet'

type TabType = 'calculator' | 'history'
type RatioMode = 'preset' | 'custom'

const CalculatorPage = () => {
  const [m_Tab, setM_Tab] = useState<TabType>('calculator')

  // 제품 선택
  const [m_SelectedProduct, setM_SelectedProduct] = useState<Product | null>(null)
  const [m_ShowProductSheet, setM_ShowProductSheet] = useState(false)
  const [m_ShowProductDetail, setM_ShowProductDetail] = useState(false)

  // 희석비 선택
  const [m_RatioMode, setM_RatioMode] = useState<RatioMode>('preset')
  const [m_SelectedRatio, setM_SelectedRatio] = useState<DilutionRatio | null>(null)
  const [m_CustomRatio, setM_CustomRatio] = useState('')

  // 물 양 (리터) + 메모
  const [m_WaterL, setM_WaterL] = useState('')
  const [m_Memo, setM_Memo] = useState('')

  // 실시간 계산 결과
  const [m_ProductMl, setM_ProductMl] = useState<number | null>(null)

  // 히스토리
  const [m_History, setM_History] = useState<CalculationResult[]>([])
  const [m_SavedMsg, setM_SavedMsg] = useState(false)

  // ==================== 초기화 함수 ====================
  useEffect(() => {
    if (m_Tab === 'history') {
      loadHistory()
    }
  }, [m_Tab])

  // 값이 바뀔 때마다 실시간 계산
  useEffect(() => {
    computeResult()
  }, [m_SelectedRatio, m_CustomRatio, m_WaterL, m_RatioMode])

  // ==================== 기능별 함수 ====================
  const loadHistory = async () => {
    try {
      const data = await getHistory()
      setM_History(data)
    } catch {
      // 히스토리 로드 실패 시 빈 목록 유지
    }
  }

  const getEffectiveRatio = (): number | null => {
    if (m_RatioMode === 'custom') {
      const parsed = parseInt(m_CustomRatio)
      return isNaN(parsed) || parsed <= 0 ? null : parsed
    }
    return m_SelectedRatio?.ratio ?? null
  }

  // 실시간 계산: 물(L) × 1000 / 희석비 → 약품량(ml)
  const computeResult = () => {
    const ratio = getEffectiveRatio()
    const waterL = parseFloat(m_WaterL)

    if (!ratio || isNaN(waterL) || waterL <= 0) {
      setM_ProductMl(null)
      return
    }

    const productMl = Math.round((waterL * 1000 / ratio) * 10) / 10
    setM_ProductMl(productMl)
  }

  // 히스토리 저장 (백엔드)
  const handleSaveHistory = useCallback(async () => {
    const ratio = getEffectiveRatio()
    const waterL = parseFloat(m_WaterL)
    if (!ratio || isNaN(waterL) || waterL <= 0 || m_ProductMl === null) { return }

    try {
      await calculate({
        productId: m_SelectedProduct?.id,
        ratio,
        waterMl: waterL * 1000,
        memo: m_Memo || undefined,
      })
      setM_SavedMsg(true)
      setTimeout(() => setM_SavedMsg(false), 2000)
      if (m_Tab === 'history') {
        await loadHistory()
      }
    } catch {
      // 저장 실패 무시
    }
  }, [m_SelectedProduct, m_WaterL, m_ProductMl, m_RatioMode, m_SelectedRatio, m_CustomRatio, m_Memo, m_Tab])

  const handleSelectProduct = (product: Product) => {
    setM_SelectedProduct(product)
    setM_SelectedRatio(null)
    setM_RatioMode('preset')
    setM_ShowProductSheet(false)
  }



  const handleReset = () => {
    setM_SelectedProduct(null)
    setM_SelectedRatio(null)
    setM_CustomRatio('')
    setM_WaterL('')
    setM_Memo('')
    setM_ProductMl(null)
    setM_RatioMode('preset')
  }

  const effectiveRatio = getEffectiveRatio()
  const waterL = parseFloat(m_WaterL)
  const isValid = effectiveRatio !== null && !isNaN(waterL) && waterL > 0

  return (
    <PageLayout
      title="희석 계산기"
      headerVariant="large"
      headerSubtitle="약품 희석 비율을 계산해보세요"
      noPadding
    >
      <div className="flex flex-col pb-24">

      {/* 탭 */}
      <div className="bg-white border-b border-[#E5E8EB] px-5 flex gap-6">
        {(['calculator', 'history'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setM_Tab(tab)}
            className={`py-3 text-[15px] font-semibold border-b-2 transition ${
              m_Tab === tab ? 'border-[#3182F6] text-[#3182F6]' : 'border-transparent text-[#ADB5C0]'
            }`}
          >
            {tab === 'calculator' ? '계산기' : '히스토리'}
          </button>
        ))}
      </div>

      {m_Tab === 'calculator' ? (
        <div className="flex-1 px-4 py-4 flex flex-col gap-3">

          {/* STEP 1: 제품 선택 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-[#3182F6] mb-2">STEP 1</p>
            <p className="text-[15px] font-bold text-[#191F28] mb-3">제품 선택</p>
            <button
              onClick={() => setM_ShowProductSheet(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F2F4F6] rounded-xl"
            >
              <div className="flex items-center gap-2">
                {m_SelectedProduct && (
                  m_SelectedProduct.isOfficial
                    ? <BadgeCheck size={16} className="text-[#3182F6]" />
                    : <User size={16} className="text-[#6B7684]" />
                )}
                <span className={`text-[15px] ${m_SelectedProduct ? 'text-[#191F28] font-medium' : 'text-[#ADB5C0]'}`}>
                  {m_SelectedProduct ? m_SelectedProduct.name : '제품을 선택해주세요 (선택사항)'}
                </span>
              </div>
              <ChevronDown size={18} className="text-[#ADB5C0]" />
            </button>
            {m_SelectedProduct && (
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-[12px] text-[#6B7684]">
                  {m_SelectedProduct.brand}
                  {m_SelectedProduct.categoryName && ` · ${m_SelectedProduct.categoryName}`}
                  {m_SelectedProduct.capacityMl && ` · ${m_SelectedProduct.capacityMl}ml`}
                </p>
                <button
                  onClick={() => setM_ShowProductDetail(true)}
                  className="flex items-center gap-1 text-[12px] text-[#3182F6] font-medium"
                >
                  <Info size={13} />
                  상세 보기
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: 희석비 선택 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-[#3182F6] mb-2">STEP 2</p>
            <p className="text-[15px] font-bold text-[#191F28] mb-3">희석비 선택</p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setM_RatioMode('preset')}
                className={`flex-1 py-2 rounded-xl text-[14px] font-semibold transition ${
                  m_RatioMode === 'preset' ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#6B7684]'
                }`}
              >
                추천 희석비
              </button>
              <button
                onClick={() => setM_RatioMode('custom')}
                className={`flex-1 py-2 rounded-xl text-[14px] font-semibold transition ${
                  m_RatioMode === 'custom' ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#6B7684]'
                }`}
              >
                직접 입력
              </button>
            </div>

            {m_RatioMode === 'preset' ? (
              m_SelectedProduct && m_SelectedProduct.dilutionRatios.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {m_SelectedProduct.dilutionRatios.map(ratio => (
                    <button
                      key={ratio.id}
                      onClick={() => setM_SelectedRatio(ratio)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                        m_SelectedRatio?.id === ratio.id ? 'border-[#3182F6] bg-blue-50' : 'border-[#E5E8EB] bg-white'
                      }`}
                    >
                      <div className="text-left">
                        <p className={`text-[14px] font-semibold ${m_SelectedRatio?.id === ratio.id ? 'text-[#3182F6]' : 'text-[#191F28]'}`}>
                          {ratio.label}
                        </p>
                        {ratio.description && (
                          <p className="text-[12px] text-[#6B7684] mt-0.5">{ratio.description}</p>
                        )}
                      </div>
                      <span className={`text-[18px] font-bold ${m_SelectedRatio?.id === ratio.id ? 'text-[#3182F6]' : 'text-[#191F28]'}`}>
                        1:{ratio.ratio}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-[14px] text-[#ADB5C0]">
                  {m_SelectedProduct ? '등록된 희석비가 없습니다' : '제품을 선택하면 추천 희석비가 표시됩니다'}
                </p>
              )
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold text-[#191F28]">1 :</span>
                <input
                  type="number"
                  value={m_CustomRatio}
                  onChange={e => setM_CustomRatio(e.target.value)}
                  placeholder="희석비 입력 (예: 100)"
                  className="flex-1 px-4 py-3 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition"
                />
              </div>
            )}
          </div>

          {/* STEP 3: 물 양 입력 + 실시간 결과 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-[#3182F6] mb-2">STEP 3</p>
            <p className="text-[15px] font-bold text-[#191F28] mb-3">물 양 입력</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={m_WaterL}
                onChange={e => setM_WaterL(e.target.value)}
                placeholder="물 양 입력"
                className="flex-1 px-4 py-3 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition"
              />
              <span className="text-[16px] font-semibold text-[#191F28] w-6">L</span>
            </div>

            {/* 실시간 결과 */}
            {isValid && m_ProductMl !== null && (
              <div className="mt-4 bg-[#3182F6] rounded-xl p-4">
                <p className="text-[12px] text-blue-200 mb-2">
                  {m_SelectedProduct?.name ?? '직접입력'} · 1:{effectiveRatio} · 물 {m_WaterL}L
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-[15px]">넣을 약품 양</span>
                  <span className="text-white text-[28px] font-bold">{m_ProductMl} <span className="text-[18px]">ml</span></span>
                </div>
              </div>
            )}
          </div>

          {/* 메모 입력 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[15px] font-bold text-[#191F28] mb-3">메모 <span className="text-[13px] font-normal text-[#ADB5C0]">(선택사항)</span></p>
            <input
              type="text"
              value={m_Memo}
              onChange={e => setM_Memo(e.target.value)}
              placeholder="예) 버킷 세차, 폼건 1차 도포"
              className="w-full px-4 py-3 bg-[#F2F4F6] rounded-xl text-[15px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-4 bg-white border border-[#E5E8EB] text-[#6B7684] text-[16px] font-semibold rounded-xl active:bg-[#F2F4F6] transition"
            >
              초기화
            </button>
            <button
              onClick={handleSaveHistory}
              disabled={!isValid || m_ProductMl === null}
              className="flex-[2] py-4 bg-[#3182F6] text-white text-[16px] font-semibold rounded-xl disabled:opacity-40 active:bg-[#1B64DA] transition flex items-center justify-center gap-2"
            >
              <Bookmark size={18} />
              {m_SavedMsg ? '저장됐어요!' : '기록 저장'}
            </button>
          </div>
        </div>
      ) : (
        /* 히스토리 탭 */
        <div className="flex-1 px-4 py-4 flex flex-col gap-2">
          {m_History.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <Clock size={40} className="text-[#ADB5C0]" />
              <p className="text-[15px] text-[#ADB5C0]">저장된 기록이 없습니다</p>
            </div>
          ) : (
            m_History.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#191F28]">{item.productName}</p>
                    <p className="text-[13px] text-[#6B7684] mt-0.5">
                      1:{item.ratio} · 물 {(item.waterMl / 1000).toFixed(1)}L
                    </p>
                    {item.memo && (
                      <p className="text-[12px] text-[#ADB5C0] mt-1">{item.memo}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-bold text-[#3182F6]">{item.productMl}ml</p>
                    <p className="text-[12px] text-[#ADB5C0]">약품량</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ProductPickerSheet
        open={m_ShowProductSheet}
        onClose={() => setM_ShowProductSheet(false)}
        onSelect={handleSelectProduct}
      />

      {/* 제품 상세 모달 */}
      <BottomSheet
        open={m_ShowProductDetail}
        onClose={() => setM_ShowProductDetail(false)}
        title="제품 상세"
      >
        {m_SelectedProduct && (
          <div className="flex flex-col gap-4 pb-2">
            {/* 제품 기본 정보 */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                m_SelectedProduct.isOfficial ? 'bg-[#EBF3FF]' : 'bg-[#F2F4F6]'
              }`}>
                {m_SelectedProduct.isOfficial
                  ? <BadgeCheck size={20} className="text-[#3182F6]" />
                  : <User size={20} className="text-[#6B7684]" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[17px] font-bold text-[#191F28]">{m_SelectedProduct.name}</p>
                  {m_SelectedProduct.isOfficial && (
                    <span className="text-[10px] bg-[#EBF3FF] text-[#3182F6] px-2 py-0.5 rounded-full font-medium">공식</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-2 mt-1">
                  {m_SelectedProduct.brand && (
                    <span className="text-[13px] text-[#6B7684]">{m_SelectedProduct.brand}</span>
                  )}
                  {m_SelectedProduct.categoryName && (
                    <span className="text-[13px] text-[#ADB5C0]">· {m_SelectedProduct.categoryName}</span>
                  )}
                  {m_SelectedProduct.capacityMl && (
                    <span className="text-[13px] text-[#ADB5C0]">· {m_SelectedProduct.capacityMl}ml</span>
                  )}
                </div>
              </div>
            </div>

            {/* 희석비 목록 */}
            {m_SelectedProduct.dilutionRatios.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-[#6B7684] mb-2.5">추천 희석비</p>
                <div className="flex flex-col gap-2">
                  {m_SelectedProduct.dilutionRatios.map(ratio => (
                    <button
                      key={ratio.id}
                      onClick={() => {
                        setM_SelectedRatio(ratio)
                        setM_RatioMode('preset')
                        setM_ShowProductDetail(false)
                      }}
                      className="flex items-center justify-between px-4 py-3 bg-[#F2F4F6] rounded-xl text-left"
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-[#191F28]">{ratio.label}</p>
                        {ratio.description && (
                          <p className="text-[12px] text-[#6B7684] mt-0.5">{ratio.description}</p>
                        )}
                      </div>
                      <span className="text-[16px] font-bold text-[#3182F6]">1:{ratio.ratio}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {m_SelectedProduct.dilutionRatios.length === 0 && (
              <p className="text-[13px] text-[#ADB5C0] text-center py-4">등록된 희석비가 없습니다</p>
            )}
          </div>
        )}
      </BottomSheet>
      </div>
    </PageLayout>
  )
}

export default CalculatorPage
