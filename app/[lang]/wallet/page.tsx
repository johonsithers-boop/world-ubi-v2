'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { useWallet } from '@/hooks/useWallet'
import { useBasicIncome } from '@/hooks/useBasicIncome'
import { useStaking } from '@/hooks/useStaking'
import { formatBalance, formatAddress } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PiWallet, PiArrowLeft, PiArrowUpRight, PiArrowDownLeft, PiRepeat, PiVault, PiChartLineUp } from 'react-icons/pi'
import { PageProps, CommonParams } from '@/lib/types'

export default function WalletPage({
    params
}: PageProps<CommonParams>) {
    use(params) // consume route params promise
    const router = useRouter()
    const dictionary = useDictionary()
    const { walletAddress, tokenBalance } = useWallet()

    // Get additional data for the summary
    const { claimableAmount } = useBasicIncome(walletAddress)
    const { stakedBalance, availableRewards } = useStaking(walletAddress)

    const totalBalance = useMemo(() => {
        return (
            parseFloat(tokenBalance) +
            parseFloat(stakedBalance) +
            parseFloat(availableRewards)
        ).toFixed(2)
    }, [tokenBalance, stakedBalance, availableRewards])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Go back"
                    >
                        <PiArrowLeft className="h-6 w-6 text-gray-600" aria-hidden="true" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">
                        {dictionary.menu.wallet}
                    </h1>
                </div>
            </div>

            <div className="px-6 pt-6 space-y-6">
                {/* Main Balance Card */}
                <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <PiWallet className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardDescription className="text-green-100 opacity-80 uppercase tracking-wider text-xs font-bold">
                            Total Balance
                        </CardDescription>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black">{totalBalance}</span>
                            <span className="text-xl font-medium opacity-80">WLD</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 w-fit">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            <span className="text-xs font-mono opacity-90">
                                {walletAddress ? formatAddress(walletAddress) : 'Not Connected'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <Button
                                className="bg-white text-green-700 hover:bg-green-50 border-none font-bold"
                                aria-label="Send tokens"
                            >
                                <PiArrowUpRight className="mr-2 h-5 w-5" aria-hidden="true" />
                                Send
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/40 text-white hover:bg-white/10 font-bold"
                                aria-label="Receive tokens"
                            >
                                <PiArrowDownLeft className="mr-2 h-5 w-5" aria-hidden="true" />
                                Receive
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance Breakdown */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Breakdown</h2>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {/* WLD Balance */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <PiWallet className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Available</p>
                                    <p className="text-xs text-gray-500">Spendable WLD</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{formatBalance(tokenBalance)} WLD</p>
                                <p className="text-xs text-gray-400">~ ${(parseFloat(tokenBalance) * 2.5).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Staked Balance */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <PiVault className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Staked</p>
                                    <p className="text-xs text-gray-500">In Savings</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{formatBalance(stakedBalance)} WLD</p>
                            </div>
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <PiChartLineUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Rewards</p>
                                    <p className="text-xs text-gray-500">Unclaimed Staking</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{formatBalance(availableRewards)} WLD</p>
                            </div>
                        </div>

                        {/* Claimable UBI */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <PiRepeat className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Basic Income</p>
                                    <p className="text-xs text-gray-500">Claimable now</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{formatBalance(claimableAmount)} WLD</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
