'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDuration } from '@/lib/utils'
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdAssignment, 
  MdVisibility,
  MdDescription,
  MdAccessTime,
  MdQuestionAnswer
} from 'react-icons/md'

export default function TestsPage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests')
      if (res.ok) {
        const data = await res.json()
        setTests(data || [])
      } else {
        toast.error('Failed to fetch tests')
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      toast.error('Failed to fetch tests')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test? This will also delete all assignments and attempts.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Test deleted successfully')
        fetchTests()
      } else {
        toast.error('Failed to delete test')
      }
    } catch (error) {
      toast.error('Failed to delete test')
    }
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MdDescription className="mr-3 text-primary-600" size={32} />
                Tests Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage your aptitude tests
              </p>
            </div>
            <Link
              href="/admin/tests/new"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <MdAdd className="mr-2" size={20} />
              Create New Test
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-16 text-center border border-gray-200">
            <MdDescription className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tests yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first aptitude test</p>
            <Link
              href="/admin/tests/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              <MdAdd className="mr-2" size={20} />
              Create Your First Test
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white shadow-lg rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-all duration-200 transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h3 className="text-xl font-bold text-white truncate">{test.title}</h3>
                </div>
                
                <div className="p-6">
                  {test.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                  )}
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <MdAccessTime className="mr-2 text-primary-600" size={18} />
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2">{formatDuration(test.durationSeconds)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MdQuestionAnswer className="mr-2 text-green-600" size={18} />
                      <span className="font-medium">Questions:</span>
                      <span className="ml-2">{test._count?.questions || 0}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MdAssignment className="mr-2 text-blue-600" size={18} />
                      <span className="font-medium">Assignments:</span>
                      <span className="ml-2">{test._count?.assignments || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {test.cameraRequired && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📹 Camera
                      </span>
                    )}
                    {test.requireFullscreen && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🖥️ Fullscreen
                      </span>
                    )}
                    {test.blockTabSwitch && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🚫 Tab Block
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/tests/${test.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <MdEdit className="mr-2" size={18} />
                      Manage Test
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/admin/tests/${test.id}/assign`}
                        className="inline-flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <MdAssignment className="mr-1" size={16} />
                        Assign
                      </Link>
                      <button
                        onClick={() => handleDelete(test.id)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <MdDelete className="mr-1" size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created {new Date(test.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
