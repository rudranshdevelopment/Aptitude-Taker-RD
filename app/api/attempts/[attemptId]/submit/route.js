import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    // Handle params in Next.js 14+ (params might be a promise)
    const resolvedParams = params instanceof Promise ? await params : params
    const attemptId = resolvedParams?.attemptId

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

    console.log('Calculating score for attempt:', attemptId)
    console.log('Questions:', questions.length)
    console.log('Answers:', answers.length)

    if (questions.length > 0) {
      let totalMarks = 0
      let earnedMarks = 0

      questions.forEach(question => {
        if (question && question.marks) {
          totalMarks += question.marks
          const answer = answers.find(a => a && a.questionId === question.id)
          
          // Check if question has correct answer defined
          if (answer && question.correctAnswer) {
            try {
              // Handle correctAnswer structure - it's stored as JSON
              // Structure: { value: [...] } for MCQ or { value: "..." } for single/text/number
              const correctAnswerObj = question.correctAnswer
              let correctValue = null
              
              // Extract correct value based on structure
              if (correctAnswerObj && typeof correctAnswerObj === 'object') {
                if (correctAnswerObj.value !== undefined) {
                  correctValue = correctAnswerObj.value
                } else if (correctAnswerObj.options !== undefined) {
                  // Legacy format: { options: [...] }
                  correctValue = correctAnswerObj.options
                } else {
                  // If it's already an array or string, use it directly
                  correctValue = correctAnswerObj
                }
              } else {
                correctValue = correctAnswerObj
              }

              let userAnswer = answer.answerData
              
              console.log('Question:', question.promptText.substring(0, 50))
              console.log('Type:', question.type)
              console.log('User answer:', JSON.stringify(userAnswer), typeof userAnswer)
              console.log('Correct answer:', JSON.stringify(correctValue), typeof correctValue)
              
              let isCorrect = false
              
              if (question.type === 'mcq') {
                // For MCQ: correctValue should be an array, userAnswer should be an array
                const correctArray = Array.isArray(correctValue) ? correctValue : (correctValue ? [correctValue] : [])
                const userArray = Array.isArray(userAnswer) ? userAnswer : (userAnswer ? [userAnswer] : [])
                
                // Normalize and sort both arrays for comparison
                const correctSorted = correctArray
                  .map(v => String(v).trim().toLowerCase())
                  .filter(v => v.length > 0)
                  .sort()
                const userSorted = userArray
                  .map(v => String(v).trim().toLowerCase())
                  .filter(v => v.length > 0)
                  .sort()
                
                // Check if arrays have same length and same elements
                isCorrect = correctSorted.length > 0 && 
                           correctSorted.length === userSorted.length &&
                           correctSorted.every((val, idx) => val === userSorted[idx])
                
                console.log('MCQ comparison:', { 
                  correctSorted, 
                  userSorted, 
                  isCorrect,
                  correctLength: correctSorted.length,
                  userLength: userSorted.length
                })
              } else {
                // For single choice, text, numeric
                let userValue = userAnswer
                if (Array.isArray(userAnswer)) {
                  userValue = userAnswer.length > 0 ? userAnswer[0] : null
                }
                
                // Handle correctValue - might be array or string
                let correctStr = correctValue
                if (Array.isArray(correctValue)) {
                  correctStr = correctValue.length > 0 ? correctValue[0] : null
                }
                
                // Compare as strings (case-insensitive, trimmed)
                if (userValue !== null && correctStr !== null) {
                  isCorrect = String(userValue).trim().toLowerCase() === String(correctStr).trim().toLowerCase()
                } else {
                  isCorrect = false
                }
                
                console.log('Single/Text/Numeric comparison:', { 
                  userValue, 
                  correctStr, 
                  isCorrect 
                })
              }
              
              console.log('Is correct:', isCorrect)
              
              if (isCorrect) {
                earnedMarks += question.marks
                console.log(`✓ Question correct! Earned ${question.marks} marks. Total: ${earnedMarks}/${totalMarks}`)
              } else {
                console.log(`✗ Question incorrect. Total: ${earnedMarks}/${totalMarks}`)
              }
            } catch (error) {
              console.error('Error comparing answers for question:', question.id, error)
              console.error('Error details:', error.stack)
              console.error('Question data:', JSON.stringify(question, null, 2))
              console.error('Answer data:', JSON.stringify(answer, null, 2))
            }
          } else {
            if (!answer) {
              console.log('No answer provided for question:', question.id)
            }
            if (!question.correctAnswer) {
              console.log('No correct answer defined for question:', question.id)
            }
          }
        }
      })

      score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0
      console.log('Final score calculation:', {
        earnedMarks,
        totalMarks,
        score: score.toFixed(2) + '%'
      })
    } else {
      console.log('No questions found for this test')
    }

    const updated = await prisma.attempt.update({
      where: { id: attemptId },
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

