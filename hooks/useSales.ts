
import { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types';
import * as db from '../services/db';
import { useAuth } from './useAuth';

export const useSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSales = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allSales = await db.getAllSales(user.uid);
      setSales(allSales);
      setError(null);
    } catch (e) {
      setError('Failed to fetch sales data.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshSales();
    }
  }, [refreshSales, user]);

  const addSale = async (sale: Omit<Sale, 'id' | 'total'> & { price: number; quantity: number }) => {
    if (!user) return;
    const newSale: Omit<Sale, 'id'> = {
        ...sale,
        total: sale.price * sale.quantity,
    };
    await db.addSale(user.uid, newSale);
    await refreshSales();
  };

  const updateSale = async (sale: Sale) => {
    if (!user) return;
    await db.updateSale(user.uid, sale);
    await refreshSales();
  };

  const deleteSale = async (id: string) => {
    if (!user) return;
    await db.deleteSale(user.uid, id);
    await refreshSales();
  };
  
  const clearAllSales = async () => {
    if (!user) return;
    await db.clearSales(user.uid);
    await refreshSales();
  }

  return { sales, loading, error, addSale, updateSale, deleteSale, clearAllSales, refreshSales };
};
