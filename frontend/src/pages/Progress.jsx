import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, Target, Mic, PenTool } from 'lucide-react'
import { getProgress } from '../services/api'

export default function Progress() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getProgress()
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Progress</h1>
        <div className="skeleton h-32 w-full rounded-xl"></div>
        <div className="skeleton h-64 w-full rounded-xl"></div>
      </div>
    )
  }

  // Chart data tayyorlash
  const chartData = stats?.recentSubmissions?.map((sub, index) => ({
    name: `Test ${index + 1}`,
    score: sub.bandScore,
    type: sub.type,
    date: new Date(sub.createdAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
  })) || []

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-card p-3 border-none bg-surface-800/90 shadow-xl">
          <p className="font-bold mb-1">{data.date}</p>
          <p className="text-sm text-gray-300 capitalize flex items-center gap-1">
            {data.type === 'speaking' ? <Mic size={14}/> : <PenTool size={14}/>}
            {data.type}
          </p>
          <p className="text-lg font-bold gradient-text mt-1">Score: {data.score}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold">Progress Statistika</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-surface-700/50 group-hover:text-warning-500/20 transition-colors">
            <Flame size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">Eng uzun streak</p>
            <div className="text-2xl font-bold flex items-end gap-1">
              {stats?.longestStreak || 0}
              <span className="text-sm font-normal text-gray-500 mb-1">kun</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-surface-700/50 group-hover:text-primary-500/20 transition-colors">
            <Target size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">Jami testlar</p>
            <div className="text-2xl font-bold flex items-end gap-1">
              {stats?.totalTests || 0}
              <span className="text-sm font-normal text-gray-500 mb-1">ta</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 border-l-4 border-l-accent-500">
          <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><Mic size={14}/> Speaking</p>
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold">{stats?.avgSpeakingScore || '—'}</span>
            <span className="text-xs text-gray-500">{stats?.totalSpeaking || 0} ta</span>
          </div>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-primary-500">
          <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><PenTool size={14}/> Writing</p>
          <div className="flex justify-between items-end">
            <span className="text-xl font-bold">{stats?.avgWritingScore || '—'}</span>
            <span className="text-xs text-gray-500">{stats?.totalWriting || 0} ta</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-4 pt-6">
        <h3 className="font-bold mb-6 flex items-center gap-2">
          <Target size={18} className="text-primary-400" />
          Ballar dinamikasi (oxirgi 30 kun)
        </h3>
        
        {chartData.length > 1 ? (
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f55" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#colorScore)" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#a855f7' }}
                  animationDuration={1500}
                />
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-center text-gray-500 text-sm px-10">
            Grafik ko'rish uchun kamida 2 ta test topshirishingiz kerak.
          </div>
        )}
      </div>
    </div>
  )
}
