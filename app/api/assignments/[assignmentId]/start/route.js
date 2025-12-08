import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    // Handle params in Next.js 14+ (params might be a promise)
    const resolvedParams = params instanceof Promise ? await params : params
    const assignmentId = resolvedParams?.assignmentId

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const assignment = await prisma.testAssignment.findUnique({
      where: { id: assignmentId },
      include: { test: true },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check expiry
    if (assignment.expiresAt && new Date(assignment.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This assignment has expired' }, { status: 400 })
    }

    // Check attempts allowed
    const existingAttempts = await prisma.attempt.count({
      where: {
        assignmentId: assignmentId,
        status: { in: ['in_progress', 'submitted', 'auto_submitted'] },
      },
    })

    if (existingAttempts >= assignment.attemptsAllowed) {
      return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 400 })
    }

    const metadata = {
      ip: getClientIP(request) || 'unknown',
      userAgent: getUserAgent(request) || 'unknown',
      timestamp: new Date().toISOString(),
    }

    const body = await request.json().catch(() => ({}))

    const attempt = await prisma.attempt.create({
      data: {
        assignmentId: assignmentId,
        userId: assignment.userId,
        startedAt: new Date(),
        status: 'in_progress',
        metadata,
      },
      include: {
        assignment: {
          include: {
            test: {
              include: {
                questions: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    // Log consent event if provided
    if (body.consentAccepted) {
      await prisma.event.create({
        data: {
          attemptId: attempt.id,
          eventType: 'consent_accepted',
          eventData: { timestamp: new Date().toISOString() },
        },
      })
    }

    return NextResponse.json(attempt, { status: 201 })
  } catch (error) {
    console.error('Error starting attempt:', error)
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
