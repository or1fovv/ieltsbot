import { useState, useEffect } from 'react'
import { Shield, Zap, RefreshCw, CheckCircle, ArrowLeft, Users, Search, Trash2, Crown, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { resetLimit, upgradePremium, getAdminUsers, performAdminUserAction } from '../services/api'

export default function Admin() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  
  const [loadingPremium, setLoadingPremium] = useState(false)
  const [loadingLimit, setLoadingLimit] = useState(false)
  const [message, setMessage] = useState('')
  
  // Users management state
  const [usersList, setUsersList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    // Non-admin redirect check - Faqat maxmudorifov36@gmail.com uchun
    const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'maxmudorifov36@gmail.com'

    if (user && !isAdmin) {
      navigate('/')
      return
    }
    fetchUsers()
  }, [user, navigate])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const data = await getAdminUsers()
      if (data && data.users) {
        setUsersList(data.users)
      }
    } catch (err) {
      console.warn("Failed to fetch admin users:", err.message)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleTogglePremium = async () => {
    try {
      setLoadingPremium(true)
      const targetState = !user?.isPremium
      const res = await upgradePremium(targetState)
      updateUser({ isPremium: targetState })
      setMessage(res.message || "Premium holati o'zgartirildi!")
      setTimeout(() => setMessage(''), 3000)
      fetchUsers()
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
      fetchUsers()
    } catch (err) {
      alert("Limitni nollashda xato: " + (err.response?.data?.error || err.message))
    } finally {
      setLoadingLimit(false)
    }
  }

  const handleUserAction = async (targetUserId, action, value) => {
    try {
      setActionLoadingId(targetUserId)
      await performAdminUserAction({ targetUserId, action, value })
      setMessage("Amal muvaffaqiyatli bajarildi!")
      setTimeout(() => setMessage(''), 3000)
      await fetchUsers()
    } catch (err) {
      alert("Xato: " + (err.response?.data?.error || err.message))
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase()
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  const totalUsers = usersList.length
  const totalPremium = usersList.filter(u => u.isPremium).length
  const totalTestsCount = usersList.reduce((acc, u) => acc + (u.progressStats?.totalTests || 0), 0)

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-warning-500" />
          Admin Panel (Tizim Boshqaruvi)
        </h1>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-5 border-warning-500/20 bg-warning-500/5">
        <h2 className="font-bold text-warning-400 mb-1 flex items-center gap-2">
          <Crown size={18} />
          Xush kelibsiz, Admin!
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          Bu boshqaruv paneli orqali barcha foydalanuvchilar, ularning limitlari va Premium maqomlarini to'liq nazorat qilishingiz mumkin.
        </p>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm text-center font-semibold flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {/* Global Platform Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <span className="text-2xl font-black text-white">{totalUsers}</span>
          <span className="block text-[11px] text-gray-400 font-medium mt-0.5">Foydalanuvchilar</span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl font-black text-warning-400">{totalPremium}</span>
          <span className="block text-[11px] text-gray-400 font-medium mt-0.5">PRO Premium</span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl font-black text-primary-400">{totalTestsCount}</span>
          <span className="block text-[11px] text-gray-400 font-medium mt-0.5">Jami Testlar</span>
        </div>
      </div>

      {/* Admin Quick Controls */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">O'zingiz uchun tezkor sozlamalar</h2>
        
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Zap className={user?.isPremium ? "text-warning-400 fill-warning-400" : "text-gray-400"} size={16} />
              O'zingiz uchun PRO Premium
            </h3>
            <p className="text-xs text-gray-400">Limitlarni cheksiz qiladi</p>
          </div>
          <button
            onClick={handleTogglePremium}
            disabled={loadingPremium}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              user?.isPremium
                ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                : 'bg-warning-500 hover:bg-warning-600 text-slate-900'
            }`}
          >
            {loadingPremium ? 'Kuting...' : user?.isPremium ? "PRO O'chirish" : "PRO Yoqish"}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <RefreshCw className="text-primary-400" size={16} />
              O'zingiz uchun Limitni nollash
            </h3>
            <p className="text-xs text-gray-400">Bugungi sinovlar sonini 0 qiladi</p>
          </div>
          <button
            onClick={handleResetLimit}
            disabled={loadingLimit}
            className="px-3.5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {loadingLimit ? 'Kuting...' : 'Limitni tozalash'}
          </button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="text-primary-400" size={20} />
            Foydalanuvchilarni boshqarish ({filteredUsers.length})
          </h2>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Ism yoki email bo'yicha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {loadingUsers ? (
          <div className="glass-card p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Foydalanuvchilar ro'yxati yuklanmoqda...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-gray-400">Biror bir foydalanuvchi topilmadi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isUserLoading = actionLoadingId === u.id
              return (
                <div key={u.id} className="glass-card p-4 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white text-base">
                        {u.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{u.firstName} {u.lastName || ''}</h4>
                          {u.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Crown size={10} /> Admin
                            </span>
                          )}
                          {u.isPremium && (
                            <span className="px-2 py-0.5 bg-warning-500/20 border border-warning-500/30 text-warning-400 text-[10px] font-bold rounded-full">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{u.email || `@${u.username || 'user'}`}</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">
                      Bugun: <strong className="text-white">{u.testsToday || 0}</strong>/3 test
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
                    <button
                      onClick={() => handleUserAction(u.id, 'toggle_premium', !u.isPremium)}
                      disabled={isUserLoading}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        u.isPremium
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                          : 'bg-warning-500/20 hover:bg-warning-500/30 text-warning-400 border border-warning-500/30'
                      }`}
                    >
                      <Zap size={14} />
                      <span>{u.isPremium ? 'PRO O\'chirish' : 'PRO Berish'}</span>
                    </button>

                    <button
                      onClick={() => handleUserAction(u.id, 'reset_limit')}
                      disabled={isUserLoading}
                      className="py-1.5 px-3 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>Limit Nollash</span>
                    </button>

                    <button
                      onClick={() => handleUserAction(u.id, 'set_role', u.role === 'admin' ? 'user' : 'admin')}
                      disabled={isUserLoading}
                      className="py-1.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      title="Role o'zgartirish"
                    >
                      <UserCheck size={14} />
                      <span>{u.role === 'admin' ? 'User Qilish' : 'Admin Qilish'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`${u.firstName} ni o'chirishni tasdiqlaysizmi?`)) {
                          handleUserAction(u.id, 'delete')
                        }
                      }}
                      disabled={isUserLoading}
                      className="py-1.5 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-semibold cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
