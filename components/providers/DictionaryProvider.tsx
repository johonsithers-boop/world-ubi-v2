'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Dictionary } from '@/lib/dictionaries'

const DictionaryContext = createContext<Dictionary | null>(null)

export function DictionaryProvider({
    children,
    dictionary
}: {
    children: ReactNode
    dictionary: Dictionary
}) {
    return (
        <DictionaryContext.Provider value={dictionary}>
            {children}
        </DictionaryContext.Provider>
    )
}

export function useDictionary(): Dictionary {
    const dictionary = useContext(DictionaryContext)
    if (!dictionary) {
        throw new Error('useDictionary must be used within a DictionaryProvider')
    }
    return dictionary
}
