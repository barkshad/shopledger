
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

// Singleton initialization pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };

const COLLECTIONS = {
  SALES: 'sales',
  EXPENSES: 'expenses',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SETTINGS: 'settings'
};

const mapDoc = <T,>(doc: QueryDocumentSnapshot<DocumentData>): T => ({
  ...(doc.data() as T),
  id: doc.id,
});

// Helper to get user-specific subcollection
const getUserCol = (userId: string, colName: string) => collection(db, 'users', userId, colName);

// Settings Operations
export const getSettings = async (userId: string): Promise<AdminSettings | null> => {
  try {
    const docRef = doc(db, 'users', userId, COLLECTIONS.SETTINGS, 'app_config');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as AdminSettings) : null;
  } catch (e) {
    console.error("Firestore getSettings failed:", e);
    return null;
  }
};

export const updateSettings = async (userId: string, settings: AdminSettings): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, COLLECTIONS.SETTINGS, 'app_config');
    return setDoc(docRef, settings, { merge: true });
  } catch (e) {
    console.error("Firestore updateSettings failed:", e);
    throw e;
  }
};

// Sales Operations
export const addSale = async (userId: string, sale: Omit<Sale, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(getUserCol(userId, COLLECTIONS.SALES), sale);
    return docRef.id;
  } catch (e) {
    console.error("Firestore addSale failed:", e);
    throw e;
  }
};

export const getAllSales = async (userId: string): Promise<Sale[]> => {
  try {
    const q = query(getUserCol(userId, COLLECTIONS.SALES), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDoc<Sale>(doc));
  } catch (e) {
    console.error("Firestore getAllSales failed:", e);
    return [];
  }
};

export const updateSale = async (userId: string, sale: Sale): Promise<void> => {
  try {
    if (!sale.id) return;
    const { id, ...data } = sale;
    return updateDoc(doc(db, 'users', userId, COLLECTIONS.SALES, id), data as any);
  } catch (e) {
    console.error("Firestore updateSale failed:", e);
    throw e;
  }
};

export const deleteSale = async (userId: string, id: string): Promise<void> => {
  try {
    return deleteDoc(doc(db, 'users', userId, COLLECTIONS.SALES, id));
  } catch (e) {
    console.error("Firestore deleteSale failed:", e);
    throw e;
  }
};

export const clearSales = async (userId: string): Promise<void> => {
  try {
    const q = await getDocs(getUserCol(userId, COLLECTIONS.SALES));
    const batch = writeBatch(db);
    q.forEach(d => batch.delete(d.ref));
    return batch.commit();
  } catch (e) {
    console.error("Firestore clearSales failed:", e);
    throw e;
  }
};

// Expense Operations
export const addExpense = async (userId: string, expense: Omit<Expense, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(getUserCol(userId, COLLECTIONS.EXPENSES), expense);
    return docRef.id;
  } catch (e) {
    console.error("Firestore addExpense failed:", e);
    throw e;
  }
};

export const getAllExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const q = query(getUserCol(userId, COLLECTIONS.EXPENSES), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => mapDoc<Expense>(doc));
  } catch (e) {
    console.error("Firestore getAllExpenses failed:", e);
    return [];
  }
};

export const updateExpense = async (userId: string, expense: Expense): Promise<void> => {
  try {
    if (!expense.id) return;
    const { id, ...data } = expense;
    return updateDoc(doc(db, 'users', userId, COLLECTIONS.EXPENSES, id), data as any);
  } catch (e) {
    console.error("Firestore updateExpense failed:", e);
    throw e;
  }
};

export const deleteExpense = async (userId: string, id: string): Promise<void> => {
  try {
    return deleteDoc(doc(db, 'users', userId, COLLECTIONS.EXPENSES, id));
  } catch (e) {
    console.error("Firestore deleteExpense failed:", e);
    throw e;
  }
};

export const clearExpenses = async (userId: string): Promise<void> => {
  try {
    const q = await getDocs(getUserCol(userId, COLLECTIONS.EXPENSES));
    const batch = writeBatch(db);
    q.forEach(d => batch.delete(d.ref));
    return batch.commit();
  } catch (e) {
    console.error("Firestore clearExpenses failed:", e);
    throw e;
  }
};

// Product Operations
export const getAllProducts = async (userId: string): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(getUserCol(userId, COLLECTIONS.PRODUCTS));
    return querySnapshot.docs.map(doc => mapDoc<Product>(doc));
  } catch (e) {
    console.error("Firestore getAllProducts failed:", e);
    return [];
  }
};

export const addProduct = async (userId: string, product: Omit<Product, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(getUserCol(userId, COLLECTIONS.PRODUCTS), product);
    return docRef.id;
  } catch (e) {
    console.error("Firestore addProduct failed:", e);
    throw e;
  }
};

export const updateProduct = async (userId: string, product: Product): Promise<void> => {
  try {
    if (!product.id) return;
    const { id, ...data } = product;
    return updateDoc(doc(db, 'users', userId, COLLECTIONS.PRODUCTS, id), data as any);
  } catch (e) {
    console.error("Firestore updateProduct failed:", e);
    throw e;
  }
};

export const deleteProduct = async (userId: string, id: string): Promise<void> => {
  try {
    return deleteDoc(doc(db, 'users', userId, COLLECTIONS.PRODUCTS, id));
  } catch (e) {
    console.error("Firestore deleteProduct failed:", e);
    throw e;
  }
};

// Customer Operations
export const getAllCustomers = async (userId: string): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(getUserCol(userId, COLLECTIONS.CUSTOMERS));
    return querySnapshot.docs.map(doc => mapDoc<Customer>(doc));
  } catch (e) {
    console.error("Firestore getAllCustomers failed:", e);
    return [];
  }
};

export const addCustomer = async (userId: string, customer: Omit<Customer, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(getUserCol(userId, COLLECTIONS.CUSTOMERS), customer);
    return docRef.id;
  } catch (e) {
    console.error("Firestore addCustomer failed:", e);
    throw e;
  }
};

export const updateCustomer = async (userId: string, customer: Customer): Promise<void> => {
  try {
    if (!customer.id) return;
    const { id, ...data } = customer;
    return updateDoc(doc(db, 'users', userId, COLLECTIONS.CUSTOMERS, id), data as any);
  } catch (e) {
    console.error("Firestore updateCustomer failed:", e);
    throw e;
  }
};

export const deleteCustomer = async (userId: string, id: string): Promise<void> => {
  try {
    return deleteDoc(doc(db, 'users', userId, COLLECTIONS.CUSTOMERS, id));
  } catch (e) {
    console.error("Firestore deleteCustomer failed:", e);
    throw e;
  }
};
