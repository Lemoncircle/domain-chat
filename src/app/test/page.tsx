// Test page to check environment variables and auth status
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function TestPage() {
  const [envStatus, setEnvStatus] = useState('')
  const [authStatus, setAuthStatus] = useState('')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setEnvStatus(`Supabase URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`)
    
    // Check auth status
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          setAuthStatus(`Auth Error: ${error.message}`)
        } else if (session) {
          setAuthStatus('Authenticated')
          setUser(session.user)
        } else {
          setAuthStatus('Not authenticated')
        }
      } catch (err) {
        setAuthStatus(`Error: ${err}`)
      }
    }
    
    checkAuth()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Information</h1>
      <p><strong>Environment:</strong> {envStatus}</p>
      <p><strong>Auth Status:</strong> {authStatus}</p>
      {user && (
        <div>
          <p><strong>User:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      )}
    </div>
  )
}
