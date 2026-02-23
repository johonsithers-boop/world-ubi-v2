'use client'

import { motion } from 'framer-motion'

interface Tab<T extends string> {
    key: T
    label: string
}

interface TabSwiperProps<T extends string> {
    tabs: Tab<T>[]
    activeTab: T
    onTabChange: (tab: T) => void
    tabIndicators?: Partial<Record<T, boolean>>
}

export function TabSwiper<T extends string>({
    tabs,
    activeTab,
    onTabChange,
    tabIndicators = {}
}: TabSwiperProps<T>) {
    return (
        <div className="mt-4 flex border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`relative flex-1 py-3 text-center text-sm font-medium transition-colors ${activeTab === tab.key
                            ? 'text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {tab.label}
                    {tabIndicators[tab.key] && (
                        <span className="absolute -top-1 right-1/2 translate-x-4">
                            <span className="flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                            </span>
                        </span>
                    )}
                    {activeTab === tab.key && (
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                            layoutId="activeTab"
                        />
                    )}
                </button>
            ))}
        </div>
    )
}
