import { useState, useEffect } from 'react'

interface LikeData {
  articleId: string
  isLiked: boolean
  timestamp: number
}

export const useLocalLikes = () => {
  const [localLikes, setLocalLikes] = useState<Map<string, LikeData>>(new Map())

  // Load likes from localStorage on mount
  useEffect(() => {
    const loadLikes = () => {
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
        console.warn('Error loading likes from localStorage:', error)
      }
    }

    loadLikes()
  }, [])

  // Save likes to localStorage whenever localLikes changes
  useEffect(() => {
    try {
      const likesArray = Array.from(localLikes.values())
      localStorage.setItem('centinela_likes', JSON.stringify(likesArray))
    } catch (error) {
      console.warn('Error saving likes to localStorage:', error)
    }
  }, [localLikes])

  const toggleLike = (articleId: string): boolean => {
    const currentLike = localLikes.get(articleId)
    const newIsLiked = !currentLike?.isLiked
    
    const newLikeData: LikeData = {
      articleId,
      isLiked: newIsLiked,
      timestamp: Date.now()
    }

    setLocalLikes(prev => {
      const newMap = new Map(prev)
      if (newIsLiked) {
        newMap.set(articleId, newLikeData)
      } else {
        newMap.delete(articleId)
      }
      return newMap
    })

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
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .map(like => like.articleId)
  }

  const clearAllLikes = () => {
    setLocalLikes(new Map())
    localStorage.removeItem('centinela_likes')
  }

  return {
    toggleLike,
    isLiked,
    getLikeTimestamp,
    getAllLikedArticles,
    clearAllLikes,
    totalLikes: localLikes.size
  }
}