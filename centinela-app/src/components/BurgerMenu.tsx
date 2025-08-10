import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Settings, 
  Bookmark, 
  Sun, 
  Moon, 
  Search, 
  Check, 
  Plus 
} from 'lucide-react';

interface BurgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onThemeChange?: (_theme: 'light' | 'dark') => void;
  onShowAuth?: () => void;
  onShowBookmarks?: () => void;
  onShowSettings?: () => void;
  onShowProfile?: () => void;
  onCategoriesChange?: (_categories: string[]) => void;
}

// Menu-specific theme colors
const menuLightColors = {
  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 25%, #F1F3F4 50%, #E8EAED 75%, #FFFFFF 100%)',
  surface: '#F8F9FA',
  text: '#1F2937',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  primary: '#1F2937',
  border: '#E5E7EB',
};

const menuDarkColors = {
  background: 'linear-gradient(135deg, #000000 0%, #010603 25%, #020D08 50%, #010603 75%, #000000 100%)',
  surface: '#121212',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textTertiary: '#9CA3AF',
  primary: '#1DB954',
  border: '#282828',
};

const BurgerMenu: React.FC<BurgerMenuProps> = ({ isVisible, onClose, onThemeChange, onShowAuth, onShowBookmarks, onShowSettings, onShowProfile, onCategoriesChange }) => {
  const [menuTheme, setMenuTheme] = useState<'light' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Mock articles for search functionality
  const articles: any[] = [];
  
  // Get auth state
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;
  
  const [searchResults, setSearchResults] = useState(articles);

  const menuColors = menuTheme === 'light' ? menuLightColors : menuDarkColors;
  const colors = menuColors;

  const toggleMenuTheme = () => {
    const newTheme = menuTheme === 'light' ? 'dark' : 'light';
    setMenuTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const categories = [
    { id: 'tecnologia', name: 'Tecnología', emoji: '💻' },
    { id: 'politica', name: 'Política', emoji: '🏛️' },
    { id: 'milei', name: 'Milei', emoji: '🇦🇷' },
    { id: 'elecciones2025', name: 'Elecciones2025', emoji: '🗳️' },
    { id: 'economia', name: 'Economía', emoji: '📊' },
    { id: 'cripto', name: 'Cripto', emoji: '₿' },
    { id: 'cultura', name: 'Cultura', emoji: '🎭' },
    { id: 'espectaculos', name: 'Espectáculos', emoji: '🎬' },
    { id: 'deportes', name: 'Deportes', emoji: '⚽' },
    { id: 'salud', name: 'Salud', emoji: '🏥' },
    { id: 'sociedad', name: 'Sociedad', emoji: '👥' },
    { id: 'seguridad', name: 'Seguridad', emoji: '🚔' },
    { id: 'internacional', name: 'Internacional', emoji: '🌍' },
  ];

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName];
      
      // Notify parent component of category changes
      onCategoriesChange?.(newCategories);
      
      return newCategories;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setShowSearchResults(false);
      setSearchResults(articles);
    } else {
      setShowSearchResults(true);
      const filtered = articles.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.label.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const handleBackToMenu = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults(articles);
  };

  // Update search results when articles change
  React.useEffect(() => {
    if (!showSearchResults) {
      setSearchResults(articles);
    }
  }, [articles, showSearchResults]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - only covers right side */}
      <div 
        className="absolute top-0 right-0 w-[calc(100%-320px)] h-full bg-black/50"
        style={{ pointerEvents: 'auto' }}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className={`absolute top-0 left-0 w-80 h-full pb-4 transition-transform duration-300 ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          background: colors.background,
          pointerEvents: 'auto',
          paddingTop: `max(32px, env(safe-area-inset-top, 32px))`,
          paddingLeft: `env(safe-area-inset-left, 0px)`,
          paddingBottom: `max(16px, env(safe-area-inset-bottom, 16px))`
        }}
      >
        <div className="flex flex-col overflow-y-auto px-1">
          {/* Header with User Profile */}
          <div 
            className="flex justify-between items-center px-4 pb-2 mb-2"
            style={{
              marginTop: `max(8px, env(safe-area-inset-top, 8px) * 0.2)`
            }}
          >
            <div className="flex items-center flex-1">
              {showSearchResults && (
                <button 
                  onClick={handleBackToMenu}
                  className="mr-3 p-1"
                >
                  <svg className="w-5 h-5" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {isLoggedIn && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2 border"
                  onClick={() => {
                    onClose();
                    onShowProfile?.();
                  }}
                  style={{ 
                    backgroundColor: menuTheme === 'light' ? 'rgba(31, 41, 55, 0.1)' : 'transparent',
                    borderColor: menuTheme === 'light' ? '#6B7280' : colors.primary,
                    color: menuTheme === 'light' ? '#1F2937' : '#FFFFFF',
                    background: user?.user_metadata?.avatar_url 
                      ? `url("${user.user_metadata.avatar_url}")` 
                      : menuTheme === 'light' ? 'rgba(31, 41, 55, 0.1)' : 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    cursor: 'pointer'
                  }}
                >
                  {!user?.user_metadata?.avatar_url && (
                    <span className="text-xs font-bold">
                      {user?.user_metadata?.full_name 
                        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                        : user?.email?.slice(0, 2).toUpperCase() || 'U'
                      }
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1">
                {showSearchResults ? (
                  <h2 className="text-xs font-semibold mb-0" style={{ color: colors.text }}>
                    Resultados de búsqueda
                  </h2>
                ) : isLoggedIn ? (
                  <>
                    <h2 className="font-semibold mb-0" style={{ color: colors.text, fontSize: '14px' }}>
                      Hey, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                    </h2>
                    <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
                      {user?.user_metadata?.username || `@${user?.email?.split('@')[0]}` || '@usuario'}
                    </p>
                  </>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
            </div>
          </div>

          {/* Registration CTA - Only show if not logged in */}
          {!isLoggedIn && (
            <button 
              className="mx-4 mb-3 w-[calc(100%-2rem)] py-4 rounded-2xl text-white font-medium text-sm flex items-center justify-center gap-3"
              style={{ 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #581c87 50%, #15803d 75%, #1e3a8a 100%)',
                borderColor: 'transparent'
              }}
              onClick={() => {
                console.log('🔍 BurgerMenu: Botón de auth clickeado');
                onShowAuth?.();
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
                }}
              >
                <span className="text-lg" style={{ color: '#FFFFFF' }}>@</span>
              </div>
              <span style={{ color: '#FFFFFF', fontSize: '14px' }}>Crea tu usuario o Inicia sesión</span>
            </button>
          )}

          {/* Search Bar */}
          <div 
            className="flex items-center mx-4 mb-3 px-3 py-2 rounded-full"
            style={{ 
              backgroundColor: colors.surface,
              border: menuTheme === 'light' ? `1px solid ${colors.border}` : 'none'
            }}
          >
            <input
              type="text"
              placeholder="buscar."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none font-medium"
              style={{ color: colors.text, fontSize: '14px' }}
            />
            <Search size={16} color={colors.textTertiary} />
          </div>

          {/* Search Results or Menu Content */}
          {showSearchResults ? (
            /* Search Results */
            <div className="px-4 mb-4 flex-1 overflow-y-auto">
              <p className="mb-3 leading-4" style={{ color: colors.textSecondary, fontSize: '14px' }}>
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
              </p>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-3">
                    <Search size={32} color={colors.textTertiary} className="mx-auto" />
                  </div>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    No se encontraron noticias
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((news) => (
                    <div
                      key={news.id}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: menuTheme === 'light' ? 'rgba(248, 249, 250, 0.5)' : 'transparent'
                      }}
                      onClick={() => {
                        // Aquí iría la lógica para abrir la noticia
                        console.log('Abrir noticia:', news.id);
                      }}
                    >
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium mb-1 leading-tight"
                          style={{ color: colors.text, fontSize: '14px' }}
                        >
                          {news.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-medium"
                            style={{ 
                              color: menuTheme === 'light' ? '#1F2937' : colors.primary,
                              fontSize: '14px'
                            }}
                          >
                            {news.label}
                          </span>
                          <span style={{ color: colors.textTertiary, fontSize: '14px' }}>•</span>
                          <span 
                            style={{ color: colors.textTertiary, fontSize: '14px' }}
                          >
                            {news.timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Curate Your Feed Section */
            <div className="px-4 mb-4">
              <h3 className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                personaliza tu feed.
              </h3>
              <p className="mb-3 leading-4" style={{ color: colors.textSecondary, fontSize: '14px' }}>
                {selectedCategories.length === 0 
                  ? 'Selecciona las categorías que te interesan'
                  : `Mostrando ${selectedCategories.length} categoría${selectedCategories.length > 1 ? 's' : ''} seleccionada${selectedCategories.length > 1 ? 's' : ''}`
                }
              </p>
              
              {/* Categories */}
              <div className="space-y-1">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.name);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.name)}
                      className="flex items-center w-full py-1.5 px-3 rounded-full border transition-colors"
                      style={{
                        background: isSelected 
                          ? menuTheme === 'light'
                            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.2) 0%, rgba(55, 65, 81, 0.15) 50%, rgba(75, 85, 99, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(128, 128, 128, 0.4) 0%, rgba(64, 64, 64, 0.3) 50%, rgba(0, 0, 0, 0.2) 100%)'
                          : menuTheme === 'light'
                            ? 'linear-gradient(135deg, rgba(248, 249, 250, 0.8) 0%, rgba(241, 243, 244, 0.6) 50%, rgba(229, 231, 235, 0.4) 100%)'
                            : 'linear-gradient(135deg, rgba(128, 128, 128, 0.2) 0%, rgba(64, 64, 64, 0.1) 50%, rgba(0, 0, 0, 0.05) 100%)',
                        backgroundColor: isSelected 
                          ? menuTheme === 'light' ? 'rgba(31, 41, 55, 0.15)' : 'rgba(128, 128, 128, 0.3)'
                          : menuTheme === 'light' ? 'rgba(248, 249, 250, 0.6)' : 'rgba(0, 0, 0, 0.1)',
                        borderColor: 'transparent'
                      }}
                    >
                      <span className="text-sm mr-2">{category.emoji}</span>
                      <span 
                        className="font-medium flex-1 text-left"
                        style={{ 
                          color: isSelected 
                            ? menuTheme === 'light' ? '#1F2937' : '#9CA3AF'
                            : colors.text,
                          fontSize: '14px'
                        }}
                      >
                        {category.name}
                      </span>
                      {isSelected ? (
                        <Check size={14} color={menuTheme === 'light' ? '#1F2937' : '#9CA3AF'} />
                      ) : (
                        <Plus size={14} color={colors.textTertiary} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          {!showSearchResults && (
            <div className="px-4 py-2 mt-3">
              {/* User Actions - Only show if logged in */}
              {isLoggedIn && (
                <div className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
                  <button 
                    onClick={signOut}
                    className="w-full text-left py-2 px-3 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ 
                      background: menuTheme === 'light'
                        ? 'linear-gradient(135deg, rgba(248, 249, 250, 0.8) 0%, rgba(241, 243, 244, 0.6) 50%, rgba(229, 231, 235, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(128, 128, 128, 0.2) 0%, rgba(64, 64, 64, 0.1) 50%, rgba(0, 0, 0, 0.05) 100%)',
                      backgroundColor: menuTheme === 'light' ? 'rgba(248, 249, 250, 0.6)' : 'rgba(128, 128, 128, 0.1)'
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Cerrar sesión
                    </span>
                  </button>
                </div>
              )}
              
              {/* Bottom Actions */}
              <div className="flex justify-around">
                <button 
                  onClick={onShowSettings}
                  className="flex items-center gap-1 p-2"
                >
                  <Settings size={16} color={colors.textTertiary} />
                  <span className="font-medium" style={{ color: colors.textTertiary, fontSize: '14px' }}>
                    Configuración
                  </span>
                </button>
                
                <button 
                  className="flex items-center p-1"
                  onClick={onShowBookmarks}
                >
                  <Bookmark 
                    size={16} 
                    color={colors.textTertiary}
                  />
                </button>
                
                <button 
                  onClick={toggleMenuTheme}
                  className="flex items-center p-2"
                >
                  {menuTheme === 'dark' ? (
                    <Sun size={16} color={colors.textTertiary} />
                  ) : (
                    <Moon size={16} color={colors.textTertiary} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BurgerMenu;