'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatDuration } from '@/lib/utils'
import { 
  MdCheckCircle, 
  MdAccessTime, 
  MdQuestionAnswer, 
  MdVideoCall,
  MdWarning,
  MdArrowForward,
  MdInfo
} from 'react-icons/md'

export default function InviteLandingPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifiedEmail, setVerifiedEmail] = useState('')

  useEffect(() => {
    // Check if email is verified
    const isVerified = sessionStorage.getItem(`verified_${params.token}`)
    const email = sessionStorage.getItem(`verified_email_${params.token}`)
    
    if (!isVerified) {
      // Redirect to verification page
      router.push(`/test/verify/${params.token}`)
      return
    }
    
    setVerifiedEmail(email || '')
    fetchAssignment()
  }, [params.token, router])

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignment/${params.token}`)
      if (res.ok) {
        const data = await res.json()
        setAssignment(data)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Invalid invite link')
        router.push('/')
      }
    } catch (error) {
      toast.error('Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = () => {
    router.push(`/test/consent/${params.token}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!assignment) {
    return null
  }

  const test = assignment.test
  const duration = formatDuration(test.durationSeconds)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
            <MdQuestionAnswer className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {test.title}
          </h1>
          {test.description && (
            <p className="text-gray-600 text-lg">{test.description}</p>
          )}
        </div>

        <div className="space-y-6 mb-8">
          {verifiedEmail && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4">
              <div className="flex items-center">
                <MdCheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Email Verified</p>
                  <p className="text-sm text-green-700">{verifiedEmail}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
              <MdInfo className="mr-2 text-primary-600" size={22} />
              Test Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <MdAccessTime className="mr-3 text-primary-600" size={20} />
                <span className="font-medium">Duration:</span>
                <span className="ml-2">{duration}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <MdQuestionAnswer className="mr-3 text-green-600" size={20} />
                <span className="font-medium">Questions:</span>
                <span className="ml-2">{test.questions.length}</span>
              </div>
              {assignment.expiresAt && (
                <div className="flex items-center text-gray-700">
                  <MdWarning className="mr-3 text-orange-600" size={20} />
                  <span className="font-medium">Expires:</span>
                  <span className="ml-2">{new Date(assignment.expiresAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {test.cameraRequired && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-start">
                <MdVideoCall className="text-yellow-700 mr-3 flex-shrink-0 mt-0.5" size={22} />
                <div>
                  <p className="font-semibold text-yellow-900 mb-1">Camera Required</p>
                  <p className="text-sm text-yellow-800">
                    This test requires camera access. Please ensure your camera is working before starting.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center">
              <MdWarning className="mr-2" size={20} />
              Rules & Guidelines
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <MdCheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-blue-600" size={16} />
                Use a desktop computer (Chrome recommended)
              </li>
              {test.cameraRequired && (
                <li className="flex items-start">
                  <MdCheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-blue-600" size={16} />
                  Camera recording may be required
                </li>
              )}
              {test.blockTabSwitch && (
                <li className="flex items-start">
                  <MdCheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-blue-600" size={16} />
                  Tab switching is monitored and may result in warnings
                </li>
              )}
              {test.requireFullscreen && (
                <li className="flex items-start">
                  <MdCheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-blue-600" size={16} />
                  Fullscreen mode is required
                </li>
              )}
              <li className="flex items-start">
                <MdCheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-blue-600" size={16} />
                Your session will be monitored and logged
              </li>
              <li className="flex items-start">
                <MdCheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-blue-600" size={16} />
                Do not use external assistance
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl text-lg font-bold transform hover:scale-[1.02]"
        >
          Start Test
          <MdArrowForward className="ml-2" size={24} />
        </button>
      </div>
    </div>
  )
}

