import { NextResponse } from 'next/server'
import { getMarketPrices, getMLMarketPredictionWithRealPrices } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, context, language } = body as { prompt: string; context?: any; language?: 'en' | 'hi' | 'pa' }

    // Internal-first handling for price/market queries when we have user context
    const crop: string | undefined = context?.crop
    const location: string | undefined = context?.location
    const isPriceIntent = detectPriceIntent(prompt, language)

    if (isPriceIntent && crop && location) {
      try {
        // Get latest mandi price and ML prediction using our internal services
        const [prices, ml] = await Promise.all([
          getMarketPrices(crop, location),
          getMLMarketPredictionWithRealPrices(crop, location).catch(() => null)
        ])

        const latest = prices?.[0]
        if (latest) {
          const text = buildInternalPriceAnswer({
            crop,
            location,
            latestPrice: latest.price,
            latestDate: latest.date,
            mandi: latest.mandi,
            ml,
            recentPrices: prices
          }, language)

          return NextResponse.json({ text, model: 'internal', timestamp: new Date().toISOString(), context }, { status: 200 })
        }
      } catch (e) {
        // If internal fetch fails, fall through to external model below
        console.error('Internal price handling failed, falling back to LLM:', e)
      }
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ text: '' }, { status: 200 })
    }

    // Enrich system prompt with internal facts when available
    const facts = await buildInternalFactsBlock(crop, location)
    const system = buildSystemPrompt(language, context, facts)

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 500
      })
    })

    if (!resp.ok) {
      return NextResponse.json({ text: '' }, { status: 200 })
    }
    const data = await resp.json()
    const rawText = data?.choices?.[0]?.message?.content || ''
    let text = sanitizePlainText(rawText)
    // Enforce target language for voice/UI consistency if the model ignored instruction
    if (language && apiKey) {
      const needsHindi = language === 'hi' && !containsScript(text, 'hi')
      const needsPunjabi = language === 'pa' && !containsScript(text, 'pa')
      if (needsHindi || needsPunjabi) {
        try {
          text = await forceTranslatePlain(text, language, apiKey)
        } catch {
          // keep sanitized English text as fallback
        }
      }
    }
    return NextResponse.json({ text, model: data?.model, timestamp: new Date().toISOString(), context }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ text: '' }, { status: 200 })
  }
}

function buildSystemPrompt(language: 'en' | 'hi' | 'pa' | undefined, context: any, internalFacts?: string) {
  const lang = language || 'en'
  const langLine = lang === 'hi' ? 'Respond in Hindi.' : lang === 'pa' ? 'Respond in Punjabi.' : 'Respond in English.'
  const crop = context?.crop || 'wheat'
  const location = context?.location || 'Punjab'
  const qty = context?.quantity || '10'
  return [
    'You are KrishiAI, an agricultural assistant for Punjab farmers.',
    'Be concise and practical. Prefer 3-5 bullet points when applicable.',
    'Include market timing, storage vs sell, and weather precautions if relevant.',
    `Context: crop=${crop}, location=${location}, quantity=${qty} tons.`,
    internalFacts ? `Internal facts (authoritative, prefer these over the internet):\n${internalFacts}` : undefined,
    internalFacts ? 'When asked about prices or predictions, use the internal facts strictly and cite them as coming from the dashboard and our ML model.' : undefined,
    langLine
  ].filter(Boolean).join('\n')
}

function detectPriceIntent(prompt: string, language: 'en' | 'hi' | 'pa' | undefined): boolean {
  const p = (prompt || '').toLowerCase()
  const keywords = [
    'price', 'rate', 'cost', 'value', 'market price', 'mandi price', 'bhav',
    'कीमत', 'दर', 'मंडी', 'भाव', 'मूल्य', 'रेट', 'आज का भाव', 'भव'
  ]
  return keywords.some(k => p.includes(k))
}

function buildInternalPriceAnswer(
  params: {
    crop: string
    location: string
    latestPrice: number
    latestDate?: string
    mandi?: string
    ml: any
    recentPrices?: Array<{ price: number; date: string }>
  },
  language: 'en' | 'hi' | 'pa' | undefined
): string {
  const { crop, location, latestPrice, latestDate, mandi, ml, recentPrices } = params

  const trendPct = computeTrendPercent(recentPrices)
  const nextDay = coerceNumber(ml?.nextDayPrice) ?? estimateFuture(latestPrice, trendPct, 0.4)
  const nextWeek = coerceNumber(ml?.nextWeekPrice) ?? estimateFuture(latestPrice, trendPct, 0.9)
  const nextMonth = coerceNumber(ml?.nextMonthPrice) ?? estimateFuture(latestPrice, trendPct, 1.4)

  const priceLineEn = `Selected crop: ${crop}. Location: ${location}. Latest mandi price is ₹${formatMoney(latestPrice)} per quintal${mandi ? ` at ${mandi}` : ''}${latestDate ? ` (date ${latestDate})` : ''}.`
  const priceLineHi = `चयनित फसल: ${crop}. स्थान: ${location}. नवीनतम मंडी भाव ₹${formatMoney(latestPrice)} प्रति क्विंटल${mandi ? ` (${mandi})` : ''}${latestDate ? ` (दिनांक ${latestDate})` : ''} है।`
  const priceLinePa = `ਚੁਣੀ ਫਸਲ: ${crop}. ਥਾਂ: ${location}. ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ₹${formatMoney(latestPrice)} ਪ੍ਰਤੀ ਕਵਿੰਟਲ${mandi ? ` (${mandi})` : ''}${latestDate ? ` (ਤਾਰੀਖ ${latestDate})` : ''} ਹੈ।`

  const mlPartEn = ` Next Day: ₹${formatMoney(nextDay)}  |  Next Week: ₹${formatMoney(nextWeek)}  |  Next Month: ₹${formatMoney(nextMonth)}.` + (ml?.action ? ` Suggested action: ${sanitizePlainText(ml.action.replace('_', ' '))}.` : '')
  const mlPartHi = ` अगले दिन: ₹${formatMoney(nextDay)}  |  अगले सप्ताह: ₹${formatMoney(nextWeek)}  |  अगले महीने: ₹${formatMoney(nextMonth)}.` + (ml?.action ? ` सुझाव: ${translateAction(ml.action, 'hi')}.` : '')
  const mlPartPa = ` ਅਗਲਾ ਦਿਨ: ₹${formatMoney(nextDay)}  |  ਅਗਲਾ ਹਫ਼ਤਾ: ₹${formatMoney(nextWeek)}  |  ਅਗਲਾ ਮਹੀਨਾ: ₹${formatMoney(nextMonth)}.` + (ml?.action ? ` ਸੁਝਾਅ: ${translateAction(ml.action, 'pa')}.` : '')

  const lang = language || 'en'
  if (lang === 'hi') return `${priceLineHi} ${mlPartHi}`.trim()
  if (lang === 'pa') return `${priceLinePa} ${mlPartPa}`.trim()
  return `${priceLineEn} ${mlPartEn}`.trim()
}

function translateAction(action: string, lang: 'hi' | 'pa'): string {
  const normalized = (action || '').toLowerCase()
  if (lang === 'hi') {
    if (normalized.includes('sell')) return 'अभी बेचें'
    if (normalized.includes('store') || normalized.includes('hold')) return 'रोक कर रखें'
    return 'निगरानी करें'
  }
  // pa
  if (normalized.includes('sell')) return 'ਹੁਣੇ ਵੇਚੋ'
  if (normalized.includes('store') || normalized.includes('hold')) return 'ਰੱਖੋ/ਸੰਭਾਲੋ'
  return 'ਨਿਗਰਾਨੀ ਕਰੋ'
}

async function buildInternalFactsBlock(crop?: string, location?: string): Promise<string | undefined> {
  if (!crop || !location) return undefined
  try {
    const [prices, ml] = await Promise.all([
      getMarketPrices(crop, location),
      getMLMarketPredictionWithRealPrices(crop, location).catch(() => null)
    ])
    const latest = prices?.[0]
    if (!latest) return undefined
    const trendPct = computeTrendPercent(prices)
    const nextDay = coerceNumber(ml?.nextDayPrice) ?? estimateFuture(latest.price, trendPct, 0.4)
    const nextWeek = coerceNumber(ml?.nextWeekPrice) ?? estimateFuture(latest.price, trendPct, 0.9)
    const lines = [
      `Selected crop: ${crop}`,
      `Selected location: ${location}`,
      `Latest mandi price: ₹${formatMoney(latest.price)} at ${latest.mandi || 'selected mandi'} on ${latest.date}`,
      `Predictions: Next Day ₹${formatMoney(nextDay)}, Next Week ₹${formatMoney(nextWeek)}`
    ]
    if (ml?.action) {
      lines.push(`Suggested action: ${sanitizePlainText(ml.action)}`)
    }
    return lines.join('\n')
  } catch (e) {
    console.error('Failed to build internal facts:', e)
    return undefined
  }
}

// Utilities
function sanitizePlainText(text: string): string {
  if (!text) return ''
  const original = String(text)
  // Remove markdown link syntax [text](url) -> text
  const noLinks = original.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
  // Remove code fences/backticks
  const noBackticks = noLinks.replace(/```/g, '').replace(/`/g, '')
  // Remove bold/italic markers and underscores
  const noStarsUnderscores = noBackticks.replace(/\*\*|\*|__/g, '')
  // Remove headings and blockquotes markers
  const noHashes = noStarsUnderscores.replace(/#/g, '').replace(/^>\s?/gm, '')
  // Remove list/table markers
  const deListed = noHashes
    .replace(/^\s*[-*+•]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\|/g, ' ')
  // Replace NaN with N/A
  const noNaN = deListed.replace(/NaN/gi, 'N/A')
  // Collapse whitespace and join lines neatly
  return noNaN.replace(/\s+/g, ' ').trim()
}

function coerceNumber(value: any): number | undefined {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function formatMoney(value: any): string {
  const n = coerceNumber(value)
  if (n === undefined) return '0.00'
  return n.toFixed(2)
}

function computeTrendPercent(prices?: Array<{ price: number }>): number {
  if (!prices || prices.length < 2) return 0
  const p0 = coerceNumber(prices[0]?.price) ?? 0
  const p1 = coerceNumber(prices[1]?.price) ?? p0
  if (!p1) return 0
  let pct = (p0 - p1) / p1
  if (!Number.isFinite(pct)) pct = 0
  // Clamp daily trend to ±5%
  return Math.max(-0.05, Math.min(0.05, pct))
}

function estimateFuture(latest: number, trendPct: number, scale: number): number {
  const base = coerceNumber(latest) ?? 0
  const adj = 1 + trendPct * scale
  const val = base * adj
  return Number.isFinite(val) ? val : base
}

function containsScript(text: string, lang: 'en' | 'hi' | 'pa'): boolean {
  if (!text) return false
  if (lang === 'hi') {
    return /[\u0900-\u097F]/.test(text)
  }
  if (lang === 'pa') {
    return /[\u0A00-\u0A7F]/.test(text)
  }
  // English: presence of Latin letters
  return /[A-Za-z]/.test(text)
}

async function forceTranslatePlain(text: string, target: 'en' | 'hi' | 'pa', apiKey: string): Promise<string> {
  const system = target === 'hi'
    ? 'Translate the user content into Hindi. Output plain text only. No markdown, no asterisks, no headings.'
    : target === 'pa'
    ? 'Translate the user content into Punjabi (Gurmukhi). Output plain text only. No markdown, no asterisks, no headings.'
    : 'Translate the user content into English. Output plain text only.'
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
      max_tokens: 400
    })
  })
  if (!resp.ok) return text
  const data = await resp.json().catch(() => null)
  const out = data?.choices?.[0]?.message?.content || text
  return sanitizePlainText(out)
}


