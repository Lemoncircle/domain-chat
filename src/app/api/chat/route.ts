import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/ssr'
import { openai, CHAT_MODEL } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{
    source: string
    url?: string
    content: string
  }>
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const { message, industryProfileId, useRAG, messages } = await request.json()

    if (!message || !industryProfileId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get industry profile
    const { data: industryProfile, error: profileError } = await supabaseAdmin
      .from('industry_profiles')
      .select('*')
      .eq('id', industryProfileId)
      .single()

    if (profileError || !industryProfile) {
      return NextResponse.json({ error: 'Industry profile not found' }, { status: 404 })
    }

    // Build system prompt
    let systemPrompt = industryProfile.system_prompt

    // If RAG is enabled, retrieve relevant documents
    let retrievedChunks: any[] = []
    if (useRAG) {
      try {
        // Generate embedding for the user message
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: message,
        })

        const queryEmbedding = embeddingResponse.data[0].embedding

        // Search for similar chunks
        const { data: chunks, error: searchError } = await supabaseAdmin.rpc(
          'match_documents',
          {
            query_embedding: queryEmbedding,
            match_count: industryProfile.top_k,
            filter: { industry_profile_id: industryProfileId }
          }
        )

        if (!searchError && chunks && chunks.length > 0) {
          retrievedChunks = chunks
          
          // Add context to system prompt
          const contextText = chunks
            .map((chunk: any) => `Source: ${chunk.metadata?.source || 'Unknown'}\nContent: ${chunk.content}`)
            .join('\n\n')
          
          systemPrompt += `\n\nRelevant context from knowledge base:\n${contextText}\n\nWhen answering, cite the sources using [Source: filename] format.`
        } else {
          systemPrompt += '\n\nNo relevant documents found in the knowledge base. Provide a general answer and mention that no specific documentation was found.'
        }
      } catch (error) {
        console.error('Error retrieving documents:', error)
        systemPrompt += '\n\nError retrieving knowledge base documents. Provide a general answer.'
      }
    } else {
      systemPrompt += '\n\nKnowledge base is disabled. Provide a general answer without citing specific documents.'
    }

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: CHAT_MODEL,
            messages: openaiMessages as any,
            temperature: industryProfile.temperature,
            stream: true,
          })

          let fullContent = ''
          const citations: Array<{ source: string; url?: string; content: string }> = []

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              
              // Send content chunk
              const data = JSON.stringify({ type: 'content', content })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }

          // Extract citations from the response
          if (useRAG && retrievedChunks.length > 0) {
            retrievedChunks.forEach((chunk: any) => {
              if (fullContent.toLowerCase().includes(chunk.metadata?.source?.toLowerCase() || '')) {
                citations.push({
                  source: chunk.metadata?.source || 'Unknown',
                  url: chunk.metadata?.url,
                  content: chunk.content.substring(0, 200) + '...',
                })
              }
            })
          }

          // Send citations
          if (citations.length > 0) {
            const citationsData = JSON.stringify({ type: 'citations', citations })
            controller.enqueue(new TextEncoder().encode(`data: ${citationsData}\n\n`))
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
