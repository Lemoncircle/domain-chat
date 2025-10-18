import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dataSourceId = formData.get('data_source_id') as string
    const industryProfileId = formData.get('industry_profile_id') as string
    const type = formData.get('type') as string

    if (!dataSourceId || !industryProfileId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TEMPORARILY DISABLED: Mock response for testing
    const mockResult = {
      success: true,
      chunksProcessed: 5,
      message: 'Successfully processed 5 chunks (mock response)',
    }

    return NextResponse.json(mockResult)
  } catch (error: unknown) {
    console.error('Document ingestion error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document'
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 })
  }
}