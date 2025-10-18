import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // TEMPORARILY DISABLED: Mock industry profiles for testing
    const mockProfiles = [
      {
        id: 'general',
        name: 'General Chat',
        description: 'General purpose AI chat for testing',
        system_prompt: 'You are a helpful AI assistant.',
        temperature: 0.7,
        top_k: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 'tech',
        name: 'Technology',
        description: 'AI chat focused on technology topics',
        system_prompt: 'You are a technology expert AI assistant.',
        temperature: 0.7,
        top_k: 5,
        created_at: new Date().toISOString()
      }
    ]

    return NextResponse.json(mockProfiles)
  } catch (error) {
    console.error('Error fetching industry profiles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, system_prompt, temperature, top_k } = body

    if (!name || !system_prompt) {
      return NextResponse.json({ error: 'Name and system prompt are required' }, { status: 400 })
    }

    // TEMPORARILY DISABLED: Mock response for testing
    const mockProfile = {
      id: `mock-profile-${Date.now()}`,
      name,
      description: description || '',
      system_prompt,
      temperature: temperature || 0.7,
      top_k: top_k || 5,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('Error creating industry profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}