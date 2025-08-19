import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import LanguageBoundary from '@/components/LanguageBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KrishiAI - AI-Powered Agricultural Decision Support System',
  description: 'Empowering Indian farmers with real-time market intelligence, storage optimization, and voice-first accessibility for better agricultural decisions.',
  keywords: 'agriculture, AI, farmers, market prices, decision support, India, crop management',
  authors: [{ name: 'Capital One Hackathon Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global language provider to enable site-wide translation */}
        {/* eslint-disable-next-line react/jsx-no-undef */}
        <LanguageBoundary>
          {children}
        </LanguageBoundary>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
