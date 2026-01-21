
import React, { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useToast } from '../hooks/useToast';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { uploadToCloudinary } from '../services/cloudinary';
import { compressImage } from '../utils/imageUtils';
import { SaveIcon, PackageIcon, DollarSignIcon, ListIcon, CalendarIcon, CameraIcon, TrashIcon } from './icons';

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Paybill', 'Bank Transfer', 'Other'];

const AddSale = () => {
  const { addSale } = useSales();
  const { addToast } = useToast();
  const { settings } = useAdminSettings();

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
      let cloudinaryUrl: string | undefined;
      let cloudinaryId: string | undefined;

      if (photoFile) {
          addToast("Uploading image...", "info");
          const compressed = await compressImage(photoFile);
          const res = await fetch(compressed);
          const blob = await res.blob();
          const uploadRes = await uploadToCloudinary(blob);
          cloudinaryUrl = uploadRes.secure_url;
          cloudinaryId = uploadRes.public_id;
      }

      const now = new Date();
      let finalDate = new Date(date).toISOString();
      if (date === now.toISOString().split('T')[0]) {
          finalDate = now.toISOString();
      }

      // Build clean object - Firestore fails if fields are 'undefined'
      const salePayload: any = {
        itemName: itemName.trim(),
        quantity: numericQuantity,
        price: numericPrice,
        paymentMethod,
        date: finalDate,
      };

      if (cloudinaryUrl) salePayload.photo = cloudinaryUrl;
      if (cloudinaryId) salePayload.cloudinaryId = cloudinaryId;

      await addSale(salePayload);
      
      addToast('Sale recorded successfully!', 'success');
      
      // Reset form
      setItemName('');
      setQuantity('1');
      setPrice('');
      setPaymentMethod('Cash');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error: any) {
      console.error("Sale Recording Error:", error);
      addToast(error.message || 'Failed to record sale.', 'error');
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
            <div>
                <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Item Name</label>
                <div className="relative">
                    <PackageIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                    <input 
                        type="text" 
                        value={itemName} 
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-on-surface dark:text-dark-on-surface placeholder-subtle-text"
                        placeholder="e.g. Milk, Bread, Service"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Quantity</label>
                    <div className="relative">
                        <ListIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                        <input 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-on-surface dark:text-dark-on-surface"
                            placeholder="1"
                            min="0.1"
                            step="any"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Unit Price</label>
                    <div className="relative">
                        <DollarSignIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                        <input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-on-surface dark:text-dark-on-surface"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Date</label>
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-subtle-text" />
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-border-color dark:border-dark-border-color rounded-xl focus:ring-2 focus:ring-black focus:outline-none text-on-surface dark:text-dark-on-surface"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-subtle-text dark:text-dark-subtle-text">Product Photo (Optional)</label>
                <div className="flex items-center gap-4">
                    {photoPreview ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border-color">
                            <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                            <button type="button" onClick={() => {setPhotoFile(null); setPhotoPreview(null);}} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><TrashIcon className="h-3 w-3"/></button>
                        </div>
                    ) : (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border-color flex flex-col items-center justify-center text-subtle-text cursor-pointer hover:border-black transition-colors">
                            <CameraIcon className="h-6 w-6" />
                            <span className="text-[10px] mt-1">Capture</span>
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                        </label>
                    )}
                    <p className="text-xs text-subtle-text">Add a photo of the item or receipt to store in the cloud.</p>
                </div>
            </div>

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
                                    ? 'bg-black text-white border-black shadow-md' 
                                    : 'bg-background dark:bg-dark-background border-border-color dark:border-dark-border-color text-subtle-text dark:text-dark-subtle-text hover:border-black'
                            }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl flex justify-between items-center border border-border-color dark:border-dark-border-color">
                <span className="text-subtle-text dark:text-dark-subtle-text font-medium text-xs uppercase tracking-wider">Total Amount</span>
                <span className="text-2xl font-bold text-on-surface dark:text-white">{settings.currency} {currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white dark:bg-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-zinc-400 border-t-white dark:border-zinc-900 rounded-full animate-spin" />
                ) : (
                    <>
                        <SaveIcon className="h-6 w-6" /> Save Transaction
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddSale;
