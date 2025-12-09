'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export default function Providers({ children }) {
  useEffect(() => {
    // Suppress harmless message channel errors from browser extensions
    const handleUnhandledRejection = (event) => {
      const errorMessage = String(event?.reason?.message || '')
      if (
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('asynchronous response') ||
        errorMessage.includes('listener indicated') ||
        errorMessage.includes('message channel')
      ) {
        // Suppress these known harmless errors from browser extensions
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleError = (event) => {
      const errorMessage = String(event?.message || event?.error?.message || '')
      if (
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('asynchronous response') ||
        errorMessage.includes('listener indicated') ||
        errorMessage.includes('message channel')
      ) {
        // Suppress these known harmless errors
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Suppress passive event listener warnings (these are usually from third-party libraries like Vercel's feedback widget)
    const originalWarn = console.warn
    const originalError = console.error
    console.warn = function(...args) {
      const message = args.join(' ')
      if (
        message.includes('non-passive event listener') ||
        message.includes('touchstart') ||
        message.includes('Consider marking event handler as') ||
        message.includes('[Violation]') ||
        message.includes('scroll-blocking') ||
        message.includes('feedback.js') // Vercel's feedback widget
      ) {
        // Suppress passive listener warnings - they're harmless performance warnings from third-party scripts
        return
      }
      originalWarn.apply(console, args)
    }
    
    // Also suppress console.error for these violations
    console.error = function(...args) {
      const message = args.join(' ')
      if (
        message.includes('[Violation]') ||
        message.includes('non-passive event listener') ||
        message.includes('feedback.js')
      ) {
        // Suppress violation errors from third-party scripts
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  return <SessionProvider>{children}</SessionProvider>
}

