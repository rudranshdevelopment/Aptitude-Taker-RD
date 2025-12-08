import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle params in Next.js 14+ (params might be a promise)
    const resolvedParams = params instanceof Promise ? await params : params
    const testId = resolvedParams?.id

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          select: { id: true },
        },
      },
    })

    if (!test || test.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { type, promptText, imageUrl, choices, correctAnswer, marks, order } = body

    if (!type || !promptText) {
      return NextResponse.json({ error: 'Type and promptText are required' }, { status: 400 })
    }

    // Calculate order if not provided
    const questionOrder = order !== undefined ? parseInt(order) : (test.questions?.length || 0)

    // Prepare data for Prisma
    const questionData = {
      testId: testId,
      type: type,
      promptText: promptText.trim(),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
      marks: marks ? parseInt(marks) : 1,
      order: questionOrder,
      choices: choices || null,
      correctAnswer: correctAnswer || null,
    }

    const question = await prisma.question.create({
      data: questionData,
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
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

