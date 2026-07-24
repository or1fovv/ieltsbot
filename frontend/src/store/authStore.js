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
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = (name || cleanEmail.split('@')[0] || 'Foydalanuvchi').replace('@', '').trim()
    const adminEmails = ['orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com']
    const isAdmin = adminEmails.includes(cleanEmail) || cleanEmail.startsWith('maxa') || cleanEmail.startsWith('or1fovv')

    try {
      const res = await apiAuthEmail({ email: cleanEmail, name: cleanName, levelSystem, currentLevel })
      if (res && res.token && res.user) {
        localStorage.setItem('web_user_token', res.token)
        localStorage.removeItem('web_user_profile')
        localStorage.removeItem('demo_mode')
        set({ user: res.user, token: res.token, isLoading: false })
        return { success: true }
      }
    } catch (err) {
      console.warn('API Email Login fallback to instant local session:', err.message)
    }

    // Bulletproof Fail-safe User Session
    const emailUser = {
      id: `email-${cleanEmail.replace(/[^a-z0-9]/gi, '')}-${Date.now()}`,
      telegramId: '000000000',
      firstName: cleanName,
      lastName: '',
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'user',
      isPremium: isAdmin ? true : false,
      levelSystem: levelSystem || 'ielts',
      currentLevel: currentLevel || '6.0',
      language: 'uz',
      progressStats: {
        streak: 1,
        longestStreak: 1,
        totalTests: 0,
        totalSpeaking: 0,
        totalWriting: 0,
      },
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('web_user_profile', JSON.stringify(emailUser))
    localStorage.setItem('web_user_token', emailUser.id)
    localStorage.removeItem('demo_mode')
    set({ user: emailUser, token: emailUser.id, isLoading: false })
    return { success: true }
  },

  loginWeb: async ({ identifier, name, levelSystem, currentLevel }) => {
    set({ isLoading: true })
    const cleanInput = (identifier || name || 'user').replace('@', '').trim()
    const cleanName = (name || identifier || 'Foydalanuvchi').replace('@', '').trim()
    const isAdmin = cleanInput.toLowerCase() === 'maxa' || cleanInput.toLowerCase() === 'or1fovv'

    try {
      const res = await apiWebLogin({ identifier: cleanInput, name: cleanName, levelSystem, currentLevel })
      if (res && typeof res === 'object' && res.token && res.user) {
        localStorage.setItem('web_user_token', res.token)
        localStorage.removeItem('web_user_profile')
        localStorage.removeItem('demo_mode')
        set({ user: res.user, token: res.token, isLoading: false })
        return { success: true }
      }
    } catch (err) {
      console.warn('API Web Login fallback to instant local session:', err.message)
    }

    // Bulletproof Fail-safe User Session
    const localUser = {
      id: `web-${cleanInput.replace(/[^a-z0-9]/gi, '')}-${Date.now()}`,
      telegramId: '000000000',
      firstName: cleanName,
      lastName: '',
      username: cleanInput,
      email: `${cleanInput}@gmail.com`,
      role: isAdmin ? 'admin' : 'user',
      isPremium: isAdmin ? true : false,
      levelSystem: levelSystem || 'ielts',
      currentLevel: currentLevel || '6.0',
      language: 'uz',
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
