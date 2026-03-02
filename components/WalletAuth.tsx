'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createWalletAuthMessage } from '@/lib/auth-message'
import { useDictionary } from '@/components/providers/DictionaryProvider'

interface WalletAuthProps {
    lang: string
    onError?: (error: string) => void
    onSuccess?: () => void
}

export function WalletAuth({ lang, onError, onSuccess }: WalletAuthProps) {
    const dictionary = useDictionary()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    interface EthereumProvider {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }

    interface AuthNonceResponse {
        nonce: string
        nonceToken: string
    }

    function getEthereumProvider(): EthereumProvider | null {
        if (typeof window === 'undefined') return null
        const provider = (window as Window & { ethereum?: EthereumProvider }).ethereum
        return provider ?? null
    }

    async function signWalletMessage(provider: EthereumProvider, message: string, address: string): Promise<string> {
        try {
            return (await provider.request({
                method: 'personal_sign',
                params: [message, address]
            })) as string
        } catch {
            return (await provider.request({
                method: 'personal_sign',
                params: [address, message]
            })) as string
        }
    }

    const handleAuth = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const provider = getEthereumProvider()
            if (!provider) {
                throw new Error('No wallet detected. Install Base Wallet or another EVM wallet.')
            }

            const accounts = (await provider.request({
                method: 'eth_requestAccounts'
            })) as string[]

            const address = accounts?.[0]
            if (!address) {
                throw new Error('Wallet did not return an account.')
            }

            const nonceResponse = await fetch('/api/auth/nonce', {
                method: 'GET',
                cache: 'no-store'
            })

            if (!nonceResponse.ok) {
                throw new Error('Unable to get login challenge.')
            }

            const { nonce, nonceToken } = (await nonceResponse.json()) as AuthNonceResponse
            if (!nonce || !nonceToken) {
                throw new Error('Invalid login challenge.')
            }

            const message = createWalletAuthMessage({
                address,
                nonce,
                uri: window.location.origin,
                issuedAt: new Date().toISOString()
            })

            const signature = await signWalletMessage(provider, message, address)

            const result = await signIn('base-wallet', {
                redirect: false,
                address,
                message,
                signature,
                nonce,
                nonceToken
            })

            if (!result || result.error) {
                throw new Error('Wallet authentication failed.')
            }

            if (onSuccess) onSuccess()
            router.push(`/${lang}/earn`)
        } catch (err) {
            const authError = err instanceof Error ? err.message : 'Failed to continue.'
            setError(authError)
            if (onError) onError(authError)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            <button
                onClick={handleAuth}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all ${isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-lg'
                    }`}
            >
                {isLoading ? 'Connecting...' : dictionary.home.connectButton}
            </button>

            {error ? (
                <p className="text-sm text-red-600 text-center">{error}</p>
            ) : null}
        </div>
    )
}
