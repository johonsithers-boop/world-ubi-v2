'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { PiWarningCircle, PiArrowClockwise, PiHouse } from 'react-icons/pi'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // In production, forward to a monitoring service (e.g. Sentry):
        // if (process.env.NODE_ENV === 'production') { Sentry.captureException(error) }
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <PiWarningCircle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Something went wrong
                </h1>
                <p className="text-gray-500 mb-6">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={reset} variant="outline">
                        <PiArrowClockwise className="h-4 w-4 mr-2" />
                        Try again
                    </Button>
                    <Link href="/en">
                        <Button>
                            <PiHouse className="h-4 w-4 mr-2" />
                            Go home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
