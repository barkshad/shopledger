
import React, { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { SaveIcon, PackageIcon, CreditCardIcon, DollarSignIcon, ListIcon, CalendarIcon } from './icons';

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Paybill', 'Bank Transfer', 'Other'];

const AddSale = () => {
  const { addSale } = useSales();
  const { addToast } = useToast();
  const { settings } = useAdminSettings();

  const [itemName, setItemName] = useState('');
  // Changed quantity and price to strings to allow typing decimals (e.g., "10." or "0.5") without React resetting the input
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericPrice = parseFloat(price);
    const numericQuantity = parseFloat(quantity);
    
    if (!itemName.trim() || isNaN(numericQuantity) || numericQuantity <= 0 || isNaN(numericPrice) || numericPrice < 0) {
      addToast('Please fill in valid details.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a date object from the input value, defaulting to current time for sorting accuracy if today
      const now = new Date();
      
      let finalDate = new Date(date).toISOString();
      if (date === now.toISOString().split('T')[0]) {
          finalDate = now.toISOString();
      }

      // The useSales hook handles the total calculation and ID generation
      await addSale({
        itemName: itemName.trim(),
        quantity: numericQuantity,
        price: numericPrice,
        paymentMethod,
        date: finalDate,
        // Optional fields can be left undefined or defaults
      });
      
      addToast('Sale recorded successfully!', 'success');
      
      // Reset form
      setItemName('');
      setQuantity('1');
      setPrice('');
      setPaymentMethod('Cash');
    } catch (error) {
      console.error(error);
      addToast('Failed to record sale.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTotal = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Record New Sale</h1>
      
      <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color">
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
                <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Item Name</label>
                <div className="relative">
                    <PackageIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                    <input 
                        type="text" 
                        value={itemName} 
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-on-surface dark:text-dark-on-surface placeholder-subtle-text"
                        placeholder="e.g. Milk, Bread, Service"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Quantity</label>
                    <div className="relative">
                        <ListIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                        <input 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-on-surface dark:text-dark-on-surface"
                            placeholder="1"
                            min="0.1"
                            step="any"
                            required
                        />
                    </div>
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Unit Price</label>
                    <div className="relative">
                        <DollarSignIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                        <input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-on-surface dark:text-dark-on-surface"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Date Selection */}
            <div>
                <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Date</label>
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-on-surface dark:text-dark-on-surface"
                        required
                    />
                </div>
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map(method => (
                        <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                paymentMethod === method 
                                    ? 'bg-primary text-on-primary border-primary shadow-md' 
                                    : 'bg-background dark:bg-dark-background border-border-color dark:border-dark-border-color text-subtle-text dark:text-dark-subtle-text hover:border-primary'
                            }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total Display */}
            <div className="bg-background/50 dark:bg-dark-background/50 p-4 rounded-xl flex justify-between items-center border border-border-color dark:border-dark-border-color">
                <span className="text-subtle-text dark:text-dark-subtle-text font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-primary">{settings.currency} {currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <SaveIcon className="h-6 w-6" /> Record Sale
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddSale;
