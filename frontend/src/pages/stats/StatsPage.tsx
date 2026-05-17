import { useEffect, useState } from 'react'
import { getMonthlyStats, getSummaryStats } from '@/api/washApi'
import type { MonthlyData, SummaryStats } from '@/types/wash'
import PageLayout from '@/layouts/PageLayout'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const formatMonth = (month: string) => {
  const [, m] = month.split('-')
  return `${parseInt(m)}월`
}

const formatCost = (cost: number) => {
  if (cost >= 100000000) { return `${(cost / 100000000).toFixed(1)}억` }
  if (cost >= 10000) { return `${(cost / 10000).toFixed(1)}만` }
  return `${cost.toLocaleString()}`
}

const StatsPage = () => {
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMonthlyStats(), getSummaryStats()])
      .then(([monthlyRes, summaryRes]) => {
        setMonthly(monthlyRes.monthly)
        setSummary(summaryRes)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const totalCount = monthly.reduce((s, m) => s + m.count, 0)
  const avgRating = monthly.filter(m => m.avgRating != null).length > 0
    ? monthly.filter(m => m.avgRating != null).reduce((s, m) => s + (m.avgRating ?? 0), 0) / monthly.filter(m => m.avgRating != null).length
    : null

  const chartData = monthly.map(m => ({
    month: formatMonth(m.month),
    횟수: m.count,
    비용: m.avgCost != null ? Math.round(m.avgCost) : null,
    만족도: m.avgRating != null ? Math.round(m.avgRating * 10) / 10 : null,
    총비용: m.totalCost ?? 0,
  }))

  const costDiff = summary ? summary.thisMonthCost - summary.lastMonthCost : 0

  if (isLoading) {
    return <PageLayout title="세차 통계" isLoading />
  }

  return (
    <PageLayout title="세차 통계" headerVariant="large" headerSubtitle="나의 세차 히스토리">
      <div className="flex flex-col gap-3 pb-24">

        {/* 요약 카드 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-3">최근 12개월 요약</p>
          <div className="grid grid-cols-3 divide-x divide-[#F2F4F6]">
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-[26px] font-bold text-[#191F28]">{totalCount}</span>
              <span className="text-[11px] text-[#6B7684]">총 세차 횟수</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-[26px] font-bold text-[#191F28]">
                {avgRating != null ? avgRating.toFixed(1) : '-'}
              </span>
              <span className="text-[11px] text-[#6B7684]">평균 만족도</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-[22px] font-bold text-[#191F28]">
                {summary && summary.totalCost > 0 ? formatCost(summary.totalCost) : '-'}
              </span>
              <span className="text-[11px] text-[#6B7684]">누적 총 비용</span>
            </div>
          </div>
        </div>

        {/* 이번 달 비용 */}
        {summary && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] font-semibold text-[#6B7684] mb-3">이번 달 세차 비용</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[28px] font-bold text-[#191F28]">
                  {summary.thisMonthCost > 0 ? `${summary.thisMonthCost.toLocaleString()}원` : '-'}
                </span>
                {summary.lastMonthCost > 0 && (
                  <p className="text-[12px] text-[#ADB5C0] mt-1">
                    지난 달 {summary.lastMonthCost.toLocaleString()}원
                  </p>
                )}
              </div>
              {summary.lastMonthCost > 0 && summary.thisMonthCost > 0 && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-semibold ${
                  costDiff > 0 ? 'bg-[#FFF0F0] text-[#FF4D4F]' : 'bg-[#F0FFF4] text-[#52C41A]'
                }`}>
                  {costDiff > 0 ? '▲' : '▼'} {Math.abs(costDiff).toLocaleString()}원
                </div>
              )}
            </div>
          </div>
        )}

        {/* 자주 쓴 용품 TOP 5 */}
        {summary && summary.topProducts.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[14px] font-semibold text-[#191F28] mb-3">자주 쓴 용품 TOP 5</p>
            <div className="flex flex-col gap-2.5">
              {summary.topProducts.map((product, i) => {
                const maxCount = summary.topProducts[0].count
                const pct = Math.round((product.count / maxCount) * 100)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-[#ADB5C0] w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-medium text-[#191F28] truncate">{product.name}</span>
                        <span className="text-[12px] text-[#6B7684] shrink-0 ml-2">{product.count}회</span>
                      </div>
                      <div className="h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3182F6] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {monthly.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-[48px]">📊</span>
            <p className="text-[15px] font-semibold text-[#191F28]">아직 통계 데이터가 없어요</p>
            <p className="text-[13px] text-[#ADB5C0]">세차를 완료하면 통계가 쌓여요</p>
          </div>
        ) : (
          <>
            {/* 월별 세차 횟수 */}
            <div className="bg-white rounded-2xl px-5 py-4">
              <p className="text-[14px] font-semibold text-[#191F28] mb-4">월별 세차 횟수</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                    formatter={(v) => [`${v}회`, '횟수']}
                  />
                  <Bar dataKey="횟수" fill="#3182F6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 월별 총 비용 */}
            {chartData.some(d => d.총비용 > 0) && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[14px] font-semibold text-[#191F28] mb-4">월별 총 비용</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                      formatter={(v) => [`${Number(v).toLocaleString()}원`, '총 비용']}
                    />
                    <Bar dataKey="총비용" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={32} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 월별 평균 만족도 */}
            {chartData.some(d => d.만족도 != null) && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[14px] font-semibold text-[#191F28] mb-4">월별 평균 만족도</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                      formatter={(v) => [`${v}점`, '평균 만족도']}
                    />
                    <Line dataKey="만족도" stroke="#FFB800" strokeWidth={2.5} dot={{ fill: '#FFB800', r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 월별 상세 테이블 */}
            <div className="bg-white rounded-2xl px-5 py-4">
              <p className="text-[14px] font-semibold text-[#191F28] mb-3">월별 상세</p>
              <div className="flex flex-col divide-y divide-[#F2F4F6]">
                {[...monthly].reverse().map(m => (
                  <div key={m.month} className="flex items-center justify-between py-3">
                    <span className="text-[14px] font-medium text-[#191F28]">{m.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-[#6B7684]">{m.count}회</span>
                      {m.avgRating != null && (
                        <span className="text-[13px] text-[#FFB800]">★ {m.avgRating.toFixed(1)}</span>
                      )}
                      {m.totalCost != null && m.totalCost > 0 && (
                        <span className="text-[13px] text-[#191F28] font-medium">{m.totalCost.toLocaleString()}원</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default StatsPage
