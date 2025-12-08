import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      include: {
        assignment: {
          include: {
            test: {
              include: {
                questions: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Error fetching attempt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

