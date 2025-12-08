import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const body = await request.json()
    const { eventType, eventData } = body

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      include: {
        assignment: {
          include: { test: true },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        attemptId: params.attemptId,
        eventType,
        eventData: eventData || {},
      },
    })

    // Check if we need to flag the attempt
    if (eventType === 'tab_switch' && attempt.assignment.test.blockTabSwitch) {
      const tabSwitchCount = await prisma.event.count({
        where: {
          attemptId: params.attemptId,
          eventType: 'tab_switch',
        },
      })

      if (tabSwitchCount >= attempt.assignment.test.autoFlagThreshold) {
        await prisma.attempt.update({
          where: { id: params.attemptId },
          data: { flagged: true },
        })
      }
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error logging event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

