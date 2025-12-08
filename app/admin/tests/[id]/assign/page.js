'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'

export default function AssignTestPage() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    expiresAt: '',
    attemptsAllowed: 1,
    linkMode: 'single_use',
    sendEmail: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState(null)

  useEffect(() => {
    fetchTest()
  }, [params.id])

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/admin/tests/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTest(data)
      } else {
        toast.error('Failed to fetch test')
        router.push('/admin/tests')
      }
    } catch (error) {
      toast.error('Failed to fetch test')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate email if provided
    if (formData.email && !formData.email.trim()) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: params.id,
          email: formData.email.trim() || null,
          expiresAt: formData.expiresAt || null,
          attemptsAllowed: parseInt(formData.attemptsAllowed) || 1,
          linkMode: formData.linkMode,
          sendEmail: formData.sendEmail && formData.email.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setInviteLink(data.inviteLink)
        toast.success(`Invite created successfully${data.user ? ` for ${data.user.email}` : ''}`)
        if (formData.sendEmail && formData.email) {
          toast.success('Email sent to candidate')
        }
      } else {
        const error = await res.json()
        console.error('Invite error:', error)
        toast.error(error.error || error.details || 'Failed to create invite')
      }
    } catch (error) {
      console.error('Failed to create invite:', error)
      toast.error('Failed to create invite: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    )
  }

  if (!test) {
    return null
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Assign Test: {test.title}</h1>

        {inviteLink ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Invite Created Successfully</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invite Link</label>
              <div className="flex">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink)
                    toast.success('Link copied to clipboard')
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setInviteLink(null)
                setFormData({
                  email: '',
                  expiresAt: '',
                  attemptsAllowed: 1,
                  linkMode: 'single_use',
                  sendEmail: true,
                })
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Create Another Invite
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Candidate Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="candidate@example.com"
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                Expiry Date (optional)
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="attemptsAllowed" className="block text-sm font-medium text-gray-700">
                Attempts Allowed
              </label>
              <input
                type="number"
                id="attemptsAllowed"
                name="attemptsAllowed"
                min="1"
                value={formData.attemptsAllowed}
                onChange={(e) => setFormData({ ...formData, attemptsAllowed: parseInt(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="linkMode" className="block text-sm font-medium text-gray-700">
                Link Mode
              </label>
              <select
                id="linkMode"
                name="linkMode"
                value={formData.linkMode}
                onChange={(e) => setFormData({ ...formData, linkMode: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="single_use">Single Use</option>
                <option value="bulk">Bulk (Multiple Uses)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                name="sendEmail"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-900">
                Send email invitation
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}

