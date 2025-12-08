'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ConsentPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [starting, setStarting] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    fetchAssignment()
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [params.token])

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignment/${params.token}`)
      if (res.ok) {
        const data = await res.json()
        setAssignment(data)
        if (data.test.cameraRequired) {
          startCameraPreview()
        } else {
          setCameraReady(true)
        }
      } else {
        toast.error('Invalid invite link')
        router.push('/')
      }
    } catch (error) {
      toast.error('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready and play
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setCameraReady(true)
            })
            .catch((err) => {
              console.error('Error playing video:', err)
              setCameraError('Failed to start camera preview')
            })
        }
        
        // If metadata is already loaded, play immediately
        if (videoRef.current.readyState >= 1) {
          videoRef.current.play()
            .then(() => {
              setCameraReady(true)
            })
            .catch((err) => {
              console.error('Error playing video:', err)
              setCameraError('Failed to start camera preview')
            })
        }
      } else {
        // If videoRef is not ready, set ready state anyway (stream is active)
        setCameraReady(true)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError('Camera access denied or not available')
      if (assignment?.test.cameraRequired) {
        toast.error('Camera is required for this test')
      }
    }
  }

  const handleProceed = async () => {
    if (!consentAccepted) {
      toast.error('Please accept the consent to proceed')
      return
    }

    if (assignment?.test?.cameraRequired && !cameraReady) {
      toast.error('Please allow camera access to proceed')
      return
    }

    setStarting(true)
    try {
      // Start the attempt
      const res = await fetch(`/api/assignments/${assignment.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentAccepted: true }),
      })

      if (res.ok) {
        const attempt = await res.json()
        
        // Open test in a new window (not tab) with specific features
        // Calculate window size to be nearly fullscreen
        const width = window.screen.availWidth || 1920
        const height = window.screen.availHeight || 1080
        const left = 0
        const top = 0
        
        const examUrl = `${window.location.origin}/test/exam/${attempt.id}`
        
        // Try to open in a new window first
        const newWindow = window.open(
          examUrl,
          'AptitudeTest',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no,personalbar=no`
        )

        // Check if popup was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup was blocked - fallback to same window
          toast('Popup blocked. Opening test in this window...', { 
            icon: '⚠️',
            duration: 3000 
          })
          
          // Small delay to show the message, then redirect
          setTimeout(() => {
            window.location.href = examUrl
          }, 500)
        } else {
          // Popup opened successfully
          toast.success('Opening test in new window...')
          
        // Focus the new window
        newWindow.focus()

        // Fullscreen will be requested automatically in the exam page on load
        // No need to send postMessage - it's handled in the exam page useEffect
        }
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to start test')
        setStarting(false)
      }
    } catch (error) {
      console.error('Error starting test:', error)
      toast.error('Failed to start test. Please try again.')
      setStarting(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Consent & System Check
        </h1>

        {assignment.test.cameraRequired && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Camera Check</h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
              {/* Always render video element so ref is available */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full rounded-lg bg-black ${cameraReady && streamRef.current ? 'block' : 'hidden'}`}
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                onLoadedMetadata={() => {
                  if (videoRef.current && streamRef.current) {
                    videoRef.current.play()
                      .then(() => {
                        setCameraReady(true)
                      })
                      .catch((err) => {
                        console.error('Error playing video:', err)
                      })
                  }
                }}
                onPlay={() => {
                  setCameraReady(true)
                }}
              />
              {!cameraReady && !cameraError && (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">Click the button below to allow camera access</div>
                </div>
              )}
              {cameraError && (
                <div className="text-center py-8 text-red-600">{cameraError}</div>
              )}
            </div>
            {!cameraReady && !cameraError && (
              <button
                onClick={startCameraPreview}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                Allow Camera Access
              </button>
            )}
            {cameraReady && (
              <div className="text-center text-sm text-green-600 mb-2">
                ✅ Camera is active
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Privacy & Consent</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 mb-2">
              By proceeding with this test, you consent to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              {assignment.test.cameraRequired && (
                <li>Camera recording and monitoring during the test</li>
              )}
              {assignment.test.recordVideo && (
                <li>Video recording of your test session</li>
              )}
              <li>Monitoring of your browser activity and tab switches</li>
              <li>Logging of all events during the test session</li>
              <li>Storage of your test data and recordings</li>
            </ul>
            <p className="text-xs text-blue-700 mt-4">
              Your data will be stored securely and used only for assessment purposes.
              Recordings will be retained according to the organization's retention policy.
            </p>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="consent" className="ml-2 block text-sm text-gray-900">
              I understand and accept the terms above. I consent to camera recording and monitoring.
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={handleProceed}
            disabled={!consentAccepted || (assignment?.test?.cameraRequired && !cameraReady) || starting}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {starting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Test...
              </>
            ) : (
              'Proceed to Test'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

