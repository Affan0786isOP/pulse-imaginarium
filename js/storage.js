/**
 * PULSE - Secure Storage Wrapper
 * Provides safe try-catch wrapper around localStorage with memory fallback
 * for sandboxed environments where storage access may be restricted.
 */
window.PULSE = window.PULSE || {};

const memoryStorage = {};

const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Storage access restricted, using memory fallback.', e);
      return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage access restricted, using memory fallback.', e);
      memoryStorage[key] = String(value);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage access restricted, using memory fallback.', e);
      delete memoryStorage[key];
    }
  },
  key(index) {
    try {
      return localStorage.key(index);
    } catch (e) {
      return Object.keys(memoryStorage)[index] || null;
    }
  },
  get length() {
    try {
      return localStorage.length;
    } catch (e) {
      return Object.keys(memoryStorage).length;
    }
  }
};

window.PULSE.storage = safeStorage;
