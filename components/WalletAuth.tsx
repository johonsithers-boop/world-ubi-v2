'use client'

import { MiniKit } from '@worldcoin/minikit-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { isMiniKitInstalled } from '@/lib/minikit'

// Check if running inside World App (silently)
function isInWorldApp(): boolean {
    return isMiniKitInstalled()
}

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

    const handleAuth = async () => {
        setIsLoading(true)
        setError(null)

        if (!isInWorldApp()) {
            const worldAppError = 'Please open this app inside World App to continue.'
            setError(worldAppError)
            if (onError) onError(worldAppError)
            setIsLoading(false)
            return
        }

        try {
            const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
                nonce: crypto.randomUUID(),
                statement: 'Sign in to World UBI Coin'
            })

            if (finalPayload.status === 'success') {
                if (onSuccess) onSuccess()
                router.push(`/${lang}/earn`)
            } else {
                const cancelledError = 'Authentication cancelled'
                setError(cancelledError)
                if (onError) onError(cancelledError)
            }
        } catch {
            const authError = 'Failed to authenticate with World App.'
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
