import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const body = await request.json()
    const { questionId, answerData, timeTakenMs } = body

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 })
    }

    // Upsert answer
    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: params.attemptId,
          questionId,
        },
      },
      update: {
        answerData,
        timeTakenMs: timeTakenMs || 0,
      },
      create: {
        attemptId: params.attemptId,
        questionId,
        answerData,
        timeTakenMs: timeTakenMs || 0,
      },
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error('Error saving answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

