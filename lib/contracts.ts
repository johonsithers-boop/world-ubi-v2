import { createPublicClient, http, defineChain } from 'viem'

export const baseChain = defineChain({
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
        default: { name: 'Basescan', url: 'https://basescan.org' },
    },
})

export const baseChainSepolia = defineChain({
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://sepolia.base.org'] },
    },
    blockExplorers: {
        default: { name: 'Basescan Sepolia', url: 'https://sepolia.basescan.org' },
    },
})

const chain = process.env.NEXT_PUBLIC_CHAIN === 'sepolia' ? baseChainSepolia : baseChain

export const viemClient = createPublicClient({
    chain,
    transport: http()
})

// UBI token ABI
export const basicIncomeABI = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'available',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'claim',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'setup',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ name: '', type: 'address' }],
        name: 'isActivated',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: '', type: 'address' }],
        name: 'lastClaimTimes',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'dailyAmount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalActivatedUsers',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
] as const

// UBI staking ABI
export const stakingABI = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'available',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'stake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'unstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'claimRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalStaked',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'rewardRateBps',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
] as const

/**
 * Validates an Ethereum address format
 */
export const isValidAddress = (address: string | null | undefined): address is `0x${string}` => {
    if (!address) return false
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const BASIC_INCOME_CONTRACT = process.env.NEXT_PUBLIC_BASIC_INCOME_CONTRACT as `0x${string}`
export const STAKING_CONTRACT = process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`

// Zero address constant for comparison
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * Check whether contract addresses are configured.
 */
export const areContractsConfigured = (): boolean => {
    return !!(
        BASIC_INCOME_CONTRACT &&
        STAKING_CONTRACT &&
        BASIC_INCOME_CONTRACT !== ZERO_ADDRESS &&
        STAKING_CONTRACT !== ZERO_ADDRESS
    )
}

/**
 * Get the current chain configuration
 */
export const getChainConfig = () => {
    const chainEnv = process.env.NEXT_PUBLIC_CHAIN
    const isMainnet = chainEnv === 'mainnet'
    return {
        chain: isMainnet ? baseChain : baseChainSepolia,
        isMainnet,
        isTestnet: !isMainnet,
        isContractsConfigured: areContractsConfigured()
    }
}
