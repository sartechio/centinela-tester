import React, { useState } from 'react';
import { MessageCircle, Instagram } from 'lucide-react';

interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  article: {
    id: string;
    title: string;
    content: string;
    link: string;
  } | null;
  theme?: 'light' | 'dark';
}

const ShareModal: React.FC<ShareModalProps> = ({ isVisible, onClose, article, theme: _theme }) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const handleShare = async (platform: string) => {
    if (!article) return;

    const shareText = `${article.title}`;
    const shareUrl = article.link;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopyState('copied');
          setTimeout(() => setCopyState('idle'), 2000);
        } catch (error) {
          // Fallback for older browsers
          try {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 2000);
          } catch (fallbackError) {
            alert('No se pudo copiar el enlace. Intenta manualmente.');
          }
        }
        return; // Don't close modal
      
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(whatsappUrl, '_blank');
        break;
      
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
        break;
      
      case 'instagram':
        // Instagram no permite compartir links directamente, copiamos al portapapeles
        try {
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          alert('Texto copiado al portapapeles. Pégalo en tu historia de Instagram.');
        } catch (error) {
          alert('No se pudo copiar el texto. Intenta manualmente.');
        }
        break;
    }
    
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible || !article) return null;

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
            compartir.
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6" style={{ maxHeight: '70vh' }}>
          {/* Share Options */}
          <div className="space-y-3">
            {/* Copy Link */}
            <button
              onClick={() => handleShare('copy')}
              className="w-full flex items-center p-4 rounded-xl border border-gray-800 transition-opacity hover:opacity-80 bg-gray-900"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-4">
                {copyState === 'copied' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base text-white">
                  {copyState === 'copied' ? 'Enlace copiado' : 'Copiar enlace'}
                </h3>
                <p className="text-gray-400" style={{ fontSize: '14px' }}>
                  {copyState === 'copied' ? 'Listo para pegar' : 'Copiar URL de la noticia'}
                </p>
              </div>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center p-4 rounded-xl border border-gray-800 transition-opacity hover:opacity-80 bg-gray-900"
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base text-white">
                  X
                </h3>
                <p className="text-gray-400" style={{ fontSize: '14px' }}>
                  Compartir en X
                </p>
              </div>
            </button>

            {/* Instagram */}
            <button
              onClick={() => handleShare('instagram')}
              className="w-full flex items-center p-4 rounded-xl border border-gray-800 transition-opacity hover:opacity-80 bg-gray-900"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mr-4">
                <Instagram size={24} color="white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base text-white">
                  Instagram
                </h3>
                <p className="text-gray-400" style={{ fontSize: '14px' }}>
                  Copiar para historia
                </p>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full flex items-center p-4 rounded-xl border border-gray-800 transition-opacity hover:opacity-80 bg-gray-900"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <MessageCircle size={24} color="white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base text-white">
                  WhatsApp
                </h3>
                <p className="text-gray-400" style={{ fontSize: '14px' }}>
                  Enviar por WhatsApp
                </p>
              </div>
            </button>
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

export default ShareModal;