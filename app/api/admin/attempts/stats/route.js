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

    // Handle empty testIds array
    let total = 0
    let flagged = 0

    if (testIds.length > 0) {
      // Get assignments for these tests
      const assignments = await prisma.testAssignment.findMany({
        where: { testId: { in: testIds } },
        select: { id: true },
      })

      const assignmentIds = assignments.map(a => a.id)

      if (assignmentIds.length > 0) {
        // Get attempt stats
        total = await prisma.attempt.count({
          where: { assignmentId: { in: assignmentIds } },
        })

        flagged = await prisma.attempt.count({
          where: {
            assignmentId: { in: assignmentIds },
            flagged: true,
          },
        })
      }
    }

    return NextResponse.json({ total, flagged })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

