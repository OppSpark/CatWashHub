import { useEffect, useState } from 'react'

interface WeatherData {
  today: { precipitation: number; weatherCode: number }
  forecast: { date: string; precipitation: number; weatherCode: number }[]
}

interface WeatherState {
  data: WeatherData | null
  isLoading: boolean
  error: 'permission_denied' | 'fetch_failed' | null
  locationName: string | null
}

const getWashScore = (forecast: WeatherData['forecast']): { score: number; message: string; emoji: string; color: string } => {
  const next3days = forecast.slice(0, 3)
  const totalRain = next3days.reduce((sum, d) => sum + d.precipitation, 0)
  const rainDays = next3days.filter(d => d.precipitation > 1).length

  if (rainDays >= 2 || totalRain > 10) {
    return { score: 20, message: '비가 올 예정이에요. 세차는 나중에!', emoji: '🌧️', color: '#FF4D4F' }
  }
  if (rainDays === 1 || totalRain > 3) {
    return { score: 55, message: '비 예보가 있어요. 조금 더 기다려봐요', emoji: '🌦️', color: '#FFB800' }
  }
  if (rainDays === 0 && totalRain === 0) {
    return { score: 95, message: '3일 내 비 예보 없음! 지금이 세차 최적 타이밍', emoji: '☀️', color: '#52C41A' }
  }
  return { score: 75, message: '세차하기 나쁘지 않아요', emoji: '⛅', color: '#3182F6' }
}

// WMO 날씨 코드 → 한국어 + 이모지
const getWeatherLabel = (code: number): string => {
  if (code === 0) { return '☀️ 맑음' }
  if (code <= 2) { return '⛅ 구름 조금' }
  if (code <= 3) { return '☁️ 흐림' }
  if (code <= 49) { return '🌫️ 안개' }
  if (code <= 67) { return '🌧️ 비' }
  if (code <= 77) { return '❄️ 눈' }
  if (code <= 82) { return '🌦️ 소나기' }
  return '⛈️ 뇌우'
}

export const useWeather = (): WeatherState & { weatherLabel: string | null; washScore: ReturnType<typeof getWashScore> | null } => {
  const [state, setState] = useState<WeatherState>({
    data: null,
    isLoading: true,
    error: null,
    locationName: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, isLoading: false, error: 'fetch_failed' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,weather_code&forecast_days=4&timezone=Asia%2FSeoul`
          const res = await fetch(url)
          if (!res.ok) { throw new Error('fetch failed') }
          const json = await res.json()

          const dates: string[] = json.daily.time
          const precipitations: number[] = json.daily.precipitation_sum
          const codes: number[] = json.daily.weather_code

          const today = { precipitation: precipitations[0], weatherCode: codes[0] }
          const forecast = dates.slice(1).map((date, i) => ({
            date,
            precipitation: precipitations[i + 1],
            weatherCode: codes[i + 1],
          }))

          // Reverse Geocoding (nominatim - 무료, API 키 없음)
          let locationName: string | null = null
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ko`,
              { headers: { 'User-Agent': 'CatWashHub/1.0' } }
            )
            const geoJson = await geoRes.json()
            locationName = geoJson.address?.city
              ?? geoJson.address?.town
              ?? geoJson.address?.village
              ?? geoJson.address?.county
              ?? null
          } catch {
            // 위치 이름 실패해도 날씨는 표시
          }

          setState({ data: { today, forecast }, isLoading: false, error: null, locationName })
        } catch {
          setState(s => ({ ...s, isLoading: false, error: 'fetch_failed' }))
        }
      },
      () => {
        setState(s => ({ ...s, isLoading: false, error: 'permission_denied' }))
      },
      { timeout: 8000 }
    )
  }, [])

  const washScore = state.data ? getWashScore(state.data.forecast) : null
  const weatherLabel = state.data ? getWeatherLabel(state.data.today.weatherCode) : null

  return { ...state, washScore, weatherLabel }
}
