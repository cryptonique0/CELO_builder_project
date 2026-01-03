const { expect } = require("chai");

describe("SimplePayments", function () {
  it("should set deployer as owner and accept payments", async function () {
    const [owner, payer] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SimplePayments");
    const contract = await Factory.connect(owner).deploy();
    await contract.deployed();

    // owner should be the deployer
    expect(await contract.owner()).to.equal(owner.address);

    // send 0.01 ether from payer
    const sendTx = await payer.sendTransaction({
      to: contract.address,
      value: ethers.utils.parseEther("0.01"),
    });
    await sendTx.wait();

    // balance should reflect the payment
    const bal = await contract.balance();
    const expectedBal = ethers.utils.parseEther("0.01");
    expect(bal.toString()).to.equal(expectedBal.toString());

    // owner withdraws 0.005 ether
    const withdrawTx = await contract.connect(owner).withdraw(owner.address, ethers.utils.parseEther("0.005"));
    await withdrawTx.wait();

    // remaining balance should be 0.005 ether
    const balAfter = await contract.balance();
    const expectedBalAfter = ethers.utils.parseEther("0.005");
    expect(balAfter.toString()).to.equal(expectedBalAfter.toString());
  });
});
