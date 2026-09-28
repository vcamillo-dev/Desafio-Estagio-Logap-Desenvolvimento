import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import './App.css'
import AuthScreen from './AuthScreen.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/useAuth.js'
import { supabaseConfigured } from './supabaseClient.js'
import { demoMode } from './config/appMode.js'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <main className="auth-page"><div className="auth-loading">Carregando LogiTrack…</div></main>
  return demoMode || session ? children : <Navigate to="/login" replace />
}

function LoginRoute() {
  const { session, loading } = useAuth()
  if (loading) return <main className="auth-page"><div className="auth-loading">Carregando LogiTrack…</div></main>
  return demoMode || session ? <Navigate to="/" replace /> : <AuthScreen configured={supabaseConfigured} />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<ProtectedRoute><AppLayout activePage="dashboard" /></ProtectedRoute>} />
          <Route path="/manutencoes" element={<ProtectedRoute><AppLayout activePage="manutencoes" /></ProtectedRoute>} />
          <Route path="/veiculos" element={<ProtectedRoute><AppLayout activePage="veiculos" /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><AppLayout activePage="financeiro" /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
