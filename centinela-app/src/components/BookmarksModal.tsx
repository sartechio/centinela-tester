import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, ExternalLink, Heart } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useArticles } from '../hooks/useArticles';
import { useLikes } from '../hooks/useLikes';

interface BookmarksModalProps {
  isVisible: boolean;
  onClose: () => void;
  onArticleSelect?: (articleId: string) => void;
  theme?: 'light' | 'dark';
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({ 
  isVisible, 
  onClose, 
  onArticleSelect,
  theme: _theme
}) => {
  const { getAllBookmarkedArticles, toggleBookmark } = useBookmarks();
  const { articles } = useArticles();
  const { isLiked, toggleLike } = useLikes();
  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([]);

  // Load bookmarked articles when modal opens
  useEffect(() => {
    if (isVisible) {
      const bookmarkedIds = getAllBookmarkedArticles();
      const bookmarkedNews = articles.filter(article => 
        bookmarkedIds.includes(article.id)
      );
      setBookmarkedArticles(bookmarkedNews);
    }
  }, [isVisible, articles, getAllBookmarkedArticles]);

  const handleRemoveBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleBookmark(articleId);
    // Update local state
    setBookmarkedArticles(prev => prev.filter(article => article.id !== articleId));
  };

  const handleLike = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike(articleId);
  };

  const handleArticleClick = (articleId: string) => {
    onArticleSelect?.(articleId);
    onClose();
  };

  const formatTimeAgo = (timeAgo: string): string => {
    return timeAgo;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
      onClick={handleBackdropClick}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className={`w-full max-w-2xl bg-black rounded-2xl transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 lg:hidden">
          <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 
            className="text-white text-xl font-semibold"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 600
            }}
          >
            guardadas.
          </h2>
          
          {/* Close button for desktop */}
          <button
            onClick={onClose}
            className="hidden lg:flex w-8 h-8 rounded-full bg-gray-800 items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0 ml-4"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: '60vh' }}>
          {bookmarkedArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bookmark size={48} color="#9CA3AF" className="mb-4 opacity-50" />
              <h3 
                className="font-semibold mb-2 text-white"
                style={{ 
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px'
                }}
              >
                No tienes noticias guardadas
              </h3>
              <p 
                className="text-gray-400"
                style={{ 
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px'
                }}
              >
                Toca el ícono de bookmark en cualquier noticia para guardarla aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="flex gap-3 p-3 rounded-lg border border-gray-800 cursor-pointer hover:opacity-80 transition-opacity bg-gray-900"
                >
                  {/* Article Image */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold mb-2 leading-tight line-clamp-2 text-white"
                      style={{ 
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '14px'
                      }}
                    >
                      {article.title}
                    </h4>
                    
                    {/* Article Meta */}
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="font-medium px-2 py-1 rounded-full"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.2) 0%, rgba(15, 76, 42, 0.15) 30%, rgba(2, 10, 5, 0.1) 60%, rgba(0, 0, 0, 0.05) 100%)',
                          color: '#1DB954',
                          fontSize: '14px'
                        }}
                      >
                        {article.label}
                      </span>
                    </div>
                    
                    {/* Time and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock size={12} color="#9CA3AF" />
                        <span 
                          className="text-gray-400"
                          style={{ fontSize: '14px' }}
                        >
                          {formatTimeAgo(article.timeAgo)}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Like Button */}
                        <button
                          onClick={(e) => handleLike(article.id, e)}
                          className="p-1"
                        >
                          <Heart 
                            size={14} 
                            className={isLiked(article.id) ? 'text-red-500 fill-red-500' : ''}
                            color={isLiked(article.id) ? '#EF4444' : '#9CA3AF'}
                          />
                        </button>
                        
                        {/* Remove Bookmark Button */}
                        <button
                          onClick={(e) => handleRemoveBookmark(article.id, e)}
                          className="p-1"
                        >
                          <Bookmark 
                            size={14} 
                            className="fill-current"
                            color="#1DB954"
                          />
                        </button>
                        
                        {/* External Link Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(article.link, '_blank');
                          }}
                          className="p-1"
                        >
                          <ExternalLink 
                            size={14} 
                            color="#9CA3AF"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {bookmarkedArticles.length > 0 && (
          <div 
            className="p-4 border-t border-gray-800 text-center"
          >
            <p 
              className="text-gray-400"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px'
              }}
            >
              {bookmarkedArticles.length} noticia{bookmarkedArticles.length !== 1 ? 's' : ''} guardada{bookmarkedArticles.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksModal;