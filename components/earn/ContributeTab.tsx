'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useDictionary } from '@/components/providers/DictionaryProvider'
import { PiHandHeart, PiUsers, PiCopy, PiCheck } from 'react-icons/pi'
import { PRIMARY_BASE_WALLET } from '@/lib/baseWallet'

interface ContributeTabProps {
    walletAddress: string | null
}

export function ContributeTab({ walletAddress }: ContributeTabProps) {
    const dictionary = useDictionary()
    const [isDonating, setIsDonating] = useState(false)
    const [copied, setCopied] = useState(false)

    const t = dictionary.earn.tabs.contribute
    const referralLink = walletAddress
        ? `https://basescan.org/address/${walletAddress}`
        : 'Base wallet is not available'

    const handleDonate = async () => {
        setIsDonating(true)
        try {
            await navigator.clipboard.writeText(PRIMARY_BASE_WALLET)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
        } finally {
            setIsDonating(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
        }
    }

    return (
        <div className="w-full space-y-4">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                        <PiHandHeart className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl">{t.title}</CardTitle>
                    <CardDescription>{t.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleDonate}
                        isLoading={isDonating}
                        fullWidth
                        size="lg"
                    >
                        {isDonating ? 'Copying...' : 'Copy Base Wallet Address'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                            <PiUsers className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{t.referralTitle}</CardTitle>
                            <CardDescription>{t.referralSubtitle}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={copyToClipboard}
                            disabled={!walletAddress}
                        >
                            {copied ? (
                                <PiCheck className="h-5 w-5 text-green-500" />
                            ) : (
                                <PiCopy className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
