import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SignupPage from '@/pages/auth/SignupPage'
import LoginPage from '@/pages/auth/LoginPage'
import CalculatorPage from '@/pages/calculator/CalculatorPage'
import HomePage from '@/pages/home/HomePage'
import RecordsPage from '@/pages/records/RecordsPage'
import MyPage from '@/pages/mypage/MyPage'
import StatsPage from '@/pages/stats/StatsPage'
import WashNewPage from '@/pages/wash/WashNewPage'
import WashDetailPage from '@/pages/wash/WashDetailPage'
import WashReviewPage from '@/pages/wash/WashReviewPage'
import ProductSetsPage from '@/pages/wash/ProductSetsPage'
import BoardListPage from '@/pages/board/BoardListPage'
import BoardNewPage from '@/pages/board/BoardNewPage'
import BoardDetailPage from '@/pages/board/BoardDetailPage'
import MobileShell from '@/layouts/MobileShell'
import BottomNav from '@/layouts/BottomNav'
import Toast from '@/components/Toast'

// 인증 체크만 담당
const AuthGuard = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// BottomNav가 있는 메인 탭 페이지
const WithBottomNav = () => (
  <>
    <Outlet />
    <BottomNav />
  </>
)

const App = () => {
  return (
    <MobileShell>
      <Toast />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<AuthGuard />}>
          {/* BottomNav 있는 탭 페이지 */}
          <Route element={<WithBottomNav />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/board" element={<BoardListPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>

          {/* BottomNav 없는 서브 페이지 */}
          <Route path="/wash/new" element={<WashNewPage />} />
          <Route path="/wash/sets" element={<ProductSetsPage />} />
          <Route path="/wash/sets/new" element={<ProductSetsPage />} />
          <Route path="/wash/:id" element={<WashDetailPage />} />
          <Route path="/wash/:id/review" element={<WashReviewPage />} />
          <Route path="/board/new" element={<BoardNewPage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MobileShell>
  )
}

export default App
