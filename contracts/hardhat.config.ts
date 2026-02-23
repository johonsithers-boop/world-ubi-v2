import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config()

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '0x' + '0'.repeat(64)

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 4801,
    },
    worldChainSepolia: {
      url: 'https://worldchain-sepolia.g.alchemy.com/public',
      chainId: 4801,
      accounts: DEPLOYER_PRIVATE_KEY !== '0x' + '0'.repeat(64)
        ? [DEPLOYER_PRIVATE_KEY]
        : [],
    },
    worldChain: {
      url: 'https://worldchain-mainnet.g.alchemy.com/public',
      chainId: 480,
      accounts: DEPLOYER_PRIVATE_KEY !== '0x' + '0'.repeat(64)
        ? [DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    apiKey: {
      worldChainSepolia: process.env.ETHERSCAN_API_KEY || '',
      worldChain: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'worldChainSepolia',
        chainId: 4801,
        urls: {
          apiURL: 'https://worldchain-sepolia.explorer.alchemy.com/api',
          browserURL: 'https://worldchain-sepolia.explorer.alchemy.com',
        },
      },
      {
        network: 'worldChain',
        chainId: 480,
        urls: {
          apiURL: 'https://worldscan.org/api',
          browserURL: 'https://worldscan.org',
        },
      },
    ],
  },
}

export default config
