/**
 * Safe storage utility that handles contexts where localStorage is not available
 * (e.g., service workers, sandboxed iframes, certain privacy modes)
 */

const isStorageAvailable = (): boolean => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

// In-memory fallback storage
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            if (isStorageAvailable()) {
                return localStorage.getItem(key);
            }
            return memoryStorage[key] || null;
        } catch (e) {
            console.warn('Storage access failed, using memory fallback:', e);
            return memoryStorage[key] || null;
        }
    },

    setItem: (key: string, value: string): void => {
        try {
            if (isStorageAvailable()) {
                localStorage.setItem(key, value);
            } else {
                memoryStorage[key] = value;
            }
        } catch (e) {
            console.warn('Storage access failed, using memory fallback:', e);
            memoryStorage[key] = value;
        }
    },

    removeItem: (key: string): void => {
        try {
            if (isStorageAvailable()) {
                localStorage.removeItem(key);
            }
            delete memoryStorage[key];
        } catch (e) {
            console.warn('Storage access failed, using memory fallback:', e);
            delete memoryStorage[key];
        }
    },

    clear: (): void => {
        try {
            if (isStorageAvailable()) {
                localStorage.clear();
            }
            Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        } catch (e) {
            console.warn('Storage access failed:', e);
            Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
        }
    }
};

export default safeStorage;
