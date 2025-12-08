import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const formData = await request.formData()
    const file = formData.get('frame') || formData.get('recording')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // For now, save to local storage (in production, upload to S3)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${params.attemptId}_${Date.now()}.${file.name.split('.').pop()}`
    const uploadPath = join(process.cwd(), 'uploads', 'recordings', filename)

    // Ensure directory exists
    const fs = require('fs')
    const dir = join(process.cwd(), 'uploads', 'recordings')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    await writeFile(uploadPath, buffer)

    // Create recording record
    const recording = await prisma.recording.create({
      data: {
        attemptId: params.attemptId,
        localPath: uploadPath,
        duration: null, // Could be calculated from video metadata
      },
    })

    // Log event
    await prisma.event.create({
      data: {
        attemptId: params.attemptId,
        eventType: 'recording_saved',
        eventData: { recordingId: recording.id, filename },
      },
    })

    return NextResponse.json(recording, { status: 201 })
  } catch (error) {
    console.error('Error saving recording:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

