// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimplePayments
 * @notice Minimal contract to receive native payments with configurable fees and allow owner withdrawals.
 * Designed for Base (EVM compatible). This is intentionally small for contest push.
 */
contract SimplePayments {
    address public owner;
    address public feeRecipient;
    uint256 public feePercentage; // Fee in basis points (100 = 1%)
    uint256 public totalFeesCollected;

    event Paid(address indexed payer, uint256 amount, uint256 fee);
    event Withdraw(address indexed to, uint256 amount);
    event FeeUpdated(uint256 newFeePercentage);
    event FeeWithdrawn(address indexed to, uint256 amount);
    event FeeRecipientUpdated(address indexed newRecipient);

    constructor() {
        owner = msg.sender;
        feeRecipient = 0x09CfC96ee842F441ff1e58056366C7cB6c117593;
        feePercentage = 100; // Default 1% fee
    }

    // Accept native payments
    receive() external payable {
        uint256 fee = (msg.value * feePercentage) / 10000;
        totalFeesCollected += fee;
        
        // Send fee to recipient
        if (fee > 0) {
            (bool ok, ) = payable(feeRecipient).call{value: fee}("");
            require(ok, "fee transfer failed");
        }
        
        emit Paid(msg.sender, msg.value, fee);
    }

    fallback() external payable {
        uint256 fee = (msg.value * feePercentage) / 10000;
        totalFeesCollected += fee;
        
        // Send fee to recipient
        if (fee > 0) {
            (bool ok, ) = payable(feeRecipient).call{value: fee}("");
            require(ok, "fee transfer failed");
        }
        
        emit Paid(msg.sender, msg.value, fee);
    }

    // Set fee percentage (in basis points: 100 = 1%)
    function setFeePercentage(uint256 _newFeePercentage) external {
        require(msg.sender == owner, "only owner");
        require(_newFeePercentage <= 10000, "fee cannot exceed 100%");
        feePercentage = _newFeePercentage;
        emit FeeUpdated(_newFeePercentage);
    }

    // Set fee recipient address
    function setFeeRecipient(address _newRecipient) external {
        require(msg.sender == owner, "only owner");
        require(_newRecipient != address(0), "invalid address");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }

    function withdraw(address payable to, uint256 amount) external {
        require(msg.sender == owner, "only owner");
        require(address(this).balance >= amount, "insufficient balance");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "transfer failed");
        emit Withdraw(to, amount);
    }

    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    // Get collected fees
    function getCollectedFees() external view returns (uint256) {
        return totalFeesCollected;
    }
}
