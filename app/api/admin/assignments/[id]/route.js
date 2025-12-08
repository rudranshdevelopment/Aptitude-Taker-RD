import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle params in Next.js 14+
    const resolvedParams = params instanceof Promise ? await params : params
    const assignmentId = resolvedParams?.id

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Check if assignment exists and belongs to admin's test
    const assignment = await prisma.testAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        test: {
          select: { createdBy: true },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (assignment.test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete assignment (cascades to attempts, answers, events, recordings)
    await prisma.testAssignment.delete({
      where: { id: assignmentId },
    })

    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Error deleting assignment:', error)
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

