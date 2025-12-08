'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import { 
  MdAdd, 
  MdVideoCall, 
  MdSecurity, 
  MdAccessTime,
  MdSettings,
  MdDescription
} from 'react-icons/md'

export default function NewTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationSeconds: 3600, // 1 hour default
    questionNavigation: 'free',
    cameraRequired: false,
    recordVideo: false,
    blockTabSwitch: false,
    disableCopyPaste: false,
    requireFullscreen: false,
    autoFlagThreshold: 3,
    expiresAt: '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          durationSeconds: parseInt(formData.durationSeconds),
        }),
      })

      if (res.ok) {
        const test = await res.json()
        toast.success('Test created successfully')
        router.push(`/admin/tests/${test.id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create test')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error('Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MdAdd className="mr-3 text-primary-600" size={32} />
            Create New Test
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure your aptitude test settings and proctoring options
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MdDescription className="mr-2 text-primary-600" size={24} />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Software Developer Aptitude Test"
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the test..."
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="durationSeconds" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MdAccessTime className="mr-2 text-gray-500" size={16} />
                    Duration (seconds) *
                  </label>
                  <input
                    type="number"
                    id="durationSeconds"
                    name="durationSeconds"
                    required
                    min="60"
                    value={formData.durationSeconds}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {Math.floor(formData.durationSeconds / 60)} minutes
                  </p>
                </div>

                <div>
                  <label htmlFor="questionNavigation" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Navigation
                  </label>
                  <select
                    id="questionNavigation"
                    name="questionNavigation"
                    value={formData.questionNavigation}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="free">Free Navigation</option>
                    <option value="sequential">Sequential</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (optional)
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Proctoring Settings */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MdVideoCall className="mr-2 text-primary-600" size={24} />
              Proctoring Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  name="cameraRequired"
                  checked={formData.cameraRequired}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <MdVideoCall className="mr-2 text-blue-600" size={18} />
                    Camera Required
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Mandate camera access for monitoring</p>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  name="recordVideo"
                  checked={formData.recordVideo}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    📹 Record Video
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Save video recordings of the session</p>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  name="blockTabSwitch"
                  checked={formData.blockTabSwitch}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    🚫 Block Tab Switch
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Detect and log tab switching</p>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  name="requireFullscreen"
                  checked={formData.requireFullscreen}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    🖥️ Require Fullscreen
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Force fullscreen mode during test</p>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  name="disableCopyPaste"
                  checked={formData.disableCopyPaste}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <MdSecurity className="mr-2 text-green-600" size={18} />
                    Disable Copy/Paste
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Block copy, paste, and cut operations</p>
                </div>
              </label>

              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <label htmlFor="autoFlagThreshold" className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <MdSettings className="mr-2 text-orange-600" size={18} />
                  Auto-flag Threshold
                </label>
                <input
                  type="number"
                  id="autoFlagThreshold"
                  name="autoFlagThreshold"
                  min="0"
                  value={formData.autoFlagThreshold}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Number of violations before auto-flagging</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <MdAdd className="mr-2" size={20} />
                  Create Test
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
