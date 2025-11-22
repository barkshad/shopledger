
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Sale, Expense, Product, Customer } from '../types';

const DB_NAME = 'ShopLedgerDB';
const DB_VERSION = 4;
const SALES_STORE_NAME = 'sales';
const EXPENSES_STORE_NAME = 'expenses';
const PRODUCTS_STORE_NAME = 'products';
const CUSTOMERS_STORE_NAME = 'customers';


interface ShopLedgerDB extends DBSchema {
  sales: {
    key: number;
    value: Sale;
    indexes: { 'date': string; 'itemName': string; 'paymentMethod': string; 'transactionId': string };
  };
  expenses: {
    key: number;
    value: Expense;
    indexes: { 'date': string; 'category': string };
  };
  products: {
    key: number;
    value: Product;
    indexes: { 'name': string; 'barcode': string };
  };
  customers: {
    key: number;
    value: Customer;
    indexes: { 'name': string; 'phone': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ShopLedgerDB>> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<ShopLedgerDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
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
        if (oldVersion < 3) {
            const store = transaction.objectStore(SALES_STORE_NAME);
            store.createIndex('paymentMethod', 'paymentMethod');
        }
        if (oldVersion < 4) {
            const salesStore = transaction.objectStore(SALES_STORE_NAME);
            salesStore.createIndex('transactionId', 'transactionId');

            const productStore = db.createObjectStore(PRODUCTS_STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true,
            });
            productStore.createIndex('name', 'name');
            productStore.createIndex('barcode', 'barcode', { unique: true });

            const customerStore = db.createObjectStore(CUSTOMERS_STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true,
            });
            customerStore.createIndex('name', 'name');
            customerStore.createIndex('phone', 'phone', { unique: true });
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

// Product Functions
export const getAllProducts = async (): Promise<Product[]> => {
  const db = await getDb();
  return db.getAll(PRODUCTS_STORE_NAME);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<number> => {
  const db = await getDb();
  return db.add(PRODUCTS_STORE_NAME, product as Product);
};

export const updateProduct = async (product: Product): Promise<number> => {
  const db = await getDb();
  return db.put(PRODUCTS_STORE_NAME, product);
};

export const deleteProduct = async (id: number): Promise<void> => {
  const db = await getDb();
  return db.delete(PRODUCTS_STORE_NAME, id);
};

// Customer Functions
export const getAllCustomers = async (): Promise<Customer[]> => {
  const db = await getDb();
  return db.getAll(CUSTOMERS_STORE_NAME);
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<number> => {
  const db = await getDb();
  return db.add(CUSTOMERS_STORE_NAME, customer as Customer);
};

export const updateCustomer = async (customer: Customer): Promise<number> => {
  const db = await getDb();
  return db.put(CUSTOMERS_STORE_NAME, customer);
};

export const deleteCustomer = async (id: number): Promise<void> => {
  const db = await getDb();
  return db.delete(CUSTOMERS_STORE_NAME, id);
};
