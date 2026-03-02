'use client'

import { useState, use, useMemo } from 'react'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { useWallet } from '@/hooks/useWallet'
import { TabSwiper } from '@/components/TabSwiper'
import { BottomNav } from '@/components/BottomNav'
import { BasicIncomeTab } from '@/components/earn/BasicIncomeTab'
import { SavingsTab } from '@/components/earn/SavingsTab'
import { ContributeTab } from '@/components/earn/ContributeTab'
import { formatBalance } from '@/lib/utils'
import { PiWallet } from 'react-icons/pi'
import { PageProps, CommonParams } from '@/lib/types'
import { PRIMARY_TOKEN_SYMBOL } from '@/lib/baseWallet'

import Link from 'next/link'

type EarnTabKey = 'basicIncome' | 'savings' | 'contribute'

export default function EarnPage({
    params
}: PageProps<CommonParams>) {
    const { lang } = use(params)
    const [activeTab, setActiveTab] = useState<EarnTabKey>('basicIncome')
    const dictionary = useDictionary()
    const { walletAddress, tokenBalance, refreshBalance } = useWallet()

    const tabs = useMemo(() => [
        { key: 'basicIncome' as const, label: dictionary.earn.tabs.basicIncome.tabTitle },
        { key: 'savings' as const, label: dictionary.earn.tabs.savings.tabTitle },
        { key: 'contribute' as const, label: dictionary.earn.tabs.contribute.tabTitle }
    ], [dictionary])

    const renderContent = () => {
        switch (activeTab) {
            case 'basicIncome':
                return <BasicIncomeTab walletAddress={walletAddress} onSuccess={refreshBalance} />
            case 'savings':
                return <SavingsTab walletAddress={walletAddress} onSuccess={refreshBalance} />
            case 'contribute':
                return <ContributeTab walletAddress={walletAddress} />
            default:
                return null
        }
    }

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-lg px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {dictionary.earn.title}
                    </h1>
                    <Link
                        href={`/${lang}/wallet`}
                        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <PiWallet className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                            {formatBalance(tokenBalance)} {PRIMARY_TOKEN_SYMBOL}
                        </span>
                    </Link>
                </div>

                <TabSwiper
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabIndicators={{ basicIncome: true }}
                />
            </div>

            {/* Content */}
            <div className="px-6 pt-6 animate-fadeIn">
                {renderContent()}
            </div>

            <BottomNav lang={lang} />
        </div>
    )
}
