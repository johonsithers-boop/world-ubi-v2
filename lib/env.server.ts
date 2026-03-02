import 'server-only'

const knownWeakSecrets = new Set([
    '7f52f829871542f7902d87e5621487e5',
    'your_random_secret_key_here',
    'your_secure_secret_here'
])

export interface ServerEnv {
    DATABASE_PATH: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    UPSTASH_REDIS_REST_TOKEN?: string
    UPSTASH_REDIS_REST_URL?: string
}

function readRequiredEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    const trimmed = value.trim()
    if (!trimmed) {
        throw new Error(`Environment variable ${name} cannot be empty`)
    }

    return trimmed
}

function validateUrl(urlValue: string, envName: string): void {
    try {
        const parsedUrl = new URL(urlValue)
        if (!parsedUrl.protocol.startsWith('http')) {
            throw new Error('invalid protocol')
        }
    } catch {
        throw new Error(`Invalid URL in ${envName}: ${urlValue}`)
    }
}

function validateNextAuthSecret(secret: string): void {
    if (knownWeakSecrets.has(secret)) {
        throw new Error('NEXTAUTH_SECRET is using a known weak/default value')
    }

    if (secret.length < 43) {
        throw new Error('NEXTAUTH_SECRET must be at least 43 characters (32 bytes of entropy)')
    }
}

function buildServerEnv(): ServerEnv {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

    if ((upstashUrl && !upstashToken) || (!upstashUrl && upstashToken)) {
        throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together')
    }

    const env: ServerEnv = {
        DATABASE_PATH: readRequiredEnv('DATABASE_PATH'),
        NEXTAUTH_SECRET: readRequiredEnv('NEXTAUTH_SECRET'),
        NEXTAUTH_URL: readRequiredEnv('NEXTAUTH_URL'),
        UPSTASH_REDIS_REST_TOKEN: upstashToken,
        UPSTASH_REDIS_REST_URL: upstashUrl
    }

    validateUrl(env.NEXTAUTH_URL, 'NEXTAUTH_URL')
    validateNextAuthSecret(env.NEXTAUTH_SECRET)
    if (env.UPSTASH_REDIS_REST_URL) {
        validateUrl(env.UPSTASH_REDIS_REST_URL, 'UPSTASH_REDIS_REST_URL')
    }

    return env
}

export const serverEnv = Object.freeze(buildServerEnv())
