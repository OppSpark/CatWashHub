import { Routes, Route, Navigate } from 'react-router-dom'
import SignupPage from '@/pages/auth/SignupPage'

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  )
}

export default App
