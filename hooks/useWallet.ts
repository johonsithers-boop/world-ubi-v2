'use client'

import { useState, useEffect, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { viemClient } from '@/lib/contracts'
import { isMiniKitInstalled } from '@/lib/minikit'

// Silent check for MiniKit - avoids console.error from the SDK
function isMiniKitAvailable(): boolean {
    return isMiniKitInstalled()
}

// WLD Token Address on World Chain Mainnet
export const WLD_TOKEN_ADDRESS = '0x2cfc85d8e48f8eab294be644d9e256f011242e72' as `0x${string}`

export function useWallet() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [tokenBalance, setTokenBalance] = useState<string>('0')
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)

    const fetchBalance = useCallback(async (address: string) => {
        if (!isMiniKitAvailable()) {
            setTokenBalance('0')
            return
        }

        try {
            const balance = await viemClient.readContract({
                address: WLD_TOKEN_ADDRESS,
                abi: [
                    {
                        inputs: [{ name: 'account', type: 'address' }],
                        name: 'balanceOf',
                        outputs: [{ type: 'uint256' }],
                        stateMutability: 'view',
                        type: 'function',
                    },
                ],
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            })

            setTokenBalance((Number(balance) / 1e18).toString())
        } catch {
            setTokenBalance('0.00')
        }
    }, [])

    const refreshBalance = useCallback(() => {
        if (walletAddress) {
            fetchBalance(walletAddress)
        }
    }, [walletAddress, fetchBalance])

    const connect = useCallback(async () => {
        if (!isMiniKitAvailable()) {
            setWalletAddress(null)
            setTokenBalance('0')
            setIsConnected(false)
            return
        }

        setIsConnecting(true)
        try {
            const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
                nonce: crypto.randomUUID(),
                statement: 'Sign in to World UBI Coin'
            })

            if (finalPayload.status === 'success') {
                setWalletAddress(finalPayload.address)
                setIsConnected(true)
                await fetchBalance(finalPayload.address)
            }
        } catch {
            setWalletAddress(null)
            setTokenBalance('0')
            setIsConnected(false)
        } finally {
            setIsConnecting(false)
        }
    }, [fetchBalance])

    const disconnect = useCallback(() => {
        setWalletAddress(null)
        setTokenBalance('0')
        setIsConnected(false)
    }, [])

    useEffect(() => {
        if (!isMiniKitAvailable()) {
            setWalletAddress(null)
            setTokenBalance('0')
            setIsConnected(false)
            return
        }

        try {
            const user = MiniKit.user
            if (user?.walletAddress) {
                setWalletAddress(user.walletAddress)
                setIsConnected(true)
                fetchBalance(user.walletAddress)
            }
        } catch {
            setWalletAddress(null)
            setTokenBalance('0')
            setIsConnected(false)
        }
    }, [fetchBalance])

    return {
        walletAddress,
        tokenBalance,
        isConnecting,
        isConnected,
        connect,
        disconnect,
        refreshBalance
    }
}
