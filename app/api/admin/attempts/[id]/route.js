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

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.id },
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
        user: {
          select: { name: true, email: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
        },
        recordings: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Check if admin owns the test
    const test = await prisma.test.findUnique({
      where: { id: attempt.assignment.testId },
    })

    if (test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Error fetching attempt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

