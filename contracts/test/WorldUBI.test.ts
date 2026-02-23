import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import type { WorldUBIToken, WorldUBIStaking } from '../typechain-types'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

describe('WorldUBIToken', function () {
  let token: WorldUBIToken
  let owner: HardhatEthersSigner
  let user1: HardhatEthersSigner
  let user2: HardhatEthersSigner
  let reserveWallet: HardhatEthersSigner
  const dailyAmount = ethers.parseEther('0.25')

  beforeEach(async function () {
    ;[owner, user1, user2, reserveWallet] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('WorldUBIToken')
    token = (await Factory.deploy(dailyAmount, reserveWallet.address, owner.address)) as WorldUBIToken
  })

  describe('tokenomics allocation', function () {
    it('mints 20% reserve allocation to the reserve wallet at deployment', async function () {
      const reserveAllocation = await token.RESERVE_ALLOCATION()
      expect(await token.balanceOf(reserveWallet.address)).to.equal(reserveAllocation)
    })

    it('mints staking allocation only once', async function () {
      const stakingRecipient = user2.address
      const stakingAllocation = await token.STAKING_ALLOCATION()

      await token.connect(owner).mintStakingAllocation(stakingRecipient)
      expect(await token.balanceOf(stakingRecipient)).to.equal(stakingAllocation)

      await expect(token.connect(owner).mintStakingAllocation(stakingRecipient)).to.be.revertedWithCustomError(
        token,
        'StakingAllocationAlreadyMinted'
      )
    })
  })

  describe('setup()', function () {
    it('activates a user', async function () {
      await token.connect(user1).setup()
      expect(await token.isActivated(user1.address)).to.equal(true)
      expect(await token.totalActivatedUsers()).to.equal(1)
    })

    it('reverts if already activated', async function () {
      await token.connect(user1).setup()
      await expect(token.connect(user1).setup()).to.be.revertedWithCustomError(token, 'AlreadyActivated')
    })
  })

  describe('claim()', function () {
    beforeEach(async function () {
      await token.connect(user1).setup()
    })

    it('mints dailyAmount on first claim', async function () {
      await token.connect(user1).claim()
      expect(await token.balanceOf(user1.address)).to.equal(dailyAmount)
    })

    it('reverts if not activated', async function () {
      await expect(token.connect(user2).claim()).to.be.revertedWithCustomError(token, 'NotActivated')
    })

    it('reverts if cooldown not elapsed', async function () {
      await token.connect(user1).claim()
      await expect(token.connect(user1).claim()).to.be.revertedWithCustomError(token, 'CooldownNotElapsed')
    })

    it('allows claim after 24h cooldown', async function () {
      await token.connect(user1).claim()
      await time.increase(24 * 60 * 60)
      await token.connect(user1).claim()
      expect(await token.balanceOf(user1.address)).to.equal(dailyAmount * 2n)
    })
  })

  describe('available()', function () {
    it('returns 0 for non-activated user', async function () {
      expect(await token.available(user2.address)).to.equal(0)
    })

    it('returns dailyAmount for activated user who hasn\'t claimed', async function () {
      await token.connect(user1).setup()
      expect(await token.available(user1.address)).to.equal(dailyAmount)
    })

    it('returns 0 during cooldown', async function () {
      await token.connect(user1).setup()
      await token.connect(user1).claim()
      expect(await token.available(user1.address)).to.equal(0)
    })
  })

  describe('admin', function () {
    it('owner can update daily amount', async function () {
      const newAmount = ethers.parseEther('0.5')
      await token.connect(owner).setDailyAmount(newAmount)
      expect(await token.dailyAmount()).to.equal(newAmount)
    })

    it('non-owner cannot update daily amount', async function () {
      await expect(token.connect(user1).setDailyAmount(1)).to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
    })
  })
})

describe('WorldUBIStaking', function () {
  let token: WorldUBIToken
  let staking: WorldUBIStaking
  let owner: HardhatEthersSigner
  let user1: HardhatEthersSigner
  let reserveWallet: HardhatEthersSigner
  const dailyAmount = ethers.parseEther('0.25')
  const rewardRateBps = 500 // 5%

  beforeEach(async function () {
    ;[owner, user1, reserveWallet] = await ethers.getSigners()

    // Deploy token
    const TokenFactory = await ethers.getContractFactory('WorldUBIToken')
    token = (await TokenFactory.deploy(dailyAmount, reserveWallet.address, owner.address)) as WorldUBIToken

    // Deploy staking
    const StakingFactory = await ethers.getContractFactory('WorldUBIStaking')
    staking = (await StakingFactory.deploy(await token.getAddress(), rewardRateBps, owner.address)) as WorldUBIStaking

    // Mint staking allocation directly to staking contract
    await token.connect(owner).mintStakingAllocation(await staking.getAddress())

    // Give user1 some tokens: activate + claim multiple days
    await token.connect(user1).setup()
    await token.connect(user1).claim()
    for (let i = 0; i < 9; i++) {
      await time.increase(24 * 60 * 60)
      await token.connect(user1).claim()
    }
    // user1 now has 10 * 0.25 = 2.5 WUBI
  })

  describe('stake()', function () {
    it('stakes tokens and updates balance', async function () {
      const amount = ethers.parseEther('1')
      await token.connect(user1).approve(await staking.getAddress(), amount)
      await staking.connect(user1).stake(amount)

      expect(await staking.balanceOf(user1.address)).to.equal(amount)
      expect(await staking.totalStaked()).to.equal(amount)
    })

    it('reverts on zero amount', async function () {
      await expect(staking.connect(user1).stake(0)).to.be.revertedWithCustomError(staking, 'ZeroAmount')
    })
  })

  describe('unstake()', function () {
    it('unstakes tokens', async function () {
      const amount = ethers.parseEther('1')
      await token.connect(user1).approve(await staking.getAddress(), amount)
      await staking.connect(user1).stake(amount)
      await staking.connect(user1).unstake(amount)

      expect(await staking.balanceOf(user1.address)).to.equal(0)
    })

    it('reverts if insufficient stake', async function () {
      const big = ethers.parseEther('999')
      await expect(staking.connect(user1).unstake(big)).to.be.revertedWithCustomError(staking, 'InsufficientStake')
    })
  })

  describe('rewards', function () {
    it('accrues rewards over time', async function () {
      const amount = ethers.parseEther('1')
      await token.connect(user1).approve(await staking.getAddress(), amount)
      await staking.connect(user1).stake(amount)

      // Advance 365 days
      await time.increase(365 * 24 * 60 * 60)

      const rewards = await staking.available(user1.address)
      // Expected: 1 * 500 / 10000 = 0.05 WUBI per year
      const expected = ethers.parseEther('0.05')
      // Allow 1% tolerance for block timestamp rounding
      expect(rewards).to.be.closeTo(expected, expected / 100n)
    })

    it('claims rewards', async function () {
      const amount = ethers.parseEther('1')
      await token.connect(user1).approve(await staking.getAddress(), amount)
      await staking.connect(user1).stake(amount)

      await time.increase(365 * 24 * 60 * 60)
      const balanceBefore = await token.balanceOf(user1.address)
      await staking.connect(user1).claimRewards()
      const balanceAfter = await token.balanceOf(user1.address)

      expect(balanceAfter).to.be.gt(balanceBefore)
    })
  })
})
