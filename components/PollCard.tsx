'use client'

import { useState, useCallback } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card'
import { Verify } from './Verify'
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
    onVote?: (pollId: string, optionIndex: number, nullifierHash: string) => void
    onError?: (error: Error) => void
}

export function PollCard({ poll, onVote, onError }: PollCardProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [voteError, setVoteError] = useState<string | null>(null)
    const dictionary = useDictionary()

    const handleVoteSuccess = useCallback(async (result: { nullifier_hash: string }) => {
        if (selectedOption === null) return

        setIsVoting(true)
        setVoteError(null)
        
        try {
            // Submit vote to API
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pollId: poll.id,
                    optionIndex: selectedOption,
                    nullifierHash: result.nullifier_hash
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `Vote failed with status ${response.status}`)
            }

            setHasVoted(true)
            onVote?.(poll.id, selectedOption, result.nullifier_hash)
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to submit vote')
            setVoteError(err.message)
            onError?.(err)
        } finally {
            setIsVoting(false)
        }
    }, [selectedOption, poll.id, onVote, onError])

    const handleVerifyError = useCallback((error: unknown) => {
        const err = error instanceof Error ? error : new Error('Verification failed')
        setVoteError(err.message)
        onError?.(err)
    }, [onError])

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

                {!hasVoted && !isExpired && (
                    <Verify
                        action={`vote_poll_${poll.id}`}
                        signal={poll.id}
                        onSuccess={handleVoteSuccess}
                        onError={handleVerifyError}
                    >
                        <Button
                            fullWidth
                            className="mt-4"
                            disabled={selectedOption === null}
                            isLoading={isVoting}
                        >
                            {dictionary.govern.vote}
                        </Button>
                    </Verify>
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
