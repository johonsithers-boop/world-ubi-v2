import 'server-only'

import type { NextRequest } from 'next/server'
import { serverEnv } from '@/lib/env.server'
import { logger } from '@/lib/logger'

interface RateLimitEntry {
    count: number
    resetAt: number
}

export interface RateLimitOptions {
    identifier: string
    keyPrefix: string
    maxRequests: number
    windowMs: number
}

export interface RateLimitResult {
    allowed: boolean
    limit: number
    remaining: number
    retryAfterSeconds: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const upstashUrl = serverEnv.UPSTASH_REDIS_REST_URL
const upstashToken = serverEnv.UPSTASH_REDIS_REST_TOKEN
const useUpstash = Boolean(upstashUrl && upstashToken)

function pruneExpiredEntries(now: number): void {
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt <= now) {
            rateLimitStore.delete(key)
        }
    }
}

function getRateLimitKey(keyPrefix: string, identifier: string): string {
    return `${keyPrefix}:${identifier}`
}

function toUpstashPathSegment(value: string | number): string {
    return encodeURIComponent(String(value))
}

async function runUpstashCommand(command: string, ...args: Array<string | number>): Promise<unknown> {
    if (!upstashUrl || !upstashToken) {
        throw new Error('Upstash is not configured')
    }

    const commandPath = [command, ...args].map(toUpstashPathSegment).join('/')
    const response = await fetch(`${upstashUrl}/${commandPath}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${upstashToken}`
        },
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error(`Upstash command failed (${response.status}) for command: ${command}`)
    }

    const payload = await response.json() as { error?: string; result?: unknown }
    if (payload.error) {
        throw new Error(`Upstash command error for ${command}: ${payload.error}`)
    }

    return payload.result
}

async function checkRateLimitInUpstash(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult> {
    const countRaw = await runUpstashCommand('incr', key)
    const count = Number(countRaw)
    if (!Number.isFinite(count)) {
        throw new Error(`Invalid Upstash INCR result for ${key}`)
    }

    if (count === 1) {
        await runUpstashCommand('pexpire', key, windowMs)
    }

    const ttlRaw = await runUpstashCommand('pttl', key)
    const ttlMs = Number(ttlRaw)
    const retryAfterSeconds = Number.isFinite(ttlMs) && ttlMs > 0
        ? Math.max(1, Math.ceil(ttlMs / 1000))
        : Math.ceil(windowMs / 1000)

    return {
        allowed: count <= maxRequests,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - count),
        retryAfterSeconds
    }
}

function checkRateLimitInMemory(key: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now()
    pruneExpiredEntries(now)

    const existingEntry = rateLimitStore.get(key)

    if (!existingEntry || existingEntry.resetAt <= now) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + windowMs
        })

        return {
            allowed: true,
            limit: maxRequests,
            remaining: Math.max(0, maxRequests - 1),
            retryAfterSeconds: Math.ceil(windowMs / 1000)
        }
    }

    existingEntry.count += 1
    rateLimitStore.set(key, existingEntry)

    const retryAfterSeconds = Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000))
    const remaining = Math.max(0, maxRequests - existingEntry.count)
    const allowed = existingEntry.count <= maxRequests

    return {
        allowed,
        limit: maxRequests,
        remaining,
        retryAfterSeconds
    }
}

export function getClientIdentifier(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        const firstAddress = forwardedFor.split(',')[0]?.trim()
        if (firstAddress) {
            return firstAddress
        }
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    const userAgent = request.headers.get('user-agent')
    if (userAgent) {
        return `ua:${userAgent}`
    }

    return 'unknown'
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
    const key = getRateLimitKey(options.keyPrefix, options.identifier)

    if (useUpstash) {
        try {
            return await checkRateLimitInUpstash(key, options.maxRequests, options.windowMs)
        } catch (error) {
            logger.warn('Upstash rate limiting failed, falling back to in-memory limiter', error)
        }
    }

    return checkRateLimitInMemory(key, options.maxRequests, options.windowMs)
}
