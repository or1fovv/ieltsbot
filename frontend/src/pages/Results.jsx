import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { getSubmission } from '../services/api'
import ScoreRing from '../components/ScoreRing'

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getSubmission(id)
        setSubmission(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Natijalar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!submission || !submission.feedbackJson) {
    return (
      <div className="text-center py-10">
        <p className="text-danger-400 mb-4">Natija topilmadi.</p>
        <button onClick={() => navigate('/')} className="btn-secondary">Asosiyga qaytish</button>
      </div>
    )
  }

  const feedback = submission.feedbackJson
  const isSpeaking = submission.type === 'speaking'

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 -ml-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Natija va Tahlil</h1>
      </div>

      {/* Main Score Card */}
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <ScoreRing score={submission.bandScore} maxScore={9.0} cefr={submission.cefrLevel} />
        </div>
        <h2 className="text-xl font-bold capitalize mb-1">
          {submission.type} {submission.subtype?.replace('part', 'Part ').replace('task', 'Task ')}
        </h2>
        <p className="text-gray-400 text-sm">
          {new Date(submission.createdAt).toLocaleString('uz-UZ')}
        </p>
      </div>

      {/* Audio / Transcript section for Speaking */}
      {isSpeaking && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">Sizning javobingiz</h3>
          <div className="glass-card p-4">
            <audio src={submission.audioUrl} controls className="w-full mb-3" />
            <div className="bg-surface-800 p-3 rounded-lg text-sm text-gray-300">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Transkriptsiya:</span>
              {submission.transcript}
            </div>
          </div>
        </div>
      )}

      {/* Criteria Breakdown */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg px-1">Mezonlar bo'yicha tahlil</h3>
        {Object.entries(feedback.criteria).map(([key, value]) => {
          // Format key for display
          const displayName = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          
          let Icon = AlertTriangle
          let colorClass = 'text-warning-400'
          if (value.score >= 7.0) {
            Icon = CheckCircle2
            colorClass = 'text-success-400'
          } else if (value.score < 5.5) {
            Icon = XCircle
            colorClass = 'text-danger-400'
          }

          return (
            <div key={key} className="glass-card p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={18} className={colorClass} />
                  <span className="font-bold">{displayName}</span>
                </div>
                <span className={`font-bold ${colorClass}`}>{value.score}</span>
              </div>
              <p className="text-sm text-gray-300 pl-6">{value.comment}</p>
            </div>
          )
        })}
      </div>

      {/* Errors & Corrections */}
      {feedback.errors && feedback.errors.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg px-1 mt-6 text-danger-400">Xatolar va tuzatishlar</h3>
          {feedback.errors.map((error, idx) => (
            <div key={idx} className="glass-card p-4 border-l-4 border-l-danger-500 bg-gradient-to-r from-danger-500/10 to-transparent">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 mb-2 text-sm">
                <span className="text-gray-400">Xato:</span>
                <span className="text-danger-300 line-through">{error.original}</span>
                <span className="text-gray-400">To'g'risi:</span>
                <span className="text-success-400 font-medium">{error.correction}</span>
              </div>
              <p className="text-xs text-gray-300 mt-2 bg-surface-800 p-2 rounded">
                💡 {error.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Improved Version */}
      {feedback.improved_version && (
        <div className="space-y-3 mt-6">
          <h3 className="font-bold text-lg px-1 text-primary-400">Yaxshilangan namuna</h3>
          <div className="glass-card p-4 border border-primary-500/30">
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{feedback.improved_version}</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {feedback.recommendations && feedback.recommendations.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="font-bold text-lg px-1 text-accent-400 flex items-center gap-2">
            <Lightbulb size={20} />
            Keyingi safar uchun tavsiyalar
          </h3>
          <div className="glass-card p-5">
            <ul className="space-y-3 text-sm text-gray-300 list-disc pl-4">
              {feedback.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
