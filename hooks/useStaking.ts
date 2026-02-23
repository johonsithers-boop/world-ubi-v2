'use client'

import { useState, useEffect, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { viemClient, stakingABI, STAKING_CONTRACT, isValidAddress } from '@/lib/contracts'
import { isMiniKitInstalled } from '@/lib/minikit'

function isMiniKitAvailable(): boolean {
    return isMiniKitInstalled()
}

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
        if (!isMiniKitAvailable()) {
            return
        }

        setIsStaking(true)
        try {
            if (!isValidAddress(STAKING_CONTRACT)) {
                throw new Error('Staking contract address is not configured')
            }

            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: STAKING_CONTRACT,
                        abi: stakingABI,
                        functionName: 'stake',
                        args: [BigInt(parseFloat(amount) * 1e18)]
                    }
                ]
            })

            if (finalPayload.status === 'success') {
                await fetchStakingData()
                if (onSuccess) onSuccess()
            }
        } catch {
            // Stake failed silently
        } finally {
            setIsStaking(false)
        }
    }

    const unstake = async (amount: string) => {
        if (!isMiniKitAvailable()) {
            return
        }

        setIsStaking(true)
        try {
            if (!isValidAddress(STAKING_CONTRACT)) {
                throw new Error('Staking contract address is not configured')
            }

            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: STAKING_CONTRACT,
                        abi: stakingABI,
                        functionName: 'unstake',
                        args: [BigInt(parseFloat(amount) * 1e18)]
                    }
                ]
            })

            if (finalPayload.status === 'success') {
                await fetchStakingData()
                if (onSuccess) onSuccess()
            }
        } catch {
            // Unstake failed silently
        } finally {
            setIsStaking(false)
        }
    }

    const claimRewards = async () => {
        if (!isMiniKitAvailable()) {
            return
        }

        setIsStaking(true)
        try {
            if (!isValidAddress(STAKING_CONTRACT)) {
                throw new Error('Staking contract address is not configured')
            }

            const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: STAKING_CONTRACT,
                        abi: stakingABI,
                        functionName: 'claimRewards',
                        args: []
                    }
                ]
            })

            if (finalPayload.status === 'success') {
                await fetchStakingData()
                if (onSuccess) onSuccess()
            }
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
