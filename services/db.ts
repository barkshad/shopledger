
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  writeBatch,
  getDoc,
  setDoc,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Sale, Expense, Product, Customer, AdminSettings } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyA6Q7AJYVqBw7LPA9ahAs4CVxEG4QrOgnY",
  authDomain: "shopledger-ebbce.firebaseapp.com",
  projectId: "shopledger-ebbce",
  storageBucket: "shopledger-ebbce.firebasestorage.app",
  messagingSenderId: "98699073404",
  appId: "1:98699073404:web:d5d9afbcb1dc43bab276f9",
  measurementId: "G-B7S1JG176R"
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { auth };

const SALES_COLLECTION = 'sales';
const EXPENSES_COLLECTION = 'expenses';
const PRODUCTS_COLLECTION = 'products';
const CUSTOMERS_COLLECTION = 'customers';
const SETTINGS_COLLECTION = 'settings';
const GLOBAL_SETTINGS_ID = 'app_config';

const mapDoc = <T,>(doc: QueryDocumentSnapshot<DocumentData>): T => ({
  ...(doc.data() as T),
  id: doc.id,
});

// Settings Functions
export const getSettings = async (): Promise<AdminSettings | null> => {
  const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as AdminSettings;
  }
  return null;
};

export const updateSettings = async (settings: AdminSettings): Promise<void> => {
  const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
  return setDoc(docRef, settings, { merge: true });
};

// Sales Functions
export const addSale = async (sale: Omit<Sale, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, SALES_COLLECTION), sale);
  return docRef.id;
};

export const getAllSales = async (): Promise<Sale[]> => {
  const q = query(collection(db, SALES_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDoc<Sale>(doc));
};

export const updateSale = async (sale: Sale): Promise<void> => {
  if (!sale.id) return;
  const { id, ...data } = sale;
  const docRef = doc(db, SALES_COLLECTION, id);
  return updateDoc(docRef, data as any);
};

export const deleteSale = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, SALES_COLLECTION, id));
};

export const clearSales = async (): Promise<void> => {
    const q = await getDocs(collection(db, SALES_COLLECTION));
    const batch = writeBatch(db);
    q.forEach(d => batch.delete(d.ref));
    return batch.commit();
}

// Expenses Functions
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expense);
  return docRef.id;
};

export const getAllExpenses = async (): Promise<Expense[]> => {
  const q = query(collection(db, EXPENSES_COLLECTION), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDoc<Expense>(doc));
};

export const updateExpense = async (expense: Expense): Promise<void> => {
  if (!expense.id) return;
  const { id, ...data } = expense;
  return updateDoc(doc(db, EXPENSES_COLLECTION, id), data as any);
};

export const deleteExpense = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, EXPENSES_COLLECTION, id));
};

export const clearExpenses = async (): Promise<void> => {
    const q = await getDocs(collection(db, EXPENSES_COLLECTION));
    const batch = writeBatch(db);
    q.forEach(d => batch.delete(d.ref));
    return batch.commit();
}

// Product Functions
export const getAllProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return querySnapshot.docs.map(doc => mapDoc<Product>(doc));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
  return docRef.id;
};

export const updateProduct = async (product: Product): Promise<void> => {
  if (!product.id) return;
  const { id, ...data } = product;
  return updateDoc(doc(db, PRODUCTS_COLLECTION, id), data as any);
};

export const deleteProduct = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

// Customer Functions
export const getAllCustomers = async (): Promise<Customer[]> => {
  const querySnapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
  return querySnapshot.docs.map(doc => mapDoc<Customer>(doc));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), customer);
  return docRef.id;
};

export const updateCustomer = async (customer: Customer): Promise<void> => {
  if (!customer.id) return;
  const { id, ...data } = customer;
  return updateDoc(doc(db, CUSTOMERS_COLLECTION, id), data as any);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, CUSTOMERS_COLLECTION, id));
};
