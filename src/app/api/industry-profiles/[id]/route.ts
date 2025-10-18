import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    const { data: profile, error } = await supabaseAdmin
      .from('industry_profiles')
      .update({
        name,
        description,
        system_prompt,
        temperature: temperature || 0.7,
        top_k: top_k || 5,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating industry profile:', error)
      return NextResponse.json({ error: 'Failed to update industry profile' }, { status: 500 })
    }

    return NextResponse.json(profile)
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
    const { id } = await params
    
    const { error } = await supabaseAdmin
      .from('industry_profiles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting industry profile:', error)
      return NextResponse.json({ error: 'Failed to delete industry profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
