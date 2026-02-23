'use client'

import { motion } from 'framer-motion'
import { WalletAuth } from '@/components/WalletAuth'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { PiCoins, PiHouse, PiChartLineUp, PiGlobe } from 'react-icons/pi'
import { use } from 'react'

export default function HomePage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = use(params)
    const dictionary = useDictionary()

    const features = [
        {
            icon: PiCoins,
            title: dictionary.home.features.basicIncome.title,
            description: dictionary.home.features.basicIncome.description,
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: PiHouse,
            title: dictionary.home.features.governance.title,
            description: dictionary.home.features.governance.description,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: PiChartLineUp,
            title: dictionary.home.features.staking.title,
            description: dictionary.home.features.staking.description,
            color: 'bg-purple-100 text-purple-600'
        }
    ]

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                        <PiGlobe className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {dictionary.home.title}
                    </h1>
                    <p className="text-xl text-green-600 font-medium mb-4">
                        {dictionary.home.subtitle}
                    </p>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        {dictionary.home.description}
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4 mb-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.color}`}>
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <WalletAuth lang={lang} />
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-sm text-gray-400">
                Powered by World ID
            </footer>
        </div>
    )
}
