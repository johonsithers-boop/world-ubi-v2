'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PiCoins, PiHouse, PiUser } from 'react-icons/pi'
import { useDictionary } from '@/components/providers/DictionaryProvider'

interface BottomNavProps {
    lang: string
}

export function BottomNav({ lang }: BottomNavProps) {
    const pathname = usePathname()
    const dictionary = useDictionary()

    const navItems = [
        { href: `/${lang}/earn`, icon: PiCoins, label: dictionary.nav.earn },
        { href: `/${lang}/govern`, icon: PiHouse, label: dictionary.nav.govern },
        { href: `/${lang}/menu`, icon: PiUser, label: dictionary.nav.menu }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg px-6 pb-safe">
            <div className="flex justify-around py-2">
                {navItems.map((item) => {
                    const isActive = pathname.includes(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all ${isActive
                                    ? 'text-gray-900 bg-gray-100'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="mt-1 text-xs font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
