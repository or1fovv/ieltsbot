import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Save, Check, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { updateSettings } from '../services/api'

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    levelSystem: user?.levelSystem || 'ielts',
    currentLevel: user?.currentLevel || '5.0',
    language: user?.language || 'uz'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSuccess(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateSettings(formData)
      updateUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert("Xato yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  const ieltsLevels = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold mb-4">Profil</h1>

      {/* User Info Card */}
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          {user?.firstName?.charAt(0) || 'U'}
        </div>
        <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
        <p className="text-gray-400">@{user?.username || 'user'}</p>
        
        {user?.isPremium && (
          <div className="mt-3 px-3 py-1 bg-warning-500/20 text-warning-400 rounded-full text-xs font-bold border border-warning-500/30">
            PRO
          </div>
        )}
      </div>

      {/* Settings Form */}
      <div className="glass-card p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-primary-400">
          <Settings size={18} />
          Sozlamalar
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Til</label>
            <select 
              name="language" 
              value={formData.language}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-surface-600 rounded-lg p-3 text-white outline-none focus:border-primary-500"
            >
              <option value="uz">O'zbek tili</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Daraja tizimi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, levelSystem: 'ielts', currentLevel: '5.0' })}
                className={`py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.levelSystem === 'ielts' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-surface-800 border border-surface-600 text-gray-300'
                }`}
              >
                IELTS
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, levelSystem: 'cefr', currentLevel: 'B1' })}
                className={`py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.levelSystem === 'cefr' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-surface-800 border border-surface-600 text-gray-300'
                }`}
              >
                CEFR
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Joriy daraja</label>
            <select 
              name="currentLevel" 
              value={formData.currentLevel}
              onChange={handleChange}
              className="w-full bg-surface-800 border border-surface-600 rounded-lg p-3 text-white outline-none focus:border-primary-500"
            >
              {(formData.levelSystem === 'ielts' ? ieltsLevels : cefrLevels).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient w-full flex items-center justify-center gap-2 mt-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <>
                <Check size={18} />
                Saqlandi
              </>
            ) : (
              <>
                <Save size={18} />
                Saqlash
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Panel button - Admin foydalanuvchilar uchun */}
      {(user?.role === 'admin' ||
        user?.username?.toLowerCase().includes('maxa') ||
        user?.username?.toLowerCase().includes('maxmudorifov') ||
        user?.email?.toLowerCase().includes('maxmudorifov') ||
        user?.firstName?.toLowerCase().includes('maxa')) && (
        <Link
          to="/admin"
          className="w-full p-4 bg-gradient-to-r from-warning-500/20 to-amber-500/20 hover:from-warning-500/30 hover:to-amber-500/30 border-2 border-warning-500/50 text-warning-400 font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all mb-4 text-base shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
        >
          <Shield size={22} className="fill-warning-500/20" />
          <span>⚡ Tizim boshqaruvi (Admin Panel)</span>
        </Link>
      )}

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full p-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        <LogOut size={18} />
        <span>Chiqish (Logout)</span>
      </button>
    </div>
  )
}
