'use client'

import { useSession } from 'next-auth/react'
import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  MdDescription, 
  MdCheckCircle, 
  MdWarning, 
  MdAdd, 
  MdVisibility,
  MdTrendingUp,
  MdPeople
} from 'react-icons/md'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    tests: 0,
    attempts: 0,
    flagged: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch stats function - must be defined before useEffect
  const fetchStats = async () => {
    try {
      const [testsRes, attemptsRes] = await Promise.all([
        fetch('/api/admin/tests'),
        fetch('/api/admin/attempts/stats'),
      ])

      if (!testsRes.ok) {
        throw new Error(`Tests API error: ${testsRes.status}`)
      }
      if (!attemptsRes.ok) {
        throw new Error(`Stats API error: ${attemptsRes.status}`)
      }

      const tests = await testsRes.json()
      const attempts = await attemptsRes.json()

      setStats({
        tests: Array.isArray(tests) ? tests.length : 0,
        attempts: attempts?.total || 0,
        flagged: attempts?.flagged || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        tests: 0,
        attempts: 0,
        flagged: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Show success message if redirected from login - MUST be before conditional return
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginSuccess = sessionStorage.getItem('loginSuccess')
      if (loginSuccess === 'true') {
        toast.success('Login successful!')
        sessionStorage.removeItem('loginSuccess')
      }
    }
  }, [])

  // Fetch stats - MUST be before conditional return to fix hooks violation
  useEffect(() => {
    // Only fetch if session is ready
    if (status !== 'loading' && session) {
      fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session])

  // Wait for session to be ready before rendering
  if (status === 'loading' || !session) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className={`${bgColor} overflow-hidden shadow-lg rounded-xl border-2 ${color} transform hover:scale-105 transition-transform duration-200`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <div className={`${color.replace('border', 'bg')} rounded-xl p-4`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1 text-right">
            <dl>
              <dt className="text-sm font-medium text-gray-600 truncate">{label}</dt>
              <dd className={`text-4xl font-bold ${color.replace('border', 'text')}`}>{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Header */}
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold flex items-center">
            <MdTrendingUp className="mr-4" size={48} />
            Welcome Back!
          </h1>
          <p className="mt-3 text-primary-100 text-lg">
            {session?.user?.name || session?.user?.email}
          </p>
          <p className="mt-2 text-primary-200 text-sm">
            Here's what's happening with your aptitude tests today
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
              <StatCard
                icon={MdDescription}
                label="Total Tests"
                value={stats.tests}
                color="border-blue-500"
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard
                icon={MdCheckCircle}
                label="Total Attempts"
                value={stats.attempts}
                color="border-green-500"
                bgColor="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                icon={MdWarning}
                label="Flagged Attempts"
                value={stats.flagged}
                color="border-red-500"
                bgColor="bg-gradient-to-br from-red-50 to-red-100"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <MdAdd className="mr-2 text-primary-600" size={24} />
                  Quick Actions
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Get started with these common tasks
                </p>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/admin/tests/new"
                    className="group flex flex-col items-center p-6 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="bg-primary-100 p-4 rounded-xl group-hover:bg-primary-200 transition-colors mb-3">
                      <MdAdd className="h-8 w-8 text-primary-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-700">
                      Create New Test
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      Design a new aptitude test
                    </span>
                  </Link>
                  
                  <Link
                    href="/admin/tests"
                    className="group flex flex-col items-center p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-200 transition-colors mb-3">
                      <MdDescription className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                      View All Tests
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      Manage your test library
                    </span>
                  </Link>
                  
                  <Link
                    href="/admin/results"
                    className="group flex flex-col items-center p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="bg-green-100 p-4 rounded-xl group-hover:bg-green-200 transition-colors mb-3">
                      <MdVisibility className="h-8 w-8 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700">
                      View Results
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      Review test submissions
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="mt-8 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <MdPeople className="mr-2 text-primary-600" size={24} />
                  Platform Overview
                </h3>
              </div>
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-900 mb-2">
                      Test Management
                    </h4>
                    <p className="text-sm text-purple-700">
                      Create, edit, and manage comprehensive aptitude tests with multiple question types, 
                      time limits, and proctoring features.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200">
                    <h4 className="text-lg font-semibold text-indigo-900 mb-2">
                      Proctoring & Security
                    </h4>
                    <p className="text-sm text-indigo-700">
                      Advanced proctoring with camera monitoring, tab-switch detection, 
                      fullscreen enforcement, and event logging for secure assessments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
