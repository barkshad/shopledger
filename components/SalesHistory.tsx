
import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { Sale } from '../types';
import { EditIcon, TrashIcon, SaveIcon, CancelIcon, DownloadIcon, SortAscIcon, SortDescIcon, PackageIcon, ChevronLeftIcon, ChevronRightIcon, WalletIcon } from './icons';
import Spinner from './Spinner';
import ConfirmationDialog from './ConfirmationDialog';
import { convertToCSV, downloadCSV } from '../utils/csvUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface EditState extends Omit<Sale, 'id' | 'total'> {
    id: number;
    photo?: string;
}

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Paybill', 'Bank Transfer', 'Other'];

const SummaryStatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-surface rounded-xl shadow-subtle p-4 border border-border-color">
    <h3 className="text-sm font-medium text-subtle-text truncate">{title}</h3>
    <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
  </div>
);

type SortableKey = 'itemName' | 'total' | 'date' | 'paymentMethod';

const getPaymentBadgeColor = (method: string | undefined) => {
    switch (method) {
        case 'Cash': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'Mobile Money': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'Paybill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Bank Transfer': return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
        default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
};

const SalesHistory = () => {
  const { sales, loading, updateSale, deleteSale } = useSales();
  
  const [editingSale, setEditingSale] = useState<EditState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWithPhotosOnly, setShowWithPhotosOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const openPhotoModal = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start) start.setUTCHours(0, 0, 0, 0);
        if (end) end.setUTCHours(23, 59, 59, 999);

        const matchesSearch = sale.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);
        const matchesPhotoFilter = !showWithPhotosOnly || (showWithPhotosOnly && !!sale.photo);
        const matchesPayment = paymentFilter === 'All' || sale.paymentMethod === paymentFilter;
        
        return matchesSearch && matchesDate && matchesPhotoFilter && matchesPayment;
    });

    if (sortConfig.key) {
        filtered.sort((a, b) => {
            let aValue: string | number = a[sortConfig.key];
            let bValue: string | number = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                aValue = new Date(a.date).getTime();
                bValue = new Date(b.date).getTime();
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
  }, [sales, searchTerm, startDate, endDate, sortConfig, showWithPhotosOnly, paymentFilter]);

  const summaryStats = useMemo(() => {
    const totalSalesCount = filteredAndSortedSales.length;
    if (totalSalesCount === 0) return { totalSales: 0, totalRevenue: 0, avgSale: 0, mostSoldItem: 'N/A' };
    
    const totalRevenue = filteredAndSortedSales.reduce((sum, s) => sum + s.total, 0);
    const avgSale = totalRevenue / totalSalesCount;

    const itemCounts = filteredAndSortedSales.reduce((acc: Record<string, number>, s) => {
        acc[s.itemName] = (acc[s.itemName] || 0) + s.quantity;
        return acc;
    }, {} as Record<string, number>);

    const mostSoldItem = Object.keys(itemCounts).length > 0
        ? Object.entries(itemCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]
        : 'N/A';
    
    return { totalSales: totalSalesCount, totalRevenue, avgSale, mostSoldItem };
  }, [filteredAndSortedSales]);
  
  const chartData = useMemo(() => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
      }).reverse();

      const salesByDay = sales.reduce((acc, sale) => {
          const dayKey = new Date(sale.date).toISOString().split('T')[0];
          if (last7Days.includes(dayKey)) {
              acc[dayKey] = (acc[dayKey] || 0) + sale.total;
          }
          return acc;
      }, {} as Record<string, number>);

      return last7Days.map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          sales: salesByDay[date] || 0,
      }));
  }, [sales]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedSales, currentPage]);
  
  const handleSort = (key: SortableKey) => {
    setCurrentPage(1);
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };
  
  const handleEditClick = (sale: Sale) => {
    if (sale.id !== undefined) {
      const { total, ...saleData } = sale;
      setEditingSale({
        ...saleData,
        id: sale.id,
        paymentMethod: sale.paymentMethod || 'Cash', // Fallback for old records
        date: sale.date.split('T')[0],
      });
    }
  };
  const handleCancelEdit = () => setEditingSale(null);
  
  const handleUpdateSale = async () => {
    if (!editingSale) return;
    const { id, itemName, quantity, price, date, photo, notes, paymentMethod } = editingSale;
    await updateSale({
      id,
      itemName,
      quantity: +quantity,
      price: +price,
      total: +quantity * +price,
      paymentMethod,
      date: new Date(date).toISOString(),
      photo: photo,
      notes: notes,
    });
    setEditingSale(null);
  };
  
  const handleDeleteClick = (id: number) => {
    setSaleToDelete(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (saleToDelete !== null) {
      await deleteSale(saleToDelete);
      setSaleToDelete(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingSale) setEditingSale({ ...editingSale, [e.target.name]: e.target.value });
  };
  
  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingSale) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingSale({ ...editingSale, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditPhoto = () => {
    if (editingSale) {
      setEditingSale({ ...editingSale, photo: undefined });
    }
  };

  const handleDownloadReport = () => {
    setIsExporting(true);
    const csvData = convertToCSV(filteredAndSortedSales.map(({photo, ...rest}) => rest));
    downloadCSV(csvData, `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const SortableHeader: React.FC<{ columnKey: SortableKey, title: string }> = ({ columnKey, title }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider cursor-pointer" onClick={() => handleSort(columnKey)}>
        <div className="flex items-center gap-2">
            {title}
            {sortConfig.key === columnKey && (
                sortConfig.direction === 'ascending' ? <SortAscIcon className="h-4 w-4" /> : <SortDescIcon className="h-4 w-4" />
            )}
        </div>
    </th>
  );

  if (loading) return <Spinner />;

  return (
    <>
    <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale record? This action cannot be undone."
        confirmText="Delete"
    />
    <AnimatePresence>
      {isPhotoModalOpen && selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={closePhotoModal}
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Sales History & Analysis</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryStatCard title="Total Sales" value={summaryStats.totalSales.toLocaleString()} />
          <SummaryStatCard title="Total Revenue" value={formatCurrency(summaryStats.totalRevenue)} />
          <SummaryStatCard title="Average Sale Value" value={formatCurrency(summaryStats.avgSale)} />
          <SummaryStatCard title="Most Sold Item" value={summaryStats.mostSoldItem} />
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-subtle border border-border-color flex flex-col md:flex-row gap-4 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-auto md:flex-1 px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select 
            value={paymentFilter} 
            onChange={e => {setPaymentFilter(e.target.value); setCurrentPage(1)}} 
            className="w-full md:w-auto px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="All">All Methods</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="flex items-center gap-2 w-full md:w-auto">
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"/>
              <span className="text-subtle-text">-</span>
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
          <div className="flex items-center">
              <input id="photo-filter" type="checkbox" checked={showWithPhotosOnly} onChange={(e) => { setShowWithPhotosOnly(e.target.checked); setCurrentPage(1); }} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
              <label htmlFor="photo-filter" className="ml-2 block text-sm text-on-surface">Photos only</label>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="w-full md:w-auto bg-primary text-on-primary font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
              {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <DownloadIcon className="h-5 w-5" />}
              {isExporting ? 'Exporting...' : 'Export'}
          </button>
      </div>

      <div className="bg-surface rounded-xl shadow-subtle border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-background/80">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Photo</th>
                <SortableHeader columnKey="itemName" title="Item"/>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Qty</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Price</th>
                <SortableHeader columnKey="total" title="Total"/>
                <SortableHeader columnKey="paymentMethod" title="Payment"/>
                <SortableHeader columnKey="date" title="Date"/>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-subtle-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border-color">
              {paginatedSales.map((sale) => (
                editingSale?.id === sale.id ? (
                    <tr key={sale.id} className="bg-primary/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                {editingSale.photo ? <img src={editingSale.photo} alt="preview" className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 rounded-md bg-background flex items-center justify-center"><PackageIcon className="h-6 w-6 text-subtle-text"/></div>}
                                <div>
                                    <input type="file" id={`edit-photo-${sale.id}`} className="hidden" onChange={handleEditPhotoChange} accept="image/*" />
                                    <label htmlFor={`edit-photo-${sale.id}`} className="text-xs text-primary hover:underline cursor-pointer">Change</label>
                                    {editingSale.photo && <button onClick={removeEditPhoto} className="text-xs text-red-500 hover:underline ml-2">Remove</button>}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4"><input type="text" name="itemName" value={editingSale.itemName} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4"><input type="number" name="quantity" value={editingSale.quantity} onChange={handleEditChange} className="w-20 p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4"><input type="number" name="price" value={editingSale.price} onChange={handleEditChange} className="w-24 p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4 font-medium">{formatCurrency(editingSale.quantity * editingSale.price)}</td>
                        <td className="px-6 py-4">
                            <select name="paymentMethod" value={editingSale.paymentMethod} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50 text-sm">
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                {/* Ensure user's custom method is preserved if not in list, though dropdown makes this tricky. For simplicity, custom text edit is not fully supported in quick edit row, defaults to Other if unknown */}
                            </select>
                        </td>
                        <td className="px-6 py-4"><input type="date" name="date" value={editingSale.date} onChange={handleEditChange} className="w-full p-1 border rounded bg-surface border-primary/50"/></td>
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <button onClick={handleUpdateSale} className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100"><SaveIcon className="h-5 w-5"/></button>
                                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200"><CancelIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    <tr key={sale.id} className="even:bg-background/50 hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            {sale.photo ? <img src={sale.photo} alt={sale.itemName} className="h-10 w-10 rounded-md object-cover cursor-pointer hover:scale-110 transition-transform" onClick={() => sale.photo && openPhotoModal(sale.photo)} /> : <div className="h-10 w-10 rounded-md bg-background flex items-center justify-center"><PackageIcon className="h-6 w-6 text-subtle-text"/></div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface">{sale.itemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{sale.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{formatCurrency(sale.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text font-semibold">{formatCurrency(sale.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadgeColor(sale.paymentMethod || 'Cash')}`}>
                                {sale.paymentMethod || 'Cash'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-text">{formatDate(sale.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleEditClick(sale)} className="text-primary hover:text-blue-700 p-2 rounded-full hover:bg-primary/10"><EditIcon className="h-5 w-5"/></button>
                                <button onClick={() => sale.id && handleDeleteClick(sale.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        </td>
                    </tr>
                )
              ))}
            </tbody>
          </table>
          {filteredAndSortedSales.length === 0 && (
            <div className="text-center p-10 text-subtle-text">
                {sales.length === 0 ? "You haven't recorded any sales yet." : "No sales match the current filters."}
            </div>
          )}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-lg text-sm font-semibold hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeftIcon className="h-4 w-4"/> Previous
          </button>
          <span className="text-sm text-subtle-text">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-lg text-sm font-semibold hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed">
            Next <ChevronRightIcon className="h-4 w-4"/>
          </button>
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-subtle p-6 border border-border-color mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Sales Activity (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `KSh ${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  cursor={{ stroke: '#3B82F6', strokeDasharray: '3 3' }}/>
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} dot={{r: 4}} activeDot={{r: 8}}/>
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    </>
  );
};

export default SalesHistory;