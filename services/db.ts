
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
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
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
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, db };

const COLLECTIONS = {
  SALES: 'sales',
  EXPENSES: 'expenses',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SETTINGS: 'settings'
};

const GLOBAL_SETTINGS_ID = 'app_config';

const mapDoc = <T,>(doc: QueryDocumentSnapshot<DocumentData>): T => ({
  ...(doc.data() as T),
  id: doc.id,
});

// Settings Operations
export const getSettings = async (): Promise<AdminSettings | null> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, GLOBAL_SETTINGS_ID);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as AdminSettings) : null;
};

export const updateSettings = async (settings: AdminSettings): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, GLOBAL_SETTINGS_ID);
  return setDoc(docRef, settings, { merge: true });
};

// Sales Operations
export const addSale = async (sale: Omit<Sale, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.SALES), sale);
  return docRef.id;
};

export const getAllSales = async (): Promise<Sale[]> => {
  const q = query(collection(db, COLLECTIONS.SALES), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDoc<Sale>(doc));
};

export const updateSale = async (sale: Sale): Promise<void> => {
  if (!sale.id) return;
  const { id, ...data } = sale;
  return updateDoc(doc(db, COLLECTIONS.SALES, id), data as any);
};

export const deleteSale = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, COLLECTIONS.SALES, id));
};

export const clearSales = async (): Promise<void> => {
  const q = await getDocs(collection(db, COLLECTIONS.SALES));
  const batch = writeBatch(db);
  q.forEach(d => batch.delete(d.ref));
  return batch.commit();
};

// Expense Operations
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), expense);
  return docRef.id;
};

export const getAllExpenses = async (): Promise<Expense[]> => {
  const q = query(collection(db, COLLECTIONS.EXPENSES), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDoc<Expense>(doc));
};

export const updateExpense = async (expense: Expense): Promise<void> => {
  if (!expense.id) return;
  const { id, ...data } = expense;
  return updateDoc(doc(db, COLLECTIONS.EXPENSES, id), data as any);
};

export const deleteExpense = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
};

export const clearExpenses = async (): Promise<void> => {
  const q = await getDocs(collection(db, COLLECTIONS.EXPENSES));
  const batch = writeBatch(db);
  q.forEach(d => batch.delete(d.ref));
  return batch.commit();
};

// Product Operations
export const getAllProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  return querySnapshot.docs.map(doc => mapDoc<Product>(doc));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), product);
  return docRef.id;
};

export const updateProduct = async (product: Product): Promise<void> => {
  if (!product.id) return;
  const { id, ...data } = product;
  return updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), data as any);
};

export const deleteProduct = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
};

// Customer Operations
export const getAllCustomers = async (): Promise<Customer[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
  return querySnapshot.docs.map(doc => mapDoc<Customer>(doc));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), customer);
  return docRef.id;
};

export const updateCustomer = async (customer: Customer): Promise<void> => {
  if (!customer.id) return;
  const { id, ...data } = customer;
  return updateDoc(doc(db, COLLECTIONS.CUSTOMERS, id), data as any);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, id));
};
