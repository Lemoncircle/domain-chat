import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, industryProfileId } = await request.json()

    if (!message || !industryProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TEMPORARILY DISABLED: Mock response for testing without database
    const mockResponse = `Hello! I received your message: "${message}". This is a mock response since the database is not configured for testing. The chat interface is working correctly!`

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simulate streaming response
          const words = mockResponse.split(' ')
          
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '')
            
            // Send content chunk
            const data = JSON.stringify({ type: 'content', content: word })
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 50))
          }

          // Send completion signal
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Error in mock chat completion:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
