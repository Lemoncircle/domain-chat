import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('industry_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching industry profiles:', error)
      return NextResponse.json({ error: 'Failed to fetch industry profiles' }, { status: 500 })
    }

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, system_prompt, temperature, top_k } = await request.json()

    if (!name || !system_prompt) {
      return NextResponse.json({ error: 'Name and system prompt are required' }, { status: 400 })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('industry_profiles')
      .insert({
        name,
        description,
        system_prompt,
        temperature: temperature || 0.7,
        top_k: top_k || 5,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating industry profile:', error)
      return NextResponse.json({ error: 'Failed to create industry profile' }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
