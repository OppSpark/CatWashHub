import { useEffect, useState } from 'react'
import { getMonthlyStats } from '@/api/washApi'
import type { MonthlyData } from '@/types/wash'
import PageLayout from '@/layouts/PageLayout'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const formatMonth = (month: string) => {
  const [, m] = month.split('-')
  return `${parseInt(m)}월`
}

const StatsPage = () => {
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMonthlyStats()
      .then(res => setMonthly(res.monthly))
      .finally(() => setIsLoading(false))
  }, [])

  const totalCount = monthly.reduce((s, m) => s + m.count, 0)
  const avgCost = monthly.filter(m => m.avgCost != null).length > 0
    ? monthly.filter(m => m.avgCost != null).reduce((s, m) => s + (m.avgCost ?? 0), 0) / monthly.filter(m => m.avgCost != null).length
    : null
  const avgRating = monthly.filter(m => m.avgRating != null).length > 0
    ? monthly.filter(m => m.avgRating != null).reduce((s, m) => s + (m.avgRating ?? 0), 0) / monthly.filter(m => m.avgRating != null).length
    : null

  const chartData = monthly.map(m => ({
    month: formatMonth(m.month),
    횟수: m.count,
    비용: m.avgCost != null ? Math.round(m.avgCost) : null,
    만족도: m.avgRating != null ? Math.round(m.avgRating * 10) / 10 : null,
  }))

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
                {avgCost != null ? (avgCost >= 10000 ? `${(avgCost / 10000).toFixed(1)}만` : `${Math.round(avgCost).toLocaleString()}`) : '-'}
              </span>
              <span className="text-[11px] text-[#6B7684]">평균 비용(원)</span>
            </div>
          </div>
        </div>

        {monthly.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
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

            {/* 월별 평균 비용 */}
            {chartData.some(d => d.비용 != null) && (
              <div className="bg-white rounded-2xl px-5 py-4">
                <p className="text-[14px] font-semibold text-[#191F28] mb-4">월별 평균 비용</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#ADB5C0' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                      formatter={(v) => [`${Number(v).toLocaleString()}원`, '평균 비용']}
                    />
                    <Line dataKey="비용" stroke="#3182F6" strokeWidth={2.5} dot={{ fill: '#3182F6', r: 4 }} connectNulls />
                  </LineChart>
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
                      {m.avgCost != null && (
                        <span className="text-[13px] text-[#ADB5C0]">{Math.round(m.avgCost).toLocaleString()}원</span>
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
