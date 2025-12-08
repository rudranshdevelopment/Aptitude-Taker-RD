import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      include: {
        assignment: {
          include: {
            test: {
              include: {
                questions: true,
              },
            },
          },
        },
        answers: true,
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 })
    }

    // Calculate score if correct answers are available
    let score = null
    const questions = attempt.assignment?.test?.questions || []
    const answers = attempt.answers || []

    if (questions.length > 0 && questions.some(q => q.correctAnswer)) {
      let totalMarks = 0
      let earnedMarks = 0

      questions.forEach(question => {
        if (question && question.marks) {
          totalMarks += question.marks
          const answer = answers.find(a => a && a.questionId === question.id)
          if (answer && question.correctAnswer) {
            try {
              const correct = JSON.stringify(answer.answerData) === JSON.stringify(question.correctAnswer)
              if (correct) {
                earnedMarks += question.marks
              }
            } catch (error) {
              console.error('Error comparing answers:', error)
            }
          }
        }
      })

      score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0
    }

    const updated = await prisma.attempt.update({
      where: { id: params.attemptId },
      data: {
        status: 'submitted',
        finishedAt: new Date(),
        score,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error submitting attempt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

