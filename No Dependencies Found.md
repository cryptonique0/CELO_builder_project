// Set fee to 2% (200 basis points)
contract.setFeePercentage(200)

// Check collected fees
contract.getCollectedFees()

// Withdraw fees
contract.withdrawFees(ownerAddress, feeAmount)