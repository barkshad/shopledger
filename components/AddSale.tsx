
import React, { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import { Sale } from '../types';

const AddSale = () => {
  const { addSale } = useSales();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [total, setTotal] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTotal(quantity * price);
  }, [quantity, price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || quantity <= 0 || price <= 0) {
      alert('Please fill in all fields with valid values.');
      return;
    }
    
    setIsSubmitting(true);
    try {
        const saleData = {
            itemName,
            quantity,
            price,
            date: new Date(date).toISOString(),
        };
        await addSale(saleData);

        setSuccessMessage('Sale recorded successfully!');
        setItemName('');
        setQuantity(1);
        setPrice(0);
        setDate(new Date().toISOString().split('T')[0]);
        
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
        console.error("Failed to add sale:", error);
        alert("There was an error saving the sale.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Record a New Sale</h1>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <div className="bg-surface p-8 rounded-xl shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="1"
                  required
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (per item)</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="0"
                  step="0.01"
                  required
                />
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date of Sale</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          <div className="text-right border-t pt-4">
            <p className="text-lg font-semibold text-gray-700">
                Total: <span className="text-primary">{formatCurrency(total)}</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Sale'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSale;
