import { createClient } from '@supabase/supabase-js'

// Get environment variables - only create client if properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only create clients if environment variables are properly set
let supabase: ReturnType<typeof createClient> | null = null
let supabaseAdmin: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
}

// Export clients with fallbacks for build time
export { supabase, supabaseAdmin }
