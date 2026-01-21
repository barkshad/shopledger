
import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';
import * as db from '../services/db';
import { useAuth } from './useAuth';

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshExpenses = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allExpenses = await db.getAllExpenses(user.uid);
      setExpenses(allExpenses);
      setError(null);
    } catch (e) {
      setError('Failed to fetch expenses data.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshExpenses();
    }
  }, [refreshExpenses, user]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    await db.addExpense(user.uid, expense);
    await refreshExpenses();
  };

  const updateExpense = async (expense: Expense) => {
    if (!user) return;
    await db.updateExpense(user.uid, expense);
    await refreshExpenses();
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    await db.deleteExpense(user.uid, id);
    await refreshExpenses();
  };
  
  const clearAllExpenses = async () => {
    if (!user) return;
    await db.clearExpenses(user.uid);
    await refreshExpenses();
  }

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, clearAllExpenses, refreshExpenses };
};
