import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface BookmarkData {
  articleId: string
  isBookmarked: boolean
  timestamp: number
}

export const useBookmarks = () => {
  const [localBookmarks, setLocalBookmarks] = useState<Map<string, BookmarkData>>(new Map())
  const [syncing, setSyncing] = useState(false)
  const { user } = useAuth()

  // Generate session ID for anonymous users
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('centinela_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('centinela_session_id', sessionId)
    }
    return sessionId
  }

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const loadLocalBookmarks = () => {
      try {
        const stored = localStorage.getItem('centinela_bookmarks')
        if (stored) {
          const bookmarksArray: BookmarkData[] = JSON.parse(stored)
          const bookmarksMap = new Map<string, BookmarkData>()
          
          bookmarksArray.forEach(bookmark => {
            bookmarksMap.set(bookmark.articleId, bookmark)
          })
          
          setLocalBookmarks(bookmarksMap)
        }
      } catch (error) {
        console.warn('Error loading bookmarks:', error)
      }
    }

    loadLocalBookmarks()
  }, [])

  // Sync bookmarks with backend when user logs in
  useEffect(() => {
    if (user && localBookmarks.size > 0) {
      syncBookmarksToBackend()
    }
  }, [user])

  // Load bookmarks from backend when user is authenticated
  useEffect(() => {
    if (user) {
      loadBookmarksFromBackend()
    }
  }, [user])

  // Save bookmarks to localStorage whenever localBookmarks changes
  useEffect(() => {
    try {
      const bookmarksArray = Array.from(localBookmarks.values())
      localStorage.setItem('centinela_bookmarks', JSON.stringify(bookmarksArray))
    } catch (error) {
      console.warn('Error saving bookmarks:', error)
    }
  }, [localBookmarks])

  const syncBookmarksToBackend = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId || syncing) return []
    
    setSyncing(true)
    
    const bookmarksToSync = Array.from(localBookmarks.values()).filter(bookmark => bookmark.isBookmarked)
    
    for (const bookmark of bookmarksToSync) {
      try {
        const { error } = await supabase
          .from('article_interactions')
          .upsert({
            article_id: bookmark.articleId,
            user_id: userId,
            is_bookmarked: true,
            created_at: new Date(bookmark.timestamp).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,article_id'
          })
        
        if (error) throw error
      } catch (error) {
        console.error('Error syncing bookmark to backend:', error)
      }
    }
    
    setSyncing(false)
  }

  const loadBookmarksFromBackend = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return []

    try {
      const { data, error } = await supabase
        .from('article_interactions')
        .select('article_id, created_at')
        .eq('user_id', userId)
        .eq('is_bookmarked', true)

      if (error) {
        throw error
      }

      if (data) {
        const backendBookmarks = new Map(localBookmarks)
        
        data.forEach((bookmark: any) => {
          backendBookmarks.set(bookmark.article_id, {
            articleId: bookmark.article_id,
            isBookmarked: true,
            timestamp: new Date(bookmark.created_at).getTime()
          })
        })

        setLocalBookmarks(backendBookmarks)
      }
    } catch (error: unknown) {
      console.error('Error loading bookmarks from backend:', error)
      return []
    }
  }

  const toggleBookmark = async (articleId: string): Promise<boolean> => {
    const currentBookmark = localBookmarks.get(articleId)
    const newIsBookmarked = !currentBookmark?.isBookmarked
    
    const newBookmarkData: BookmarkData = {
      articleId,
      isBookmarked: newIsBookmarked,
      timestamp: Date.now()
    }

    // Update local state immediately for responsive UI
    setLocalBookmarks(prev => {
      const newMap = new Map(prev)
      if (newIsBookmarked) {
        newMap.set(articleId, newBookmarkData)
      } else {
        newMap.delete(articleId)
      }
      return newMap
    })

    // Sync with backend
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) return newIsBookmarked // No backend sync for anonymous users
      
      if (newIsBookmarked) {
        // Add bookmark to backend
        const { error } = await supabase
          .from('article_interactions')
          .upsert({
            article_id: articleId,
            user_id: userId,
            is_bookmarked: true,
            created_at: new Date(newBookmarkData.timestamp).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,article_id'
          })
        
        if (error) throw error
      } else {
        // Remove bookmark from backend
        const { error } = await supabase
          .from('article_interactions')
          .update({ 
            is_bookmarked: false,
            updated_at: new Date().toISOString()
          })
          .eq('article_id', articleId)
          .eq('user_id', userId)
        
        if (error) throw error
      }
    } catch (error) {
      console.error('Error syncing bookmark with backend:', error)
      // Revert local state if backend sync fails
      setLocalBookmarks(prev => {
        const newMap = new Map(prev)
        if (currentBookmark) {
          newMap.set(articleId, currentBookmark)
        } else {
          newMap.delete(articleId)
        }
        return newMap
      })
    }

    return newIsBookmarked
  }

  const isBookmarked = (articleId: string): boolean => {
    return localBookmarks.get(articleId)?.isBookmarked || false
  }

  const getBookmarkTimestamp = (articleId: string): number | null => {
    return localBookmarks.get(articleId)?.timestamp || null
  }

  const getAllBookmarkedArticles = (): string[] => {
    return Array.from(localBookmarks.values())
      .filter(bookmark => bookmark.isBookmarked)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(bookmark => bookmark.articleId)
  }

  const clearAllBookmarks = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    
    if (userId) {
      try {
        // Clear from backend
        const { error } = await supabase
          .from('article_interactions')
          .update({ 
            is_bookmarked: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
        
        if (error) throw error
      } catch (error) {
        console.error('Error clearing bookmarks from backend:', error)
      }
    }

    // Clear local state
    setLocalBookmarks(new Map())
    localStorage.removeItem('centinela_bookmarks')
  }

  return {
    toggleBookmark,
    isBookmarked,
    getBookmarkTimestamp,
    getAllBookmarkedArticles,
    clearAllBookmarks,
    totalBookmarks: localBookmarks.size,
    syncing
  }
}