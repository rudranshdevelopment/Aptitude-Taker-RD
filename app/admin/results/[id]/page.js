'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'

export default function AttemptDetailPage() {
  const params = useParams()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)

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
      toast.error('Failed to fetch attempt details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    )
  }

  if (!attempt) {
    return null
  }

  const test = attempt.assignment.test

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Attempt Details: {test.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attempt Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Attempt Information</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-gray-900">{attempt.status}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Score</dt>
                  <dd className="mt-1 text-gray-900">
                    {attempt.score !== null && attempt.score !== undefined ? `${attempt.score.toFixed(2)}%` : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Started At</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(attempt.startedAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Finished At</dt>
                  <dd className="mt-1 text-gray-900">
                    {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : 'N/A'}
                  </dd>
                </div>
                {attempt.user && (
                  <>
                    <div>
                      <dt className="font-medium text-gray-500">Candidate</dt>
                      <dd className="mt-1 text-gray-900">{attempt.user.name || attempt.user.email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-gray-900">{attempt.user.email}</dd>
                    </div>
                  </>
                )}
                {attempt.flagged && (
                  <div className="col-span-2">
                    <dt className="font-medium text-red-600">Flagged</dt>
                    <dd className="mt-1 text-red-600">This attempt has been flagged for review</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Answers */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Answers</h2>
              <div className="space-y-4">
                {test.questions.map((question, idx) => {
                  const answer = attempt.answers.find(a => a.questionId === question.id)
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          Q{idx + 1}: {question.promptText}
                        </h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{question.marks} marks</span>
                      </div>
                      {answer ? (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Answer:</p>
                          <p className="text-gray-900 mt-1">
                            {typeof answer.answerData === 'object' 
                              ? JSON.stringify(answer.answerData)
                              : answer.answerData}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No answer provided</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Events Timeline */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Events Timeline</h2>
              <div className="space-y-3">
                {attempt.events.length === 0 ? (
                  <p className="text-sm text-gray-500">No events recorded</p>
                ) : (
                  attempt.events.map((event) => (
                    <div key={event.id} className="border-l-2 border-primary-500 pl-4 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{event.eventType}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {Object.keys(event.eventData).length > 0 && (
                        <pre className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(event.eventData, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recordings */}
            {attempt.recordings.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recordings</h2>
                <div className="space-y-2">
                  {attempt.recordings.map((recording) => (
                    <div key={recording.id} className="text-sm">
                      <p className="text-gray-900">Recording {recording.id}</p>
                      <p className="text-gray-500 text-xs">
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

