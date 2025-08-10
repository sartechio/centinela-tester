import { useState, useEffect, useCallback } from 'react'
import { supabase, type ArticleWithSource } from '../lib/supabase'

/* ============================
   Mock data (fallback offline)
   ============================ */
export interface NewsArticle {
  id: string
  title: string
  content: string
  timeAgo: string
  label: string
  image: string
  likes: number
  comments: number
  source: string
  link: string
}

const mockArticles: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'Javier Milei anuncia nuevas medidas económicas para combatir la inflación',
    content:
      'El presidente argentino presentó un paquete de reformas estructurales que incluye la eliminación de subsidios y la reducción del gasto público. Las medidas buscan estabilizar la economía y reducir la inflación que afecta a millones de argentinos.',
    timeAgo: 'Hace 15 min',
    label: 'MILEI',
    image:
      'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 1247,
    comments: 89,
    source: 'Centinela',
    link: '#',
  },
  {
    id: 'mock-2',
    title:
      'ÚLTIMO MOMENTO: Fuerte sismo de 6.2 grados sacude el norte argentino',
    content:
      'Un terremoto de magnitud 6.2 se registró en las provincias de Salta y Jujuy. No se reportan víctimas hasta el momento, pero las autoridades mantienen alerta en la región. Los servicios de emergencia están evaluando posibles daños en la infraestructura.',
    timeAgo: 'Hace 8 min',
    label: 'ÚLTIMO MOMENTO',
    image:
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 2156,
    comments: 234,
    source: 'Centinela',
    link: '#',
  },
  {
    id: 'mock-3',
    title:
      'El dólar blue alcanza un nuevo récord histórico en el mercado paralelo',
    content:
      'La divisa estadounidense continúa su escalada en el mercado informal, superando los $1.200 pesos. Los analistas económicos atribuyen esta suba a la incertidumbre política y las expectativas sobre las próximas medidas del gobierno.',
    timeAgo: 'Hace 32 min',
    label: 'ECONOMÍA',
    image:
      'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 892,
    comments: 156,
    source: 'Centinela',
    link: '#',
  },
  {
    id: 'mock-4',
    title:
      'Apple presenta la nueva generación de iPhone con inteligencia artificial integrada',
    content:
      'La compañía de Cupertino reveló las características del iPhone 16, que incluye un procesador A18 optimizado para IA y nuevas funciones de fotografía computacional. El dispositivo estará disponible en Argentina a partir del próximo mes.',
    timeAgo: 'Hace 1 hora',
    label: 'TECNOLOGÍA',
    image:
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 1543,
    comments: 287,
    source: 'Centinela',
    link: '#',
  },
  {
    id: 'mock-5',
    title:
      'Lionel Messi confirma su participación en la próxima Copa América',
    content:
      'El capitán de la selección argentina anunció que estará presente en el torneo continental. A sus 37 años, Messi busca defender el título obtenido en la edición anterior y consolidar su legado con la albiceleste.',
    timeAgo: 'Hace 2 horas',
    label: 'DEPORTES',
    image:
      'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 3247,
    comments: 512,
    source: 'Centinela',
    link: '#',
  },
  {
    id: 'mock-6',
    title: 'Bitcoin supera los $70.000 dólares en una nueva ola alcista',
    content:
      'La criptomoneda líder experimenta una fuerte recuperación impulsada por la adopción institucional y las expectativas sobre las próximas regulaciones. Los expertos predicen que podría alcanzar nuevos máximos históricos en los próximos meses.',
    timeAgo: 'Hace 3 horas',
    label: 'CRIPTO',
    image:
      'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 1876,
    comments: 298,
    source: 'Centinela',
    link: '#',
  },
]

/* ==========================================
   OpenAI snippet generation (Edge Function)
   ========================================== */
const generateSnippet = async (
  content: string,
  title: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-snippet`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ content, title }),
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.snippet) {
        console.log('✅ GPT snippet generated successfully')
        return data.snippet
      }
    }

    console.log('⚠️ GPT failed, using fallback snippet generation')
    return processContentForSnippet(content, 500)
  } catch (error) {
    console.warn('GPT snippet generation error, using fallback:', error)
    return processContentForSnippet(content, 500)
  }
}

const processContentForSnippet = (
  text: string,
  maxLength: number = 600
): string => {
  if (!text || text.trim() === '') {
    return 'Esta noticia no tiene detalles disponibles por el momento. Los hechos principales aún se están confirmando. ¡Mantente atento para más actualizaciones!'
  }

  const informativeSnippet = generateInformativeSnippet(text)
  const targetLength = Math.floor(Math.random() * 200) + 400 // 400–600

  if (informativeSnippet.length <= targetLength) return informativeSnippet

  let truncated = informativeSnippet.substring(0, targetLength)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )
  if (lastSentenceEnd > targetLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1).trim()
  }
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  if (lastSpaceIndex > targetLength * 0.85) {
    return truncated.substring(0, lastSpaceIndex).trim() + '.'
  }
  return truncated.trim() + '.'
}

const generateInformativeSnippet = (content: string): string => {
  let cleanContent = content
    .replace(/¿Qué pasó\?/gi, '')
    .replace(/¿Que paso\?/gi, '')
    .replace(/^\s*[-•]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanContent) {
    return 'Los detalles de esta noticia aún se están confirmando. Se esperan más actualizaciones en las próximas horas.'
  }

  let snippet = cleanContent
    .replace(/se ha anunciado/gi, 'se anunció')
    .replace(/ha sido/gi, 'fue')
    .replace(/se encuentra/gi, 'está')
    .replace(/por consiguiente/gi, 'como resultado')
    .replace(/no obstante/gi, 'sin embargo')
    .replace(/de acuerdo con/gi, 'según')
    .replace(/aproximadamente/gi, 'cerca de')
    .replace(/posteriormente/gi, 'después')
    .replace(/anteriormente/gi, 'antes')
    .replace(/actualmente/gi, 'ahora')
    .replace(/recientemente/gi, 'hace poco')

  if (
    !snippet.includes('porque') &&
    !snippet.includes('debido a') &&
    !snippet.includes('como resultado')
  ) {
    if (snippet.length < 400) {
      snippet +=
        ' Esta situación se desarrolla en un contexto de cambios importantes en el sector.'
    }
  }
  return snippet
}

/* ============================
   Fallback a mock data helper
   ============================ */
const handleFallbackToMockData = (
  page: number,
  append: boolean,
  setArticles: (v: any) => void,
  setTotalCount: (v: number) => void,
  setCurrentPage: (v: number) => void,
  setHasMore: (v: boolean) => void,
  setError: (v: string | null) => void,
  BATCH_SIZE: number,
  dataSource: NewsArticle[]
) => {
  console.log('🔄 Using fallback mock data...')
  setError(null) // Clear any previous errors when using mock data
  const startIndex = page * BATCH_SIZE
  const endIndex = startIndex + BATCH_SIZE
  const paginated = dataSource.slice(startIndex, endIndex)

  if (paginated.length === 0) {
    setHasMore(false)
    return
  }

  if (append && page > 0) {
    setArticles((prev: NewsArticle[]) => [...prev, ...paginated])
  } else {
    setArticles(paginated)
    setTotalCount(dataSource.length)
  }

  setCurrentPage(page)
  setHasMore(endIndex < dataSource.length)
  console.log(`✅ Loaded ${paginated.length} mock articles (page ${page + 1})`)
}

/* =================================
   Modernize content (opcional/UX)
   ================================= */
const modernizeContent = (content: string): string => {
  return content
    .replace(/se ha anunciado/gi, 'se anunció')
    .replace(/ha sido/gi, 'fue')
    .replace(/se encuentra/gi, 'está')
    .replace(/en la actualidad/gi, 'ahora mismo')
    .replace(/por consiguiente/gi, 'entonces')
    .replace(/no obstante/gi, 'pero')
    .replace(/sin embargo/gi, 'igual')
    .replace(/de acuerdo con/gi, 'según')
    .replace(/aproximadamente/gi, 'más o menos')
    .replace(/posteriormente/gi, 'después')
    .replace(/anteriormente/gi, 'antes')
    .replace(/actualmente/gi, 'ahora')
    .replace(/recientemente/gi, 'hace poco')
    .replace(/inmediatamente/gi, 'al toque')
    .replace(/rápidamente/gi, 'súper rápido')
    .replace(/significativo/gi, 'importante')
    .replace(/considerable/gi, 'bastante')
    .replace(/numerosos/gi, 'un montón de')
    .replace(/múltiples/gi, 'varios')
    .replace(/muy importante/gi, 'súper importante')
    .replace(/muy grande/gi, 'enorme')
    .replace(/muy pequeño/gi, 'tiny')
    .replace(/muy rápido/gi, 'súper rápido')
    .replace(/es probable/gi, 'seguramente')
    .replace(/es posible/gi, 'puede ser que')
}

/* ============================
   Categoría visible (labels)
   ============================ */
const getCategoryLabel = (
  article: ArticleWithSource,
  priority: ReturnType<typeof buildPriorityDict>
): string => {
  if (article.is_breaking) return 'ÚLTIMO MOMENTO'

  const titleLower = article.title.toLowerCase()
  const contentLower = (article.description || article.content || '').toLowerCase()
  const cat = article.category.toLowerCase()

  if (priority.milei.some((t) => titleLower.includes(t) || contentLower.includes(t)))
    return 'MILEI'
  if (priority.elecciones2025.some((t) => titleLower.includes(t) || contentLower.includes(t)))
    return 'ELECCIONES2025'

  if (cat.includes('política') || cat.includes('politica') || cat.includes('la politica online')) return 'POLÍTICA'
  if (
    priority.economia.some(
      (t) => titleLower.includes(t) || cat.includes(t) || contentLower.includes(t)
    )
  )
    return 'ECONOMÍA'
  if (
    priority.tecnologia.some(
      (t) => titleLower.includes(t) || cat.includes(t) || contentLower.includes(t)
    )
  )
    return 'TECNOLOGÍA'
  if (
    priority.deportes.some(
      (t) => titleLower.includes(t) || cat.includes(t) || contentLower.includes(t)
    )
  )
    return 'DEPORTES'
  if (
    priority.internacional.some(
      (t) => titleLower.includes(t) || cat.includes(t) || contentLower.includes(t)
    )
  )
    return 'INTERNACIONAL'
  if (
    priority.cripto.some(
      (t) => titleLower.includes(t) || cat.includes(t) || contentLower.includes(t)
    )
  )
    return 'CRIPTO'

  if (cat.includes('cultura') || cat.includes('entretenimiento')) return 'CULTURA'
  if (cat.includes('salud')) return 'SALUD'
  if (cat.includes('espectáculos') || cat.includes('espectaculos')) return 'ESPECTÁCULOS'
  if (cat.includes('sociedad')) return 'SOCIEDAD'
  if (cat.includes('seguridad')) return 'SEGURIDAD'

  return article.category.toUpperCase()
}

const buildPriorityDict = () => ({
  breaking: ['último momento', 'ultimo momento', 'breaking', 'urgente'],
  milei: ['milei', 'javier milei', 'presidente'],
  elecciones2025: [
    'elecciones',
    'elecciones 2025',
    'elecciones2025',
    'octubre 2025',
    'campaña electoral',
    'candidatos',
    'ballotage',
    'primarias',
  ],
  economia: ['economía', 'economia', 'economic', 'inflacion', 'dolar', 'peso', 'mercado', 'banco central', 'fmi'],
  tecnologia: [
    'tecnología',
    'tecnologia',
    'tech',
    'ia',
    'inteligencia artificial',
    'apple',
    'google',
    'meta',
    'microsoft',
    'tesla',
    'openai'
  ],
  deportes: [
    'deportes',
    'deporte',
    'futbol',
    'messi',
    'boca',
    'river',
    'racing',
    'independiente',
    'selección argentina',
    'afa',
    'copa américa',
    'mundial'
  ],
  internacional: ['internacional', 'mundo', 'eeuu', 'europa', 'china', 'brasil', 'trump', 'biden', 'putin', 'ucrania', 'israel', 'palestina'],
  cripto: ['cripto', 'crypto', 'bitcoin', 'ethereum', 'blockchain', 'binance', 'coinbase', 'nft'],
  politica: ['política', 'politica', 'congreso', 'senado', 'diputados', 'gobernador', 'intendente', 'la politica online'],
  seguridad: ['seguridad', 'policía', 'policia', 'delito', 'crimen', 'narcotráfico', 'narcotrafico'],
  sociedad: ['sociedad', 'social', 'protesta', 'manifestación', 'manifestacion', 'paro', 'huelga'],
  espectaculos: ['espectáculos', 'espectaculos', 'famosos', 'celebrities', 'televisión', 'television', 'cine', 'música', 'musica']
})

/* ================
   Hook principal
   ================ */
export const useArticles = (selectedCategories: string[] = []) => {
  const BATCH_SIZE = 10 // size chico para devices básicos
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isCategoryChanging, setIsCategoryChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const publishedDate = new Date(dateString)
    const diffInMinutes = Math.floor(
      (now.getTime() - publishedDate.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    }
    const days = Math.floor(diffInMinutes / 1440)
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  }

  const fetchArticles = async (page: number = 0, append: boolean = false, isCategoryChange: boolean = false) => {
    try {
      if (page === 0) {
        if (isCategoryChange) {
          setIsCategoryChanging(true)
        } else {
          setLoading(true)
          // Only clear articles on initial load, not on category changes
          if (!isCategoryChange) {
            setArticles([])
          }
        }
        setCurrentPage(0)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      console.log('🔄 Cargando noticias desde api.centinela.news...')

      // --- Total de registros (primera página) ---
      if (page === 0) {
        try {
          console.log('🔍 Intentando obtener count de artículos...')
          const { count, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
          
          if (countError) {
            console.log('🔌 API no disponible, usando datos de ejemplo')
            handleFallbackToMockData(
              page,
              append,
              setArticles,
              setTotalCount,
              setCurrentPage,
              setHasMore,
              setError,
              BATCH_SIZE,
              mockArticles
            )
            return
          }
          setTotalCount(count || 0)
          console.log(`📊 ${count} noticias disponibles en Centinela`)
        } catch (countErr) {
          console.log('🔌 Conexión no disponible, usando datos de ejemplo')
          handleFallbackToMockData(
            page,
            append,
            setArticles,
            setTotalCount,
            setCurrentPage,
            setHasMore,
            setError,
            BATCH_SIZE,
            mockArticles
          )
          return
        }
      }

      // --- Traer artículos ---
      try {
        console.log('🔍 Intentando obtener artículos...')
        const { data, error: articlesError } = await supabase
          .from('articles')
          .select('*, rss_sources!inner(name, category)')
          .order('published_at', { ascending: false })
          .range(page * BATCH_SIZE, page * BATCH_SIZE + BATCH_SIZE - 1)

        if (articlesError) {
          console.log('🔌 API no disponible, usando datos de ejemplo')
          handleFallbackToMockData(
            page,
            append,
            setArticles,
            setTotalCount,
            setCurrentPage,
            setHasMore,
            setError,
            BATCH_SIZE,
            mockArticles
          )
          return
        }

        if (!data || data.length === 0) {
          console.log('📰 No hay más noticias disponibles')
          if (page === 0) {
            console.log('🔄 No hay noticias, usando datos de ejemplo...')
            handleFallbackToMockData(
              page,
              append,
              setArticles,
              setTotalCount,
              setCurrentPage,
              setHasMore,
              setError,
              BATCH_SIZE,
              mockArticles
            )
            return
          }
          setHasMore(false)
          return
        }

        console.log(`✅ ${data.length} noticias cargadas desde Centinela API (página ${page + 1})`)

      } catch (networkError) {
        console.log('🔌 Conexión no disponible, usando datos de ejemplo')
        handleFallbackToMockData(
          page,
          append,
          setArticles,
          setTotalCount,
          setCurrentPage,
          setHasMore,
          setError,
          BATCH_SIZE,
          mockArticles
        )
        return
      }
      
      // Continuar con el procesamiento de datos reales...

      // --- Ordenar por prioridad ---
      const priority = buildPriorityDict()
      const sortedData = data.sort((a: ArticleWithSource, b: ArticleWithSource) => {
        const score = (article: ArticleWithSource): number => {
          const title = article.title.toLowerCase()
          const category = article.category.toLowerCase()
          const content = (article.description || article.content || '').toLowerCase()
          if (
            article.is_breaking ||
            priority.breaking.some(
              (t) =>
                title.includes(t) || category.includes(t) || content.includes(t)
            )
          )
            return 1000
          if (priority.milei.some((t) => title.includes(t) || content.includes(t)))
            return 900
          if (
            priority.elecciones2025.some(
              (t) => title.includes(t) || content.includes(t)
            )
          )
            return 850
          if (
            priority.economia.some(
              (t) =>
                title.includes(t) || category.includes(t) || content.includes(t)
            )
          )
            return 800
          if (
            priority.tecnologia.some(
              (t) =>
                title.includes(t) || category.includes(t) || content.includes(t)
            )
          )
            return 700
          if (
            priority.deportes.some(
              (t) =>
                title.includes(t) || category.includes(t) || content.includes(t)
            )
          )
            return 650
          if (
            priority.internacional.some(
              (t) =>
                title.includes(t) || category.includes(t) || content.includes(t)
            )
          )
            return 600
          if (
            priority.cripto.some(
              (t) =>
                title.includes(t) || category.includes(t) || content.includes(t)
            )
          )
            return 550
          return 400
        }
        const aScore = score(a)
        const bScore = score(b)
        if (aScore !== bScore) return bScore - aScore
        return (
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        )
      })

      // --- Mapear a modelo UI + snippet ---
      const formatted: NewsArticle[] = await Promise.all(
        sortedData.map(async (article: ArticleWithSource) => {
          const rawContent =
            article.ai_summary ||
            article.description ||
            article.content ||
            'No hay contenido disponible.'
          const aiSnippet = processContentForSnippet(rawContent, 600)

          const baseLikes = Math.floor(Math.random() * 500) + 100
          const totalLikes = baseLikes // (placeholder: sin likes reales)

          return {
            id: article.id,
            title: article.title,
            content: aiSnippet,
            timeAgo: formatTimeAgo(article.published_at),
            label: getCategoryLabel(article, priority),
            image:
              article.image_url ||
              'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
            likes: totalLikes,
            comments: Math.floor(Math.random() * 300) + 50,
            source: (article as any).rss_sources?.name || 'Centinela',
            link: article.url || '#',
          }
        })
      )

      if (append && page > 0) {
        setArticles((prev) => [...prev, ...formatted])
        console.log(
          `🎉 Appended ${formatted.length} articles (total: ${
            articles.length + formatted.length
          })`
        )
      } else {
        // --- Filtrado por categorías seleccionadas ---
        const filtered =
          selectedCategories.length === 0
            ? formatted
            : formatted.filter((art) => {
                const label = art.label.toLowerCase()
                const title = art.title.toLowerCase()
                const content = art.content.toLowerCase()
                return selectedCategories.some((catSel) => {
                  const c = catSel.toLowerCase()
                  if (label.includes(c)) return true
                  switch (c) {
                    case 'tecnología':
                      return (
                        label.includes('tecnología') ||
                        title.includes('tecnología') ||
                        title.includes('tech') ||
                        title.includes('ia') ||
                        title.includes('inteligencia artificial') ||
                        title.includes('apple') ||
                        title.includes('google') ||
                        content.includes('tecnología') ||
                        content.includes('tech')
                      )
                    case 'política':
                      return (
                        label.includes('política') ||
                        label.includes('milei') ||
                        title.includes('política') ||
                        title.includes('milei') ||
                        content.includes('política') ||
                        content.includes('milei')
                      )
                    case 'milei':
                      return (
                        label.includes('milei') ||
                        title.includes('milei') ||
                        title.includes('presidente') ||
                        content.includes('milei') ||
                        content.includes('presidente')
                      )
                    case 'elecciones2025':
                      return (
                        label.includes('elecciones') ||
                        title.includes('elecciones') ||
                        title.includes('campaña') ||
                        title.includes('candidatos') ||
                        title.includes('ballotage') ||
                        content.includes('elecciones') ||
                        content.includes('campaña')
                      )
                    case 'economía':
                      return (
                        label.includes('economía') ||
                        title.includes('economía') ||
                        title.includes('dólar') ||
                        title.includes('inflación') ||
                        title.includes('peso') ||
                        content.includes('economía') ||
                        content.includes('dólar')
                      )
                    case 'deportes':
                      return (
                        label.includes('deportes') ||
                        title.includes('deportes') ||
                        title.includes('fútbol') ||
                        title.includes('messi') ||
                        title.includes('boca') ||
                        content.includes('deportes') ||
                        content.includes('fútbol')
                      )
                    case 'internacional':
                      return (
                        label.includes('internacional') ||
                        title.includes('internacional') ||
                        title.includes('mundo') ||
                        title.includes('eeuu') ||
                        title.includes('europa') ||
                        content.includes('internacional') ||
                        content.includes('mundo')
                      )
                    case 'cripto':
                      return (
                        label.includes('cripto') ||
                        title.includes('cripto') ||
                        title.includes('bitcoin') ||
                        title.includes('ethereum') ||
                        title.includes('blockchain') ||
                        content.includes('cripto') ||
                        content.includes('bitcoin')
                      )
                    case 'cultura':
                      return (
                        label.includes('cultura') ||
                        title.includes('cultura') ||
                        title.includes('entretenimiento') ||
                        content.includes('cultura') ||
                        content.includes('entretenimiento')
                      )
                    case 'espectaculos':
                      return (
                        label.includes('espectáculos') ||
                        title.includes('espectáculos') ||
                        title.includes('famosos') ||
                        title.includes('celebrities') ||
                        content.includes('espectáculos') ||
                        content.includes('famosos')
                      )
                    case 'salud':
                      return (
                        label.includes('salud') ||
                        title.includes('salud') ||
                        title.includes('medicina') ||
                        content.includes('salud') ||
                        content.includes('medicina')
                      )
                    case 'sociedad':
                      return (
                        label.includes('sociedad') ||
                        title.includes('sociedad') ||
                        title.includes('protesta') ||
                        title.includes('manifestación') ||
                        content.includes('sociedad') ||
                        content.includes('protesta')
                      )
                    case 'seguridad':
                      return (
                        label.includes('seguridad') ||
                        title.includes('seguridad') ||
                        title.includes('policía') ||
                        title.includes('delito') ||
                        content.includes('seguridad') ||
                        content.includes('policía')
                      )
                    default:
                      return (
                        label.includes(c) ||
                        title.includes(c) ||
                        content.includes(c)
                      )
                  }
                })
              })

        setArticles(filtered)
        console.log(
          `🎉 Loaded and formatted ${formatted.length} articles${
            selectedCategories.length
              ? ` (filtered to ${filtered.length} by ${selectedCategories.join(', ')})`
              : ''
          }`
        )
      }

      // hasMore
      const hasMoreArticles =
        formatted.length === BATCH_SIZE &&
        page * BATCH_SIZE + formatted.length < totalCount
      setHasMore(hasMoreArticles)
      setCurrentPage(page)
    } catch (err: any) {
      console.log('🔌 Conexión no disponible, usando datos de ejemplo')
      const offline =
        (err instanceof Error && err.message?.includes('Failed to fetch')) ||
        err?.message?.includes?.('timeout') ||
        err?.message?.includes?.('Connection') ||
        err?.message?.includes?.('Network') ||
        err?.message?.includes?.('Supabase') ||
        err?.name === 'TypeError' ||
        err?.code === 'NETWORK_ERROR' ||
        (typeof navigator !== 'undefined' && !navigator.onLine)

      if (offline) {
        console.log('🔌 Usando datos de ejemplo')
        handleFallbackToMockData(
          page,
          append,
          setArticles,
          setTotalCount,
          setCurrentPage,
          setHasMore,
          setError,
          BATCH_SIZE,
          mockArticles
        )
      } else {
        console.log('🔌 Usando datos de ejemplo')
        handleFallbackToMockData(
          page,
          append,
          setArticles,
          setTotalCount,
          setCurrentPage,
          setHasMore,
          setError,
          BATCH_SIZE,
          mockArticles
        )
      }
    } finally {
      if (page === 0) {
        if (isCategoryChange) {
          setIsCategoryChanging(false)
        } else {
          setLoading(false)
        }
      } else {
        setLoadingMore(false)
      }
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    const nextPage = currentPage + 1
    console.log(`🔄 Loading more articles (page ${nextPage + 1})…`)
    await fetchArticles(nextPage, true)
  }, [currentPage, loadingMore, hasMore])

  // Initial load
  useEffect(() => {
    console.log('🚀 Initial articles load')
    fetchArticles(0, false, false)
  }, [])

  // Category changes
  useEffect(() => {
    // Skip initial empty categories array to avoid double loading
    if (articles.length > 0) {
      console.log('🔄 Categories changed:', selectedCategories)
      fetchArticles(0, false, true)
    }
  }, [selectedCategories.join('|'), articles.length])

  const refetch = () => {
    setCurrentPage(0)
    fetchArticles(0, false, false)
  }

  return {
    articles,
    loading,
    loadingMore,
    isCategoryChanging,
    error,
    hasMore,
    totalArticles: totalCount,
    loadedArticles: articles.length,
    refetch,
    loadMore,
  }
}