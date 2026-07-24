import axios from 'axios'

// API base URL - Render.com deployed backend
const baseURL = import.meta.env.VITE_API_URL || 'https://ieltsbot-backend.onrender.com/api'


const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
})

// Request interceptor: tokenlarni har bir so'rovga biriktirish
api.interceptors.request.use((config) => {
  const webToken = localStorage.getItem('web_user_token')
  const tgInitData = localStorage.getItem('tg_init_data')

  if (webToken) {
    config.headers['x-web-user-id'] = webToken
    config.headers['Authorization'] = `Bearer ${webToken}`
  }
  if (tgInitData) {
    config.headers['x-telegram-init-data'] = tgInitData
  }
  return config
})

const demoTopics = {
  speaking: [
    {
      id: 'demo-speaking-part1',
      type: 'speaking',
      subtype: 'part1',
      topicText: 'Talk about your hometown. Where is it? What is it like? Do you prefer living there or somewhere else?',
      topicData: { instructions: 'Answer naturally for 1-2 minutes. Use simple, clear language.', time_limit_minutes: 2 },
    },
    {
      id: 'demo-speaking-part1-b',
      type: 'speaking',
      subtype: 'part1',
      topicText: 'Do you prefer studying in the morning or in the evening? Explain your answer with examples.',
      topicData: { instructions: 'Answer naturally for 1-2 minutes.', time_limit_minutes: 2 },
    },
    {
      id: 'demo-speaking-part2',
      type: 'speaking',
      subtype: 'part2',
      topicText: 'Describe a skill you would like to learn in the future. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how it could help you.',
      topicData: { instructions: 'Prepare for 1 minute, then speak for 2-3 minutes.', time_limit_minutes: 3 },
    },
    {
      id: 'demo-speaking-part2-b',
      type: 'speaking',
      subtype: 'part2',
      topicText: 'Describe a family member you admire greatly. You should say: who this person is, what they are like, what you do together, and explain why you admire them.',
      topicData: { instructions: 'Prepare for 1 minute, then speak for 2-3 minutes.', time_limit_minutes: 3 },
    },
    {
      id: 'demo-speaking-part3',
      type: 'speaking',
      subtype: 'part3',
      topicText: 'How has technology changed the way people learn languages? What are the main advantages and disadvantages of learning languages online?',
      topicData: { instructions: 'Give a developed opinion and compare different viewpoints. Speak for 3-4 minutes.', time_limit_minutes: 4 },
    },
    {
      id: 'demo-speaking-part3-b',
      type: 'speaking',
      subtype: 'part3',
      topicText: 'Discussion: What role should governments play in encouraging people to live healthier lifestyles? Should healthy food be subsidized?',
      topicData: { instructions: 'Give a well-reasoned discussion with examples. Speak for 3-4 minutes.', time_limit_minutes: 4 },
    },
  ],
  writing: [
    {
      id: 'demo-writing-task1-a',
      type: 'writing',
      subtype: 'task1',
      topicText: 'The bar chart below shows the number of mobile phone users in five different countries in 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      topicData: {
        instructions: 'Write at least 150 words in 20 minutes. Include an overview and compare key data.',
        image_url: '/charts/bar_mobile_phones.png',
        time_limit_minutes: 20,
        word_limit: 150,
      },
    },
    {
      id: 'demo-writing-task1-b',
      type: 'writing',
      subtype: 'task1',
      topicText: 'The line graph shows global carbon dioxide emissions (in billion tonnes) between 1990 and 2020. Summarise the main trends shown in the graph and compare key periods.',
      topicData: {
        instructions: 'Write at least 150 words. Describe overall trends and any notable changes. Write in 20 minutes.',
        image_url: '/charts/line_co2.png',
        time_limit_minutes: 20,
        word_limit: 150,
      },
    },
    {
      id: 'demo-writing-task2-a',
      type: 'writing',
      subtype: 'task2',
      topicText: 'Some people believe that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree?',
      topicData: { instructions: 'Write at least 250 words in 40 minutes. Give clear reasons and relevant examples.', time_limit_minutes: 40, word_limit: 250 },
    },
    {
      id: 'demo-writing-task2-b',
      type: 'writing',
      subtype: 'task2',
      topicText: 'Many people believe that children who grow up in cities have fewer opportunities to connect with nature. Do you think this is a problem? What can be done to solve it?',
      topicData: { instructions: 'Write at least 250 words in 40 minutes. Address both parts of the question.', time_limit_minutes: 40, word_limit: 250 },
    },
  ],
}


const demoProgress = {
  streak: 2,
  longestStreak: 4,
  totalTests: 3,
  totalSpeaking: 1,
  totalWriting: 2,
  avgSpeakingScore: 6.0,
  avgWritingScore: 6.5,
  recentSubmissions: [
    {
      id: 'demo-result-1',
      type: 'writing',
      bandScore: 6.5,
      cefrLevel: 'B2',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-result-2',
      type: 'speaking',
      bandScore: 6.0,
      cefrLevel: 'B2',
      createdAt: new Date().toISOString(),
    },
  ],
}

const demoFeedback = {
  band_score: 6.5,
  cefr_level: 'B2',
  criteria: {
    task_response: { score: 6.5, comment: 'Answer addresses the task and gives relevant examples.' },
    coherence_cohesion: { score: 6.0, comment: 'Ideas are clear, but linking could be smoother.' },
    lexical_resource: { score: 6.5, comment: 'Vocabulary is suitable with some good topic-specific words.' },
    grammar: { score: 6.0, comment: 'Good range of structures, with a few noticeable errors.' },
  },
  strengths: ['Clear opinion', 'Relevant examples'],
  errors: [
    {
      original: 'people is learning',
      correction: 'people are learning',
      explanation: 'Use plural verb agreement with "people".',
    },
  ],
  recommendations: ['Use more precise linking phrases.', 'Add one more specific example in the body paragraph.'],
  improved_version: 'Online learning can be highly effective when students have discipline and access to good materials. However, classroom learning still offers direct interaction and immediate feedback.',
}

// Topics, progress, history uchun: web_user_profile ham fallback oladi
const isDemoMode = () =>
  import.meta.env.DEV ||
  localStorage.getItem('demo_mode') === '1' ||
  !!localStorage.getItem('web_user_profile')

// Faqat submissions (writing/speaking) uchun: FAQAT explicit demo_mode='1' bo'lganda fake feedback
// Boshqa hollarda real Groq AI baholash ishlaydi
const isExplicitDemoMode = () => localStorage.getItem('demo_mode') === '1'

const getStoredDemoSubmissions = () => {
  try {
    return JSON.parse(localStorage.getItem('demo_submissions') || '[]')
  } catch {
    return []
  }
}

const saveDemoSubmission = (submission) => {
  const submissions = [submission, ...getStoredDemoSubmissions()].slice(0, 20)
  localStorage.setItem('demo_submissions', JSON.stringify(submissions))
}

const createDemoSubmission = ({ type, subtype, content, audioUrl, transcript }) => {
  const submission = {
    id: `demo-${Date.now()}`,
    type,
    subtype,
    content,
    audioUrl,
    transcript,
    feedbackJson: demoFeedback,
    bandScore: demoFeedback.band_score,
    cefrLevel: demoFeedback.cefr_level,
    status: 'completed',
    createdAt: new Date().toISOString(),
    topic: {
      topicText: type === 'speaking' ? 'Demo speaking practice' : 'Demo writing practice',
      subtype,
      type,
    },
  }
  saveDemoSubmission(submission)
  return submission
}

// Request interceptor — har bir so'rovga telegram initData yoki web token qo'shish
api.interceptors.request.use((config) => {
  const initData = localStorage.getItem('tg_init_data')
  const webToken = localStorage.getItem('web_user_token')
  if (initData) {
    config.headers['x-telegram-init-data'] = initData
  } else if (webToken) {
    config.headers['x-web-user-id'] = webToken
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Veb orqali kirish (Username / Name)
export const webLogin = async ({ identifier, name, levelSystem, currentLevel }) => {
  const { data } = await api.post('/user/login', { identifier, name, levelSystem, currentLevel })
  return data
}

// Barcha submission history'ni olish
export const getHistory = async (page = 1) => {
  try {
    const { data } = await api.get(`/submissions?page=${page}`)
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    const submissions = getStoredDemoSubmissions()
    return { submissions, total: submissions.length, page, totalPages: 1 }
  }
}

// Bitta submission ma'lumotini olish
export const getSubmission = async (id) => {
  try {
    const { data } = await api.get(`/submissions/${id}`)
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    const stored = getStoredDemoSubmissions().find((item) => item.id === id)
    return stored || {
      id,
      type: 'writing',
      subtype: 'task2',
      feedbackJson: demoFeedback,
      bandScore: demoFeedback.band_score,
      cefrLevel: demoFeedback.cefr_level,
      createdAt: new Date().toISOString(),
    }
  }
}

// Bugungi testlarni olish
export const getTodayTopics = async () => {
  try {
    const { data } = await api.get('/topics/today')
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    return { topics: demoTopics }
  }
}

// Keyingi test mavzusini olish
export const getNextTopic = async (type) => {
  try {
    const { data } = await api.get(`/topics/next?type=${type}`)
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    return { topic: demoTopics[type]?.[0] || null }
  }
}

// Progress statistika
export const getProgress = async () => {
  try {
    const { data } = await api.get('/progress')
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    const submissions = getStoredDemoSubmissions()
    return {
      ...demoProgress,
      totalTests: demoProgress.totalTests + submissions.length,
      recentSubmissions: [...demoProgress.recentSubmissions, ...submissions].slice(-30),
    }
  }
}

// User settings yangilash
export const updateSettings = async (settings) => {
  try {
    const { data } = await api.put('/user/settings', settings)
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    return {
      id: 'demo-user',
      telegramId: '123456789',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      isPremium: false,
      ...settings,
    }
  }
}

// Matnli javobni yuborish (Writing)
export const submitWriting = async (topicId, content, subtype) => {
  try {
    // Writing baholash Groq LLaMA orqali 20-40s olishi mumkin — 120s timeout
    const { data } = await api.post('/submissions/writing', {
      topicId,
      content,
      subtype
    }, { timeout: 120000 })
    return data
  } catch (error) {
    // Faqat aniq demo rejimda fake feedback - real foydalanuvchilar uchun xato ko'rsatish
    if (!isExplicitDemoMode()) throw error
    const submission = createDemoSubmission({ type: 'writing', subtype, content })
    return { submission, remaining: 2 }
  }
}

// Ovozli javobni yuborish (Speaking)
export const submitSpeaking = async (topicId, audioBlob, subtype) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.ogg')
  if (topicId) formData.append('topicId', topicId)
  if (subtype) formData.append('subtype', subtype)

  try {
    // Speaking: Groq Whisper (STT) + LLaMA (baholash) = 30-60s — 120s timeout
    const { data } = await api.post('/submissions/speaking', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
    return data
  } catch (error) {
    // Faqat aniq demo rejimda fake feedback - real foydalanuvchilar uchun xato ko'rsatish
    if (!isExplicitDemoMode()) throw error
    const submission = createDemoSubmission({
      type: 'speaking',
      subtype,
      audioUrl: '',
      transcript: 'This is a demo transcript for local testing.',
    })
    return { submission, transcript: submission.transcript, remaining: 2 }
  }
}


// Email/Gmail orqali kirish / ro'yxatdan o'tish
export const authEmail = async ({ email, name, levelSystem, currentLevel }) => {
  const { data } = await api.post('/user/auth-email', { email, name, levelSystem, currentLevel })
  return data
}

// Admin: Barcha foydalanuvchilar ro'yxati
export const getAdminUsers = async () => {
  try {
    const { data } = await api.get('/user/admin/users')
    if (data && data.users && data.users.length > 0) {
      return data
    }
  } catch (err) {
    console.warn("Backend getAdminUsers error, using registered profiles fallback:", err.message)
  }

  const users = []
  const storedUserStr = localStorage.getItem('web_user_profile')
  if (storedUserStr) {
    try {
      users.push(JSON.parse(storedUserStr))
    } catch (e) {}
  }

  // Active admin users guarantee
  if (!users.some(u => u.email === 'maxmudorifov36@gmail.com')) {
    users.unshift({
      id: 'admin-maxmudorifov36',
      firstName: 'Maxmud Orifov',
      username: 'maxa',
      email: 'maxmudorifov36@gmail.com',
      role: 'admin',
      isPremium: true,
      testsToday: 0,
      createdAt: new Date().toISOString()
    })
  }

  return { users }
}

// Admin: Foydalanuvchi ustida amal bajarish (premium, limit, role, delete)
export const performAdminUserAction = async ({ targetUserId, action, value }) => {
  const { data } = await api.post('/user/admin/user-action', { targetUserId, action, value })
  return data
}

// Limitni nollash (Admin)
export const resetLimit = async () => {
  const { data } = await api.post('/user/reset-limit')
  return data
}

// Premium yoqish/o'chirish (Admin)
export const upgradePremium = async (isPremium = true) => {
  const { data } = await api.post('/user/upgrade-premium', { isPremium })
  return data
}

export default api
