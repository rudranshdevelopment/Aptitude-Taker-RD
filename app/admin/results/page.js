'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  MdCheckCircle, 
  MdWarning, 
  MdVisibility,
  MdPerson,
  MdDescription,
  MdFlag,
  MdFilterList,
  MdDelete
} from 'react-icons/md'

export default function ResultsPage() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAttempts()
  }, [])

  const fetchAttempts = async () => {
    try {
      const res = await fetch('/api/admin/attempts')
      if (res.ok) {
        const data = await res.json()
        setAttempts(data || [])
      } else {
        toast.error('Failed to fetch attempts')
      }
    } catch (error) {
      console.error('Error fetching attempts:', error)
      toast.error('Failed to fetch attempts')
    } finally {
      setLoading(false)
    }
  }

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'all') return true
    if (filter === 'flagged') return attempt.flagged
    if (filter === 'completed') return attempt.status === 'submitted' || attempt.status === 'auto_submitted'
    if (filter === 'in_progress') return attempt.status === 'in_progress'
    return true
  })

  const handleDelete = async (attemptId, event) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this attempt? This action cannot be undone and will delete all associated answers, events, and recordings.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/attempts/${attemptId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Attempt deleted successfully')
        fetchAttempts() // Refresh the list
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to delete attempt')
      }
    } catch (error) {
      console.error('Error deleting attempt:', error)
      toast.error('Failed to delete attempt')
    }
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MdCheckCircle className="mr-3 text-primary-600" size={32} />
            Test Results
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and analyze candidate test attempts
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <MdFilterList className="text-gray-500" size={20} />
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="all">All Attempts</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="flagged">Flagged Only</option>
            </select>
            <span className="text-sm text-gray-500">
              {filteredAttempts.length} result(s)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-16 text-center border border-gray-200">
            <MdCheckCircle className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No attempts found</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
              <ul className="divide-y divide-gray-100">
                {filteredAttempts.map((attempt) => (
                  <li key={attempt.id} className="hover:bg-gray-50 transition-colors">
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/results/${attempt.id}`}
                          className="flex-1"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <MdPerson className="text-gray-500" size={20} />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {attempt.user?.name || attempt.user?.email || 'Unknown User'}
                            </h3>
                            {attempt.flagged && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <MdFlag className="mr-1" size={12} />
                                Flagged
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attempt.status === 'submitted' ? 'bg-green-100 text-green-800' :
                              attempt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {attempt.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <MdDescription className="text-gray-400" size={16} />
                            <span className="font-medium">{attempt.assignment.test.title}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Started: {new Date(attempt.startedAt).toLocaleString()}</span>
                            {attempt.finishedAt && (
                              <span>Finished: {new Date(attempt.finishedAt).toLocaleString()}</span>
                            )}
                            {attempt.score !== null && attempt.score !== undefined && (
                              <span className="font-semibold text-primary-600">
                                Score: {attempt.score.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => handleDelete(attempt.id, e)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete attempt"
                          >
                            <MdDelete size={20} />
                          </button>
                          <Link href={`/admin/results/${attempt.id}`}>
                            <MdVisibility className="text-primary-600" size={24} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 hover:border-primary-400 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      href={`/admin/results/${attempt.id}`}
                      className="flex-1"
                    >
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <MdPerson className="mr-2 text-gray-500" size={18} />
                        {attempt.user?.name || attempt.user?.email || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {attempt.assignment.test.title}
                      </p>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDelete(attempt.id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete attempt"
                      >
                        <MdDelete size={20} />
                      </button>
                      {attempt.flagged && (
                        <MdFlag className="text-red-600" size={20} />
                      )}
                    </div>
                  </div>
                  <Link href={`/admin/results/${attempt.id}`}>
                    {attempt.score !== null && attempt.score !== undefined && (
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {attempt.score.toFixed(1)}%
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(attempt.startedAt).toLocaleString()}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
