import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, PenTool, ChevronRight } from 'lucide-react'
import { getHistory } from '../services/api'
import ScoreRing from '../components/ScoreRing'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory(1) // Birinchi sahifani yuklash
        setHistory(data.submissions || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-6">Tarix</h1>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-24 w-full rounded-xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6 animate-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold">Barcha testlar tarixi</h1>

      {history.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Hali hech qanday test topshirmagansiz.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(`/results/${item.id}`)}
              className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-800/50 transition-colors"
            >
              <div className="w-14 h-14 shrink-0">
                <ScoreRing score={item.bandScore} maxScore={9.0} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.type === 'speaking' ? (
                    <Mic size={14} className="text-accent-400" />
                  ) : (
                    <PenTool size={14} className="text-primary-400" />
                  )}
                  <span className="font-bold text-sm capitalize truncate">
                    {item.type} {item.topic?.subtype?.replace('part', 'Part ').replace('task', 'Task ')}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 truncate">
                  {item.topic?.topicText || (item.type === 'speaking' ? 'Erkin speaking' : 'Erkin writing')}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {new Date(item.createdAt).toLocaleString('uz-UZ')}
                </p>
              </div>
              
              <ChevronRight size={18} className="text-gray-500 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
