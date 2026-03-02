'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PiUser, PiArrowLeft, PiCheckCircleFill, PiIdentificationCard, PiDeviceMobile } from 'react-icons/pi'

export default function ProfilePage({
    params
}: {
    params: Promise<{ lang: string }>
}) {
    use(params) // consume route params promise
    const router = useRouter()
    const dictionary = useDictionary()
    const { walletAddress } = useWallet()

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
                    {dictionary.menu.profile}
                </h1>
            </div>

            <div className="px-6 pt-6 space-y-6">
                {/* Profile Overview */}
                <div className="text-center py-6">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
                        <PiUser className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Base Wallet User</h2>
                    <p className="text-gray-500 font-mono text-sm">
                        {walletAddress ? formatAddress(walletAddress) : 'Not Connected'}
                    </p>
                </div>

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <PiIdentificationCard className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-600">Wallet Status</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                                <PiCheckCircleFill className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-bold text-green-700 capitalize">
                                    Active
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <PiDeviceMobile className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-600">Platform</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 uppercase">
                                Base
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
