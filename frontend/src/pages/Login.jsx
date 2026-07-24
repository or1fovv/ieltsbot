import { useState, useEffect } from 'react'
import { LogIn, Sparkles, Send, Mail, ShieldCheck, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../services/supabaseClient'

export default function Login() {
  const { loginEmail, loginDemo, loginGoogle } = useAuthStore()
  
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [name, setName] = useState('')
  const [levelSystem, setLevelSystem] = useState('ielts')
  const [currentLevel, setCurrentLevel] = useState('6.0')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Quick Gmail Modal state
  const [showGmailModal, setShowGmailModal] = useState(false)
  const [quickGmail, setQuickGmail] = useState('')

  // Supabase Auth session listener
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        try {
          await loginGoogle(session.user)
        } catch (err) {
          console.warn("Google OAuth sync fallback to direct email login")
        }
      }
    }
    checkSession()
  }, [loginGoogle])

  const handleGoogleLogin = async () => {
    setShowGmailModal(true)
  }

  const handleQuickGmailSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    let inputVal = quickGmail.trim().toLowerCase()
    if (!inputVal) {
      alert("Iltimos, Gmail manzilingizni yozing!")
      return
    }
    if (!inputVal.includes('@')) {
      inputVal = `${inputVal}@gmail.com`
    }

    try {
      setGoogleLoading(true)
      await loginEmail({
        email: inputVal,
        name: inputVal.split('@')[0],
        levelSystem,
        currentLevel
      })
      setShowGmailModal(false)
    } catch (err) {
      alert("Kirishda xatolik yuz berdi: " + (err.response?.data?.error || err.message))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    setLoading(true)

    let inputVal = emailOrUsername.trim().toLowerCase()
    if (!inputVal) {
      setError('Iltimos, Gmail pochtangizni yoki ismingizni kiriting!')
      setLoading(false)
      return
    }

    // Auto-append @gmail.com if no @ was provided
    if (!inputVal.includes('@')) {
      inputVal = `${inputVal}@gmail.com`
    }

    try {
      await loginEmail({
        email: inputVal,
        name: name.trim() || inputVal.split('@')[0],
        levelSystem,
        currentLevel
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Server bilan bog\'lanishda xato yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-animated-gradient">
      <div className="glass-card p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/10 space-y-6 animate-in fade-in duration-300 relative">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            🎓
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">IELTS & CEFR AI Platform</h1>
          <p className="text-sm text-gray-300">Gmail & Telegram AI Sinov Tizimi</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center font-medium animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Gmail Manzilingiz yoki Username <span className="text-primary-400">*</span>
            </label>
            <input
              type="text"
              placeholder="masalan: maxmudorifov36@gmail.com yoki maxa"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Ismingiz (ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Ismingizni kiriting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all text-sm"
            />
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
            className="w-full btn-gradient py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>Saytga Kirish (Gmail / Username)</span>
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
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-sm shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.54 0-6.4-2.86-6.4-6.4s2.86-6.4 6.4-6.4c1.648 0 3.13.626 4.27 1.648L21.2 4.675C18.89 2.503 15.8 1.2 12.24 1.2 6.033 1.2 1 6.233 1 12.4s5.033 11.2 11.24 11.2c5.6 0 10.4-4 10.4-11.2 0-.648-.06-1.286-.18-1.915H12.24z"/>
            </svg>
            <span>Google Account (Gmail) Tezkor Kirish</span>
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

      {/* Quick Gmail Entry Modal */}
      {showGmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-card p-6 max-w-sm w-full space-y-4 border border-white/20 relative shadow-2xl">
            <button
              onClick={() => setShowGmailModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto text-red-400 mb-2">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Gmail Manzilingizni Kiriting</h3>
              <p className="text-xs text-gray-300">Tezkor kirish uchun Gmail pochtangizni yozing</p>
            </div>

            <form onSubmit={handleQuickGmailSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="masalan: maxmudorifov36@gmail.com yoki maxa"
                  value={quickGmail}
                  onChange={(e) => setQuickGmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={googleLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Tizimga Kirish</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
