'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { PiCaretLeft, PiCheck } from 'react-icons/pi'

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export default function LanguagePage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = use(params)
    const dictionary = useDictionary()
    const router = useRouter()

    const handleLanguageChange = (code: string) => {
        // Navigate to same page with new language
        router.push(`/${code}/menu`)
    }

    return (
        <div className="min-h-screen pb-8">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-lg px-6 pt-6 pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${lang}/menu`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
                    >
                        <PiCaretLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {dictionary.language.title}
                    </h1>
                </div>
            </div>

            {/* Language Options */}
            <div className="px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {languages.map((language, index) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageChange(language.code)}
                            className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${index !== languages.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{language.flag}</span>
                                <span className="font-medium text-gray-900">{language.name}</span>
                            </div>
                            {lang === language.code && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-600 font-medium">
                                        {dictionary.language.current}
                                    </span>
                                    <PiCheck className="h-5 w-5 text-green-500" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
