import { createPublicClient, http, defineChain } from 'viem'

export const worldChain = defineChain({
    id: 480,
    name: 'World Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
    },
    blockExplorers: {
        default: { name: 'Worldscan', url: 'https://worldscan.org' },
    },
})

export const worldChainSepolia = defineChain({
    id: 4801,
    name: 'World Chain Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://worldchain-sepolia.g.alchemy.com/public'] },
    },
    blockExplorers: {
        default: { name: 'Worldscan Sepolia', url: 'https://worldchain-sepolia.explorer.alchemy.com' },
    },
})

const chain = process.env.NEXT_PUBLIC_CHAIN === 'sepolia' ? worldChainSepolia : worldChain

export const viemClient = createPublicClient({
    chain,
    transport: http()
})

// WorldUBIToken ABI — generated from contracts/artifacts
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

// WorldUBIStaking ABI — generated from contracts/artifacts
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
        chain: isMainnet ? worldChain : worldChainSepolia,
        isMainnet,
        isTestnet: !isMainnet,
        isContractsConfigured: areContractsConfigured()
    }
}
