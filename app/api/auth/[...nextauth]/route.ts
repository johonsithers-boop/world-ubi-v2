import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

const handler = NextAuth(authOptions)
type AuthRouteContext = { params: Promise<{ nextauth: string[] }> }

function createRateLimitResponse(retryAfterSeconds: number, remaining: number, limit: number): NextResponse {
    return NextResponse.json(
        { error: 'Too many authentication requests. Please try again shortly.' },
        {
            status: 429,
            headers: {
                'Retry-After': String(retryAfterSeconds),
                'X-RateLimit-Limit': String(limit),
                'X-RateLimit-Remaining': String(remaining)
            }
        }
    )
}

export async function GET(request: NextRequest, context: AuthRouteContext): Promise<Response> {
    const identifier = getClientIdentifier(request)
    const rateLimit = await checkRateLimit({
        identifier,
        keyPrefix: 'api:auth:get',
        maxRequests: 60,
        windowMs: 60_000
    })

    if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.retryAfterSeconds, rateLimit.remaining, rateLimit.limit)
    }

    return handler(request, context)
}

export async function POST(request: NextRequest, context: AuthRouteContext): Promise<Response> {
    const identifier = getClientIdentifier(request)
    const rateLimit = await checkRateLimit({
        identifier,
        keyPrefix: 'api:auth:post',
        maxRequests: 10,
        windowMs: 60_000
    })

    if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.retryAfterSeconds, rateLimit.remaining, rateLimit.limit)
    }

    return handler(request, context)
}
