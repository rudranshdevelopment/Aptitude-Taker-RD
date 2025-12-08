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

    // Get all tests created by this admin
    const tests = await prisma.test.findMany({
      where: { createdBy: session.user.id },
      select: { id: true },
    })

    const testIds = tests.map(t => t.id)

    // Get assignments for these tests
    const assignments = await prisma.testAssignment.findMany({
      where: { testId: { in: testIds } },
      select: { id: true },
    })

    const assignmentIds = assignments.map(a => a.id)

    // Get attempts
    const attempts = await prisma.attempt.findMany({
      where: { assignmentId: { in: assignmentIds } },
      include: {
        assignment: {
          include: {
            test: {
              select: { title: true },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

