'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function TestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionForm, setQuestionForm] = useState({
    type: 'mcq',
    promptText: '',
    imageUrl: '',
    choices: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    order: 0,
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setQuestionForm({ ...questionForm, imageUrl: data.imageUrl })
        setImagePreview(data.imageUrl)
        toast.success('Image uploaded successfully')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    
    if (!questionForm.promptText.trim()) {
      toast.error('Please enter a question')
      return
    }

    if ((questionForm.type === 'mcq' || questionForm.type === 'single') && !questionForm.correctAnswer.trim()) {
      toast.error('Please enter a correct answer')
      return
    }

    try {
      const choices = questionForm.type === 'mcq' || questionForm.type === 'single' 
        ? questionForm.choices.filter(c => c.trim() !== '')
        : null

      if (choices && choices.length < 2) {
        toast.error('Please provide at least 2 choices')
        return
      }

      const res = await fetch(`/api/admin/tests/${params.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: questionForm.type,
          promptText: questionForm.promptText.trim(),
          imageUrl: questionForm.imageUrl || null,
          choices: choices ? { options: choices } : null,
          correctAnswer: questionForm.correctAnswer ? { value: questionForm.correctAnswer.trim() } : null,
          marks: questionForm.marks || 1,
          order: test?.questions?.length || 0,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Question added successfully')
        setShowQuestionForm(false)
        setQuestionForm({
          type: 'mcq',
          promptText: '',
          imageUrl: '',
          choices: ['', '', '', ''],
          correctAnswer: '',
          marks: 1,
          order: 0,
        })
        setImagePreview(null)
        fetchTest()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add question')
        console.error('Error response:', error)
      }
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('Failed to add question: ' + error.message)
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
            <p className="mt-2 text-sm text-gray-600">{test.description}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/admin/tests/${params.id}/assign`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Assign Test
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Settings</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Duration:</span> {Math.floor(test.durationSeconds / 60)} minutes
            </div>
            <div>
              <span className="font-medium">Questions:</span> {test.questions.length}
            </div>
            <div>
              <span className="font-medium">Camera Required:</span> {test.cameraRequired ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Record Video:</span> {test.recordVideo ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              {showQuestionForm ? 'Cancel' : 'Add Question'}
            </button>
          </div>

          {showQuestionForm && (
            <form onSubmit={handleAddQuestion} className="mb-6 p-4 border rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="single">Single Choice</option>
                  <option value="text">Short Text</option>
                  <option value="number">Numeric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <textarea
                  value={questionForm.promptText}
                  onChange={(e) => setQuestionForm({ ...questionForm, promptText: e.target.value })}
                  required
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Image (Optional)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <div className="text-sm text-gray-500">Uploading image...</div>
                  )}
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Question preview"
                        className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionForm({ ...questionForm, imageUrl: '' })
                          setImagePreview(null)
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(questionForm.type === 'mcq' || questionForm.type === 'single') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                  {questionForm.choices.map((choice, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...questionForm.choices]
                        newChoices[idx] = e.target.value
                        setQuestionForm({ ...questionForm, choices: newChoices })
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 mb-2"
                    />
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mt-2">Correct Answer</label>
                    <input
                      type="text"
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      placeholder="Enter correct answer"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Marks</label>
                <input
                  type="number"
                  value={questionForm.marks}
                  onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
              >
                Add Question
              </button>
            </form>
          )}

          <div className="space-y-4">
            {test.questions.map((q, idx) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold">Q{idx + 1}:</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{q.type}</span>
                      <span className="text-xs text-gray-500">{q.marks} marks</span>
                    </div>
                    <p className="text-gray-900">{q.promptText}</p>
                    {q.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={q.imageUrl}
                          alt="Question image"
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    {q.choices && (
                      <ul className="mt-2 space-y-1">
                        {q.choices.options?.map((opt, optIdx) => (
                          <li key={optIdx} className="text-sm text-gray-600">• {opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

