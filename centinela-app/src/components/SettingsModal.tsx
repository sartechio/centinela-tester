import React, { useState } from 'react';
import { ChevronRight, User, Bell, Users, MessageSquare, FileText, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationsModal from './NotificationsModal';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onShowAuth?: () => void;
  onShowProfile?: () => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  theme?: 'light' | 'dark';
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isVisible, 
  onClose, 
  onShowAuth,
  onShowProfile,
  onThemeChange,
  theme: _theme
}) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showNotifications, setShowNotifications] = useState(false);

  const handleAuthAction = () => {
    onClose();
    onShowAuth?.();
  };

  const handleMenuItemClick = (action: string) => {
    console.log(`Settings action: ${action}`);
    // Aquí puedes agregar la lógica para cada acción
    switch (action) {
      case 'appearance':
        // Toggle theme
        onThemeChange?.('dark');
        break;
      case 'notifications':
        setShowNotifications(true);
        break;
      case 'invite':
        // Abrir pantalla de invitación
        break;
      case 'feedback':
        // Abrir formulario de feedback
        break;
      case 'rate':
        // Abrir store para calificar
        break;
      case 'terms':
        // Abrir términos y condiciones
        break;
      case 'privacy':
        // Abrir política de privacidad
        break;
      default:
        break;
    }
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
          <h1 
            className="text-white text-xl font-semibold"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontWeight: 600
            }}
          >
            configuración.
          </h1>
          
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
          {/* Auth Section - Solo si NO está logueado */}
          {!isLoggedIn && (
            <div className="mb-6">
              <div 
                className="relative rounded-2xl p-6 border border-gray-800 overflow-hidden bg-gray-900"
                style={{ 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #581c87 50%, #7c2d12 75%, #1e3a8a 100%)'
                }}
              >
                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(55, 48, 163, 0.4) 25%, rgba(88, 28, 135, 0.4) 50%, rgba(21, 128, 61, 0.4) 75%, rgba(30, 58, 138, 0.4) 100%)'
                  }}
                />
                
                <button
                  onClick={handleAuthAction}
                  className="relative w-full flex items-center justify-between p-4 rounded-xl transition-opacity hover:opacity-80 border border-gray-700"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #581c87 50%, #15803d 75%, #1e3a8a 100%)' }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                      style={{ 
                        background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)'
                      }}
                    >
                      <span className="text-white text-lg font-bold">@</span>
                    </div>
                    <div className="text-left">
                      <h3 
                        className="font-semibold text-white"
                        style={{ fontSize: '14px' }}
                      >
                        Crea tu usuario
                      </h3>
                      <p 
                        className="text-gray-300"
                        style={{ fontSize: '14px' }}
                      >
                        o Inicia sesión
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-4">
            {/* Profile Section - Only show if logged in */}
            {isLoggedIn && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900">
                <button
                  onClick={() => {
                    onClose();
                    onShowProfile?.();
                  }}
                  className="w-full flex items-center justify-between p-4 transition-opacity hover:opacity-80"
                >
                  <div className="flex items-center">
                    <User size={20} color="#E5E5E5" className="mr-4" />
                    <span 
                      className="font-medium text-white"
                      style={{ fontSize: '14px' }}
                    >
                      Mi Perfil
                    </span>
                  </div>
                  <ChevronRight size={20} color="#9CA3AF" />
                </button>
              </div>
            )}

            {/* Main Settings */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900">
              <button
                onClick={() => handleMenuItemClick('notifications')}
                className="w-full flex items-center justify-between p-4 border-b border-gray-800 transition-opacity hover:opacity-80"
              >
                <div className="flex items-center">
                  <Bell size={20} color="#E5E5E5" className="mr-4" />
                  <span 
                    className="font-medium text-white"
                    style={{ fontSize: '14px' }}
                  >
                    Notificaciones
                  </span>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </button>

              <button
                onClick={() => handleMenuItemClick('invite')}
                className="w-full flex items-center justify-between p-4 transition-opacity hover:opacity-80"
              >
                <div className="flex items-center">
                  <Users size={20} color="#E5E5E5" className="mr-4" />
                  <span 
                    className="font-medium text-white"
                    style={{ fontSize: '14px' }}
                  >
                    Invitar amigos
                  </span>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </button>
            </div>

            {/* Feedback Section */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900">
              <button
                onClick={() => handleMenuItemClick('feedback')}
                className="w-full flex items-center justify-between p-4 border-b border-gray-800 transition-opacity hover:opacity-80"
              >
                <div className="flex items-center">
                  <MessageSquare size={20} color="#E5E5E5" className="mr-4" />
                  <span 
                    className="font-medium text-white"
                    style={{ fontSize: '14px' }}
                  >
                    Enviar feedback
                  </span>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </button>
            </div>

            {/* Legal Section */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900">
              <button
                onClick={() => handleMenuItemClick('terms')}
                className="w-full flex items-center justify-between p-4 border-b border-gray-800 transition-opacity hover:opacity-80"
              >
                <div className="flex items-center">
                  <FileText size={20} color="#E5E5E5" className="mr-4" />
                  <span 
                    className="font-medium text-white"
                    style={{ fontSize: '14px' }}
                  >
                    Términos y Condiciones
                  </span>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </button>

              <button
                onClick={() => handleMenuItemClick('privacy')}
                className="w-full flex items-center justify-between p-4 transition-opacity hover:opacity-80"
              >
                <div className="flex items-center">
                  <Shield size={20} color="#E5E5E5" className="mr-4" />
                  <span 
                    className="font-medium text-white"
                    style={{ fontSize: '14px' }}
                  >
                    Política de Privacidad
                  </span>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p 
              className="mb-1 text-gray-500"
              style={{ fontSize: '14px' }}
            >
              Acerca de
            </p>
            <p 
              className="font-mono text-gray-400"
              style={{ fontSize: '14px' }}
            >
              Versión 0.0.1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;