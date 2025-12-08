'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatTimeRemaining } from '@/lib/utils'
import { 
  MdAccessTime, 
  MdNavigateBefore, 
  MdNavigateNext, 
  MdCheckCircle
} from 'react-icons/md'

export default function ExamRoom() {
  const params = useParams()
  const router = useRouter()
  const [attempt, setAttempt] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [warning, setWarning] = useState(null)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const recordingIntervalRef = useRef(null)

  useEffect(() => {
    fetchAttempt()
    return () => {
      cleanup()
    }
  }, [params.attemptId])

  useEffect(() => {
    if (attempt && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(intervalRef.current)
    }
  }, [attempt, timeRemaining])

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/attempts/${params.attemptId}`)
      if (res.ok) {
        const data = await res.json()
        setAttempt(data)
        const test = data.assignment.test
        const startedAt = new Date(data.startedAt)
        const duration = test.durationSeconds
        const endTime = startedAt.getTime() + duration * 1000
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        setTimeRemaining(remaining)

        // Initialize proctoring
        if (test.cameraRequired || test.recordVideo) {
          startCamera()
        }
        if (test.requireFullscreen) {
          requestFullscreen()
        }
        setupProctoring(test)
      } else {
        toast.error('Failed to load test')
        router.push('/')
      }
    } catch (error) {
      toast.error('Failed to load test')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Start recording frames if enabled
      if (attempt?.assignment?.test?.recordVideo) {
        recordingIntervalRef.current = setInterval(() => {
          captureFrameAndUpload()
        }, 5000) // Capture every 5 seconds
      }
    } catch (error) {
      console.error('Camera error:', error)
      logEvent('camera_off', { error: error.message })
    }
  }

  const captureFrameAndUpload = () => {
    if (!videoRef.current || !streamRef.current) return

    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)

      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData()
          formData.append('frame', blob, `${params.attemptId}_${Date.now()}.jpg`)
          try {
            await fetch(`/api/attempts/${params.attemptId}/recording`, {
              method: 'POST',
              body: formData,
            })
          } catch (error) {
            console.error('Failed to upload frame:', error)
          }
        }
      }, 'image/jpeg', 0.8)
    } catch (error) {
      console.error('Frame capture error:', error)
    }
  }

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.warn('Fullscreen failed:', error)
    }
  }

  const setupProctoring = (test) => {
    // Tab switch detection
    if (test.blockTabSwitch) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Fullscreen exit detection
    if (test.requireFullscreen) {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    }

    // Right-click prevention
    if (test.disableCopyPaste) {
      document.addEventListener('contextmenu', preventRightClick)
      document.addEventListener('copy', preventCopyPaste)
      document.addEventListener('paste', preventCopyPaste)
      document.addEventListener('cut', preventCopyPaste)
      document.body.classList.add('exam-mode')
    }

    // Keyboard shortcuts blocking
    window.addEventListener('keydown', handleKeyDown)
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') {
      const newCount = tabSwitchCount + 1
      setTabSwitchCount(newCount)
      logEvent('tab_switch', { count: newCount })
      showWarning(`Warning: Tab switch detected (${newCount})`)
      
      if (attempt?.assignment?.test?.autoFlagThreshold && newCount >= attempt.assignment.test.autoFlagThreshold) {
        setWarning('Your session has been flagged due to multiple tab switches.')
      }
    } else {
      logEvent('tab_return', {})
    }
  }

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      logEvent('fullscreen_exit', {})
      showWarning('Please return to fullscreen mode')
      requestFullscreen()
    }
  }

  const preventRightClick = (e) => {
    e.preventDefault()
    logEvent('blocked_shortcut', { action: 'right_click' })
    return false
  }

  const preventCopyPaste = (e) => {
    e.preventDefault()
    logEvent('blocked_shortcut', { action: e.type })
    showWarning('Copy/paste is disabled during the test')
    return false
  }

  const handleKeyDown = (e) => {
    // Block common shortcuts
    if (
      (e.ctrlKey && e.key === 't') || // New tab
      (e.ctrlKey && e.key === 'w') || // Close tab
      (e.ctrlKey && e.key === 'n') || // New window
      (e.key === 'F12') || // DevTools
      (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
      (e.ctrlKey && e.shiftKey && e.key === 'J') || // DevTools
      (e.ctrlKey && e.shiftKey && e.key === 'C') || // DevTools
      (e.ctrlKey && e.key === 'u') // View source
    ) {
      e.preventDefault()
      logEvent('blocked_shortcut', { key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey })
      showWarning('This shortcut is disabled during the test')
    }
  }

  const logEvent = async (eventType, eventData) => {
    try {
      await fetch(`/api/attempts/${params.attemptId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, eventData }),
      })
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  const showWarning = (message) => {
    setWarning(message)
    setTimeout(() => setWarning(null), 5000)
  }

  const handleAnswerChange = (questionId, answer) => {
    console.log('Answer changed:', { questionId, answer, type: typeof answer })
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)
    
    // Autosave answer
    saveAnswer(questionId, answer)
  }

  const saveAnswer = async (questionId, answerData) => {
    try {
      const response = await fetch(`/api/attempts/${params.attemptId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answerData,
          timeTakenMs: 0,
        }),
      })
      
      if (!response.ok) {
        console.error('Failed to save answer:', await response.text())
      }
    } catch (error) {
      console.error('Failed to save answer:', error)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/attempts/${params.attemptId}/submit`, {
        method: 'POST',
      })

      if (res.ok) {
        toast.success('Test submitted successfully')
        router.push(`/test/finish/${params.attemptId}`)
      } else {
        toast.error('Failed to submit test')
      }
    } catch (error) {
      toast.error('Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    toast.info('Time is up! Submitting your test...')
    
    try {
      const res = await fetch(`/api/attempts/${params.attemptId}/submit`, {
        method: 'POST',
      })

      if (res.ok) {
        router.push(`/test/finish/${params.attemptId}`)
      }
    } catch (error) {
      toast.error('Failed to auto-submit')
    }
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('contextmenu', preventRightClick)
    document.removeEventListener('copy', preventCopyPaste)
    document.removeEventListener('paste', preventCopyPaste)
    document.removeEventListener('cut', preventCopyPaste)
    window.removeEventListener('keydown', handleKeyDown)
    document.body.classList.remove('exam-mode')
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading test...</div>
      </div>
    )
  }

  const test = attempt.assignment.test
  const questions = test.questions
  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-100 exam-mode">
      {warning && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 text-center z-50">
          {warning}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white flex items-center">
                <MdCheckCircle className="mr-2 text-primary-400" size={24} />
                {test.title}
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center text-xs text-gray-300 mb-1">
                  <MdAccessTime className="mr-1" size={14} />
                  Time Remaining
                </div>
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
              {test.cameraRequired && (
                <div className="w-32 h-20 bg-gray-900 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 text-primary-700 font-bold text-lg w-10 h-10 rounded-xl flex items-center justify-center">
                  {currentQuestionIndex + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
              </div>
            </div>
            
            <p className="text-lg text-gray-800 leading-relaxed">
              {currentQuestion.promptText}
            </p>
          </div>

          {currentQuestion.imageUrl && (
            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <img
                src={currentQuestion.imageUrl}
                alt="Question image"
                className="max-w-full h-auto max-h-96 rounded-lg mx-auto shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {currentQuestion.type === 'mcq' || currentQuestion.type === 'single' ? (
            <div className="space-y-3">
              {currentQuestion.choices?.options?.map((option, idx) => {
                // Fix: Check selection properly for both MCQ and single choice
                const isSelected = currentQuestion.type === 'mcq'
                  ? (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option))
                  : (answers[currentQuestion.id] === option)
                
                return (
                  <label
                    key={idx}
                    className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type={currentQuestion.type === 'mcq' ? 'checkbox' : 'radio'}
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={(e) => {
                        if (currentQuestion.type === 'mcq') {
                          const current = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : []
                          const newAnswer = e.target.checked
                            ? [...current, option]
                            : current.filter(a => a !== option)
                          handleAnswerChange(currentQuestion.id, newAnswer)
                        } else {
                          handleAnswerChange(currentQuestion.id, option)
                        }
                      }}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className={`ml-4 text-base cursor-pointer ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </label>
                )
              })}
            </div>
          ) : currentQuestion.type === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Answer:
              </label>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={6}
                className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-base"
                placeholder="Type your answer here..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Answer:
              </label>
              <input
                type="number"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg"
                placeholder="Enter a number..."
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              <MdNavigateBefore size={20} />
              Previous
            </button>

            {/* Question Grid */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {questions.map((q, idx) => {
                const isAnswered = answers[q?.id] !== undefined && answers[q?.id] !== null && answers[q?.id] !== ''
                const isCurrent = idx === currentQuestionIndex
                
                return (
                  <button
                    key={q?.id || idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    disabled={!q}
                    className={`w-11 h-11 rounded-lg font-semibold transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg scale-110'
                        : isAnswered
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border-2 border-transparent rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Next
                <MdNavigateNext size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || questions.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border-2 border-transparent rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold text-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <MdCheckCircle className="mr-2" size={22} />
                    Submit Test
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

