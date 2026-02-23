'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useBasicIncome } from '@/hooks/useBasicIncome'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { formatBalance } from '@/lib/utils'
import { PiCoins } from 'react-icons/pi'

interface BasicIncomeTabProps {
    walletAddress: string | null
    onSuccess?: () => void
}

export function BasicIncomeTab({ walletAddress, onSuccess }: BasicIncomeTabProps) {
    const dictionary = useDictionary()
    const {
        claimableAmount,
        lastClaimTime,
        isActivated,
        isClaiming,
        setupBasicIncome,
        claimBasicIncome
    } = useBasicIncome(walletAddress, onSuccess)

    const [timeLeft, setTimeLeft] = useState<string>('')
    const [canClaim, setCanClaim] = useState(false)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now()
            const cooldown = 24 * 60 * 60 * 1000
            const nextClaim = lastClaimTime + cooldown
            const diff = nextClaim - now

            if (diff <= 0) {
                setTimeLeft('')
                setCanClaim(parseFloat(claimableAmount) > 0)
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
            setCanClaim(false)
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)
        return () => clearInterval(timer)
    }, [lastClaimTime, claimableAmount])

    const t = dictionary.earn.tabs.basicIncome

    if (!isActivated) {
        return (
            <div className="w-full">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <PiCoins className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">{t.title}</CardTitle>
                        <CardDescription className="text-base">{t.setupSubtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={setupBasicIncome}
                            isLoading={isClaiming}
                            fullWidth
                            size="lg"
                        >
                            {isClaiming ? t.activating : t.activateButton}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                        <PiCoins className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-green-600 font-medium">✓ {t.activated}</p>
                    <CardDescription>{t.claimableSubtitle}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-5xl font-bold text-gray-900 mb-2">
                        {formatBalance(claimableAmount)}
                    </p>
                    <p className="text-gray-500 mb-6">WLD</p>

                    {timeLeft ? (
                        <div
                            className="mb-6 p-4 bg-white/50 border border-green-100 rounded-2xl"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Next Claim Available In</p>
                            <p className="text-2xl font-mono font-bold text-gray-800">{timeLeft}</p>
                        </div>
                    ) : null}

                    <Button
                        onClick={claimBasicIncome}
                        isLoading={isClaiming}
                        disabled={!canClaim || isClaiming}
                        fullWidth
                        size="lg"
                        className={!canClaim ? 'bg-gray-200 text-gray-400' : ''}
                        aria-label={isClaiming ? t.claiming : timeLeft ? `On Cooldown: ${timeLeft}` : t.claimButton}
                    >
                        {isClaiming ? t.claiming : timeLeft ? 'On Cooldown' : t.claimButton}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
