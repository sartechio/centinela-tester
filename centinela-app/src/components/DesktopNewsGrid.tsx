import React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Bookmark, Share, ExternalLink, Clock, Sparkles } from 'lucide-react';
import type { NewsArticle } from '../hooks/useArticles';

interface DesktopNewsGridProps {
  articles: NewsArticle[];
  theme: 'light' | 'dark';
  isLiked: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (article: NewsArticle) => void;
  onComment: (id: string) => void;
  onOpenArticle: (url: string) => void;
  formatCount: (count: number) => string;
  loadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

const DesktopNewsGrid: React.FC<DesktopNewsGridProps> = ({
  articles,
  theme,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onShare,
  onComment,
  onOpenArticle,
  formatCount,
  loadMore,
  hasMore,
  loadingMore
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (loadMoreRef.current && hasMore && !loadingMore) {
      const rect = loadMoreRef.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 200) { // Load when 200px before visible
        loadMore();
      }
    }
  }, [loadMore, hasMore, loadingMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Theme colors
  const colors = {
    light: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      text: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      buttonBg: '#F9FAFB',
      buttonHover: '#F3F4F6',
    },
    dark: {
      background: '#111827',
      border: '#374151',
      text: '#FFFFFF',
      textSecondary: '#E5E5E5',
      textTertiary: '#9CA3AF',
      buttonBg: 'rgba(0, 0, 0, 0.4)',
      buttonHover: 'rgba(0, 0, 0, 0.6)',
    }
  };

  const currentColors = colors[theme];

  // Find the breaking news article (should be first)
  const breakingNews = articles.find(article => article.label === 'ÚLTIMO MOMENTO');
  const otherArticles = articles.filter(article => article.label !== 'ÚLTIMO MOMENTO');

  // Get category-specific styling
  const getCategoryStyle = (label: string): string => {
    const baseClasses = 'text-white font-medium shadow-sm';
    
    switch (label) {
      case 'ÚLTIMO MOMENTO':
        return `${baseClasses} bg-red-600/95 border-2 border-red-400 shadow-red-500/50 font-bold shadow-lg`;
      case 'MILEI':
        return `${baseClasses} bg-yellow-600/40 border border-yellow-400/30`;
      case 'ECONOMÍA':
        return `${baseClasses} bg-green-600/40 border border-green-400/30`;
      case 'TECNOLOGÍA':
        return `${baseClasses} bg-purple-600/40 border border-purple-400/30`;
      case 'DEPORTES':
        return `${baseClasses} bg-blue-600/40 border border-blue-400/30`;
      case 'INTERNACIONAL':
        return `${baseClasses} bg-indigo-600/40 border border-indigo-400/30`;
      case 'CRIPTO':
        return `${baseClasses} bg-orange-600/40 border border-orange-400/30`;
      case 'POLÍTICA':
        return `${baseClasses} bg-slate-600/40 border border-slate-400/30`;
      case 'CULTURA':
        return `${baseClasses} bg-pink-600/40 border border-pink-400/30`;
      case 'SALUD':
        return `${baseClasses} bg-teal-600/40 border border-teal-400/30`;
      case 'ESPECTÁCULOS':
        return `${baseClasses} bg-rose-600/40 border border-rose-400/30`;
      case 'SOCIEDAD':
        return `${baseClasses} bg-amber-600/40 border border-amber-400/30`;
      case 'SEGURIDAD':
        return `${baseClasses} bg-red-700/40 border border-red-500/30`;
      default:
        return `${baseClasses} bg-gray-600/40 border border-gray-400/30`;
    }
  };

  const ActionButtons: React.FC<{ article: NewsArticle; size?: 'small' | 'normal' }> = ({ 
    article, 
    size = 'normal' 
  }) => {
    const iconSize = size === 'small' ? 14 : 16;
    const currentLikesCount = article.likes + (isLiked(article.id) ? 1 : 0);

    return (
      <div className="flex items-center gap-3">
        {/* Like */}
        <button 
          onClick={() => onLike(article.id)}
          className="flex items-center gap-1 transition-colors hover:text-red-400"
        >
          <Heart 
            size={iconSize} 
            className={`${isLiked(article.id) ? 'text-red-400 fill-red-400' : ''}`}
            style={{ color: isLiked(article.id) ? '#F87171' : currentColors.textTertiary }}
          />
          <span 
            className="text-sm font-medium"
            style={{ color: currentColors.textSecondary }}
          >
            {formatCount(currentLikesCount)}
          </span>
        </button>

        {/* Comments */}
        <button 
          onClick={() => onComment(article.id)}
          className="flex items-center gap-1 transition-colors hover:text-blue-400"
        >
          <MessageCircle size={iconSize} style={{ color: currentColors.textTertiary }} />
          <span 
            className="text-sm font-medium"
            style={{ color: currentColors.textSecondary }}
          >
            {formatCount(article.comments)}
          </span>
        </button>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark(article.id)}
          className="transition-colors hover:text-yellow-400"
        >
          <Bookmark 
            size={iconSize} 
            className={`${isBookmarked(article.id) ? 'text-yellow-400 fill-yellow-400' : ''}`}
            style={{ color: isBookmarked(article.id) ? '#FBBF24' : currentColors.textTertiary }}
          />
        </button>

        {/* Share */}
        <button
          onClick={() => onShare(article)}
          className="transition-colors hover:text-green-400"
        >
          <Share size={iconSize} style={{ color: currentColors.textTertiary }} />
        </button>

        {/* External Link */}
        <button
          onClick={() => onOpenArticle(article.link)}
          className="transition-colors hover:text-green-400"
        >
          <ExternalLink size={iconSize} style={{ color: currentColors.textTertiary }} />
        </button>
      </div>
    );
  };

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: currentColors.textSecondary }}>No hay noticias disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-none">
      {/* Breaking News Hero */}
      {breakingNews && (
        <div 
          className="rounded-2xl border overflow-hidden transition-colors mb-12"
          style={{
            backgroundColor: currentColors.background,
            borderColor: currentColors.border,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          {/* Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12">
            {/* Left Column - Content */}
            <div className="flex flex-col justify-center">
              {/* Category Tag - Mantener pill para ÚLTIMO MOMENTO */}
              <span 
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold mb-8 w-fit transition-all duration-300 ${getCategoryStyle(breakingNews.label)} animate-pulse`}
                style={{ fontSize: '12px' }}
              >
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                {breakingNews.label}
              </span>

              {/* Title */}
              <h1 
                className="font-bold leading-tight mb-8"
                style={{ 
                  fontFamily: 'Space Grotesk, Inter, sans-serif',
                  color: currentColors.text,
                  fontSize: '56px',
                  fontWeight: 800,
                  lineHeight: '1.1'
                }}
              >
                {breakingNews.title}
              </h1>
              
              {/* Content */}
              <p 
                className="leading-relaxed mb-10 line-clamp-3"
                style={{ 
                  color: currentColors.textSecondary,
                  fontSize: '18px',
                  lineHeight: '1.7',
                  fontWeight: 400
                }}
              >
                {breakingNews.content}
              </p>

              {/* Meta Info */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3" style={{ color: currentColors.textSecondary }}>
                  <div className="flex items-center">
                    <Clock size={14} />
                    <span className="ml-1" style={{ fontSize: '14px', fontWeight: 400 }}>
                      Publicado {breakingNews.timeAgo}
                    </span>
                  </div>
                </div>

                <ActionButtons article={breakingNews} />
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden">
                <img
                  src={breakingNews.image}
                  alt={breakingNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary News Grid */}
      {otherArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {otherArticles.slice(0, 8).map((article) => (
            <div
              key={article.id}
              className="rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] duration-200"
              style={{
                backgroundColor: currentColors.background,
                borderColor: currentColors.border,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Category Tag */}
                <div className="absolute top-3 left-3">
                  <span 
                    className={`px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${getCategoryStyle(article.label)}`}
                    style={{ fontSize: '11px' }}
                  >
                    {article.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 
                  className="font-bold leading-tight mb-3 line-clamp-2"
                  style={{ 
                    fontFamily: 'Space Grotesk, Inter, sans-serif',
                    color: currentColors.text,
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '1.3'
                  }}
                >
                  {article.title}
                </h3>

                <p 
                  className="leading-relaxed mb-4 line-clamp-2"
                  style={{ 
                    color: currentColors.textSecondary,
                    fontSize: '13px',
                    lineHeight: '1.5'
                  }}
                >
                  {article.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span style={{ 
                      color: currentColors.textSecondary,
                      fontSize: '12px'
                    }}>
                      {article.timeAgo}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t" style={{ borderColor: currentColors.border }}>
                  <ActionButtons article={article} size="small" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remaining Articles List */}
      {otherArticles.length > 8 && (
        <div className="space-y-8">
          <h2 
            className="font-bold mb-6"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              color: currentColors.text,
              fontSize: '22px',
              fontWeight: 600
            }}
          >
            Más noticias
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherArticles.slice(8).map((article) => (
              <div
                key={article.id}
                className="flex gap-4 p-5 rounded-2xl border transition-all hover:shadow-md hover:scale-[1.005] duration-200"
                style={{
                  backgroundColor: currentColors.background,
                  borderColor: currentColors.border,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className={`px-2.5 py-0.5 rounded-full font-medium ${getCategoryStyle(article.label)}`}
                      style={{ fontSize: '11px' }}
                    >
                      {article.label}
                    </span>
                  </div>
                  
                  <h4 
                    className="font-bold leading-tight mb-3 line-clamp-2"
                    style={{ 
                      fontFamily: 'Space Grotesk, Inter, sans-serif',
                      color: currentColors.text,
                      fontSize: '15px',
                      fontWeight: 600,
                      lineHeight: '1.3'
                    }}
                  >
                    {article.title}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span style={{ 
                        color: currentColors.textSecondary,
                        fontSize: '12px'
                      }}>
                        {article.timeAgo}
                      </span>
                    </div>
                    
                    <ActionButtons article={article} size="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-12">
        {loadingMore && (
          <div className="flex justify-center">
            <div 
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: theme === 'light' ? '#10B981' : '#1DB954' }}
            ></div>
          </div>
        )}
        {!hasMore && articles.length > 0 && (
          <div className="text-center">
            <p style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
              Has visto todas las noticias disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNewsGrid;