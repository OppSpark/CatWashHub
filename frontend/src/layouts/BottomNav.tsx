import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Droplets, ClipboardList, MessageSquare, User } from 'lucide-react'

const c_NavItems = [
  { path: '/home',       label: '홈',       icon: Home },
  { path: '/calculator', label: '희석계산기', icon: Droplets },
  { path: '/records',    label: '세차기록',  icon: ClipboardList },
  { path: '/board',      label: '게시판',   icon: MessageSquare },
  { path: '/mypage',     label: '마이페이지', icon: User },
]

const BottomNav = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#E5E8EB] flex z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {c_NavItems.map(({ path, label, icon: Icon }) => {
        const isActive = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
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
  )
}

export default BottomNav
