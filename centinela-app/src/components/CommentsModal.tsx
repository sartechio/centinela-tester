import React, { useState, useEffect } from 'react';
import { Heart, Send, Edit2, Trash2, Check, X } from 'lucide-react';
import { useComments, Comment } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';

interface CommentsModalProps {
  isVisible: boolean;
  onClose: () => void;
  articleId: string;
  onShowAuth?: () => void;
  theme?: 'light' | 'dark';
}

const CommentsModal: React.FC<CommentsModalProps> = ({ 
  isVisible, 
  onClose, 
  articleId,
  onShowAuth,
  theme: _theme
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    submitting, 
    getCommentsForArticle, 
    submitComment, 
    updateComment,
    deleteComment,
    toggleCommentLike,
    formatTimeAgo 
  } = useComments();

  // Load comments when modal opens
  useEffect(() => {
    if (isVisible && articleId) {
      getCommentsForArticle(articleId);
    }
  }, [isVisible, articleId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      onClose();
      onShowAuth?.();
      return;
    }

    const success = await submitComment(articleId, newComment);
    if (success) {
      setNewComment('');
    } else {
      // Show user-friendly error message
      alert('No se pudo enviar el comentario. Verifica tu conexión e intenta nuevamente.');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      onClose();
      onShowAuth?.();
      return;
    }
    
    await toggleCommentLike(commentId);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingText.trim()) return;
    
    const success = await updateComment(editingCommentId, editingText);
    if (success) {
      setEditingCommentId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      alert('Debes estar logueado para eliminar comentarios')
      return
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      const success = await deleteComment(commentId);
      
      if (success) {
        // Recargar comentarios
        getCommentsForArticle(articleId);
      } else {
        alert('Error al eliminar el comentario. Intenta nuevamente.');
      }
    }
  };

  // Generate initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
      style={{
        paddingBottom: `max(0px, env(safe-area-inset-bottom, 0px))`
      }}
    >
      <div 
        className={`w-full bg-black rounded-t-3xl transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight: '85vh',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-800">
          <h2 
            className="text-white text-2xl font-normal text-center"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 400
            }}
          >
            comentarios.
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6" style={{ maxHeight: '50vh' }}>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p 
                className="text-gray-400"
                style={{ 
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px'
                }}
              >
                ¿Qué opinas?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3"
                >
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                    style={{ 
                      background: user?.user_metadata?.avatar_url
                        ? `url("${user.user_metadata.avatar_url}")`
                        : 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {!user?.user_metadata?.avatar_url && user && getInitials(user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'U')}
                  </div>
                  
                  {/* Comment Content */}
                  <div className="flex-1">
                    {/* Username */}
                    <div className="flex items-center justify-between mb-1">
                      <p 
                        className="text-white font-medium"
                        style={{ 
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                          fontSize: '14px'
                        }}
                      >
                        @{comment.author_name?.replace('@', '') || 'usuario'}
                      </p>
                      
                      <div className="flex items-center gap-1">
                        <span 
                          className="text-gray-500 text-xs"
                          style={{ 
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                          }}
                        >
                          {formatTimeAgo(comment.created_at)}
                        </span>
                        
                        {/* Edit/Delete buttons for own comments */}
                        {user && comment.user_id === user.id && (
                          <div className="flex items-center gap-1 ml-2">
                            {editingCommentId === comment.id ? (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className="p-1 text-green-500 hover:bg-gray-800 rounded"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-gray-500 hover:bg-gray-800 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditComment(comment)}
                                  className="p-1 text-gray-500 hover:bg-gray-800 rounded"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="p-1 text-red-500 hover:bg-gray-800 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Comment Text */}
                    {editingCommentId === comment.id ? (
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full bg-gray-800 text-gray-300 rounded-lg p-2 border border-gray-700 outline-none resize-none"
                        style={{ 
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                          fontSize: '14px'
                        }}
                        rows={2}
                        maxLength={500}
                      />
                    ) : (
                      <p 
                        className="text-gray-300 leading-relaxed mb-2"
                        style={{ 
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                          fontSize: '14px'
                        }}
                      >
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1 p-2 rounded-full transition-colors hover:bg-gray-800"
                  >
                    <Heart 
                      size={20} 
                      className={comment.user_has_liked ? 'text-red-500 fill-red-500' : 'text-gray-500'}
                    />
                    {(comment.likes_count || 0) > 0 && (
                      <span className="text-gray-400 text-sm font-medium">
                        {comment.likes_count}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ 
                background: user?.user_metadata?.avatar_url 
                  ? `url("${user.user_metadata.avatar_url}")` 
                  : 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {!user?.user_metadata?.avatar_url && user && getInitials(user.user_metadata?.username || user.email?.split('@')[0] || 'U')}
            </div>
            
            {/* Input Container */}
            <div className="flex-1 flex items-center gap-2">
              {user ? (
                <>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                    placeholder="Escribe un comentario..."
                    disabled={submitting}
                    className="flex-1 bg-gray-900 rounded-full px-4 py-3 text-gray-300 placeholder-gray-500 outline-none border border-gray-700 transition-colors focus:border-gray-600"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '14px'
                    }}
                    maxLength={500}
                  />
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                    style={{ 
                      background: newComment.trim() && !submitting 
                        ? 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)'
                        : '#374151'
                    }}
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send size={16} color="#FFFFFF" />
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onClose(); onShowAuth?.(); }}
                  className="flex-1 bg-gray-900 rounded-full px-4 py-3 text-left border border-gray-700 transition-colors hover:border-gray-600"
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}
                >
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>Escribe un comentario...</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom safe area */}
        <div 
          style={{ 
            height: `max(20px, env(safe-area-inset-bottom, 20px))`,
            backgroundColor: '#000000'
          }}
        />
      </div>
    </div>
  );
};

export default CommentsModal;