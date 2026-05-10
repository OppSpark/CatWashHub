import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Droplets, ClipboardList, MessageSquare, User } from 'lucide-react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import LoginPromptSheet from '@/components/LoginPromptSheet'

const c_NavItems = [
  { path: '/home',       label: '홈',       icon: Home,          authRequired: true  },
  { path: '/calculator', label: '희석계산기', icon: Droplets,      authRequired: false },
  { path: '/records',    label: '세차기록',  icon: ClipboardList, authRequired: true  },
  { path: '/board',      label: '게시판',   icon: MessageSquare, authRequired: false },
  { path: '/mypage',     label: '마이페이지', icon: User,          authRequired: true  },
]

const BottomNav = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { showLoginSheet, setShowLoginSheet, requireAuth } = useRequireAuth()

  const handleTab = (path: string, authRequired: boolean) => {
    if (authRequired) {
      requireAuth(() => navigate(path))
    } else {
      navigate(path)
    }
  }

  return (
    <>
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#E5E8EB] flex z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {c_NavItems.map(({ path, label, icon: Icon, authRequired }) => {
          const isActive = pathname === path || pathname.startsWith(path + '/')
          return (
            <button
              key={path}
              onClick={() => handleTab(path, authRequired)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <Icon
                size={22}
                className={`transition ${isActive ? 'text-[#3182F6]' : 'text-[#ADB5C0]'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium transition ${isActive ? 'text-[#3182F6]' : 'text-[#ADB5C0]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      <LoginPromptSheet open={showLoginSheet} onClose={() => setShowLoginSheet(false)} bottomOffset={56} />
    </>
  )
}

export default BottomNav
