'use client'

import { useState, useEffect, useCallback } from 'react'
import { viemClient } from '@/lib/contracts'
import { BASE_USDC_TOKEN_ADDRESS, PRIMARY_BASE_WALLET } from '@/lib/baseWallet'

const erc20Abi = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [{ type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

export function useWallet() {
    const [walletAddress, setWalletAddress] = useState<string | null>(PRIMARY_BASE_WALLET)
    const [tokenBalance, setTokenBalance] = useState<string>('0')
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(true)

    const fetchBalance = useCallback(async (address: string) => {
        try {
            const [balance, decimals] = await Promise.all([
                viemClient.readContract({
                    address: BASE_USDC_TOKEN_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [address as `0x${string}`],
                }),
                viemClient.readContract({
                    address: BASE_USDC_TOKEN_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'decimals',
                }),
            ])

            const precision = Number(decimals)
            const normalized = Number(balance) / 10 ** precision
            setTokenBalance(normalized.toString())
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
        setIsConnecting(true)
        try {
            setWalletAddress(PRIMARY_BASE_WALLET)
            setIsConnected(true)
            await fetchBalance(PRIMARY_BASE_WALLET)
        } finally {
            setIsConnecting(false)
        }
    }, [fetchBalance])

    const disconnect = useCallback(() => {
        setWalletAddress(PRIMARY_BASE_WALLET)
        setIsConnected(true)
    }, [])

    useEffect(() => {
        setWalletAddress(PRIMARY_BASE_WALLET)
        setIsConnected(true)
        fetchBalance(PRIMARY_BASE_WALLET)
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
