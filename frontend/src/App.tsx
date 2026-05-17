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
import BoardEditPage from '@/pages/board/BoardEditPage'
import RecipeListPage from '@/pages/recipe/RecipeListPage'
import RecipeDetailPage from '@/pages/recipe/RecipeDetailPage'
import RecipeNewPage from '@/pages/recipe/RecipeNewPage'
import RecipeEditPage from '@/pages/recipe/RecipeEditPage'
import GatheringListPage from '@/pages/gathering/GatheringListPage'
import GatheringDetailPage from '@/pages/gathering/GatheringDetailPage'
import GatheringNewPage from '@/pages/gathering/GatheringNewPage'
import GatheringHistoryPage from '@/pages/gathering/GatheringHistoryPage'
import UserProfilePage from '@/pages/user/UserProfilePage'
import MobileShell from '@/layouts/MobileShell'
import BottomNav from '@/layouts/BottomNav'
import Toast from '@/components/Toast'

// 로그인 필요 페이지 — 미로그인 시 /login으로
const AuthGuard = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// BottomNav가 있는 탭 레이아웃
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
        {/* 인증 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 공개 탭 페이지 (BottomNav 포함) */}
        <Route element={<WithBottomNav />}>
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />
          <Route path="/recipe" element={<RecipeListPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/gathering" element={<GatheringListPage />} />
        </Route>

        {/* 로그인 필요 페이지 */}
        <Route element={<AuthGuard />}>
          <Route element={<WithBottomNav />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>

          <Route path="/wash/new" element={<WashNewPage />} />
          <Route path="/wash/sets" element={<ProductSetsPage />} />
          <Route path="/wash/sets/new" element={<ProductSetsPage />} />
          <Route path="/wash/:id" element={<WashDetailPage />} />
          <Route path="/wash/:id/review" element={<WashReviewPage />} />
          <Route path="/board/new" element={<BoardNewPage />} />
          <Route path="/board/:id/edit" element={<BoardEditPage />} />
          <Route path="/recipe/new" element={<RecipeNewPage />} />
          <Route path="/recipe/:id/edit" element={<RecipeEditPage />} />
          <Route path="/gathering/new" element={<GatheringNewPage />} />
          <Route path="/gathering/history" element={<GatheringHistoryPage />} />
        </Route>

        {/* 벙 상세는 비로그인도 조회 가능 */}
        <Route path="/gathering/:id" element={<GatheringDetailPage />} />

        {/* 유저 프로필은 공개 */}
        <Route path="/user/:userId" element={<UserProfilePage />} />

        {/* 기본 진입 — 비로그인: 게시판, 로그인: 홈 */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </MobileShell>
  )
}

const DefaultRedirect = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  return <Navigate to={isLoggedIn ? '/home' : '/board'} replace />
}

export default App
