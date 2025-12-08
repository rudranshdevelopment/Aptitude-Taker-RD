import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInviteToken } from '@/lib/utils'
import { sendInviteEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import { formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { testId, email, userId, expiresAt, attemptsAllowed, linkMode, sendEmail: shouldSendEmail } = body

    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test || test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const inviteToken = generateInviteToken()

    // Find or create user if email is provided
    let assignedUserId = userId || null
    if (email && !userId) {
      // Check if user exists with this email
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      // If user doesn't exist, create one
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: email.split('@')[0], // Use email prefix as default name
            role: 'candidate',
          },
        })
      }

      assignedUserId = user.id
    }

    const assignment = await prisma.testAssignment.create({
      data: {
        testId,
        userId: assignedUserId,
        inviteToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        attemptsAllowed: attemptsAllowed || 1,
        linkMode: linkMode || 'single_use',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        test: {
          select: {
            title: true,
          },
        },
      },
    })

    // Send email if requested and email is provided
    if (shouldSendEmail && assignment.user?.email) {
      const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/test/verify/${inviteToken}`
      const duration = formatDuration(test.durationSeconds)
      const expiryDate = expiresAt ? new Date(expiresAt).toLocaleDateString() : 'No expiry'

      try {
        await sendInviteEmail({
          to: assignment.user.email,
          testName: test.title,
          duration,
          expiryDate,
          inviteLink,
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      assignment,
      inviteLink: `${process.env.APP_URL || 'http://localhost:3000'}/test/verify/${inviteToken}`,
      user: assignment.user,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating invite:', error)
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

