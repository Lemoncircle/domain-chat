import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, description, system_prompt, temperature, top_k } = await request.json()
    const { id } = await params

    if (!name || !system_prompt) {
      return NextResponse.json({ error: 'Name and system prompt are required' }, { status: 400 })
    }

    // TEMPORARILY DISABLED: Mock response for testing
    const mockProfile = {
      id,
      name,
      description: description || '',
      system_prompt,
      temperature: temperature || 0.7,
      top_k: top_k || 5,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params // Just await to satisfy the parameter requirement
    
    // TEMPORARILY DISABLED: Mock response for testing
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}