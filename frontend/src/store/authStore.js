import { create } from 'zustand'
import api, { webLogin as apiWebLogin, authEmail as apiAuthEmail } from '../services/api'

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

export const useAuthStore = create((set, get) => ({
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
          // Xato bo'lsa tozalab tashlaymiz
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

  loginGoogle: async (supabaseUser) => {
    set({ isLoading: true })
    try {
      const email = supabaseUser.email
      const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || email.split('@')[0]
      
      // Backend ga Google user ma'lumotlarini yuborib auth token/user profilini olamiz
      const res = await api.post('/user/login-google', {
        email,
        name,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        supabaseId: supabaseUser.id
      })

      if (res.data && res.data.token && res.data.user) {
        localStorage.setItem('web_user_token', res.data.token)
        localStorage.removeItem('demo_mode')
        set({ user: res.data.user, token: res.data.token, isLoading: false })
        return { success: true }
      }
    } catch (error) {
      console.error('Google login sync error:', error)
      set({ isLoading: false })
      throw error
    }
  },

  loginEmail: async ({ email, name, levelSystem, currentLevel }) => {
    set({ isLoading: true })
    try {
      const res = await apiAuthEmail({ email, name, levelSystem, currentLevel })
      if (res && res.token && res.user) {
        localStorage.setItem('web_user_token', res.token)
        localStorage.removeItem('web_user_profile')
        localStorage.removeItem('demo_mode')
        set({ user: res.user, token: res.token, isLoading: false })
        return { success: true }
      }
    } catch (err) {
      console.error('Email Login Error:', err.message)
      set({ isLoading: false })
      throw err
    }
  },

  loginWeb: async ({ identifier, name, levelSystem, currentLevel }) => {
    set({ isLoading: true })
    const cleanName = (name || identifier || 'Foydalanuvchi').replace('@', '').trim()

    try {
      const res = await apiWebLogin({ identifier, name: cleanName, levelSystem, currentLevel })
      if (res && typeof res === 'object' && res.token && res.user) {
        localStorage.setItem('web_user_token', res.token)
        localStorage.removeItem('web_user_profile')
        localStorage.removeItem('demo_mode')
        set({ user: res.user, token: res.token, isLoading: false })
        return { success: true }
      }
    } catch (err) {
      console.error('API Login Error:', err.message)
      set({ isLoading: false })
      throw err
    }
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
