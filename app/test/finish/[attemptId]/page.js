'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MdCheckCircle, MdClose } from 'react-icons/md'

export default function FinishPage() {
  const params = useParams()
  const router = useRouter()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttempt()
  }, [params.attemptId])

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/admin/attempts/${params.attemptId}`)
      if (res.ok) {
        const data = await res.json()
        setAttempt(data)
      } else {
        toast.error('Failed to load attempt details')
      }
    } catch (error) {
      toast.error('Failed to load attempt details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!attempt) {
    return null
  }

  const test = attempt.assignment.test
  const answeredCount = attempt.answers.length
  const totalQuestions = test.questions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        <div className="text-center mb-10">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-6 shadow-lg">
            <MdCheckCircle className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Test Submitted Successfully!</h1>
          <p className="text-lg text-gray-600">Thank you for completing the assessment</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Submission Summary</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium">Test Name:</span>
                <span className="text-gray-900 font-semibold">{test.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium">Questions Answered:</span>
                <span className="text-gray-900 font-semibold">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  <MdCheckCircle className="mr-1" size={14} />
                  {attempt.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Submitted At:</span>
                <span className="text-gray-900">{new Date(attempt.finishedAt || attempt.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {attempt.flagged && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-yellow-900 mb-1">Under Review</h4>
                  <p className="text-sm text-yellow-800">
                    Your test session has been flagged for administrative review due to detected irregularities.
                    The administrator will review your session and contact you if needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start">
              <MdCheckCircle className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Your responses have been securely saved</li>
                  <li>✓ The administrator will review your submission</li>
                  <li>✓ Results will be shared with you via email</li>
                  <li>✓ You may close this window now</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.close()}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all shadow-md hover:shadow-lg"
          >
            <MdClose className="mr-2" size={20} />
            Close Window
          </button>
          <p className="text-xs text-gray-500 mt-4">
            If the window doesn't close, you can safely close this tab
          </p>
        </div>
      </div>
    </div>
  )
}

