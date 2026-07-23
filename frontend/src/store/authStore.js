import { create } from 'zustand'
import api, { webLogin as apiWebLogin } from '../services/api'

const demoUser = {
  id: 'demo-user-guest',
  telegramId: '999999999',
  firstName: 'Sinov',
  lastName: 'Foydalanuvchi',
  username: 'demo_user',
  levelSystem: 'ielts',
  currentLevel: '5.0',
  language: 'uz',
  isPremium: false,
  progressStats: {
    streak: 1,
    longestStreak: 3,
    totalTests: 2,
    totalSpeaking: 1,
    totalWriting: 1,
  },
  createdAt: new Date().toISOString(),
}

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  
  initAuth: async (initData, isDevMock = false) => {
    try {
      set({ isLoading: true })
      
      // 1. Telegram initData bo'lsa
      if (initData) {
        localStorage.setItem('tg_init_data', initData)
        const { data } = await api.get('/user')
        set({ user: data, token: initData, isLoading: false })
        return
      }

      // 2. Veb login token saqlangan bo'lsa
      const webToken = localStorage.getItem('web_user_token')
      if (webToken) {
        try {
          const { data } = await api.get('/user')
          set({ user: data, token: webToken, isLoading: false })
          return
        } catch {
          localStorage.removeItem('web_user_token')
        }
      }

      // 3. Demo rejim saqlangan bo'lsa
      if (localStorage.getItem('demo_mode') === '1' || isDevMock) {
        set({ user: demoUser, token: 'demo-token', isLoading: false })
        return
      }

      set({ user: null, token: null, isLoading: false })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ user: null, token: null, isLoading: false })
    }
  },

  loginWeb: async ({ identifier, name, levelSystem, currentLevel }) => {
    set({ isLoading: true })
    try {
      const res = await apiWebLogin({ identifier, name, levelSystem, currentLevel })
      if (res.token && res.user) {
        localStorage.setItem('web_user_token', res.token)
        localStorage.removeItem('demo_mode')
        set({ user: res.user, token: res.token, isLoading: false })
        return { success: true }
      }
      throw new Error('Kirish javobi noto\'g\'ri')
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.response?.data?.error || err.message || 'Kirishda xatolik' }
    }
  },

  loginDemo: () => {
    localStorage.setItem('demo_mode', '1')
    set({ user: demoUser, token: 'demo-token', isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('tg_init_data')
    localStorage.removeItem('web_user_token')
    localStorage.removeItem('demo_mode')
    set({ user: null, token: null, isLoading: false })
  },
  
  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } }))
}))
