import 'server-only'

const supportedChains = new Set(['mainnet', 'sepolia'])
const knownWeakSecrets = new Set([
    '7f52f829871542f7902d87e5621487e5',
    'your_random_secret_key_here',
    'your_secure_secret_here'
])

export interface ServerEnv {
    DATABASE_PATH: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    NEXT_PUBLIC_APP_ID: string
    NEXT_PUBLIC_BASIC_INCOME_CONTRACT: string
    NEXT_PUBLIC_CHAIN: 'mainnet' | 'sepolia'
    NEXT_PUBLIC_STAKING_CONTRACT: string
    UPSTASH_REDIS_REST_TOKEN?: string
    UPSTASH_REDIS_REST_URL?: string
    WLD_CLIENT_ID: string
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

function validateAddress(address: string, envName: string): void {
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
    if (!isAddress) {
        throw new Error(`Invalid Ethereum address in ${envName}: ${address}`)
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

function validateChain(chain: string): asserts chain is 'mainnet' | 'sepolia' {
    if (!supportedChains.has(chain)) {
        throw new Error(`NEXT_PUBLIC_CHAIN must be one of: mainnet, sepolia. Received: ${chain}`)
    }
}

function buildServerEnv(): ServerEnv {
    const chain = readRequiredEnv('NEXT_PUBLIC_CHAIN')
    validateChain(chain)
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

    if ((upstashUrl && !upstashToken) || (!upstashUrl && upstashToken)) {
        throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together')
    }

    const env: ServerEnv = {
        DATABASE_PATH: readRequiredEnv('DATABASE_PATH'),
        NEXTAUTH_SECRET: readRequiredEnv('NEXTAUTH_SECRET'),
        NEXTAUTH_URL: readRequiredEnv('NEXTAUTH_URL'),
        NEXT_PUBLIC_APP_ID: readRequiredEnv('NEXT_PUBLIC_APP_ID'),
        NEXT_PUBLIC_BASIC_INCOME_CONTRACT: readRequiredEnv('NEXT_PUBLIC_BASIC_INCOME_CONTRACT'),
        NEXT_PUBLIC_CHAIN: chain,
        NEXT_PUBLIC_STAKING_CONTRACT: readRequiredEnv('NEXT_PUBLIC_STAKING_CONTRACT'),
        UPSTASH_REDIS_REST_TOKEN: upstashToken,
        UPSTASH_REDIS_REST_URL: upstashUrl,
        WLD_CLIENT_ID: readRequiredEnv('WLD_CLIENT_ID')
    }

    validateUrl(env.NEXTAUTH_URL, 'NEXTAUTH_URL')
    validateNextAuthSecret(env.NEXTAUTH_SECRET)
    validateAddress(env.NEXT_PUBLIC_BASIC_INCOME_CONTRACT, 'NEXT_PUBLIC_BASIC_INCOME_CONTRACT')
    validateAddress(env.NEXT_PUBLIC_STAKING_CONTRACT, 'NEXT_PUBLIC_STAKING_CONTRACT')
    if (env.UPSTASH_REDIS_REST_URL) {
        validateUrl(env.UPSTASH_REDIS_REST_URL, 'UPSTASH_REDIS_REST_URL')
    }

    return env
}

export const serverEnv = Object.freeze(buildServerEnv())
