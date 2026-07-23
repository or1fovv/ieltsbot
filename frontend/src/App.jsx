import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import WebAppModule from '@twa-dev/sdk'
import { useAuthStore } from './store/authStore'

const WebApp = WebAppModule?.default || WebAppModule

// Pages
import Dashboard from './pages/Dashboard'
import TestList from './pages/TestList'
import ActiveTest from './pages/ActiveTest'
import Results from './pages/Results'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import History from './pages/History'
import Navbar from './components/Navbar'

function App() {
  const { initAuth, isLoading, user } = useAuthStore()

  useEffect(() => {
    // Telegram initData orqali auth qilish
    let initData = WebApp?.initData
    
    // Agar dev environment bo'lsa va initData yo'q bo'lsa, fake data ishlatish
    const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname)

    if ((import.meta.env.DEV || isLocalBrowser) && !initData) {
      console.warn('Development mode: Using mock user data')
      initAuth(null, true)
    } else {
      initAuth(initData)
    }
  }, [initAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-animated-gradient">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-300 animate-pulse font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass-card p-8 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Xatolik</h2>
          <p className="text-gray-300 mb-6">
            Bot orqali kirish tasdiqlanmadi. Iltimos, Telegram bot orqali "Saytga o'tish" tugmasini bosing.
          </p>
          <button 
            onClick={() => {
              if (WebApp && typeof WebApp.close === 'function') {
                WebApp.close();
              }
            }}
            className="btn-gradient w-full"
          >
            Yopish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto p-4 max-w-lg">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tests" element={<TestList />} />
          <Route path="/test/:type/:subtype" element={<ActiveTest />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      
      <Navbar />
    </div>
  )
}

export default App
