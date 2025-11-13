import React, { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales';

const AddSale = () => {
  const { addSale } = useSales();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTotal(quantity * price);
  }, [quantity, price]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setPhoto(result); // Store the full data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  }

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
            photo: photo || undefined,
        };
        await addSale(saleData);

        setSuccessMessage(photo ? 'Photo saved with sale successfully!' : 'Sale recorded successfully!');
        setItemName('');
        setQuantity(1);
        setPrice(0);
        removePhoto();
        // Do not reset date, user might want to add multiple sales for the same day
        
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
        console.error("Failed to add sale:", error);
        alert("There was an error saving the sale.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputStyles = "mt-1 block w-full px-3 py-2 bg-surface border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm";
  
  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Record a New Sale</h1>
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}
      <div className="bg-surface p-8 rounded-xl shadow-subtle border border-border-color">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-on-surface">Item Name</label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={inputStyles}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-on-surface">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className={inputStyles}
                  min="1"
                  required
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-on-surface">Price (per item)</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={inputStyles}
                  min="0"
                  step="0.01"
                  required
                />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-on-surface">Product Photo</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border-color px-6 py-10">
                <div className="text-center">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Product Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
                    ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12A2.25 2.25 0 0120.25 20.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-blue-500">
                            <span>{photoPreview ? 'Change photo' : 'Take or upload photo'}</span>
                            {/* FIX: Removed invalid 'capture' attribute value. The browser will prompt for camera on mobile devices with just `accept="image/*"`. */}
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange}/>
                        </label>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF</p>
                    {photoPreview && <button type="button" onClick={removePhoto} className="mt-2 text-xs text-red-500 hover:underline">Remove photo</button>}
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-on-surface">Date of Sale</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputStyles}
              required
            />
          </div>
          <div className="text-right border-t border-border-color pt-6">
            <p className="text-lg font-semibold text-on-surface">
                Total: <span className="text-primary font-bold">{formatCurrency(total)}</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            {isSubmitting ? 'Saving...' : 'Save Sale'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSale;
