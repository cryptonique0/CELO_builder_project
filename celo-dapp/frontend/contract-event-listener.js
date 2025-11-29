// Contract Event Listener
// Listens for Paid events and updates UI in real-time

class ContractEventListener {
  constructor() {
    this.contract = null;
    this.events = [];
    this.maxEvents = 20;
  }

  init(contract) {
    this.contract = contract;
    this.events = [];
    this.listen();
  }

  listen() {
    if (!this.contract) return;
    this.contract.on('Paid', (payer, amount, memo, event) => {
      this.events.unshift({
        payer,
        amount: ethers.utils.formatEther(amount),
        memo,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: Date.now()
      });
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(0, this.maxEvents);
      }
      window.dispatchEvent(new CustomEvent('contractPaidEvent', { detail: this.events[0] }));
    });
  }

  getRecent() {
    return this.events;
  }
}

const contractEventListener = new ContractEventListener();
