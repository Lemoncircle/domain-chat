'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import IndustrySelector from '@/components/IndustrySelector'
import { LogOut, Send, Square, RotateCcw } from 'lucide-react'

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

interface IndustryProfile {
  id: string
  name: string
  description: string
  system_prompt: string
  temperature: number
  top_k: number
}

export default function ChatInterface() {
  // TEMPORARILY DISABLED: Skip authentication for testing
  const signOut = async () => {
    console.log('Sign out disabled for testing')
  }
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryProfile | null>(null)
  const [useRAG, setUseRAG] = useState(false) // Disabled for testing
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // TEMPORARILY DISABLED: Mock industry profile for testing
  useEffect(() => {
    const mockIndustry: IndustryProfile = {
      id: 'test-industry',
      name: 'General Chat',
      description: 'General purpose AI chat for testing',
      system_prompt: 'You are a helpful AI assistant. Provide clear and helpful responses.',
      temperature: 0.7,
      top_k: 5
    }
    setSelectedIndustry(mockIndustry)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedIndustry) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsStreaming(true)

    // Create abort controller for streaming
    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          industryProfileId: selectedIndustry.id,
          useRAG,
          messages: [...messages, userMessage],
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        citations: [],
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'content') {
                assistantMessage.content += data.content
              } else if (data.type === 'citations') {
                assistantMessage.citations = data.citations
              } else if (data.type === 'done') {
                setIsStreaming(false)
              }

              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...assistantMessage }
                    : msg
                )
              )
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Error sending message:', error)
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
          timestamp: new Date(),
        }])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setAbortController(null)
    }
  }

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setIsStreaming(false)
      setIsLoading(false)
    }
  }

  const regenerateResponse = async () => {
    if (messages.length === 0) return
    
    // Remove the last assistant message
    const lastUserMessageIndex = messages.findLastIndex(msg => msg.role === 'user')
    if (lastUserMessageIndex === -1) return
    
    const messagesUpToUser = messages.slice(0, lastUserMessageIndex + 1)
    setMessages(messagesUpToUser)
    
    // Resend the last user message
    const lastUserMessage = messagesUpToUser[lastUserMessageIndex]
    setInput(lastUserMessage.content)
    
    // Trigger send after a brief delay
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Domain Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Industry Selector */}
      <div className="p-4 border-b">
        <IndustrySelector
          selectedIndustry={selectedIndustry}
          onIndustryChange={setSelectedIndustry}
          useRAG={useRAG}
          onRAGToggle={setUseRAG}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            <h2 className="text-xl font-semibold mb-2">Welcome to Domain Chat</h2>
            <p>Select an industry profile above and start a conversation by typing a message below.</p>
            {!useRAG && (
              <p className="text-sm mt-2 text-amber-600 dark:text-amber-400">
                Knowledge base is currently disabled. Enable RAG for industry-specific answers.
              </p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
              <CardContent className="p-4">
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="text-sm font-medium mb-2">Sources:</div>
                    <div className="space-y-1">
                      {message.citations.map((citation, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {citation.source}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <Card className="max-w-[80%]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">●</div>
                  <div className="animate-pulse">●</div>
                  <div className="animate-pulse">●</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedIndustry ? "Type your message..." : "Select an industry profile first..."}
            disabled={isLoading || !selectedIndustry}
            className="flex-1"
          />
          {isStreaming ? (
            <Button onClick={stopGeneration} variant="destructive">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button onClick={regenerateResponse} variant="outline" disabled={messages.length === 0}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading || !selectedIndustry}>
                <Send className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
