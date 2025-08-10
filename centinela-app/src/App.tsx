import React, { useState, useEffect } from 'react';
import { Menu, Heart, Send, MessageCircle, Bookmark, ExternalLink, Bell, Search } from 'lucide-react';
import { useArticles } from './hooks/useArticles';
import { useLikes } from './hooks/useLikes';
import { useBookmarks } from './hooks/useBookmarks';
import { useViewedArticles } from './hooks/useViewedArticles';
import { useAuth } from './hooks/useAuth';
import { useComments } from './hooks/useComments';
import BurgerMenu from './components/BurgerMenu';
import DesktopSidebar from './components/DesktopSidebar';
import DesktopNewsGrid from './components/DesktopNewsGrid';
import AuthModal from './components/AuthModal';
import BookmarksModal from './components/BookmarksModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import FloatingCommentBubble from './components/FloatingCommentBubble';
import CommentsModal from './components/CommentsModal';
import ShareModal from './components/ShareModal';
import ArticleViewerModal from './components/ArticleViewerModal';
import LoginPromptModal from './components/LoginPromptModal';
import NotificationsModal from './components/NotificationsModal';

export default function App() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showArticleViewer, setShowArticleViewer] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showBookmarkNotification, setShowBookmarkNotification] = useState(false);
  const [topComment, setTopComment] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [breakingNewsNotifications, setBreakingNewsNotifications] = useState(() => {
    const saved = localStorage.getItem('centinela_breaking_news_notifications');
    return saved ? JSON.parse(saved) : false;
  });

  // Desktop layout check (ANTES de returns condicionales)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Save notification preference
  useEffect(() => {
    localStorage.setItem(
      'centinela_breaking_news_notifications',
      JSON.stringify(breakingNewsNotifications)
    );
  }, [breakingNewsNotifications]);

  // Debug
  const debugModalState = (action: string) => {
    console.log(`🔍 Modal Debug - ${action}:`, {
      showMenu,
      showAuth,
      showBookmarks,
      showSettings,
      showProfile,
      showComments,
      showShare,
      showArticleViewer,
    });
  };

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [scrollAccumulator, setScrollAccumulator] = useState(0);
  const SCROLL_THRESHOLD = 100;
  const SCROLL_COOLDOWN = 600;

  const {
    articles,
    loading,
    loadingMore,
    isCategoryChanging,
    error,
    hasMore,
    totalArticles,
    loadedArticles,
    refetch,
    loadMore,
  } = useArticles(selectedCategories);
  const { toggleLike, isLiked } = useLikes();
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { markAsViewed, getNextUnviewedIndex } = useViewedArticles();
  const { getTopCommentForArticle } = useComments();

  // Ir al primer no-visto al cargar
  useEffect(() => {
    if (articles.length > 0 && currentNewsIndex === 0) {
      const nextUnviewedIndex = getNextUnviewedIndex(articles, 0);
      if (nextUnviewedIndex !== 0) {
        setCurrentNewsIndex(nextUnviewedIndex);
      }
    }
  }, [articles.length, getNextUnviewedIndex, currentNewsIndex]);

  const currentArticle = articles[currentNewsIndex] || null;

  const handleLike = async () => {
    if (!currentArticle) return;
    try {
      await toggleLike(currentArticle.id);
    } catch (error: any) {
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        console.log('🔌 Like saved locally (network unavailable)');
      } else {
        console.error('❌ Unexpected error toggling like:', error);
      }
    }
  };

  const handleBookmark = () => {
    if (!currentArticle) return;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const wasBookmarked = isBookmarked(currentArticle.id);
    toggleBookmark(currentArticle.id);
    if (!wasBookmarked) {
      setShowBookmarkNotification(true);
      setTimeout(() => setShowBookmarkNotification(false), 4000);
    }
  };

  const handleShare = () => {
    debugModalState('handleShare called');
    setShowShare(true);
  };

  const handleShowComments = () => {
    debugModalState('handleShowComments called');
    setShowComments(true);
  };

  const handleOpenArticle = () => {
    debugModalState('handleOpenArticle called');
    setShowArticleViewer(true);
  };

  const nextArticle = () => {
    if (articles.length === 0) return;

    if (currentNewsIndex >= articles.length - 5 && hasMore && !loadingMore) {
      loadMore();
    }

    const nextUnviewedIndex = getNextUnviewedIndex(articles, currentNewsIndex + 1);
    const targetIndex =
      nextUnviewedIndex !== currentNewsIndex + 1
        ? nextUnviewedIndex
        : (currentNewsIndex + 1) % articles.length;

    setIsTransitioning(true);
    setIsScrolling(true);
    setTimeout(() => {
      setCurrentNewsIndex(targetIndex);
      setTimeout(() => {
        setIsTransitioning(false);
        setIsScrolling(false);
        loadTopComment(articles[targetIndex]?.id);
      }, 400);
    }, 150);
  };

  const prevArticle = () => {
    if (articles.length === 0) return;

    const targetIndex = currentNewsIndex === 0 ? articles.length - 1 : currentNewsIndex - 1;

    setIsTransitioning(true);
    setIsScrolling(true);
    setTimeout(() => {
      setCurrentNewsIndex(targetIndex);
      setTimeout(() => {
        setIsTransitioning(false);
        setIsScrolling(false);
        loadTopComment(articles[targetIndex]?.id);
      }, 400);
    }, 150);
  };

  const loadTopComment = async (articleId: string) => {
    if (!articleId) return;
    try {
      const comment = await getTopCommentForArticle(articleId);
      setTopComment(comment);
    } catch (e) {
      console.warn('Error loading top comment:', e);
      setTopComment(null);
    }
  };

  useEffect(() => {
    if (currentArticle?.id) {
      const timer = setTimeout(() => loadTopComment(currentArticle.id), 500);
      markAsViewed(currentArticle.id);
      return () => clearTimeout(timer);
    }
  }, [currentArticle?.id, markAsViewed]);

  useEffect(() => {
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollTimeout]);

  const handleSnippetScroll = (e: React.WheelEvent) => {
    if (
      showComments ||
      showAuth ||
      showBookmarks ||
      showSettings ||
      showProfile ||
      showMenu ||
      showShare ||
      showArticleViewer
    ) {
      return;
    }

    e.preventDefault();
    const now = Date.now();

    if (now - lastScrollTime < SCROLL_COOLDOWN) return;

    const newAcc = scrollAccumulator + Math.abs(e.deltaY);
    setScrollAccumulator(newAcc);
    if (newAcc < SCROLL_THRESHOLD) return;

    setScrollAccumulator(0);
    setLastScrollTime(now);
    if (scrollTimeout) clearTimeout(scrollTimeout);
    setIsScrolling(true);

    if (e.deltaY > 0) nextArticle();
    else prevArticle();

    const timeout = setTimeout(() => setIsScrolling(false), 600);
    setScrollTimeout(timeout);
  };

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1).replace('.0', '') + 'K';
    return String(count);
  };

  const getCategoryStyle = (label: string, currentTheme: 'light' | 'dark'): string => {
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
        return currentTheme === 'light'
          ? `${baseClasses} bg-gray-700/40 border border-gray-500/30`
          : `${baseClasses} bg-gray-600/40 border border-gray-400/30`;
    }
  };

  // Atajos teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isEditing =
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable || activeElement.contentEditable === 'true');
      const isInputField =
        !!activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || isEditing);

      if (
        isInputField ||
        showArticleViewer ||
        showComments ||
        showAuth ||
        showBookmarks ||
        showSettings ||
        showProfile ||
        showMenu ||
        showShare
      ) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        prevArticle();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        nextArticle();
      } else if (e.key === 'l') {
        e.preventDefault();
        handleLike();
      } else if (e.key === 'b') {
        e.preventDefault();
        handleBookmark();
      } else if (e.key === 's') {
        e.preventDefault();
        handleShare();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    currentArticle,
    showArticleViewer,
    showComments,
    showAuth,
    showBookmarks,
    showSettings,
    showProfile,
    showMenu,
    showShare,
  ]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #020A05 0%, #010603 25%, #000000 50%, #000000 100%)' }}
      >
        <img src="/centinela-logo.png" alt="Centinela" className="w-16 h-16 rounded-full mb-4" />
        <h1 className="text-xl font-bold text-white mb-2 tracking-wide">centinela.</h1>
        <p className="text-sm text-gray-400 mb-4">Conectando con la red de noticias...</p>
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        {loadedArticles > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {loadedArticles} de {totalArticles} noticias cargadas
          </p>
        )}
      </div>
    );
  }

  if (error || !articles.length) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8 relative"
        style={{ background: 'linear-gradient(135deg, #020A05 0%, #010603 25%, #000000 50%, #000000 100%)' }}
      >
        <img src="/centinela-logo.png" alt="Centinela" className="w-20 h-20 rounded-full mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Error al cargar noticias</h2>
        <p className="text-gray-400 mb-6 text-center">{error || 'No hay noticias disponibles'}</p>
        <button
          onClick={refetch}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!currentArticle) return null;

  const currentArticleIsLiked = isLiked(currentArticle.id);
  const currentArticleIsBookmarked = isBookmarked(currentArticle.id);
  const currentLikesCount = currentArticle.likes + (currentArticleIsLiked ? 1 : 0);

  const colors = {
    light: {
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 25%, #FFFFFF 50%, #F8F9FA 100%)',
      cardBackground: 'rgba(255, 255, 255, 0.9)',
      text: '#000000',
      textSecondary: '#374151',
      buttonBg: 'rgba(0, 0, 0, 0.1)',
      buttonHover: 'rgba(0, 0, 0, 0.2)',
      headerBg: 'rgba(255, 255, 255, 0.8)',
      overlay:
        'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 30%, transparent 50%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.6) 100%)',
      cardOverlay:
        'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.4) 100%)',
      scrollOverlay: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 20%, #90CAF9 40%, #64B5F6 60%, #42A5F5 100%)',
      transitionOverlay: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 30%, #0D47A1 60%, #0A2E5C 100%)',
    },
    dark: {
      background: 'linear-gradient(135deg, #020A05 0%, #010603 25%, #000000 50%, #000000 100%)',
      cardBackground: 'rgba(0, 0, 0, 0.8)',
      text: '#FFFFFF',
      textSecondary: '#E5E5E5',
      buttonBg: 'rgba(0, 0, 0, 0.4)',
      buttonHover: 'rgba(0, 0, 0, 0.6)',
      headerBg: 'rgba(0, 0, 0, 0.6)',
      overlay:
        'linear-gradient(to bottom, rgba(2, 10, 5, 0.8) 0%, rgba(1, 6, 3, 0.4) 30%, transparent 50%, rgba(1, 6, 3, 0.6) 70%, rgba(0, 0, 0, 0.9) 100%)',
      cardOverlay:
        'linear-gradient(135deg, rgba(2, 10, 5, 0.6) 0%, rgba(1, 6, 3, 0.4) 50%, rgba(0, 0, 0, 0.8) 100%)',
      scrollOverlay: 'linear-gradient(135deg, #0A3D1F 0%, #051A0C 20%, #020A05 40%, #010603 60%, #000000 100%)',
      transitionOverlay: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)',
    },
  };

  const currentColors = colors[theme];

  return (
    <>
      {/* Desktop Layout */}
      <div
        className={`min-h-screen flex ${isDesktop ? 'block' : 'hidden'}`}
        style={{ background: currentColors.background }}
      >
        {/* Left Sidebar */}
        <DesktopSidebar
          theme={theme}
          onThemeChange={setTheme}
          onShowAuth={() => {
            setShowAuth(true);
            setShowBookmarks(false);
            setShowSettings(false);
            setShowProfile(false);
            setShowNotifications(false);
          }}
          onShowBookmarks={() => {
            setShowBookmarks(true);
            setShowAuth(false);
            setShowSettings(false);
            setShowProfile(false);
            setShowNotifications(false);
          }}
          onShowSettings={() => {
            setShowSettings(true);
            setShowAuth(false);
            setShowBookmarks(false);
            setShowProfile(false);
            setShowNotifications(false);
          }}
          onShowProfile={() => {
            setShowProfile(true);
            setShowAuth(false);
            setShowBookmarks(false);
            setShowSettings(false);
            setShowNotifications(false);
          }}
          onShowNotifications={() => {
            setShowNotifications(true);
            setShowAuth(false);
            setShowBookmarks(false);
            setShowSettings(false);
            setShowProfile(false);
          }}
          onCategoriesChange={setSelectedCategories}
          selectedCategories={selectedCategories}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Header sticky con búsqueda y filtros */}
            <div
              className="sticky top-0 z-10 backdrop-blur-md border-b p-6"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: theme === 'light' ? '#E5E7EB' : '#374151',
              }}
            >
              <div className="flex items-center justify-between">
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: currentColors.text }}
                >
                  {selectedCategories.length > 0 ? `${selectedCategories.join(', ')}` : 'Noticias'}
                </h1>

                {/* Search Bar */}
                <div
                  className="flex items-center rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: theme === 'light' ? '#F9FAFB' : '#1F2937',
                    borderColor: theme === 'light' ? '#D1D5DB' : '#374151',
                  }}
                >
                  <Search size={16} className="mr-2" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Buscar noticias..."
                    className="bg-transparent text-sm outline-none w-64 placeholder-gray-400 dark:placeholder-gray-500"
                    style={{ color: currentColors.text }}
                  />
                </div>
              </div>

              {/* Category indicator */}
              {selectedCategories.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                    Mostrando:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: theme === 'light' ? '#10B981' : '#059669' }}
                      >
                        {category}
                      </span>
                    ))}
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 text-white"
                      style={{ backgroundColor: theme === 'light' ? '#EF4444' : '#DC2626' }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* News Cards */}
            <div className="p-6">
              {/* Loading state para cambios de categoría */}
              {isCategoryChanging && articles.length === 0 && (
                <div className="text-center py-12">
                  <div
                    className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    style={{ borderColor: theme === 'light' ? '#059669' : '#1DB954' }}
                  ></div>
                  <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                    Cargando noticias...
                  </p>
                </div>
              )}

              <DesktopNewsGrid
                articles={articles}
                theme={theme}
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                onLike={(articleId) => toggleLike(articleId)}
                onBookmark={(articleId) => {
                  if (!user) {
                    setShowLoginPrompt(true);
                    return;
                  }
                  const wasBookmarked = isBookmarked(articleId);
                  toggleBookmark(articleId);
                  if (!wasBookmarked) {
                    setShowBookmarkNotification(true);
                    setTimeout(() => setShowBookmarkNotification(false), 4000);
                  }
                }}
                onShare={(article) => {
                  const index = articles.findIndex((a) => a.id === article.id);
                  if (index !== -1) setCurrentNewsIndex(index);
                  setShowShare(true);
                }}
                onComment={(articleId) => {
                  const index = articles.findIndex((a) => a.id === articleId);
                  if (index !== -1) setCurrentNewsIndex(index);
                  setShowComments(true);
                }}
                onOpenArticle={() => setShowArticleViewer(true)}
                formatCount={formatCount}
                loadMore={loadMore}
                hasMore={hasMore}
                loadingMore={loadingMore}
              />

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 text-white rounded-full font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: theme === 'light' ? '#059669' : '#10B981',
                    }}
                  >
                    {loadingMore ? (
                      <span className="flex items-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Cargando...
                      </span>
                    ) : (
                      'Cargar más noticias'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className={`${isDesktop ? 'hidden' : 'block'}`} style={{ background: currentColors.background }}>
        <div className="relative min-h-screen overflow-hidden">
          {/* Transition overlay */}
          <div
            className={`absolute inset-0 transition-all duration-400 ${
              isTransitioning ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{ background: currentColors.transitionOverlay, zIndex: 1 }}
          />

          {/* Background image */}
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-400 ${
              isScrolling ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              backgroundImage: `url(${currentArticle.image})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
              zIndex: 2,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  theme === 'light'
                    ? 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(255, 255, 255, 0.2) 50%, rgba(248, 249, 250, 0.5) 70%, rgba(229, 231, 235, 0.8) 85%, rgba(209, 213, 219, 1) 100%)'
                    : 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.2) 50%, rgba(1, 6, 3, 0.5) 70%, rgba(2, 10, 5, 0.8) 85%, rgba(0, 0, 0, 1) 100%)',
                zIndex: 1,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  theme === 'light'
                    ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 40%, transparent 70%)'
                    : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)',
                backdropFilter: 'blur(0.5px) saturate(1.2) contrast(1.1)',
                WebkitBackdropFilter: 'blur(0.5px) saturate(1.2) contrast(1.1)',
                zIndex: 2,
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 opacity-20"
              style={{
                height: '60%',
                background:
                  theme === 'light'
                    ? 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 55%, transparent 100%)'
                    : 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 100%)',
                transform: 'translateX(-100%)',
                animation: 'shine 3s ease-in-out infinite',
                zIndex: 3,
              }}
            />
          </div>

          {/* Lower gradients */}
          <div
            className="absolute inset-0"
            style={{
              background:
                theme === 'light'
                  ? 'linear-gradient(to bottom, transparent 0%, transparent 45%, rgba(209, 213, 219, 0.2) 50%, rgba(156, 163, 175, 0.5) 60%, rgba(209, 213, 219, 0.8) 70%, rgba(229, 231, 235, 0.95) 80%, rgba(248, 249, 250, 0.98) 90%, rgba(255, 255, 255, 1) 100%)'
                  : 'linear-gradient(135deg, transparent 0%, transparent 40%, rgba(29, 185, 84, 0.03) 45%, rgba(15, 76, 42, 0.05) 55%, rgba(2, 10, 5, 0.08) 65%, rgba(1, 6, 3, 0.12) 75%, rgba(0, 0, 0, 0.85) 85%, rgba(0, 0, 0, 0.95) 95%, rgba(0, 0, 0, 1) 100%)',
              zIndex: 3,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                theme === 'light'
                  ? 'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(0, 0, 0, 0.02) 40%, rgba(0, 0, 0, 0.05) 45%, rgba(0, 0, 0, 0.08) 50%, rgba(0, 0, 0, 0.12) 55%, rgba(0, 0, 0, 0.15) 60%, transparent 65%)'
                  : 'linear-gradient(to bottom, transparent 0%, transparent 35%, rgba(29, 185, 84, 0.02) 40%, rgba(15, 76, 42, 0.03) 45%, rgba(2, 10, 5, 0.04) 50%, rgba(1, 6, 3, 0.05) 55%, rgba(0, 0, 0, 0.08) 60%, transparent 65%)',
              zIndex: 4,
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-400 ${
              isScrolling ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ background: currentColors.scrollOverlay, zIndex: 5 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                theme === 'light'
                  ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 25%, transparent 45%, rgba(0, 0, 0, 0.1) 55%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.4) 85%, rgba(0, 0, 0, 0.6) 100%)'
                  : 'linear-gradient(to bottom, rgba(2, 10, 5, 0.3) 0%, rgba(1, 6, 3, 0.2) 25%, transparent 45%, rgba(1, 6, 3, 0.2) 55%, rgba(1, 6, 3, 0.4) 70%, rgba(0, 0, 0, 0.6) 85%, rgba(0, 0, 0, 0.8) 100%)',
              zIndex: 6,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '200px',
              background:
                theme === 'light'
                  ? 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(248, 249, 250, 0.95) 20%, rgba(229, 231, 235, 0.8) 40%, rgba(209, 213, 219, 0.6) 60%, rgba(156, 163, 175, 0.4) 80%, rgba(107, 114, 128, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.98) 15%, rgba(15, 76, 42, 0.02) 30%, rgba(29, 185, 84, 0.01) 45%, rgba(15, 76, 42, 0.008) 60%, rgba(29, 185, 84, 0.005) 75%, rgba(0, 0, 0, 0.02) 90%, transparent 100%)',
              zIndex: 7,
              animation: theme === 'dark' ? 'techPulse 4s ease-in-out infinite' : 'none',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ zIndex: 8 }}>
            <div
              className="absolute inset-0"
              style={{
                background:
                  theme === 'light'
                    ? 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.95) 20%, rgba(233, 236, 239, 0.8) 40%, rgba(209, 213, 219, 0.6) 60%, rgba(156, 163, 175, 0.3) 80%, rgba(107, 114, 128, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.95) 15%, rgba(15, 76, 42, 0.01) 25%, rgba(29, 185, 84, 0.005) 35%, rgba(15, 76, 42, 0.003) 50%, rgba(29, 185, 84, 0.002) 65%, rgba(15, 76, 42, 0.001) 80%, rgba(0, 0, 0, 0.005) 95%, transparent 100%)',
                backgroundSize: '200% 200%',
                animation: theme === 'dark' ? 'gradientShift 6s ease-in-out infinite, subtleGlow 3s ease-in-out infinite' : 'none',
              }}
            />
          </div>

          {/* Header mobile */}
          <div
            className="relative flex justify-between items-center px-6 pb-6"
            style={{ zIndex: 15, paddingTop: `max(24px, env(safe-area-inset-top, 24px))` }}
          >
            <button
              onClick={() => setShowMenu(true)}
              className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
              style={{ backgroundColor: currentColors.headerBg }}
            >
              <Menu size={20} style={{ color: currentColors.text }} />
            </button>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm transition-all duration-300 ${
                currentArticle.label === 'ÚLTIMO MOMENTO'
                  ? 'bg-red-500/90 text-white animate-pulse border border-red-400'
                  : getCategoryStyle(currentArticle.label, theme)
              }`}
            >
              {currentArticle.label === 'ÚLTIMO MOMENTO' && (
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              )}
              {currentArticle.label}
            </span>
          </div>

          {/* Social actions */}
          <div
            className="absolute right-6 flex flex-col gap-2"
            style={{ zIndex: 15, top: `max(120px, calc(env(safe-area-inset-top, 0px) + 96px))` }}
          >
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
              style={{ backgroundColor: currentColors.buttonBg }}
            >
              <Send size={16} style={{ color: '#FFFFFF' }} />
            </button>

            <button
              onClick={handleShowComments}
              className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors hover:scale-105"
              style={{ backgroundColor: currentColors.buttonBg }}
            >
              <MessageCircle size={16} style={{ color: '#FFFFFF' }} />
            </button>

            <div className="flex flex-col items-center">
              <button
                onClick={handleLike}
                className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
                style={{ backgroundColor: currentColors.buttonBg }}
              >
                <Heart
                  size={16}
                  className={`${currentArticleIsLiked ? 'text-red-400 fill-red-400' : 'text-white'}`}
                  style={{ color: currentArticleIsLiked ? '#F87171' : '#FFFFFF' }}
                />
              </button>
              <span className="text-xs font-bold mt-0.5" style={{ color: '#FFFFFF', fontSize: '9px' }}>
                {formatCount(currentLikesCount)}
              </span>
            </div>

            <button
              onClick={handleBookmark}
              className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors hover:scale-105"
              style={{ backgroundColor: currentColors.buttonBg }}
            >
              <Bookmark
                size={16}
                className={`${currentArticleIsBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
                style={{ color: currentArticleIsBookmarked ? '#FBBF24' : '#FFFFFF' }}
              />
            </button>
          </div>

          {/* Content Card */}
          <div className="absolute left-8 right-8" style={{ zIndex: 15, bottom: `max(32px, env(safe-area-inset-bottom, 32px))` }}>
            <div
              className="backdrop-blur-md rounded-2xl border cursor-pointer select-none"
              style={{
                backgroundColor: currentColors.cardBackground,
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                height: '400px',
                width: '100%',
              }}
              onWheel={handleSnippetScroll}
            >
              <div className="absolute inset-0 rounded-2xl opacity-30" style={{ background: currentColors.cardOverlay }} />
              <div
                className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                  isScrolling ? 'opacity-40' : 'opacity-0'
                }`}
                style={{
                  background:
                    theme === 'light'
                      ? 'linear-gradient(135deg, rgba(66, 165, 245, 0.3) 0%, rgba(25, 118, 210, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(29, 185, 84, 0.3) 0%, rgba(15, 76, 42, 0.2) 50%, rgba(0, 0, 0, 0.1) 100%)',
                }}
              />
              <div className="h-full flex flex-col p-6">
                <div className="mb-3 overflow-hidden">
                  <h1
                    className="font-bold leading-tight"
                    style={{
                      fontSize: '20px',
                      lineHeight: '1.3',
                      fontFamily: 'Space Grotesk, Inter, sans-serif',
                      color: currentColors.text,
                    }}
                  >
                    {currentArticle.title}
                  </h1>
                </div>

                <div
                  className="flex-1 mb-3 overflow-y-auto"
                  style={{ pointerEvents: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent' }}
                >
                  <p className="leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.5', color: currentColors.textSecondary }}>
                    {currentArticle.content}
                  </p>
                </div>

                <div className="h-12 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenArticle}
                      className="w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
                      style={{ backgroundColor: currentColors.buttonBg }}
                    >
                      <ExternalLink size={14} color="#FFFFFF" />
                    </button>

                    {currentArticle.label === 'ÚLTIMO MOMENTO' && (
                      <button
                        onClick={() => setBreakingNewsNotifications(!breakingNewsNotifications)}
                        className="w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          backgroundColor: currentColors.buttonBg,
                          border: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
                        }}
                        title={breakingNewsNotifications ? 'Desactivar notificaciones' : 'Activar notificaciones'}
                      >
                        <Bell size={12} color="#FFFFFF" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-60" style={{ color: currentColors.textSecondary }}>
                      {currentArticle.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo pill */}
            <div
              className="absolute -top-10 left-0 flex items-center backdrop-blur-sm px-2.5 py-1 rounded-full"
              style={{ backgroundColor: currentColors.headerBg }}
            >
              <img src="/centinela-logo.png" alt="Centinela" className="w-5 h-5 mr-1.5" />
              <span className="font-bold text-sm tracking-wide" style={{ color: currentColors.text }}>
                centinela.
              </span>
              {loadingMore && (
                <div className="ml-1.5 w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Floating Comment */}
          {topComment && (
            <div className="absolute" style={{ zIndex: 10, top: '35%', left: '32px', pointerEvents: 'none' }}>
              <FloatingCommentBubble comment={topComment} />
            </div>
          )}
        </div>
      </div>

      {/* MODALS (globales, fuera de los wrappers) */}
      <BurgerMenu
        isVisible={showMenu}
        onClose={() => {
          debugModalState('BurgerMenu onClose');
          setShowMenu(false);
        }}
        onThemeChange={setTheme}
        onShowAuth={() => {
          debugModalState('BurgerMenu onShowAuth');
          setShowMenu(false);
          setShowBookmarks(false);
          setShowAuth(true);
        }}
        onShowBookmarks={() => {
          debugModalState('BurgerMenu onShowBookmarks');
          setShowMenu(false);
          setShowAuth(false);
          setShowSettings(false);
          setShowBookmarks(true);
        }}
        onShowSettings={() => {
          debugModalState('BurgerMenu onShowSettings');
          setShowMenu(false);
          setShowAuth(false);
          setShowBookmarks(false);
          setShowProfile(false);
          setShowSettings(true);
        }}
        onShowProfile={() => {
          debugModalState('BurgerMenu onShowProfile');
          setShowMenu(false);
          setShowAuth(false);
          setShowBookmarks(false);
          setShowSettings(false);
          setShowProfile(true);
        }}
        onCategoriesChange={setSelectedCategories}
      />

      <AuthModal
        isVisible={showAuth}
        onClose={() => {
          debugModalState('AuthModal onClose');
          setShowAuth(false);
        }}
        theme={theme}
      />

      <BookmarksModal
        isVisible={showBookmarks}
        onClose={() => {
          debugModalState('BookmarksModal onClose');
          setShowBookmarks(false);
        }}
        theme={theme}
        onArticleSelect={(articleId) => {
          const index = articles.findIndex((a) => a.id === articleId);
          if (index !== -1) setCurrentNewsIndex(index);
        }}
      />

      <SettingsModal
        isVisible={showSettings}
        onClose={() => {
          debugModalState('SettingsModal onClose');
          setShowSettings(false);
        }}
        theme={theme}
        onShowAuth={() => {
          debugModalState('SettingsModal onShowAuth');
          setShowSettings(false);
          setShowAuth(true);
        }}
        onShowProfile={() => {
          debugModalState('SettingsModal onShowProfile');
          setShowSettings(false);
          setShowProfile(true);
        }}
        onThemeChange={setTheme}
      />

      <ProfileModal
        isVisible={showProfile}
        onClose={() => {
          debugModalState('ProfileModal onClose');
          setShowProfile(false);
        }}
        theme={theme}
      />

      <CommentsModal
        isVisible={showComments}
        onClose={() => {
          debugModalState('CommentsModal onClose');
          setShowComments(false);
        }}
        theme={theme}
        articleId={currentArticle?.id || ''}
        onShowAuth={() => {
          debugModalState('CommentsModal onShowAuth');
          setShowComments(false);
          setShowAuth(true);
        }}
      />

      <ShareModal
        isVisible={showShare}
        onClose={() => {
          debugModalState('ShareModal onClose');
          setShowShare(false);
        }}
        theme={theme}
        article={currentArticle}
      />

      <ArticleViewerModal
        isVisible={showArticleViewer}
        onClose={() => {
          debugModalState('ArticleViewerModal onClose');
          setShowArticleViewer(false);
        }}
        articleUrl={currentArticle?.link || ''}
        theme={theme}
      />

      <LoginPromptModal
        isVisible={showLoginPrompt}
        onClose={() => {
          debugModalState('LoginPromptModal onClose');
          setShowLoginPrompt(false);
        }}
        onLogin={() => {
          debugModalState('LoginPromptModal onLogin');
          setShowLoginPrompt(false);
          setShowAuth(true);
        }}
        theme={theme}
      />

      <NotificationsModal
        isVisible={showNotifications}
        onClose={() => setShowNotifications(false)}
        breakingNewsEnabled={breakingNewsNotifications}
        onBreakingNewsChange={setBreakingNewsNotifications}
      />

      {/* Desktop Modal Backdrop */}
      {isDesktop && (showAuth || showBookmarks || showSettings || showProfile || showNotifications) && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => {
            setShowAuth(false);
            setShowBookmarks(false);
            setShowSettings(false);
            setShowProfile(false);
            setShowNotifications(false);
          }}
        />
      )}

      {/* Desktop Modals with backdrop support */}
      {isDesktop && (
        <>
          <AuthModal
            isVisible={showAuth}
            onClose={() => setShowAuth(false)}
            theme={theme}
          />

          <BookmarksModal
            isVisible={showBookmarks}
            onClose={() => setShowBookmarks(false)}
            theme={theme}
            onArticleSelect={(articleId) => {
              const index = articles.findIndex((a) => a.id === articleId);
              if (index !== -1) setCurrentNewsIndex(index);
            }}
          />

          <SettingsModal
            isVisible={showSettings}
            onClose={() => setShowSettings(false)}
            theme={theme}
            onShowAuth={() => {
              setShowSettings(false);
              setShowAuth(true);
            }}
            onShowProfile={() => {
              setShowSettings(false);
              setShowProfile(true);
            }}
            onThemeChange={setTheme}
          />

          <ProfileModal
            isVisible={showProfile}
            onClose={() => setShowProfile(false)}
            theme={theme}
          />

          <NotificationsModal
            isVisible={showNotifications}
            onClose={() => setShowNotifications(false)}
            breakingNewsEnabled={breakingNewsNotifications}
            onBreakingNewsChange={setBreakingNewsNotifications}
            theme="dark"
          />
        </>
      )}

      {showBookmarkNotification && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center"
          style={{ paddingTop: `max(60px, calc(env(safe-area-inset-top, 0px) + 36px))` }}
        >
          <div
            className="mx-6 px-6 py-4 rounded-2xl backdrop-blur-md border shadow-lg animate-pulse"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ background: 'linear-gradient(135deg, #1DB954 0%, #0F4C2A 30%, #020A05 60%, #000000 100%)' }}
                >
                  <Bookmark size={16} className="text-white fill-white" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: theme === 'light' ? '#000000' : '#FFFFFF', fontSize: '14px' }}>
                    ¡Nota guardada!
                  </p>
                  <p style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF', fontSize: '12px' }}>
                    Puedes encontrarla en tus guardados
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBookmarkNotification(false);
                  setShowBookmarks(true);
                }}
                className="ml-4 px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: theme === 'light' ? '#F3F4F6' : '#374151',
                  color: theme === 'light' ? '#374151' : '#E5E5E5',
                  fontSize: '12px',
                }}
              >
                Ver guardados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}