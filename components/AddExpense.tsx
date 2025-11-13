import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { compressImage } from '../utils/imageUtils';
import { CreditCardIcon } from './icons';

const EXPENSE_CATEGORIES = ["Stock Purchase", "Transport", "Utilities", "Rent", "Salaries", "Miscellaneous"];

const AddExpense = () => {
  const { addExpense } = useExpenses();
  const { addToast } = useToast();
  const { settings } = useAdminSettings();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setPhotoPreview(compressedBase64);
        setReceiptPhoto(compressedBase64);
      } catch (error) {
        console.error("Failed to compress image:", error);
        addToast("Could not process image.", "error");
      }
    }
  };

  const removePhoto = () => {
    setReceiptPhoto(null);
    setPhotoPreview(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0 || !category) {
      addToast('Please fill in all required fields with valid values.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
        const expenseData = {
            name,
            category,
            amount,
            date: new Date(date).toISOString(),
            note,
            receiptPhoto: (settings.isPhotoSavingEnabled && receiptPhoto) ? receiptPhoto : undefined,
        };
        await addExpense(expenseData);

        addToast('Expense recorded successfully!', 'success');
        setName('');
        setCategory(EXPENSE_CATEGORIES[0]);
        setAmount(0);
        setNote('');
        removePhoto();
    } catch (error) {
        console.error("Failed to add expense:", error);
        addToast("There was an error saving the expense.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputStyles = "mt-1 block w-full px-3 py-2 bg-surface border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm";
  const formatCurrency = (value: number) => `${settings.currency} ${value.toLocaleString()}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Record a New Expense</h1>
      <div className="bg-surface p-8 rounded-xl shadow-subtle border border-border-color">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="expenseName" className="block text-sm font-medium text-on-surface">Expense Name</label>
              <input type="text" id="expenseName" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} required />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-on-surface">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputStyles}>
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-on-surface">Amount</label>
                <input type="number" id="amount" value={amount} onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))} className={inputStyles} min="0.01" step="0.01" required />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-on-surface">Date of Expense</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyles} required />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-on-surface">Notes (Optional)</label>
            <textarea id="notes" value={note} onChange={e => setNote(e.target.value)} rows={3} className={inputStyles}></textarea>
          </div>
          
          {settings.isPhotoSavingEnabled && (
            <div>
              <label className="block text-sm font-medium text-on-surface">Receipt Photo</label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border-color px-6 py-10">
                  <div className="text-center">
                      {photoPreview ? (
                          <img src={photoPreview} alt="Receipt Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
                      ) : (
                          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-300" />
                      )}
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-blue-500">
                              <span>{photoPreview ? 'Change photo' : 'Take or upload photo'}</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange}/>
                          </label>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG, JPG, up to 10MB</p>
                      {photoPreview && <button type="button" onClick={removePhoto} className="mt-2 text-xs text-red-500 hover:underline">Remove photo</button>}
                  </div>
              </div>
            </div>
          )}

          <div className="text-right border-t border-border-color pt-6">
            <p className="text-lg font-semibold text-on-surface">
                Total Expense: <span className="text-red-500 font-bold">{formatCurrency(amount)}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
