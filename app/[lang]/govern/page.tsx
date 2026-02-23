'use client'

import { use } from 'react'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { BottomNav } from '@/components/BottomNav'
import { PollCard } from '@/components/PollCard'
import { PiHouse } from 'react-icons/pi'

// Demo polls data
const demoPolls = [
    {
        id: '1',
        title: 'Increase UBI Distribution Rate',
        description: 'Should we increase the daily UBI distribution from 0.1 WLD to 0.15 WLD?',
        options: ['Yes, increase to 0.15 WLD', 'No, keep at 0.1 WLD', 'Increase to 0.12 WLD'],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 12453
    },
    {
        id: '2',
        title: 'Community Fund Allocation',
        description: 'How should we allocate the community development fund?',
        options: ['Education initiatives', 'Infrastructure development', 'Healthcare programs', 'Equal split'],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 8721
    }
]

export default function GovernPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = use(params)
    const dictionary = useDictionary()

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-lg px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <PiHouse className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {dictionary.govern.title}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {dictionary.govern.subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Polls */}
            <div className="px-6 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {dictionary.govern.activePolls}
                </h2>

                <div className="space-y-4">
                    {demoPolls.map((poll) => (
                        <PollCard key={poll.id} poll={poll} />
                    ))}
                </div>

                {demoPolls.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {dictionary.govern.noPolls}
                    </div>
                )}
            </div>

            <BottomNav lang={lang} />
        </div>
    )
}
