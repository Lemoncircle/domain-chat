import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { processFileUpload, processURLContent, processTextContent } from '@/lib/document-processor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dataSourceId = formData.get('data_source_id') as string
    const industryProfileId = formData.get('industry_profile_id') as string
    const type = formData.get('type') as string

    if (!dataSourceId || !industryProfileId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get data source info
    const { data: dataSource, error: sourceError } = await supabaseAdmin
      .from('data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .single()

    if (sourceError || !dataSource) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    let result

    switch (type) {
      case 'file':
        const file = formData.get('file') as File
        if (!file) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }
        result = await processFileUpload(file, industryProfileId, dataSourceId)
        break

      case 'url':
        const url = formData.get('url') as string
        if (!url) {
          return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
        }
        result = await processURLContent(url, industryProfileId, dataSourceId)
        break

      case 'text':
        const content = formData.get('content') as string
        if (!content) {
          return NextResponse.json({ error: 'No content provided' }, { status: 400 })
        }
        result = await processTextContent(content, industryProfileId, dataSourceId)
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Update data source status
    await supabaseAdmin
      .from('data_sources')
      .update({ 
        updated_at: new Date().toISOString(),
        // Add processing status if needed
      })
      .eq('id', dataSourceId)

    return NextResponse.json({
      success: true,
      chunksProcessed: result.totalChunks,
      message: `Successfully processed ${result.totalChunks} chunks`,
    })
  } catch (error: unknown) {
    console.error('Document ingestion error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document'
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 })
  }
}
