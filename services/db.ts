
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Sale, Expense } from '../types';

const DB_NAME = 'ShopLedgerDB';
const DB_VERSION = 2;
const SALES_STORE_NAME = 'sales';
const EXPENSES_STORE_NAME = 'expenses';


interface ShopLedgerDB extends DBSchema {
  sales: {
    key: number;
    value: Sale;
    indexes: { 'date': string; 'itemName': string };
  };
  expenses: {
    key: number;
    value: Expense;
    indexes: { 'date': string; 'category': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ShopLedgerDB>> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<ShopLedgerDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
            const store = db.createObjectStore(SALES_STORE_NAME, {
              keyPath: 'id',
              autoIncrement: true,
            });
            store.createIndex('date', 'date');
            store.createIndex('itemName', 'itemName');
        }
        if (oldVersion < 2) {
            const store = db.createObjectStore(EXPENSES_STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true,
            });
            store.createIndex('date', 'date');
            store.createIndex('category', 'category');
        }
      },
    });
  }
  return dbPromise;
};

// Sales Functions
export const addSale = async (sale: Omit<Sale, 'id'>): Promise<number> => {
  const db = await getDb();
  return db.add(SALES_STORE_NAME, sale as Sale);
};

export const getAllSales = async (): Promise<Sale[]> => {
  const db = await getDb();
  return db.getAll(SALES_STORE_NAME);
};

export const updateSale = async (sale: Sale): Promise<number> => {
  const db = await getDb();
  return db.put(SALES_STORE_NAME, sale);
};

export const deleteSale = async (id: number): Promise<void> => {
  const db = await getDb();
  return db.delete(SALES_STORE_NAME, id);
};

export const clearSales = async (): Promise<void> => {
    const db = await getDb();
    return db.clear(SALES_STORE_NAME);
}

// Expenses Functions
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<number> => {
  const db = await getDb();
  return db.add(EXPENSES_STORE_NAME, expense as Expense);
};

export const getAllExpenses = async (): Promise<Expense[]> => {
  const db = await getDb();
  return db.getAll(EXPENSES_STORE_NAME);
};

export const updateExpense = async (expense: Expense): Promise<number> => {
  const db = await getDb();
  return db.put(EXPENSES_STORE_NAME, expense);
};

export const deleteExpense = async (id: number): Promise<void> => {
  const db = await getDb();
  return db.delete(EXPENSES_STORE_NAME, id);
};

export const clearExpenses = async (): Promise<void> => {
    const db = await getDb();
    return db.clear(EXPENSES_STORE_NAME);
}
