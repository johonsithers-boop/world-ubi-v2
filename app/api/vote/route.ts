import { NextRequest, NextResponse } from 'next/server'
import { addVote, getVoteCounts, isNullifierUsed } from '@/lib/db/votes'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

interface VoteRequest {
    pollId: string
    optionIndex: number
    nullifierHash: string
}

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
        const identifier = getClientIdentifier(request)
        const rateLimit = await checkRateLimit({
            identifier,
            keyPrefix: 'api:vote:post',
            maxRequests: 20,
            windowMs: 60_000
        })

        if (!rateLimit.allowed) {
            return createRateLimitResponse(rateLimit.retryAfterSeconds, rateLimit.remaining, rateLimit.limit)
        }

        const body = await request.json() as VoteRequest
        const { pollId, optionIndex, nullifierHash } = body

        // Validate required fields
        if (!pollId || optionIndex === undefined || !nullifierHash) {
            return NextResponse.json(
                { error: 'Missing required fields: pollId, optionIndex, and nullifierHash are required' },
                { status: 400 }
            )
        }

        // Validate optionIndex is a non-negative integer
        if (typeof optionIndex !== 'number' || optionIndex < 0 || !Number.isInteger(optionIndex)) {
            return NextResponse.json(
                { error: 'optionIndex must be a non-negative integer' },
                { status: 400 }
            )
        }

        // Check if nullifier has already been used (prevents double voting)
        const alreadyVoted = await isNullifierUsed(pollId, nullifierHash)
        if (alreadyVoted) {
            return NextResponse.json(
                { error: 'You have already voted in this poll' },
                { status: 409 }
            )
        }

        // Record the vote
        const result = await addVote(pollId, optionIndex, nullifierHash)
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to record vote' },
                { status: 409 }
            )
        }

        // Get updated vote counts
        const { totalVotes, voteCounts } = await getVoteCounts(pollId)

        return NextResponse.json({
            success: true,
            message: 'Vote recorded successfully',
            pollId,
            totalVotes,
            voteCounts
        })

    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }
        
        logger.error('Vote API error', error)
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
