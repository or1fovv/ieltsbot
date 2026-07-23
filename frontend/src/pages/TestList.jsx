import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, PenTool, ChevronRight } from 'lucide-react'
import { getTodayTopics } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function TestList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [topics, setTopics] = useState({ speaking: [], writing: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTodayTopics()
        setTopics(data.topics)
      } catch (err) {
        console.error('Error fetching topics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Bugungi Testlar</h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-24 w-full rounded-xl"></div>
        ))}
      </div>
    )
  }

  const renderTopicCard = (topic, type) => {
    const isSpeaking = type === 'speaking'
    const Icon = isSpeaking ? Mic : PenTool
    
    // Subtype nomini chiroyli qilish
    const subtypeName = topic.subtype.replace('part', 'Part ').replace('task', 'Task ')
    
    // Vaqt limiti
    const timeLimit = topic.topicData?.time_limit_minutes

    return (
      <div 
        key={topic.id}
        onClick={() => navigate(`/test/${type}/${topic.subtype}`)}
        className="glass-card p-4 cursor-pointer group"
      >
        <div className="flex gap-4 items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSpeaking ? 'bg-accent-500/20 text-accent-400' : 'bg-primary-500/20 text-primary-400'}`}>
            <Icon size={24} />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg">{subtypeName}</h3>
              {timeLimit && (
                <span className="text-xs px-2 py-1 bg-surface-700 rounded-md text-gray-300">
                  {timeLimit} min
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {topic.topicText}
            </p>
          </div>
          
          <div className="text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold mb-2">Test Tanlash</h1>
        <p className="text-gray-400 text-sm">
          Daraja: <span className="text-white font-medium">{user?.currentLevel}</span> ({user?.levelSystem.toUpperCase()})
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-accent-400 flex items-center gap-2">
          <Mic size={20} />
          Speaking
        </h2>
        <div className="space-y-3">
          {topics.speaking?.map(topic => renderTopicCard(topic, 'speaking'))}
          {(!topics.speaking || topics.speaking.length === 0) && (
            <p className="text-gray-500 text-center py-4">Mavzular topilmadi</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary-400 flex items-center gap-2">
          <PenTool size={20} />
          Writing
        </h2>
        <div className="space-y-3">
          {topics.writing?.map(topic => renderTopicCard(topic, 'writing'))}
          {(!topics.writing || topics.writing.length === 0) && (
            <p className="text-gray-500 text-center py-4">Mavzular topilmadi</p>
          )}
        </div>
      </div>
    </div>
  )
}
