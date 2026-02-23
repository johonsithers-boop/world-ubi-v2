type WorldWindow = Window & {
    MiniKit?: unknown
    WorldApp?: unknown
}

function getBrowserWindow(): WorldWindow | null {
    if (typeof window === 'undefined') return null
    return window as WorldWindow
}

export function isWorldAppBrowser(): boolean {
    const browserWindow = getBrowserWindow()
    return Boolean(browserWindow?.WorldApp)
}

export function isMiniKitInstalled(): boolean {
    const browserWindow = getBrowserWindow()
    return Boolean(browserWindow?.MiniKit)
}
