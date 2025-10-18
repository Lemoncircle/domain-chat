import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industryId = searchParams.get('industry_id')

    if (!industryId) {
      return NextResponse.json({ error: 'Industry ID is required' }, { status: 400 })
    }

    // TEMPORARILY DISABLED: Mock response for testing
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching data sources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const industryId = formData.get('industry_id') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string

    if (!industryId || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TEMPORARILY DISABLED: Mock response for testing
    const mockSource = {
      id: 'mock-source-id',
      industry_profile_id: industryId,
      name,
      type,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(mockSource)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}