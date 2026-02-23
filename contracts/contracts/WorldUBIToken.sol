// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WorldUBIToken
 * @notice ERC-20 token with daily UBI claim mechanism for World ID verified users.
 *
 * Frontend ABI surface (must match lib/contracts.ts):
 *   - available(address) -> uint256
 *   - claim()
 *   - setup()
 *   - isActivated(address) -> bool
 *   - lastClaimTimes(address) -> uint256
 */
contract WorldUBIToken is ERC20, Ownable, ReentrancyGuard {
    // ---- State ----

    /// @notice Daily UBI amount in wei (default 0.25 tokens = 250000000000000000)
    uint256 public dailyAmount;

    /// @notice Cooldown between claims (24 hours)
    uint256 public constant CLAIM_COOLDOWN = 24 hours;

    /// @notice Maximum supply cap (2.5 billion tokens)
    uint256 public constant MAX_SUPPLY = 2_500_000_000 ether;

    /// @notice 30% of supply reserved for staking rewards
    uint256 public constant STAKING_ALLOCATION = (MAX_SUPPLY * 30) / 100;

    /// @notice 20% of supply reserved for treasury/reserve
    uint256 public constant RESERVE_ALLOCATION = (MAX_SUPPLY * 20) / 100;

    /// @notice 50% of supply reserved for user UBI claims
    uint256 public constant UBI_ALLOCATION = MAX_SUPPLY - STAKING_ALLOCATION - RESERVE_ALLOCATION;

    /// @notice Reserve wallet that receives the 20% reserve allocation
    address public immutable reserveWallet;

    /// @notice Total amount minted through user UBI claims
    uint256 public ubiMinted;

    /// @notice Whether the staking allocation has been minted
    bool public stakingAllocationMinted;

    /// @notice Whether a user has activated (registered) for UBI
    mapping(address => bool) public isActivated;

    /// @notice Timestamp of the last claim for each user
    mapping(address => uint256) public lastClaimTimes;

    /// @notice Total number of activated users
    uint256 public totalActivatedUsers;

    // ---- Events ----

    event UserActivated(address indexed user);
    event UBIClaimed(address indexed user, uint256 amount);
    event DailyAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event ReserveAllocated(address indexed reserveWallet, uint256 amount);
    event StakingAllocationMinted(address indexed recipient, uint256 amount);

    // ---- Errors ----

    error AlreadyActivated();
    error NotActivated();
    error CooldownNotElapsed(uint256 nextClaimTime);
    error MaxSupplyReached();
    error InvalidAddress();
    error StakingAllocationAlreadyMinted();
    error UBIAllocationExceeded();

    // ---- Constructor ----

    /**
     * @param _dailyAmount Daily UBI amount in wei
     * @param _reserveWallet Reserve wallet receiving 20% allocation
     * @param _initialOwner Owner address for admin functions
     */
    constructor(
        uint256 _dailyAmount,
        address _reserveWallet,
        address _initialOwner
    ) ERC20("World UBI Coin", "WUBI") Ownable(_initialOwner) {
        if (_reserveWallet == address(0) || _initialOwner == address(0)) revert InvalidAddress();

        dailyAmount = _dailyAmount;
        reserveWallet = _reserveWallet;

        _mint(_reserveWallet, RESERVE_ALLOCATION);
        emit ReserveAllocated(_reserveWallet, RESERVE_ALLOCATION);
    }

    // ---- Public functions ----

    /**
     * @notice Register the caller for UBI. Must be called before the first claim.
     * @dev In a production deployment, this would verify a World ID proof.
     *      For the testnet version, any address can self-register once.
     */
    function setup() external {
        if (isActivated[msg.sender]) revert AlreadyActivated();

        isActivated[msg.sender] = true;
        totalActivatedUsers++;

        emit UserActivated(msg.sender);
    }

    /**
     * @notice Claim the daily UBI allocation.
     */
    function claim() external nonReentrant {
        if (!isActivated[msg.sender]) revert NotActivated();

        uint256 lastClaim = lastClaimTimes[msg.sender];
        if (lastClaim != 0 && block.timestamp < lastClaim + CLAIM_COOLDOWN) {
            revert CooldownNotElapsed(lastClaim + CLAIM_COOLDOWN);
        }

        if (ubiMinted + dailyAmount > UBI_ALLOCATION) revert UBIAllocationExceeded();
        if (totalSupply() + dailyAmount > MAX_SUPPLY) revert MaxSupplyReached();

        lastClaimTimes[msg.sender] = block.timestamp;
        ubiMinted += dailyAmount;
        _mint(msg.sender, dailyAmount);

        emit UBIClaimed(msg.sender, dailyAmount);
    }

    /**
     * @notice Returns how many tokens the user can claim right now.
     * @param account The user address to check.
     * @return The claimable amount (dailyAmount if eligible, 0 otherwise).
     */
    function available(address account) external view returns (uint256) {
        if (!isActivated[account]) return 0;

        uint256 lastClaim = lastClaimTimes[account];
        if (lastClaim != 0 && block.timestamp < lastClaim + CLAIM_COOLDOWN) {
            return 0;
        }

        if (ubiMinted + dailyAmount > UBI_ALLOCATION) return 0;
        if (totalSupply() + dailyAmount > MAX_SUPPLY) return 0;

        return dailyAmount;
    }

    // ---- Admin functions ----

    /**
     * @notice Update the daily UBI amount. Only callable by the owner.
     * @param _newAmount New daily amount in wei.
     */
    function setDailyAmount(uint256 _newAmount) external onlyOwner {
        uint256 old = dailyAmount;
        dailyAmount = _newAmount;
        emit DailyAmountUpdated(old, _newAmount);
    }

    /**
     * @notice Mint the one-time 30% staking allocation to `recipient`.
     * @dev Intended to be called once for the staking contract after deployment.
     */
    function mintStakingAllocation(address recipient) external onlyOwner {
        if (recipient == address(0)) revert InvalidAddress();
        if (stakingAllocationMinted) revert StakingAllocationAlreadyMinted();
        if (totalSupply() + STAKING_ALLOCATION > MAX_SUPPLY) revert MaxSupplyReached();

        stakingAllocationMinted = true;
        _mint(recipient, STAKING_ALLOCATION);

        emit StakingAllocationMinted(recipient, STAKING_ALLOCATION);
    }
}
