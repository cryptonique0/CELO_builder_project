/**
 * Toast Notification System
 * Beautiful, animated toast notifications for all app events
 */

class ToastNotification {
  constructor() {
    this.container = null;
    this.maxToasts = 6;
    this.init();
  }

  // Initialize toast container
  init() {
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
      this.injectStyles();
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  // Inject CSS styles
  injectStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      }

      .toast {
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        position: relative;
        overflow: hidden;
        min-width: 320px;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      .toast.hiding {
        animation: slideOut 0.3s ease-in;
      }

      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
        line-height: 1;
      }

      .toast-content {
        flex: 1;
      }

      .toast-title {
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 4px;
        color: #1a1a1a;
      }

      .toast-message {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #333;
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        animation: progress linear;
      }

      @keyframes progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      /* Type variants */
      .toast.success {
        border-left: 4px solid #4CAF50;
      }

      .toast.error {
        border-left: 4px solid #F44336;
      }

      .toast.warning {
        border-left: 4px solid #FF9800;
      }

      .toast.info {
        border-left: 4px solid #2196F3;
      }

      .toast.loading {
        border-left: 4px solid #9C27B0;
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .toast-container {
          left: 10px;
          right: 10px;
          top: 10px;
        }

        .toast {
          min-width: unset;
          width: 100%;
        }
      }

      /* Action button */
      .toast-action {
        margin-top: 8px;
      }

      .toast-action button {
        background: #667eea;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
      }

      .toast-action button:hover {
        background: #5568d3;
      }

      /* Link style */
      .toast-link {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
      }

      .toast-link:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  // Show toast notification
  show(options) {
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      action,
      link,
      icon,
      dismissible = true
    } = options;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon
    const iconEl = document.createElement('div');
    iconEl.className = 'toast-icon';
    iconEl.textContent = icon || this.getDefaultIcon(type);
    toast.appendChild(iconEl);

    // Content
    const content = document.createElement('div');
    content.className = 'toast-content';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'toast-title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }

    if (message) {
      const messageEl = document.createElement('div');
      messageEl.className = 'toast-message';
      messageEl.innerHTML = message;
      content.appendChild(messageEl);
    }

    // Action button
    if (action) {
      const actionEl = document.createElement('div');
      actionEl.className = 'toast-action';
      const button = document.createElement('button');
      button.textContent = action.label;
      button.onclick = () => {
        action.onClick();
        this.dismiss(toast);
      };
      actionEl.appendChild(button);
      content.appendChild(actionEl);
    }

    // Link
    if (link) {
      const linkEl = document.createElement('a');
      linkEl.className = 'toast-link';
      linkEl.href = link.url;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      linkEl.innerHTML = `${link.label} <span>→</span>`;
      content.appendChild(linkEl);
    }

    toast.appendChild(content);

    // Close button
    if (dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => this.dismiss(toast);
      toast.appendChild(closeBtn);
    }

    // Progress bar (if duration is set)
    if (duration > 0 && type !== 'loading') {
      const progress = document.createElement('div');
      progress.className = 'toast-progress';
      progress.style.animationDuration = `${duration}ms`;
      toast.appendChild(progress);
    }

    // Add to container
    // Enforce stacking limit
    if (this.container.children.length >= this.maxToasts) {
      // Remove oldest (first child)
      this.dismiss(this.container.firstChild);
    }

    this.container.appendChild(toast);

    // Auto dismiss
    if (duration > 0 && type !== 'loading') {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  // Dismiss toast
  dismiss(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // Get default icon for type
  getDefaultIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳'
    };
    return icons[type] || 'ℹ️';
  }

  // Convenience methods
  success(title, message, options = {}) {
    return this.show({ type: 'success', title, message, ...options });
  }

  error(title, message, options = {}) {
    return this.show({ type: 'error', title, message, ...options });
  }

  warning(title, message, options = {}) {
    return this.show({ type: 'warning', title, message, ...options });
  }

  info(title, message, options = {}) {
    return this.show({ type: 'info', title, message, ...options });
  }

  loading(title, message) {
    return this.show({
      type: 'loading',
      title,
      message,
      duration: 0,
      icon: '⏳',
      dismissible: false
    });
  }

  // Transaction-specific toasts
  transactionSent(txHash) {
    return this.show({
      type: 'loading',
      title: 'Transaction Sent',
      message: 'Waiting for confirmation...',
      duration: 0,
      icon: '🕒',
      link: { label: 'View on CeloScan', url: `https://celoscan.io/tx/${txHash}` },
      dismissible: true
    });
  }

  transactionConfirmed(txHash) {
    return this.show({
      type: 'success',
      title: 'Transaction Confirmed',
      message: 'Your transaction was successful',
      duration: 7000,
      icon: '✅',
      link: { label: 'View on CeloScan', url: `https://celoscan.io/tx/${txHash}` }
    });
  }

  transactionFailed(error) {
    return this.show({
      type: 'error',
      title: 'Transaction Failed',
      message: (error || 'Please try again'),
      duration: 10000,
      icon: '❌'
    });
  }

  walletConnected(address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return this.show({
      type: 'success',
      title: 'Wallet Connected',
      message: `Connected to ${shortAddress}`,
      duration: 3000,
      icon: '🔌'
    });
  }

  networkChanged(networkName) {
    return this.show({
      type: 'info',
      title: 'Network Changed',
      message: `Switched to ${networkName}`,
      duration: 3000,
      icon: '🌐'
    });
  }

  wrongNetwork(expectedNetwork) {
    return this.show({
      type: 'warning',
      title: 'Wrong Network',
      message: `Please switch to ${expectedNetwork}`,
      duration: 0,
      icon: '⚠️',
      action: { label: 'Switch Network', onClick: () => window.dispatchEvent(new CustomEvent('switchNetworkRequested')) }
    });
  }

  addedToken(symbol) {
    return this.show({
      type: 'success',
      title: 'Token Added',
      message: `Custom token ${symbol} added`,
      duration: 4000,
      icon: '🪙'
    });
  }

  gasSpeedChanged(speed) {
    return this.show({
      type: 'info',
      title: 'Gas Speed Updated',
      message: `Selected: ${speed.toUpperCase()}`,
      duration: 2000,
      icon: '⛽'
    });
  }

  copied(label) {
    return this.show({
      type: 'info',
      title: 'Copied',
      message: `${label} copied to clipboard`,
      duration: 1500,
      icon: '📋'
    });
  }

  dismissAll() {
    Array.from(this.container.children).forEach(t => this.dismiss(t));
  }
}

// Export singleton instance
const toast = new ToastNotification();
