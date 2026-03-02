'use client'

import { useState, useEffect, useCallback } from 'react'
import { viemClient, basicIncomeABI, BASIC_INCOME_CONTRACT, isValidAddress } from '@/lib/contracts'

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
        setIsClaiming(true)
        try {
            // Frontend-only mode without embedded wallet tx support.
            await fetchClaimableAmount()
            if (onSuccess) onSuccess()
        } catch {
            // Setup failed silently in production
        } finally {
            setIsClaiming(false)
        }
    }

    const claimBasicIncome = async () => {
        setIsClaiming(true)
        try {
            await fetchClaimableAmount()
            if (onSuccess) onSuccess()
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
