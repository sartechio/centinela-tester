/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing'
  })
  console.error('❌ VITE_SUPABASE_URL:', supabaseUrl)
  console.error('❌ VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present but hidden' : 'Missing')
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

console.log('🔗 Supabase connecting to:', supabaseUrl)
console.log('🔑 Using anon key:', supabaseAnonKey ? 'Present' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export interface ArticleWithSource {
  id: string
  title: string
  link: string
  description: string | null
  content: string | null
  image_url: string | null
  ai_summary: string | null
  category: string
  published_at: string
  is_breaking: boolean
  created_at: string
  updated_at: string
  url?: string
  rss_sources: {
    id: string
    name: string
    url: string
    category: string
    region: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    priority: number | null
  }
}

export interface Profile {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    username?: string
  }
}