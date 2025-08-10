import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export interface AuthResponse {
  data: any
  error: AuthError | Error | null
}
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 Verificando sesión inicial...')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Error obteniendo sesión:', error)
        } else if (session) {
          console.log('✅ Usuario ya logueado:', session.user.email)
        } else {
          console.log('ℹ️ No hay sesión activa')
        }
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      } catch (error) {
        console.error('❌ Error de conexión al verificar sesión:', error)
        setAuthState({
          user: null,
          session: null,
          loading: false
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de autenticación:', event, session?.user?.email)
        
        // Si es un usuario existente, mostrar info adicional
        if (session?.user) {
          console.log('👤 Datos del usuario:', {
            id: session.user.id,
            email: session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url ? 'Presente' : 'No presente',
            created_at: session.user.created_at,
            last_sign_in: session.user.last_sign_in_at
          })
        }
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error: error as AuthError }
    }
  }

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    try {
      // Detectar si estamos en desarrollo o producción
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const redirectTo = isLocalhost 
        ? `${window.location.origin}/`
        : 'https://centinela.news/'

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      return { data: null, error: error as AuthError }
    }
  }
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { data: null, error: error as AuthError }
    }
  }
  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  }
}