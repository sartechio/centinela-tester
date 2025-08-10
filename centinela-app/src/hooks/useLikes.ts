import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { getUserId } from '../lib/authSession'
import { retryWithBackoff } from '../lib/utils'

interface LikeData {
  articleId: string
  isLiked: boolean
  timestamp: number
}

export const useLikes = () => {
  const [localLikes, setLocalLikes] = useState<Map<string, LikeData>>(new Map())
  const [syncing, setSyncing] = useState(false)
  const { user } = useAuth()

  // Generate session ID for anonymous users
  const _getSessionId = (): string => {
    let sessionId = localStorage.getItem('centinela_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('centinela_session_id', sessionId)
    }
    return sessionId
  }

  // Load likes from localStorage on mount
  useEffect(() => {
    const loadLocalLikes = () => {
      try {
        const stored = localStorage.getItem('centinela_likes')
        if (stored) {
          const likesArray: LikeData[] = JSON.parse(stored)
          const likesMap = new Map<string, LikeData>()
          
          likesArray.forEach(like => {
            likesMap.set(like.articleId, like)
          })
          
          setLocalLikes(likesMap)
        }
      } catch (error) {
        console.warn('Error loading likes:', error)
      }
    }

    loadLocalLikes()
  }, [])

  // Sync likes with backend when user logs in
  useEffect(() => {
    if (user && localLikes.size > 0) {
      syncLikesToBackend()
    }
  }, [user])

  // Load likes from backend when user is authenticated
  useEffect(() => {
    if (user) {
      loadLikesFromBackend()
    }
  }, [user])

  // Save likes to localStorage whenever localLikes changes
  useEffect(() => {
    try {
      const likesArray = Array.from(localLikes.values())
      localStorage.setItem('centinela_likes', JSON.stringify(likesArray))
    } catch (error) {
      console.warn('Error saving likes:', error)
    }
  }, [localLikes])

  const syncLikesToBackend = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId || syncing) return []
    
    setSyncing(true)
    
    const likesToSync = Array.from(localLikes.values()).filter(like => like.isLiked)
    
    for (const like of likesToSync) {
      try {
        const { error } = await supabase
          .from('article_likes')
          .upsert({
            article_id: like.articleId,
            user_id: userId,
            session_id: null,
            created_at: new Date(like.timestamp).toISOString()
          }, {
            onConflict: 'article_id,user_id'
          })
        
        if (error) throw error
      } catch (error) {
        console.error('Error syncing like to backend:', error)
      }
    }
    
    setSyncing(false)
  }

  const loadLikesFromBackend = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return []

    try {
      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('article_likes')
          .select('article_id, created_at')
          .eq('user_id', userId)
      })

      if (error) {
        throw error
      }

      if (data) {
        const backendLikes = new Map(localLikes)
        
        data.forEach((like: any) => {
          backendLikes.set(like.article_id, {
            articleId: like.article_id,
            isLiked: true,
            timestamp: new Date(like.created_at).getTime()
          })
        })

        setLocalLikes(backendLikes)
      }
    } catch (error: unknown) {
      // Silently handle network errors - likes will work locally
      if (error instanceof Error && (error.message?.includes('Failed to fetch') || error.name === 'TypeError')) {
        console.log('🔌 Network unavailable - likes will work locally only')
      } else {
        console.warn('Error loading likes from backend:', error)
      }
      return []
    }
  }

  const toggleLike = async (articleId: string): Promise<boolean> => {
    const currentLike = localLikes.get(articleId)
    const newIsLiked = !currentLike?.isLiked
    
    console.log('🔄 Toggling like for article:', articleId, 'from', currentLike?.isLiked, 'to', newIsLiked)
    
    const newLikeData: LikeData = {
      articleId,
      isLiked: newIsLiked,
      timestamp: Date.now()
    }

    // Update local state immediately for responsive UI
    setLocalLikes(prev => {
      const newMap = new Map(prev)
      if (newIsLiked) {
        newMap.set(articleId, newLikeData)
        console.log('✅ Added like to local state')
      } else {
        newMap.delete(articleId)
        console.log('✅ Removed like from local state')
      }
      return newMap
    })

    // Sync with backend
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        console.log('ℹ️ No user session, like stored locally only')
        return newIsLiked // No backend sync for anonymous users
      }
      
      if (newIsLiked) {
        // Add like to backend
        const { error } = await supabase
          .from('article_likes')
          .upsert({
            article_id: articleId,
            user_id: userId,
            session_id: null,
            created_at: new Date(newLikeData.timestamp).toISOString()
          }, {
            onConflict: 'article_id,user_id'
          })
        
        if (error) {
          // Handle network errors gracefully
          if (error.message?.includes('Failed to fetch')) {
            console.log('🔌 Network unavailable - like stored locally only')
            return newIsLiked // Continue with local-only operation
          } else {
            console.error('❌ Error adding like to backend:', error)
            throw error
          }
        } else {
          console.log('✅ Like added to backend')
        }
      } else {
        // Remove like from backend
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', userId)
        
        if (error) {
          // Handle network errors gracefully
          if (error.message?.includes('Failed to fetch')) {
            console.log('🔌 Network unavailable - like removed locally only')
            return newIsLiked // Continue with local-only operation
          } else {
            console.error('❌ Error removing like from backend:', error)
            throw error
          }
        } else {
          console.log('✅ Like removed from backend')
        }
      }
    } catch (error) {
      // Only revert for non-network errors
      if (error instanceof Error && !error.message?.includes('Failed to fetch')) {
        console.error('Error syncing like with backend:', error)
        // Revert local state if backend sync fails
        setLocalLikes(prev => {
          const newMap = new Map(prev)
          if (currentLike) {
            newMap.set(articleId, currentLike)
            console.log('🔄 Reverted like state due to backend error')
          } else {
            newMap.delete(articleId)
          }
          return newMap
        })
        return !newIsLiked // Return the reverted state
      } else {
        console.log('🔌 Network unavailable - continuing with local operation')
      }
    }

    return newIsLiked
  }

  const isLiked = (articleId: string): boolean => {
    return localLikes.get(articleId)?.isLiked || false
  }

  const getLikeTimestamp = (articleId: string): number | null => {
    return localLikes.get(articleId)?.timestamp || null
  }

  const getAllLikedArticles = (): string[] => {
    return Array.from(localLikes.values())
      .filter(like => like.isLiked)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(like => like.articleId)
  }

  const clearAllLikes = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        // Clear from backend
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('user_id', userId)
        
        if (error) throw error
      } catch (error) {
        console.error('Error clearing likes from backend:', error)
      }
    }

    // Clear local state
    setLocalLikes(new Map())
    localStorage.removeItem('centinela_likes')
  }

  // Get total likes for an article from backend
  const getArticleLikesCount = async (articleId: string): Promise<number> => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return 0 // No count for anonymous users
    
    try {
      const { count, error } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)

      if (error) throw error
      return count || 0
    } catch (error: unknown) {
      // Silently handle network errors
      if (error instanceof Error && (error.message?.includes('Failed to fetch') || error.name === 'TypeError')) {
        console.log('🔌 Network unavailable - no likes count available')
      } else {
        console.warn('Error getting article likes count:', error)
      }
      return 0
    }
  }

  return {
    toggleLike,
    isLiked,
    getLikeTimestamp,
    getAllLikedArticles,
    clearAllLikes,
    getArticleLikesCount,
    totalLikes: localLikes.size,
    syncing
  }
}