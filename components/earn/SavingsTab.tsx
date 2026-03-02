'use client'


import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { useStaking } from '@/hooks/useStaking'
import { formatBalance } from '@/lib/utils'
import { PiVault, PiTrendUp } from 'react-icons/pi'
import { PRIMARY_TOKEN_SYMBOL } from '@/lib/baseWallet'

interface SavingsTabProps {
    walletAddress: string | null
    onSuccess?: () => void
}

export function SavingsTab({ walletAddress, onSuccess }: SavingsTabProps) {
    const dictionary = useDictionary()
    const {
        stakedBalance,
        availableRewards,
        isStaking,
        stake,
        unstake,
        claimRewards
    } = useStaking(walletAddress, onSuccess)

    const t = dictionary.earn.tabs.savings
    const readOnlyMode = true

    const handleStake = () => stake('10')
    const handleUnstake = () => unstake('10')
    const handleClaim = () => claimRewards()

    return (
        <div className="w-full space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <PiVault className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">{t.title}</CardTitle>
                    <CardDescription>{t.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-white rounded-xl">
                            <p className="text-sm text-gray-500">{t.stakedBalance}</p>
                            <p className="text-2xl font-bold text-gray-900">{formatBalance(stakedBalance)}</p>
                            <p className="text-xs text-gray-400">{PRIMARY_TOKEN_SYMBOL}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl">
                            <p className="text-sm text-gray-500">{t.availableRewards}</p>
                            <p className="text-2xl font-bold text-green-600">{formatBalance(availableRewards)}</p>
                            <p className="text-xs text-gray-400">{PRIMARY_TOKEN_SYMBOL}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-white rounded-xl">
                        <PiTrendUp className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">{t.apy}:</span>
                        <span className="font-bold text-green-600">12.5%</span>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleStake}
                            isLoading={isStaking}
                            disabled={readOnlyMode}
                            fullWidth
                            size="lg"
                            aria-label={`Stake 10 ${PRIMARY_TOKEN_SYMBOL} tokens at ${t.apy}`}
                        >
                            {readOnlyMode ? 'Coming Soon' : t.stakeButton}
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={handleUnstake}
                                isLoading={isStaking}
                                disabled={readOnlyMode}
                                fullWidth
                                aria-label={`Unstake 10 ${PRIMARY_TOKEN_SYMBOL} tokens`}
                            >
                                {readOnlyMode ? 'Coming Soon' : t.unstakeButton}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClaim}
                                isLoading={isStaking}
                                disabled={readOnlyMode}
                                fullWidth
                                aria-label="Claim staking rewards"
                            >
                                {readOnlyMode ? 'Coming Soon' : t.claimRewards}
                            </Button>
                        </div>
                        {readOnlyMode ? (
                            <p className="text-center text-xs text-gray-500">
                                Read-only mode: staking transactions are temporarily disabled.
                            </p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
