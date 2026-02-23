'use client'

import { use } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { BottomNav } from '@/components/BottomNav'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress } from '@/lib/utils'
import {
    PiUser,
    PiWallet,
    PiGlobe,
    PiQuestion,
    PiInfo,
    PiSignOut,
    PiCaretRight
} from 'react-icons/pi'

export default function MenuPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = use(params)
    const dictionary = useDictionary()
    const { walletAddress, disconnect } = useWallet()

    const menuItems = [
        { icon: PiUser, label: dictionary.menu.profile, href: `/${lang}/menu/profile` },
        { icon: PiWallet, label: dictionary.menu.wallet, href: `/${lang}/wallet` },
        { icon: PiGlobe, label: dictionary.menu.language, href: `/${lang}/language` },
        { icon: PiQuestion, label: dictionary.menu.faq, href: `/${lang}/faq` },
        { icon: PiInfo, label: dictionary.menu.about, href: `/${lang}/menu/about` }
    ]

    const handleLogout = () => {
        disconnect()
        signOut({ callbackUrl: `/${lang}` })
    }

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    {dictionary.menu.title}
                </h1>
            </div>

            {/* Profile Card */}
            {walletAddress && (
                <div className="mx-6 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                            <PiUser className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">World ID User</p>
                            <p className="text-sm text-gray-500 font-mono">
                                {formatAddress(walletAddress)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div className="mx-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {menuItems.map((item, index) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-gray-500" />
                            <span className="font-medium text-gray-900">{item.label}</span>
                        </div>
                        <PiCaretRight className="h-5 w-5 text-gray-400" />
                    </Link>
                ))}
            </div>

            {/* Logout Button */}
            <div className="mx-6 mt-6">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-red-500 hover:bg-red-50 transition-colors"
                >
                    <PiSignOut className="h-5 w-5" />
                    <span className="font-medium">{dictionary.menu.logout}</span>
                </button>
            </div>

            <BottomNav lang={lang} />
        </div>
    )
}
