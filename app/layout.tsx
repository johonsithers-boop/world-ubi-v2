import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@/lib/env.server'
import { MiniKitProvider } from '@/components/providers/MiniKitProvider'
import { MobileDebugger } from '@/components/MobileDebugger'

export const metadata: Metadata = {
  title: 'World UBI Coin',
  description: 'Universal Basic Income for Everyone - Earn passive income through World ID verification',
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
    <MiniKitProvider>
      <MobileDebugger />
      {children}
    </MiniKitProvider>
  )
}
