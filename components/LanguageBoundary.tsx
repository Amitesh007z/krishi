'use client'

import React from 'react'
import { LanguageProvider } from './LanguageProvider'

export default function LanguageBoundary({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}


