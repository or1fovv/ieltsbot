import { create } from 'zustand'
import api from '../services/api'

const demoUser = {
  id: 'demo-user',
  telegramId: '123456789',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  levelSystem: 'ielts',
  currentLevel: '5.0',
  language: 'uz',
  isPremium: false,
  progressStats: {
    streak: 0,
    longestStreak: 0,
    totalTests: 0,
    totalSpeaking: 0,
    totalWriting: 0,
  },
  createdAt: new Date().toISOString(),
}

export const useAuthStore = create((set) => ({
  user: null,
  token: null, // Aslida Telegram initData string token sifatida ishlatiladi
  isLoading: true,
  
  initAuth: async (initData, isDevMock = false) => {
    try {
      set({ isLoading: true })
      
      if (isDevMock) {
        localStorage.setItem('demo_mode', '1')
        set({ user: demoUser, token: 'mock-token', isLoading: false })
        return
      }
      
      if (!initData) {
        set({ user: null, token: null, isLoading: false })
        return
      }

      // API call to get/register user
      // Token ni default headersga o'rnatish api interceptors da bo'ladi
      localStorage.setItem('tg_init_data', initData)
      
      const { data } = await api.get('/user')
      set({ user: data, token: initData, isLoading: false })
      
    } catch (error) {
      console.error('Auth initialization error:', error)
      if (import.meta.env.DEV || localStorage.getItem('demo_mode') === '1') {
        set({ user: demoUser, token: 'mock-token', isLoading: false })
        return
      }
      set({ user: null, token: null, isLoading: false })
    }
  },
  
  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } }))
}))
