import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString())

  // --- Configuration ---
  const dailyAmount = process.env.UBI_DAILY_AMOUNT || ethers.parseEther('0.25').toString()
  const rewardRateBps = Number(process.env.STAKING_REWARD_RATE || '500') // 5%
  const reserveWalletInput = process.env.RESERVE_WALLET || '0x91257866118213d1caf2d13d9280e46e724c41fe'
  if (!ethers.isAddress(reserveWalletInput)) {
    throw new Error(`Invalid RESERVE_WALLET address: ${reserveWalletInput}`)
  }
  const reserveWallet = ethers.getAddress(reserveWalletInput)

  const maxSupply = ethers.parseEther('2500000000')
  const stakingAllocation = (maxSupply * 30n) / 100n
  const reserveAllocation = (maxSupply * 20n) / 100n
  const ubiAllocation = maxSupply - stakingAllocation - reserveAllocation

  // --- Deploy WorldUBIToken ---
  console.log('\n1. Deploying WorldUBIToken...')
  const UBIToken = await ethers.getContractFactory('WorldUBIToken')
  const ubiToken = await UBIToken.deploy(dailyAmount, reserveWallet, deployer.address)
  await ubiToken.waitForDeployment()
  const ubiTokenAddress = await ubiToken.getAddress()
  console.log('   WorldUBIToken deployed to:', ubiTokenAddress)

  // --- Deploy WorldUBIStaking ---
  console.log('\n2. Deploying WorldUBIStaking...')
  const Staking = await ethers.getContractFactory('WorldUBIStaking')
  const staking = await Staking.deploy(ubiTokenAddress, rewardRateBps, deployer.address)
  await staking.waitForDeployment()
  const stakingAddress = await staking.getAddress()
  console.log('   WorldUBIStaking deployed to:', stakingAddress)

  // --- Mint staking allocation directly to staking contract ---
  console.log('\n3. Minting staking allocation (30%) to staking contract...')
  const mintTx = await ubiToken.mintStakingAllocation(stakingAddress)
  await mintTx.wait()
  console.log('   Staking allocation minted')

  console.log('\n--- Deployment complete ---')
  console.log('')
  console.log('Tokenomics allocation:')
  console.log(`  Reserve wallet (20%): ${ethers.formatEther(reserveAllocation)} WUBI -> ${reserveWallet}`)
  console.log(`  Staking allocation (30%): ${ethers.formatEther(stakingAllocation)} WUBI -> ${stakingAddress}`)
  console.log(`  UBI claims allocation (50%): ${ethers.formatEther(ubiAllocation)} WUBI`)
  console.log('')
  console.log('Update your .env.local in the Next.js app:')
  console.log(`  NEXT_PUBLIC_BASIC_INCOME_CONTRACT=${ubiTokenAddress}`)
  console.log(`  NEXT_PUBLIC_STAKING_CONTRACT=${stakingAddress}`)
  console.log('')
  console.log('To verify contracts on block explorer:')
  console.log(`  npx hardhat verify --network worldChainSepolia ${ubiTokenAddress} ${dailyAmount} ${reserveWallet} ${deployer.address}`)
  console.log(`  npx hardhat verify --network worldChainSepolia ${stakingAddress} ${ubiTokenAddress} ${rewardRateBps} ${deployer.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
