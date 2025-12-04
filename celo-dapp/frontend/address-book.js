// Address Book Module
// Stores addresses with labels in localStorage

class AddressBook {
  constructor() {
    this.storageKey = 'celo_address_book';
    this.entries = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
  }

  add(address, label) {
    address = address.trim();
    label = label.trim();
    if (!address) return false;
    if (this.entries.find(e => e.address.toLowerCase() === address.toLowerCase())) return false;
    this.entries.push({ address, label });
    this.save();
    return true;
  }

  remove(address) {
    this.entries = this.entries.filter(e => e.address.toLowerCase() !== address.toLowerCase());
    this.save();
  }

  getAll() {
    return this.entries;
  }

  getLabel(address) {
    const entry = this.entries.find(e => e.address.toLowerCase() === address.toLowerCase());
    return entry ? entry.label : '';
  }

  // Search addresses by label or partial address
  search(query) {
    const q = query.toLowerCase();
    return this.entries.filter(e => 
      e.label.toLowerCase().includes(q) || 
      e.address.toLowerCase().includes(q)
    );
  }

  // Export as JSON for backup
  export() {
    return JSON.stringify(this.entries, null, 2);
  }

  // Import from JSON
  import(jsonData) {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed)) {
        this.entries = parsed;
        this.save();
        return true;
      }
    } catch {
      return false;
    }
  }

  // Get recently used addresses
  getRecent(count = 5) {
    return this.entries.slice(0, count);
  }
}

// Export singleton
const addressBook = new AddressBook();
