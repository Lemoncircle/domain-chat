'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          router.push('/')
        } else {
          // No session, redirect to auth page
          router.push('/auth')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/auth?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
