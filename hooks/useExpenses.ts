import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';
import * as db from '../services/db';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const allExpenses = await db.getAllExpenses();
      // Sort expenses by date descending
      allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(allExpenses);
      setError(null);
    } catch (e) {
      setError('Failed to fetch expenses data.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    await db.addExpense(expense);
    await refreshExpenses();
  };

  const updateExpense = async (expense: Expense) => {
    await db.updateExpense(expense);
    await refreshExpenses();
  };

  const deleteExpense = async (id: number) => {
    await db.deleteExpense(id);
    await refreshExpenses();
  };
  
  const clearAllExpenses = async () => {
    await db.clearExpenses();
    await refreshExpenses();
  }

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, clearAllExpenses, refreshExpenses };
};
