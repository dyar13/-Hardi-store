import { AppData, Sale, Purchase, Debt, DebtPayment } from '../types';
import { INITIAL_DATA } from '../constants';

const DB_NAME = 'HardiStoreDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_data_store';
const DATA_KEY = 'main_data';
const OLD_LOCAL_STORAGE_KEY = 'hardi_store_db_v3';

// ✅ VERIFICATION LOG
console.log("DB FILE VERSION: 2026-01-12");

// -----------------------------------------------------------------------------
// ARCHITECTURE: Memory-First + Robust Open/Close Persistence
// -----------------------------------------------------------------------------

let memoryCache: AppData | null = null;
let isInitialized = false;
let saveQueue: Promise<any> = Promise.resolve();

// --- Robust DB Helper (User Provided Fix) ---
// This opens and closes the DB for EVERY operation to ensure no locks remain.
const performDBOperation = <T>(
  mode: IDBTransactionMode,
  task: (store: IDBObjectStore) => IDBRequest | void
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open(DB_NAME, DB_VERSION);

    openReq.onerror = () => reject(openReq.error);

    openReq.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    openReq.onsuccess = () => {
      const db = openReq.result;
      let result: any;

      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);

      // ✅ ONLY resolve after commit
      tx.oncomplete = () => {
        db.close(); // Close immediately to release lock
        resolve(result as T);
      };

      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };

      tx.onabort = () => {
        db.close();
        reject(new Error("Transaction aborted"));
      };

      try {
        const req = task(store);

        if (req) {
          req.onsuccess = () => {
            result = req.result; 
            // ❌ do NOT resolve here
          };
          // If req fails, tx.onerror will catch it usually, but we can bind explicit error too
          req.onerror = () => {
             // tx.onerror handles the close/reject
          };
        } else {
          result = undefined;
        }
      } catch (err) {
        db.close();
        reject(err);
      }
    };
  });
};

// --- Background Saving ---

const scheduleSave = () => {
  if (!memoryCache) return;
  
  // Snapshot data to avoid race conditions during async write
  // Using JSON.parse/stringify is safer for basic objects than structuredClone in older environments
  const snapshot = JSON.parse(JSON.stringify(memoryCache));

  // Add to queue: Wait for previous save, then execute new save
  saveQueue = saveQueue
    .then(() => performDBOperation('readwrite', (store) => store.put(snapshot, DATA_KEY)))
    .catch((err) => console.error("Background Save Error:", err));
};

// --- Initialization ---

const initDB = async (): Promise<AppData> => {
  if (isInitialized && memoryCache) return memoryCache;

  try {
    // 1. Read from DB using robust helper
    let data = await performDBOperation<AppData>('readonly', (store) => store.get(DATA_KEY));

    // 2. Migration Check
    if (!data) {
      const legacyData = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
      if (legacyData) {
        try {
          data = JSON.parse(legacyData);
        } catch (e) { console.error("Migration failed", e); }
      }
    }

    // 3. Defaults
    if (!data) {
      data = JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    // 4. Normalize
    if (data) {
      if (!data.sales) data.sales = [];
      if (!data.purchases) data.purchases = [];
      if (!data.debts) data.debts = [];
      
      data.sales = data.sales.map((s: any) => ({ ...s, store: s.store || 'clothes' }));
      data.purchases = data.purchases.map((p: any) => ({ ...p, store: p.store || 'clothes' }));
      data.debts = data.debts.map((d: any) => ({ ...d, store: d.store || 'clothes' }));
    }

    memoryCache = data as AppData;
    isInitialized = true;
    
    // Initial sync to ensure DB structure exists
    scheduleSave();

  } catch (error) {
    console.error('Critical Init Error', error);
    memoryCache = JSON.parse(JSON.stringify(INITIAL_DATA));
    isInitialized = true;
  }
  
  return memoryCache as AppData;
};

// --- UUID Helpers ---

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateId = (prefix: string): string => {
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${dateStr}-${random}`;
};

// --- Public API ---

export const getAppData = async (): Promise<AppData> => {
  return await initDB();
};

export const addSale = async (sale: Omit<Sale, 'id' | 'code' | 'timestamp'>): Promise<Sale> => {
  await initDB();
  if (!memoryCache) throw new Error("Database not initialized");

  const newSale: Sale = {
    ...sale,
    id: generateUUID(),
    code: generateId('SL'),
    timestamp: Date.now(),
  };
  
  memoryCache.sales.unshift(newSale);
  scheduleSave();
  return newSale;
};

export const addPurchase = async (purchase: Omit<Purchase, 'id' | 'timestamp'>): Promise<Purchase> => {
  await initDB();
  if (!memoryCache) throw new Error("Database not initialized");

  const newPurchase: Purchase = {
    ...purchase,
    id: generateUUID(),
    timestamp: Date.now(),
  };
  
  memoryCache.purchases.unshift(newPurchase);
  scheduleSave();
  return newPurchase;
};

export const addDebt = async (debt: Omit<Debt, 'id' | 'code' | 'timestamp' | 'status' | 'payments'>): Promise<Debt> => {
  await initDB();
  if (!memoryCache) throw new Error("Database not initialized");

  const newDebt: Debt = {
    ...debt,
    id: generateUUID(),
    code: generateId('DB'),
    timestamp: Date.now(),
    status: 'unpaid',
    payments: [],
  };
  
  memoryCache.debts.unshift(newDebt);
  scheduleSave();
  return newDebt;
};

export const addDebtPayment = async (debtId: string, payment: Omit<DebtPayment, 'id'>): Promise<void> => {
  await initDB();
  if (!memoryCache) throw new Error("Database not initialized");

  const debtIndex = memoryCache.debts.findIndex((d) => d.id === debtId);
  if (debtIndex > -1) {
    const newPayment: DebtPayment = {
      ...payment,
      id: generateUUID(),
    };
    memoryCache.debts[debtIndex].payments.push(newPayment);

    // Update status
    const totalPaid = memoryCache.debts[debtIndex].payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDebt = memoryCache.debts[debtIndex].totalAmount;

    if (totalPaid >= totalDebt) {
      memoryCache.debts[debtIndex].status = 'paid';
    } else if (totalPaid > 0) {
      memoryCache.debts[debtIndex].status = 'partial';
    } else {
      memoryCache.debts[debtIndex].status = 'unpaid';
    }

    scheduleSave();
  }
};

export const deleteSale = async (id: string): Promise<void> => {
  await initDB();
  if (!memoryCache) return;
  
  memoryCache.sales = memoryCache.sales.filter((s) => s.id !== id);
  scheduleSave();
};

export const deletePurchase = async (id: string): Promise<void> => {
  await initDB();
  if (!memoryCache) return;

  memoryCache.purchases = memoryCache.purchases.filter((p) => p.id !== id);
  scheduleSave();
};

export const deleteDebt = async (id: string): Promise<void> => {
  await initDB();
  if (!memoryCache) return;

  memoryCache.debts = memoryCache.debts.filter((d) => d.id !== id);
  scheduleSave();
};

// --- Import/Export ---

export const exportToJSON = async (): Promise<void> => {
  await initDB();
  const blob = new Blob([JSON.stringify(memoryCache, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `HardiStore_DB_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFromJSON = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.sales && Array.isArray(json.sales)) {
          memoryCache = json;
          isInitialized = true;
          scheduleSave();
          resolve(true);
        } else {
          reject(new Error('Invalid structure'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

export const clearAllData = async (): Promise<void> => {
  memoryCache = JSON.parse(JSON.stringify(INITIAL_DATA));
  isInitialized = true;
  localStorage.removeItem(OLD_LOCAL_STORAGE_KEY);
  
  // Force a clear on the DB via queue
  saveQueue = saveQueue
    .then(() => performDBOperation('readwrite', (store) => store.clear()))
    .then(() => performDBOperation('readwrite', (store) => store.put(memoryCache, DATA_KEY)))
    .catch(err => console.error("Clear failed", err));
};
