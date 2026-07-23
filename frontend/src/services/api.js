import axios from 'axios'

// API base URL
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const demoTopics = {
  speaking: [
    {
      id: 'demo-speaking-part1',
      type: 'speaking',
      subtype: 'part1',
      topicText: 'Do you prefer studying in the morning or in the evening? Explain your answer with examples.',
      topicData: { instructions: 'Answer naturally for 1-2 minutes.', time_limit_minutes: 2 },
    },
    {
      id: 'demo-speaking-part2',
      type: 'speaking',
      subtype: 'part2',
      topicText: 'Describe a skill you would like to learn in the future. You should say what it is, why you want to learn it, how you would learn it, and how it could help you.',
      topicData: { instructions: 'Prepare a structured answer with clear examples.', time_limit_minutes: 2 },
    },
    {
      id: 'demo-speaking-part3',
      type: 'speaking',
      subtype: 'part3',
      topicText: 'How has technology changed the way people learn languages?',
      topicData: { instructions: 'Give a developed opinion and compare different viewpoints.', time_limit_minutes: 3 },
    },
  ],
  writing: [
    {
      id: 'demo-writing-task1',
      type: 'writing',
      subtype: 'task1',
      topicText: 'The chart shows how students in one city travelled to school in 2010 and 2020. Summarise the information by selecting and reporting the main features.',
      topicData: { instructions: 'Write at least 150 words.', time_limit_minutes: 20, word_limit: 150 },
    },
    {
      id: 'demo-writing-task2',
      type: 'writing',
      subtype: 'task2',
      topicText: 'Some people believe that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree?',
      topicData: { instructions: 'Write at least 250 words.', time_limit_minutes: 40, word_limit: 250 },
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

const isDemoMode = () => import.meta.env.DEV || localStorage.getItem('demo_mode') === '1'

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

// Request interceptor — har bir so'rovga telegram initData qo'shish
api.interceptors.request.use((config) => {
  const initData = localStorage.getItem('tg_init_data')
  if (initData) {
    config.headers['x-telegram-init-data'] = initData
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

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
    const { data } = await api.post('/submissions/writing', {
      topicId,
      content,
      subtype
    })
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
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
    const { data } = await api.post('/submissions/speaking', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  } catch (error) {
    if (!isDemoMode()) throw error
    const submission = createDemoSubmission({
      type: 'speaking',
      subtype,
      audioUrl: '',
      transcript: 'This is a demo transcript for local testing.',
    })
    return { submission, transcript: submission.transcript, remaining: 2 }
  }
}

export default api
