import 'server-only'

export type Dictionary = typeof import('@/dictionaries/en.json')

const dictionaries: Record<string, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
    const loader = dictionaries[locale] || dictionaries.en
    return loader()
}

export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
