
import { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types';
import * as db from '../services/db';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSales = useCallback(async () => {
    try {
      setLoading(true);
      const allSales = await db.getAllSales();
      setSales(allSales);
      setError(null);
    } catch (e) {
      setError('Failed to fetch sales data.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSales();
  }, [refreshSales]);

  const addSale = async (sale: Omit<Sale, 'id' | 'total'> & { price: number; quantity: number }) => {
    const newSale: Omit<Sale, 'id'> = {
        ...sale,
        total: sale.price * sale.quantity,
    };
    await db.addSale(newSale);
    await refreshSales();
  };

  const updateSale = async (sale: Sale) => {
    await db.updateSale(sale);
    await refreshSales();
  };

  const deleteSale = async (id: string) => {
    await db.deleteSale(id);
    await refreshSales();
  };
  
  const clearAllSales = async () => {
    await db.clearSales();
    await refreshSales();
  }

  return { sales, loading, error, addSale, updateSale, deleteSale, clearAllSales, refreshSales };
};
