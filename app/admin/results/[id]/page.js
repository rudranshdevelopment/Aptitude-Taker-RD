'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { 
  MdCheckCircle, 
  MdCancel, 
  MdPerson, 
  MdEmail,
  MdAccessTime,
  MdFlag,
  MdQuestionAnswer,
  MdTimeline,
  MdVideoLibrary,
  MdDelete,
  MdArrowBack
} from 'react-icons/md'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AttemptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAttempt()
  }, [params.id])

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/admin/attempts/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setAttempt(data)
      } else {
        toast.error('Failed to fetch attempt details')
      }
    } catch (error) {
      console.error('Error fetching attempt:', error)
      toast.error('Failed to fetch attempt details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this attempt? This action cannot be undone and will delete all associated answers, events, and recordings.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/attempts/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Attempt deleted successfully')
        router.push('/admin/results')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to delete attempt')
      }
    } catch (error) {
      console.error('Error deleting attempt:', error)
      toast.error('Failed to delete attempt')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading attempt details...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!attempt) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-gray-500">Attempt not found</p>
        </div>
      </AdminLayout>
    )
  }

  const test = attempt.assignment.test
  const answeredQuestions = attempt.answers.length
  const totalQuestions = test.questions.length

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <MdQuestionAnswer className="mr-3 text-primary-600" size={32} />
                Attempt Details: {test.title}
              </h1>
              {attempt.flagged && (
                <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg mt-2">
                  <MdFlag className="mr-2" size={18} />
                  <span className="font-semibold">Flagged for Review</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/results"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <MdArrowBack className="mr-2" size={20} />
                Back
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <MdDelete className="mr-2" size={20} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            {attempt.score !== null && attempt.score !== undefined && (
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 text-sm font-medium mb-2">Final Score</p>
                    <p className="text-6xl font-bold">{attempt.score.toFixed(1)}%</p>
                  </div>
                  <MdCheckCircle className="text-white/30" size={80} />
                </div>
                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-primary-100">Questions Answered</p>
                    <p className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-primary-100">Status</p>
                    <p className="text-2xl font-bold capitalize">{attempt.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Candidate Info */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MdPerson className="mr-2 text-primary-600" size={24} />
                Candidate Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900 font-semibold mt-1">
                    {attempt.user?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <MdEmail className="mr-1" size={14} />
                    Email
                  </p>
                  <p className="text-gray-900 font-semibold mt-1">
                    {attempt.user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <MdAccessTime className="mr-1" size={14} />
                    Started At
                  </p>
                  <p className="text-gray-900 mt-1">
                    {new Date(attempt.startedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <MdAccessTime className="mr-1" size={14} />
                    Finished At
                  </p>
                  <p className="text-gray-900 mt-1">
                    {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MdQuestionAnswer className="mr-2 text-primary-600" size={24} />
                Answers ({answeredQuestions}/{totalQuestions})
              </h2>
              <div className="space-y-4">
                {test.questions.map((question, idx) => {
                  const answer = attempt.answers.find(a => a.questionId === question.id)
                  const correctAnswer = question.correctAnswer?.value
                  const userAnswer = answer 
                    ? (Array.isArray(answer.answerData) ? answer.answerData[0] : answer.answerData)
                    : null
                  
                  const isCorrect = correctAnswer && userAnswer 
                    ? String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
                    : null

                  return (
                    <div 
                      key={question.id} 
                      className={`border-2 rounded-xl p-5 transition-all ${
                        isCorrect === true 
                          ? 'border-green-300 bg-green-50' 
                          : isCorrect === false 
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="bg-primary-100 text-primary-700 font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {question.promptText}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {question.type} • {question.marks} marks
                            </span>
                          </div>
                        </div>
                        {isCorrect !== null && (
                          <div className="flex-shrink-0">
                            {isCorrect ? (
                              <MdCheckCircle className="text-green-600" size={28} />
                            ) : (
                              <MdCancel className="text-red-600" size={28} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {answer ? (
                        <div className="mt-4 space-y-2">
                          <div className={`rounded-lg p-3 ${isCorrect === true ? 'bg-green-100' : isCorrect === false ? 'bg-red-100' : 'bg-gray-100'}`}>
                            <p className="text-xs font-medium text-gray-600 mb-1">Candidate's Answer:</p>
                            <p className="text-gray-900 font-semibold">
                              {typeof answer.answerData === 'object' && !Array.isArray(answer.answerData)
                                ? JSON.stringify(answer.answerData)
                                : Array.isArray(answer.answerData)
                                ? answer.answerData.join(', ')
                                : answer.answerData || 'No answer'}
                            </p>
                          </div>
                          {correctAnswer && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-blue-600 mb-1">Correct Answer:</p>
                              <p className="text-blue-900 font-semibold">{correctAnswer}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic mt-2">No answer provided</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    attempt.status === 'submitted' ? 'bg-green-100 text-green-800' :
                    attempt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {attempt.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className="text-xl font-bold text-primary-600">
                    {attempt.score !== null && attempt.score !== undefined ? `${attempt.score.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Answered</span>
                  <span className="font-semibold">{answeredQuestions}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events</span>
                  <span className="font-semibold">{attempt.events?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Events Timeline */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MdTimeline className="mr-2 text-primary-600" size={22} />
                Events Timeline
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attempt.events.length === 0 ? (
                  <p className="text-sm text-gray-500">No events recorded</p>
                ) : (
                  attempt.events.map((event) => (
                    <div key={event.id} className="border-l-4 border-primary-500 pl-4 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {event.eventType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {Object.keys(event.eventData).length > 0 && (
                        <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          {JSON.stringify(event.eventData, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recordings */}
            {attempt.recordings && attempt.recordings.length > 0 && (
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MdVideoLibrary className="mr-2 text-primary-600" size={22} />
                  Recordings
                </h2>
                <div className="space-y-2">
                  {attempt.recordings.map((recording, idx) => (
                    <div key={recording.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">Recording {idx + 1}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(recording.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
