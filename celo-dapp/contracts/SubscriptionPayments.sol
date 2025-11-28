// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SubscriptionPayments
 * @dev Recurring payment and subscription management system
 */
contract SubscriptionPayments is Pausable, Ownable, ReentrancyGuard {
    
    struct Subscription {
        address subscriber;
        address recipient;
        uint256 amount;
        uint256 interval; // in seconds
        uint256 lastPayment;
        uint256 nextPayment;
        bool active;
        string description;
    }
    
    struct SubscriptionPlan {
        address creator;
        uint256 price;
        uint256 interval;
        string name;
        string description;
        bool active;
        uint256 subscriberCount;
    }
    
    // State
    mapping(bytes32 => Subscription) public subscriptions;
    mapping(address => bytes32[]) public userSubscriptions;
    mapping(bytes32 => SubscriptionPlan) public plans;
    bytes32[] public allPlans;
    
    uint256 public totalSubscriptions;
    uint256 public activeSubscriptions;
    
    // Events
    event SubscriptionCreated(bytes32 indexed subscriptionId, address indexed subscriber, address indexed recipient);
    event SubscriptionPaymentProcessed(bytes32 indexed subscriptionId, uint256 amount, uint256 timestamp);
    event SubscriptionCancelled(bytes32 indexed subscriptionId);
    event PlanCreated(bytes32 indexed planId, string name, uint256 price);
    event PlanSubscribed(bytes32 indexed planId, address indexed subscriber);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a subscription
     */
    function createSubscription(
        address recipient,
        uint256 amount,
        uint256 intervalDays,
        string memory description
    ) external payable whenNotPaused returns (bytes32) {
        require(amount > 0, "Amount must be greater than 0");
        require(intervalDays > 0, "Interval must be greater than 0");
        require(msg.value >= amount, "Insufficient initial payment");
        
        uint256 interval = intervalDays * 1 days;
        bytes32 subscriptionId = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            amount,
            interval,
            block.timestamp
        ));
        
        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            recipient: recipient,
            amount: amount,
            interval: interval,
            lastPayment: block.timestamp,
            nextPayment: block.timestamp + interval,
            active: true,
            description: description
        });
        
        userSubscriptions[msg.sender].push(subscriptionId);
        totalSubscriptions++;
        activeSubscriptions++;
        
        // Process first payment
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Payment failed");
        
        emit SubscriptionCreated(subscriptionId, msg.sender, recipient);
        emit SubscriptionPaymentProcessed(subscriptionId, amount, block.timestamp);
        
        return subscriptionId;
    }
    
    /**
     * @dev Process subscription payment (called by anyone, subscriber pays)
     */
    function processSubscriptionPayment(bytes32 subscriptionId) external payable nonReentrant {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.active, "Subscription not active");
        require(block.timestamp >= sub.nextPayment, "Payment not due yet");
        require(msg.value >= sub.amount, "Insufficient payment");
        
        sub.lastPayment = block.timestamp;
        sub.nextPayment = block.timestamp + sub.interval;
        
        (bool success, ) = sub.recipient.call{value: sub.amount}("");
        require(success, "Payment failed");
        
        // Refund excess
        if (msg.value > sub.amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - sub.amount}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit SubscriptionPaymentProcessed(subscriptionId, sub.amount, block.timestamp);
    }
    
    /**
     * @dev Cancel subscription
     */
    function cancelSubscription(bytes32 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(msg.sender == sub.subscriber || msg.sender == owner(), "Not authorized");
        require(sub.active, "Subscription not active");
        
        sub.active = false;
        activeSubscriptions--;
        
        emit SubscriptionCancelled(subscriptionId);
    }
    
    /**
     * @dev Create a subscription plan
     */
    function createPlan(
        uint256 price,
        uint256 intervalDays,
        string memory name,
        string memory description
    ) external returns (bytes32) {
        require(price > 0, "Price must be greater than 0");
        require(intervalDays > 0, "Interval must be greater than 0");
        
        bytes32 planId = keccak256(abi.encodePacked(
            msg.sender,
            price,
            intervalDays,
            name,
            block.timestamp
        ));
        
        plans[planId] = SubscriptionPlan({
            creator: msg.sender,
            price: price,
            interval: intervalDays * 1 days,
            name: name,
            description: description,
            active: true,
            subscriberCount: 0
        });
        
        allPlans.push(planId);
        
        emit PlanCreated(planId, name, price);
        return planId;
    }
    
    /**
     * @dev Subscribe to a plan
     */
    function subscribeToPlan(bytes32 planId) external payable whenNotPaused returns (bytes32) {
        SubscriptionPlan storage plan = plans[planId];
        require(plan.active, "Plan not active");
        require(msg.value >= plan.price, "Insufficient payment");
        
        bytes32 subscriptionId = keccak256(abi.encodePacked(
            msg.sender,
            plan.creator,
            planId,
            block.timestamp
        ));
        
        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            recipient: plan.creator,
            amount: plan.price,
            interval: plan.interval,
            lastPayment: block.timestamp,
            nextPayment: block.timestamp + plan.interval,
            active: true,
            description: plan.name
        });
        
        userSubscriptions[msg.sender].push(subscriptionId);
        plan.subscriberCount++;
        totalSubscriptions++;
        activeSubscriptions++;
        
        // Process first payment
        (bool success, ) = plan.creator.call{value: plan.price}("");
        require(success, "Payment failed");
        
        // Refund excess
        if (msg.value > plan.price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - plan.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit PlanSubscribed(planId, msg.sender);
        emit SubscriptionCreated(subscriptionId, msg.sender, plan.creator);
        emit SubscriptionPaymentProcessed(subscriptionId, plan.price, block.timestamp);
        
        return subscriptionId;
    }
    
    /**
     * @dev Get user subscriptions
     */
    function getUserSubscriptions(address user) external view returns (bytes32[] memory) {
        return userSubscriptions[user];
    }
    
    /**
     * @dev Get all plans
     */
    function getAllPlans() external view returns (bytes32[] memory) {
        return allPlans;
    }
    
    /**
     * @dev Check if subscription payment is due
     */
    function isPaymentDue(bytes32 subscriptionId) external view returns (bool) {
        Subscription memory sub = subscriptions[subscriptionId];
        return sub.active && block.timestamp >= sub.nextPayment;
    }
    
    /**
     * @dev Get subscription details
     */
    function getSubscription(bytes32 subscriptionId) external view returns (
        address subscriber,
        address recipient,
        uint256 amount,
        uint256 interval,
        uint256 lastPayment,
        uint256 nextPayment,
        bool active,
        string memory description
    ) {
        Subscription memory sub = subscriptions[subscriptionId];
        return (
            sub.subscriber,
            sub.recipient,
            sub.amount,
            sub.interval,
            sub.lastPayment,
            sub.nextPayment,
            sub.active,
            sub.description
        );
    }
    
    /**
     * @dev Get stats
     */
    function getStats() external view returns (
        uint256 _totalSubscriptions,
        uint256 _activeSubscriptions,
        uint256 _totalPlans
    ) {
        return (totalSubscriptions, activeSubscriptions, allPlans.length);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
