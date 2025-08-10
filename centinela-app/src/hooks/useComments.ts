import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { retryWithBackoff } from '../lib/utils'

export interface Comment {
  id: string
  article_id: string
  user_id: string | null
  content: string
  is_hidden: boolean
  is_reported: boolean
  report_count: number
  created_at: string
  updated_at: string
  moderated_by: string | null
  moderated_at: string | null
  author_name?: string | null
  author_avatar?: string | null
  user_has_liked?: boolean
  likes_count?: number
  profiles?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const getCommentsForArticle = async (articleId: string) => {
    // Skip Supabase queries for mock data
    if (articleId.startsWith('mock-')) {
      setComments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      try {
        let data, fetchError;
        
        try {
          const result = await retryWithBackoff(async () => {
            return await supabase
              .from('comments')
              .select('id, content, created_at, user_id, article_id, is_hidden, is_reported, report_count, updated_at, moderated_by, moderated_at, profiles ( id, username, full_name, avatar_url )')
              .eq('article_id', articleId)
              .eq('is_hidden', false)
              .order('created_at', { ascending: true })
          });
          
          data = result.data;
          fetchError = result.error;
        } catch (embedError) {
          console.log('Direct embed failed for comments list, trying fallback:', embedError);
          
          // Fallback: get comments first, then profiles separately
          const commentsResult = await retryWithBackoff(async () => {
            return await supabase
              .from('comments')
              .select('*')
              .eq('article_id', articleId)
              .eq('is_hidden', false)
              .order('created_at', { ascending: true })
          });
          
          if (commentsResult.error) {
            throw commentsResult.error;
          }
          
          data = commentsResult.data;
          
          // Get profiles for all comments with user_id
          if (data && data.length > 0) {
            const userIds = data.filter(c => c.user_id).map(c => c.user_id);
            
            if (userIds.length > 0) {
              const profilesResult = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .in('id', userIds);
              
              if (profilesResult.data) {
                // Map profiles to comments
                const profilesMap = new Map(profilesResult.data.map(p => [p.id, p]));
                data = data.map(comment => ({
                  ...comment,
                  profiles: comment.user_id ? profilesMap.get(comment.user_id) || null : null
                }));
              }
            }
          }
        }

        if (fetchError) {
          throw fetchError
        }

        if (data && data.length > 0) {
          // Transform data to include author info and likes
          const transformedComments = data.map(comment => ({
            ...comment,
            author_name: comment.profiles?.username || comment.profiles?.full_name || 'Usuario',
            author_avatar: comment.profiles?.avatar_url || null,
            user_has_liked: false, // TODO: Implement likes system
            likes_count: 0 // TODO: Implement likes system
          }))
          setComments(transformedComments)
        } else {
          setComments([])
        }
      } catch (supabaseError) {
        // Silently handle network errors
        if (supabaseError instanceof Error && (supabaseError.message?.includes('Failed to fetch') || supabaseError.name === 'TypeError')) {
          console.log('🔌 Network unavailable - no comments will be shown')
        } else {
          console.warn('Supabase unavailable, no comments will be shown:', supabaseError)
        }
        setComments([])
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err)
      setError('Error al cargar los comentarios')
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async (articleId: string, content: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return false

    try {
      setSubmitting(true)
      
      // First, ensure user has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      let profileId = existingProfile?.id
      
      if (!profileId) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            username: session.user.email?.split('@')[0] || 'usuario',
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null
          })
          .select('id')
          .single()
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
          return false
        }
        
        profileId = newProfile.id
      }
      
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: profileId, // Use profile.id instead of user.id
          content: content.trim()
        })
        .select('id, content, created_at, user_id, article_id, is_hidden, is_reported, report_count, updated_at, moderated_by, moderated_at, profiles ( id, username, full_name, avatar_url )')
        .single()

      if (insertError) {
        throw insertError
      }

      if (data) {
        const transformedComment = {
          ...data,
          author_name: data.profiles?.username || data.profiles?.full_name || 'Usuario',
          author_avatar: data.profiles?.avatar_url || null,
          user_has_liked: false,
          likes_count: 0
        }
        setComments(prev => [...prev, transformedComment])
      }

      return true
    } catch (err: any) {
      console.error('Error adding comment:', err)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const updateComment = async (commentId: string, content: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return false

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (!profile) return false
      
      const { error: updateError } = await supabase
        .from('comments')
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', profile.id) // Use profile.id

      if (updateError) {
        throw updateError
      }

      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: content.trim() }
          : comment
      ))

      return true
    } catch (err: any) {
      console.error('Error updating comment:', err)
      return false
    }
  }

  const deleteComment = async (commentId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return false

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (!profile) return false
      
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', profile.id) // Use profile.id

      if (deleteError) {
        throw deleteError
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId))
      return true
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      return false
    }
  }

  const toggleCommentLike = async (commentId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return false

    try {
      // TODO: Implement actual like toggle logic with backend
      // For now, just toggle locally
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              user_has_liked: !comment.user_has_liked,
              likes_count: comment.user_has_liked 
                ? (comment.likes_count || 0) - 1 
                : (comment.likes_count || 0) + 1
            }
          : comment
      ))

      return true
    } catch (err: any) {
      console.error('Error toggling comment like:', err)
      return false
    }
  }

  const getTopCommentForArticle = async (articleId: string): Promise<Comment | null> => {
    // Skip Supabase queries for mock data
    if (articleId.startsWith('mock-')) {
      return null
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, likes, is_hidden')
        .eq('article_id', articleId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      const comment = data?.[0];
      if (!comment) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', comment.user_id)
        .single();

      const result = { ...comment, profiles: profile ?? null };

      return {
        ...result,
        author_name: result.profiles?.username || result.profiles?.full_name || 'Usuario',
        author_avatar: result.profiles?.avatar_url || null,
        user_has_liked: false,
        likes_count: 0
      }
    } catch (err) {
      console.log('Comments unavailable - continuing without them')
      return null
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Ahora'
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `Hace ${days} día${days > 1 ? 's' : ''}`
    }
  }

  return {
    comments,
    loading,
    submitting,
    error,
    getCommentsForArticle,
    submitComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    getTopCommentForArticle,
    formatTimeAgo
  }
}