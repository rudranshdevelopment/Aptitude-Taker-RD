import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    // Handle params in Next.js 14+
    const resolvedParams = params instanceof Promise ? await params : params
    const attemptId = resolvedParams?.attemptId

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { questionId, answerData, timeTakenMs } = body

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 })
    }

    // Upsert answer - save or update
    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attemptId,
          questionId: questionId,
        },
      },
      update: {
        answerData: answerData,
        timeTakenMs: timeTakenMs || 0,
      },
      create: {
        attemptId: attemptId,
        questionId: questionId,
        answerData: answerData,
        timeTakenMs: timeTakenMs || 0,
      },
    })

    console.log('Answer saved:', { attemptId, questionId, answerData })

    return NextResponse.json({ success: true, answer })
  } catch (error) {
    console.error('Error saving answer:', error)
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

