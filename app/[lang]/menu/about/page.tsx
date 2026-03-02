'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { PiArrowLeft, PiGlobe, PiShieldCheck, PiGithubLogo, PiTwitterLogo } from 'react-icons/pi'

export default function AboutPage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    use(params) // consume route params promise
    const router = useRouter()
    const dictionary = useDictionary()

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100"
                >
                    <PiArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                    {dictionary.menu.about}
                </h1>
            </div>

            <div className="px-6 pt-6 space-y-6">
                {/* App Brand */}
                <div className="text-center py-8">
                    <div className="mx-auto h-20 w-20 rounded-3xl bg-green-600 flex items-center justify-center shadow-xl mb-4 rotate-3">
                        <span className="text-white text-4xl font-black">B</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Base UBI</h2>
                    <p className="text-gray-500 font-medium">Version 2.0.0 (Base)</p>
                </div>

                {/* Missions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Our Mission</CardTitle>
                        <CardDescription>
                            Providing transparent UBI and community finance tools on Base using stable assets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                            <PiGlobe className="h-6 w-6 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-gray-900">Base-Native Infrastructure</p>
                                <p className="text-sm text-gray-500">UBI and treasury flows connected to Base network tooling.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                            <PiShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-gray-900">Stable Asset Focus</p>
                                <p className="text-sm text-gray-500">Primary treasury wallet and operations in Base USDC.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Socials/Links */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <PiGithubLogo className="h-5 w-5" />
                        GitHub
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <PiTwitterLogo className="h-5 w-5" />
                        X / Twitter
                    </button>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs text-gray-400">© 2026 Base UBI</p>
                    <p className="text-xs text-gray-400 mt-1">Built on Base ecosystem</p>
                </div>
            </div>
        </div>
    )
}
