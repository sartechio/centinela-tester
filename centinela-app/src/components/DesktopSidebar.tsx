import React, { useState, useEffect } from 'react';
import { Home, Bell, Bookmark, TrendingUp, Settings, User, Check, Plus, Sun, Moon, ChevronRight, X, LogOut, DollarSign, Bitcoin, Cloud, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DesktopSidebarProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onShowAuth: () => void;
  onShowBookmarks: () => void;
  onShowSettings: () => void;
  onShowProfile: () => void;
  onShowNotifications: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  theme,
  onThemeChange,
  onShowAuth,
  onShowBookmarks,
  onShowSettings,
  onShowProfile,
  onShowNotifications,
}) => {
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  // Theme colors
  const colors = {
    light: {
      sidebarBg: '#FFFFFF',
      panelBg: '#FAFAFA',
      border: '#E5E7EB',
      text: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      buttonBg: '#F9FAFB',
      buttonHover: '#F3F4F6',
      buttonActive: '#E5E7EB',
      categorySelected: '#10B981',
      categorySelectedBg: 'rgba(16, 185, 129, 0.1)',
      categorySelectedBorder: 'rgba(16, 185, 129, 0.3)',
      categoryUnselected: '#6B7280',
      categoryUnselectedBg: '#F9FAFB',
      categoryUnselectedBorder: '#E5E7EB',
      gradientPrimary: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 25%, #7C3AED 50%, #059669 75%, #3B82F6 100%)',
    },
    dark: {
      sidebarBg: '#111827',
      panelBg: '#1F2937',
      border: '#374151',
      text: '#FFFFFF',
      textSecondary: '#E5E5E5',
      textTertiary: '#9CA3AF',
      buttonBg: '#374151',
      buttonHover: '#4B5563',
      buttonActive: '#6B7280',
      categorySelected: '#10B981',
      categorySelectedBg: 'rgba(16, 185, 129, 0.15)',
      categorySelectedBorder: 'rgba(16, 185, 129, 0.3)',
      categoryUnselected: '#9CA3AF',
      categoryUnselectedBg: 'rgba(0, 0, 0, 0.1)',
      categoryUnselectedBorder: 'transparent',
      gradientPrimary: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #581c87 50%, #15803d 75%, #1e3a8a 100%)',
    }
  };

  const currentColors = colors[theme];

  const menuItems = [
    { 
      id: 'home', 
      label: 'Inicio', 
      icon: Home, 
      active: activeSection === null,
      onClick: () => {
        setActiveSection(null);
        setExpandedPanel(null);
      }
    },
    { 
      id: 'notifications', 
      label: 'Notificaciones', 
      icon: Bell,
      active: activeSection === 'notifications',
      onClick: () => {
        setActiveSection(null);
        setExpandedPanel(null);
        onShowNotifications();
      }
    },
    { 
      id: 'bookmarks', 
      label: 'Guardados', 
      icon: Bookmark, 
      active: activeSection === 'bookmarks',
      onClick: () => {
        setActiveSection(null);
        setExpandedPanel(null);
        onShowBookmarks();
      }
    },
  ];

  // Weather and financial data
  const weatherData = {
    location: 'Buenos Aires, AR',
    temperature: '11°C',
    condition: 'Soleado',
    forecast: [
      { day: 'Sáb', temp: '12°', condition: 'sunny' },
      { day: 'Dom', temp: '10°', condition: 'cloudy' },
      { day: 'Lun', temp: '18°', condition: 'sunny' },
      { day: 'Mar', temp: '19°', condition: 'rainy' },
      { day: 'Mié', temp: '15°', condition: 'cloudy' },
    ]
  };

  const financialData = [
    { name: 'Dólar Oficial', value: '$ 1,299 → $ 1,337', trend: 'up', color: '#10B981' },
    { name: 'Dólar Blue', value: '$ 1,325 → $ 1,325', trend: 'neutral', color: '#3B82F6' },
    { name: 'Bitcoin USD', value: '$116,815.00', change: '+6.01%', trend: 'up', color: '#F97316' },
  ];

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  const handlePanelToggle = (panelId: string) => {
    if (expandedPanel === panelId) {
      setExpandedPanel(null);
    } else {
      setExpandedPanel(panelId);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Sidebar - Narrow */}
      <div 
        className="w-16 h-full border-r flex flex-col items-center py-6"
        style={{
          backgroundColor: currentColors.sidebarBg,
          borderColor: currentColors.border,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/centinela-logo.png"
            alt="Centinela"
            className="w-8 h-8 rounded-full"
          />
        </div>

        {/* Menu Items */}
        <div className="flex-1 flex flex-col gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 group relative`}
              style={{
                backgroundColor: item.active
                  ? currentColors.categorySelectedBg 
                  : 'transparent',
                border: item.active
                  ? `1px solid ${currentColors.categorySelectedBorder}` 
                  : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = currentColors.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={item.label}
            >
              <item.icon 
                size={18} 
                style={{ 
                  color: item.active
                    ? currentColors.categorySelected 
                    : currentColors.textTertiary 
                }}
                className={`transition-transform duration-200 ${
                  item.active ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              
              {/* Tooltip */}
              <div 
                className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{
                  backgroundColor: currentColors.panelBg,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                {item.label}
              </div>
            </button>
          ))}
        </div>

        {/* User Section */}
        <div className="mb-4">
          {!isLoggedIn ? (
            <button
              onClick={onShowAuth}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 group relative"
              style={{ 
                background: currentColors.gradientPrimary,
              }}
              title="Iniciar sesión"
            >
              <span className="text-white text-lg font-bold">@</span>
              
              {/* Tooltip */}
              <div 
                className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{
                  backgroundColor: currentColors.panelBg,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                Iniciar sesión
              </div>
            </button>
          ) : (
            <button
              onClick={onShowProfile}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 group relative"
              style={{ 
                background: user?.user_metadata?.avatar_url 
                  ? `url("${user.user_metadata.avatar_url}")` 
                  : 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              title="Mi perfil"
            >
              {!user?.user_metadata?.avatar_url && (
                <span className="text-white text-sm font-bold">
                  {user?.user_metadata?.full_name 
                    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : user?.email?.slice(0, 2).toUpperCase() || 'U'
                  }
                </span>
              )}
              
              {/* Tooltip */}
              <div 
                className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{
                  backgroundColor: currentColors.panelBg,
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                Mi perfil
              </div>
            </button>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3">
          {/* Settings */}
          <button
            onClick={onShowSettings}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 group relative"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Configuración"
          >
            <Settings 
              size={18} 
              style={{ color: currentColors.textTertiary }}
              className="transition-transform duration-200 group-hover:rotate-90" 
            />
            
            {/* Tooltip */}
            <div 
              className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
              style={{
                backgroundColor: currentColors.panelBg,
                color: currentColors.text,
                border: `1px solid ${currentColors.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Configuración
            </div>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 group relative"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'light' ? (
              <Moon size={18} style={{ color: currentColors.textTertiary }} />
            ) : (
              <Sun size={18} style={{ color: currentColors.textTertiary }} />
            )}
            
            {/* Tooltip */}
            <div 
              className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
              style={{
                backgroundColor: currentColors.panelBg,
                color: currentColors.text,
                border: `1px solid ${currentColors.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            </div>
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      {expandedPanel && (
        <div 
          className="w-80 h-full border-r flex flex-col transition-all duration-300 ease-out"
          style={{
            backgroundColor: currentColors.panelBg,
            borderColor: currentColors.border,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          {/* Panel Header */}
          <div 
            className="p-6 border-b flex items-center justify-between"
            style={{ borderColor: currentColors.border }}
          >
            <h2 
              className="text-xl font-bold"
              style={{ 
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                color: currentColors.text
              }}
            >
              {expandedPanel === 'notifications' && 'Notificaciones'}
              {expandedPanel === 'bookmarks' && 'Guardados'}
            </h2>
            <button
              onClick={() => setExpandedPanel(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: currentColors.buttonBg }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentColors.buttonHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = currentColors.buttonBg;
              }}
            >
              <X size={16} style={{ color: currentColors.textTertiary }} />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Weather Section */}
            <div className="mb-6">
              <h3 
                className="font-semibold text-sm mb-3 flex items-center"
                style={{ color: currentColors.text }}
              >
                <Cloud size={16} className="mr-2" style={{ color: currentColors.textTertiary }} />
                Clima Local
              </h3>
              
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: currentColors.categoryUnselectedBg,
                  borderColor: currentColors.border
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: currentColors.text }}>
                      {weatherData.temperature}
                    </p>
                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                      {weatherData.location}
                    </p>
                  </div>
                  <div className="text-2xl">☀️</div>
                </div>
                
                {/* 5-day forecast */}
                <div className="flex justify-between">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="text-center">
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                        {day.day}
                      </p>
                      <div className="my-1 text-sm">
                        {day.condition === 'sunny' && '☀️'}
                        {day.condition === 'cloudy' && '☁️'}
                        {day.condition === 'rainy' && '🌧️'}
                      </div>
                      <p className="text-xs" style={{ color: currentColors.text }}>
                        {day.temp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Financial Data Section */}
            <div className="mb-6">
              <h3 
                className="font-semibold text-sm mb-3 flex items-center"
                style={{ color: currentColors.text }}
              >
                <DollarSign size={16} className="mr-2" style={{ color: currentColors.textTertiary }} />
                Indicadores
              </h3>
              
              <div className="space-y-3">
                {financialData.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: currentColors.categoryUnselectedBg,
                      borderColor: currentColors.border
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {item.name.includes('Bitcoin') ? (
                          <Bitcoin size={14} className="mr-2" style={{ color: item.color }} />
                        ) : (
                          <DollarSign size={14} className="mr-2" style={{ color: item.color }} />
                        )}
                        <span className="font-medium text-sm" style={{ color: currentColors.text }}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: item.color }}>
                          {item.value}
                        </p>
                        {item.change && (
                          <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                            {item.change}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {expandedPanel === 'notifications' && (
              <div className="text-center py-8">
                <Bell size={48} className="mx-auto mb-4 opacity-50" style={{ color: currentColors.textTertiary }} />
                <h3 className="font-semibold mb-2" style={{ color: currentColors.text, fontSize: '16px' }}>
                  Notificaciones
                </h3>
                <p className="mb-4" style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
                  Configura tus preferencias de notificación
                </p>
                <button
                  onClick={() => {
                    setExpandedPanel(null);
                    setActiveSection(null);
                    onShowNotifications();
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: currentColors.categorySelected,
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  Configurar notificaciones
                </button>
              </div>
            )}

            {expandedPanel === 'bookmarks' && (
              <div className="text-center py-8">
                <Bookmark size={48} className="mx-auto mb-4 opacity-50" style={{ color: currentColors.textTertiary }} />
                <h3 className="font-semibold mb-2" style={{ color: currentColors.text, fontSize: '16px' }}>
                  Noticias Guardadas
                </h3>
                <p className="mb-4" style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
                  Accede a todas tus noticias guardadas
                </p>
                <button
                  onClick={() => {
                    setExpandedPanel(null);
                    setActiveSection(null);
                    onShowBookmarks();
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: currentColors.categorySelected,
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                >
                  Ver guardados
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopSidebar;