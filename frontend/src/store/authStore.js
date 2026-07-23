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
        try {
          const { data } = await api.get('/user')
          set({ user: data, token: initData, isLoading: false })
          return
        } catch (e) {
          console.warn('Telegram user fetch error:', e.message)
        }
      }

      // 2. Veb login token saqlangan bo'lsa (API call)
      const webToken = localStorage.getItem('web_user_token')
      if (webToken) {
        try {
          const { data } = await api.get('/user')
          set({ user: data, token: webToken, isLoading: false })
          return
        } catch {
          // Ignore API error and try local profile fallback
        }
      }

      // 3. Local web profile saqlangan bo'lsa (Offline/Vercel fallback)
      const localProfileStr = localStorage.getItem('web_user_profile')
      if (localProfileStr) {
        try {
          const localUser = JSON.parse(localProfileStr)
          set({ user: localUser, token: localUser.id, isLoading: false })
          return
        } catch {}
      }

      // 4. Demo rejim saqlangan bo'lsa
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
    const cleanName = (name || identifier || 'Foydalanuvchi').replace('@', '').trim()

    try {
      const res = await apiWebLogin({ identifier, name, levelSystem, currentLevel })
      if (res && typeof res === 'object' && res.token && res.user) {
        localStorage.setItem('web_user_token', res.token)
        localStorage.removeItem('demo_mode')
        set({ user: res.user, token: res.token, isLoading: false })
        return { success: true }
      }
    } catch (err) {
      console.warn('API Login fallback to local session:', err.message)
    }

    // Unstoppable Local Session Fallback
    const localUser = {
      id: `web-${Date.now()}`,
      telegramId: '000000000',
      firstName: cleanName,
      lastName: '',
      username: identifier?.replace('@', '') || 'web_user',
      levelSystem: levelSystem || 'ielts',
      currentLevel: currentLevel || '6.0',
      language: 'uz',
      isPremium: false,
      progressStats: {
        streak: 1,
        longestStreak: 1,
        totalTests: 0,
        totalSpeaking: 0,
        totalWriting: 0,
      },
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('web_user_profile', JSON.stringify(localUser))
    localStorage.setItem('web_user_token', localUser.id)
    localStorage.removeItem('demo_mode')
    set({ user: localUser, token: localUser.id, isLoading: false })
    return { success: true }
  },

  loginDemo: () => {
    localStorage.setItem('demo_mode', '1')
    set({ user: demoUser, token: 'demo-token', isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('tg_init_data')
    localStorage.removeItem('web_user_token')
    localStorage.removeItem('web_user_profile')
    localStorage.removeItem('demo_mode')
    set({ user: null, token: null, isLoading: false })
  },
  
  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } }))
}))
