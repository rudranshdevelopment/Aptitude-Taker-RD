import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tests = await prisma.test.findMany({
      where: { createdBy: session.user.id },
      include: {
        _count: {
          select: { questions: true, assignments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tests || [])
  } catch (error) {
    console.error('Error fetching tests:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      durationSeconds,
      questionNavigation,
      cameraRequired,
      recordVideo,
      blockTabSwitch,
      disableCopyPaste,
      requireFullscreen,
      autoFlagThreshold,
      expiresAt,
    } = body

    const test = await prisma.test.create({
      data: {
        title,
        description,
        durationSeconds: parseInt(durationSeconds),
        questionNavigation: questionNavigation || 'free',
        cameraRequired: cameraRequired || false,
        recordVideo: recordVideo || false,
        blockTabSwitch: blockTabSwitch || false,
        disableCopyPaste: disableCopyPaste || false,
        requireFullscreen: requireFullscreen || false,
        autoFlagThreshold: autoFlagThreshold ? parseInt(autoFlagThreshold) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

