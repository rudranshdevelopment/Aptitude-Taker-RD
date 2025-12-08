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

    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    // Get all tests created by this admin
    const tests = await prisma.test.findMany({
      where: { createdBy: session.user.id },
      select: { id: true },
    })

    const testIds = tests.map(t => t.id)

    // Build where clause
    const where = {
      testId: { in: testIds },
    }
    if (testId) {
      where.testId = testId
    }

    // Get assignments with attempts
    const assignments = await prisma.testAssignment.findMany({
      where,
      include: {
        test: {
          select: {
            id: true,
            title: true,
            durationSeconds: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attempts: {
          include: {
            _count: {
              select: {
                events: true,
                answers: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format response with status
    const formatted = assignments.map(assignment => {
      const latestAttempt = assignment.attempts[0]
      const status = latestAttempt
        ? latestAttempt.status
        : assignment.expiresAt && new Date(assignment.expiresAt) < new Date()
        ? 'expired'
        : 'pending'

      return {
        ...assignment,
        status,
        latestAttempt: latestAttempt
          ? {
              id: latestAttempt.id,
              status: latestAttempt.status,
              score: latestAttempt.score ?? null,
              flagged: latestAttempt.flagged ?? false,
              startedAt: latestAttempt.startedAt,
              finishedAt: latestAttempt.finishedAt ?? null,
              eventCount: latestAttempt._count?.events ?? 0,
              answerCount: latestAttempt._count?.answers ?? 0,
            }
          : null,
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

