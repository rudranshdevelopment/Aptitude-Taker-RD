import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const assignment = await prisma.testAssignment.findUnique({
      where: { inviteToken: params.token },
      include: {
        user: {
          select: { email: true, name: true },
        },
        test: {
          select: { title: true },
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

    // Verify email
    if (assignment.user) {
      // If assignment has a specific user, verify email matches
      if (assignment.user.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ 
          error: 'Email does not match the assigned candidate email',
          assignedEmail: assignment.user.email,
        }, { status: 403 })
      }
    } else {
      // If no specific user assigned, allow any email (guest mode)
      // You can add additional validation here if needed
    }

    // Check attempts allowed
    const existingAttempts = await prisma.attempt.count({
      where: {
        assignmentId: assignment.id,
        status: { in: ['in_progress', 'submitted', 'auto_submitted'] },
      },
    })

    if (existingAttempts >= assignment.attemptsAllowed) {
      return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 400 })
    }

    return NextResponse.json({ 
      verified: true,
      assignment: {
        id: assignment.id,
        testTitle: assignment.test.title,
        userName: assignment.user?.name || 'Guest',
        userEmail: assignment.user?.email || email,
      },
    })
  } catch (error) {
    console.error('Error verifying assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

