// Transaction Preview Decoder
// Decodes ABI for payWithMemo and displays human-readable summary

class TxPreviewDecoder {
  constructor() {
    this.payWithMemoSig = 'payWithMemo(string)';
    this.iface = new ethers.utils.Interface([
      'function payWithMemo(string memo)'
    ]);
  }

  decode(data) {
    try {
      const decoded = this.iface.parseTransaction({ data });
      return {
        method: decoded.name,
        args: decoded.args,
        summary: `Send payment with memo: "${decoded.args[0]}"`
      };
    } catch (e) {
      return { error: 'Unable to decode transaction' };
    }
  }
}

const txPreviewDecoder = new TxPreviewDecoder();
