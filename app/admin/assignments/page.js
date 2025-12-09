'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDuration } from '@/lib/utils'
import { 
  MdRefresh, 
  MdContentCopy, 
  MdEmail, 
  MdVisibility, 
  MdFilterList,
  MdCheckCircle,
  MdPending,
  MdWarning,
  MdDelete
} from 'react-icons/md'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTest, setSelectedTest] = useState('all')
  const [tests, setTests] = useState([])

  useEffect(() => {
    fetchTests()
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [selectedTest, filter])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests')
      if (res.ok) {
        const data = await res.json()
        setTests(data || [])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const url = selectedTest !== 'all' 
        ? `/api/admin/assignments?testId=${selectedTest}`
        : '/api/admin/assignments'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        let filtered = data || []
        
        if (filter !== 'all') {
          filtered = data.filter(a => {
            if (filter === 'pending') return a.status === 'pending'
            if (filter === 'in_progress') return a.status === 'in_progress'
            if (filter === 'submitted') return a.status === 'submitted'
            if (filter === 'flagged') return a.latestAttempt?.flagged
            if (filter === 'expired') return a.status === 'expired'
            return true
          })
        }
        
        setAssignments(filtered)
      } else {
        toast.error('Failed to fetch assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to fetch assignments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status, flagged) => {
    const badges = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: MdPending },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: MdPending },
      submitted: { bg: 'bg-green-100', text: 'text-green-800', icon: MdCheckCircle },
      auto_submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdCheckCircle },
      expired: { bg: 'bg-red-100', text: 'text-red-800', icon: MdWarning },
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="mr-1" size={14} />
        {status === 'in_progress' ? 'In Progress' : 
         status === 'auto_submitted' ? 'Auto Submitted' :
         status.charAt(0).toUpperCase() + status.slice(1)}
        {flagged && <MdWarning className="ml-1 text-red-600" size={14} />}
      </span>
    )
  }

  const getInviteLink = (token) => {
    // Always use window.location.origin which automatically uses the correct domain
    // This works in both development (localhost) and production (your domain)
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/test/verify/${token}`
    }
    return `/test/verify/${token}` // Relative URL fallback
  }

  const generateEmail = (assignment) => {
    const candidateName = assignment.user?.name || 'Candidate'
    const candidateEmail = assignment.user?.email || '[Candidate Email]'
    const testTitle = assignment.test.title
    const duration = formatDuration(assignment.test.durationSeconds)
    const inviteLink = getInviteLink(assignment.inviteToken)
    const expiryDate = assignment.expiresAt 
      ? new Date(assignment.expiresAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
      : 'No expiry date'

    return `Subject: Invitation to Take Aptitude Test - ${testTitle}

Dear ${candidateName},

You have been invited to take an aptitude test. Please find the details below:

📋 Test Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Test Name: ${testTitle}
• Duration: ${duration}
• Attempts Allowed: ${assignment.attemptsAllowed}
${assignment.expiresAt ? `• Valid Until: ${expiryDate}` : ''}

🔗 Access Link:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${inviteLink}

📝 Important Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Click the link above to access the test
2. You will need to verify your email: ${candidateEmail}
3. Ensure you have a stable internet connection
4. Use a desktop or laptop computer (Chrome browser recommended)
${assignment.test.cameraRequired ? '5. Camera access is required for proctoring\n' : ''}${assignment.test.requireFullscreen ? '6. The test requires fullscreen mode\n' : ''}${assignment.test.blockTabSwitch ? '7. Tab switching will be monitored\n' : ''}8. Complete the test in one sitting

⚠️ Please Note:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• This test session will be monitored and recorded
• Do not use external assistance or resources
• Any suspicious activity will be flagged
• Ensure your device is charged or plugged in

If you have any questions or face any technical issues, please contact us immediately.

Best regards,
Aptitude Taker RD Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated email. Please do not reply to this email.`
  }

  const copyEmail = (assignment) => {
    const emailText = generateEmail(assignment)
    navigator.clipboard.writeText(emailText)
    toast.success('Professional email copied to clipboard!')
  }

  const handleDeleteAssignment = async (assignmentId, candidateName) => {
    if (!confirm(`Are you sure you want to delete the assignment for ${candidateName}? This will also delete all related attempts, answers, and events.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Assignment deleted successfully')
        fetchAssignments() // Refresh list
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to delete assignment')
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MdFilterList className="mr-3 text-primary-600" size={32} />
            Test Assignments
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and monitor all test assignments and candidate progress
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MdFilterList className="mr-2 text-gray-500" size={16} />
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="flagged">Flagged</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MdFilterList className="mr-2 text-gray-500" size={16} />
                Filter by Test
              </label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="all">All Tests</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>{test.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAssignments}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <MdRefresh className="mr-2" size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-16 text-center border border-gray-200">
            <MdFilterList className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No assignments found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Candidate Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Test Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {assignment.user?.name || 'Guest User'}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <MdEmail className="mr-1 text-gray-400" size={14} />
                            {assignment.user?.email || 'No email assigned'}
                          </div>
                          {!assignment.user && (
                            <div className="text-xs text-blue-600 mt-1 flex items-center">
                              <MdWarning className="mr-1" size={12} />
                              Open invitation
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {assignment.test.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDuration(assignment.test.durationSeconds)} • {assignment.attemptsAllowed} attempt(s)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(assignment.status, assignment.latestAttempt?.flagged)}
                          {assignment.expiresAt && (
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(assignment.expiresAt) < new Date() ? '❌ Expired' : 
                               `⏰ ${new Date(assignment.expiresAt).toLocaleDateString()}`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {assignment.latestAttempt ? (
                            <div className="text-xs space-y-1">
                              <div className="text-gray-700">
                                Started: {new Date(assignment.latestAttempt.startedAt).toLocaleString()}
                              </div>
                              {assignment.latestAttempt.finishedAt && (
                                <div className="text-gray-600">
                                  Finished: {new Date(assignment.latestAttempt.finishedAt).toLocaleString()}
                                </div>
                              )}
                              <div className="text-gray-500">
                                {assignment.latestAttempt.answerCount} answers • {assignment.latestAttempt.eventCount} events
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">No attempts yet</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {assignment.latestAttempt?.score !== null && assignment.latestAttempt?.score !== undefined ? (
                            <div className="text-lg font-bold text-primary-600">
                              {assignment.latestAttempt.score.toFixed(1)}%
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            {assignment.latestAttempt && (
                              <Link
                                href={`/admin/results/${assignment.latestAttempt.id}`}
                                className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                              >
                                <MdVisibility className="mr-1" size={16} />
                                View Results
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(getInviteLink(assignment.inviteToken))
                                toast.success('Invite link copied!')
                              }}
                              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors text-left"
                            >
                              <MdContentCopy className="mr-1" size={16} />
                              Copy Link
                            </button>
                            <button
                              onClick={() => copyEmail(assignment)}
                              className="inline-flex items-center text-xs font-medium text-green-600 hover:text-green-800 transition-colors text-left"
                            >
                              <MdEmail className="mr-1" size={16} />
                              Copy Email
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id, assignment.user?.name || assignment.user?.email || 'this candidate')}
                              className="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800 transition-colors text-left"
                            >
                              <MdDelete className="mr-1" size={16} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white shadow-lg rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{assignment.user?.name || 'Guest User'}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MdEmail className="mr-1" size={14} />
                        {assignment.user?.email || 'No email'}
                      </p>
                    </div>
                    {getStatusBadge(assignment.status, assignment.latestAttempt?.flagged)}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Test:</span> {assignment.test.title}
                    </div>
                    {assignment.latestAttempt?.score !== null && assignment.latestAttempt?.score !== undefined && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Score:</span> 
                        <span className="text-primary-600 font-bold ml-2">{assignment.latestAttempt.score.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {assignment.latestAttempt && (
                      <Link
                        href={`/admin/results/${assignment.latestAttempt.id}`}
                        className="inline-flex items-center justify-center px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <MdVisibility className="mr-1" size={16} />
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getInviteLink(assignment.inviteToken))
                        toast.success('Link copied!')
                      }}
                      className="inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <MdContentCopy className="mr-1" size={16} />
                      Link
                    </button>
                    <button
                      onClick={() => copyEmail(assignment)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MdEmail className="mr-1" size={16} />
                      Email
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id, assignment.user?.name || assignment.user?.email || 'this candidate')}
                      className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <MdDelete className="mr-1" size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary Stats */}
        {!loading && assignments.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-5 border border-gray-200">
              <div className="text-sm text-gray-600 font-medium mb-1">Total</div>
              <div className="text-3xl font-bold text-gray-900">{assignments.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg rounded-xl p-5 border border-blue-200">
              <div className="text-sm text-blue-700 font-medium mb-1">In Progress</div>
              <div className="text-3xl font-bold text-blue-700">
                {assignments.filter(a => a.status === 'in_progress').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg rounded-xl p-5 border border-green-200">
              <div className="text-sm text-green-700 font-medium mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-700">
                {assignments.filter(a => a.status === 'submitted' || a.status === 'auto_submitted').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 shadow-lg rounded-xl p-5 border border-red-200">
              <div className="text-sm text-red-700 font-medium mb-1">Flagged</div>
              <div className="text-3xl font-bold text-red-700">
                {assignments.filter(a => a.latestAttempt?.flagged).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
