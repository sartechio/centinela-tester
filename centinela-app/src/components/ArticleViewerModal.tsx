import React from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

interface ArticleViewerModalProps {
  isVisible: boolean;
  onClose: () => void;
  articleUrl: string;
  theme?: 'light' | 'dark';
}

const ArticleViewerModal: React.FC<ArticleViewerModalProps> = ({ 
  isVisible, 
  onClose, 
  articleUrl,
  theme = 'dark'
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Theme colors
  const colors = {
    light: {
      background: '#FFFFFF',
      text: '#374151',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      buttonBg: '#F3F4F6',
      buttonHover: '#E5E7EB',
      errorBg: '#FFFFFF',
      loadingBg: '#FFFFFF'
    },
    dark: {
      background: '#000000',
      text: '#FFFFFF',
      textSecondary: '#E5E5E5',
      border: '#374151',
      buttonBg: '#1F2937',
      buttonHover: '#374151',
      errorBg: '#000000',
      loadingBg: '#000000'
    }
  };

  const currentColors = colors[theme];

  const handleOpenInNewTab = () => {
    window.open(articleUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Reset states when modal opens
  React.useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full h-full transition-all duration-300 ease-out"
        style={{ 
          backgroundColor: currentColors.background,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          paddingTop: `max(24px, env(safe-area-inset-top, 24px))`,
          paddingBottom: `max(0px, env(safe-area-inset-bottom, 0px))`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-end p-4"
          style={{ backgroundColor: currentColors.background }}
        >
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors mr-2"
            style={{ 
              backgroundColor: currentColors.buttonBg,
              ':hover': { backgroundColor: currentColors.buttonHover }
            }}
          >
            <ArrowLeft size={20} color={currentColors.text} />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetry}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: currentColors.buttonBg,
                ':hover': { backgroundColor: currentColors.buttonHover }
              }}
              title="Recargar"
            >
              <RefreshCw size={18} color={currentColors.text} />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: currentColors.buttonBg,
                ':hover': { backgroundColor: currentColors.buttonHover }
              }}
              title="Abrir en nueva pestaña"
            >
              <ExternalLink size={18} color={currentColors.text} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Loading State */}
          {isLoading && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center z-10"
              style={{ backgroundColor: currentColors.loadingBg }}
            >
              <div 
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
                style={{ borderColor: theme === 'light' ? '#10B981' : '#1DB954' }}
              ></div>
              <p style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
                Cargando fuente original...
              </p>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8"
              style={{ backgroundColor: currentColors.errorBg }}
            >
              <div className="text-center">
                <h3 className="font-semibold mb-2" style={{ color: currentColors.text, fontSize: '18px' }}>
                  La nota ya no está disponible en su fuente oficial
                </h3>
                <p className="mb-6" style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
                  Es posible que el artículo haya sido movido, eliminado o que el sitio web tenga restricciones de visualización.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 rounded-lg transition-colors font-medium"
                    style={{ 
                      backgroundColor: currentColors.buttonBg,
                      color: currentColors.text,
                      fontSize: '14px'
                    }}
                    style={{ fontSize: '14px' }}
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-6 py-3 rounded-lg transition-colors font-medium"
                    style={{ 
                      backgroundColor: theme === 'light' ? '#3B82F6' : '#1DB954',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  >
                    Ver en navegador
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Iframe */}
          <iframe
            src={articleUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer-when-downgrade"
            style={{
              display: hasError ? 'none' : 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleViewerModal;