import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ProfilePage from "../page/profilePage"


export default function AppRoutes() {
  const isLoggedIn = true // sau này replace bằng auth thật

  return (
    
      <Routes>

        {/* Home */}
        {/* <Route path="/" element={<HomePage />} /> */}

        {/* Profile */}
        <Route
          path="/profile"
          element={
            isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />
          }
        />

        {/* Login */}
        {/* <Route path="/login" element={<LoginPage />} /> */}

        {/* 404 */}
        <Route path="*" element={<Navigate to="/profile" />} />

      </Routes>
  )
}