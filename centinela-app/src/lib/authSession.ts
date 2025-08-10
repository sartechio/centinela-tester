import { supabase } from '@/lib/supabase'

export async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}