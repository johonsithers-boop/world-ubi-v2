import { promises as fs } from 'fs'
import path from 'path'
import { serverEnv } from '@/lib/env.server'

export interface Vote {
    optionIndex: number
    nullifierHash: string
    timestamp: number
}

export interface PollVotes {
    pollId: string
    votes: Vote[]
}

export interface VotesDatabase {
    polls: Record<string, Vote[]>
    nullifiers: string[]
}

const DATA_DIR = path.dirname(serverEnv.DATABASE_PATH)
const DB_FILE = serverEnv.DATABASE_PATH || path.join(DATA_DIR, 'votes.json')

async function ensureDataDir(): Promise<void> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true })
    } catch {
        // Directory may already exist
    }
}

async function readDatabase(): Promise<VotesDatabase> {
    try {
        await ensureDataDir()
        const data = await fs.readFile(DB_FILE, 'utf-8')
        return JSON.parse(data) as VotesDatabase
    } catch {
        // File doesn't exist or is invalid, return empty database
        return { polls: {}, nullifiers: [] }
    }
}

async function writeDatabase(db: VotesDatabase): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

/**
 * Check if a nullifier has been used for a specific poll
 */
export async function isNullifierUsed(pollId: string, nullifierHash: string): Promise<boolean> {
    const db = await readDatabase()
    const key = `${pollId}:${nullifierHash}`
    return db.nullifiers.includes(key)
}

/**
 * Add a vote to a poll
 */
export async function addVote(
    pollId: string,
    optionIndex: number,
    nullifierHash: string
): Promise<{ success: boolean; error?: string }> {
    const db = await readDatabase()
    const nullifierKey = `${pollId}:${nullifierHash}`

    // Check if already voted
    if (db.nullifiers.includes(nullifierKey)) {
        return { success: false, error: 'You have already voted in this poll' }
    }

    // Initialize poll votes array if needed
    if (!db.polls[pollId]) {
        db.polls[pollId] = []
    }

    // Add the vote
    db.polls[pollId].push({
        optionIndex,
        nullifierHash,
        timestamp: Date.now()
    })

    // Mark nullifier as used
    db.nullifiers.push(nullifierKey)

    // Save to file
    await writeDatabase(db)

    return { success: true }
}

/**
 * Get vote counts for a poll
 */
export async function getVoteCounts(pollId: string): Promise<{
    totalVotes: number
    voteCounts: Record<number, number>
}> {
    const db = await readDatabase()
    const pollVotes = db.polls[pollId] || []

    const voteCounts = pollVotes.reduce((acc, vote) => {
        acc[vote.optionIndex] = (acc[vote.optionIndex] || 0) + 1
        return acc
    }, {} as Record<number, number>)

    return {
        totalVotes: pollVotes.length,
        voteCounts
    }
}

/**
 * Get all votes for a poll (for admin/analytics)
 */
export async function getPollVotes(pollId: string): Promise<Vote[]> {
    const db = await readDatabase()
    return db.polls[pollId] || []
}

/**
 * Get all poll IDs that have votes
 */
export async function getAllPolls(): Promise<string[]> {
    const db = await readDatabase()
    return Object.keys(db.polls)
}
