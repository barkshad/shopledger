
import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { Sale } from '../types';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon } from './icons';

interface EditState extends Omit<Sale, 'id' | 'total'> {
    id: number;
}

const SalesHistory = () => {
  const { sales, loading, updateSale, deleteSale } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSale, setEditingSale] = useState<EditState | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(sale =>
      sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.date.split('T')[0].includes(searchTerm)
    );
  }, [sales, searchTerm]);

  const handleEditClick = (sale: Sale) => {
    if (sale.id) {
        setEditingSale({
            id: sale.id,
            itemName: sale.itemName,
            quantity: sale.quantity,
            price: sale.price,
            date: sale.date.split('T')[0],
        });
    }
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
  };

  const handleUpdateSale = async () => {
    if (editingSale) {
      const updatedSale: Sale = {
        id: editingSale.id,
        itemName: editingSale.itemName,
        quantity: Number(editingSale.quantity),
        price: Number(editingSale.price),
        total: Number(editingSale.quantity) * Number(editingSale.price),
        date: new Date(editingSale.date).toISOString(),
      };
      await updateSale(updatedSale);
      setEditingSale(null);
    }
  };
  
  const handleDeleteSale = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this sale record?')) {
        await deleteSale(id);
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(editingSale) {
        setEditingSale({ ...editingSale, [e.target.name]: e.target.value });
    }
  }

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return <div className="text-center p-10">Loading sales history...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sales History</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by item name or date (YYYY-MM-DD)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-surface border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="bg-surface rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                editingSale && editingSale.id === sale.id ? (
                    // Edit mode row
                    <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><input type="text" name="itemName" value={editingSale.itemName} onChange={handleEditChange} className="w-full p-1 border rounded"/></td>
                        <td className="px-6 py-4 whitespace-nowrap"><input type="number" name="quantity" value={editingSale.quantity} onChange={handleEditChange} className="w-20 p-1 border rounded"/></td>
                        <td className="px-6 py-4 whitespace-nowrap"><input type="number" name="price" value={editingSale.price} onChange={handleEditChange} className="w-24 p-1 border rounded"/></td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(editingSale.quantity * editingSale.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><input type="date" name="date" value={editingSale.date} onChange={handleEditChange} className="w-full p-1 border rounded"/></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <button onClick={handleUpdateSale} className="text-green-600 hover:text-green-900"><SaveIcon className="h-5 w-5"/></button>
                                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900"><CancelIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    // View mode row
                    <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.itemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(sale.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(sale.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => handleEditClick(sale)} className="text-primary hover:text-blue-700"><EditIcon className="h-5 w-5"/></button>
                                <button onClick={() => handleDeleteSale(sale.id!)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                )
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="text-center p-10 text-gray-500">
                {sales.length === 0 ? "You haven't recorded any sales yet." : "No sales match your search."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
