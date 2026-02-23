'use client'

import { MiniKit } from '@worldcoin/minikit-js'
import { ReactNode, useEffect, useRef } from 'react'
import { isMiniKitInstalled, isWorldAppBrowser } from '@/lib/minikit'

export function MiniKitProvider({ children }: { children: ReactNode }) {
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        if (isWorldAppBrowser() && !isMiniKitInstalled()) {
            const appId = process.env.NEXT_PUBLIC_APP_ID
            try {
                MiniKit.install(appId)
            } catch {
                // Ignore install failures and rely on runtime checks.
            }
        }

        // Deep link handling
        const handleDeepLink = () => {
            if (window.location.search.includes('payload')) {
                // Handle deep link payload
            }
        }

        window.addEventListener('popstate', handleDeepLink)

        return () => {
            window.removeEventListener('popstate', handleDeepLink)
        }
    }, [])

    return (
        <>
            {children}
        </>
    )
}
