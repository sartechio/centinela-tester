import { useState, useEffect } from 'react'

interface ViewedArticle {
  articleId: string
  viewedAt: number
  sessionId?: string
}

export const useViewedArticles = () => {
  const [viewedArticles, setViewedArticles] = useState<Set<string>>(new Set())

  // Load viewed articles from localStorage on mount
  useEffect(() => {
    const loadViewedArticles = () => {
      try {
        const stored = localStorage.getItem('centinela_viewed_articles')
        if (stored) {
          const viewedData: ViewedArticle[] = JSON.parse(stored)
          
          // Only keep articles viewed in the last 7 days to avoid infinite growth
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
          const recentViewed = viewedData.filter(item => item.viewedAt > sevenDaysAgo)
          
          const viewedIds = new Set(recentViewed.map(item => item.articleId))
          setViewedArticles(viewedIds)
          
          // Update localStorage with cleaned data
          localStorage.setItem('centinela_viewed_articles', JSON.stringify(recentViewed))
        }
      } catch (error) {
        console.warn('Error loading viewed articles:', error)
      }
    }

    loadViewedArticles()
  }, [])

  // Mark article as viewed
  const markAsViewed = (articleId: string) => {
    if (viewedArticles.has(articleId)) return

    const newViewedArticles = new Set(viewedArticles)
    newViewedArticles.add(articleId)
    setViewedArticles(newViewedArticles)

    // Save to localStorage
    try {
      const stored = localStorage.getItem('centinela_viewed_articles')
      const existingData: ViewedArticle[] = stored ? JSON.parse(stored) : []
      
      const newViewedData: ViewedArticle = {
        articleId,
        viewedAt: Date.now(),
        sessionId: getSessionId()
      }
      
      existingData.push(newViewedData)
      localStorage.setItem('centinela_viewed_articles', JSON.stringify(existingData))
    } catch (error) {
      console.warn('Error saving viewed article:', error)
    }
  }

  // Check if article was viewed
  const isViewed = (articleId: string): boolean => {
    return viewedArticles.has(articleId)
  }

  // Get next unviewed article index
  const getNextUnviewedIndex = (articles: any[], currentIndex: number = 0): number => {
    // First, try to find an unviewed article starting from current position
    for (let i = currentIndex; i < articles.length; i++) {
      if (!isViewed(articles[i].id)) {
        return i
      }
    }
    
    // If no unviewed articles found from current position, search from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!isViewed(articles[i].id)) {
        return i
      }
    }
    
    // If all articles are viewed, return the current index
    return currentIndex
  }

  // Get session ID for tracking
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('centinela_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('centinela_session_id', sessionId)
    }
    return sessionId
  }

  // Clear old viewed articles (older than 7 days)
  const clearOldViewed = () => {
    try {
      const stored = localStorage.getItem('centinela_viewed_articles')
      if (stored) {
        const viewedData: ViewedArticle[] = JSON.parse(stored)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        const recentViewed = viewedData.filter(item => item.viewedAt > sevenDaysAgo)
        
        localStorage.setItem('centinela_viewed_articles', JSON.stringify(recentViewed))
        
        const recentIds = new Set(recentViewed.map(item => item.articleId))
        setViewedArticles(recentIds)
      }
    } catch (error) {
      console.warn('Error clearing old viewed articles:', error)
    }
  }

  // Get statistics
  const getViewedCount = (): number => {
    return viewedArticles.size
  }

  return {
    markAsViewed,
    isViewed,
    getNextUnviewedIndex,
    getViewedCount,
    clearOldViewed,
    viewedArticles: Array.from(viewedArticles)
  }
}