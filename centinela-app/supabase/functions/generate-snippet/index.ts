import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, title } = await req.json()

    if (!content && !title) {
      return new Response(
        JSON.stringify({ error: 'Se requiere contenido o título' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key no configurada' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare content for OpenAI
    const textToSummarize = content || title || 'Sin contenido disponible'

    // Call OpenAI API with retry mechanism
    let openaiResponse
    const maxRetries = 3
    let retryCount = 0
    
    while (retryCount <= maxRetries) {
      try {
        openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `PROMPT ACTUAL PARA SNIPPETS:

Eres un editor de noticias experto especializado en crear resúmenes informativos para redes sociales. Tu tarea es crear un resumen que permita a los lectores entender completamente QUÉ PASÓ en la noticia para que puedan comentar sin leer el artículo completo.

REGLAS ESTRICTAS:
- Entre 400-600 caracteres (incluyendo espacios) para dar más contexto
- Escribe en español
- Usa un tono conversacional y directo, como si le contaras a un amigo
- EXPLICA QUÉ PASÓ: incluye los hechos principales, causas y consecuencias
- Incluye datos específicos: números, fechas, nombres importantes
- Responde las preguntas: ¿Qué? ¿Quién? ¿Cuándo? ¿Dónde? ¿Por qué?
- SIEMPRE termina con una oración completa (no cortes palabras ni frases)
- NO uses puntos suspensivos (...) al final
- Prefiere ser informativo que llamativo
- NO uses frases como "¿Qué pasó?" o preguntas introductorias
- Ve directo al punto con los hechos más relevantes
- Usa conectores como "porque", "debido a", "como resultado" para explicar relaciones causa-efecto`
              },
              {
                role: 'user',
                content: `Crea un resumen informativo de 400-600 caracteres que explique completamente qué pasó en esta noticia para que los lectores puedan comentar sin leer el artículo:\n\nTítulo: ${title || 'Sin título'}\n\nContenido: ${textToSummarize.substring(0, 3000)}`
              }
            ],
            max_tokens: 200,
            temperature: 0.3,
          }),
        })
        
        // If successful or non-retryable error, break the loop
        if (openaiResponse.ok || (openaiResponse.status !== 429 && openaiResponse.status !== 500 && openaiResponse.status !== 502 && openaiResponse.status !== 503 && openaiResponse.status !== 504)) {
          break
        }
        
        // If it's a rate limit or server error, retry
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000 // Exponential backoff with jitter
          console.log(`Rate limit or server error (${openaiResponse.status}), retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
      } catch (fetchError) {
        console.error(`Fetch error on attempt ${retryCount + 1}:`, fetchError)
        if (retryCount === maxRetries) {
          throw fetchError
        }
      }
      
      retryCount++
    }

    if (!openaiResponse) {
      return new Response(
        JSON.stringify({ 
          error: 'Error al conectar con OpenAI después de varios intentos',
          details: 'No se pudo establecer conexión con la API'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!openaiResponse.ok) {
      let errorMessage = 'Error desconocido de OpenAI'
      try {
        const errorData = await openaiResponse.json()
        console.error('OpenAI API Error after retries:', errorData)
        
        // Extract specific error message from OpenAI response
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        } else if (errorData.error?.code) {
          errorMessage = `OpenAI Error Code: ${errorData.error.code}`
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        
        // Special handling for rate limits
        if (openaiResponse.status === 429) {
          errorMessage = 'Límite de uso de OpenAI alcanzado. Intenta de nuevo en unos minutos.'
        }
        
      } catch (parseError) {
        // If JSON parsing fails, try to get text response
        try {
          const errorText = await openaiResponse.text()
          console.error('OpenAI API Error (text):', errorText)
          errorMessage = errorText || `HTTP ${openaiResponse.status}: ${openaiResponse.statusText}`
        } catch (textError) {
          errorMessage = `HTTP ${openaiResponse.status}: ${openaiResponse.statusText}`
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Error al generar resumen con OpenAI',
          details: errorMessage,
          status: openaiResponse.status
        }),
        { 
          status: openaiResponse.status === 429 ? 429 : 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiData = await openaiResponse.json()
    let snippet = openaiData.choices[0]?.message?.content?.trim() || ''

    // Ensure maximum 600 characters with complete sentences
    if (snippet.length > 600) {
      // Try to find the last complete sentence within 600 characters
      let truncated = snippet.substring(0, 600)
      
      // Look for the last sentence ending
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
      )
      
      // If we found a sentence ending and it's not too early
      if (lastSentenceEnd > 400) {
        snippet = truncated.substring(0, lastSentenceEnd + 1).trim()
      } else {
        // Try to cut at a word boundary and add a period
        const lastSpaceIndex = truncated.lastIndexOf(' ')
        if (lastSpaceIndex > 500) {
          snippet = truncated.substring(0, lastSpaceIndex).trim() + '.'
        } else {
          // Last resort: cut and add period
          snippet = truncated.trim() + '.'
        }
      }
    }

    return new Response(
      JSON.stringify({ snippet }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-snippet function:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})