import { NextRequest, NextResponse } from 'next/server'
import { MockDatabase } from '@/lib/mock-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industryId = searchParams.get('industry_id')

    if (!industryId) {
      return NextResponse.json({ error: 'Industry ID is required' }, { status: 400 })
    }

    // Get data sources by industry using singleton
    const mockDb = MockDatabase.getInstance()
    const filteredSources = mockDb.getDataSourcesByIndustry(industryId)

    return NextResponse.json(filteredSources)
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
    const content = formData.get('content') as string
    const url = formData.get('url') as string
    const file = formData.get('file') as File | null

    if (!industryId || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new data source
    const newSource = {
      id: `source-${Date.now()}`,
      industry_profile_id: industryId,
      name,
      type: type as 'file' | 'url' | 'text',
      content: type === 'text' ? content : undefined,
      url: type === 'url' ? url : undefined,
      file_path: type === 'file' && file ? file.name : undefined,
      created_at: new Date().toISOString()
    }

    // Add to mock database using singleton
    const mockDb = MockDatabase.getInstance()
    mockDb.addDataSource(newSource)
    
    return NextResponse.json(newSource)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}