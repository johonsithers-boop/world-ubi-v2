import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getAddress, isAddress, verifyMessage } from 'viem'
import { extractAddressAndNonceFromMessage } from '@/lib/auth-message'
import { logger } from '@/lib/logger'
import { consumeNonceChallenge } from '@/lib/nonce'
import { serverEnv } from '@/lib/env.server'

declare module 'next-auth' {
    interface User {
        id: string
        address?: string
    }
    interface Session {
        user: {
            id: string
            address?: string
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        address?: string
    }
}

export const authOptions: NextAuthOptions = {
    secret: serverEnv.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            id: 'base-wallet',
            name: 'Base Wallet',
            credentials: {
                address: { label: 'Address', type: 'text' },
                message: { label: 'Message', type: 'text' },
                signature: { label: 'Signature', type: 'text' },
                nonce: { label: 'Nonce', type: 'text' },
                nonceToken: { label: 'Nonce Token', type: 'text' }
            },
            async authorize(credentials) {
                try {
                    const address = credentials?.address?.trim() || ''
                    const message = credentials?.message?.trim() || ''
                    const signature = credentials?.signature?.trim() || ''
                    const nonce = credentials?.nonce?.trim() || ''
                    const nonceToken = credentials?.nonceToken?.trim() || ''

                    if (!address || !message || !signature || !nonce || !nonceToken) {
                        return null
                    }

                    if (!isAddress(address)) {
                        return null
                    }

                    const parsed = extractAddressAndNonceFromMessage(message)
                    if (!parsed) {
                        return null
                    }

                    const checksumAddress = getAddress(address)
                    const normalizedAddress = checksumAddress.toLowerCase()
                    const parsedAddress = getAddress(parsed.address).toLowerCase()

                    if (parsedAddress !== normalizedAddress || parsed.nonce !== nonce) {
                        return null
                    }

                    if (!consumeNonceChallenge(nonce, nonceToken)) {
                        return null
                    }

                    const isValidSignature = await verifyMessage({
                        address: checksumAddress,
                        message,
                        signature: signature as `0x${string}`
                    })

                    if (!isValidSignature) {
                        return null
                    }

                    return {
                        id: normalizedAddress,
                        address: normalizedAddress
                    }
                } catch (error) {
                    logger.warn('Wallet signature authentication failed', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user?.address) {
                token.address = user.address
            }
            return token
        },
        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub
            }
            if (token.address) {
                session.user.address = token.address
            }
            return session
        }
    },
    pages: {
        signIn: '/'
    }
}
