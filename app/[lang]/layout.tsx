import { getDictionary } from '@/lib/dictionaries'
import { DictionaryProvider } from '@/components/providers/DictionaryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'

export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'es' }]
}

export default async function LangLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    return (
        <html lang={lang}>
            <body className="font-sans antialiased bg-gray-50 min-h-screen">
                <NextAuthProvider>
                    <DictionaryProvider dictionary={dictionary}>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </DictionaryProvider>
                </NextAuthProvider>
            </body>
        </html>
    )
}
