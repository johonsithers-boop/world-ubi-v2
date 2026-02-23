'use client'

import { MiniKit } from '@worldcoin/minikit-js'
import { useState, ReactNode } from 'react'
import { isMiniKitInstalled } from '@/lib/minikit'

// Check if running inside World App (silently)
function isInWorldApp(): boolean {
    return isMiniKitInstalled()
}

interface VerifyProps {
    action: string
    signal?: string
    onSuccess: (result: { nullifier_hash: string }) => void
    onError: (error: string) => void
    children: ReactNode
}

export function Verify({ action, signal, onSuccess, onError, children }: VerifyProps) {
    const [isVerifying, setIsVerifying] = useState(false)

    const handleVerify = async () => {
        if (!isInWorldApp()) {
            onError('Verification requires World App.')
            return
        }

        setIsVerifying(true)
        try {
            const { finalPayload } = await MiniKit.commandsAsync.verify({
                action,
                signal
            })

            if (finalPayload.status === 'success') {
                onSuccess({ nullifier_hash: finalPayload.nullifier_hash })
            } else {
                onError('Verification failed')
            }
        } catch {
            onError('Verification request failed')
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div
            onClick={!isVerifying ? handleVerify : undefined}
            className={isVerifying ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        >
            {children}
        </div>
    )
}
