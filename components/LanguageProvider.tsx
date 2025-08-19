'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type SupportedLanguage = 'en' | 'hi' | 'pa'

type LanguageContextValue = {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

// Minimal i18n dictionary. Fallbacks to English if key/language missing.
const DICTIONARY: Record<string, { en: string; hi?: string; pa?: string }> = {
  'app.title': { en: 'KrishiAI', hi: 'कृषिAI', pa: 'ਕ੍ਰਿਸ਼ੀAI' },
  'app.subtitle': { en: 'Punjab Agricultural Intelligence', hi: 'पंजाब कृषि इंटेलिजेंस', pa: 'ਪੰਜਾਬ ਖੇਤੀਬਾੜੀ ਇੰਟੈਲੀਜੈਂਸ' },
  'voice.active': { en: 'Voice Assistant Active - Say "Voice Assistant"', hi: 'वॉइस असिस्टेंट सक्रिय - कहें "वॉइस असिस्टेंट"', pa: 'ਆਵਾਜ਼ ਸਹਾਇਕ ਸਕ੍ਰਿਯ - ਕਹੋ "ਵੌਇਸ ਅਸਿਸਟੈਂਟ"' },
  'enter.details': { en: 'Enter Your Details', hi: 'अपनी जानकारी दर्ज करें', pa: 'ਆਪਣੀ ਜਾਣਕਾਰੀ ਦਾਖਲ ਕਰੋ' },
  'field.district': { en: 'District', hi: 'जिला', pa: 'ਜ਼ਿਲ੍ਹਾ' },
  'field.crop.any': { en: 'Crop (Any)', hi: 'फसल (कोई भी)', pa: 'ਫਸਲ (ਕੋਈ ਵੀ)' },
  'field.market': { en: 'Market (Mandi)', hi: 'बाज़ार (मंडी)', pa: 'ਮਾਰਕੀਟ (ਮੰਡੀ)' },
  'field.quantity.tons': { en: 'Quantity (tons)', hi: 'मात्रा (टन)', pa: 'ਮਾਤਰਾ (ਟਨ)' },
  'cta.start': { en: 'Start Market Analysis', hi: 'मार्केट विश्लेषण शुरू करें', pa: 'ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ' },
  'hint.press.enter': { en: 'Press Enter in any field or click the button above to start analysis', hi: 'विश्लेषण शुरू करने के लिए किसी भी फ़ील्ड में Enter दबाएँ या ऊपर दिए बटन पर क्लिक करें', pa: 'ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕਿਸੇ ਵੀ ਫੀਲਡ ਵਿੱਚ ਐਨਟਰ ਦਬਾਓ ਜਾਂ ਉੱਤੇ ਦੇ ਬਟਨ ਤੇ ਕਲਿਕ ਕਰੋ' },
  'tab.market': { en: 'Market Intelligence', hi: 'मार्केट इंटेलिजेंस', pa: 'ਮਾਰਕੀਟ ਇੰਟੈਲੀਜੈਂਸ' },
  'tab.storage': { en: 'Storage Optimization', hi: 'भंडारण अनुकूलन', pa: 'ਸਟੋਰੇਜ ਅਪਟੀਮਾਈਜ਼ੇਸ਼ਨ' },
  'tab.cooperative': { en: 'Cooperative Selling', hi: 'सहकारी बिक्री', pa: 'ਸਹਿਕਾਰੀ ਵਿਕਰੀ' },
  'tab.weather': { en: 'Weather & Climate', hi: 'मौसम और जलवायु', pa: 'ਮੌਸਮ ਅਤੇ ਜਲਵਾਯੂ' },
  'tab.ai': { en: 'AI Insights', hi: 'AI इनसाइट्स', pa: 'AI ਇਨਸਾਈਟਸ' },
  'tab.calendar': { en: 'Crop Calendar', hi: 'फसल कैलेंडर', pa: 'ਫਸਲ ਕੈਲੰਡਰ' },
  'tab.finance': { en: 'Financial Calculator', hi: 'वित्तीय कैलकुलेटर', pa: 'ਵਿੱਤੀ ਕੈਲਕੁਲੇਟਰ' },
  'tab.supply': { en: 'Supply Chain', hi: 'सप्लाई चेन', pa: 'ਸਪਲਾਈ ਚੇਨ' }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('uiLanguage') as SupportedLanguage | null) : null
    if (saved === 'en' || saved === 'hi' || saved === 'pa') setLanguageState(saved)
  }, [])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    try { localStorage.setItem('uiLanguage', lang) } catch {}
  }

  const t = (key: string) => {
    const entry = DICTIONARY[key]
    if (!entry) return key
    return (entry[language] || entry.en)
  }

  const value = useMemo(() => ({ language, setLanguage, t }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}


