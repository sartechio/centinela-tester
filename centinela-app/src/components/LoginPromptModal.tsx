import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';

interface LoginPromptModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLogin: () => void;
  theme?: 'light' | 'dark';
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ 
  isVisible, 
  onClose, 
  onLogin,
  theme = 'dark'
}) => {
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
        className={`bg-black rounded-3xl transition-all duration-300 ease-out transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ 
          maxWidth: '320px',
          width: '100%',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon with gradient background */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
              boxShadow: '0 8px 24px rgba(29, 185, 84, 0.3)'
            }}
          >
            {/* Shine effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.2) 45%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 55%, transparent 100%)',
                transform: 'translateX(-100%)',
                animation: 'shine 2s ease-in-out infinite'
              }}
            />
            <Bookmark size={24} className="text-white fill-white relative z-10" />
            <Sparkles 
              size={12} 
              className="text-white absolute -top-1 -right-1 animate-pulse" 
            />
          </div>

          {/* Title */}
          <h2 
            className="text-white text-xl font-normal mb-3"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 400,
              lineHeight: '1.3'
            }}
          >
            guarda tus noticias favoritas.
          </h2>

          {/* Description */}
          <p 
            className="text-gray-400 mb-8 leading-relaxed"
            style={{ 
              fontSize: '15px',
              lineHeight: '1.5'
            }}
          >
            Inicia sesión para guardar esta noticia y acceder a ella desde cualquier dispositivo.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Primary Button */}
            <button
              onClick={onLogin}
              className="w-full py-4 px-6 rounded-2xl font-medium text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                fontSize: '15px',
                boxShadow: '0 4px 16px rgba(29, 185, 84, 0.2)'
              }}
            >
              Iniciar sesión ✨
            </button>

            {/* Secondary Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl font-medium transition-all hover:bg-gray-800"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#9CA3AF',
                fontSize: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              Ahora no
            </button>
          </div>
        </div>

        {/* Subtle bottom glow */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #1DB954 50%, transparent 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default LoginPromptModal;