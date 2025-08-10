import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NotificationsModalProps {
  isVisible: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
  breakingNewsEnabled?: boolean;
  onBreakingNewsChange?: (value: boolean) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ 
  isVisible, 
  onClose, 
  theme = 'dark',
  breakingNewsEnabled = false,
  onBreakingNewsChange
}) => {
  const [breakingNews, setBreakingNews] = useState(false);
  const [commentReplies, setCommentReplies] = useState(true);

  // Sync with parent state
  useEffect(() => {
    setBreakingNews(breakingNewsEnabled);
  }, [breakingNewsEnabled]);

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
        className={`w-full max-w-md bg-black rounded-2xl transition-all duration-300 ease-out ${
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
            notificaciones.
          </h2>
          
          {/* Close button */}
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
          <div className="space-y-4">
            {/* Breaking News Notification */}
            <div 
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 
                    className="text-white text-lg font-semibold mb-2"
                    style={{ 
                      fontFamily: 'Space Grotesk, Inter, sans-serif',
                      fontSize: '18px'
                    }}
                  >
                    Sé el primero en saber
                  </h3>
                  <p 
                    className="text-gray-400 leading-relaxed"
                    style={{ 
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  >
                    No te pierdas las noticias de último momento y las historias más importantes que están sucediendo ahora mismo.
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => {
                    const newValue = !breakingNews;
                    setBreakingNews(newValue);
                    onBreakingNewsChange?.(newValue);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    breakingNews ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      breakingNews ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Comment Replies Notification */}
            <div 
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 
                    className="text-white text-lg font-semibold mb-2"
                    style={{ 
                      fontFamily: 'Space Grotesk, Inter, sans-serif',
                      fontSize: '18px'
                    }}
                  >
                    Nunca te pierdas una respuesta
                  </h3>
                  <p 
                    className="text-gray-400 leading-relaxed"
                    style={{ 
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                  >
                    Recibe notificaciones cuando alguien responda a tus comentarios.
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => setCommentReplies(!commentReplies)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    commentReplies ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      commentReplies ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <div className="mt-8 px-4">
            <p 
              className="text-gray-500 text-center leading-relaxed"
              style={{ 
                fontSize: '13px',
                lineHeight: '1.4'
              }}
            >
              Las notificaciones te ayudan a mantenerte al día con las noticias más importantes y la actividad en tus comentarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;