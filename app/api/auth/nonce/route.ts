import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createNonceChallenge } from '@/lib/nonce'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

function createRateLimitResponse(retryAfterSeconds: number, remaining: number, limit: number): NextResponse {
    return NextResponse.json(
        { error: 'Too many nonce requests. Please try again shortly.' },
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

export async function GET(request: NextRequest): Promise<NextResponse> {
    const identifier = getClientIdentifier(request)
    const rateLimit = await checkRateLimit({
        identifier,
        keyPrefix: 'api:auth:nonce',
        maxRequests: 20,
        windowMs: 60_000
    })

    if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.retryAfterSeconds, rateLimit.remaining, rateLimit.limit)
    }

    const challenge = createNonceChallenge()

    return NextResponse.json(challenge, {
        headers: {
            'Cache-Control': 'no-store'
        }
    })
}
