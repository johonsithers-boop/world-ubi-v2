import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'es']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
    const negotiator = new Negotiator({
        headers: {
            'accept-language': request.headers.get('accept-language') || defaultLocale
        }
    })

    const languages = negotiator.languages()
    try {
        return match(languages, locales, defaultLocale)
    } catch {
        return defaultLocale
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip proxy for API routes, static files, etc.
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return
    }

    // Check if pathname already has a locale
    const pathnameHasLocale = locales.some(
        locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect to locale-prefixed path
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`

    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',]
}
