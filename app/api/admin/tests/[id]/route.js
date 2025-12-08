import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params instanceof Promise ? await params : params
    const testId = resolvedParams?.id

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: { name: true, email: true },
        },
      },
    })

    if (!test || test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params instanceof Promise ? await params : params
    const testId = resolvedParams?.id

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test || test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const updated = await prisma.test.update({
      where: { id: testId },
      data: {
        title: body.title,
        description: body.description,
        durationSeconds: parseInt(body.durationSeconds),
        questionNavigation: body.questionNavigation,
        cameraRequired: body.cameraRequired,
        recordVideo: body.recordVideo,
        blockTabSwitch: body.blockTabSwitch,
        disableCopyPaste: body.disableCopyPaste,
        requireFullscreen: body.requireFullscreen,
        autoFlagThreshold: body.autoFlagThreshold,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params instanceof Promise ? await params : params
    const testId = resolvedParams?.id

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test || test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    await prisma.test.delete({
      where: { id: testId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

