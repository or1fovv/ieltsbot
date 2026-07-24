import { useState, useRef } from 'react'
import { Mic, Square, Send } from 'lucide-react'

export default function AudioRecorder({ onSubmit, isSubmitting, submitStatus }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        chunksRef.current = []
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert("Mikrofonga ruxsat berilmadi yoki xato yuz berdi.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      {audioUrl ? (
        <div className="w-full space-y-4">
          <audio src={audioUrl} controls className="w-full" />
          <div className="flex gap-2">
            <button 
              onClick={resetRecording}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              O'chirish
            </button>
            <button 
              onClick={() => onSubmit(audioBlob)}
              className="flex-1 btn-gradient flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {submitStatus || 'Yuborilmoqda...'}
                </>
              ) : (
                <>
                  <Send size={18} />
                  Yuborish
                </>
              )}
            </button>
          </div>
          {isSubmitting && (
            <p className="text-center text-xs text-primary-300 animate-pulse mt-2">
              ⏳ Iltimos kuting — Groq AI ovozingizni tahlil qilmoqda...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-3xl font-mono font-medium text-gray-300">
            {formatTime(recordingTime)}
          </div>
          
          {isRecording ? (
            <button 
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-danger-500/20 text-danger-500 flex items-center justify-center border-2 border-danger-500 pulse-dot"
            >
              <Square size={32} fill="currentColor" />
            </button>
          ) : (
            <button 
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-primary-500 text-white flex items-center justify-center hover:scale-105 transition-transform glow"
            >
              <Mic size={32} />
            </button>
          )}
          
          <p className="text-gray-400 text-sm">
            {isRecording ? "Yozilmoqda... To'xtatish uchun bosing" : "Ovoz yozishni boshlash"}
          </p>
        </div>
      )}
    </div>
  )
}
