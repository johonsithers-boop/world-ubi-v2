import 'server-only'

import crypto from 'node:crypto'
import { serverEnv } from '@/lib/env.server'

const NONCE_TTL_SECONDS = 5 * 60
const usedNonceTokens = new Map<string, number>()

function toBase64Url(value: Buffer | string): string {
    return Buffer.from(value)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
}

function fromBase64Url(value: string): Buffer {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return Buffer.from(padded, 'base64')
}

function signPayload(payload: string): string {
    return toBase64Url(
        crypto
            .createHmac('sha256', serverEnv.NEXTAUTH_SECRET)
            .update(payload)
            .digest()
    )
}

function cleanupExpiredNonceTokens(nowEpochSeconds: number): void {
    for (const [token, expiresAt] of usedNonceTokens.entries()) {
        if (expiresAt <= nowEpochSeconds) {
            usedNonceTokens.delete(token)
        }
    }
}

function parseNonceToken(nonceToken: string): { nonce: string; exp: number } | null {
    try {
        const [payloadEncoded, providedSignature] = nonceToken.split('.')
        if (!payloadEncoded || !providedSignature) return null

        const payload = fromBase64Url(payloadEncoded).toString('utf8')
        const expectedSignature = signPayload(payload)

        const providedBuffer = Buffer.from(providedSignature)
        const expectedBuffer = Buffer.from(expectedSignature)

        if (providedBuffer.length !== expectedBuffer.length) return null
        if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null

        const parsed = JSON.parse(payload) as { nonce?: string; exp?: number }
        if (!parsed.nonce || !parsed.exp) return null

        return {
            nonce: parsed.nonce,
            exp: parsed.exp
        }
    } catch {
        return null
    }
}

export interface NonceChallenge {
    nonce: string
    nonceToken: string
    expiresAt: number
}

export function createNonceChallenge(): NonceChallenge {
    const nonce = crypto.randomBytes(16).toString('hex')
    const expiresAt = Math.floor(Date.now() / 1000) + NONCE_TTL_SECONDS
    const payload = JSON.stringify({ nonce, exp: expiresAt })
    const payloadEncoded = toBase64Url(payload)
    const signature = signPayload(payload)
    const nonceToken = `${payloadEncoded}.${signature}`

    return { nonce, nonceToken, expiresAt }
}

export function verifyNonceChallenge(nonce: string, nonceToken: string): boolean {
    const parsed = parseNonceToken(nonceToken)
    if (!parsed) {
        return false
    }

    if (parsed.nonce !== nonce) {
        return false
    }

    const now = Math.floor(Date.now() / 1000)
    return parsed.exp > now
}

export function consumeNonceChallenge(nonce: string, nonceToken: string): boolean {
    const parsed = parseNonceToken(nonceToken)
    if (!parsed) {
        return false
    }

    if (parsed.nonce !== nonce) {
        return false
    }

    const now = Math.floor(Date.now() / 1000)
    cleanupExpiredNonceTokens(now)

    if (parsed.exp <= now) {
        return false
    }

    if (usedNonceTokens.has(nonceToken)) {
        return false
    }

    usedNonceTokens.set(nonceToken, parsed.exp)
    return true
}
