'use client'

import { use } from 'react'
import Link from 'next/link'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { PiCaretLeft, PiCaretDown } from 'react-icons/pi'
import { useState } from 'react'

export default function FaqPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = use(params)
    const dictionary = useDictionary()
    const [openIndex, setOpenIndex] = useState<number | null>(0)

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
                        {dictionary.faq.title}
                    </h1>
                </div>
            </div>

            {/* FAQ Items */}
            <div className="px-6 space-y-3">
                {dictionary.faq.questions.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                            <PiCaretDown
                                className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        {openIndex === index && (
                            <div className="px-4 pb-4">
                                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
