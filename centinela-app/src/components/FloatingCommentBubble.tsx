import React from 'react';
import { Comment } from '../hooks/useComments';

interface FloatingCommentBubbleProps {
  comment: Comment;
}

const FloatingCommentBubble: React.FC<FloatingCommentBubbleProps> = ({ 
  comment
}) => {
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
      className="flex items-center gap-2 max-w-64"
      style={{
        animation: 'float 4s ease-in-out infinite',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Avatar - positioned to overlap with bubble */}
      <div 
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 relative z-10"
        style={{ 
          background: comment.author_avatar 
            ? `url("${comment.author_avatar}")` 
            : 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
        }}
      >
        {!comment.author_avatar && getInitials(comment.author_name || 'U')}
      </div>
      
      {/* Comment Bubble */}
      <div 
        className="relative backdrop-blur-md rounded-full px-2.5 py-1.5 max-w-44"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // White background
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          marginLeft: '-4px' // Overlap with avatar
        }}
      >
        {/* Username and Comment in one line */}
        <p 
          className="text-black leading-tight"
          style={{ 
            fontSize: '10px',
            lineHeight: '1.2'
          }}
        >
          <span className="font-bold">
            {comment.author_name?.replace('@', '') || 'usuario'}
          </span>
          {' '}
          <span className="font-normal">
            {comment.content}
          </span>
        </p>
      </div>
    </div>
  )
}

export default FloatingCommentBubble;