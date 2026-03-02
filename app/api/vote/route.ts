import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getServerSession } from 'next-auth'
import { addVote, getVoteCounts } from '@/lib/db/votes'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

function createRateLimitResponse(retryAfterSeconds: number, remaining: number, limit: number): NextResponse {
    return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again.' },
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

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions)
        const address = session?.user?.address

        if (!address) {
            return NextResponse.json(
                { error: 'Authentication required. Please sign in with your wallet.' },
                { status: 401 }
            )
        }

        const identifier = `${getClientIdentifier(request)}:${address}`
        const rateLimit = await checkRateLimit({
            identifier,
            keyPrefix: 'api:vote:post',
            maxRequests: 5,
            windowMs: 60_000
        })

        if (!rateLimit.allowed) {
            return createRateLimitResponse(rateLimit.retryAfterSeconds, rateLimit.remaining, rateLimit.limit)
        }

        const body = (await request.json()) as {
            pollId?: string
            optionIndex?: number
        }
        const pollId = body.pollId?.trim()
        const optionIndexRaw = body.optionIndex

        if (!pollId || !Number.isInteger(optionIndexRaw)) {
            return NextResponse.json(
                { error: 'pollId and optionIndex are required' },
                { status: 400 }
            )
        }

        const optionIndex = optionIndexRaw as number

        if (optionIndex < 0 || optionIndex > 20) {
            return NextResponse.json(
                { error: 'Invalid optionIndex value' },
                { status: 400 }
            )
        }

        const voterFingerprint = crypto
            .createHash('sha256')
            .update(address.toLowerCase())
            .digest('hex')

        const result = await addVote(pollId, optionIndex, voterFingerprint)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Unable to register vote' },
                { status: 409 }
            )
        }

        const { totalVotes, voteCounts } = await getVoteCounts(pollId)

        return NextResponse.json({
            success: true,
            pollId,
            totalVotes,
            voteCounts
        })
    } catch (error) {
        logger.error('Vote POST API error', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const identifier = getClientIdentifier(request)
        const rateLimit = await checkRateLimit({
            identifier,
            keyPrefix: 'api:vote:get',
            maxRequests: 60,
            windowMs: 60_000
        })

        if (!rateLimit.allowed) {
            return createRateLimitResponse(rateLimit.retryAfterSeconds, rateLimit.remaining, rateLimit.limit)
        }

        const { searchParams } = new URL(request.url)
        const pollId = searchParams.get('pollId')

        if (!pollId) {
            return NextResponse.json(
                { error: 'pollId query parameter is required' },
                { status: 400 }
            )
        }

        const { totalVotes, voteCounts } = await getVoteCounts(pollId)

        return NextResponse.json({
            pollId,
            totalVotes,
            voteCounts
        })
    } catch (error) {
        logger.error('Vote GET API error', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
