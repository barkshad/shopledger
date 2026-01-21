
import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { compressImage } from '../utils/imageUtils';
import { uploadToCloudinary } from '../services/cloudinary';
import { CreditCardIcon, TrashIcon, SaveIcon } from './icons';

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0 || !category) {
      addToast('Please provide a valid name and amount.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
        let cloudinaryUrl: string | undefined;
        let cloudinaryId: string | undefined;

        if (photoFile && settings.isPhotoSavingEnabled) {
            addToast("Uploading receipt...", "info");
            const compressed = await compressImage(photoFile);
            const res = await fetch(compressed);
            const blob = await res.blob();
            const uploadRes = await uploadToCloudinary(blob);
            cloudinaryUrl = uploadRes.secure_url;
            cloudinaryId = uploadRes.public_id;
        }

        // Clean payload - Firestore does not allow 'undefined' fields
        const expensePayload: any = {
            name: name.trim(),
            category,
            amount,
            date: new Date(date).toISOString(),
        };

        if (note.trim()) expensePayload.note = note.trim();
        if (cloudinaryUrl) expensePayload.receiptPhoto = cloudinaryUrl;
        if (cloudinaryId) expensePayload.cloudinaryId = cloudinaryId;

        await addExpense(expensePayload);

        addToast('Expense recorded successfully.', 'success');
        
        // Reset state
        setName('');
        setCategory(EXPENSE_CATEGORIES[0]);
        setAmount(0);
        setNote('');
        removePhoto();
    } catch (error: any) {
        console.error("Expense Saving Error:", error);
        addToast(error.message || "Failed to save expense.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputStyles = "mt-1 block w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-border-color dark:border-dark-border-color rounded-xl focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm outline-none placeholder:text-zinc-400";
  const formatCurrency = (value: number) => `${settings.currency} ${value.toLocaleString()}`;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <h1 className="text-3xl font-bold">Record Expense</h1>
      <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label htmlFor="expenseName" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Expense Name</label>
              <input type="text" id="expenseName" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="e.g. Electricity Bill, Shop Rent" required />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputStyles}>
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Amount</label>
                  <input type="number" id="amount" value={amount || ''} onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))} className={inputStyles} placeholder="0.00" min="0.01" step="0.01" required />
              </div>
              <div>
                <label htmlFor="date" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Date</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyles} required />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Notes (Optional)</label>
              <textarea id="notes" value={note} onChange={e => setNote(e.target.value)} rows={2} className={inputStyles} placeholder="Additional details..."></textarea>
            </div>
          </div>
          
          {settings.isPhotoSavingEnabled && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-2">Receipt Document</label>
              <div className="flex items-center gap-4">
                  {photoPreview ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border-color">
                        <img src={photoPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={removePhoto} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><TrashIcon className="h-3 w-3"/></button>
                      </div>
                  ) : (
                      <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border-color flex flex-col items-center justify-center text-zinc-400 cursor-pointer hover:border-black transition-colors">
                          <CreditCardIcon className="h-8 w-8" />
                          <span className="text-[10px] font-bold mt-1 uppercase">Scan</span>
                          <input type="file" className="sr-only" accept="image/*" capture="environment" onChange={handlePhotoChange}/>
                      </label>
                  )}
                  <p className="text-xs text-zinc-500 leading-relaxed">Securely upload a photo of the receipt to the cloud for financial records.</p>
              </div>
            </div>
          )}

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl flex justify-between items-center border border-border-color dark:border-dark-border-color">
            <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Total Outflow</span>
            <span className="text-2xl font-bold text-red-500">{formatCurrency(amount)}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-xl font-bold text-sm shadow-premium active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-zinc-400 border-t-white dark:border-zinc-900 rounded-full animate-spin" />
            ) : (
              <>
                <SaveIcon className="h-5 w-5" /> Save Expense Record
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
