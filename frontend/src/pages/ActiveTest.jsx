import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Clock, AlertCircle } from 'lucide-react'
import { getTodayTopics, submitSpeaking, submitWriting } from '../services/api'
import AudioRecorder from '../components/AudioRecorder'

export default function ActiveTest() {
  const { type, subtype } = useParams()
  const navigate = useNavigate()
  
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [textAnswer, setTextAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTodayTopics()
        const foundTopic = data.topics[type]?.find(t => t.subtype === subtype)
        
        if (foundTopic) {
          setTopic(foundTopic)
          if (foundTopic.topicData?.time_limit_minutes) {
            setTimeLeft(foundTopic.topicData.time_limit_minutes * 60)
          }
        } else {
          setError("Mavzu topilmadi")
        }
      } catch (err) {
        setError("Ma'lumotni yuklashda xato yuz berdi")
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [type, subtype])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timeLeft, submitting])

  const formatTime = (seconds) => {
    if (seconds === null) return ''
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleWritingSubmit = async () => {
    if (textAnswer.trim().length < 20) {
      alert("Javobingiz juda qisqa!")
      return
    }
    
    try {
      setSubmitting(true)
      const data = await submitWriting(topic.id, textAnswer, subtype)
      navigate(`/results/${data.submission.id}`)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || "Xato yuz berdi")
      setSubmitting(false)
    }
  }

  const handleSpeakingSubmit = async (audioBlob) => {
    if (!audioBlob) return
    
    try {
      setSubmitting(true)
      const data = await submitSpeaking(topic.id, audioBlob, subtype)
      navigate(`/results/${data.submission.id}`)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || "Xato yuz berdi")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-1/3"></div>
        <div className="skeleton h-32 w-full rounded-xl"></div>
        <div className="skeleton h-64 w-full rounded-xl"></div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="text-center py-10">
        <AlertCircle size={48} className="mx-auto text-danger-500 mb-4" />
        <h2 className="text-xl font-bold mb-4">{error}</h2>
        <button onClick={() => navigate('/tests')} className="btn-secondary">
          Orqaga qaytish
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/tests')} 
          className="p-2 -ml-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="font-bold text-lg capitalize">
          {type} {subtype.replace('part', 'Part ').replace('task', 'Task ')}
        </h1>
        
        <div className={`flex items-center gap-1 font-mono font-medium ${timeLeft !== null && timeLeft < 60 ? 'text-danger-400 animate-pulse' : 'text-primary-400'}`}>
          {timeLeft !== null && (
            <>
              <Clock size={16} />
              {formatTime(timeLeft)}
            </>
          )}
        </div>
      </div>

      {/* Topic Card */}
      <div className="glass-card p-5 border-primary-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Mavzu</h2>
        <p className="text-lg whitespace-pre-wrap">{topic.topicText}</p>
        
        {topic.topicData?.instructions && (
          <div className="mt-4 p-3 bg-surface-800 rounded-lg border border-surface-600 text-sm text-gray-300">
            {topic.topicData.instructions}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div>
        {type === 'writing' ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Javobingizni shu yerga yozing..."
                className="w-full h-64 bg-surface-800 border border-surface-600 rounded-xl p-4 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                disabled={submitting}
              />
              <div className="absolute bottom-3 right-4 text-xs text-gray-500 font-mono">
                {textAnswer.trim().split(/\s+/).filter(w => w.length > 0).length} so'z
              </div>
            </div>
            
            <button 
              onClick={handleWritingSubmit}
              disabled={submitting}
              className="btn-gradient w-full flex justify-center items-center gap-2 py-3"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Baholanmoqda...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Javobni yuborish
                </>
              )}
            </button>
          </div>
        ) : (
          <AudioRecorder onSubmit={handleSpeakingSubmit} isSubmitting={submitting} />
        )}
      </div>
    </div>
  )
}
