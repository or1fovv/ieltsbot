import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Star, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getProgress, getTodayTopics } from '../services/api'
import ScoreRing from '../components/ScoreRing'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [topics, setTopics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressData, topicsData] = await Promise.all([
          getProgress(),
          getTodayTopics()
        ])
        setStats(progressData)
        setTopics(topicsData.topics)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 w-full rounded-xl"></div>
        <div className="skeleton h-48 w-full rounded-xl"></div>
        <div className="skeleton h-48 w-full rounded-xl"></div>
      </div>
    )
  }

  // So'nggi test natijasini hisoblash
  const lastTest = stats?.recentSubmissions?.length > 0 
    ? stats.recentSubmissions[stats.recentSubmissions.length - 1] 
    : null

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Salom, {user?.firstName}!</h1>
          <p className="text-gray-400 text-sm">
            Bugun {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <Flame className="text-warning-500 streak-fire" size={24} fill="currentColor" />
          <div>
            <div className="text-lg font-bold leading-none">{stats?.streak || 0}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Kun</div>
          </div>
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Kunlik Test</h2>
            <p className="text-gray-300 text-sm">
              Speaking va Writing bo'yicha bugungi yangi mavzularni yeching va baho oling.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/tests')}
            className="btn-gradient w-full flex items-center justify-center gap-2"
          >
            Testni boshlash
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Star size={16} />
            <span className="text-sm">O'rtacha Speaking</span>
          </div>
          <div className="text-2xl font-bold gradient-text">
            {stats?.avgSpeakingScore || '—'}
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <PenToolIcon />
            <span className="text-sm">O'rtacha Writing</span>
          </div>
          <div className="text-2xl font-bold gradient-text">
            {stats?.avgWritingScore || '—'}
          </div>
        </div>
      </div>

      {/* Recent Result */}
      {lastTest && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Clock size={18} />
            So'nggi natija
          </h3>
          <div 
            onClick={() => navigate(`/results/${lastTest.id}`)}
            className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-800/50 transition-colors"
          >
            <div className="w-16 h-16">
              <ScoreRing score={lastTest.bandScore} maxScore={9} />
            </div>
            <div>
              <div className="font-bold text-lg capitalize">{lastTest.type}</div>
              <div className="text-sm text-gray-400">
                {new Date(lastTest.createdAt).toLocaleDateString('uz-UZ')}
              </div>
            </div>
            <div className="ml-auto">
              <ArrowRight size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PenToolIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>
    </svg>
  )
}
