import React, { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { convertToCSV, downloadCSV } from '../utils/csvUtils';
import ConfirmationDialog from './ConfirmationDialog';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_SECRET_KEY = '12345';

const AdminPanel = () => {
  const [secretKey, setSecretKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { sales, clearAllSales } = useSales();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const openModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretKey === ADMIN_SECRET_KEY) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect secret key.');
    }
  };

  const confirmClearData = async () => {
    await clearAllSales();
    alert('All sales data has been cleared.');
  };
  
  const handleClearDataClick = () => {
    setDialogOpen(true);
  }

  const handleDownloadCSV = () => {
    const csvData = convertToCSV(sales.map(({photo, ...rest}) => rest)); // Exclude photos from CSV
    downloadCSV(csvData, 'shopledger_sales_data.csv');
  };

  const handleExportSummary = () => {
    const summary: { [date: string]: { totalSales: number; itemsSold: number } } = {};
    sales.forEach(sale => {
        const dateKey = new Date(sale.date).toLocaleDateString();
        if (!summary[dateKey]) {
            summary[dateKey] = { totalSales: 0, itemsSold: 0 };
        }
        summary[dateKey].totalSales += sale.total;
        summary[dateKey].itemsSold += sale.quantity;
    });

    const summaryArray = Object.keys(summary).map(date => ({
        date,
        totalSales: summary[date].totalSales,
        itemsSold: summary[date].itemsSold
    }));

    const csvData = convertToCSV(summaryArray as any); // Type assertion for simplicity here
    downloadCSV(csvData, 'shopledger_summary_report.csv');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-surface p-8 rounded-xl shadow-subtle border border-border-color text-center">
            <h1 className="text-2xl font-bold mb-4">Admin Panel Access</h1>
            <p className="text-subtle-text mb-6">Please enter the secret key to access admin features.</p>
            <form onSubmit={handleAuth} className="space-y-4">
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-center"
                  placeholder="•••••"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                  Unlock
                </button>
            </form>
        </div>
      </div>
    );
  }
  
  const salesWithPhotos = sales.filter(s => !!s.photo);

  return (
    <>
      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmClearData}
        title="Clear All Data"
        message="Are you absolutely sure you want to delete ALL sales data? This action is permanent and cannot be undone."
        confirmText="Yes, delete everything"
      />
      <AnimatePresence>
        {isModalOpen && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedPhoto}
              alt="Full size product"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <div className="bg-surface p-8 rounded-xl shadow-subtle border border-border-color space-y-8">
          <div>
            <h2 className="text-xl font-semibold">Data Management</h2>
            <p className="text-subtle-text mb-4">Export your sales data as CSV files.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadCSV}
                className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors"
              >
                Download Full Data
              </button>
              <button
                onClick={handleExportSummary}
                className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
              >
                Export Daily Summary
              </button>
            </div>
          </div>
          
          <div className="border-t border-border-color pt-6">
            <h2 className="text-xl font-semibold">Product Photo Gallery</h2>
            <p className="text-subtle-text mb-4">A gallery of all products with photos. Click a photo to enlarge.</p>
            {salesWithPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {salesWithPhotos.map(sale => (
                  <div key={sale.id} className="group relative border border-border-color rounded-lg overflow-hidden cursor-pointer" onClick={() => sale.photo && openModal(sale.photo)}>
                    <img src={sale.photo} alt={sale.itemName} className="aspect-square w-full object-cover transition-transform group-hover:scale-105"/>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="font-bold truncate">{sale.itemName}</p>
                      <p>{new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-background rounded-lg">
                <p className="text-subtle-text">No sales with photos have been recorded yet.</p>
              </div>
            )}
          </div>

          <div className="border-t border-border-color pt-6">
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
            <p className="text-subtle-text mb-4">This action is irreversible. Please proceed with caution.</p>
            <button
              onClick={handleClearDataClick}
              className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors"
            >
              Clear All Sales Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;