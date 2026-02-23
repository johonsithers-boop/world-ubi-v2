'use client'

import { useState, useEffect, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { viemClient, basicIncomeABI, BASIC_INCOME_CONTRACT, isValidAddress } from '@/lib/contracts'
import { isMiniKitInstalled } from '@/lib/minikit'

// Check if running inside World App (silently)
function isInWorldApp(): boolean {
    return isMiniKitInstalled()
}

export function useBasicIncome(walletAddress: string | null, onSuccess?: () => void) {
    const [claimableAmount, setClaimableAmount] = useState('0')
    const [isActivated, setIsActivated] = useState(false)
    const [isClaiming, setIsClaiming] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [lastClaimTime, setLastClaimTime] = useState<number>(0)

    const fetchClaimableAmount = useCallback(async () => {
        if (!walletAddress || !isValidAddress(BASIC_INCOME_CONTRACT) || !isValidAddress(walletAddress)) {
            setClaimableAmount('0')
            setLastClaimTime(0)
            setIsLoading(false)
            return
        }

        try {
            const [amount, lastClaim] = await Promise.all([
                viemClient.readContract({
                    address: BASIC_INCOME_CONTRACT,
                    abi: basicIncomeABI,
                    functionName: 'available',
                    args: [walletAddress as `0x${string}`]
                }),
                viemClient.readContract({
                    address: BASIC_INCOME_CONTRACT,
                    abi: basicIncomeABI,
                    functionName: 'lastClaimTimes',
                    args: [walletAddress as `0x${string}`]
                })
            ])

            setClaimableAmount((Number(amount) / 1e18).toString())
            setLastClaimTime(Number(lastClaim) * 1000) // Convert to ms
        } catch {
            setClaimableAmount('0')
            setLastClaimTime(0)
        } finally {
            setIsLoading(false)
        }
    }, [walletAddress])

    const checkActivation = useCallback(async () => {
        if (!walletAddress || !isValidAddress(BASIC_INCOME_CONTRACT) || !isValidAddress(walletAddress)) {
            setIsActivated(false)
            return
        }

        try {
            const result = await viemClient.readContract({
                address: BASIC_INCOME_CONTRACT,
                abi: basicIncomeABI,
                functionName: 'isActivated',
                args: [walletAddress as `0x${string}`]
            })

            setIsActivated(result as boolean)
        } catch {
            setIsActivated(false)
        }
    }, [walletAddress])

    const setupBasicIncome = async () => {
        if (!isInWorldApp()) {
            return
        }

        setIsClaiming(true)
        try {
            if (!isValidAddress(BASIC_INCOME_CONTRACT)) {
                throw new Error('Basic Income contract address is not configured')
            }

            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: BASIC_INCOME_CONTRACT,
                        abi: basicIncomeABI,
                        functionName: 'setup',
                        args: []
                    }
                ]
            })

            if (finalPayload.status === 'success') {
                setIsActivated(true)
                await fetchClaimableAmount()
                if (onSuccess) onSuccess()
            }
        } catch {
            // Setup failed silently in production
        } finally {
            setIsClaiming(false)
        }
    }

    const claimBasicIncome = async () => {
        const now = Date.now()

        if (!isInWorldApp()) {
            return
        }

        setIsClaiming(true)
        try {
            if (!isValidAddress(BASIC_INCOME_CONTRACT)) {
                throw new Error('Basic Income contract address is not configured')
            }

            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: BASIC_INCOME_CONTRACT,
                        abi: basicIncomeABI,
                        functionName: 'claim',
                        args: []
                    }
                ]
            })

            if (finalPayload.status === 'success') {
                setClaimableAmount('0')
                const timestamp = now
                setLastClaimTime(timestamp)
                if (onSuccess) onSuccess()
            }
        } catch {
            // Claim failed silently in production
        } finally {
            setIsClaiming(false)
        }
    }

    useEffect(() => {
        checkActivation()
        fetchClaimableAmount()
    }, [walletAddress, checkActivation, fetchClaimableAmount])

    return {
        claimableAmount,
        lastClaimTime,
        isActivated,
        isClaiming,
        isLoading,
        setupBasicIncome,
        claimBasicIncome,
        fetchClaimableAmount
    }
}
