'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card'
import { useDictionary } from '@/components/providers/DictionaryProvider'

interface Poll {
    id: string
    title: string
    description: string
    options: string[]
    endDate: string
    totalVotes: number
}

interface PollCardProps {
    poll: Poll
    onVote?: (pollId: string, optionIndex: number) => void
    onError?: (error: Error) => void
}

export function PollCard({ poll, onVote, onError }: PollCardProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [voteError, setVoteError] = useState<string | null>(null)
    const dictionary = useDictionary()
    const { status } = useSession()

    const handleVote = useCallback(async () => {
        if (selectedOption === null) return
        setVoteError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pollId: poll.id,
                    optionIndex: selectedOption
                })
            })

            const payload = (await response.json().catch(() => null)) as { error?: string } | null

            if (!response.ok) {
                if (response.status === 401) {
                    setVoteError('Sign in with your wallet to vote.')
                    return
                }
                const message = payload?.error || 'Unable to submit vote.'
                setVoteError(message)
                return
            }

            setHasVoted(true)
            onVote?.(poll.id, selectedOption)
        } catch (error) {
            const voteException = error instanceof Error ? error : new Error('Unable to submit vote.')
            setVoteError(voteException.message)
            onError?.(voteException)
        } finally {
            setIsSubmitting(false)
        }
    }, [onError, onVote, poll.id, selectedOption])

    const endDate = new Date(poll.endDate)
    const isExpired = endDate < new Date()

    return (
        <Card>
            <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {poll.options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => !hasVoted && !isExpired && setSelectedOption(index)}
                            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedOption === index
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                } ${(hasVoted || isExpired) && 'pointer-events-none opacity-60'}`}
                        >
                            <p className="font-medium">{option}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{dictionary.govern.totalVotes}: {poll.totalVotes}</span>
                    <span>{dictionary.govern.endDate}: {endDate.toLocaleDateString()}</span>
                </div>

                {voteError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        {voteError}
                    </div>
                )}

                {status !== 'authenticated' && !isExpired && (
                    <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        Sign in with your wallet on the home page to enable voting.
                    </p>
                )}

                {!hasVoted && !isExpired && (
                    <Button
                        fullWidth
                        className="mt-4"
                        disabled={selectedOption === null || isSubmitting || status !== 'authenticated'}
                        onClick={handleVote}
                    >
                        {isSubmitting ? 'Submitting...' : dictionary.govern.vote}
                    </Button>
                )}

                {hasVoted && (
                    <div className="mt-4 text-center text-green-600 font-medium">
                        {dictionary.govern.voted}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
