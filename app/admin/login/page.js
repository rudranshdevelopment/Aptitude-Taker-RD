'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { MdLock, MdEmail, MdAssignment, MdArrowBack } from 'react-icons/md'
import Link from 'next/link'

// Helper to refresh session
const refreshSession = async () => {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })
    return await response.json()
  } catch (error) {
    console.error('Error refreshing session:', error)
    return null
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: '/admin/dashboard',
      })

      if (result?.error) {
        toast.error('Invalid credentials')
        setLoading(false)
        return
      }

      if (result?.ok || !result?.error) {
        toast.success('Login successful')
        
        // Store success message for dashboard
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('loginSuccess', 'true')
        }
        
        // In production, cookies need a moment to be set and propagated
        // Wait a bit longer in production to ensure cookie is available to middleware
        // Check if we're on HTTPS (production indicator)
        const isProduction = window.location.protocol === 'https:'
        const waitTime = isProduction ? 1500 : 500
        
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        // Verify session cookie is set by checking session endpoint
        let cookieReady = false
        let attempts = 0
        const maxAttempts = isProduction ? 40 : 20 // More attempts in production
        
        while (!cookieReady && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 150))
          
          // Check if session cookie is available
          try {
            const sessionData = await refreshSession()
            if (sessionData && sessionData.user && sessionData.user.role === 'admin') {
              cookieReady = true
              console.log('✅ Session cookie confirmed, redirecting...')
              break
            }
          } catch (error) {
            console.error('Session check error:', error)
          }
          attempts++
        }
        
        if (!cookieReady) {
          console.warn('⚠️ Cookie not confirmed, but redirecting anyway...')
        }
        
        // Use window.location.replace for a hard redirect
        // This ensures a full page reload with all cookies sent
        // The middleware will check the cookie on the server side
        window.location.replace('/admin/dashboard')
      } else {
        toast.error('Login failed. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          href="/"
          className="inline-flex items-center text-primary-100 hover:text-white mb-6 transition-colors"
        >
          <MdArrowBack className="mr-2" size={20} />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
              <MdAssignment className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Sign in to manage your aptitude tests</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MdEmail className="mr-2 text-gray-500" size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
                className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MdLock className="mr-2 text-gray-500" size={16} />
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-lg rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <MdLock className="mr-2" size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-primary-100 text-sm">
          <p>© 2025 Aptitude Taker RD. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
