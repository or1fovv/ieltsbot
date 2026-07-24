import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense, memo } from 'react'
import { useAuthStore } from './store/authStore'

// Critical pages — eagerly loaded (first paint)
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Navbar from './components/Navbar'

// Heavy pages — lazily loaded (only when navigated)
const TestList = lazy(() => import('./pages/TestList'))
const ActiveTest = lazy(() => import('./pages/ActiveTest'))
const Results = lazy(() => import('./pages/Results'))
const Progress = lazy(() => import('./pages/Progress'))
const Profile = lazy(() => import('./pages/Profile'))
const History = lazy(() => import('./pages/History'))
const Admin = lazy(() => import('./pages/Admin'))

// Lightweight inline fallback (no extra import)
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

// Memoize Navbar — it never changes between renders
const MemoNavbar = memo(Navbar)

function App() {
  const { initAuth, isLoading, user } = useAuthStore()

  useEffect(() => {
    // Telegram WebApp SDK — dynamic import so it doesn't block initial render
    import('@twa-dev/sdk').then(mod => {
      const WebApp = mod?.default?.default || mod?.default || mod
      const initData = WebApp?.initData
      const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname)

      if ((import.meta.env.DEV || isLocalBrowser) && !initData) {
        initAuth(null, true)
      } else {
        initAuth(initData)
      }
    }).catch(() => {
      // If SDK fails (e.g. outside Telegram), init with mock
      initAuth(null, true)
    })
  }, [initAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-300 animate-pulse font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto p-4 max-w-lg">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tests" element={<TestList />} />
            <Route path="/test/:type/:subtype" element={<ActiveTest />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      
      <MemoNavbar />
    </div>
  )
}

export default App
