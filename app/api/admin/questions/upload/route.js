import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${randomBytes(16).toString('hex')}.${fileExtension}`
    const uploadPath = join(process.cwd(), 'uploads', 'questions', filename)

    // Ensure directory exists
    const fs = require('fs')
    const dir = join(process.cwd(), 'uploads', 'questions')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(uploadPath, buffer)

    // Return the URL path for API access
    const imageUrl = `/api/uploads/questions/${filename}`

    return NextResponse.json({ imageUrl, filename }, { status: 201 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

