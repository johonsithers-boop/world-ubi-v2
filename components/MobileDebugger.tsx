'use client'

import { useEffect } from 'react'

/**
 * Mobile debugging component using Eruda
 * Only loads in development mode
 * Provides console, network, elements inspection on mobile devices
 */
export function MobileDebugger() {
    useEffect(() => {
        // Only load in development
        if (process.env.NODE_ENV !== 'development') return

        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        if (isMobile) {
            // Dynamically load Eruda
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/eruda'
            script.onload = () => {
                // @ts-expect-error - Eruda is loaded from CDN
                if (window.eruda) {
                    // @ts-expect-error - Eruda is loaded from CDN
                    window.eruda.init()
                }
            }
            document.body.appendChild(script)

            return () => {
                // Cleanup
                // @ts-expect-error - Eruda is loaded from CDN
                if (window.eruda) {
                    // @ts-expect-error - Eruda is loaded from CDN
                    window.eruda.destroy()
                }
                script.remove()
            }
        }
    }, [])

    return null
}
