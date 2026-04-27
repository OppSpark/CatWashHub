import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SignupPage from '@/pages/auth/SignupPage'
import LoginPage from '@/pages/auth/LoginPage'
import CalculatorPage from '@/pages/calculator/CalculatorPage'
import HomePage from '@/pages/home/HomePage'
import RecordsPage from '@/pages/records/RecordsPage'
import MyPage from '@/pages/mypage/MyPage'
import BottomNav from '@/layouts/BottomNav'
import Toast from '@/components/Toast'

const AuthLayout = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

const App = () => {
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
