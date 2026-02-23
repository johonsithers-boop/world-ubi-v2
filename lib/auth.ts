import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { logger } from '@/lib/logger'
import { serverEnv } from '@/lib/env.server'

declare module 'next-auth' {
    interface User {
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
            id: 'world-id',
            name: 'World ID',
            credentials: {
                token: { label: 'Token', type: 'text' },
                address: { label: 'Address', type: 'text' }
            },
            async authorize(credentials) {
                if (!credentials?.token) return null

                try {
                    // In production, verify the World ID token with the API
                    // const response = await fetch('https://developer.worldcoin.org/api/v1/verify', ...)

                    // For demo purposes, we accept the token directly
                    return {
                        id: credentials.token,
                        address: credentials.address || undefined
                    }
                } catch (error) {
                    logger.error('Auth error', error)
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
