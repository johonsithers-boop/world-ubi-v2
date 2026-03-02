import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@/lib/env.server'
import { MobileDebugger } from '@/components/MobileDebugger'

export const metadata: Metadata = {
  title: 'Base UBI',
  description: 'Universal Basic Income app on Base with USDC support.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MobileDebugger />
      {children}
    </>
  )
}
