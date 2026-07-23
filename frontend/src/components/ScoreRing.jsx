import { useEffect, useState } from 'react'

export default function ScoreRing({ score, maxScore = 9, cefr }) {
  const [progress, setProgress] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  
  useEffect(() => {
    // Animate progress on mount
    const targetProgress = (score / maxScore) * 100
    const timeout = setTimeout(() => {
      setProgress(targetProgress)
    }, 100)
    return () => clearTimeout(timeout)
  }, [score, maxScore])

  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Rangni ballga qarab tanlash
  const getColor = () => {
    if (score >= 7.0 || cefr === 'C1' || cefr === 'C2') return 'var(--color-success-400)'
    if (score >= 5.5 || cefr === 'B1' || cefr === 'B2') return 'var(--color-warning-400)'
    return 'var(--color-danger-400)'
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="score-ring" viewBox="0 0 120 120">
        <circle
          className="score-ring-bg"
          cx="60"
          cy="60"
          r={radius}
        />
        <circle
          className="score-ring-progress"
          cx="60"
          cy="60"
          r={radius}
          stroke={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        {cefr && <span className="text-xs text-gray-400 font-medium">{cefr}</span>}
      </div>
    </div>
  )
}
