import { NextRequest, NextResponse } from 'next/server'
import { mockIndustryProfiles } from '@/lib/mock-db'

export async function GET() {
  try {
    return NextResponse.json(mockIndustryProfiles)
  } catch (error) {
    console.error('Error fetching industry profiles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, system_prompt, temperature, top_k } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create new profile and add to mock database
    const newProfile = {
      id: `profile-${Date.now()}`,
      name,
      description: description || '',
      system_prompt: system_prompt || 'You are a helpful AI assistant.',
      temperature: temperature || 0.7,
      top_k: top_k || 5,
      created_at: new Date().toISOString()
    }

    // Add to mock database
    mockIndustryProfiles.push(newProfile)

    console.log('Created profile:', newProfile)
    console.log('Total profiles:', mockIndustryProfiles.length)
    
    return NextResponse.json(newProfile)
  } catch (error) {
    console.error('Error creating industry profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}