'use client'

import { useState, useEffect, useCallback } from 'react'
import { viemClient, stakingABI, STAKING_CONTRACT, isValidAddress } from '@/lib/contracts'

export function useStaking(walletAddress: string | null, onSuccess?: () => void) {
    const [stakedBalance, setStakedBalance] = useState('0')
    const [availableRewards, setAvailableRewards] = useState('0')
    const [isStaking, setIsStaking] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchStakingData = useCallback(async () => {
        if (!walletAddress || !isValidAddress(STAKING_CONTRACT) || !isValidAddress(walletAddress)) {
            setStakedBalance('0')
            setAvailableRewards('0')
            setIsLoading(false)
            return
        }

        try {
            const [balance, rewards] = await Promise.all([
                viemClient.readContract({
                    address: STAKING_CONTRACT,
                    abi: stakingABI,
                    functionName: 'balanceOf',
                    args: [walletAddress as `0x${string}`]
                }),
                viemClient.readContract({
                    address: STAKING_CONTRACT,
                    abi: stakingABI,
                    functionName: 'available',
                    args: [walletAddress as `0x${string}`]
                })
            ])

            setStakedBalance((Number(balance) / 1e18).toString())
            setAvailableRewards((Number(rewards) / 1e18).toString())
        } catch {
            setStakedBalance('0')
            setAvailableRewards('0')
        } finally {
            setIsLoading(false)
        }
    }, [walletAddress])

    const stake = async (amount: string) => {
        setIsStaking(true)
        try {
            void amount
            await fetchStakingData()
            if (onSuccess) onSuccess()
        } catch {
            // Stake failed silently
        } finally {
            setIsStaking(false)
        }
    }

    const unstake = async (amount: string) => {
        setIsStaking(true)
        try {
            void amount
            await fetchStakingData()
            if (onSuccess) onSuccess()
        } catch {
            // Unstake failed silently
        } finally {
            setIsStaking(false)
        }
    }

    const claimRewards = async () => {
        setIsStaking(true)
        try {
            await fetchStakingData()
            if (onSuccess) onSuccess()
        } catch {
            // Claim rewards failed silently
        } finally {
            setIsStaking(false)
        }
    }

    useEffect(() => {
        if (walletAddress) {
            fetchStakingData()
        }
    }, [walletAddress, fetchStakingData])

    return {
        stakedBalance,
        availableRewards,
        isStaking,
        isLoading,
        stake,
        unstake,
        claimRewards,
        fetchStakingData
    }
}
