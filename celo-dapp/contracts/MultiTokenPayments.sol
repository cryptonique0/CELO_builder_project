// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MultiTokenPayments
 * @dev Payment system supporting CELO, cUSD, cEUR, and other ERC20 tokens
 */
contract MultiTokenPayments is Pausable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Celo stable token addresses on mainnet
    address public constant cUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
    address public constant cEUR = 0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73;
    address public constant cREAL = 0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787;
    
    struct TokenPayment {
        address payer;
        address token; // address(0) for native CELO
        uint256 amount;
        string memo;
        uint256 timestamp;
    }
    
    struct TokenBalance {
        uint256 nativeBalance; // CELO
        uint256 cUSDBalance;
        uint256 cEURBalance;
        uint256 cREALBalance;
        mapping(address => uint256) customTokenBalances;
    }
    
    // State
    TokenPayment[] public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(address => TokenBalance) private balances;
    mapping(address => bool) public supportedTokens;
    
    uint256 public totalPayments;
    
    // Events
    event TokenPayment(
        address indexed payer,
        address indexed token,
        uint256 amount,
        string memo,
        uint256 timestamp
    );
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    
    constructor() Ownable(msg.sender) {
        // Add Celo stablecoins as supported
        supportedTokens[cUSD] = true;
        supportedTokens[cEUR] = true;
        supportedTokens[cREAL] = true;
    }
    
    /**
     * @dev Pay with native CELO
     */
    function payWithCELO(string memory memo) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Payment must be greater than 0");
        
        _recordPayment(msg.sender, address(0), msg.value, memo);
        balances[address(this)].nativeBalance += msg.value;
    }
    
    /**
     * @dev Pay with cUSD
     */
    function payWithcUSD(uint256 amount, string memory memo) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(cUSD).safeTransferFrom(msg.sender, address(this), amount);
        _recordPayment(msg.sender, cUSD, amount, memo);
        balances[address(this)].cUSDBalance += amount;
    }
    
    /**
     * @dev Pay with cEUR
     */
    function payWithcEUR(uint256 amount, string memory memo) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(cEUR).safeTransferFrom(msg.sender, address(this), amount);
        _recordPayment(msg.sender, cEUR, amount, memo);
        balances[address(this)].cEURBalance += amount;
    }
    
    /**
     * @dev Pay with cREAL
     */
    function payWithcREAL(uint256 amount, string memory memo) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(cREAL).safeTransferFrom(msg.sender, address(this), amount);
        _recordPayment(msg.sender, cREAL, amount, memo);
        balances[address(this)].cREALBalance += amount;
    }
    
    /**
     * @dev Pay with any supported ERC20 token
     */
    function payWithToken(
        address token,
        uint256 amount,
        string memory memo
    ) external whenNotPaused nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        _recordPayment(msg.sender, token, amount, memo);
        balances[address(this)].customTokenBalances[token] += amount;
    }
    
    /**
     * @dev Internal function to record payment
     */
    function _recordPayment(
        address payer,
        address token,
        uint256 amount,
        string memory memo
    ) private {
        payments.push(TokenPayment({
            payer: payer,
            token: token,
            amount: amount,
            memo: memo,
            timestamp: block.timestamp
        }));
        
        userPayments[payer].push(payments.length - 1);
        totalPayments++;
        
        emit TokenPayment(payer, token, amount, memo, block.timestamp);
    }
    
    /**
     * @dev Withdraw native CELO
     */
    function withdrawCELO(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        balances[address(this)].nativeBalance -= amount;
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit TokenWithdrawn(address(0), to, amount);
    }
    
    /**
     * @dev Withdraw ERC20 tokens
     */
    function withdrawToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        IERC20 tokenContract = IERC20(token);
        require(amount <= tokenContract.balanceOf(address(this)), "Insufficient balance");
        
        if (token == cUSD) {
            balances[address(this)].cUSDBalance -= amount;
        } else if (token == cEUR) {
            balances[address(this)].cEURBalance -= amount;
        } else if (token == cREAL) {
            balances[address(this)].cREALBalance -= amount;
        } else {
            balances[address(this)].customTokenBalances[token] -= amount;
        }
        
        tokenContract.safeTransfer(to, amount);
        
        emit TokenWithdrawn(token, to, amount);
    }
    
    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }
    
    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }
    
    /**
     * @dev Get contract balances
     */
    function getBalances() external view returns (
        uint256 celoBalance,
        uint256 cUSDBalance,
        uint256 cEURBalance,
        uint256 cREALBalance
    ) {
        return (
            address(this).balance,
            IERC20(cUSD).balanceOf(address(this)),
            IERC20(cEUR).balanceOf(address(this)),
            IERC20(cREAL).balanceOf(address(this))
        );
    }
    
    /**
     * @dev Get token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        }
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @dev Get user payment indices
     */
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }
    
    /**
     * @dev Get payment details
     */
    function getPayment(uint256 index) external view returns (
        address payer,
        address token,
        uint256 amount,
        string memory memo,
        uint256 timestamp
    ) {
        require(index < payments.length, "Payment does not exist");
        TokenPayment memory p = payments[index];
        return (p.payer, p.token, p.amount, p.memo, p.timestamp);
    }
    
    /**
     * @dev Get total payments count
     */
    function getTotalPayments() external view returns (uint256) {
        return payments.length;
    }
    
    /**
     * @dev Get payment stats
     */
    function getStats() external view returns (
        uint256 _totalPayments,
        uint256 _celoBalance,
        uint256 _cUSDBalance,
        uint256 _cEURBalance,
        bool _paused
    ) {
        return (
            totalPayments,
            address(this).balance,
            IERC20(cUSD).balanceOf(address(this)),
            IERC20(cEUR).balanceOf(address(this)),
            paused()
        );
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    receive() external payable {
        balances[address(this)].nativeBalance += msg.value;
    }
}
