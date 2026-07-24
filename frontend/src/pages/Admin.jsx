import { useState, useEffect } from 'react'
import { Shield, Zap, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { resetLimit, upgradePremium } from '../services/api'

export default function Admin() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [loadingPremium, setLoadingPremium] = useState(false)
  const [loadingLimit, setLoadingLimit] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Agar foydalanuvchi admin bo'lmasa, uni darhol ortga qaytaramiz
    if (user && user.role !== 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  const handleTogglePremium = async () => {
    try {
      setLoadingPremium(true)
      const targetState = !user?.isPremium
      const res = await upgradePremium(targetState)
      updateUser({ isPremium: targetState })
      setMessage(res.message || "Premium holati o'zgartirildi!")
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      alert("Premium o'zgartirishda xato: " + (err.response?.data?.error || err.message))
    } finally {
      setLoadingPremium(false)
    }
  }

  const handleResetLimit = async () => {
    try {
      setLoadingLimit(true)
      const res = await resetLimit()
      updateUser({ testsToday: 0 })
      setMessage(res.message || "Limit nollashtirildi!")
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      alert("Limitni nollashda xato: " + (err.response?.data?.error || err.message))
    } finally {
      setLoadingLimit(false)
    }
  }

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-warning-500" />
          Tizim boshqaruvi (Admin)
        </h1>
      </div>

      {/* Info Card */}
      <div className="glass-card p-5 border-warning-500/20 bg-warning-500/5">
        <h2 className="font-bold text-warning-400 mb-2">Tizim boshqaruv paneli</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Bu bo'lim orqali limitlarni nollash yoki profilingizga <span className="font-semibold text-warning-400">PRO Premium</span> maqomini berib, limitlarsiz sinovlarni amalga oshirishingiz mumkin.
        </p>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm text-center font-semibold flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {/* Admin Controls */}
      <div className="glass-card p-5 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Zap className={user?.isPremium ? "text-warning-400 fill-warning-400" : "text-gray-400"} size={18} />
              Premium obuna
            </h3>
            <p className="text-xs text-gray-400 mt-1">Siz uchun limitlarni to'liq o'chiradi</p>
          </div>
          <button
            onClick={handleTogglePremium}
            disabled={loadingPremium}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              user?.isPremium
                ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                : 'bg-warning-500 hover:bg-warning-600 text-slate-900'
            }`}
          >
            {loadingPremium ? 'Kuting...' : user?.isPremium ? "Premium o'chirish" : "Premium yoqish"}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <RefreshCw className="text-primary-400" size={18} />
              Kunlik limitlarni nollash
            </h3>
            <p className="text-xs text-gray-400 mt-1">Bugungi topshirilgan testlar sonini 0 qiladi</p>
          </div>
          <button
            onClick={handleResetLimit}
            disabled={loadingLimit}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            {loadingLimit ? 'Kuting...' : 'Limitlarni tozalash'}
          </button>
        </div>
      </div>

      {/* User Status Summary */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Joriy status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-3.5 rounded-xl text-center">
            <span className="text-xs text-gray-400 block mb-0.5">Foydalanuvchi</span>
            <span className="font-bold text-white block">{user?.firstName}</span>
          </div>
          <div className="bg-white/5 p-3.5 rounded-xl text-center">
            <span className="text-xs text-gray-400 block mb-0.5">Premium maqomi</span>
            <span className={`font-bold block ${user?.isPremium ? 'text-warning-400' : 'text-gray-400'}`}>
              {user?.isPremium ? 'PRO (Aktiv)' : 'Oddiy'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
