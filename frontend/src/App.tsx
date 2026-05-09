import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SignupPage from '@/pages/auth/SignupPage'
import LoginPage from '@/pages/auth/LoginPage'
import CalculatorPage from '@/pages/calculator/CalculatorPage'
import HomePage from '@/pages/home/HomePage'
import RecordsPage from '@/pages/records/RecordsPage'
import MyPage from '@/pages/mypage/MyPage'
import WashNewPage from '@/pages/wash/WashNewPage'
import WashDetailPage from '@/pages/wash/WashDetailPage'
import WashReviewPage from '@/pages/wash/WashReviewPage'
import ProductSetsPage from '@/pages/wash/ProductSetsPage'
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
          <Route path="/wash/new" element={<WashNewPage />} />
          <Route path="/wash/sets" element={<ProductSetsPage />} />
          <Route path="/wash/sets/new" element={<ProductSetsPage />} />
          <Route path="/wash/:id" element={<WashDetailPage />} />
          <Route path="/wash/:id/review" element={<WashReviewPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
