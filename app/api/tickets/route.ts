import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const tickets = await prisma.ticket.findMany()
  return NextResponse.json(tickets)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const ticket = await prisma.ticket.create({
    data: {
      title: body.title,
      description: body.description,
      status: body.status || 'READY_TO_DEVELOP',
      priority: body.priority || 'MEDIUM',
      assignee: body.assignee,
      reporter: body.reporter
    }
  })
  
  return NextResponse.json(ticket)
} 