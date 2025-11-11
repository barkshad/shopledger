
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Sale } from '../types';

const DB_NAME = 'ShopLedgerDB';
const DB_VERSION = 1;
const STORE_NAME = 'sales';

interface ShopLedgerDB extends DBSchema {
  sales: {
    key: number;
    value: Sale;
    indexes: { 'date': string; 'itemName': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ShopLedgerDB>> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<ShopLedgerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('date', 'date');
        store.createIndex('itemName', 'itemName');
      },
    });
  }
  return dbPromise;
};

export const addSale = async (sale: Omit<Sale, 'id'>): Promise<number> => {
  const db = await getDb();
  return db.add(STORE_NAME, sale as Sale);
};

export const getAllSales = async (): Promise<Sale[]> => {
  const db = await getDb();
  return db.getAll(STORE_NAME);
};

export const updateSale = async (sale: Sale): Promise<number> => {
  const db = await getDb();
  return db.put(STORE_NAME, sale);
};

export const deleteSale = async (id: number): Promise<void> => {
  const db = await getDb();
  return db.delete(STORE_NAME, id);
};

export const clearSales = async (): Promise<void> => {
    const db = await getDb();
    return db.clear(STORE_NAME);
}
