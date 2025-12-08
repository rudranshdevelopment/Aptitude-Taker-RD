import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const assignment = await prisma.testAssignment.findUnique({
      where: { inviteToken: params.token },
      include: {
        test: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        attempts: {
          where: {
            status: { in: ['in_progress', 'submitted', 'auto_submitted'] },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
    }

    // Check expiry
    if (assignment.expiresAt && new Date(assignment.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired' }, { status: 400 })
    }

    // Check attempts allowed
    if (assignment.attempts.length >= assignment.attemptsAllowed) {
      return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 400 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

