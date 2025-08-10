import React from 'react';
import { Heart } from 'lucide-react';
import { Comment } from '../hooks/useComments';

interface CommentBubbleProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  theme: 'light' | 'dark';
  formatTimeAgo: (dateString: string) => string;
}

const CommentBubble: React.FC<CommentBubbleProps> = ({ 
  comment, 
  onLike, 
  theme,
  formatTimeAgo 
}) => {
  const colors = {
    light: {
      background: 'rgba(255, 255, 255, 0.95)',
      text: '#000000',
      textSecondary: '#374151',
      border: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.85)',
      text: '#FFFFFF',
      textSecondary: '#E5E5E5',
      border: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const currentColors = colors[theme];

  // Generate initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className="backdrop-blur-md rounded-2xl border p-4 mb-3 max-w-sm"
      style={{ 
        backgroundColor: currentColors.background,
        borderColor: currentColors.border
      }}
    >
      {/* Comment Content */}
      <p 
        className="text-sm leading-relaxed mb-3"
        style={{ color: currentColors.text }}
      >
        {comment.content}
      </p>

      {/* Author Info and Actions */}
      <div className="flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center">
          {/* Avatar */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-xs font-bold"
            style={{ 
              background: comment.author_avatar 
                ? `url(${comment.author_avatar})` 
                : 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#FFFFFF'
            }}
          >
            {!comment.author_avatar && getInitials(comment.author_name || 'U')}
          </div>
          
          {/* Name and Time */}
          <div>
            <p 
              className="text-xs font-semibold"
              style={{ color: currentColors.text }}
            >
              @{comment.author_name?.replace('@', '') || 'usuario'}
            </p>
            <p 
              className="text-xs"
              style={{ color: currentColors.textSecondary }}
            >
              {formatTimeAgo(comment.created_at)}
            </p>
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={() => onLike(comment.id)}
          className="flex items-center gap-1 px-2 py-1 rounded-full transition-colors hover:bg-black/10"
        >
          <Heart 
            size={14} 
            className={comment.user_has_liked ? 'text-red-500 fill-red-500' : ''}
            style={{ 
              color: comment.user_has_liked ? '#EF4444' : currentColors.textSecondary 
            }}
          />
          {(comment.likes_count || 0) > 0 && (
            <span 
              className="text-xs font-medium"
              style={{ color: currentColors.textSecondary }}
            >
              {comment.likes_count}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CommentBubble;