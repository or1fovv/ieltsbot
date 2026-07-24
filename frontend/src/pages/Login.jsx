import { useState, useEffect } from 'react'
import { LogIn, Sparkles, Send, UserCheck, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../services/supabaseClient'

export default function Login() {
  const { loginWeb, loginDemo, loginGoogle } = useAuthStore()
  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [levelSystem, setLevelSystem] = useState('ielts')
  const [currentLevel, setCurrentLevel] = useState('6.0')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Supabase Auth holat o'zgarishini kuzatish (Google login qaytgandan keyin)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        try {
          await loginGoogle(session.user)
        } catch (err) {
          setError("Google login ma'lumotlarini backend bilan sinxronlashda xatolik!")
        }
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await loginGoogle(session.user)
        } catch (err) {
          setError("Google login ma'lumotlarini backend bilan sinxronlashda xatolik!")
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [loginGoogle])

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      console.error(err)
      setError("Google tizimiga ulanishda xato: " + err.message)
      setGoogleLoading(false)
    }
  }

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const inputVal = identifier.trim() || name.trim()

    if (!inputVal) {
      setError('Iltimos, Telegram username yoki ismingizni kiriting')
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await loginWeb({ identifier: inputVal, name: inputVal, levelSystem, currentLevel })
      if (res && res.success) {
        // Successful login
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server bilan bog\'lanishda xato. Iltimos keyinroq urinib ko\'ring.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-animated-gradient">
      <div className="glass-card p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/10 space-y-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            🎓
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">IELTS & CEFR AI Platform</h1>
          <p className="text-sm text-gray-300">Telegram Bot & Web Mini App bilan integratsiyalashgan AI Platforma</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center font-medium animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Telegram Username yoki Ismingiz <span className="text-primary-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="@username yoki Ismingiz"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Joriy darajangiz (IELTS / CEFR)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={levelSystem}
                onChange={(e) => setLevelSystem(e.target.value)}
                className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="ielts" className="bg-slate-900 text-white">🎯 IELTS</option>
                <option value="cefr" className="bg-slate-900 text-white">🇪🇺 CEFR</option>
              </select>

              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary-500"
              >
                {levelSystem === 'ielts' ? (
                  ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'].map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-slate-900 text-white">Band {lvl}</option>
                  ))
                ) : (
                  ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-slate-900 text-white">Level {lvl}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>Saytga Kirish</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-[1px] bg-white/10 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium">YOKI</span>
          <div className="h-[1px] bg-white/10 flex-1"></div>
        </div>

        {/* Secondary Login Options */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            type="button"
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-sm shadow-md cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.54 0-6.4-2.86-6.4-6.4s2.86-6.4 6.4-6.4c1.648 0 3.13.626 4.27 1.648L21.2 4.675C18.89 2.503 15.8 1.2 12.24 1.2 6.033 1.2 1 6.233 1 12.4s5.033 11.2 11.24 11.2c5.6 0 10.4-4 10.4-11.2 0-.648-.06-1.286-.18-1.915H12.24z"/>
                </svg>
                <span>Google Account (Gmail) Orqali Kirish</span>
              </>
            )}
          </button>

          <a
            href="https://t.me/ielts77_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm"
          >
            <Send size={16} />
            <span>Telegram Bot Orqali Ochish</span>
          </a>

          <button
            onClick={loginDemo}
            type="button"
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm"
          >
            <Sparkles size={16} className="text-accent-400" />
            <span>Sinov (Demo) Rejimida Davom Etish</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Barcha ma'lumotlar AI va Supabase orqali himoyalangan</span>
        </div>

      </div>
    </div>
  )
}
