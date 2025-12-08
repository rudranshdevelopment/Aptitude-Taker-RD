'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MdEmail, MdVerifiedUser, MdSecurity } from 'react-icons/md'

export default function VerifyEmailPage() {
  const params = useParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/assignment/${params.token}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok && data.verified) {
        toast.success('Email verified successfully')
        // Store verification in sessionStorage
        sessionStorage.setItem(`verified_${params.token}`, 'true')
        sessionStorage.setItem(`verified_email_${params.token}`, email)
        // Redirect to invite page
        router.push(`/test/invite/${params.token}`)
      } else {
        setError(data.error || 'Verification failed')
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Failed to verify email. Please try again.')
      toast.error('Failed to verify email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 mb-4 shadow-lg">
            <MdVerifiedUser className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verification</h1>
          <p className="text-gray-600">
            Please verify your identity to access the test
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MdEmail className="mr-2 text-gray-500" size={16} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="your.email@example.com"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start">
              <MdSecurity className="text-red-600 mr-3 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 px-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Verifying...
              </>
            ) : (
              <>
                <MdVerifiedUser className="mr-2" size={20} />
                Verify Email
              </>
            )}
          </button>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <MdSecurity className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-800">
              This verification ensures that only the assigned candidate can access the test. 
              Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

