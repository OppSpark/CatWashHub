import { useState, useEffect } from 'react'
import { ChevronDown, Search, Clock, X, ChevronRight } from 'lucide-react'
import { getCategories, getProducts, calculate, getHistory } from '@/api/calculatorApi'
import type { Category, Product, DilutionRatio, CalculationResult } from '@/types/calculator'

type TabType = 'calculator' | 'history'
type RatioMode = 'preset' | 'custom'

const CalculatorPage = () => {
  const [m_Tab, setM_Tab] = useState<TabType>('calculator')

  // 제품 선택
  const [m_Categories, setM_Categories] = useState<Category[]>([])
  const [m_Products, setM_Products] = useState<Product[]>([])
  const [m_SelectedProduct, setM_SelectedProduct] = useState<Product | null>(null)
  const [m_ShowProductSheet, setM_ShowProductSheet] = useState(false)
  const [m_Keyword, setM_Keyword] = useState('')
  const [m_SelectedCategoryId, setM_SelectedCategoryId] = useState<number | null>(null)

  // 희석비 선택
  const [m_RatioMode, setM_RatioMode] = useState<RatioMode>('preset')
  const [m_SelectedRatio, setM_SelectedRatio] = useState<DilutionRatio | null>(null)
  const [m_CustomRatio, setM_CustomRatio] = useState('')

  // 계산
  const [m_WaterMl, setM_WaterMl] = useState('')
  const [m_Result, setM_Result] = useState<CalculationResult | null>(null)
  const [m_Loading, setM_Loading] = useState(false)

  // 히스토리
  const [m_History, setM_History] = useState<CalculationResult[]>([])

  // ==================== 초기화 함수 ====================
  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    if (m_Tab === 'history') {
      loadHistory()
    }
  }, [m_Tab])

  useEffect(() => {
    loadProducts()
  }, [m_SelectedCategoryId, m_Keyword])

  // ==================== 기능별 함수 ====================
  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setM_Categories(data)
    } catch {
      // 카테고리 로드 실패 시 빈 목록 유지
    }
  }

  const loadProducts = async () => {
    try {
      const data = await getProducts({
        categoryId: m_SelectedCategoryId ?? undefined,
        keyword: m_Keyword || undefined,
      })
      setM_Products(data)
    } catch {
      // 제품 로드 실패 시 빈 목록 유지
    }
  }

  const loadHistory = async () => {
    try {
      const data = await getHistory()
      setM_History(data)
    } catch {
      // 히스토리 로드 실패 시 빈 목록 유지
    }
  }

  const handleSelectProduct = (product: Product) => {
    setM_SelectedProduct(product)
    setM_SelectedRatio(null)
    setM_RatioMode('preset')
    setM_Result(null)
    setM_ShowProductSheet(false)
  }

  const getEffectiveRatio = (): number | null => {
    if (m_RatioMode === 'custom') {
      const parsed = parseInt(m_CustomRatio)
      return isNaN(parsed) || parsed <= 0 ? null : parsed
    }
    return m_SelectedRatio?.ratio ?? null
  }

  const handleCalculate = async () => {
    const ratio = getEffectiveRatio()
    const waterMl = parseFloat(m_WaterMl)

    if (!ratio) { return }
    if (isNaN(waterMl) || waterMl <= 0) { return }

    try {
      setM_Loading(true)
      const result = await calculate({
        productId: m_SelectedProduct?.id,
        ratio,
        waterMl,
      })
      setM_Result(result)
    } catch {
      // 계산 오류 무시
    } finally {
      setM_Loading(false)
    }
  }

  const handleReset = () => {
    setM_SelectedProduct(null)
    setM_SelectedRatio(null)
    setM_CustomRatio('')
    setM_WaterMl('')
    setM_Result(null)
    setM_RatioMode('preset')
  }

  const isCalculatable = getEffectiveRatio() !== null &&
    parseFloat(m_WaterMl) > 0

  return (
    <div className="min-h-dvh bg-[#F2F4F6] flex flex-col">

      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-[#191F28]">희석 계산기</h1>
        <p className="text-[14px] text-[#6B7684] mt-1">약품 희석 비율을 계산해보세요</p>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-[#E5E8EB] px-6 flex gap-6">
        {(['calculator', 'history'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setM_Tab(tab)}
            className={`py-3 text-[15px] font-semibold border-b-2 transition ${
              m_Tab === tab
                ? 'border-[#3182F6] text-[#3182F6]'
                : 'border-transparent text-[#ADB5C0]'
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
              <span className={`text-[15px] ${m_SelectedProduct ? 'text-[#191F28] font-medium' : 'text-[#ADB5C0]'}`}>
                {m_SelectedProduct ? m_SelectedProduct.name : '제품을 선택해주세요 (선택사항)'}
              </span>
              <ChevronDown size={18} className="text-[#ADB5C0]" />
            </button>
            {m_SelectedProduct && (
              <div className="mt-2 px-1">
                <p className="text-[12px] text-[#6B7684]">
                  {m_SelectedProduct.brand} · {m_SelectedProduct.categoryName}
                  {m_SelectedProduct.capacityMl && ` · ${m_SelectedProduct.capacityMl}ml`}
                </p>
              </div>
            )}
          </div>

          {/* STEP 2: 희석비 선택 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-[#3182F6] mb-2">STEP 2</p>
            <p className="text-[15px] font-bold text-[#191F28] mb-3">희석비 선택</p>

            {/* 모드 토글 */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setM_RatioMode('preset')}
                className={`flex-1 py-2 rounded-xl text-[14px] font-semibold transition ${
                  m_RatioMode === 'preset'
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#F2F4F6] text-[#6B7684]'
                }`}
              >
                추천 희석비
              </button>
              <button
                onClick={() => setM_RatioMode('custom')}
                className={`flex-1 py-2 rounded-xl text-[14px] font-semibold transition ${
                  m_RatioMode === 'custom'
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#F2F4F6] text-[#6B7684]'
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
                        m_SelectedRatio?.id === ratio.id
                          ? 'border-[#3182F6] bg-blue-50'
                          : 'border-[#E5E8EB] bg-white'
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
                <div className="py-4 text-center text-[14px] text-[#ADB5C0]">
                  {m_SelectedProduct ? '등록된 희석비가 없습니다' : '제품을 선택하면 추천 희석비가 표시됩니다'}
                </div>
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

          {/* STEP 3: 물 양 입력 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-[#3182F6] mb-2">STEP 3</p>
            <p className="text-[15px] font-bold text-[#191F28] mb-3">물 양 입력</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={m_WaterMl}
                onChange={e => setM_WaterMl(e.target.value)}
                placeholder="물 양 입력"
                className="flex-1 px-4 py-3 bg-[#F2F4F6] rounded-xl text-[16px] text-[#191F28] placeholder-[#ADB5C0] outline-none focus:ring-2 focus:ring-[#3182F6] transition"
              />
              <span className="text-[16px] font-semibold text-[#191F28] w-10">ml</span>
            </div>
          </div>

          {/* 결과 */}
          {m_Result && (
            <div className="bg-[#3182F6] rounded-2xl p-5">
              <p className="text-[13px] text-blue-200 mb-1">{m_Result.productName} · 1:{m_Result.ratio}</p>
              <p className="text-white text-[14px] mb-3">
                물 <span className="font-bold text-[18px]">{m_Result.waterMl}</span>ml 기준
              </p>
              <div className="bg-white/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-white text-[14px]">넣을 약품 양</span>
                <span className="text-white text-[24px] font-bold">{m_Result.productMl} ml</span>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleReset}
              className="flex-1 py-4 bg-white border border-[#E5E8EB] text-[#6B7684] text-[16px] font-semibold rounded-xl active:bg-[#F2F4F6] transition"
            >
              초기화
            </button>
            <button
              onClick={handleCalculate}
              disabled={!isCalculatable || m_Loading}
              className="flex-2 w-full flex-[2] py-4 bg-[#3182F6] text-white text-[16px] font-semibold rounded-xl disabled:opacity-40 active:bg-[#1B64DA] transition"
            >
              {m_Loading ? '계산 중...' : '계산하기'}
            </button>
          </div>
        </div>
      ) : (
        /* 히스토리 탭 */
        <div className="flex-1 px-4 py-4 flex flex-col gap-2">
          {m_History.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <Clock size={40} className="text-[#ADB5C0]" />
              <p className="text-[15px] text-[#ADB5C0]">계산 히스토리가 없습니다</p>
            </div>
          ) : (
            m_History.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-[#191F28]">{item.productName}</p>
                  <p className="text-[13px] text-[#6B7684] mt-0.5">
                    1:{item.ratio} · 물 {item.waterMl}ml
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-bold text-[#3182F6]">{item.productMl}ml</p>
                  <p className="text-[12px] text-[#ADB5C0]">약품량</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 제품 선택 바텀시트 */}
      {m_ShowProductSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setM_ShowProductSheet(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[80dvh] flex flex-col">

            {/* 시트 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8EB]">
              <h2 className="text-[17px] font-bold text-[#191F28]">제품 선택</h2>
              <button onClick={() => setM_ShowProductSheet(false)}>
                <X size={22} className="text-[#6B7684]" />
              </button>
            </div>

            {/* 검색창 */}
            <div className="px-4 py-3 border-b border-[#E5E8EB]">
              <div className="flex items-center gap-2 bg-[#F2F4F6] rounded-xl px-3 py-2">
                <Search size={16} className="text-[#ADB5C0]" />
                <input
                  type="text"
                  value={m_Keyword}
                  onChange={e => setM_Keyword(e.target.value)}
                  placeholder="제품명 검색"
                  className="flex-1 bg-transparent text-[14px] text-[#191F28] placeholder-[#ADB5C0] outline-none"
                />
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-[#E5E8EB]">
              <button
                onClick={() => setM_SelectedCategoryId(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold transition ${
                  m_SelectedCategoryId === null
                    ? 'bg-[#3182F6] text-white'
                    : 'bg-[#F2F4F6] text-[#6B7684]'
                }`}
              >
                전체
              </button>
              {m_Categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setM_SelectedCategoryId(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold transition ${
                    m_SelectedCategoryId === cat.id
                      ? 'bg-[#3182F6] text-white'
                      : 'bg-[#F2F4F6] text-[#6B7684]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* 제품 목록 */}
            <div className="overflow-y-auto flex-1">
              {m_Products.length === 0 ? (
                <div className="py-12 text-center text-[14px] text-[#ADB5C0]">
                  검색 결과가 없습니다
                </div>
              ) : (
                m_Products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center justify-between px-6 py-4 border-b border-[#F2F4F6] active:bg-[#F2F4F6]"
                  >
                    <div className="text-left">
                      <p className="text-[15px] font-semibold text-[#191F28]">{product.name}</p>
                      <p className="text-[13px] text-[#6B7684] mt-0.5">
                        {product.brand}
                        {product.categoryName && ` · ${product.categoryName}`}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-[#ADB5C0]" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalculatorPage
