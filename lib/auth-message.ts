export const WALLET_AUTH_PREFIX = 'Sign in to Base UBI'

export interface WalletAuthMessageInput {
    address: string
    nonce: string
    uri: string
    issuedAt: string
}

export function createWalletAuthMessage(input: WalletAuthMessageInput): string {
    return [
        WALLET_AUTH_PREFIX,
        `Address: ${input.address}`,
        `Nonce: ${input.nonce}`,
        `URI: ${input.uri}`,
        `Issued At: ${input.issuedAt}`,
        'This request will not trigger a blockchain transaction or gas fee.'
    ].join('\n')
}

export function extractAddressAndNonceFromMessage(message: string): {
    address: string
    nonce: string
} | null {
    if (!message.startsWith(WALLET_AUTH_PREFIX)) {
        return null
    }

    const addressMatch = message.match(/^Address:\s*(0x[a-fA-F0-9]{40})$/m)
    const nonceMatch = message.match(/^Nonce:\s*([a-zA-Z0-9]+)$/m)

    if (!addressMatch || !nonceMatch) {
        return null
    }

    return {
        address: addressMatch[1],
        nonce: nonceMatch[1]
    }
}
