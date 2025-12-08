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

    // Handle params in Next.js 14+
    const resolvedParams = params instanceof Promise ? await params : params
    const attemptId = resolvedParams?.id

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 })
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
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

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle params in Next.js 14+
    const resolvedParams = params instanceof Promise ? await params : params
    const attemptId = resolvedParams?.id

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 })
    }

    // Check if attempt exists and admin owns the test
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: {
          include: {
            test: true,
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Verify admin owns the test
    if (attempt.assignment.test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this attempt' }, { status: 403 })
    }

    // Delete the attempt (cascades to answers, events, recordings via Prisma schema)
    await prisma.attempt.delete({
      where: { id: attemptId },
    })

    return NextResponse.json({ message: 'Attempt deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting attempt:', error)
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

