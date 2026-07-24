import { create } from 'zustand'
import api, { authEmail as apiAuthEmail } from '../services/api'
import { supabase } from '../services/supabaseClient'

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
      
      // 1. Supabase Auth session tekshirish (Google OAuth birinchi o'rinda)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await get().loginGoogle(session.user)
        return
      }

      // 2. Telegram initData bo'lsa
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

      // 3. Veb login token saqlangan bo'lsa (API call)
      const webToken = localStorage.getItem('web_user_token')
      if (webToken) {
        try {
          const { data } = await api.get('/user')
          set({ user: data, token: webToken, isLoading: false })
          return
        } catch {
          const storedUserStr = localStorage.getItem('web_user_profile')
          if (storedUserStr) {
            set({ user: JSON.parse(storedUserStr), token: webToken, isLoading: false })
            return
          }
          localStorage.removeItem('web_user_token')
        }
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

  // 1. Real Google OAuth login (Supabase verified session)
  loginGoogle: async (supabaseUser) => {
    try {
      const email = (supabaseUser.email || '').toLowerCase()
      const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || email.split('@')[0]
      const adminEmails = ['maxmudorifov36@gmail.com', 'orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com']
      const isAdmin = adminEmails.includes(email) || email.includes('maxmudorifov36')
      
      const googleUser = {
        id: supabaseUser.id || `google-${email.replace(/[^a-z0-9]/gi, '')}`,
        telegramId: '000000000',
        firstName: name,
        username: email.split('@')[0] || 'admin',
        email: email,
        role: isAdmin ? 'admin' : 'user',
        isPremium: isAdmin ? true : false,
        levelSystem: 'ielts',
        currentLevel: '6.0',
        language: 'uz',
        progressStats: { streak: 1, totalTests: 0 }
      }

      localStorage.setItem('web_user_token', googleUser.id)
      localStorage.setItem('web_user_profile', JSON.stringify(googleUser))
      localStorage.removeItem('demo_mode')
      set({ user: googleUser, token: googleUser.id, isLoading: false })

      // Background sync with API
      api.post('/user/login-google', {
        email,
        name,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        supabaseId: supabaseUser.id
      }).then(res => {
        if (res.data && res.data.token && res.data.user) {
          const backendUser = {
            ...res.data.user,
            role: isAdmin ? 'admin' : res.data.user.role,
            isPremium: isAdmin ? true : res.data.user.isPremium
          }
          localStorage.setItem('web_user_token', res.data.token)
          localStorage.setItem('web_user_profile', JSON.stringify(backendUser))
          set({ user: backendUser, token: res.data.token })
        }
      }).catch(err => console.warn('Background Google sync error:', err.message))

      return { success: true }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  },

  // 2. Real Email & Password Ro'yxatdan O'tish (Supabase Auth)
  signUpEmail: async ({ email, password, name, levelSystem, currentLevel }) => {
    const cleanEmail = email.trim().toLowerCase()
    
    // Supabase Auth orqali haqiqiy registratsiya
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: name || cleanEmail.split('@')[0],
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    const adminEmails = ['maxmudorifov36@gmail.com', 'orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com']
    const isAdmin = adminEmails.includes(cleanEmail)

    const emailUser = {
      id: authData.user?.id || `email-${cleanEmail.replace(/[^a-z0-9]/gi, '')}`,
      telegramId: '000000000',
      firstName: name || cleanEmail.split('@')[0],
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'user',
      isPremium: isAdmin ? true : false,
      levelSystem: levelSystem || 'ielts',
      currentLevel: currentLevel || '6.0',
      language: 'uz',
      progressStats: { streak: 1, totalTests: 0 },
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('web_user_token', emailUser.id)
    localStorage.setItem('web_user_profile', JSON.stringify(emailUser))
    localStorage.removeItem('demo_mode')
    set({ user: emailUser, token: emailUser.id, isLoading: false })

    apiAuthEmail({ email: cleanEmail, name: emailUser.firstName, levelSystem, currentLevel })
      .catch(err => console.warn('Background Email sync error:', err.message))

    return { success: true, needsConfirmation: !authData.session }
  },

  // 3. Real Email & Password Kirish (Supabase Auth)
  signInEmail: async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    const adminEmails = ['maxmudorifov36@gmail.com', 'orifovdev@gmail.com', 'or1fovv@gmail.com', 'maxa@gmail.com', 'admin@gmail.com']
    const isAdmin = adminEmails.includes(cleanEmail)

    const emailUser = {
      id: authData.user.id,
      telegramId: '000000000',
      firstName: authData.user.user_metadata?.full_name || cleanEmail.split('@')[0],
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'user',
      isPremium: isAdmin ? true : false,
      levelSystem: 'ielts',
      currentLevel: '6.0',
      language: 'uz',
      progressStats: { streak: 1, totalTests: 0 },
    }

    localStorage.setItem('web_user_token', emailUser.id)
    localStorage.setItem('web_user_profile', JSON.stringify(emailUser))
    localStorage.removeItem('demo_mode')
    set({ user: emailUser, token: emailUser.id, isLoading: false })

    apiAuthEmail({ email: cleanEmail, name: emailUser.firstName })
      .catch(err => console.warn('Background Email sync error:', err.message))

    return { success: true }
  },

  loginDemo: () => {
    localStorage.setItem('demo_mode', '1')
    set({ user: demoUser, token: 'demo-token', isLoading: false })
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase signout error:', e.message)
    }
    localStorage.removeItem('web_user_token')
    localStorage.removeItem('web_user_profile')
    localStorage.removeItem('tg_init_data')
    localStorage.removeItem('demo_mode')
    set({ user: null, token: null, isLoading: false })
  },

  updateUser: (fields) => {
    set((state) => {
      const updated = { ...state.user, ...fields }
      localStorage.setItem('web_user_profile', JSON.stringify(updated))
      return { user: updated }
    })
  },
}))

// Google OAuth redirect avtomatik tutib olish
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
    useAuthStore.getState().loginGoogle(session.user)
  }
})
