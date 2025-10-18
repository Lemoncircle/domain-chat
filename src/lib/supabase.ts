import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key'

// Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase client for server-side operations with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
