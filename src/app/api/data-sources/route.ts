import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industryId = searchParams.get('industry_id')

    if (!industryId) {
      return NextResponse.json({ error: 'Industry ID is required' }, { status: 400 })
    }

    const { data: sources, error } = await supabaseAdmin
      .from('data_sources')
      .select('*')
      .eq('industry_profile_id', industryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching data sources:', error)
      return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 })
    }

    return NextResponse.json(sources)
  } catch (error) {
    console.error('Unexpected error:', error)
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

    if (!industryId || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: source, error } = await supabaseAdmin
      .from('data_sources')
      .insert({
        industry_profile_id: industryId,
        name,
        type,
        content: type === 'text' ? content : null,
        url: type === 'url' ? url : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating data source:', error)
      return NextResponse.json({ error: 'Failed to create data source' }, { status: 500 })
    }

    return NextResponse.json(source)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
