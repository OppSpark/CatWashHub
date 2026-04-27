import { Routes, Route, Navigate } from 'react-router-dom'
import SignupPage from '@/pages/auth/SignupPage'
import LoginPage from '@/pages/auth/LoginPage'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
