import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

function DesktopMainHeader({ theme, selectedCategories, onCategoriesChange }) {
  const [open, setOpen] = useState(false);

  const CATEGORIES = useMemo(() => ([
    { id: 'tecnologia', name: 'Tecnología', emoji: '💻' },
    { id: 'politica',   name: 'Política',   emoji: '🏛️' },
    { id: 'milei',      name: 'Milei',      emoji: '🇦🇷' },
    { id: 'elecciones2025', name: 'Elecciones2025', emoji: '🗳️' },
    { id: 'economia',   name: 'Economía',   emoji: '📊' },
    { id: 'cripto',     name: 'Cripto',     emoji: '₿' },
    { id: 'cultura',    name: 'Cultura',    emoji: '🎭' },
    { id: 'espectaculos', name: 'Espectáculos', emoji: '🎬' },
    { id: 'deportes',   name: 'Deportes',   emoji: '⚽' },
    { id: 'salud',      name: 'Salud',      emoji: '🏥' },
    { id: 'sociedad',   name: 'Sociedad',   emoji: '👥' },
    { id: 'seguridad',  name: 'Seguridad',  emoji: '🚔' },
    { id: 'internacional', name: 'Internacional', emoji: '🌍' },
  ]), []);

  const THEME_COLORS = useMemo(() => ({
    light: {
      background: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      pillBg: '#F3F4F6',
      pillActiveBg: '#3B82F6',
      pillActiveText: '#FFFFFF',
      dropdownBg: '#FFFFFF',
      dropdownBorder: '#E5E7EB',
      dropdownShadow: '0 10px 25px rgba(0,0,0,.10)',
    },
    dark: {
      background: '#111827',
      text: '#FFFFFF',
      textSecondary: '#9CA3AF',
      border: '#374151',
      pillBg: '#374151',
      pillActiveBg: '#1DB954',
      pillActiveText: '#FFFFFF',
      dropdownBg: '#1F2937',
      dropdownBorder: '#374151',
      dropdownShadow: '0 10px 25px rgba(0,0,0,.30)',
    }
  }), []);

  const colors = (THEME_COLORS[theme] || THEME_COLORS.dark);
  const isParaTi = (selectedCategories || []).length === 0;

  const toggleCategory = useCallback((name) => {
    const list = selectedCategories || [];
    onCategoriesChange(
      list.includes(name)
        ? list.filter(n => n !== name)
        : [...list, name]
    );
  }, [selectedCategories, onCategoriesChange]);

  const clearAll = useCallback(() => {
    onCategoriesChange([]);
    setOpen(false);
  }, [onCategoriesChange]);

  return (
    <div
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ backgroundColor: `${colors.background}F0`, borderColor: colors.border, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1
            className="font-bold mr-2"
            style={{ color: colors.text, fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 36, fontWeight: 700 }}
          >
            Descubre
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105"
              style={{
                backgroundColor: isParaTi ? colors.pillActiveBg : colors.pillBg,
                color: isParaTi ? colors.pillActiveText : colors.textSecondary,
                fontSize: 14
              }}
            >
              🌟 Para Ti
            </button>

            <button
              className="px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: colors.pillBg, color: colors.textSecondary, fontSize: 14 }}
            >
              ⭐ Top
            </button>

            <div className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105"
                style={{
                  backgroundColor: (selectedCategories || []).length > 0 ? colors.pillActiveBg : colors.pillBg,
                  color: (selectedCategories || []).length > 0 ? colors.pillActiveText : colors.textSecondary,
                  fontSize: 14
                }}
              >
                📂 Temas
                {(selectedCategories || []).length > 0 && (
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colors.pillActiveText }}
                  >
                    {(selectedCategories || []).length}
                  </span>
                )}
                <ChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {open && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                  <div
                    className="absolute top-full left-0 mt-3 w-80 rounded-2xl border z-20 backdrop-blur-md"
                    style={{
                      backgroundColor: `${colors.dropdownBg}F5`,
                      borderColor: colors.dropdownBorder,
                      boxShadow: colors.dropdownShadow
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold" style={{ color: colors.text }}>Personaliza tu feed</h3>
                        <button
                          onClick={() => setOpen(false)}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.pillBg }}
                        >
                          <X size={14} style={{ color: colors.textSecondary }} />
                        </button>
                      </div>

                      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        {(selectedCategories || []).length === 0
                          ? 'Selecciona las categorías que te interesan'
                          : `${selectedCategories.length} categoría${selectedCategories.length > 1 ? 's' : ''} seleccionada${selectedCategories.length > 1 ? 's' : ''}`}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {CATEGORIES.map(cat => {
                          const selected = (selectedCategories || []).includes(cat.name);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => toggleCategory(cat.name)}
                              className="flex items-center justify-between p-3 rounded-xl border transition-transform hover:scale-[1.01]"
                              style={{
                                backgroundColor: selected ? `${colors.pillActiveBg}20` : colors.pillBg,
                                borderColor: selected ? colors.pillActiveBg : 'transparent'
                              }}
                            >
                              <div className="flex items-center">
                                <span className="text-sm mr-2">{cat.emoji}</span>
                                <span
                                  className="font-medium text-sm"
                                  style={{ color: selected ? colors.pillActiveBg : colors.text }}
                                >
                                  {cat.name}
                                </span>
                              </div>
                              {selected && (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.pillActiveBg }}>
                                  <Check size={12} color="#FFFFFF" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {(selectedCategories || []).length > 0 && (
                        <button
                          onClick={clearAll}
                          className="w-full p-3 rounded-xl border"
                          style={{ backgroundColor: 'transparent', borderColor: colors.border, color: colors.textSecondary }}
                        >
                          <span className="text-sm font-medium">Limpiar selección</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {(selectedCategories || []).length > 0 && (
          <div className="flex items-center gap-2 max-w-md overflow-x-auto px-6 pb-3">
            {selectedCategories.slice(0, 3).map(cat => (
              <div
                key={cat}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                style={{
                  backgroundColor: `${colors.pillActiveBg}20`,
                  color: colors.pillActiveBg,
                  border: `1px solid ${colors.pillActiveBg}40`
                }}
              >
                <span>{cat}</span>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10"
                  aria-label={`Quitar ${cat}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {selectedCategories.length > 3 && (
              <div
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: colors.pillBg, color: colors.textSecondary }}
              >
                +{selectedCategories.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DesktopMainHeader;
