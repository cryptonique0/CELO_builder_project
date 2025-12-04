// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AdvancedPayments
 * @dev Enhanced payment contract with split payments, batch operations, and advanced features
 */
contract AdvancedPayments is Pausable, Ownable, ReentrancyGuard {
    
    // Payment structures
    struct Payment {
        address payer;
        uint256 amount;
        string memo;
        uint256 timestamp;
    }
    
    struct SplitPayment {
        address[] recipients;
        uint256[] amounts;
        string memo;
    }
    
    struct PaymentRequest {
        address creator;
        address recipient;
        uint256 amount;
        string description;
        bool fulfilled;
        uint256 createdAt;
    }
    
    // State variables
    Payment[] public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(bytes32 => PaymentRequest) public paymentRequests;
    
    uint256 public totalReceived;
    uint256 public totalWithdrawn;
    uint256 public paymentCount;
    
    // Events
    event Paid(address indexed payer, uint256 amount, string memo, uint256 timestamp);
    event SplitPaymentSent(address indexed payer, uint256 totalAmount, uint256 recipientCount);
    event BatchPaymentSent(address indexed payer, uint256 totalAmount, uint256 recipientCount);
    event PaymentRequestCreated(bytes32 indexed requestId, address indexed creator, uint256 amount);
    event PaymentRequestFulfilled(bytes32 indexed requestId, address indexed payer);
    event Withdrawn(address indexed to, uint256 amount);
    
    constructor() {}
    
    /**
     * @dev Send a simple payment with memo
     */
    function payWithMemo(string memory memo) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Payment must be greater than 0");
        
        payments.push(Payment({
            payer: msg.sender,
            amount: msg.value,
            memo: memo,
            timestamp: block.timestamp
        }));
        
        userPayments[msg.sender].push(payments.length - 1);
        totalReceived += msg.value;
        paymentCount++;
        
        emit Paid(msg.sender, msg.value, memo, block.timestamp);
    }
    
    /**
     * @dev Split payment among multiple recipients
     */
    function splitPayment(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory memo
    ) external payable whenNotPaused nonReentrant {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        require(recipients.length > 0, "No recipients provided");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(msg.value >= totalAmount, "Insufficient payment");
        
        // Send to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }
        
        // Record payment
        payments.push(Payment({
            payer: msg.sender,
            amount: msg.value,
            memo: memo,
            timestamp: block.timestamp
        }));
        
        userPayments[msg.sender].push(payments.length - 1);
        totalReceived += msg.value;
        paymentCount++;
        
        // Refund excess
        if (msg.value > totalAmount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalAmount}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit SplitPaymentSent(msg.sender, totalAmount, recipients.length);
        emit Paid(msg.sender, msg.value, memo, block.timestamp);
    }
    
    /**
     * @dev Send payments to multiple addresses (equal amounts)
     */
    function batchPayment(
        address[] memory recipients,
        string memory memo
    ) external payable whenNotPaused nonReentrant {
        require(recipients.length > 0, "No recipients provided");
        require(msg.value > 0, "Payment must be greater than 0");
        
        uint256 amountPerRecipient = msg.value / recipients.length;
        require(amountPerRecipient > 0, "Amount per recipient too small");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amountPerRecipient}("");
            require(success, "Transfer failed");
        }
        
        payments.push(Payment({
            payer: msg.sender,
            amount: msg.value,
            memo: memo,
            timestamp: block.timestamp
        }));
        
        userPayments[msg.sender].push(payments.length - 1);
        totalReceived += msg.value;
        paymentCount++;
        
        emit BatchPaymentSent(msg.sender, msg.value, recipients.length);
        emit Paid(msg.sender, msg.value, memo, block.timestamp);
    }
    
    /**
     * @dev Create a payment request
     */
    function createPaymentRequest(
        address recipient,
        uint256 amount,
        string memory description
    ) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            amount,
            description,
            block.timestamp
        ));
        
        paymentRequests[requestId] = PaymentRequest({
            creator: msg.sender,
            recipient: recipient,
            amount: amount,
            description: description,
            fulfilled: false,
            createdAt: block.timestamp
        });
        
        emit PaymentRequestCreated(requestId, msg.sender, amount);
        return requestId;
    }
    
    /**
     * @dev Fulfill a payment request
     */
    function fulfillPaymentRequest(bytes32 requestId) external payable whenNotPaused nonReentrant {
        PaymentRequest storage request = paymentRequests[requestId];
        require(!request.fulfilled, "Request already fulfilled");
        require(msg.value >= request.amount, "Insufficient payment");
        
        request.fulfilled = true;
        
        // Transfer to recipient
        (bool success, ) = request.recipient.call{value: request.amount}("");
        require(success, "Transfer failed");
        
        // Record payment
        payments.push(Payment({
            payer: msg.sender,
            amount: msg.value,
            memo: request.description,
            timestamp: block.timestamp
        }));
        
        userPayments[msg.sender].push(payments.length - 1);
        totalReceived += msg.value;
        paymentCount++;
        
        // Refund excess
        if (msg.value > request.amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - request.amount}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit PaymentRequestFulfilled(requestId, msg.sender);
        emit Paid(msg.sender, msg.value, request.description, block.timestamp);
    }
    
    /**
     * @dev Get user's payment history
     */
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }
    
    /**
     * @dev Get payment details
     */
    function getPayment(uint256 index) external view returns (
        address payer,
        uint256 amount,
        string memory memo,
        uint256 timestamp
    ) {
        require(index < payments.length, "Payment does not exist");
        Payment memory p = payments[index];
        return (p.payer, p.amount, p.memo, p.timestamp);
    }
    
    /**
     * @dev Get total number of payments
     */
    function getPaymentCount() external view returns (uint256) {
        return payments.length;
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (
        uint256 _balance,
        uint256 _totalReceived,
        uint256 _totalWithdrawn,
        uint256 _paymentCount,
        bool _paused
    ) {
        return (
            address(this).balance,
            totalReceived,
            totalWithdrawn,
            paymentCount,
            paused()
        );
    }
    
    /**
     * @dev Withdraw funds
     */
    function withdraw(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        totalWithdrawn += amount;
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(to, amount);
    }
    
    /**
     * @dev Withdraw all funds
     */
    function withdrawAll() external onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        totalWithdrawn += amount;
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(owner(), amount);
    }
    
    /**
     * @dev Get contract balance
     */
    function balance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    receive() external payable {
        totalReceived += msg.value;
    }
}
