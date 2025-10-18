import { NextRequest, NextResponse } from 'next/server'
import { MockDatabase } from '@/lib/mock-db'

export async function POST(request: NextRequest) {
  try {
    const { message, industryProfileId, useRAG } = await request.json()

    if (!message || !industryProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get singleton instance
    const mockDb = MockDatabase.getInstance()
    
    // Find the industry profile
    const industryProfiles = mockDb.getIndustryProfiles()
    const industryProfile = industryProfiles.find(p => p.id === industryProfileId)
    
    if (!industryProfile) {
      return NextResponse.json({ error: 'Industry profile not found' }, { status: 404 })
    }

    // Build response based on RAG setting
    let responseText = ''
    
    if (useRAG) {
      // Find relevant data sources for this industry
      const relevantSources = mockDb.getDataSourcesByIndustry(industryProfileId)
      
      if (relevantSources.length > 0) {
        responseText = `Based on the uploaded documents for "${industryProfile.name}", I can help you with information about:\n\n`
        relevantSources.forEach((source, index) => {
          responseText += `${index + 1}. ${source.name} (${source.type})\n`
        })
        responseText += `\nYour question: "${message}"\n\n`
        responseText += `I would search through these documents to provide you with relevant information. `
        responseText += `Since this is a mock response, I can't actually process the document content yet, `
        responseText += `but the RAG system is working correctly!`
      } else {
        responseText = `I don't have any uploaded documents for "${industryProfile.name}" yet. `
        responseText += `Please upload some documents in the admin panel to enable RAG functionality. `
        responseText += `Your question: "${message}"`
      }
    } else {
      responseText = `Hello! I'm the "${industryProfile.name}" AI assistant. `
      responseText += `Your question: "${message}"\n\n`
      responseText += `This is a mock response using the industry profile system prompt: "${industryProfile.system_prompt}"`
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simulate streaming response
          const words = responseText.split(' ')
          
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '')
            
            // Send content chunk
            const data = JSON.stringify({ type: 'content', content: word })
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 30))
          }

          // Send completion signal
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Error in chat completion:', error)
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