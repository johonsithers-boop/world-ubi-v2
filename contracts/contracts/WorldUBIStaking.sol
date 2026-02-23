// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WorldUBIStaking
 * @notice Stake WUBI tokens to earn rewards over time.
 *
 * Frontend ABI surface (must match lib/contracts.ts):
 *   - balanceOf(address) -> uint256
 *   - available(address) -> uint256
 *   - stake(uint256)
 *   - unstake(uint256)
 *   - claimRewards()
 */
contract WorldUBIStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---- State ----

    /// @notice The WUBI token being staked
    IERC20 public immutable stakingToken;

    /// @notice Annual reward rate in basis points (e.g. 500 = 5%)
    uint256 public rewardRateBps;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10_000;

    /// @notice Staked balance per user
    mapping(address => uint256) private _balances;

    /// @notice Timestamp of last reward accrual per user
    mapping(address => uint256) private _lastUpdateTime;

    /// @notice Accumulated but unclaimed rewards per user
    mapping(address => uint256) private _accruedRewards;

    /// @notice Total staked across all users
    uint256 public totalStaked;

    // ---- Events ----

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    // ---- Errors ----

    error ZeroAmount();
    error InsufficientStake(uint256 requested, uint256 available);
    error NoRewardsAvailable();

    // ---- Constructor ----

    /**
     * @param _stakingToken Address of the WUBI token contract.
     * @param _rewardRateBps Annual reward rate in basis points.
     * @param _initialOwner Admin/owner address.
     */
    constructor(
        address _stakingToken,
        uint256 _rewardRateBps,
        address _initialOwner
    ) Ownable(_initialOwner) {
        stakingToken = IERC20(_stakingToken);
        rewardRateBps = _rewardRateBps;
    }

    // ---- Modifiers ----

    /// @dev Accrue rewards for `account` before any balance change.
    modifier updateRewards(address account) {
        _accrueRewards(account);
        _;
    }

    // ---- Public views ----

    /**
     * @notice Returns the staked balance of `account`.
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Returns the total claimable rewards for `account` (accrued + pending).
     */
    function available(address account) external view returns (uint256) {
        return _accruedRewards[account] + _pendingRewards(account);
    }

    // ---- Public mutative ----

    /**
     * @notice Stake `amount` of WUBI tokens.
     */
    function stake(uint256 amount) external nonReentrant updateRewards(msg.sender) {
        if (amount == 0) revert ZeroAmount();

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstake `amount` of WUBI tokens.
     */
    function unstake(uint256 amount) external nonReentrant updateRewards(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (_balances[msg.sender] < amount) {
            revert InsufficientStake(amount, _balances[msg.sender]);
        }

        _balances[msg.sender] -= amount;
        totalStaked -= amount;
        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Claim all accrued staking rewards.
     * @dev Rewards are minted by the WUBI token. The staking contract must
     *      hold enough WUBI (transferred by the owner as a reward pool) or
     *      the WUBI contract must grant this contract minting rights.
     *      For the initial testnet deployment, the owner seeds the reward pool.
     */
    function claimRewards() external nonReentrant updateRewards(msg.sender) {
        uint256 reward = _accruedRewards[msg.sender];
        if (reward == 0) revert NoRewardsAvailable();

        _accruedRewards[msg.sender] = 0;
        stakingToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    // ---- Admin ----

    /**
     * @notice Update the annual reward rate. Only callable by the owner.
     */
    function setRewardRate(uint256 _newRateBps) external onlyOwner {
        uint256 old = rewardRateBps;
        rewardRateBps = _newRateBps;
        emit RewardRateUpdated(old, _newRateBps);
    }

    /**
     * @notice Seed or top up the reward pool by transferring WUBI tokens
     *         into this contract. Only callable by the owner.
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    // ---- Internal ----

    function _pendingRewards(address account) private view returns (uint256) {
        uint256 staked = _balances[account];
        if (staked == 0 || _lastUpdateTime[account] == 0) return 0;

        uint256 elapsed = block.timestamp - _lastUpdateTime[account];
        // reward = staked * rate * elapsed / (365 days * BPS_DENOMINATOR)
        return (staked * rewardRateBps * elapsed) / (365 days * BPS_DENOMINATOR);
    }

    function _accrueRewards(address account) private {
        _accruedRewards[account] += _pendingRewards(account);
        _lastUpdateTime[account] = block.timestamp;
    }
}
