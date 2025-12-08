import { randomBytes } from 'crypto'

export function generateInviteToken() {
  return randomBytes(32).toString('hex')
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatTimeRemaining(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function getClientIP(request) {
  try {
    if (!request) {
      return 'unknown'
    }
    
    // Try headers API first (Next.js 13+)
    if (request.headers && typeof request.headers.get === 'function') {
      const forwarded = request.headers.get('x-forwarded-for')
      if (forwarded) {
        return forwarded.split(',')[0].trim()
      }
      
      const realIp = request.headers.get('x-real-ip')
      if (realIp) {
        return realIp.trim()
      }
    }
    
    // Try old headers format
    if (request.headers && typeof request.headers === 'object') {
      const forwarded = request.headers['x-forwarded-for']
      if (forwarded) {
        return forwarded.split(',')[0].trim()
      }
      
      const realIp = request.headers['x-real-ip']
      if (realIp) {
        return realIp.trim()
      }
    }
    
    // Fallback to socket (might not be available)
    if (request.socket?.remoteAddress) {
      return request.socket.remoteAddress
    }
    
    return 'unknown'
  } catch (error) {
    console.error('Error getting client IP:', error)
    return 'unknown'
  }
}

export function getUserAgent(request) {
  try {
    if (!request) {
      return 'unknown'
    }
    
    // Try headers API first (Next.js 13+)
    if (request.headers && typeof request.headers.get === 'function') {
      return request.headers.get('user-agent') || 'unknown'
    }
    
    // Try old headers format
    if (request.headers && typeof request.headers === 'object') {
      return request.headers['user-agent'] || 'unknown'
    }
    
    return 'unknown'
  } catch (error) {
    console.error('Error getting user agent:', error)
    return 'unknown'
  }
}

